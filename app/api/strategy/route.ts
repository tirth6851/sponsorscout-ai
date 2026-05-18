import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { scoreOpportunity, DbProfile, DbOpportunity } from '@/lib/matching';
import { generateDeterministicStrategy } from '@/lib/strategy';
import { mockOpportunities, mockProfile } from '@/lib/mock-data';
import { GROQ_CONFIGURED } from '@/lib/env';
import { getGroqClient, GROQ_MODEL } from '@/lib/groq';
import type { StrategyOutput } from '@/lib/types';

export async function GET() {
  const supabase = createClient();

  // ── Demo mode ──────────────────────────────────────────────────────────────
  if (!supabase) {
    const profile: DbProfile = {
      current_visa: mockProfile.currentVisa,
      stem_eligible: mockProfile.stemEligible,
      needs_sponsorship: mockProfile.sponsorshipNeeded ? 'yes' : 'no',
      skills: mockProfile.skills,
      preferred_locations: mockProfile.preferredLocations,
      remote_preference: mockProfile.remotePreference,
      experience_level: mockProfile.experienceLevel,
      target_industries: mockProfile.targetIndustries,
      graduation_date: mockProfile.graduationDate,
    };

    const scoredOpps = mockOpportunities.map((opp) => {
      const oppRow: DbOpportunity = {
        id: opp.id,
        title: opp.title,
        company: opp.company,
        location: opp.location,
        remote: opp.remote,
        h1b_sponsor: opp.h1bSponsor,
        sponsorship_status: opp.sponsorshipStatus,
        cpt_compatible: opp.cptCompatible,
        opt_compatible: opp.optCompatible,
        skills: opp.skills,
        industry: opp.industry,
        experience_required: opp.experienceRequired,
      };
      return { ...opp, ...scoreOpportunity(profile, oppRow), sponsorship_status: opp.sponsorshipStatus };
    });

    if (GROQ_CONFIGURED) {
      try {
        const strategy = await generateGroqStrategy(profile, scoredOpps);
        return NextResponse.json({ strategy, profile: mockProfile, generatedBy: 'groq', demo: true });
      } catch (err) {
        console.error('[strategy/demo] Groq failed, falling back:', err);
      }
    }

    const strategy = generateDeterministicStrategy(
      { ...profile, full_name: mockProfile.name } as Parameters<typeof generateDeterministicStrategy>[0],
      scoredOpps
    );
    return NextResponse.json({ strategy, profile: mockProfile, generatedBy: 'deterministic', demo: true });
  }

  // ── Production mode ────────────────────────────────────────────────────────
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profileRow } = await supabase
    .from('student_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!profileRow) {
    return NextResponse.json({ error: 'Profile not found', profileMissing: true }, { status: 404 });
  }

  const { data: opps } = await supabase.from('opportunities').select('*').eq('status', 'active');

  const scored = (opps ?? []).map((opp) => ({
    ...opp,
    ...scoreOpportunity(profileRow as DbProfile, opp as DbOpportunity),
  }));
  scored.sort((a, b) => b.match_score - a.match_score);

  if (GROQ_CONFIGURED) {
    try {
      const strategy = await generateGroqStrategy(profileRow as DbProfile, scored);
      return NextResponse.json({ strategy, profile: profileRow, generatedBy: 'groq' });
    } catch (err) {
      console.error('[strategy] Groq failed, falling back to deterministic:', err);
    }
  }

  const strategy = generateDeterministicStrategy(profileRow as DbProfile, scored);
  return NextResponse.json({ strategy, profile: profileRow, generatedBy: 'deterministic' });
}

// ── Groq strategy (server-only) ────────────────────────────────────────────
interface OppForStrategy {
  title: string;
  company: string;
  match_score: number;
  fit_tier: string;
  sponsorship_status: string;
  match_reasons: string[];
  warning_flags: string[];
}

async function generateGroqStrategy(
  profile: DbProfile,
  scoredOpps: OppForStrategy[]
): Promise<StrategyOutput> {
  const groq = getGroqClient();

  const topOpps = scoredOpps.slice(0, 8).map((o) => ({
    title: o.title,
    company: o.company,
    score: o.match_score,
    tier: o.fit_tier,
    sponsorship: o.sponsorship_status ?? '',
    reasons: o.match_reasons ?? [],
    warnings: o.warning_flags ?? [],
  }));

  const prompt = `You are an expert immigration and career counselor for international students in the US.

## Student Profile
- Visa: ${profile.current_visa}
- STEM OPT eligible: ${profile.stem_eligible}
- Needs sponsorship: ${profile.needs_sponsorship}
- Experience level: ${profile.experience_level}
- Skills: ${(profile.skills ?? []).join(', ')}
- Target industries: ${(profile.target_industries ?? []).join(', ')}
- Preferred locations: ${(profile.preferred_locations ?? []).join(', ')}
- Remote preference: ${profile.remote_preference}
- Graduation date: ${profile.graduation_date}

## Top Matched Opportunities
${JSON.stringify(topOpps, null, 2)}

Generate a personalised visa-aware job search strategy as a JSON object with EXACTLY this structure:
{
  "overallReadiness": <integer 0-100>,
  "summary": "<2-3 sentence personalised career readiness summary referencing their visa type and top opportunities>",
  "insights": [
    { "type": "success", "title": "<short title>", "body": "<1-2 sentence insight>" }
  ],
  "timelineWarnings": ["<specific date-driven warning string>"],
  "skillGaps": [
    { "skill": "<skill name>", "importance": "Critical", "suggestion": "<actionable suggestion>" }
  ],
  "actionPlan": {
    "thisWeek": [{ "label": "<short action>", "description": "<detail>", "done": false }],
    "thisMonth": [{ "label": "<short action>", "description": "<detail>", "done": false }],
    "threeMonths": [{ "label": "<short action>", "description": "<detail>", "done": false }]
  }
}

Rules:
- Include 3-4 insights (mix of success/warning/info), 1-3 timelineWarnings, 2-4 skillGaps, 2-3 items per timeframe
- Make everything specific to this student's visa, graduation date, and matched companies
- overallReadiness reflects visa situation + skill match scores
- Return ONLY valid JSON, no markdown fences, no explanation`;

  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.4,
    max_tokens: 2048,
    response_format: { type: 'json_object' },
  });

  const text = completion.choices[0]?.message?.content ?? '';
  const parsed = JSON.parse(text) as StrategyOutput;

  if (
    typeof parsed.overallReadiness !== 'number' ||
    !parsed.summary ||
    !Array.isArray(parsed.insights) ||
    !parsed.actionPlan
  ) {
    throw new Error('Groq returned incomplete strategy structure');
  }

  return parsed;
}

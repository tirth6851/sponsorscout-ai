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
      engineering_discipline: mockProfile.engineeringDiscipline,
      role_family_preferences: mockProfile.roleFamilyPreferences,
      tools: mockProfile.tools,
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
        engineering_discipline: opp.engineeringDiscipline,
        role_family: opp.roleFamily,
      };
      return {
        ...opp,
        ...scoreOpportunity(profile, oppRow),
        sponsorship_status: opp.sponsorshipStatus,
      };
    });

    if (GROQ_CONFIGURED) {
      try {
        const strategy = await generateGroqStrategy(profile, scoredOpps);
        return NextResponse.json({
          strategy,
          profile: mockProfile,
          generatedBy: 'groq',
          demo: true,
        });
      } catch (err) {
        console.error('[strategy/demo] Groq failed, falling back:', err);
      }
    }

    const strategy = generateDeterministicStrategy(
      { ...profile, full_name: mockProfile.name } as Parameters<
        typeof generateDeterministicStrategy
      >[0],
      scoredOpps,
    );
    return NextResponse.json({
      strategy,
      profile: mockProfile,
      generatedBy: 'deterministic',
      demo: true,
    });
  }

  // ── Production mode ────────────────────────────────────────────────────────
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profileRow } = await supabase
    .from('student_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!profileRow) {
    return NextResponse.json(
      { error: 'Profile not found', profileMissing: true },
      { status: 404 },
    );
  }

  // Prefer normalized jobs, fall back to seeded opportunities
  const { data: normalizedJobs } = await supabase
    .from('normalized_jobs')
    .select('*')
    .eq('status', 'active')
    .limit(50);

  let rawOpps: DbOpportunity[] = [];
  if (normalizedJobs && normalizedJobs.length > 0) {
    rawOpps = normalizedJobs.map((nj) => ({
      id: nj.id,
      title: nj.title,
      company: nj.company,
      location: nj.location,
      remote: nj.remote ?? false,
      h1b_sponsor: nj.sponsorship_signal === 'Better',
      sponsorship_status:
        nj.sponsorship_signal === 'Better'
          ? 'Occasional'
          : nj.sponsorship_signal === 'Risky'
          ? 'Rare'
          : 'Unknown',
      cpt_compatible: nj.cpt_compatible_signal === 'Likely',
      opt_compatible: nj.opt_compatible_signal === 'Likely',
      skills: nj.skills ?? [],
      industry: nj.engineering_discipline ?? null,
      experience_required:
        nj.role_family === 'internship' ? 'Internship' : 'Entry Level',
      engineering_discipline: nj.engineering_discipline,
      role_family: nj.role_family,
      sponsorship_signal: nj.sponsorship_signal,
    }));
  } else {
    const { data: opps } = await supabase
      .from('opportunities')
      .select('*')
      .eq('status', 'active');
    rawOpps = (opps ?? []) as unknown as DbOpportunity[];
  }

  const scored = rawOpps.map((opp) => ({
    ...opp,
    ...scoreOpportunity(profileRow as DbProfile, opp),
  }));
  scored.sort((a, b) => b.match_score - a.match_score);

  if (GROQ_CONFIGURED) {
    try {
      const strategy = await generateGroqStrategy(
        profileRow as DbProfile,
        scored,
      );
      return NextResponse.json({
        strategy,
        profile: profileRow,
        generatedBy: 'groq',
      });
    } catch (err) {
      console.error('[strategy] Groq failed, falling back to deterministic:', err);
    }
  }

  const strategy = generateDeterministicStrategy(
    profileRow as DbProfile,
    scored,
  );
  return NextResponse.json({
    strategy,
    profile: profileRow,
    generatedBy: 'deterministic',
  });
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
  engineering_discipline?: string | null;
  role_family?: string | null;
}

async function generateGroqStrategy(
  profile: DbProfile,
  scoredOpps: OppForStrategy[],
): Promise<StrategyOutput> {
  const groq = getGroqClient();

  const topOpps = scoredOpps.slice(0, 8).map((o) => ({
    title: o.title,
    company: o.company,
    score: o.match_score,
    tier: o.fit_tier,
    sponsorship: o.sponsorship_status ?? '',
    discipline: o.engineering_discipline ?? 'Unknown',
    roleFamily: o.role_family ?? 'Unknown',
    reasons: o.match_reasons ?? [],
    warnings: o.warning_flags ?? [],
  }));

  const prompt = `You are an expert immigration and career counselor for international engineering students in the US.
IMPORTANT: You must NOT invent or guess sponsorship facts. Only refer to signals already present in the data.
IMPORTANT: Do not rank jobs — only explain the pre-ranked results provided to you.

## Student Profile
- Visa: ${profile.current_visa}
- STEM OPT eligible: ${profile.stem_eligible}
- Needs sponsorship: ${profile.needs_sponsorship}
- Experience level: ${profile.experience_level}
- Engineering discipline: ${profile.engineering_discipline ?? 'Not specified'}
- Role family preferences: ${(profile.role_family_preferences ?? []).join(', ') || 'Not specified'}
- Skills: ${(profile.skills ?? []).join(', ')}
- Tools: ${(profile.tools ?? []).join(', ')}
- Target industries: ${(profile.target_industries ?? []).join(', ')}
- Preferred locations: ${(profile.preferred_locations ?? []).join(', ')}
- Graduation date: ${profile.graduation_date}

## Pre-Ranked Engineering Opportunities (ranked by match score — do not reorder)
${JSON.stringify(topOpps, null, 2)}

Generate a personalised visa-aware engineering career strategy as a JSON object with EXACTLY this structure:
{
  "overallReadiness": <integer 0-100>,
  "summary": "<2-3 sentence personalised summary referencing their visa type, engineering discipline, and top opportunities>",
  "insights": [
    { "type": "success"|"warning"|"info", "title": "<short title>", "body": "<1-2 sentence insight>" }
  ],
  "timelineWarnings": ["<specific date-driven or visa-driven warning string>"],
  "skillGaps": [
    { "skill": "<skill name>", "importance": "Critical"|"High"|"Medium", "suggestion": "<actionable suggestion>" }
  ],
  "actionPlan": {
    "thisWeek": [{ "label": "<short action>", "description": "<detail>", "done": false }],
    "thisMonth": [{ "label": "<short action>", "description": "<detail>", "done": false }],
    "threeMonths": [{ "label": "<short action>", "description": "<detail>", "done": false }]
  }
}

Rules:
- Include 3-4 insights (mix of types), 1-3 timelineWarnings, 2-4 skillGaps, 2-3 items per timeframe
- Focus on engineering career path, discipline-specific advice, and internship/co-op/research strategy
- Make everything specific to this student's visa, engineering discipline, and matched companies
- overallReadiness reflects visa situation + engineering skill match scores
- Do NOT invent sponsorship facts — only use signals from the provided data
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

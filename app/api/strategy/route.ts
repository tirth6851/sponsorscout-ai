import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { scoreOpportunity, DbProfile, DbOpportunity } from '@/lib/matching';
import { generateDeterministicStrategy } from '@/lib/strategy';
import { mockOpportunities, mockProfile, mockStrategy } from '@/lib/mock-data';
import { ANTHROPIC_CONFIGURED } from '@/lib/env';

export async function GET() {
  const supabase = createClient();

  // ── Demo mode ──────────────────────────────────────────────────────────────
  if (!supabase) {
    // Score mock opportunities for demo strategy
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
      const result = scoreOpportunity(profile, oppRow);
      return { ...opp, ...result, sponsorship_status: opp.sponsorshipStatus };
    });

    const strategy = generateDeterministicStrategy(
      { ...profile, full_name: mockProfile.name } as Parameters<typeof generateDeterministicStrategy>[0],
      scoredOpps
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
    return NextResponse.json({ error: 'Profile not found', profileMissing: true }, { status: 404 });
  }

  const { data: opps } = await supabase
    .from('opportunities')
    .select('*')
    .eq('status', 'active');

  const scored = (opps ?? []).map((opp) => ({
    ...opp,
    ...scoreOpportunity(profileRow as DbProfile, opp as DbOpportunity),
  }));
  scored.sort((a, b) => b.match_score - a.match_score);

  // ── Claude AI strategy (Phase 9) ───────────────────────────────────────────
  if (ANTHROPIC_CONFIGURED) {
    try {
      const claudeStrategy = await generateClaudeStrategy(profileRow, scored);
      return NextResponse.json({
        strategy: claudeStrategy,
        profile: profileRow,
        generatedBy: 'claude',
      });
    } catch (err) {
      console.error('[strategy] Claude call failed, falling back to deterministic:', err);
    }
  }

  // Deterministic fallback
  const strategy = generateDeterministicStrategy(profileRow as DbProfile, scored);
  return NextResponse.json({
    strategy,
    profile: profileRow,
    generatedBy: 'deterministic',
  });
}

// ── Claude strategy (Phase 9 placeholder) ─────────────────────────────────────
async function generateClaudeStrategy(
  _profile: Record<string, unknown>,
  _opps: unknown[]
): Promise<never> {
  throw new Error('Claude strategy not yet implemented — see Phase 9');
}

// Suppress unused-var error on mockStrategy import (used in demo fallback references)
void mockStrategy;

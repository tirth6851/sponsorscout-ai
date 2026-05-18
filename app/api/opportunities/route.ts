import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { scoreOpportunity, DbProfile, DbOpportunity } from '@/lib/matching';
import { mockOpportunities, mockProfile } from '@/lib/mock-data';

export async function GET() {
  const supabase = createClient();

  // ── Demo mode: Supabase not configured ────────────────────────────────────
  if (!supabase) {
    // Score mock opportunities against mock profile so the algorithm runs
    const scored = mockOpportunities.map((opp) => {
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
      return { ...opp, ...result, demo: true };
    });
    scored.sort((a, b) => b.match_score - a.match_score);
    return NextResponse.json({ opportunities: scored, demo: true });
  }

  // ── Production mode ────────────────────────────────────────────────────────
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch student profile (nullable — show unscored list if not yet created)
  const { data: profileRow } = await supabase
    .from('student_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  // Fetch active opportunities
  const { data: opps, error: oppsError } = await supabase
    .from('opportunities')
    .select('*')
    .eq('status', 'active')
    .order('posted_date', { ascending: false });

  if (oppsError) {
    return NextResponse.json({ error: oppsError.message }, { status: 500 });
  }

  const opportunities = opps ?? [];

  if (!profileRow) {
    // No profile yet — return opportunities without scoring
    return NextResponse.json({
      opportunities: opportunities.map((o) => ({
        ...o,
        match_score: 0,
        fit_tier: 'Unknown',
        match_reasons: [],
        warning_flags: [],
        recommended_action: 'Complete your profile to get a personalised match score.',
      })),
      profileMissing: true,
    });
  }

  // Score each opportunity
  const scored = opportunities.map((opp) => {
    const result = scoreOpportunity(profileRow as DbProfile, opp as DbOpportunity);
    return { ...opp, ...result };
  });
  scored.sort((a, b) => b.match_score - a.match_score);

  return NextResponse.json({ opportunities: scored });
}

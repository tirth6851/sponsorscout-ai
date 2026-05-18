import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { scoreOpportunity, DbProfile, DbOpportunity } from '@/lib/matching';
import { mockOpportunities, mockProfile } from '@/lib/mock-data';

function signalToSponsorshipStatus(signal: string | null | undefined): string {
  if (signal === 'Better') return 'Occasional';
  if (signal === 'Risky') return 'Rare';
  return 'Unknown';
}

function signalToBool(signal: string | null | undefined): boolean {
  return signal === 'Likely';
}

export async function GET() {
  const supabase = createClient();

  // ── Demo mode: Supabase not configured ────────────────────────────────────
  if (!supabase) {
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
        engineering_discipline: mockProfile.engineeringDiscipline,
        role_family_preferences: mockProfile.roleFamilyPreferences,
        tools: mockProfile.tools,
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
        engineering_discipline: opp.engineeringDiscipline,
        role_family: opp.roleFamily,
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

  // Fetch student profile
  const { data: profileRow } = await supabase
    .from('student_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  // ── Prefer normalized real jobs, fallback to seeded opportunities ──────────
  const { data: normalizedJobs, error: normError } = await supabase
    .from('normalized_jobs')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(100);

  let opportunities: DbOpportunity[] = [];
  let fromNormalized = false;

  if (!normError && normalizedJobs && normalizedJobs.length > 0) {
    fromNormalized = true;
    opportunities = normalizedJobs.map((nj) => ({
      id: nj.id,
      title: nj.title,
      company: nj.company,
      location: nj.location,
      remote: nj.remote ?? false,
      h1b_sponsor: nj.sponsorship_signal === 'Better',
      sponsorship_status: signalToSponsorshipStatus(nj.sponsorship_signal),
      cpt_compatible: signalToBool(nj.cpt_compatible_signal),
      opt_compatible: signalToBool(nj.opt_compatible_signal),
      skills: nj.skills ?? [],
      industry: nj.engineering_discipline ?? null,
      experience_required: nj.role_family === 'internship' ? 'Internship'
        : nj.role_family === 'entry-level' ? 'Entry Level'
        : 'Entry Level',
      engineering_discipline: nj.engineering_discipline,
      role_family: nj.role_family,
      sponsorship_signal: nj.sponsorship_signal,
      // Attach extra fields for display
      salary_range: nj.salary_range,
      description: nj.description,
      application_url: nj.application_url,
      posted_date: nj.posted_date,
      eligibility_warnings: nj.eligibility_warnings ?? [],
    } as DbOpportunity & Record<string, unknown>));
  } else {
    // Fall back to seeded opportunities table
    const { data: opps, error: oppsError } = await supabase
      .from('opportunities')
      .select('*')
      .eq('status', 'active')
      .order('posted_date', { ascending: false });

    if (oppsError) {
      return NextResponse.json({ error: oppsError.message }, { status: 500 });
    }
    opportunities = (opps ?? []) as unknown as DbOpportunity[];
  }

  if (!profileRow) {
    return NextResponse.json({
      opportunities: opportunities.map((o) => ({
        ...o,
        match_score: 0,
        fit_tier: 'Unknown',
        match_reasons: [],
        warning_flags: [],
        recommended_action: 'Complete your profile to get a personalised match score.',
        source: fromNormalized ? 'normalized' : 'seeded',
      })),
      profileMissing: true,
    });
  }

  const scored = opportunities.map((opp) => {
    const result = scoreOpportunity(profileRow as DbProfile, opp);
    return {
      ...opp,
      ...result,
      source: fromNormalized ? 'normalized' : 'seeded',
    };
  });
  scored.sort((a, b) => b.match_score - a.match_score);

  return NextResponse.json({ opportunities: scored });
}

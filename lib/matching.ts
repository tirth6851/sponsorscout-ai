/**
 * Deterministic visa-aware match scoring.
 *
 * Score breakdown (100 points total):
 *  35 — Authorization compatibility (CPT/OPT + H-1B need)
 *  20 — Sponsorship history quality
 *  25 — Skills overlap
 *  12 — Location / remote preference
 *   8 — Industry alignment
 *  (experience mismatch can subtract points)
 */

export type FitTier = 'Realistic' | 'Stretch' | 'Low-Fit';

export interface DbProfile {
  full_name?: string | null;
  current_visa: string | null;
  stem_eligible: boolean;
  needs_sponsorship: string; // 'yes' | 'maybe' | 'no'
  skills: string[];
  preferred_locations: string[];
  remote_preference: string;
  experience_level: string | null;
  target_industries: string[];
  graduation_date: string | null;
}

export interface DbOpportunity {
  id: string;
  title: string;
  company: string;
  location: string;
  remote: boolean;
  h1b_sponsor: boolean;
  sponsorship_status: string;
  cpt_compatible: boolean;
  opt_compatible: boolean;
  skills: string[];
  industry: string | null;
  experience_required: string | null;
}

export interface MatchResult {
  match_score: number;
  fit_tier: FitTier;
  match_reasons: string[];
  warning_flags: string[];
  recommended_action: string;
}

const SPONSOR_POINTS: Record<string, number> = {
  'Strong History': 20,
  Occasional: 10,
  Rare: 3,
  Unknown: 0,
};

const EXP_LEVELS = ['Internship', 'Entry Level', 'Mid Level', 'Senior'];

export function scoreOpportunity(
  profile: DbProfile,
  opp: DbOpportunity
): MatchResult {
  let score = 0;
  const matchReasons: string[] = [];
  const warningFlags: string[] = [];

  // ─── 1. Authorization Compatibility (35 pts) ─────────────────────────────
  const visa = (profile.current_visa ?? '').toLowerCase();
  const isCPT = visa.includes('cpt');
  const isOPT =
    visa.includes('opt') || visa.includes('stem opt') || visa.includes('f-1 (opt)');
  const needsSponsorship =
    profile.needs_sponsorship === 'yes' || profile.needs_sponsorship === 'maybe';

  if (isCPT && !opp.cpt_compatible) {
    score -= 50; // Hard disqualifier
    warningFlags.push('Role is not compatible with CPT authorization');
  } else if (isOPT && !opp.opt_compatible) {
    score -= 50;
    warningFlags.push('Role is not compatible with OPT authorization');
  } else if (isCPT && opp.cpt_compatible) {
    score += 20;
    matchReasons.push('CPT-compatible role');
  } else if (isOPT && opp.opt_compatible) {
    score += 20;
    matchReasons.push('OPT-compatible role');
  }

  if (needsSponsorship && opp.h1b_sponsor) {
    score += 15;
    matchReasons.push(`${opp.company} has H-1B sponsorship history`);
  } else if (needsSponsorship && !opp.h1b_sponsor) {
    warningFlags.push('No confirmed H-1B sponsorship — verify before applying');
  }

  // ─── 2. Sponsorship Quality (20 pts) ─────────────────────────────────────
  const sponsorPts = SPONSOR_POINTS[opp.sponsorship_status] ?? 0;
  score += sponsorPts;
  if (sponsorPts === 20) {
    matchReasons.push(`${opp.company} has a strong multi-year H-1B track record`);
  } else if (sponsorPts === 0 && needsSponsorship) {
    warningFlags.push('Sponsorship history is unknown for this company');
  }

  // ─── 3. Skills Match (25 pts) ─────────────────────────────────────────────
  const userSkills = (profile.skills ?? []).map((s) => s.toLowerCase().trim());
  const requiredSkills = (opp.skills ?? []).map((s) => s.toLowerCase().trim());

  if (requiredSkills.length > 0 && userSkills.length > 0) {
    const matches = requiredSkills.filter((rs) =>
      userSkills.some((us) => us.includes(rs) || rs.includes(us))
    );
    const ratio = matches.length / requiredSkills.length;
    score += Math.round(ratio * 25);
    if (matches.length > 0) {
      matchReasons.push(
        `${matches.length}/${requiredSkills.length} required skills match your profile`
      );
    }
    if (ratio < 0.3) {
      warningFlags.push("Low skill overlap with this role's requirements");
    }
  }

  // ─── 4. Location / Remote (12 pts) ────────────────────────────────────────
  const prefLocs = (profile.preferred_locations ?? []).map((l) => l.toLowerCase());
  const jobLoc = opp.location.toLowerCase();
  const wantsRemote =
    profile.remote_preference === 'Remote' || profile.remote_preference === 'Any';

  if (opp.remote && wantsRemote) {
    score += 12;
    matchReasons.push('Remote-compatible role');
  } else if (prefLocs.some((l) => jobLoc.includes(l.split(',')[0].trim()))) {
    score += 12;
    matchReasons.push(`${opp.location} is in your preferred locations`);
  } else if (
    prefLocs.some((l) => {
      const state = l.split(',')[1]?.trim();
      return state && jobLoc.includes(state);
    })
  ) {
    score += 6;
    matchReasons.push('Role is in one of your preferred states');
  }

  // ─── 5. Industry Alignment (8 pts) ────────────────────────────────────────
  const targetInds = (profile.target_industries ?? []).map((i) => i.toLowerCase());
  if (opp.industry && targetInds.length > 0) {
    const oppInd = opp.industry.toLowerCase();
    if (targetInds.some((t) => oppInd.includes(t) || t.includes(oppInd))) {
      score += 8;
      matchReasons.push(`${opp.industry} aligns with your target industries`);
    }
  }

  // ─── 6. Experience Level (+5 / penalties) ─────────────────────────────────
  const userExpIdx = EXP_LEVELS.indexOf(profile.experience_level ?? 'Entry Level');
  const reqExpIdx = EXP_LEVELS.indexOf(opp.experience_required ?? 'Entry Level');
  const expDiff = reqExpIdx - userExpIdx;

  if (expDiff === 0) {
    score += 5;
  } else if (Math.abs(expDiff) === 1) {
    score += 2;
  } else if (expDiff > 1) {
    warningFlags.push(
      `Role requires ${opp.experience_required} experience — may be above your current level`
    );
  }

  // ─── Finalise ──────────────────────────────────────────────────────────────
  const finalScore = Math.min(100, Math.max(0, Math.round(score)));
  const fitTier: FitTier =
    finalScore >= 75 ? 'Realistic' : finalScore >= 50 ? 'Stretch' : 'Low-Fit';

  return {
    match_score: finalScore,
    fit_tier: fitTier,
    match_reasons: matchReasons.slice(0, 4),
    warning_flags: warningFlags.slice(0, 3),
    recommended_action: buildAction(fitTier, opp.company),
  };
}

function buildAction(tier: FitTier, company: string): string {
  if (tier === 'Realistic') {
    return `Apply promptly — high-confidence match. Tailor your resume to ${company}'s requirements.`;
  }
  if (tier === 'Stretch') {
    return `Worth applying with a targeted cover letter. Ask about sponsorship policy in the interview.`;
  }
  return `Review work authorization requirements carefully before investing application time.`;
}

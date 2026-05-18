/**
 * Deterministic visa-aware match scoring for engineering opportunities.
 *
 * Score breakdown (100 points total):
 *  30 — Authorization compatibility (CPT/OPT + H-1B need)
 *  18 — Sponsorship history quality
 *  22 — Skills overlap
 *  10 — Location / remote preference
 *   8 — Industry alignment
 *   7 — Engineering discipline match
 *   5 — Role family match
 *  (+5 experience bonus / penalties)
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
  // Engineering-specific (optional — added in migration 003)
  engineering_discipline?: string | null;
  role_family_preferences?: string[] | null;
  tools?: string[] | null;
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
  // Engineering enrichment (from normalized_jobs — optional)
  engineering_discipline?: string | null;
  role_family?: string | null;
  sponsorship_signal?: string | null; // 'Better' | 'Unclear' | 'Risky'
}

export interface MatchResult {
  match_score: number;
  fit_tier: FitTier;
  match_reasons: string[];
  warning_flags: string[];
  recommended_action: string;
}

const SPONSOR_POINTS: Record<string, number> = {
  'Strong History': 18,
  Occasional: 9,
  Rare: 3,
  Unknown: 0,
};

const EXP_LEVELS = ['Internship', 'Entry Level', 'Mid Level', 'Senior'];

export function scoreOpportunity(
  profile: DbProfile,
  opp: DbOpportunity,
): MatchResult {
  let score = 0;
  const matchReasons: string[] = [];
  const warningFlags: string[] = [];

  // ─── 1. Authorization Compatibility (30 pts) ──────────────────────────────
  const visa = (profile.current_visa ?? '').toLowerCase();
  const isCPT = visa.includes('cpt');
  const isOPT =
    visa.includes('opt') ||
    visa.includes('stem opt') ||
    visa.includes('f-1 (opt)');
  const needsSponsorship =
    profile.needs_sponsorship === 'yes' || profile.needs_sponsorship === 'maybe';

  // Check sponsorship signal from normalized jobs if available
  const sponsorshipRisky = opp.sponsorship_signal === 'Risky';
  const sponsorshipBetter = opp.sponsorship_signal === 'Better';

  if (sponsorshipRisky) {
    score -= 40;
    warningFlags.push('Job description contains no-sponsorship language — verify eligibility');
  } else if (isCPT && !opp.cpt_compatible) {
    score -= 40;
    warningFlags.push('Role is not compatible with CPT authorization');
  } else if (isOPT && !opp.opt_compatible) {
    score -= 40;
    warningFlags.push('Role is not compatible with OPT authorization');
  } else if (isCPT && opp.cpt_compatible) {
    score += 18;
    matchReasons.push('CPT-compatible role');
  } else if (isOPT && opp.opt_compatible) {
    score += 18;
    matchReasons.push('OPT-compatible role');
  } else {
    score += 10; // authorized to work (citizen/GC/H-1B)
  }

  if (needsSponsorship && (opp.h1b_sponsor || sponsorshipBetter)) {
    score += 12;
    matchReasons.push(
      sponsorshipBetter
        ? 'Job description indicates visa sponsorship available'
        : `${opp.company} has H-1B sponsorship history`,
    );
  } else if (needsSponsorship && !opp.h1b_sponsor && !sponsorshipBetter) {
    warningFlags.push('No confirmed H-1B sponsorship — verify before applying');
  }

  // ─── 2. Sponsorship Quality (18 pts) ──────────────────────────────────────
  const sponsorPts = SPONSOR_POINTS[opp.sponsorship_status] ?? 0;
  score += sponsorPts;
  if (sponsorPts === 18) {
    matchReasons.push(`${opp.company} has a strong multi-year H-1B track record`);
  } else if (sponsorPts === 0 && needsSponsorship) {
    warningFlags.push('Sponsorship history is unknown for this company');
  }

  // ─── 3. Skills Match (22 pts) ─────────────────────────────────────────────
  const userSkills = (profile.skills ?? []).map((s) => s.toLowerCase().trim());
  const userTools = (profile.tools ?? []).map((s) => s.toLowerCase().trim());
  const allUserTech = [...userSkills, ...userTools];
  const requiredSkills = (opp.skills ?? []).map((s) => s.toLowerCase().trim());

  if (requiredSkills.length > 0 && allUserTech.length > 0) {
    const matches = requiredSkills.filter((rs) =>
      allUserTech.some((us) => us.includes(rs) || rs.includes(us)),
    );
    const ratio = matches.length / requiredSkills.length;
    score += Math.round(ratio * 22);
    if (matches.length > 0) {
      matchReasons.push(
        `${matches.length}/${requiredSkills.length} required skills match your profile`,
      );
    }
    if (ratio < 0.3) {
      warningFlags.push("Low skill overlap with this role's requirements");
    }
  }

  // ─── 4. Location / Remote (10 pts) ────────────────────────────────────────
  const prefLocs = (profile.preferred_locations ?? []).map((l) => l.toLowerCase());
  const jobLoc = opp.location.toLowerCase();
  const wantsRemote =
    profile.remote_preference === 'Remote' || profile.remote_preference === 'Any';

  if (opp.remote && wantsRemote) {
    score += 10;
    matchReasons.push('Remote-compatible role');
  } else if (prefLocs.some((l) => jobLoc.includes(l.split(',')[0].trim()))) {
    score += 10;
    matchReasons.push(`${opp.location} is in your preferred locations`);
  } else if (
    prefLocs.some((l) => {
      const state = l.split(',')[1]?.trim();
      return state && jobLoc.includes(state);
    })
  ) {
    score += 5;
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

  // ─── 6. Engineering Discipline Match (7 pts) ──────────────────────────────
  const profileDiscipline = (profile.engineering_discipline ?? '').toLowerCase();
  const oppDiscipline = (opp.engineering_discipline ?? '').toLowerCase();
  if (profileDiscipline && oppDiscipline && profileDiscipline !== 'other') {
    if (oppDiscipline.includes(profileDiscipline) || profileDiscipline.includes(oppDiscipline)) {
      score += 7;
      matchReasons.push(`Engineering discipline match: ${opp.engineering_discipline}`);
    }
  }

  // ─── 7. Role Family Match (5 pts) ─────────────────────────────────────────
  const profileRoleFamilies = (profile.role_family_preferences ?? []).map((r) =>
    r.toLowerCase(),
  );
  const oppRoleFamily = (opp.role_family ?? '').toLowerCase();
  if (profileRoleFamilies.length > 0 && oppRoleFamily) {
    if (profileRoleFamilies.includes(oppRoleFamily)) {
      score += 5;
      matchReasons.push(`Role type matches your preference: ${opp.role_family}`);
    }
  }

  // ─── 8. Experience Level (+5 / penalties) ─────────────────────────────────
  const userExpIdx = EXP_LEVELS.indexOf(profile.experience_level ?? 'Entry Level');
  const reqExpIdx = EXP_LEVELS.indexOf(opp.experience_required ?? 'Entry Level');
  const expDiff = reqExpIdx - userExpIdx;

  if (expDiff === 0) {
    score += 5;
  } else if (Math.abs(expDiff) === 1) {
    score += 2;
  } else if (expDiff > 1) {
    warningFlags.push(
      `Role requires ${opp.experience_required} experience — may be above your current level`,
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
    return `Apply promptly — high-confidence match. Tailor your resume to ${company}'s engineering requirements.`;
  }
  if (tier === 'Stretch') {
    return `Worth applying with a targeted cover letter. Ask about sponsorship policy in the interview.`;
  }
  return `Review work authorization requirements carefully before investing application time.`;
}

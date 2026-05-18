/**
 * Deterministic strategy generator.
 * Produces a personalised StrategyOutput from a student profile
 * and their scored opportunity list.
 *
 * This runs without any external API calls.
 * When ANTHROPIC_API_KEY is set and /api/strategy is called, this is
 * replaced by a Claude-generated response.
 */

import { StrategyOutput, StrategyInsight, SkillGap, ActionItem } from './types';
import { DbProfile } from './matching';

interface ScoredOpp {
  company: string;
  title: string;
  match_score: number;
  fit_tier: string;
  skills: string[];
  sponsorship_status: string;
}

export function generateDeterministicStrategy(
  profile: DbProfile,
  scoredOpps: ScoredOpp[]
): StrategyOutput {
  const realistic = scoredOpps.filter((o) => o.fit_tier === 'Realistic');
  const avgScore =
    scoredOpps.length > 0
      ? Math.round(scoredOpps.reduce((a, b) => a + b.match_score, 0) / scoredOpps.length)
      : 0;

  const visa = (profile.current_visa ?? '').toLowerCase();
  const isCPT = visa.includes('cpt');
  const isOPT = visa.includes('opt');
  const isStemOPT = visa.includes('stem opt');
  const needsSponsorship =
    profile.needs_sponsorship === 'yes' || profile.needs_sponsorship === 'maybe';

  // ── Overall readiness ─────────────────────────────────────────────────────
  let readiness = 40; // base
  readiness += Math.min(30, realistic.length * 8);          // +8 per Realistic match, max 30
  readiness += Math.min(15, (profile.skills?.length ?? 0) * 2); // +2 per skill, max 15
  if (profile.stem_eligible) readiness += 10;
  if (profile.graduation_date) readiness += 5;
  const overallReadiness = Math.min(100, readiness);

  // ── Summary ───────────────────────────────────────────────────────────────
  const name = profile.full_name?.split(' ')[0] ?? 'You';
  let summary =
    `${name}, your profile shows an average match score of ${avgScore}% across ${scoredOpps.length} opportunities, ` +
    `with ${realistic.length} Realistic-tier matches that are strong candidates for your time. `;

  if (isStemOPT || profile.stem_eligible) {
    summary +=
      'Your STEM OPT eligibility extends your work authorization runway by 24 months — this is a significant advantage with H-1B sponsors. ';
  }
  if (realistic.length > 0) {
    const topCo = realistic.slice(0, 3).map((o) => o.company).join(', ');
    summary += `Focus your primary effort on ${topCo} where your profile aligns most strongly.`;
  } else {
    summary +=
      'No Realistic-tier matches were found for your current profile — refining your skills and preferred locations may improve this.';
  }

  // ── Insights ─────────────────────────────────────────────────────────────
  const insights: StrategyInsight[] = [];

  if (profile.stem_eligible || isStemOPT) {
    insights.push({
      type: 'success',
      title: 'STEM OPT Advantage',
      body: 'STEM OPT extends your post-graduation work authorization to 3 years total. Communicate this explicitly to recruiters — it materially reduces the urgency of their H-1B filing timeline.',
    });
  }

  if (needsSponsorship) {
    insights.push({
      type: 'warning',
      title: 'H-1B Timeline Pressure',
      body: 'H-1B cap season opens April 1. To have coverage by October 1, your employer must file by late March. Plan your job search to close an offer before January of your target year.',
    });
  }

  if (realistic.length >= 3) {
    insights.push({
      type: 'success',
      title: `${realistic.length} Realistic Targets Found`,
      body: `You have ${realistic.length} high-confidence matches with confirmed sponsorship history. Concentrate 70% of your application effort here for the best ROI.`,
    });
  } else if (realistic.length > 0) {
    insights.push({
      type: 'info',
      title: 'Build Your Priority List',
      body: `${realistic.length} Realistic-tier match${realistic.length > 1 ? 'es' : ''} found. These should receive the majority of your application effort. Stretch-tier roles are worth applying to as backup options.`,
    });
  }

  const userSkills = (profile.skills ?? []).map((s) => s.toLowerCase());
  const hasMLSkills = userSkills.some((s) =>
    ['pytorch', 'tensorflow', 'ml', 'machine learning'].includes(s)
  );
  if (hasMLSkills) {
    insights.push({
      type: 'info',
      title: 'ML Skills Are High-Demand',
      body: 'PyTorch / TensorFlow skills appear in the top-paying roles with the strongest sponsorship history. Emphasise these prominently in your resume and LinkedIn.',
    });
  }

  // ── Timeline warnings ────────────────────────────────────────────────────
  const timelineWarnings: string[] = [];

  if (isCPT || isOPT) {
    timelineWarnings.push(
      'OPT application must be submitted to USCIS 90 days before graduation — do not miss this window.'
    );
  }
  if (needsSponsorship) {
    timelineWarnings.push(
      'H-1B cap lottery opens April 1. Your employer must be ready to file the moment registration opens.'
    );
    if (profile.stem_eligible) {
      timelineWarnings.push(
        'File your STEM OPT extension before standard OPT expires. Starting early (6 months out) is recommended.'
      );
    }
    timelineWarnings.push(
      'Cap-gap protection covers you if your OPT expires while your H-1B petition is pending. Understand this rule and keep records.'
    );
  }

  // ── Skill gaps ────────────────────────────────────────────────────────────
  const skillGaps: SkillGap[] = [];
  const allRequiredSkills = scoredOpps.flatMap((o) =>
    (o.skills ?? []).map((s) => s.toLowerCase())
  );
  const skillFreq: Record<string, number> = {};
  allRequiredSkills.forEach((s) => {
    skillFreq[s] = (skillFreq[s] ?? 0) + 1;
  });

  const missing = Object.entries(skillFreq)
    .filter(([skill]) => !userSkills.includes(skill))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const SKILL_ADVICE: Record<string, string> = {
    'system design': 'Practice Grokking System Design. Expected in most senior-track SWE interviews.',
    'kubernetes': 'Complete the official Kubernetes "Hello World" tutorial. One weekend is enough for interview basics.',
    'go': 'Build one small REST API in Go to demonstrate backend breadth for FinTech targets.',
    'graphql': 'Read the official GraphQL docs and convert a REST endpoint to GraphQL in a side project.',
    'dbt': 'Complete the free dbt Learn fundamentals course — directly relevant for data roles at Stripe/Airbnb.',
    'spark': 'Complete the Databricks free Spark course. Relevant for data engineering roles.',
  };

  missing.forEach(([skill, count]) => {
    skillGaps.push({
      skill: skill.charAt(0).toUpperCase() + skill.slice(1),
      importance: count >= 3 ? 'Critical' : count >= 2 ? 'High' : 'Medium',
      suggestion:
        SKILL_ADVICE[skill] ??
        `This skill appears in ${count} of your target roles. Add a project or course to your profile.`,
    });
  });

  // ── Action plan ────────────────────────────────────────────────────────────
  const thisWeek: ActionItem[] = [];
  const thisMonth: ActionItem[] = [];
  const threeMonths: ActionItem[] = [];

  // This week — apply to top 2 Realistic matches immediately
  realistic.slice(0, 2).forEach((opp) => {
    thisWeek.push({
      label: `Apply to ${opp.company} — ${opp.title}`,
      description: `${opp.match_score}% match. Tailor your resume to their tech stack before submitting.`,
      done: false,
    });
  });
  if (isCPT || isOPT) {
    thisWeek.push({
      label: 'Confirm OPT/CPT application status with your DSO',
      description: 'Verify your I-20 is endorsed and your Form I-765 timeline is on track.',
      done: false,
    });
  }
  thisWeek.push({
    label: 'Update LinkedIn headline to reflect your visa status and availability',
    description: 'Add "OPT available [date]" or "Authorized to work — STEM OPT eligible" to attract sponsoring recruiters.',
    done: false,
  });

  // This month
  if (realistic.length > 2) {
    thisMonth.push({
      label: `Apply to remaining Realistic-tier matches (${realistic.length - 2} remaining)`,
      description: 'Complete your first-pass applications to all high-confidence targets.',
      done: false,
    });
  }
  thisMonth.push({
    label: 'Complete 40 LeetCode problems (easy + medium)',
    description: 'Focus on arrays, hashmaps, and tree traversal. These cover 80% of screening rounds.',
    done: false,
  });
  if (needsSponsorship) {
    thisMonth.push({
      label: '30-minute consultation with an immigration attorney',
      description: 'Validate your CPT → OPT → H-1B transition plan. Most offer free initial calls.',
      done: false,
    });
  }
  thisMonth.push({
    label: 'Reach out to 5 alumni at your target companies on LinkedIn',
    description: 'Referrals increase interview conversion by ~4x. Ask for a 15-min informational chat, not a referral directly.',
    done: false,
  });

  // Three months
  if (needsSponsorship) {
    threeMonths.push({
      label: 'Finalise employer for H-1B sponsorship',
      description: 'Compare companies not just by salary but by their H-1B filing track record and legal support quality.',
      done: false,
    });
    threeMonths.push({
      label: 'Confirm employer will file H-1B petition in next cap season',
      description: 'Get written confirmation from HR. The April 1 filing window is non-negotiable.',
      done: false,
    });
  }
  if (skillGaps.length > 0) {
    threeMonths.push({
      label: `Close top skill gap: ${skillGaps[0]?.skill}`,
      description: skillGaps[0]?.suggestion ?? 'Build a project demonstrating this skill.',
      done: false,
    });
  }

  return {
    overallReadiness,
    summary,
    insights,
    timelineWarnings,
    skillGaps,
    actionPlan: { thisWeek, thisMonth, threeMonths },
  };
}

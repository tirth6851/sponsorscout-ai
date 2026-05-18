/**
 * Deterministic strategy generator for international engineering students.
 * Produces a personalised StrategyOutput from a student profile
 * and their scored opportunity list. No external API calls.
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
  engineering_discipline?: string | null;
  role_family?: string | null;
}

export function generateDeterministicStrategy(
  profile: DbProfile,
  scoredOpps: ScoredOpp[],
): StrategyOutput {
  const realistic = scoredOpps.filter((o) => o.fit_tier === 'Realistic');
  const avgScore =
    scoredOpps.length > 0
      ? Math.round(
          scoredOpps.reduce((a, b) => a + b.match_score, 0) / scoredOpps.length,
        )
      : 0;

  const visa = (profile.current_visa ?? '').toLowerCase();
  const isCPT = visa.includes('cpt');
  const isOPT = visa.includes('opt');
  const isStemOPT = visa.includes('stem opt');
  const needsSponsorship =
    profile.needs_sponsorship === 'yes' || profile.needs_sponsorship === 'maybe';

  const discipline = profile.engineering_discipline ?? '';
  const roleFamilyPrefs = (profile.role_family_preferences ?? []).join(', ') || 'any';

  // ── Overall readiness ─────────────────────────────────────────────────────
  let readiness = 40;
  readiness += Math.min(30, realistic.length * 8);
  readiness += Math.min(12, (profile.skills?.length ?? 0) * 2);
  if (profile.stem_eligible) readiness += 8;
  if (profile.graduation_date) readiness += 5;
  if (discipline) readiness += 5;
  const overallReadiness = Math.min(100, readiness);

  // ── Summary ───────────────────────────────────────────────────────────────
  const name = profile.full_name?.split(' ')[0] ?? 'You';
  let summary =
    `${name}, your profile shows an average match score of ${avgScore}% across ` +
    `${scoredOpps.length} engineering opportunities, with ${realistic.length} Realistic-tier ` +
    `matches that are strong candidates for your time. `;

  if (discipline) {
    summary += `Your ${discipline} focus is well-aligned with current market demand. `;
  }
  if (isStemOPT || profile.stem_eligible) {
    summary +=
      'Your STEM OPT eligibility extends your work authorization runway by 24 months — a significant advantage with H-1B sponsors. ';
  }
  if (realistic.length > 0) {
    const topCo = realistic
      .slice(0, 3)
      .map((o) => o.company)
      .join(', ');
    summary += `Focus your primary effort on ${topCo} where your engineering profile aligns most strongly.`;
  } else {
    summary +=
      'No Realistic-tier matches found for your current profile — refining your skills and engineering discipline targeting may improve this.';
  }

  // ── Insights ─────────────────────────────────────────────────────────────
  const insights: StrategyInsight[] = [];

  if (discipline) {
    insights.push({
      type: 'info',
      title: `${discipline} Discipline Targeting`,
      body: `Your ${discipline} focus filters opportunities to roles that align with your actual engineering background. This improves both match quality and interview conversion rate.`,
    });
  }

  if (profile.stem_eligible || isStemOPT) {
    insights.push({
      type: 'success',
      title: 'STEM OPT Advantage',
      body: 'STEM OPT extends your post-graduation work authorization to 3 years total. Communicate this explicitly to recruiters — it reduces urgency around H-1B filing and makes you more attractive.',
    });
  }

  if (needsSponsorship) {
    insights.push({
      type: 'warning',
      title: 'H-1B Timeline Pressure',
      body: 'H-1B cap season opens April 1. To have coverage by October 1, your employer must file by late March. Plan your search to close an offer before January of your target year.',
    });
  }

  if (realistic.length >= 3) {
    insights.push({
      type: 'success',
      title: `${realistic.length} Realistic Engineering Targets Found`,
      body: `You have ${realistic.length} high-confidence engineering matches. Concentrate 70% of your application effort here for the best ROI.`,
    });
  } else if (realistic.length > 0) {
    insights.push({
      type: 'info',
      title: 'Build Your Engineering Priority List',
      body: `${realistic.length} Realistic-tier match${realistic.length > 1 ? 'es' : ''} found. Stretch-tier roles are worth applying to as backup options while you focus on these first.`,
    });
  }

  const userSkills = (profile.skills ?? []).map((s) => s.toLowerCase());
  const hasMLSkills = userSkills.some((s) =>
    ['pytorch', 'tensorflow', 'ml', 'machine learning', 'deep learning'].includes(s),
  );
  if (hasMLSkills) {
    insights.push({
      type: 'info',
      title: 'ML/AI Skills in High Demand',
      body: 'PyTorch / TensorFlow skills appear in the top-paying engineering roles with the strongest sponsorship records. Emphasize these prominently in your resume and LinkedIn.',
    });
  }

  // ── Timeline warnings ────────────────────────────────────────────────────
  const timelineWarnings: string[] = [];
  if (isCPT || isOPT) {
    timelineWarnings.push(
      'OPT application must be submitted to USCIS 90 days before graduation — do not miss this window.',
    );
  }
  if (needsSponsorship) {
    timelineWarnings.push(
      'H-1B cap lottery opens April 1. Your employer must be ready to file the moment registration opens.',
    );
    if (profile.stem_eligible) {
      timelineWarnings.push(
        'File your STEM OPT extension before standard OPT expires. Starting early (6 months out) is recommended.',
      );
    }
    timelineWarnings.push(
      'Cap-gap protection covers you if your OPT expires while your H-1B petition is pending. Keep records.',
    );
  }

  // ── Skill gaps ────────────────────────────────────────────────────────────
  const skillGaps: SkillGap[] = [];
  const allRequiredSkills = scoredOpps.flatMap((o) =>
    (o.skills ?? []).map((s) => s.toLowerCase()),
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
    'system design':
      'Practice Grokking System Design or Exponent. Expected in most engineering interview loops.',
    kubernetes:
      'Complete the official Kubernetes tutorial. One weekend is enough for interview basics.',
    go: 'Build one small REST API in Go to demonstrate backend breadth for FinTech targets.',
    graphql:
      'Read the official GraphQL docs and convert a REST endpoint to GraphQL in a side project.',
    dbt: 'Complete the free dbt Learn fundamentals course — directly relevant for data engineering roles.',
    spark:
      'Complete the Databricks free Spark course. Relevant for data engineering roles.',
    matlab:
      'Run through MATLAB OnRamp (free). Critical for EE, ME, and controls engineering roles.',
    'solidworks':
      'Complete the MySolidWorks fundamentals course. Required for many mechanical design roles.',
    cuda: 'Nvidia provides free CUDA C++ programming guides. Valuable for AI/ML infrastructure roles.',
    'fpga': 'Take a free Xilinx/AMD FPGA fundamentals course. Critical for embedded/hardware roles.',
    'labview': 'Complete the free NI LabVIEW Core 1 training. Required for lab automation roles.',
  };

  missing.forEach(([skill, count]) => {
    skillGaps.push({
      skill: skill.charAt(0).toUpperCase() + skill.slice(1),
      importance: count >= 3 ? 'Critical' : count >= 2 ? 'High' : 'Medium',
      suggestion:
        SKILL_ADVICE[skill] ??
        `This skill appears in ${count} of your target engineering roles. Add a project or course to your profile.`,
    });
  });

  // ── Action plan ───────────────────────────────────────────────────────────
  const thisWeek: ActionItem[] = [];
  const thisMonth: ActionItem[] = [];
  const threeMonths: ActionItem[] = [];

  realistic.slice(0, 2).forEach((opp) => {
    thisWeek.push({
      label: `Apply to ${opp.company} — ${opp.title}`,
      description: `${opp.match_score}% match. Tailor your resume to their engineering tech stack before submitting.`,
      done: false,
    });
  });

  if (isCPT || isOPT) {
    thisWeek.push({
      label: 'Confirm OPT/CPT application status with your DSO',
      description:
        'Verify your I-20 is endorsed and your Form I-765 timeline is on track.',
      done: false,
    });
  }

  thisWeek.push({
    label: 'Update LinkedIn to reflect your engineering discipline and visa status',
    description: `Add "${discipline || 'Engineering'} student | OPT available [date] | STEM eligible" to attract sponsoring recruiters.`,
    done: false,
  });

  if (realistic.length > 2) {
    thisMonth.push({
      label: `Apply to remaining Realistic-tier matches (${realistic.length - 2} remaining)`,
      description: 'Complete your first-pass applications to all high-confidence engineering targets.',
      done: false,
    });
  }

  const roleFamilyNote =
    roleFamilyPrefs.includes('internship') || roleFamilyPrefs.includes('co-op')
      ? 'Focus on summer internship and co-op deadlines — many close in January/February.'
      : 'Check application deadlines for your preferred role types.';

  thisMonth.push({
    label: 'Map out application deadlines for target companies',
    description: roleFamilyNote,
    done: false,
  });

  if (needsSponsorship) {
    thisMonth.push({
      label: '30-minute consultation with an immigration attorney',
      description:
        'Validate your CPT → OPT → H-1B engineering career transition plan. Most offer free initial calls.',
      done: false,
    });
  }

  thisMonth.push({
    label: 'Reach out to 5 alumni at your target companies on LinkedIn',
    description:
      'Referrals increase interview conversion by ~4x. Ask for a 15-min informational chat, not a referral directly.',
    done: false,
  });

  if (needsSponsorship) {
    threeMonths.push({
      label: 'Finalise employer for H-1B sponsorship',
      description:
        'Compare engineering companies not just by salary but by their H-1B filing track record and legal support.',
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

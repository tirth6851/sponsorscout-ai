const RISKY_PHRASES = [
  'no sponsorship',
  'does not sponsor',
  'must not require sponsorship',
  'must not require work authorization',
  'us citizen only',
  'u.s. citizen only',
  'united states citizen only',
  'permanent resident only',
  'security clearance required',
  'active clearance required',
  'secret clearance',
  'top secret clearance',
  'must be authorized to work in the united states without employer sponsorship',
  'no visa sponsorship',
  'not able to sponsor',
  'unable to sponsor',
];

const BETTER_PHRASES = [
  'visa sponsorship available',
  'visa sponsorship provided',
  'will sponsor',
  'h-1b sponsorship',
  'h1b sponsorship',
  'we sponsor',
  'accepts opt',
  'accepts cpt',
  'opt accepted',
  'cpt accepted',
  'international students encouraged',
  'open to international candidates',
  'relocation assistance available',
  'supports work authorization',
  'sponsorship for work authorization',
];

export function detectSponsorshipSignal(text: string): {
  signal: 'Better' | 'Unclear' | 'Risky';
  evidence: string[];
} {
  const lower = text.toLowerCase();
  const riskyFound: string[] = [];
  const betterFound: string[] = [];

  for (const phrase of RISKY_PHRASES) {
    if (lower.includes(phrase)) riskyFound.push(phrase);
  }
  for (const phrase of BETTER_PHRASES) {
    if (lower.includes(phrase)) betterFound.push(phrase);
  }

  if (riskyFound.length > 0) return { signal: 'Risky', evidence: riskyFound };
  if (betterFound.length > 0) return { signal: 'Better', evidence: betterFound };
  return { signal: 'Unclear', evidence: ['No explicit visa sponsorship language found'] };
}

export function detectCPTCompatibility(text: string): 'Likely' | 'Unclear' | 'Risky' {
  const lower = text.toLowerCase();
  if (
    lower.includes('us citizen only') ||
    lower.includes('security clearance') ||
    lower.includes('no sponsorship') ||
    lower.includes('must be authorized to work in the united states without employer sponsorship')
  ) return 'Risky';
  if (
    lower.includes('cpt') ||
    lower.includes('curricular practical training') ||
    lower.includes('f-1 student') ||
    (lower.includes('intern') && !lower.includes('no sponsorship'))
  ) return 'Likely';
  return 'Unclear';
}

export function detectOPTCompatibility(text: string): 'Likely' | 'Unclear' | 'Risky' {
  const lower = text.toLowerCase();
  if (
    lower.includes('us citizen only') ||
    lower.includes('security clearance') ||
    lower.includes('does not sponsor') ||
    lower.includes('no visa sponsorship')
  ) return 'Risky';
  if (
    lower.includes('opt') ||
    lower.includes('optional practical training') ||
    lower.includes('stem opt') ||
    lower.includes('f-1 student')
  ) return 'Likely';
  return 'Unclear';
}

export function buildEligibilityWarnings(text: string): string[] {
  const lower = text.toLowerCase();
  const warnings: string[] = [];
  if (lower.includes('security clearance') || lower.includes('secret clearance')) {
    warnings.push('Requires security clearance — typically incompatible with F-1 status');
  }
  if (lower.includes('us citizen only') || lower.includes('u.s. citizen only')) {
    warnings.push('Listed as US citizens only — international students ineligible');
  }
  if (lower.includes('no sponsorship') || lower.includes('does not sponsor')) {
    warnings.push('Explicitly states no visa sponsorship');
  }
  if (lower.includes('must be authorized to work in the united states without employer sponsorship')) {
    warnings.push('Requires existing authorization without employer sponsorship');
  }
  return warnings;
}

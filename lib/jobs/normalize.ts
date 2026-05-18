import { NormalizedJob } from './types';
import {
  detectSponsorshipSignal,
  detectCPTCompatibility,
  detectOPTCompatibility,
  buildEligibilityWarnings,
} from './sponsorship-signals';

const DISCIPLINE_KEYWORDS: Record<string, string[]> = {
  'Software/CS': [
    'software engineer', 'full stack', 'frontend', 'backend', 'web developer',
    'mobile developer', 'ios developer', 'android developer', 'devops', 'sre',
    'platform engineer', 'cloud engineer', 'cybersecurity', 'network engineer',
    'database engineer', 'api engineer', 'microservices', 'computer science',
  ],
  'Data/AI/ML': [
    'data scientist', 'machine learning', 'ml engineer', 'ai engineer',
    'data analyst', 'data engineer', 'nlp engineer', 'computer vision',
    'deep learning', 'llm engineer', 'artificial intelligence', 'analytics engineer',
    'business intelligence', 'data science',
  ],
  'Electrical/Hardware': [
    'electrical engineer', 'hardware engineer', 'fpga', 'embedded systems',
    'pcb design', 'vlsi', 'circuit design', 'rf engineer', 'signal processing',
    'firmware engineer', 'semiconductor', 'asic design',
  ],
  'Mechanical/Manufacturing': [
    'mechanical engineer', 'manufacturing engineer', 'cad designer', 'solidworks',
    'autocad', 'process engineer', 'quality engineer', 'robotics engineer',
    'automation engineer', 'industrial design', 'product design',
  ],
  'Civil/Environmental': [
    'civil engineer', 'structural engineer', 'environmental engineer',
    'geotechnical', 'transportation engineer', 'water resources',
    'construction engineer', 'site engineer',
  ],
  'Industrial/Systems': [
    'industrial engineer', 'systems engineer', 'supply chain engineer',
    'operations research', 'lean engineer', 'six sigma', 'logistics engineer',
    'operations engineer',
  ],
  'Research/Lab': [
    'research intern', 'research engineer', 'lab assistant', 'research associate',
    'research scientist', 'phd intern', 'lab technician', 'graduate researcher',
    'undergraduate researcher', 'laboratory',
  ],
};

const ROLE_FAMILY_KEYWORDS: Record<string, string[]> = {
  'internship': ['intern ', 'internship', 'summer intern', 'co-op intern'],
  'co-op': ['co-op', ' coop', 'cooperative education'],
  'research': ['research engineer', 'research scientist', 'phd intern', 'r&d engineer'],
  'campus job': [
    'on-campus', 'campus student', 'student worker', 'work-study',
    'graduate assistant', 'teaching assistant', ' ra ', 'research assistant',
  ],
  'entry-level': [
    'entry level', 'entry-level', 'junior engineer', 'associate engineer',
    'new grad', 'recent graduate', 'university graduate', 'new graduate',
  ],
  'full-time': ['full-time', 'full time', 'permanent position', 'regular full-time'],
};

const SKILL_PATTERNS = [
  'python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'golang', ' go ',
  'rust', 'sql', ' r ', 'scala', 'kotlin', 'swift',
  'react', 'angular', 'vue', 'node.js', 'django', 'flask', 'spring boot',
  'pytorch', 'tensorflow', 'keras', 'scikit-learn', 'pandas', 'numpy', 'spark',
  'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'linux',
  'matlab', 'labview', 'solidworks', 'autocad', 'ansys', 'catia',
  'git', 'bash', 'rest api', 'graphql', 'kafka', 'redis',
];

const TOOL_PATTERNS = [
  'jira', 'confluence', 'figma', 'github', 'gitlab', 'bitbucket',
  'vs code', 'intellij', 'eclipse', 'xcode', 'pycharm',
  'tableau', 'power bi', 'looker', 'databricks', 'snowflake', 'airflow',
];

export function detectEngineeringDiscipline(title: string, description: string): string {
  const text = (title + ' ' + description).toLowerCase();
  for (const [discipline, keywords] of Object.entries(DISCIPLINE_KEYWORDS)) {
    if (keywords.some((kw) => text.includes(kw))) return discipline;
  }
  return 'Other';
}

export function detectRoleFamily(title: string, description: string): string {
  const text = (title + ' ' + description).toLowerCase();
  for (const [family, keywords] of Object.entries(ROLE_FAMILY_KEYWORDS)) {
    if (keywords.some((kw) => text.includes(kw))) return family;
  }
  if (
    text.includes('senior') ||
    text.includes('principal') ||
    text.includes('staff ') ||
    text.includes('director')
  ) return 'full-time';
  return 'entry-level';
}

function extractSkills(text: string): string[] {
  const lower = text.toLowerCase();
  return SKILL_PATTERNS.filter((skill) => lower.includes(skill)).map((s) => s.trim());
}

function extractTools(text: string): string[] {
  const lower = text.toLowerCase();
  return TOOL_PATTERNS.filter((tool) => lower.includes(tool)).map((t) => t.trim());
}

function formatSalaryRange(
  min: number | null | undefined,
  max: number | null | undefined,
  unit?: string | null,
): string | null {
  if (!min && !max) return null;
  const isHourly = unit === 'per hour' || unit === 'hourly';
  const fmt = (n: number) => {
    if (isHourly) return `$${n}/hr`;
    if (n >= 1000) return `$${Math.round(n / 1000)}k`;
    return `$${n}`;
  };
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `${fmt(min)}+`;
  if (max) return `Up to ${fmt(max)}`;
  return null;
}

export function normalizeJob(
  raw: object,
  source: 'adzuna' | 'serpapi' | 'usajobs',
  externalId: string,
  title: string,
  company: string,
  location: string,
  remote: boolean,
  description: string,
  applicationUrl: string,
  postedDate: string | null,
  salaryMin?: number | null,
  salaryMax?: number | null,
  salaryUnit?: string | null,
): NormalizedJob {
  const fullText = title + ' ' + description;
  const { signal: sponsorshipSignal, evidence: sponsorshipEvidence } =
    detectSponsorshipSignal(fullText);

  return {
    externalId,
    source,
    title: title.slice(0, 200),
    company: company.slice(0, 200),
    location: location.slice(0, 200),
    remote,
    description: description.slice(0, 3000),
    applicationUrl,
    postedDate,
    salaryRange: formatSalaryRange(salaryMin, salaryMax, salaryUnit),
    roleFamily: detectRoleFamily(title, description),
    engineeringDiscipline: detectEngineeringDiscipline(title, description),
    skills: extractSkills(fullText),
    tools: extractTools(fullText),
    sponsorshipSignal,
    sponsorshipEvidence,
    cptCompatibleSignal: detectCPTCompatibility(fullText),
    optCompatibleSignal: detectOPTCompatibility(fullText),
    eligibilityWarnings: buildEligibilityWarnings(fullText),
    rawPayload: raw,
  };
}

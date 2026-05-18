export type JobSource = 'adzuna' | 'serpapi' | 'usajobs';
export type SponsorshipSignal = 'Better' | 'Unclear' | 'Risky';
export type CompatibilitySignal = 'Likely' | 'Unclear' | 'Risky';
export type RoleFamily =
  | 'internship'
  | 'co-op'
  | 'research'
  | 'campus job'
  | 'entry-level'
  | 'full-time';
export type EngineeringDiscipline =
  | 'Software/CS'
  | 'Data/AI/ML'
  | 'Electrical/Hardware'
  | 'Mechanical/Manufacturing'
  | 'Civil/Environmental'
  | 'Industrial/Systems'
  | 'Research/Lab'
  | 'Other';

export interface NormalizedJob {
  externalId: string;
  source: JobSource;
  title: string;
  company: string;
  location: string;
  remote: boolean;
  description: string;
  applicationUrl: string;
  postedDate: string | null;
  salaryRange: string | null;
  roleFamily: string;
  engineeringDiscipline: string;
  skills: string[];
  tools: string[];
  sponsorshipSignal: SponsorshipSignal;
  sponsorshipEvidence: string[];
  cptCompatibleSignal: CompatibilitySignal;
  optCompatibleSignal: CompatibilitySignal;
  eligibilityWarnings: string[];
  rawPayload: object;
}

export interface IngestResult {
  sourcesQueried: string[];
  rawJobsFound: number;
  normalizedJobsStored: number;
  duplicatesSkipped: number;
  warnings: string[];
}

export type VisaType = 'F-1 (CPT)' | 'F-1 (OPT)' | 'F-1 (STEM OPT)' | 'J-1' | 'H-1B' | 'Green Card' | 'US Citizen';
export type ExperienceLevel = 'Internship' | 'Entry Level' | 'Mid Level' | 'Senior';
export type DegreeLevel = 'Bachelor' | 'Master' | 'PhD';
export type FitTier = 'Realistic' | 'Stretch' | 'Low-Fit';
export type SponsorshipStatus = 'Strong History' | 'Occasional' | 'Rare' | 'Unknown';
export type RemotePreference = 'Remote' | 'Hybrid' | 'On-site' | 'Any';

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  major: string;
  school: string;
  degreeLevel: DegreeLevel;
  graduationDate: string;
  gpa?: number;
  currentVisa: VisaType;
  optStartDate?: string;
  stemEligible: boolean;
  sponsorshipNeeded: boolean;
  targetRoles: string[];
  targetIndustries: string[];
  skills: string[];
  experienceLevel: ExperienceLevel;
  preferredLocations: string[];
  remotePreference: RemotePreference;
  yearsOfExperience: number;
}

export interface Opportunity {
  id: string;
  title: string;
  company: string;
  companyInitials: string;
  companyColor: string;
  location: string;
  remote: boolean;
  salaryRange: string;
  matchScore: number;
  fitTier: FitTier;
  sponsorshipStatus: SponsorshipStatus;
  cptCompatible: boolean;
  optCompatible: boolean;
  h1bSponsor: boolean;
  matchReasons: string[];
  warningFlags: string[];
  recommendedAction: string;
  deadline?: string;
  postedDate: string;
  industry: string;
  experienceRequired: ExperienceLevel;
  skills: string[];
  description: string;
  applicants?: number;
}

export interface StrategyInsight {
  type: 'success' | 'warning' | 'info';
  title: string;
  body: string;
}

export interface SkillGap {
  skill: string;
  importance: 'Critical' | 'High' | 'Medium';
  suggestion: string;
}

export interface ActionItem {
  label: string;
  description: string;
  done: boolean;
}

export interface StrategyOutput {
  overallReadiness: number;
  summary: string;
  insights: StrategyInsight[];
  timelineWarnings: string[];
  skillGaps: SkillGap[];
  actionPlan: {
    thisWeek: ActionItem[];
    thisMonth: ActionItem[];
    threeMonths: ActionItem[];
  };
}

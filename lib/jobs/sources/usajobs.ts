import { NormalizedJob } from '../types';
import { normalizeJob } from '../normalize';

interface USAJobsDescriptor {
  PositionTitle: string;
  OrganizationName: string;
  PositionLocationDisplay: string;
  QualificationSummary?: string;
  UserArea?: {
    Details?: {
      JobSummary?: string;
      MajorDuties?: string[];
    };
  };
  PositionURI?: string;
  ApplyURI?: string[];
  PositionRemuneration?: Array<{
    MinimumRange: string;
    MaximumRange: string;
    RateIntervalCode: string;
  }>;
  PublicationStartDate?: string;
}

interface USAJobsItem {
  MatchedObjectId: string;
  MatchedObjectDescriptor: USAJobsDescriptor;
}

interface USAJobsResponse {
  SearchResult?: {
    SearchResultItems?: USAJobsItem[];
  };
}

const USAJOBS_QUERIES = [
  'Engineering Internship Student Trainee',
  'Computer Science Intern',
  'Pathways Intern Engineering',
];

export async function fetchUSAJobsJobs(
  apiKey: string,
  userAgent: string,
): Promise<{ jobs: NormalizedJob[]; warnings: string[] }> {
  const jobs: NormalizedJob[] = [];
  const warnings: string[] = [];

  for (const keyword of USAJOBS_QUERIES) {
    try {
      const params = new URLSearchParams({
        Keyword: keyword,
        ResultsPerPage: '25',
        WhoMayApply: 'public',
      });

      const url = `https://data.usajobs.gov/api/Search?${params.toString()}`;
      const res = await fetch(url, {
        headers: {
          'Authorization-Key': apiKey,
          'User-Agent': userAgent,
          Host: 'data.usajobs.gov',
        },
        signal: AbortSignal.timeout(12_000),
      });

      if (!res.ok) {
        warnings.push(`USAJobs HTTP ${res.status} for "${keyword}"`);
        continue;
      }

      const data: USAJobsResponse = await res.json();
      const items = data.SearchResult?.SearchResultItems ?? [];

      for (const item of items) {
        const d = item.MatchedObjectDescriptor;
        const description = [
          d.QualificationSummary,
          d.UserArea?.Details?.JobSummary,
          ...(d.UserArea?.Details?.MajorDuties ?? []),
        ]
          .filter(Boolean)
          .join('\n\n');

        const applyUrl = d.ApplyURI?.[0] ?? d.PositionURI ?? '';
        const remuneration = d.PositionRemuneration?.[0];
        const salaryMin = remuneration
          ? parseFloat(remuneration.MinimumRange)
          : null;
        const salaryMax = remuneration
          ? parseFloat(remuneration.MaximumRange)
          : null;
        const salaryUnit =
          remuneration?.RateIntervalCode?.toLowerCase() ?? null;

        jobs.push(
          normalizeJob(
            item as object,
            'usajobs',
            `usajobs-${item.MatchedObjectId}`,
            d.PositionTitle,
            d.OrganizationName,
            d.PositionLocationDisplay,
            false,
            description,
            applyUrl,
            d.PublicationStartDate
              ? d.PublicationStartDate.split('T')[0]
              : null,
            salaryMin,
            salaryMax,
            salaryUnit,
          ),
        );
      }
    } catch (err) {
      warnings.push(
        `USAJobs error for "${keyword}": ${err instanceof Error ? err.message : 'Unknown'}`,
      );
    }
  }

  return { jobs, warnings };
}

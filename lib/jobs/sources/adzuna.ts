import { NormalizedJob } from '../types';
import { normalizeJob } from '../normalize';

interface AdzunaJob {
  id: string;
  title: string;
  description: string;
  created: string;
  company: { display_name: string };
  location: { display_name: string };
  salary_min?: number;
  salary_max?: number;
  redirect_url: string;
}

interface AdzunaResponse {
  results?: AdzunaJob[];
}

const ENGINEERING_QUERIES = [
  'software engineer intern',
  'data science internship',
  'machine learning engineer entry level',
  'electrical engineer co-op',
  'mechanical engineer internship',
  'computer science intern',
];

export async function fetchAdzunaJobs(
  appId: string,
  appKey: string,
): Promise<{ jobs: NormalizedJob[]; warnings: string[] }> {
  const jobs: NormalizedJob[] = [];
  const warnings: string[] = [];

  for (const query of ENGINEERING_QUERIES.slice(0, 4)) {
    try {
      const params = new URLSearchParams({
        app_id: appId,
        app_key: appKey,
        results_per_page: '20',
        what: query,
        where: 'us',
        'content-type': 'application/json',
      });

      const url = `https://api.adzuna.com/v1/api/jobs/us/search/1?${params.toString()}`;
      const res = await fetch(url, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(10_000),
      });

      if (!res.ok) {
        warnings.push(`Adzuna HTTP ${res.status} for "${query}"`);
        continue;
      }

      const data: AdzunaResponse = await res.json();
      const results = data.results ?? [];

      for (const job of results) {
        const location = job.location.display_name ?? 'United States';
        const isRemote =
          job.title.toLowerCase().includes('remote') ||
          location.toLowerCase().includes('remote');

        jobs.push(
          normalizeJob(
            job,
            'adzuna',
            `adzuna-${job.id}`,
            job.title,
            job.company.display_name,
            location,
            isRemote,
            job.description ?? '',
            job.redirect_url,
            job.created ? job.created.split('T')[0] : null,
            job.salary_min,
            job.salary_max,
            'annual',
          ),
        );
      }
    } catch (err) {
      warnings.push(
        `Adzuna error for "${query}": ${err instanceof Error ? err.message : 'Unknown'}`,
      );
    }
  }

  return { jobs, warnings };
}

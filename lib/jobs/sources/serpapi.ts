import { NormalizedJob } from '../types';
import { normalizeJob } from '../normalize';

interface SerpApiJob {
  title: string;
  company_name: string;
  location: string;
  description?: string;
  detected_extensions?: {
    posted_at?: string;
    schedule_type?: string;
  };
  apply_options?: Array<{ link: string }>;
  job_id?: string;
}

interface SerpApiResponse {
  jobs_results?: SerpApiJob[];
  error?: string;
}

const ENGINEERING_QUERIES = [
  'software engineering internship international students',
  'data science intern co-op engineering',
  'machine learning engineer new grad entry level',
  'electrical mechanical engineering co-op internship',
];

function parseDaysAgoToDate(postedAt: string): string | null {
  const match = postedAt.match(/(\d+)\s+day/);
  if (match) {
    const d = new Date();
    d.setDate(d.getDate() - parseInt(match[1], 10));
    return d.toISOString().split('T')[0];
  }
  return null;
}

export async function fetchSerpApiJobs(
  apiKey: string,
): Promise<{ jobs: NormalizedJob[]; warnings: string[] }> {
  const jobs: NormalizedJob[] = [];
  const warnings: string[] = [];

  for (const query of ENGINEERING_QUERIES.slice(0, 3)) {
    try {
      const params = new URLSearchParams({
        engine: 'google_jobs',
        q: query,
        api_key: apiKey,
        hl: 'en',
        gl: 'us',
      });

      const url = `https://serpapi.com/search.json?${params.toString()}`;
      const res = await fetch(url, {
        signal: AbortSignal.timeout(12_000),
      });

      if (!res.ok) {
        warnings.push(`SerpApi HTTP ${res.status} for "${query}"`);
        continue;
      }

      const data: SerpApiResponse = await res.json();
      if (data.error) {
        warnings.push(`SerpApi: ${data.error}`);
        continue;
      }

      const results = data.jobs_results ?? [];

      for (const job of results) {
        const applyUrl =
          job.apply_options?.[0]?.link ??
          `https://www.google.com/search?q=${encodeURIComponent(job.title + ' ' + job.company_name)}`;

        const isRemote =
          (job.location ?? '').toLowerCase().includes('remote') ||
          job.title.toLowerCase().includes('remote');

        const postedDate = job.detected_extensions?.posted_at
          ? parseDaysAgoToDate(job.detected_extensions.posted_at)
          : null;

        const jobId =
          job.job_id ??
          `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

        jobs.push(
          normalizeJob(
            job as object,
            'serpapi',
            `serpapi-${jobId}`,
            job.title,
            job.company_name,
            job.location ?? 'United States',
            isRemote,
            job.description ?? '',
            applyUrl,
            postedDate,
            null,
            null,
            null,
          ),
        );
      }
    } catch (err) {
      warnings.push(
        `SerpApi error for "${query}": ${err instanceof Error ? err.message : 'Unknown'}`,
      );
    }
  }

  return { jobs, warnings };
}

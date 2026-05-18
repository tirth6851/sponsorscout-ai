import { NormalizedJob } from './types';

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);
}

export function dedupeJobs(jobs: NormalizedJob[]): {
  unique: NormalizedJob[];
  duplicatesSkipped: number;
} {
  const seen = new Set<string>();
  const unique: NormalizedJob[] = [];
  let duplicatesSkipped = 0;

  for (const job of jobs) {
    const key = [
      slugify(job.title),
      slugify(job.company),
      slugify(job.location.split(',')[0]),
    ].join('|');

    if (seen.has(key)) {
      duplicatesSkipped++;
    } else {
      seen.add(key);
      unique.push(job);
    }
  }

  return { unique, duplicatesSkipped };
}

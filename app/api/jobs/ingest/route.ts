import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { dedupeJobs } from '@/lib/jobs/dedupe';
import type { IngestResult } from '@/lib/jobs/types';

export const dynamic = 'force-dynamic';

export async function POST() {
  const supabase = createClient();
  if (!supabase) {
    return NextResponse.json(
      { error: 'Supabase not configured — job ingestion requires database access' },
      { status: 503 },
    );
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sourcesQueried: string[] = [];
  const warnings: string[] = [];
  const allJobs = [];

  // ── Adzuna ──────────────────────────────────────────────────────────────────
  const adzunaAppId = process.env.ADZUNA_APP_ID?.trim();
  const adzunaAppKey = process.env.ADZUNA_APP_KEY?.trim();
  if (adzunaAppId && adzunaAppKey) {
    try {
      const { fetchAdzunaJobs } = await import('@/lib/jobs/sources/adzuna');
      const result = await fetchAdzunaJobs(adzunaAppId, adzunaAppKey);
      allJobs.push(...result.jobs);
      warnings.push(...result.warnings);
      sourcesQueried.push('adzuna');
    } catch (err) {
      warnings.push(
        `Adzuna: ${err instanceof Error ? err.message : 'Failed to fetch'}`,
      );
    }
  } else {
    warnings.push('Adzuna skipped: ADZUNA_APP_ID or ADZUNA_APP_KEY not configured');
  }

  // ── SerpApi ─────────────────────────────────────────────────────────────────
  const serpApiKey = process.env.SERPAPI_API_KEY?.trim();
  if (serpApiKey) {
    try {
      const { fetchSerpApiJobs } = await import('@/lib/jobs/sources/serpapi');
      const result = await fetchSerpApiJobs(serpApiKey);
      allJobs.push(...result.jobs);
      warnings.push(...result.warnings);
      sourcesQueried.push('serpapi');
    } catch (err) {
      warnings.push(
        `SerpApi: ${err instanceof Error ? err.message : 'Failed to fetch'}`,
      );
    }
  } else {
    warnings.push('SerpApi skipped: SERPAPI_API_KEY not configured');
  }

  // ── USAJobs ─────────────────────────────────────────────────────────────────
  const usaJobsApiKey = process.env.USAJOBS_API_KEY?.trim();
  const usaJobsUserAgent = process.env.USAJOBS_USER_AGENT?.trim();
  if (usaJobsApiKey && usaJobsUserAgent) {
    try {
      const { fetchUSAJobsJobs } = await import('@/lib/jobs/sources/usajobs');
      const result = await fetchUSAJobsJobs(usaJobsApiKey, usaJobsUserAgent);
      allJobs.push(...result.jobs);
      warnings.push(...result.warnings);
      sourcesQueried.push('usajobs');
    } catch (err) {
      warnings.push(
        `USAJobs: ${err instanceof Error ? err.message : 'Failed to fetch'}`,
      );
    }
  } else {
    warnings.push('USAJobs skipped: USAJOBS_API_KEY or USAJOBS_USER_AGENT not configured');
  }

  const rawJobsFound = allJobs.length;

  if (rawJobsFound === 0) {
    const result: IngestResult = {
      sourcesQueried,
      rawJobsFound: 0,
      normalizedJobsStored: 0,
      duplicatesSkipped: 0,
      warnings: [...warnings, 'No jobs retrieved — check API key configuration'],
    };
    return NextResponse.json(result);
  }

  // ── Deduplicate ──────────────────────────────────────────────────────────────
  const { unique, duplicatesSkipped } = dedupeJobs(allJobs);

  // ── Store raw payloads ───────────────────────────────────────────────────────
  const rawRows = allJobs.map((job) => ({
    external_id: job.externalId,
    source: job.source,
    raw_payload: job.rawPayload,
  }));

  const { error: rawError } = await supabase
    .from('raw_jobs')
    .upsert(rawRows, { onConflict: 'external_id', ignoreDuplicates: true });

  if (rawError) {
    warnings.push(`raw_jobs upsert warning: ${rawError.message}`);
  }

  // ── Store normalized jobs ────────────────────────────────────────────────────
  const normalizedRows = unique.map((job) => ({
    external_id: job.externalId,
    source: job.source,
    title: job.title,
    company: job.company,
    location: job.location,
    remote: job.remote,
    description: job.description,
    application_url: job.applicationUrl,
    posted_date: job.postedDate,
    salary_range: job.salaryRange,
    role_family: job.roleFamily,
    engineering_discipline: job.engineeringDiscipline,
    skills: job.skills,
    tools: job.tools,
    sponsorship_signal: job.sponsorshipSignal,
    sponsorship_evidence: job.sponsorshipEvidence,
    cpt_compatible_signal: job.cptCompatibleSignal,
    opt_compatible_signal: job.optCompatibleSignal,
    eligibility_warnings: job.eligibilityWarnings,
    status: 'active',
  }));

  let normalizedJobsStored = 0;
  const { data: storedJobs, error: normalizedError } = await supabase
    .from('normalized_jobs')
    .upsert(normalizedRows, { onConflict: 'external_id', ignoreDuplicates: false })
    .select('id');

  if (normalizedError) {
    warnings.push(`normalized_jobs upsert warning: ${normalizedError.message}`);
  } else {
    normalizedJobsStored = storedJobs?.length ?? unique.length;
  }

  // ── Log ingestion run ────────────────────────────────────────────────────────
  await supabase.from('job_ingestion_runs').insert({
    sources_queried: sourcesQueried,
    raw_jobs_found: rawJobsFound,
    normalized_jobs_stored: normalizedJobsStored,
    duplicates_skipped: duplicatesSkipped,
    warnings,
    triggered_by: user.id,
  });

  const result: IngestResult = {
    sourcesQueried,
    rawJobsFound,
    normalizedJobsStored,
    duplicatesSkipped,
    warnings,
  };
  return NextResponse.json(result);
}

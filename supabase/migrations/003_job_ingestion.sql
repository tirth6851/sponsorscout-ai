-- ============================================================
-- SponsorScout AI — Migration 003: Job Ingestion Tables
-- Run after 001_initial_schema.sql and 002_seed_opportunities.sql
-- Does NOT destroy any existing tables.
-- ============================================================

-- ============================================================
-- Add engineering-specific columns to student_profiles
-- (safe to run even if columns already exist)
-- ============================================================
alter table public.student_profiles
  add column if not exists engineering_discipline text,
  add column if not exists role_family_preferences text[] default '{}',
  add column if not exists tools text[] default '{}',
  add column if not exists project_experience text,
  add column if not exists lab_research_experience text;

-- ============================================================
-- Add engineering classification to opportunities
-- (safe to run even if columns already exist)
-- ============================================================
alter table public.opportunities
  add column if not exists engineering_discipline text,
  add column if not exists role_family text,
  add column if not exists sponsorship_signal text default 'Unclear',
  add column if not exists application_url text;

-- ============================================================
-- job_sources
-- Tracks which external job APIs have been configured.
-- ============================================================
create table if not exists public.job_sources (
  id          uuid default uuid_generate_v4() primary key,
  name        text not null unique,  -- 'adzuna' | 'serpapi' | 'usajobs'
  enabled     boolean default true,
  last_run_at timestamptz,
  created_at  timestamptz not null default now()
);

insert into public.job_sources (name) values
  ('adzuna'), ('serpapi'), ('usajobs')
on conflict (name) do nothing;

-- ============================================================
-- raw_jobs
-- Raw API payloads stored before normalization.
-- ============================================================
create table if not exists public.raw_jobs (
  id          uuid default uuid_generate_v4() primary key,
  external_id text not null unique,
  source      text not null,
  raw_payload jsonb not null,
  ingested_at timestamptz not null default now()
);

create index if not exists raw_jobs_source_idx on public.raw_jobs (source);

-- ============================================================
-- normalized_jobs
-- Cleaned, classified engineering job listings.
-- ============================================================
create table if not exists public.normalized_jobs (
  id                    uuid default uuid_generate_v4() primary key,
  external_id           text not null unique,
  source                text not null,
  title                 text not null,
  company               text not null,
  location              text not null,
  remote                boolean default false,
  description           text,
  application_url       text,
  posted_date           date,
  salary_range          text,
  -- Engineering classification
  role_family           text,           -- 'internship' | 'co-op' | 'research' | 'campus job' | 'entry-level' | 'full-time'
  engineering_discipline text,          -- 'Software/CS' | 'Data/AI/ML' | ...
  skills                text[] default '{}',
  tools                 text[] default '{}',
  -- Sponsorship signals (not legal guarantees)
  sponsorship_signal    text default 'Unclear',  -- 'Better' | 'Unclear' | 'Risky'
  sponsorship_evidence  text[] default '{}',
  cpt_compatible_signal text default 'Unclear',  -- 'Likely' | 'Unclear' | 'Risky'
  opt_compatible_signal text default 'Unclear',
  eligibility_warnings  text[] default '{}',
  -- Status
  status                text default 'active',   -- 'active' | 'expired' | 'filled'
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index if not exists normalized_jobs_source_idx on public.normalized_jobs (source);
create index if not exists normalized_jobs_discipline_idx on public.normalized_jobs (engineering_discipline);
create index if not exists normalized_jobs_role_family_idx on public.normalized_jobs (role_family);
create index if not exists normalized_jobs_status_idx on public.normalized_jobs (status);

-- ============================================================
-- job_ingestion_runs
-- Audit log for each ingestion run.
-- ============================================================
create table if not exists public.job_ingestion_runs (
  id                      uuid default uuid_generate_v4() primary key,
  sources_queried         text[] default '{}',
  raw_jobs_found          integer default 0,
  normalized_jobs_stored  integer default 0,
  duplicates_skipped      integer default 0,
  warnings                text[] default '{}',
  triggered_by            uuid references public.profiles (id) on delete set null,
  created_at              timestamptz not null default now()
);

-- ============================================================
-- Row Level Security for new tables
-- ============================================================
alter table public.job_sources        enable row level security;
alter table public.raw_jobs           enable row level security;
alter table public.normalized_jobs    enable row level security;
alter table public.job_ingestion_runs enable row level security;

-- job_sources — any authenticated user can read
create policy "auth_job_sources_select" on public.job_sources
  for select using (auth.role() = 'authenticated');

-- raw_jobs — any authenticated user can read (no user-specific data)
create policy "auth_raw_jobs_select" on public.raw_jobs
  for select using (auth.role() = 'authenticated');

-- normalized_jobs — any authenticated user can read
create policy "auth_normalized_jobs_select" on public.normalized_jobs
  for select using (auth.role() = 'authenticated');

-- job_ingestion_runs — users can read runs they triggered
create policy "own_ingestion_runs_select" on public.job_ingestion_runs
  for select using (auth.uid() = triggered_by);

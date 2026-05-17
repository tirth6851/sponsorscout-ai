-- ============================================================
-- SponsorScout AI — Initial Schema
-- Run in Supabase SQL Editor or via: supabase db push
-- ============================================================

-- Extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- profiles
-- Thin table linked to auth.users; auto-created on signup.
-- ============================================================
create table if not exists public.profiles (
  id         uuid references auth.users (id) on delete cascade primary key,
  email      text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create profile row when a new auth user is created
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer
set search_path = public as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- student_profiles
-- One row per user, created when the 4-step profile form is submitted.
-- ============================================================
create table if not exists public.student_profiles (
  id                   uuid default uuid_generate_v4() primary key,
  user_id              uuid references public.profiles (id) on delete cascade not null unique,
  -- Personal
  full_name            text not null,
  current_location     text,
  preferred_locations  text[]    default '{}',
  remote_preference    text      default 'Any',
  -- Academic
  school               text,
  degree_level         text,
  major                text,
  graduation_date      date,
  gpa                  numeric(3, 2),
  stem_eligible        boolean   default false,
  -- Career
  target_roles         text[]    default '{}',
  target_industries    text[]    default '{}',
  experience_level     text,
  years_of_experience  integer   default 0,
  skills               text[]    default '{}',
  -- Visa / Work Auth
  current_visa         text,
  auth_start_date      date,
  auth_end_date        date,
  needs_sponsorship    text      default 'yes',  -- 'yes' | 'maybe' | 'no'
  -- Timestamps
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- ============================================================
-- opportunities
-- Seeded from USCIS data and job board integrations.
-- ============================================================
create table if not exists public.opportunities (
  id                   uuid default uuid_generate_v4() primary key,
  title                text not null,
  company              text not null,
  company_initials     text,
  company_color        text      default '#3b82f6',
  location             text not null,
  remote               boolean   default false,
  salary_range         text,
  industry             text,
  experience_required  text,
  skills               text[]    default '{}',
  description          text,
  -- Visa / sponsorship flags (sourced from USCIS H-1B Employer Data Hub)
  h1b_sponsor          boolean   default false,
  sponsorship_status   text      default 'Unknown', -- 'Strong History'|'Occasional'|'Rare'|'Unknown'
  h1b_count_2024       integer,                     -- USCIS disclosure count
  cpt_compatible       boolean   default true,
  opt_compatible       boolean   default true,
  -- Metadata
  application_url      text,
  deadline             date,
  posted_date          date      default current_date,
  status               text      default 'active',  -- 'active'|'closed'|'filled'
  applicants           integer,
  created_at           timestamptz not null default now()
);

-- ============================================================
-- saved_opportunities
-- Per-user matches with computed scores.
-- ============================================================
create table if not exists public.saved_opportunities (
  id                  uuid default uuid_generate_v4() primary key,
  user_id             uuid references public.profiles (id) on delete cascade not null,
  opportunity_id      uuid references public.opportunities (id) on delete cascade not null,
  match_score         integer,
  fit_tier            text,
  match_reasons       text[]    default '{}',
  warning_flags       text[]    default '{}',
  recommended_action  text,
  applied             boolean   default false,
  saved_at            timestamptz not null default now(),
  unique (user_id, opportunity_id)
);

-- ============================================================
-- strategy_outputs
-- One row per generation; keyed by user.
-- ============================================================
create table if not exists public.strategy_outputs (
  id                  uuid default uuid_generate_v4() primary key,
  user_id             uuid references public.profiles (id) on delete cascade not null,
  overall_readiness   integer   default 0,
  summary             text,
  insights            jsonb     default '[]',
  timeline_warnings   text[]    default '{}',
  skill_gaps          jsonb     default '[]',
  action_plan         jsonb     default '{}',
  generated_by        text      default 'deterministic',  -- 'deterministic'|'claude'
  generated_at        timestamptz not null default now()
);

-- ============================================================
-- action_items
-- Per-user, per-strategy checklist items.
-- ============================================================
create table if not exists public.action_items (
  id           uuid default uuid_generate_v4() primary key,
  user_id      uuid references public.profiles (id) on delete cascade not null,
  strategy_id  uuid references public.strategy_outputs (id) on delete cascade,
  timeframe    text not null,  -- 'thisWeek'|'thisMonth'|'threeMonths'
  label        text not null,
  description  text,
  done         boolean         default false,
  created_at   timestamptz not null default now()
);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.profiles           enable row level security;
alter table public.student_profiles   enable row level security;
alter table public.opportunities      enable row level security;
alter table public.saved_opportunities enable row level security;
alter table public.strategy_outputs   enable row level security;
alter table public.action_items       enable row level security;

-- profiles
create policy "own_profile_select" on public.profiles for select using (auth.uid() = id);
create policy "own_profile_insert" on public.profiles for insert with check (auth.uid() = id);
create policy "own_profile_update" on public.profiles for update using (auth.uid() = id);

-- student_profiles
create policy "own_student_select" on public.student_profiles for select using (auth.uid() = user_id);
create policy "own_student_insert" on public.student_profiles for insert with check (auth.uid() = user_id);
create policy "own_student_update" on public.student_profiles for update using (auth.uid() = user_id);

-- opportunities — any authenticated user can read
create policy "auth_opps_select" on public.opportunities for select using (auth.role() = 'authenticated');

-- saved_opportunities
create policy "own_saved_select" on public.saved_opportunities for select using (auth.uid() = user_id);
create policy "own_saved_insert" on public.saved_opportunities for insert with check (auth.uid() = user_id);
create policy "own_saved_update" on public.saved_opportunities for update using (auth.uid() = user_id);

-- strategy_outputs
create policy "own_strategy_select" on public.strategy_outputs for select using (auth.uid() = user_id);
create policy "own_strategy_insert" on public.strategy_outputs for insert with check (auth.uid() = user_id);

-- action_items
create policy "own_actions_select" on public.action_items for select using (auth.uid() = user_id);
create policy "own_actions_insert" on public.action_items for insert with check (auth.uid() = user_id);
create policy "own_actions_update" on public.action_items for update using (auth.uid() = user_id);

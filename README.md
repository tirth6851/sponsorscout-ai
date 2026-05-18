# SponsorScout AI

A visa-aware engineering career navigator for international students. Matches students to internships, co-ops, research roles, campus jobs, and entry-level engineering opportunities — combining real job ingestion, engineering-specific matching, sponsorship/CPT/OPT risk signals, and Groq-generated strategy.

---

## What It Does

- **Engineering discipline matching** — scores opportunities against your specific discipline (Software/CS, Data/AI/ML, Electrical/Hardware, Mechanical, Civil, Industrial, Research/Lab)
- **Role family targeting** — matches on role type: internship, co-op, research, campus job, entry-level, full-time
- **Visa-aware scoring** — ranks every opportunity through CPT/OPT compatibility, H-1B sponsorship history, and STEM eligibility
- **Sponsorship signal detection** — scans job descriptions for risky phrases ("no sponsorship", "US citizens only") and positive signals ("visa sponsorship available", "accepts OPT")
- **Real job ingestion** — fetches from Adzuna, SerpApi (Google Jobs), and USAJobs; normalizes, deduplicates, and stores
- **Groq AI strategy** — calls `llama-3.3-70b-versatile` via Groq to explain pre-ranked results and generate engineering-specific career plans; falls back to deterministic strategy
- **Demo mode** — works fully without any credentials; mock engineering opportunities with live scoring

---

## Important Architecture Rule

**Groq is NOT the recommender and NOT the job finder.**

- Jobs are fetched, normalized, scored, and ranked by the app itself
- Groq only receives the pre-ranked structured results and generates explanations + action plans
- Groq must not invent sponsorship facts or rerank results

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v3 — custom dark theme, glassmorphism |
| Database | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Auth (email/password) |
| AI | Groq API (`llama-3.3-70b-versatile`) |
| Job APIs | Adzuna, SerpApi (Google Jobs), USAJobs |
| Icons | Lucide React |
| Font | Inter via `next/font/google` |

---

## Project Structure

```
app/
├── (auth)/
│   ├── layout.tsx           # Centered dark layout for auth pages
│   ├── login/page.tsx       # Email/password login; demo banner if unconfigured
│   └── signup/page.tsx      # Registration with email confirmation flow
├── api/
│   ├── auth/callback/       # Supabase OAuth code exchange
│   ├── jobs/ingest/         # POST: trigger job ingestion from all sources
│   ├── opportunities/       # GET: scored opportunity list (real or mock)
│   ├── profile/             # GET/POST: student profile
│   └── strategy/            # GET: Groq-generated or deterministic strategy
├── dashboard/page.tsx       # Opportunity grid with filter/sort; fetches /api/opportunities
├── profile/page.tsx         # 5-step wizard; POSTs to /api/profile on completion
├── strategy/page.tsx        # Career strategy view; fetches /api/strategy
└── layout.tsx               # Root layout (Inter font, dark background)

lib/
├── matching.ts              # 100-point visa-aware engineering match scoring
├── strategy.ts              # Deterministic engineering strategy generation (no API calls)
├── groq.ts                  # Server-only Groq client (lazy singleton, key trimmed)
├── mock-data.ts             # Demo fallback data (engineering-focused)
├── env.ts                   # Env helpers: isSupabaseConfigured(), isGroqConfigured(), etc.
├── types.ts                 # Shared TypeScript interfaces (includes engineering fields)
├── utils.ts                 # cn(), formatDate(), matchScoreColor(), etc.
├── supabase/
│   ├── client.ts            # Browser Supabase client (null-safe)
│   └── server.ts            # Server Supabase client (SSR cookie helpers)
└── jobs/                    # Job ingestion pipeline
    ├── types.ts             # NormalizedJob, IngestResult interfaces
    ├── normalize.ts         # Normalization + engineering classification
    ├── sponsorship-signals.ts  # Risky/Better/Unclear signal detection
    ├── dedupe.ts            # Deduplication by title+company+location
    └── sources/
        ├── adzuna.ts        # Adzuna API adapter
        ├── serpapi.ts       # SerpApi (Google Jobs) adapter
        └── usajobs.ts       # USAJobs API adapter

supabase/migrations/
├── 001_initial_schema.sql   # Core tables, RLS policies, auth trigger
├── 002_seed_opportunities.sql  # 8 seed engineering opportunities
└── 003_job_ingestion.sql    # job_sources, raw_jobs, normalized_jobs, job_ingestion_runs
                             # Also adds engineering columns to student_profiles + opportunities
```

---

## Engineering Discipline Classification

Opportunities are automatically classified into one of:

| Discipline | Example Keywords Detected |
|---|---|
| Software/CS | software engineer, full stack, frontend, backend, devops, cloud |
| Data/AI/ML | data scientist, machine learning, NLP, computer vision, LLM |
| Electrical/Hardware | electrical engineer, FPGA, embedded, PCB, VLSI, firmware |
| Mechanical/Manufacturing | mechanical engineer, CAD, SolidWorks, process engineer, robotics |
| Civil/Environmental | civil engineer, structural, geotechnical, transportation |
| Industrial/Systems | industrial engineer, supply chain, operations research |
| Research/Lab | research intern, lab assistant, graduate researcher, PhD intern |
| Other | Everything else |

---

## Role Family Classification

| Role Family | Detected When |
|---|---|
| internship | "intern", "internship", "summer" |
| co-op | "co-op", "coop", "cooperative education" |
| research | "research engineer", "research scientist", "PhD intern" |
| campus job | "on-campus", "student worker", "research assistant", "TA" |
| entry-level | "entry level", "junior", "new grad", "recent graduate" |
| full-time | "full-time", "permanent", "senior", "staff" |

---

## Match Scoring Algorithm

Located in `lib/matching.ts`. Pure TypeScript, no external calls.

| Category | Points | Logic |
|---|---|---|
| Authorization compatibility | 30 | CPT/OPT support, sponsorship signals, hard penalties for incompatible |
| Sponsorship history | 18 | Strong History=18, Occasional=9, Rare=3 |
| Skills overlap | 22 | Fuzzy substring match ratio × 22 (includes tools) |
| Location / remote | 10 | Exact city or remote=10, same state=5 |
| Industry alignment | 8 | Exact industry or discipline match |
| Engineering discipline | 7 | Discipline match bonus |
| Role family | 5 | Role family preference match |
| Experience level | +5 | Exact match bonus; penalties for overqualification |

**Fit tiers**: Realistic ≥ 75 · Stretch ≥ 50 · Low-Fit < 50

---

## Sponsorship Signal Detection

Located in `lib/jobs/sponsorship-signals.ts`. Scans job description text for:

**Risky phrases** (signal = `Risky`):
- "no sponsorship", "does not sponsor", "us citizen only", "security clearance required", "must not require sponsorship"

**Better phrases** (signal = `Better`):
- "visa sponsorship available", "h-1b sponsorship", "accepts OPT", "accepts CPT", "international students encouraged"

**Unclear**: generic language or no visa mention at all.

> **Important**: These are signals for strategic planning only, not legal guarantees. Always verify directly with the employer.

---

## Job Ingestion Pipeline

### POST `/api/jobs/ingest`

Requires authenticated user. Queries job APIs in order:

1. **Adzuna** — primary engineering job source (internships, entry-level, co-ops)
2. **SerpApi** — Google Jobs coverage booster (broader keyword matching)
3. **USAJobs** — US government/lab engineering opportunities (Pathways Intern, Student Trainee)

Each source adapter fetches → the normalizer classifies discipline, role family, skills, tools, and sponsorship signals → deduplication by title+company+location removes near-duplicates → raw payloads stored in `raw_jobs` → normalized jobs stored in `normalized_jobs`.

Returns:
```json
{
  "sourcesQueried": ["adzuna", "serpapi", "usajobs"],
  "rawJobsFound": 150,
  "normalizedJobsStored": 120,
  "duplicatesSkipped": 30,
  "warnings": []
}
```

### Fallback behavior

The dashboard (`/api/opportunities`) prefers `normalized_jobs` when available. If no normalized jobs exist, it falls back to the seeded `opportunities` table. If Supabase is not configured, it falls back to demo mock data scored by the real algorithm.

---

## Strategy Generation

When `GROQ_API_KEY` is set, `/api/strategy` calls Groq with:
1. The student's engineering profile (discipline, role preferences, skills, tools, visa)
2. The pre-ranked top 8 opportunities (already scored and ordered by the app)

Groq explains the ranked results and generates a personalized engineering career plan. The UI badge says "Generated by Groq AI". If Groq is not configured or fails, the deterministic fallback runs from `lib/strategy.ts` and the badge says "Algorithmic Strategy".

**Groq rules (enforced in the prompt)**:
- Must NOT invent or guess sponsorship facts
- Must NOT rerank the provided opportunities
- Must focus on engineering career strategy, discipline-specific advice, and visa timeline

---

## Environment Variables

### Local development

Create `.env.local` in the project root:

```bash
# Supabase — required for auth + real data; omit for demo mode
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...

# Supabase service role — server-only, never expose to client
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...

# Groq — server-only, never expose to client
GROQ_API_KEY=gsk_...
GROQ_MODEL=llama-3.3-70b-versatile

# Job APIs — server-only, all optional (app uses demo data if missing)
ADZUNA_APP_ID=
ADZUNA_APP_KEY=
SERPAPI_API_KEY=
USAJOBS_API_KEY=
USAJOBS_USER_AGENT=

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Demo mode**: If `NEXT_PUBLIC_SUPABASE_URL` is missing, the app runs in full demo mode — all pages work with engineering-focused mock data scored by the real algorithm.

### Vercel deployment

Add each variable for both **Production** and **Preview** environments.

| Variable | Source |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase Dashboard → API Keys → publishable |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → API Keys → service_role |
| `GROQ_API_KEY` | console.groq.com → API Keys |
| `GROQ_MODEL` | `llama-3.3-70b-versatile` |
| `ADZUNA_APP_ID` | developer.adzuna.com |
| `ADZUNA_APP_KEY` | developer.adzuna.com |
| `SERPAPI_API_KEY` | serpapi.com |
| `USAJOBS_API_KEY` | developer.usajobs.gov (register email as API key) |
| `USAJOBS_USER_AGENT` | Your email address (required by USAJobs API) |
| `NEXT_PUBLIC_APP_URL` | Your Vercel deployment URL |

> **Important**: Do NOT set `STATIC_EXPORT=true` in Vercel. All job API routes require server-side rendering.

---

## Database Schema

Run migrations in order in the Supabase SQL Editor:

1. `supabase/migrations/001_initial_schema.sql` — core tables, RLS
2. `supabase/migrations/002_seed_opportunities.sql` — 8 engineering seed opportunities
3. `supabase/migrations/003_job_ingestion.sql` — job ingestion tables + engineering columns

### Tables

| Table | Purpose |
|---|---|
| `profiles` | Thin auth-linked row; auto-created on signup |
| `student_profiles` | Full profile: visa, engineering discipline, skills, tools, role preferences |
| `opportunities` | Seeded engineering job listings |
| `normalized_jobs` | Real jobs from APIs, classified and deduplicated |
| `raw_jobs` | Raw API payloads before normalization |
| `job_sources` | Tracks configured API sources |
| `job_ingestion_runs` | Audit log for ingestion operations |
| `saved_opportunities` | Per-user bookmarks with match scores |
| `strategy_outputs` | Generated strategy JSON per user |
| `action_items` | Per-user action plan items |

---

## Routes

| Route | Auth required | Description |
|---|---|---|
| `/` | No | Landing page |
| `/login` | No | Sign in |
| `/signup` | No | Create account |
| `/profile` | Yes | 5-step engineering profile wizard |
| `/dashboard` | Yes | Scored engineering opportunity grid |
| `/strategy` | Yes | Personalised engineering career strategy |
| `POST /api/jobs/ingest` | Yes | Trigger job ingestion from APIs |

---

## Current Limitations

| Limitation | Notes |
|---|---|
| Ingestion is manual | No scheduled ingestion; must call `POST /api/jobs/ingest` manually |
| No embeddings | Matching uses keyword-based scoring, not vector similarity |
| No learning-to-rank | Scores are hand-tuned; no ML-based ranking model |
| Action item persistence | Checkbox state is session-only; needs write to `action_items` table |
| No password reset | No `/forgot-password` page |
| No rate limiting | Add `@upstash/ratelimit` before public launch |

---

## Future Roadmap

- **Scheduled ingestion**: Cron job to refresh jobs daily/weekly
- **Embeddings**: Use text embeddings for semantic skill matching beyond keyword overlap
- **Feedback loop**: Collect application outcomes to improve match scores
- **Learning-to-rank**: Train a small model on feedback data to replace hand-tuned weights
- **More engineering job sources**: ASEE, IEEE Job Board, research lab portals
- **Employer sponsorship database**: Integrate USCIS H-1B Employer Data Hub for company-level sponsorship confidence scores

---

## Legal Notice

Match scores, sponsorship signals, and strategic recommendations are provided for planning purposes only and are not guarantees of sponsorship or employment. Always verify sponsorship policies directly with employers and consult a licensed immigration attorney before making immigration-related decisions.

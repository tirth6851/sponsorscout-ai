# SponsorScout AI — Handover Document

This document captures the full project state, architecture decisions, bugs fixed, and remaining work for the next developer or AI assistant.

---

## 1. Project Direction

**SponsorScout AI** has been repositioned from a generic international student career navigator to a focused **visa-aware engineering career navigator** for international engineering students in the US.

### Target users
F-1 (CPT/OPT/STEM OPT), J-1, and H-1B visa holders studying engineering disciplines, searching for:
- Internships and co-ops (CPT-compatible)
- Research roles (on-campus and industry)
- Entry-level engineering positions
- Campus/part-time jobs

### Core product rule
**Groq is NOT the recommender and NOT the job finder.**
- The app finds, normalizes, scores, and ranks jobs itself
- Groq only receives pre-ranked structured results and generates explanations + action plans
- Groq must not invent sponsorship facts or reorder results

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v3 — custom dark theme, glassmorphism |
| Database | Supabase (PostgreSQL + Row Level Security) |
| Auth | Supabase Auth (email/password) |
| AI | Groq API (`llama-3.3-70b-versatile`) |
| Job APIs | Adzuna, SerpApi (Google Jobs), USAJobs |
| Deployment | Vercel (primary), GitHub Pages (static demo) |

---

## 3. What Has Been Implemented

### Application routes
- `/` — Landing page (updated for engineering focus)
- `/login` — Email/password login with Supabase; demo banner if unconfigured
- `/signup` — Registration with email confirmation
- `/profile` — **5-step** engineering wizard; posts to `/api/profile`
- `/dashboard` — Scored opportunity grid; prefers normalized jobs, falls back to seeded, then mock
- `/strategy` — Engineering career strategy; Groq-powered with deterministic fallback

### API routes (all `force-dynamic`)
- `GET /api/auth/callback` — Supabase OAuth exchange
- `GET /api/opportunities` — Scored engineering opportunities (normalized > seeded > demo)
- `GET|POST /api/profile` — Read and upsert student profile (includes engineering fields)
- `GET /api/strategy` — Groq engineering strategy with deterministic fallback
- `POST /api/jobs/ingest` — **New** — triggers job ingestion from Adzuna + SerpApi + USAJobs

### Core libraries
- `lib/matching.ts` — 100-point deterministic scoring (updated to include engineering discipline +7 and role family +5)
- `lib/strategy.ts` — Engineering-specific deterministic strategy (no API calls)
- `lib/groq.ts` — Server-only Groq singleton
- `lib/env.ts` — Env helpers including new job API key helpers
- `lib/types.ts` — Updated with `EngineeringDiscipline`, `RoleFamilyPreference`, engineering fields on `StudentProfile` and `Opportunity`

### Job ingestion pipeline
- `lib/jobs/types.ts` — `NormalizedJob`, `IngestResult` interfaces
- `lib/jobs/sponsorship-signals.ts` — Detects Better/Unclear/Risky signals from job text
- `lib/jobs/normalize.ts` — Normalizes any API payload into `NormalizedJob` + detects engineering discipline/role family/skills/tools
- `lib/jobs/dedupe.ts` — Deduplicates by title+company+location
- `lib/jobs/sources/adzuna.ts` — Adzuna API adapter (4 engineering queries)
- `lib/jobs/sources/serpapi.ts` — SerpApi Google Jobs adapter (3 engineering queries)
- `lib/jobs/sources/usajobs.ts` — USAJobs adapter (3 keyword searches)

### Database migrations
- `001_initial_schema.sql` — Original tables, RLS, auth trigger
- `002_seed_opportunities.sql` — 8 seed opportunities (updated to engineering-focused)
- `003_job_ingestion.sql` — **New** — adds:
  - `job_sources` table
  - `raw_jobs` table
  - `normalized_jobs` table
  - `job_ingestion_runs` table
  - `engineering_discipline`, `role_family_preferences`, `tools`, `project_experience` columns to `student_profiles`
  - `engineering_discipline`, `role_family`, `sponsorship_signal`, `application_url` columns to `opportunities`

### UI changes
- Landing `Hero` — updated for engineering focus, new floating pill copy
- Landing `FeaturesSection` — engineering discipline matching as first feature, Groq described as explanation layer
- Profile wizard — 5 steps (added Step 3: Engineering with discipline selector, role family multi-select, tools, project experience)
- Mock data — updated to engineering-focused opportunities with `engineeringDiscipline` and `roleFamily` fields

---

## 4. Issues Fixed (from Previous Handover)

All previously fixed issues remain resolved. See Section 5 of the previous HANDOVER.md.

---

## 5. New Environment Variables

| Variable | Where to get it | Notes |
|---|---|---|
| `ADZUNA_APP_ID` | developer.adzuna.com → My Apps | Free tier available |
| `ADZUNA_APP_KEY` | developer.adzuna.com → My Apps | Free tier available |
| `SERPAPI_API_KEY` | serpapi.com → Dashboard | 100 free searches/month |
| `USAJOBS_API_KEY` | developer.usajobs.gov → Register | Use your email address |
| `USAJOBS_USER_AGENT` | Same email as API key | Required by USAJobs API |

All job API keys are **server-only** — never expose with `NEXT_PUBLIC_` prefix.

Missing API keys **do not crash the build or app** — the ingest route skips unconfigured sources and returns a warning in the response.

---

## 6. Database Changes Required

Run migration `003_job_ingestion.sql` in the Supabase SQL Editor **after** migrations 001 and 002.

The migration is **additive only** — it does not drop or modify any existing column in a breaking way. It uses `add column if not exists` for all new columns.

---

## 7. How Job Ingestion Works

1. `POST /api/jobs/ingest` (requires authenticated user)
2. For each configured API (Adzuna → SerpApi → USAJobs):
   - Fetch engineering job results
   - Normalize into `NormalizedJob` shape
   - Detect engineering discipline, role family, skills, tools, sponsorship signals
3. Deduplicate by title+company+location slug
4. Upsert raw payloads to `raw_jobs`
5. Upsert normalized data to `normalized_jobs`
6. Log the run to `job_ingestion_runs`
7. Return `IngestResult` summary

The dashboard (`/api/opportunities`) queries `normalized_jobs` first. If empty, falls back to `opportunities` (seeded). If Supabase is not configured, falls back to mock data.

---

## 8. Matching/Scoring Architecture

Located in `lib/matching.ts`. Deterministic, no external calls.

| Category | Points |
|---|---|
| Authorization compatibility (CPT/OPT/sponsorship signal) | 30 |
| Sponsorship history quality | 18 |
| Skills + tools overlap | 22 |
| Location / remote | 10 |
| Industry / discipline alignment | 8 |
| Engineering discipline match | 7 |
| Role family preference match | 5 |
| Experience level | +5 bonus / penalties |

Hard penalties: -40 points for risky sponsorship signal or incompatible CPT/OPT.
Total possible: 105 (capped at 100). Fit tiers: Realistic ≥ 75 · Stretch ≥ 50 · Low-Fit < 50.

---

## 9. Groq Strategy Architecture

`/api/strategy` passes to Groq:
1. Student profile (visa, engineering discipline, role family preferences, skills, tools, graduation date)
2. Pre-ranked top 8 opportunities (match score, fit tier, sponsorship status, discipline, role family, match reasons, warnings)

Groq is explicitly instructed to:
- NOT invent sponsorship facts
- NOT rerank the results
- Focus on engineering career strategy and visa timeline

Falls back to `lib/strategy.ts` (deterministic, engineering-aware) if Groq is unconfigured or fails.

---

## 10. Build Safety Rules

All of these are enforced:
- All API routes have `export const dynamic = 'force-dynamic'` — no external calls during `npm run build`
- Missing API keys do not crash the build or app — they trigger warnings in the ingest response
- `STATIC_EXPORT=true` is only for GitHub Pages — do NOT set in Vercel
- `GROQ_API_KEY` and all job API keys are server-only (no `NEXT_PUBLIC_` prefix)
- `SUPABASE_SERVICE_ROLE_KEY` is server-only
- Demo mode works without any env vars

---

## 11. What Needs to Be Done Manually

### In Supabase
- [ ] Run `003_job_ingestion.sql` migration in the SQL Editor
- [ ] Optionally update `002_seed_opportunities.sql` rows to add `engineering_discipline` and `role_family` values to existing seeded opportunities

### In Vercel
- [ ] Add new env vars: `ADZUNA_APP_ID`, `ADZUNA_APP_KEY`, `SERPAPI_API_KEY`, `USAJOBS_API_KEY`, `USAJOBS_USER_AGENT`
- [ ] Do NOT set `STATIC_EXPORT=true`

### Trigger first ingestion
After deploying and configuring API keys:
```bash
curl -X POST https://your-app.vercel.app/api/jobs/ingest \
  -H "Cookie: <your-session-cookie>"
```
Or add a UI button in the dashboard for admin users to trigger ingestion.

---

## 12. Current Limitations

| Limitation | Notes |
|---|---|
| Manual ingestion only | No scheduled cron — must call `POST /api/jobs/ingest` manually |
| Keyword-based matching | No vector embeddings or semantic similarity |
| No learning-to-rank | Hand-tuned weights; no ML model |
| Action item persistence | Checkbox state is session-only |
| No password reset | No `/forgot-password` page |
| No rate limiting | Add `@upstash/ratelimit` before public launch |
| No ingestion UI | Admin must use curl/Postman to trigger ingestion |

---

## 13. Future ML/Embedding Roadmap

1. **Text embeddings**: Use `text-embedding-3-small` (OpenAI) or `nomic-embed-text` (free) to embed job descriptions and student profiles for semantic matching beyond keyword overlap
2. **Scheduled ingestion**: Add a Supabase Edge Function or Vercel Cron to refresh jobs daily
3. **Feedback collection**: Store application outcomes (applied, interviewed, offered) per opportunity
4. **Learning-to-rank**: Train a small XGBoost or neural ranking model on accumulated feedback data to replace the hand-tuned scoring weights
5. **USCIS H-1B database**: Integrate the public USCIS H-1B Employer Data Hub for company-level historical sponsorship confidence scores
6. **More sources**: ASEE job board, IEEE Jobs, GovJobs, university co-op portals, national lab postings

---

## 14. Important Safety Notes

| Rule | Reason |
|---|---|
| Never commit `.env.local` | Contains API keys; gitignored |
| Never use `NEXT_PUBLIC_GROQ_API_KEY` | Client bundle exposes it to everyone |
| Never use `NEXT_PUBLIC_ADZUNA_*` etc. | Same — server-only keys |
| Never use `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` | Bypasses all RLS |
| `STATIC_EXPORT=true` is for GitHub Pages only | Setting on Vercel breaks all API routes |
| SponsorScout AI is not legal immigration advice | Always show disclaimer; always recommend consulting an attorney |
| Groq must not invent sponsorship facts | This is enforced in the prompt but must be maintained in future prompt changes |

# SponsorScout AI

A visa-aware career navigator for international students. Matches students to job opportunities based on sponsorship history, CPT/OPT/H-1B compatibility, skills, and location preference — with a deterministic match scoring engine and an AI-ready strategy layer.

---

## What It Does

- **Visa-aware matching** — scores each opportunity against the student's visa status, sponsorship need, CPT/OPT compatibility, and STEM eligibility
- **Deterministic strategy** — generates a personalised career plan (readiness meter, timeline warnings, skill gaps, 30/60/90-day action plan) without any external API calls
- **Claude AI ready** — the strategy API route has a guarded hook for Claude API integration; the UI correctly labels output as "Algorithmic Strategy" until the Anthropic API is actually called
- **Demo mode** — works fully without Supabase or Anthropic credentials; mock data with live scoring is used as a fallback
- **Auth + data isolation** — Supabase Auth (email/password) with Row Level Security policies ensuring each user sees only their own data

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v3 — custom dark theme, glassmorphism |
| Database | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Auth (email/password) |
| AI | Anthropic Claude API (wired but requires `ANTHROPIC_API_KEY`) |
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
│   ├── opportunities/       # GET: scored opportunity list (real or mock)
│   ├── profile/             # GET/POST: student profile
│   └── strategy/            # GET: deterministic or Claude-generated strategy
├── dashboard/page.tsx       # Opportunity grid with filter/sort; fetches /api/opportunities
├── profile/page.tsx         # 4-step wizard; POSTs to /api/profile on completion
├── strategy/page.tsx        # Career strategy view; fetches /api/strategy
└── layout.tsx               # Root layout (Inter font, dark background)

lib/
├── matching.ts              # 100-point visa-aware match scoring algorithm
├── strategy.ts              # Deterministic strategy generation (no API calls)
├── mock-data.ts             # Demo fallback data (used when Supabase is not configured)
├── env.ts                   # SUPABASE_CONFIGURED, ANTHROPIC_CONFIGURED flags
├── types.ts                 # Shared TypeScript interfaces
├── utils.ts                 # cn(), formatDate(), matchScoreColor(), etc.
└── supabase/
    ├── client.ts            # Browser Supabase client (null-safe)
    └── server.ts            # Server Supabase client (SSR cookie helpers)

middleware.ts                # Protects /dashboard, /strategy, /profile → /login

supabase/migrations/
├── 001_initial_schema.sql   # Tables, RLS policies, auth trigger
└── 002_seed_opportunities.sql  # 8 seed opportunities with USCIS H-1B data

components/
├── dashboard/
│   ├── OpportunityCard.tsx  # Card with expand, match reasons, Apply Now link
│   ├── FilterBar.tsx        # Tier filter + sort dropdown (fully wired)
│   └── MatchScore.tsx       # Score circle and progress bar
├── layout/
│   ├── Navbar.tsx           # Auth-aware nav (Sign In/Out, user email)
│   └── Footer.tsx
└── landing/                 # Hero, Features, Stats, HowItWorks, CTA sections
```

---

## Match Scoring Algorithm

Located in `lib/matching.ts`. Pure TypeScript, no external calls.

| Category | Points | Logic |
|---|---|---|
| Authorization compatibility | 35 | CPT/OPT support (+20), H-1B sponsor when needed (+15), incompatible = hard penalty |
| Sponsorship history | 20 | Strong History=20, Occasional=10, Rare=3 |
| Skills overlap | 25 | Fuzzy substring match ratio × 25 |
| Location / remote | 12 | Exact city or remote=12, same state=6 |
| Industry alignment | 8 | Exact industry match |
| Experience level | 5 | Exact match bonus; penalty for 2+ levels above student |

**Fit tiers**: Realistic ≥ 75 · Stretch ≥ 50 · Low-Fit < 50

---

## Strategy Generation

Located in `lib/strategy.ts`. Runs deterministically from profile + scored opportunities.

- **Overall readiness** — base 40 + bonuses for Realistic matches, STEM eligibility, skill breadth, graduation timeline
- **Summary** — personalised text referencing the student's name, scores, and visa status
- **Insights** — 4 cards: best matches, timeline warnings, skill gaps, action priorities
- **Timeline warnings** — visa-type-specific deadlines (OPT filing window, H-1B cap season, STEM OPT extension)
- **Skill gaps** — top 3 skills most common in missed opportunities that the student lacks
- **Action plan** — this week / this month / next 3 months with concrete, personalised tasks

When `ANTHROPIC_API_KEY` is set, the `/api/strategy` route will call Claude instead and label the output "Generated by Claude AI".

---

## Database Schema

Run migrations in order against your Supabase project:

```bash
supabase db push
# or paste each migration into the Supabase SQL Editor
```

### Tables

| Table | Purpose |
|---|---|
| `profiles` | Thin auth-linked row; auto-created on signup via trigger |
| `student_profiles` | All form data: visa, degree, skills, career goals |
| `opportunities` | Job listings with USCIS H-1B sponsorship data |
| `saved_opportunities` | Per-user bookmarks with cached match scores |
| `strategy_outputs` | Generated strategy JSON per user |
| `action_items` | Per-user action plan items with completion state |

All tables have Row Level Security enabled. Users can only read and write their own rows. Opportunities are readable by all authenticated users.

---

## Environment Variables

Create a `.env.local` file:

```bash
# Supabase (required for auth + real data; omit for demo mode)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key   # only needed for admin scripts

# Anthropic (optional; deterministic strategy is used as fallback)
ANTHROPIC_API_KEY=sk-ant-...
```

**Demo mode**: If `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` are absent, the app runs in full demo mode — all pages work, mock data is scored with the real algorithm, and auth pages show an explanatory banner.

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run both migrations in `supabase/migrations/` via the SQL Editor
3. Add env vars to `.env.local`
4. `npm run build && npm start`

---

## Routes

| Route | Auth required | Description |
|---|---|---|
| `/` | No | Landing page |
| `/login` | No (redirects if authed) | Sign in |
| `/signup` | No (redirects if authed) | Create account |
| `/profile` | Yes | 4-step profile wizard |
| `/dashboard` | Yes | Scored opportunity grid |
| `/strategy` | Yes | Personalised career strategy |

---

## What's Working

- [x] Supabase Auth (email/password) with session refresh middleware
- [x] Profile form saves all 4 steps to `student_profiles`
- [x] Dashboard fetches from `/api/opportunities` — no mock imports in page components
- [x] Strategy page fetches from `/api/strategy` — labelled correctly based on `generatedBy`
- [x] Match scoring runs on every page load with the real algorithm
- [x] Sort by match score, date, salary, and company (fully wired)
- [x] Apply Now links to `application_url` or LinkedIn Jobs search fallback
- [x] Navbar shows user email and Sign Out when authenticated
- [x] Loading skeletons, error states, profile-missing CTAs on all data pages
- [x] Legal disclaimer banners on dashboard and strategy pages
- [x] Full demo mode when Supabase env vars are absent

---

## Remaining Gaps

| Gap | Notes |
|---|---|
| Claude AI strategy | `generateClaudeStrategy()` is a placeholder — set `ANTHROPIC_API_KEY` and implement in `app/api/strategy/route.ts` |
| Action item persistence | Checkbox state is session-only; needs write to `action_items` table |
| Password reset | No `/forgot-password` page yet |
| Footer resource links | All point to `#`; replace with USCIS.gov, EducationUSA.state.gov, etc. |
| Rate limiting | Add `@upstash/ratelimit` before exposing Claude route publicly |
| Real job listings | Seed data uses illustrative values; integrate a real job API for live postings |
| Landing page stat citations | "73% of international students…" and similar claims need sourced references |
| Unbuilt advertised features | "Peer Network Signals" and "Real-Time Opportunity Signals" are in FeaturesSection but not implemented |

---

## Sponsorship Data

Seed data in `supabase/migrations/002_seed_opportunities.sql` references H-1B approval counts from the [USCIS H-1B Employer Data Hub](https://www.uscis.gov/tools/reports-and-studies/h-1b-employer-data-hub) (public dataset, updated annually). Salary ranges are illustrative estimates from Levels.fyi and Glassdoor.

---

## Legal Notice

Match scores and sponsorship data are provided for strategic planning purposes only and are not guarantees of sponsorship or employment. Always verify sponsorship policies directly with employers and consult a licensed immigration attorney before making immigration-related decisions.

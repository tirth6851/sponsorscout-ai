# SponsorScout AI — Handover Document

This document captures the full project state, implementation history, bugs hit, fixes applied, and the remaining checklist for the next developer or AI assistant.

---

## 1. Project Overview

**SponsorScout AI** is a visa-aware career navigator for international students in the United States.

- **Target users:** F-1, OPT, STEM OPT, J-1, and H-1B visa holders searching for jobs at companies that sponsor work authorisation
- **Core MVP goal:** Help international students avoid wasting time applying to companies that won't sponsor them, by scoring opportunities against their specific visa situation, skills, and location preferences
- **Tech stack:**

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v3 — custom dark theme, glassmorphism |
| Database | Supabase (PostgreSQL + Row Level Security) |
| Auth | Supabase Auth (email/password) |
| AI | Groq API (`llama-3.3-70b-versatile`) |
| Deployment | Vercel (primary), GitHub Pages (optional static export) |
| Icons | Lucide React |
| Font | Inter via `next/font/google` |

---

## 2. What We Originally Wanted to Build

- **4 main routes:** `/` (landing), `/profile` (intake wizard), `/dashboard` (opportunity grid), `/strategy` (AI career plan)
- **Profile intake:** 4-step wizard collecting visa type, degree, skills, target roles, and locations — saved to Supabase `student_profiles`
- **Opportunity matching:** Scored list of job opportunities ranked by a 100-point visa-aware algorithm
- **Sponsorship-aware scoring:** Weights CPT/OPT compatibility, H-1B sponsorship history (from USCIS data), skills overlap, location, industry, and experience level
- **Groq-powered strategy:** `/api/strategy` calls `llama-3.3-70b-versatile` to generate a personalised career plan (readiness score, insights, skill gaps, 30/60/90-day action items)
- **Supabase auth + database:** Email/password login, Row Level Security so users only see their own data
- **Vercel deployment:** Primary production target with server-side rendering and API routes
- **Demo mode:** Full app works without any env vars — uses mock data with live scoring

---

## 3. What Has Been Implemented

### Application routes
- `/` — Landing page (hero, features, stats, how-it-works, CTA)
- `/login` — Email/password login with Supabase; shows demo banner if unconfigured
- `/signup` — Registration with email confirmation flow
- `/profile` — 4-step wizard; posts to `/api/profile` on completion
- `/dashboard` — Scored opportunity grid with filter/sort; fetches `/api/opportunities`
- `/strategy` — Career strategy view; fetches `/api/strategy`

### API routes (all `force-dynamic`)
- `GET /api/auth/callback` — Supabase OAuth code-for-session exchange
- `GET /api/opportunities` — Returns scored opportunities (demo mode or real DB)
- `GET|POST /api/profile` — Read and upsert student profile
- `GET /api/strategy` — Groq AI strategy (falls back to deterministic if Groq unavailable)

### Core libraries
- `lib/matching.ts` — 100-point deterministic visa-aware scoring algorithm
- `lib/strategy.ts` — Deterministic strategy generation (no external API calls)
- `lib/groq.ts` — Server-only Groq singleton client; trims API key to handle copy-paste spaces
- `lib/env.ts` — Typed env helpers: `isSupabaseConfigured()`, `isGroqConfigured()`, `getSupabaseUrl()`, `getSupabasePublishableKey()`, `getGroqApiKey()` — all values `.trim()`ed
- `lib/supabase/client.ts` — Browser Supabase client (null-safe; accepts both `PUBLISHABLE_KEY` and legacy `ANON_KEY`)
- `lib/supabase/server.ts` — Server Supabase client with SSR cookie helpers
- `lib/mock-data.ts` — Demo fallback data (Priya Sharma profile, 8 sample opportunities)

### Auth + middleware
- `middleware.ts` — Protects `/dashboard`, `/strategy`, `/profile`; redirects unauthenticated users to `/login?next=...`; skips entirely in demo mode

### Database
- `supabase/migrations/001_initial_schema.sql` — Tables (`profiles`, `student_profiles`, `opportunities`, `saved_opportunities`, `strategy_outputs`, `action_items`), RLS policies, auth trigger
- `supabase/migrations/002_seed_opportunities.sql` — 8 seed opportunities with USCIS H-1B counts

### Config and CI
- `next.config.js` — Vercel-first; static export only when `STATIC_EXPORT=true` is set
- `.github/workflows/deploy.yml` — GitHub Pages build with `STATIC_EXPORT=true`
- `CLAUDE.md` — Instructs AI assistants to always open a PR after every push

---

## 4. Issues We Hit

### Issue 1: Groq `invalid_api_key` error during Vercel build
- **Symptom:** Vercel build failed with `type: "invalid_request_error", code: "invalid_api_key"`
- **Cause 1:** API routes had no `export const dynamic = 'force-dynamic'`, so Next.js statically pre-rendered them at build time, triggering live Groq calls
- **Cause 2:** `GROQ_CONFIGURED` incorrectly required `NEXT_PUBLIC_SUPABASE_URL` to be set alongside `GROQ_API_KEY`
- **Cause 3:** `GROQ_API_KEY` was read without `.trim()`, so a trailing space from copy-paste produced an invalid key

### Issue 2: `output: 'export'` incompatible with API routes
- **Symptom:** `Error: export const dynamic = "force-dynamic" on page "/api/auth/callback" cannot be used with "output: export"`
- **Cause:** `next.config.js` on the main branch had `output: 'export'` hardcoded unconditionally. Vercel deployed from main, which always ran in static export mode, which is fundamentally incompatible with server-side API routes, Supabase auth callbacks, and Groq server calls.

### Issue 3: Two conflicting GitHub Pages workflows
- **Symptom:** `nextjs.yml` and `deploy.yml` both ran on push to main, both targeting GitHub Pages with the same concurrency group
- **Cause:** `nextjs.yml` was the default Next.js GitHub Pages template; `deploy.yml` was a custom workflow added separately. Neither set `STATIC_EXPORT=true`.

### Issue 4: README referenced Anthropic/Claude instead of Groq
- **Cause:** The original README was written before the AI provider switch from Anthropic to Groq.

### Issue 5: Supabase env var renamed without backward compat
- **Old name:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **New name:** `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- **Fix:** Both are now accepted; `PUBLISHABLE_KEY` takes priority with `ANON_KEY` as fallback.

---

## 5. How Each Issue Was Fixed

| Issue | Fix |
|---|---|
| API routes pre-rendered at build time | Added `export const dynamic = 'force-dynamic'` to all 4 API routes |
| `GROQ_CONFIGURED` requiring Supabase URL | `GROQ_CONFIGURED` now only checks `GROQ_API_KEY` |
| API key spaces from copy-paste | All env var reads in `lib/env.ts` call `.trim()` |
| README referencing Anthropic | README fully rewritten to reference Groq throughout |
| Supabase key rename | `lib/env.ts` `getSupabasePublishableKey()` checks both names |
| `output: 'export'` hardcoded | `next.config.js` now only enables static export when `STATIC_EXPORT=true` is set |
| Duplicate GitHub Pages workflows | Deleted `nextjs.yml`; kept `deploy.yml` updated to pass `STATIC_EXPORT=true` |

---

## 6. What Is Left to Do

### Immediate (required for the app to work on Vercel)
- [ ] Redeploy on Vercel after this config fix merges to main
- [ ] Confirm all 6 Vercel environment variables are set (see Section 7)
- [ ] **Rotate the Groq API key** — it was shared in chat and must be regenerated at console.groq.com
- [ ] Add `NEXT_PUBLIC_SUPABASE_URL` if not already set (find it in Supabase Dashboard → Project Settings → API → Project URL)
- [ ] Run Supabase migrations in the SQL Editor (paste `001_initial_schema.sql` then `002_seed_opportunities.sql`)
- [ ] Add your Vercel deployment URL to Supabase Auth → URL Configuration → Redirect URLs

### Verification after deployment
- [ ] Test signup at `/signup` — confirm email arrives and account is created in Supabase
- [ ] Test login at `/login` — confirm session is set and `/dashboard` loads
- [ ] Complete profile at `/profile` — confirm data saves to `student_profiles` in Supabase
- [ ] Confirm `/dashboard` shows scored opportunities (not demo mock data)
- [ ] Confirm `/strategy` shows "Generated by Groq AI" badge with personalised content
- [ ] Confirm `/dashboard` while logged out redirects to `/login`
- [ ] Confirm demo mode works: temporarily remove env vars → app should load with mock data

### Optional improvements
- [ ] Persist action item checkbox state to `action_items` table (currently session-only)
- [ ] Add `/forgot-password` page
- [ ] Replace footer `#` links with real USCIS.gov / EducationUSA links
- [ ] Add rate limiting (`@upstash/ratelimit`) on the Groq strategy route before public launch
- [ ] Replace seed job listings with a real job API (Adzuna, Adzuna, RapidAPI Jobs, etc.)
- [ ] Add source citations for landing page statistics ("73% of international students…")
- [ ] Either build or remove the advertised-but-unbuilt "Peer Network Signals" and "Real-Time Opportunity Signals" features

---

## 7. Required Vercel Environment Variables

Set these in **Vercel → Project → Settings → Environment Variables** for both **Production** and **Preview**.

| Variable | Where to find it | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Project Settings → API → Project URL | Must start with `https://` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase Dashboard → API Keys → `publishable` | Starts with `sb_publishable_` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → API Keys → `service_role` | Server-only — never use `NEXT_PUBLIC_` prefix |
| `GROQ_API_KEY` | [console.groq.com](https://console.groq.com) → API Keys | **Must be rotated** — was shared in chat. Server-only. |
| `GROQ_MODEL` | Hardcode value | Set to `llama-3.3-70b-versatile` |
| `NEXT_PUBLIC_APP_URL` | Your Vercel deployment URL | e.g. `https://sponsorscout.vercel.app` |

> Do NOT set `STATIC_EXPORT=true` in Vercel. That env var is only for GitHub Pages builds.

---

## 8. Important Safety Notes

| Rule | Reason |
|---|---|
| Never commit `.env.local` | It contains real API keys; it is gitignored |
| Never use `NEXT_PUBLIC_GROQ_API_KEY` | `NEXT_PUBLIC_` vars are embedded in the client bundle and visible to anyone |
| Never use `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` | Service role key bypasses all RLS — must stay server-only |
| Never import `lib/groq.ts` in client components | Will expose the API key and fail at runtime |
| Never import `lib/supabase/server.ts` in client components | Uses `next/headers` which is server-only |
| `STATIC_EXPORT=true` is for GitHub Pages only | Setting it on Vercel will break all API routes |
| SponsorScout AI is not legal immigration advice | Always show the legal disclaimer banner; always recommend consulting a licensed attorney |

---

## 9. Deployment Instructions

### Vercel (primary — server-side, full features)

1. Import the GitHub repo into Vercel
2. Framework: **Next.js** (auto-detected)
3. Root directory: `./`
4. Build command: leave as default (`next build`)
5. Output directory: leave as default (`.next`)
6. Install command: leave as default (`npm install`)
7. **Do NOT set `STATIC_EXPORT=true`** — Vercel needs SSR mode
8. Set all 6 environment variables from Section 7
9. Deploy

### GitHub Pages (optional static export — no auth, no API routes, demo mode only)

The `.github/workflows/deploy.yml` workflow runs automatically on every push to `main`. It sets `STATIC_EXPORT=true` so the build produces a static export in `./out`. Auth and API routes do not work in this mode — it is demo-only.

---

## 10. Final Checklist for the Next Developer or AI Assistant

- [ ] `npm run build` passes with 0 errors
- [ ] All 4 API routes show `ƒ` (Dynamic) in the build output — not `○` (Static)
- [ ] Vercel deployment succeeds and all pages load
- [ ] `/api/auth/callback` works (Supabase redirects land correctly)
- [ ] No `ANTHROPIC_API_KEY` or `ANTHROPIC_CONFIGURED` references anywhere in the codebase
- [ ] `lib/groq.ts` is never imported from client components or pages
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is only used in server-only files
- [ ] `CLAUDE.md` is accurate (always create a PR after every push)
- [ ] This `HANDOVER.md` is accurate and up to date

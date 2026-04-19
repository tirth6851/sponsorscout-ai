# SponsorScout AI

SponsorScout AI is an AI-powered career navigation platform built for international students who need more than a generic job board. Instead of only listing roles, SponsorScout helps users identify opportunities that are realistically aligned with sponsorship likelihood, work authorization timing, career goals, and application strategy.

Built for the **Built with Opus 4.7: a Claude Code Hackathon**, the project focuses on a real and painful gap: many international students miss strong opportunities because job search, sponsorship uncertainty, CPT/OPT timing, and document planning are fragmented across too many systems.

## Problem

International students often face a harder version of the job search than traditional applicants:

- They must consider CPT, OPT, visa timelines, and sponsorship constraints
- Many job boards do not surface sponsorship-aware matches
- Students waste time applying to roles they are unlikely to be eligible for
- Important deadlines, forms, and planning steps are easy to miss
- Career centers and job portals usually provide listings, not strategy

SponsorScout AI is designed to reduce that confusion and turn scattered information into a clearer action plan.

## Core Idea

SponsorScout AI acts as a visa-aware job and opportunity navigator for international students. Instead of being just another listings site, it helps users:

- discover internships, co-ops, research roles, campus jobs, and entry-level positions
- evaluate realistic fit based on background and work authorization constraints
- prioritize opportunities with stronger sponsorship potential
- understand next steps based on their timeline and goals
- receive personalized strategy instead of passive search results

## Why This Is Different

Most platforms like Handshake or university job portals are databases. They surface opportunities, but they do not deeply reason through the specific constraints international students face.

SponsorScout AI is different because it is:

- **Visa-aware**: considers CPT/OPT timing, sponsorship likelihood, and eligibility windows
- **Action-oriented**: tells the user what to do next instead of only showing listings
- **Personalized**: adapts guidance based on user goals, timeline, experience, and documents
- **Strategic**: helps users focus on realistic, high-value applications instead of random volume

## MVP Features

### 1. User Profile Setup
- Major
- Graduation date
- Skills
- Preferred role types
- Location preference
- Sponsorship need
- Target timeline

### 2. Opportunity Matching
- Match relevant internships, co-ops, research roles, campus jobs, and early-career roles
- Flag more realistic roles vs lower-probability roles
- Explain why each opportunity is a fit

### 3. Visa-Aware Guidance
- Highlight CPT/OPT considerations
- Warn users about timing issues
- Point out likely preparation steps before applying

### 4. Personalized Strategy Output
- Recommended next actions
- Priority opportunities
- Skill gap suggestions
- Application sequencing suggestions

### 5. Basic Dashboard
- Saved opportunities
- User goals
- Priority tasks
- Progress notes

## Future Vision

Later versions could include:

- sponsorship probability scoring with evidence
- document checklist generation
- application tracking
- scholarship and fellowship matching
- email draft generation for recruiters or advisors
- employer trend analysis
- long-term memory across a student's search journey

## Tech Stack

Planned stack:

- **Frontend:** Next.js
- **Backend:** Next.js API routes or Python backend
- **Database/Auth:** Supabase
- **AI:** Anthropic Claude API
- **Deployment:** Vercel

## Claude's Role

Claude will be used for:

- opportunity-fit reasoning
- personalized recommendation generation
- strategic next-step planning
- synthesizing visa-aware guidance into understandable actions
- helping convert fragmented search data into decisions

## Hackathon Positioning

This project is shaped around a problem I personally understand as an international student. The goal is not to create a generic AI job board, but to build a focused tool that helps students navigate a stressful and often confusing process with more clarity and confidence.

## Repository Roadmap

- [ ] Build basic project scaffold
- [ ] Define database schema
- [ ] Add authentication
- [ ] Create profile intake flow
- [ ] Build mock opportunity matching workflow
- [ ] Add AI recommendation layer
- [ ] Design dashboard UI
- [ ] Prepare demo script and screenshots

## Getting Started

This repository is currently being set up for hackathon development.

Planned local setup:

```bash
npm install
npm run dev
```

## Status

Early-stage hackathon repository. Initial planning and setup in progress.

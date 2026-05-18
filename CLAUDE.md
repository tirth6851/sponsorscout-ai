# SponsorScout AI — Claude Instructions

## Always create a pull request after every change

After every commit and push — no matter how small — always open a pull request on GitHub targeting `main`. No exceptions. Even a one-line fix gets a PR.

- Development branch: `claude/sponsorscout-hackathon-mvp-WG9Sf`
- Base branch: `main`
- Use `mcp__github__create_pull_request` to open the PR
- Subscribe to the PR with `mcp__github__subscribe_pr_activity` after creating it
- Check CI and review comments immediately after subscribing

## Repository

- Owner: `tirth6851`
- Repo: `sponsorscout-ai`

## Environment variables (never hardcode)

| Variable | Side |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Client + Server |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Client + Server |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only |
| `GROQ_API_KEY` | Server only |
| `GROQ_MODEL` | Server only |
| `NEXT_PUBLIC_APP_URL` | Client + Server |

Never expose `GROQ_API_KEY` or `SUPABASE_SERVICE_ROLE_KEY` in client components or `NEXT_PUBLIC_*` vars.

## After every push

1. Create a PR (even for small changes)
2. Subscribe to PR activity
3. Check CI status and resolve any failures

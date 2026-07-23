# CodePet 🐾

A virtual pet whose mood reflects your GitHub coding activity — rendered as a
live SVG you embed directly in your GitHub profile README. No client-side
JavaScript, no build step for the reader: every request generates a fresh
static SVG server-side.

## How it works

- `GET /api/pet?user=<github-username>` fetches your recent public GitHub
  activity (via the public events API), computes a mood, and returns a
  hand-built pixel-art SVG.
- GitHub's camo proxy caches README images, so the endpoint sets
  `Cache-Control: no-cache, no-store, must-revalidate` to encourage GitHub to
  re-fetch on each profile view. The mood itself is also internally cached
  for ~5 minutes to avoid hammering the GitHub API.
- Moods: **thriving** (active streak), **content** (active this week),
  **hungry** (3–7 days quiet), **sick** (7+ days quiet), **neutral** (no
  public activity found — new accounts or fully private repos).

## Embed it in your profile README

Paste this into your `<username>/<username>/README.md` (replace both the
domain after you deploy, and the `user` value with your GitHub handle):

```markdown
![CodePet](https://your-codepet.vercel.app/api/pet?user=LucasGranatto)
```

## Local development

```bash
npm install
npm run dev        # runs `vercel dev`, serves http://localhost:3000/api/pet?user=<you>
npm test            # runs the mood-calculation unit tests
npm run typecheck    # tsc --noEmit
```

### Optional: GitHub token for higher rate limits

Public activity fetches work with **zero authentication** (60 requests/hour
per IP). If you expect meaningful traffic, create a classless personal access
token (no scopes needed — it's only reading public data) at
https://github.com/settings/tokens and set it as `GITHUB_TOKEN`:

```bash
cp .env.example .env
# edit .env and paste your token
```

## Deploying to Vercel (free tier)

1. Push this repo to GitHub.
2. Go to https://vercel.com/new and import the repo.
3. Framework preset: **Other** (no build step needed — it's just serverless
   functions under `/api`).
4. (Optional) Add an environment variable: `GITHUB_TOKEN` = your token, if
   you made one above.
5. Deploy. Vercel will give you a URL like `https://codepet-yourname.vercel.app`.
6. Test it: visit `https://codepet-yourname.vercel.app/api/pet?user=<your-github-username>`
   directly in a browser — you should see the SVG pet.
7. Paste the embed snippet (above, with your real domain) into your GitHub
   profile README.

That's it — no database, no separate KV store required for a personal-use
deployment. If you later want the cache to survive cold starts / scale to
many users, swap `src/cache.ts` for Vercel KV or Upstash Redis behind the
same `getCached`/`setCached` interface.

## Project structure

```
codepet/
├── api/pet.ts          # Serverless route: fetch -> mood -> render -> respond
├── src/
│   ├── github.ts         # GitHub public events API client
│   ├── mood.ts            # Pure mood-calculation function
│   ├── render.ts           # SVG composition (frame + sprite + status text)
│   ├── cache.ts             # In-memory TTL cache
│   ├── types.ts              # Shared types and error classes
│   └── sprites/               # One file per mood's pixel-art sprite
├── test/mood.test.ts    # Unit tests for mood.ts
├── vercel.json
└── tsconfig.json
```

## Mood algorithm

Pure function in `src/mood.ts`, evaluated in order:

| Condition | Mood |
|---|---|
| No public commit activity found | Neutral |
| Last commit ≤ 1 day ago **and** streak ≥ 2 days | Thriving |
| Last commit ≤ 2 days ago | Content |
| Last commit ≤ 7 days ago | Hungry |
| Last commit > 7 days ago | Sick |

"Streak" = consecutive calendar days (ending today or yesterday) with at
least one commit. Data comes from `GET /users/{username}/events/public`,
which covers roughly the last 90 days / 300 events of public activity.

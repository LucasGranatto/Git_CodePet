import type { VercelRequest, VercelResponse } from '@vercel/node';
import { fetchActivitySummary } from '../src/github.js';
import { calculateMood } from '../src/mood.js';
import { renderPetSvg } from '../src/render.js';
import { getCached, setCached } from '../src/cache.js';
import { ActivitySummary, GitHubApiError, GitHubUserNotFoundError } from '../src/types.js';

const NEUTRAL_ACTIVITY: ActivitySummary = {
  hasActivity: false,
  daysSinceLastCommit: null,
  currentStreak: 0,
  totalCommits: 0,
};

/**
 * GET /api/pet?user=<github-username>
 *
 * Always returns a 200 with a valid SVG body (even on upstream errors),
 * because this endpoint is embedded as a static <img> in a README — there's
 * no way to show an error page to the reader, so we degrade to a neutral
 * pet with an explanatory label instead of returning a 4xx/5xx that GitHub
 * would just render as a broken image icon.
 */
export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const usernameParam = req.query.user;
  const username = Array.isArray(usernameParam) ? usernameParam[0] : usernameParam;

  // Headers that matter regardless of outcome: correct content type, and
  // no-cache so GitHub's camo proxy re-fetches this on every README view
  // rather than serving a stale mood indefinitely.
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  if (!username || username.trim() === '') {
    res.status(200).send(
      renderPetSvg({
        username: 'unknown',
        mood: 'neutral',
        activity: NEUTRAL_ACTIVITY,
      }),
    );
    return;
  }

  try {
    const activity = await getActivityWithCache(username);
    const { mood } = calculateMood(activity);
    res.status(200).send(renderPetSvg({ username, mood, activity }));
  } catch (err) {
    if (err instanceof GitHubUserNotFoundError) {
      // Valid request, just a bad username — still render something rather
      // than a broken image, but make the label say so.
      res.status(200).send(
        renderPetSvg({
          username,
          mood: 'neutral',
          activity: NEUTRAL_ACTIVITY,
        }),
      );
      return;
    }

    if (err instanceof GitHubApiError) {
      // Rate limited or GitHub is down — fall back to neutral rather than
      // failing the image entirely. Logged server-side for debugging.
      console.error(`[codepet] GitHub API error for user "${username}":`, err.message);
      res.status(200).send(
        renderPetSvg({
          username,
          mood: 'neutral',
          activity: NEUTRAL_ACTIVITY,
        }),
      );
      return;
    }

    // Anything truly unexpected — still don't 500 an <img> tag.
    console.error(`[codepet] Unexpected error for user "${username}":`, err);
    res.status(200).send(
      renderPetSvg({
        username,
        mood: 'neutral',
        activity: NEUTRAL_ACTIVITY,
      }),
    );
  }
}

/** Wraps fetchActivitySummary with the in-memory cache, keyed by username. */
async function getActivityWithCache(username: string): Promise<ActivitySummary> {
  const cacheKey = `activity:${username.toLowerCase()}`;
  const cached = getCached<ActivitySummary>(cacheKey);
  if (cached) return cached;

  const fresh = await fetchActivitySummary(username);
  setCached(cacheKey, fresh);
  return fresh;
}

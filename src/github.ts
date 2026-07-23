import { ActivitySummary, GitHubApiError, GitHubUserNotFoundError } from './types.js';

const GITHUB_API_BASE = 'https://api.github.com';

/**
 * Minimal shape of the fields we actually read from a GitHub public event.
 * The real payload has many more fields; we only type what we use.
 */
interface GitHubEvent {
  type: string;
  created_at: string;
  payload?: {
    commits?: unknown[];
    size?: number;
  };
}

/**
 * Fetches a user's public events and reduces them to an ActivitySummary.
 *
 * Uses GET /users/{username}/events/public, which:
 *  - requires no authentication for public data
 *  - returns up to ~300 events / ~90 days of history (GitHub-imposed limit)
 *  - includes PushEvent entries, each carrying one or more commits
 *
 * Throws GitHubUserNotFoundError for a 404 (bad username) and GitHubApiError
 * for anything else unexpected (rate limit, 5xx, network failure), so the
 * caller can decide how to degrade gracefully.
 */
export async function fetchActivitySummary(username: string): Promise<ActivitySummary> {
  const events = await fetchPublicEvents(username);

  // Collect one Date per commit, from every PushEvent's commit list.
  // We only care about calendar days, not exact timestamps, for streak math.
  const commitDates: Date[] = [];
  for (const event of events) {
    if (event.type !== 'PushEvent') continue;
    const commitCount = event.payload?.commits?.length ?? event.payload?.size ?? 0;
    if (commitCount <= 0) continue;
    // All commits in a single push share the push's timestamp closely enough
    // for day-level bucketing; we don't need per-commit timestamps.
    for (let i = 0; i < commitCount; i++) {
      commitDates.push(new Date(event.created_at));
    }
  }

  if (commitDates.length === 0) {
    return {
      hasActivity: false,
      daysSinceLastCommit: null,
      currentStreak: 0,
      totalCommits: 0,
    };
  }

  const dayKeys = new Set(commitDates.map(toDayKey));
  const mostRecent = commitDates.reduce((a, b) => (a > b ? a : b));

  return {
    hasActivity: true,
    daysSinceLastCommit: daysBetween(mostRecent, new Date()),
    currentStreak: computeStreak(dayKeys),
    totalCommits: commitDates.length,
  };
}

/** Fetches the raw public events list, handling 404 / rate-limit / network errors. */
async function fetchPublicEvents(username: string): Promise<GitHubEvent[]> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'codepet-app',
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(
      `${GITHUB_API_BASE}/users/${encodeURIComponent(username)}/events/public?per_page=100`,
      { headers },
    );
  } catch (err) {
    // Network-level failure (DNS, timeout, GitHub totally down).
    throw new GitHubApiError(`Failed to reach GitHub API: ${(err as Error).message}`);
  }

  if (response.status === 404) {
    throw new GitHubUserNotFoundError(username);
  }

  if (response.status === 403 || response.status === 429) {
    // Rate limited (either GitHub's secondary rate limit or unauthenticated cap).
    const resetHeader = response.headers.get('x-ratelimit-reset');
    const resetMsg = resetHeader
      ? ` Resets at ${new Date(Number(resetHeader) * 1000).toISOString()}.`
      : '';
    throw new GitHubApiError(`GitHub API rate limit exceeded.${resetMsg}`, response.status);
  }

  if (!response.ok) {
    throw new GitHubApiError(`GitHub API returned ${response.status}`, response.status);
  }

  return (await response.json()) as GitHubEvent[];
}

/** Formats a date as a YYYY-MM-DD key for day-bucketing (UTC, to stay deterministic). */
function toDayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Whole days between two dates (floor), always >= 0. */
function daysBetween(earlier: Date, later: Date): number {
  const ms = later.getTime() - earlier.getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
}

/**
 * Computes the current streak: consecutive calendar days with at least one
 * commit, walking backward from today. A streak "survives" a single day gap
 * only if that gap is today itself (i.e. it's still early in the day and the
 * user hasn't committed yet) — otherwise the streak is broken.
 */
function computeStreak(dayKeys: Set<string>): number {
  let streak = 0;
  const cursor = new Date();

  // If there's no commit today, the streak can still be "alive" as of
  // yesterday (user just hasn't coded yet today) — start checking from today,
  // but don't let a missing "today" alone zero out an otherwise-real streak.
  if (!dayKeys.has(toDayKey(cursor))) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  while (dayKeys.has(toDayKey(cursor))) {
    streak++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  return streak;
}

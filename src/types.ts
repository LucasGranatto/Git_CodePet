/**
 * Summary of a GitHub user's recent public commit activity, derived from
 * their public events feed. This is the only input the mood algorithm
 * needs, which keeps mood calculation decoupled from the GitHub API shape.
 */
export interface ActivitySummary {
  /** True if we successfully found at least one public commit event ever
   *  (within the lookback window the events API gives us, ~90 days / 300 events). */
  hasActivity: boolean;
  /** Days since the most recent commit, or null if hasActivity is false. */
  daysSinceLastCommit: number | null;
  /** Consecutive days (ending today or yesterday) with at least one commit. */
  currentStreak: number;
  /** Total commits counted across the lookback window (for flavor text / future use). */
  totalCommits: number;
}

/** The five visual/emotional states the pet can be in. */
export type Mood = 'thriving' | 'content' | 'hungry' | 'sick' | 'neutral';

export interface MoodResult {
  mood: Mood;
  /** Short human-readable reason, useful for debugging and for SVG flavor text. */
  reason: string;
}

/** Errors we distinguish so the API route can respond with the right status/fallback. */
export class GitHubUserNotFoundError extends Error {
  constructor(username: string) {
    super(`GitHub user "${username}" not found`);
    this.name = 'GitHubUserNotFoundError';
  }
}

export class GitHubApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'GitHubApiError';
  }
}

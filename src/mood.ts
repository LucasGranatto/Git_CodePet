import { ActivitySummary, MoodResult } from './types.js';

/**
 * Pure function: activity data in, mood state out. No I/O, no dates computed
 * internally (daysSinceLastCommit is passed in already resolved), so this is
 * trivially unit-testable and safe to call from tests without mocking time.
 *
 * Rules (checked in order):
 *  1. No public activity found at all           -> neutral
 *  2. Last commit <= 1 day ago AND streak >= 2   -> thriving
 *  3. Last commit <= 2 days ago                  -> content
 *  4. Last commit <= 7 days ago                  -> hungry
 *  5. Anything older (or unbounded)              -> sick
 */
export function calculateMood(activity: ActivitySummary): MoodResult {
  const { hasActivity, daysSinceLastCommit, currentStreak } = activity;

  if (!hasActivity || daysSinceLastCommit === null) {
    return {
      mood: 'neutral',
      reason: 'No public commit activity found in the recent history window.',
    };
  }

  if (daysSinceLastCommit <= 1 && currentStreak >= 2) {
    return {
      mood: 'thriving',
      reason: `Committed within the last day and riding a ${currentStreak}-day streak.`,
    };
  }

  if (daysSinceLastCommit <= 2) {
    return {
      mood: 'content',
      reason: `Last commit was ${daysSinceLastCommit} day(s) ago.`,
    };
  }

  if (daysSinceLastCommit <= 7) {
    return {
      mood: 'hungry',
      reason: `No commits in ${daysSinceLastCommit} days — getting hungry.`,
    };
  }

  return {
    mood: 'sick',
    reason: `No commits in ${daysSinceLastCommit} days — feeling neglected.`,
  };
}

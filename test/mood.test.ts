import { describe, it, expect } from 'vitest';
import { calculateMood } from '../src/mood.js';
import { ActivitySummary } from '../src/types.js';

/** Small helper to avoid repeating all four fields in every test case. */
function activity(overrides: Partial<ActivitySummary>): ActivitySummary {
  return {
    hasActivity: true,
    daysSinceLastCommit: 0,
    currentStreak: 0,
    totalCommits: 0,
    ...overrides,
  };
}

describe('calculateMood', () => {
  it('returns neutral when there is no activity at all', () => {
    const result = calculateMood(
      activity({ hasActivity: false, daysSinceLastCommit: null, currentStreak: 0 }),
    );
    expect(result.mood).toBe('neutral');
  });

  it('returns neutral when daysSinceLastCommit is null even if hasActivity flag is wrong', () => {
    // Defensive: null date should always win regardless of hasActivity, since
    // downstream code should never rely on hasActivity alone.
    const result = calculateMood(
      activity({ hasActivity: true, daysSinceLastCommit: null, currentStreak: 5 }),
    );
    expect(result.mood).toBe('neutral');
  });

  it('returns thriving when committed today with a streak of 2+', () => {
    const result = calculateMood(activity({ daysSinceLastCommit: 0, currentStreak: 3 }));
    expect(result.mood).toBe('thriving');
  });

  it('returns thriving when committed yesterday with a streak of 2+', () => {
    const result = calculateMood(activity({ daysSinceLastCommit: 1, currentStreak: 2 }));
    expect(result.mood).toBe('thriving');
  });

  it('does NOT return thriving on a fresh commit without a real streak', () => {
    // Committed today, but streak of 1 means no consecutive-day pattern yet.
    const result = calculateMood(activity({ daysSinceLastCommit: 0, currentStreak: 1 }));
    expect(result.mood).toBe('content');
  });

  it('returns content for a commit 2 days ago regardless of streak', () => {
    const result = calculateMood(activity({ daysSinceLastCommit: 2, currentStreak: 0 }));
    expect(result.mood).toBe('content');
  });

  it('returns hungry for a commit gap between 3 and 7 days', () => {
    expect(calculateMood(activity({ daysSinceLastCommit: 3, currentStreak: 0 })).mood).toBe(
      'hungry',
    );
    expect(calculateMood(activity({ daysSinceLastCommit: 7, currentStreak: 0 })).mood).toBe(
      'hungry',
    );
  });

  it('returns sick for a commit gap over 7 days', () => {
    expect(calculateMood(activity({ daysSinceLastCommit: 8, currentStreak: 0 })).mood).toBe(
      'sick',
    );
  });

  it('returns sick for a very long gap (30+ days)', () => {
    const result = calculateMood(activity({ daysSinceLastCommit: 45, currentStreak: 0 }));
    expect(result.mood).toBe('sick');
    expect(result.reason).toContain('45');
  });

  it('boundary: exactly 1 day with streak 1 is content, not thriving', () => {
    const result = calculateMood(activity({ daysSinceLastCommit: 1, currentStreak: 1 }));
    expect(result.mood).toBe('content');
  });
});

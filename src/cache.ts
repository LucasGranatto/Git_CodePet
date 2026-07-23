/**
 * Minimal in-memory TTL cache, scoped to a single serverless function
 * instance's module state. Vercel reuses "warm" instances for bursts of
 * traffic, so this meaningfully cuts down on GitHub API calls without
 * needing an external store.
 *
 * Caveats (documented deliberately, not hidden):
 *  - Does NOT persist across cold starts or across concurrent instances —
 *    under real traffic you may still hit GitHub more than "once per 5 min
 *    globally". That's fine for a personal README badge with light traffic.
 *  - If this needs to scale to many users, swap this module for Vercel KV
 *    or Upstash Redis behind the same get/set interface.
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const store = new Map<string, CacheEntry<unknown>>();

const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes

export function getCached<T>(key: string): T | undefined {
  const entry = store.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return undefined;
  }
  return entry.value as T;
}

export function setCached<T>(key: string, value: T, ttlMs: number = DEFAULT_TTL_MS): void {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
}

/**
 * Lightweight fixed-window rate limiter.
 *
 * In-memory by default (fine for a single Vercel serverless instance
 * during dev/low traffic). For production at scale, swap the Map for
 * Redis (Upstash works great with Vercel) — the interface below is
 * already shaped so that swap is a one-file change.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * @param key Unique key per client+route, e.g. `login:${ip}`
 * @param limit Max requests allowed within the window
 * @param windowMs Window size in milliseconds
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (entry.count >= limit) {
    return { success: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  store.set(key, entry);
  return { success: true, remaining: limit - entry.count, resetAt: entry.resetAt };
}

/** Extracts a best-effort client IP from a Next.js Request. */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

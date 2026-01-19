// Simple in-memory rate limiter for MVP
// For production, consider using Redis or Upstash

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry>;
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs: number, maxRequests: number) {
    this.limits = new Map();
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  check(identifier: string): { allowed: boolean; remaining: number; resetAt: number } {
    const now = Date.now();
    const entry = this.limits.get(identifier);

    if (!entry || now > entry.resetAt) {
      // Create new window
      const resetAt = now + this.windowMs;
      this.limits.set(identifier, {
        count: 1,
        resetAt,
      });
      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        resetAt,
      };
    }

    if (entry.count >= this.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: entry.resetAt,
      };
    }

    entry.count++;
    return {
      allowed: true,
      remaining: this.maxRequests - entry.count,
      resetAt: entry.resetAt,
    };
  }

  reset(identifier: string): void {
    this.limits.delete(identifier);
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.limits.entries()) {
      if (now > entry.resetAt) {
        this.limits.delete(key);
      }
    }
  }
}

// Pre-configured rate limiters
export const reviewRateLimiter = new RateLimiter(3600000, 5); // 5 per hour
export const commentRateLimiter = new RateLimiter(3600000, 20); // 20 per hour
export const reportRateLimiter = new RateLimiter(86400000, 10); // 10 per day
export const authRateLimiter = new RateLimiter(900000, 5); // 5 per 15 minutes

// Cleanup expired entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    reviewRateLimiter.cleanup();
    commentRateLimiter.cleanup();
    reportRateLimiter.cleanup();
    authRateLimiter.cleanup();
  }, 300000);
}

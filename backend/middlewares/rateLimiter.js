const RATE_LIMITS = {
  free: {
    scans: { max: 5, window: 86400000 }, // 5 scans per day
    api: { max: 50, window: 3600000 }     // 50 requests per hour
  },
  basic: {
    scans: { max: 20, window: 86400000 }, // 20 scans per day
    api: { max: 200, window: 3600000 }     // 200 requests per hour
  },
  premium: {
    scans: { max: 100, window: 86400000 }, // 100 scans per day
    api: { max: 1000, window: 3600000 }     // 1000 requests per hour
  },
  enterprise: {
    scans: { max: -1, window: 86400000 },  // Unlimited
    api: { max: 5000, window: 3600000 }     // 5000 requests per hour
  }
};

class RateLimiter {
  constructor() {
    this.requests = new Map();
    this.scans = new Map();
  }

  checkLimit(userId, plan, type = 'api') {
    const limits = RATE_LIMITS[plan] || RATE_LIMITS.free;
    const limit = limits[type];
    
    if (limit.max === -1) return { allowed: true }; // Unlimited

    const key = `${userId}-${type}`;
    const now = Date.now();
    
    const store = type === 'api' ? this.requests : this.scans;
    
    if (!store.has(key)) {
      store.set(key, []);
    }

    const userRequests = store.get(key);
    
    // Remove old requests outside the time window
    const validRequests = userRequests.filter(timestamp => now - timestamp < limit.window);
    store.set(key, validRequests);

    if (validRequests.length >= limit.max) {
      const oldestRequest = Math.min(...validRequests);
      const resetTime = oldestRequest + limit.window;
      const retryAfter = Math.ceil((resetTime - now) / 1000);
      
      return {
        allowed: false,
        retryAfter,
        limit: limit.max,
        remaining: 0
      };
    }

    validRequests.push(now);
    store.set(key, validRequests);

    return {
      allowed: true,
      limit: limit.max,
      remaining: limit.max - validRequests.length,
      reset: now + limit.window
    };
  }

  apiRateLimitMiddleware() {
    return async (request, reply) => {
      if (!request.user?.id) return; // Skip for unauthenticated requests

      const userId = request.user.id;
      const plan = request.user.plan || 'free';

      const result = this.checkLimit(userId, plan, 'api');

      // Set rate limit headers
      reply.header('X-RateLimit-Limit', result.limit || 0);
      reply.header('X-RateLimit-Remaining', result.remaining || 0);
      if (result.reset) {
        reply.header('X-RateLimit-Reset', Math.floor(result.reset / 1000));
      }

      if (!result.allowed) {
        reply.header('Retry-After', result.retryAfter);
        return reply.code(429).send({
          error: 'Rate limit exceeded',
          message: `Too many requests. Try again in ${result.retryAfter} seconds`,
          retryAfter: result.retryAfter
        });
      }
    };
  }

  checkScanLimit(userId, plan) {
    return this.checkLimit(userId, plan, 'scans');
  }

  cleanup() {
    // Clean up old entries every hour
    setInterval(() => {
      const now = Date.now();
      
      for (const [key, timestamps] of this.requests.entries()) {
        const valid = timestamps.filter(t => now - t < 3600000);
        if (valid.length === 0) {
          this.requests.delete(key);
        } else {
          this.requests.set(key, valid);
        }
      }

      for (const [key, timestamps] of this.scans.entries()) {
        const valid = timestamps.filter(t => now - t < 86400000);
        if (valid.length === 0) {
          this.scans.delete(key);
        } else {
          this.scans.set(key, valid);
        }
      }
    }, 3600000);
  }
}

const rateLimiter = new RateLimiter();
rateLimiter.cleanup();

module.exports = rateLimiter;

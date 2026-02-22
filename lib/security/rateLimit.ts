import { Redis } from '@upstash/redis';

export interface RateLimitConfig {
  window: number; // Time window in seconds
  limit: number; // Max requests per window
  keyPrefix: string;
}

export interface RateLimitResult {
  limited: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
}

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const DEFAULT_CONFIGS: Record<string, RateLimitConfig> = {
  global: { window: 60, limit: 1000, keyPrefix: 'rl:global' },
  auth: { window: 300, limit: 5, keyPrefix: 'rl:auth' },
  api: { window: 60, limit: 100, keyPrefix: 'rl:api' },
  payment: { window: 3600, limit: 50, keyPrefix: 'rl:payment' },
};

const WHITELISTED_IPS = new Set(
  (process.env.WHITELISTED_IPS || '').split(',').filter(Boolean)
);

async function checkRateLimit(
  key: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const fullKey = `${config.keyPrefix}:${key}`;
  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - config.window;

  try {
    // Use Redis sorted set for sliding window
    await redis.zremrangebyscore(fullKey, 0, windowStart);
    const requestCount = await redis.zcard(fullKey);

    if (requestCount >= config.limit) {
      const oldestRequest = await redis.zrange(fullKey, 0, 0);
      const resetAt = oldestRequest.length > 0 ? (oldestRequest[0] as number) + config.window : now + config.window;

      return {
        limited: true,
        remaining: 0,
        resetAt,
        retryAfter: Math.max(1, resetAt - now),
      };
    }

    await redis.zadd(fullKey, { score: now, member: `${now}-${Math.random()}` });
    await redis.expire(fullKey, config.window + 1);

    return {
      limited: false,
      remaining: config.limit - requestCount - 1,
      resetAt: now + config.window,
    };
  } catch (error) {
    console.error('Rate limit check failed:', error);
    // Graceful degradation: allow traffic if Redis fails
    return {
      limited: false,
      remaining: config.limit,
      resetAt: now + config.window,
    };
  }
}

export async function checkIpRateLimit(
  ip: string,
  endpoint?: string
): Promise<RateLimitResult> {
  if (WHITELISTED_IPS.has(ip)) {
    return {
      limited: false,
      remaining: Infinity,
      resetAt: 0,
    };
  }

  const config = endpoint ? DEFAULT_CONFIGS[endpoint] || DEFAULT_CONFIGS.api : DEFAULT_CONFIGS.global;
  return checkRateLimit(`ip:${ip}`, config);
}

export async function checkUserRateLimit(
  userId: string,
  endpoint?: string
): Promise<RateLimitResult> {
  const config = endpoint ? DEFAULT_CONFIGS[endpoint] || DEFAULT_CONFIGS.api : DEFAULT_CONFIGS.api;
  return checkRateLimit(`user:${userId}`, config);
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  
  const ip = request.headers.get('x-real-ip');
  return ip || 'unknown';
}

export function setRateLimitHeaders(response: Response, result: RateLimitResult): Response {
  response.headers.set('X-RateLimit-Limit', '100');
  response.headers.set('X-RateLimit-Remaining', Math.max(0, result.remaining).toString());
  response.headers.set('X-RateLimit-Reset', result.resetAt.toString());
  
  if (result.retryAfter) {
    response.headers.set('Retry-After', result.retryAfter.toString());
  }

  return response;
}
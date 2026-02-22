export interface RateLimitViolation {
  ip: string;
  userId?: string;
  endpoint: string;
  timestamp: number;
  count: number;
}

const violations = new Map<string, RateLimitViolation>();

export function recordViolation(
  ip: string,
  endpoint: string,
  userId?: string
): void {
  const key = `${ip}:${endpoint}`;
  const existing = violations.get(key);

  if (existing) {
    existing.count += 1;
    existing.timestamp = Date.now();
  } else {
    violations.set(key, {
      ip,
      userId,
      endpoint,
      timestamp: Date.now(),
      count: 1,
    });
  }

  // Alert if high violation count
  if (violations.get(key)!.count >= 10) {
    console.warn(`High rate limit violations from ${ip} on ${endpoint}`);
  }
}

export function getViolations(): RateLimitViolation[] {
  return Array.from(violations.values());
}

export function clearOldViolations(keepMs: number = 3600000): void {
  const now = Date.now();
  for (const [key, violation] of violations) {
    if (now - violation.timestamp > keepMs) {
      violations.delete(key);
    }
  }
}
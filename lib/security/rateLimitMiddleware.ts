import { NextRequest, NextResponse } from 'next/server';
import {
  checkIpRateLimit,
  checkUserRateLimit,
  getClientIp,
  setRateLimitHeaders,
} from './rateLimit';

export async function rateLimitMiddleware(
  request: NextRequest,
  endpoint?: string
): Promise<NextResponse | null> {
  const ip = getClientIp(request);
  const ipResult = await checkIpRateLimit(ip, endpoint);

  if (ipResult.limited) {
    const response = NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
    return setRateLimitHeaders(response, ipResult) as NextResponse;
  }

  // Check user limit if authenticated
  const userId = request.headers.get('x-user-id');
  if (userId) {
    const userResult = await checkUserRateLimit(userId, endpoint);
    if (userResult.limited) {
      const response = NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
      return setRateLimitHeaders(response, userResult) as NextResponse;
    }
  }

  return null; // Request allowed
}
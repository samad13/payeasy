import { NextResponse, type NextRequest } from 'next/server'
import { runAuthMiddleware } from './middleware/middleware'
import {
  getSecurityHeaders,
  CSP_REPORT_PATH,
} from '@/lib/security/headers'
import { logger } from './lib/logging/logger'
import { monitoring } from './lib/monitoring/sentry'

export async function middleware(request: NextRequest) {
  const start = Date.now();
  const reqId = crypto.randomUUID();
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const pathname = request.nextUrl.pathname;

  logger.info({ reqId, method: request.method, url: pathname, ip, userAgent }, 'Incoming Request');

  try {
    const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-nonce', nonce)

    const response = NextResponse.next({
      request: { headers: requestHeaders },
    })

    const authResponse = await runAuthMiddleware(request, response)

    const reportUri = new URL(CSP_REPORT_PATH, request.url).toString()
    const isProduction = process.env.NODE_ENV === 'production'
    const securityHeaders = getSecurityHeaders({
      nonce,
      reportUri,
      isProduction,
    })

    for (const [name, value] of Object.entries(securityHeaders)) {
      authResponse.headers.set(name, value)
    }

    const duration = Date.now() - start;
    logger.info({
      reqId,
      method: request.method,
      url: pathname,
      status: authResponse.status,
      duration
    }, 'Request Handled');

    return authResponse
  } catch (error) {
    monitoring.captureException(error, { reqId, method: request.method, url: pathname });
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

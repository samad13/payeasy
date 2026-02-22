import { NextResponse, type NextRequest } from 'next/server'
import { runAuthMiddleware } from './middleware/middleware'
import {
  getSecurityHeaders,
  CSP_REPORT_PATH,
} from '@/lib/security/headers'

export async function middleware(request: NextRequest) {
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

  return authResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

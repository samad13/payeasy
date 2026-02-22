import { NextResponse } from 'next/server'

/**
 * CSP report endpoint (report-uri / report-to).
 * Accepts POST with JSON body (CSP violation report), logs and returns 204.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    if (body && process.env.NODE_ENV !== 'test') {
      console.warn('[CSP Report]', JSON.stringify(body, null, 2))
    }
  } catch {
    // Ignore parse errors; still return 204
  }
  return new NextResponse(null, { status: 204 })
}

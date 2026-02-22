/**
 * Security response headers: CSP, HSTS, X-Frame-Options, etc.
 * Used by Next.js middleware to attach headers to every response.
 */

const HSTS_MAX_AGE = 31_536_000; // 1 year in seconds
const REPORT_TO_MAX_AGE = 10_886_400; // 126 days

export interface SecurityHeadersOptions {
  /** Nonce for CSP script-src and style-src (enables strict-dynamic). */
  nonce?: string;
  /** CSP report endpoint URL (report-uri and report-to). */
  reportUri?: string;
  /** If true, set HSTS and stricter CSP (no unsafe-eval). */
  isProduction?: boolean;
}

/**
 * Builds the Content-Security-Policy header value.
 * Uses nonce for script/style when provided; supports report-uri and report-to.
 */
function buildCsp(options: SecurityHeadersOptions): string {
  const { nonce, reportUri, isProduction } = options;
  const nonceDirective = nonce ? `'nonce-${nonce}'` : '';
  const scriptSrc = [
    "'self'",
    nonceDirective,
    "'strict-dynamic'",
    ...(isProduction ? [] : ["'unsafe-eval'"]), // Next.js dev
  ]
    .filter(Boolean)
    .join(' ');
  const styleSrc = [
    "'self'",
    nonceDirective,
    ...(isProduction ? [] : ["'unsafe-inline'"]), // Tailwind / dev
  ]
    .filter(Boolean)
    .join(' ');

  const directives = [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    `style-src ${styleSrc}`,
    "img-src 'self' blob: data: https:",
    "font-src 'self' data:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "block-all-mixed-content",
    ...(isProduction ? ["upgrade-insecure-requests"] : []),
    ...(reportUri ? [`report-uri ${reportUri}`, "report-to csp-endpoint"] : []),
  ];

  return directives.join('; ').replace(/\s{2,}/g, ' ').trim();
}

/**
 * Returns the Reporting-Endpoints / Report-To value for CSP report-to.
 * Only set when reportUri is provided.
 */
function buildReportTo(reportUri: string): string {
  return JSON.stringify({
    group: 'csp-endpoint',
    max_age: REPORT_TO_MAX_AGE,
    endpoints: [{ url: reportUri }],
  });
}

/**
 * Permissions-Policy: restrict browser features to least privilege.
 * Disable camera, microphone, geolocation, etc. unless the app needs them.
 */
const PERMISSIONS_POLICY =
  "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()";

export const SECURITY_HEADER_NAMES = {
  CONTENT_SECURITY_POLICY: 'Content-Security-Policy',
  REPORT_TO: 'Report-To',
  X_CONTENT_TYPE_OPTIONS: 'X-Content-Type-Options',
  X_FRAME_OPTIONS: 'X-Frame-Options',
  X_XSS_PROTECTION: 'X-XSS-Protection',
  STRICT_TRANSPORT_SECURITY: 'Strict-Transport-Security',
  PERMISSIONS_POLICY: 'Permissions-Policy',
} as const;

/**
 * Returns a record of security header name -> value for the given options.
 * Apply these to the NextResponse in middleware.
 * HSTS is only included when isProduction is true.
 */
export function getSecurityHeaders(options: SecurityHeadersOptions): Record<string, string> {
  const { reportUri, isProduction } = options;
  const csp = buildCsp(options);

  const headers: Record<string, string> = {
    [SECURITY_HEADER_NAMES.CONTENT_SECURITY_POLICY]: csp,
    [SECURITY_HEADER_NAMES.X_CONTENT_TYPE_OPTIONS]: 'nosniff',
    [SECURITY_HEADER_NAMES.X_FRAME_OPTIONS]: 'DENY',
    [SECURITY_HEADER_NAMES.X_XSS_PROTECTION]: '1; mode=block',
    [SECURITY_HEADER_NAMES.PERMISSIONS_POLICY]: PERMISSIONS_POLICY,
  };

  if (reportUri) {
    headers[SECURITY_HEADER_NAMES.REPORT_TO] = buildReportTo(reportUri);
  }

  if (isProduction) {
    headers[SECURITY_HEADER_NAMES.STRICT_TRANSPORT_SECURITY] =
      `max-age=${HSTS_MAX_AGE}; includeSubDomains; preload`;
  }

  return headers;
}

/**
 * Default CSP report endpoint path (API route in this app).
 * Middleware can resolve this to an absolute URL using request.url origin.
 */
export const CSP_REPORT_PATH = '/api/csp-report';

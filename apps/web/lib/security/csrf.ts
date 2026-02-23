import { NextRequest, NextResponse } from 'next/server';
 
function randomBytes(length: number): Uint8Array {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return array;
}
 
function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * CSRF token storage interface
 */
interface CSRFTokenStore {
  token: string;
  timestamp: number;
  expiresAt: number;
}

/**
 * CSRF configuration options
 */
interface CSRFConfig {
  headerName: string;
  cookieName: string;
  tokenLength: number;
  tokenExpiry: number;
  sameSite: 'Strict' | 'Lax' | 'None';
  secure: boolean;
}

/**
 * CSRF protection manager
 */
class CSRFManager {
  private static instance: CSRFManager;
  private tokenStore: Map<string, CSRFTokenStore> = new Map();
  private readonly config: CSRFConfig;

  private constructor(config?: Partial<CSRFConfig>) {
    this.config = {
      headerName: 'X-CSRF-Token',
      cookieName: '__csrf_token',
      tokenLength: 32,
      tokenExpiry: 60 * 60 * 1000, // 1 hour
      sameSite: 'Lax',
      secure: process.env.NODE_ENV === 'production',
      ...config,
    };

    // Cleanup expired tokens periodically
    if (typeof setInterval !== 'undefined') {
      setInterval(() => this.cleanupExpiredTokens(), 30 * 60 * 1000); // Every 30 minutes
    }
  }

  static getInstance(config?: Partial<CSRFConfig>): CSRFManager {
    if (!CSRFManager.instance) {
      CSRFManager.instance = new CSRFManager(config);
    }
    return CSRFManager.instance;
  }

  /**
   * Generate a new CSRF token
   */
  generateToken(sessionId: string): string {
    const token = bytesToHex(randomBytes(this.config.tokenLength));
    const now = Date.now();

    this.tokenStore.set(sessionId, {
      token,
      timestamp: now,
      expiresAt: now + this.config.tokenExpiry,
    });

    return token;
  }

  /**
   * Validate a CSRF token
   */
  validateToken(sessionId: string, token: string): boolean {
    const stored = this.tokenStore.get(sessionId);

    if (!stored) {
      return false;
    }

    const isExpired = Date.now() > stored.expiresAt;
    if (isExpired) {
      this.tokenStore.delete(sessionId);
      return false;
    }

    // Use constant-time comparison to prevent timing attacks
    return this.constantTimeCompare(stored.token, token);
  }

  /**
   * Constant-time string comparison
   */
  private constantTimeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return result === 0;
  }

  /**
   * Clean up expired tokens
   */
  private cleanupExpiredTokens(): void {
    const now = Date.now();
    for (const [key, value] of this.tokenStore.entries()) {
      if (now > value.expiresAt) {
        this.tokenStore.delete(key);
      }
    }
  }

  /**
   * Get configuration
   */
  getConfig(): Readonly<CSRFConfig> {
    return { ...this.config };
  }

  /**
   * Clear all tokens
   */
  clearAllTokens(): void {
    this.tokenStore.clear();
  }
}

/**
 * Generate CSRF token and set it in cookie
 */
export function generateCSRFToken(sessionId: string): { token: string; cookie: string } {
  const manager = CSRFManager.getInstance();
  const token = manager.generateToken(sessionId);
  const config = manager.getConfig();

  const cookie = `${config.cookieName}=${token}; Path=/; HttpOnly; SameSite=${config.sameSite}${
    config.secure ? '; Secure' : ''
  }; Max-Age=${Math.floor(config.tokenExpiry / 1000)}`;

  return { token, cookie };
}

/**
 * Validate CSRF token from request
 */
export function validateCSRFToken(
  request: NextRequest,
  sessionId: string,
): { valid: boolean; error?: string } {
  const manager = CSRFManager.getInstance();
  const config = manager.getConfig();

  // Get token from header or body
  const token =
    request.headers.get(config.headerName) ||
    (request.method === 'POST' ? request.headers.get('x-csrf-token') : null);

  if (!token) {
    return { valid: false, error: 'CSRF token missing' };
  }

  // Validate token
  if (!manager.validateToken(sessionId, token)) {
    return { valid: false, error: 'CSRF token invalid or expired' };
  }

  return { valid: true };
}

/**
 * Validate request origin and referer
 */
export function validateOrigin(
  request: NextRequest,
  allowedOrigins?: string[],
): { valid: boolean; error?: string } {
  const origin = request.headers.get('origin') || request.headers.get('referer');

  if (!origin) {
    return { valid: false, error: 'Origin header missing' };
  }

  if (allowedOrigins && allowedOrigins.length > 0) {
    const isAllowed = allowedOrigins.some((allowed) => origin.startsWith(allowed));
    if (!isAllowed) {
      return { valid: false, error: `Origin ${origin} not allowed` };
    }
  }

  return { valid: true };
}

/**
 * CSRF protection middleware
 */
export async function csrfProtectionMiddleware(
  request: NextRequest,
  sessionId: string,
  config?: { allowedOrigins?: string[]; exempt?: string[] },
): Promise<NextResponse | null> {
  // Skip protection for GET, HEAD, OPTIONS requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    return null;
  }

  // Check if path is exempt
  if (config?.exempt) {
    const pathname = request.nextUrl.pathname;
    if (config.exempt.some((path) => pathname.startsWith(path))) {
      return null;
    }
  }

  // Validate origin
  const originCheck = validateOrigin(request, config?.allowedOrigins);
  if (!originCheck.valid) {
    console.warn(`[CSRF] Origin validation failed: ${originCheck.error}`);
    return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  }

  // Validate CSRF token
  const tokenCheck = validateCSRFToken(request, sessionId);
  if (!tokenCheck.valid) {
    console.warn(`[CSRF] Token validation failed: ${tokenCheck.error}`);
    return NextResponse.json({ error: 'CSRF validation failed' }, { status: 403 });
  }

  return null; // Request is valid
}

/**
 * Get or create session ID from request
 */
export function getSessionId(request: NextRequest): string {
  const sessionCookie = request.cookies.get('__session')?.value;
  if (sessionCookie) {
    return sessionCookie;
  }

  // Generate new session ID if not present
  return bytesToHex(randomBytes(16));
}

/**
 * Export manager instance getter
 */
export function getCSRFManager(config?: Partial<CSRFConfig>): CSRFManager {
  return CSRFManager.getInstance(config);
}

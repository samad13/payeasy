import {
  getSecurityHeaders,
  SECURITY_HEADER_NAMES,
} from '@/lib/security/headers'

describe('lib/security/headers', () => {
  describe('getSecurityHeaders', () => {
    it('sets Content-Security-Policy', () => {
      const headers = getSecurityHeaders({})
      expect(headers[SECURITY_HEADER_NAMES.CONTENT_SECURITY_POLICY]).toBeDefined()
      expect(headers[SECURITY_HEADER_NAMES.CONTENT_SECURITY_POLICY]).toContain("default-src 'self'")
      expect(headers[SECURITY_HEADER_NAMES.CONTENT_SECURITY_POLICY]).toContain("frame-ancestors 'none'")
    })

    it('sets X-Content-Type-Options to nosniff', () => {
      const headers = getSecurityHeaders({})
      expect(headers[SECURITY_HEADER_NAMES.X_CONTENT_TYPE_OPTIONS]).toBe('nosniff')
    })

    it('sets X-Frame-Options to DENY', () => {
      const headers = getSecurityHeaders({})
      expect(headers[SECURITY_HEADER_NAMES.X_FRAME_OPTIONS]).toBe('DENY')
    })

    it('sets X-XSS-Protection to 1; mode=block', () => {
      const headers = getSecurityHeaders({})
      expect(headers[SECURITY_HEADER_NAMES.X_XSS_PROTECTION]).toBe('1; mode=block')
    })

    it('sets Permissions-Policy', () => {
      const headers = getSecurityHeaders({})
      expect(headers[SECURITY_HEADER_NAMES.PERMISSIONS_POLICY]).toBeDefined()
      expect(headers[SECURITY_HEADER_NAMES.PERMISSIONS_POLICY]).toContain('camera=()')
      expect(headers[SECURITY_HEADER_NAMES.PERMISSIONS_POLICY]).toContain('microphone=()')
    })

    it('includes nonce in CSP script-src and style-src when provided', () => {
      const nonce = 'abc123'
      const headers = getSecurityHeaders({ nonce })
      const csp = headers[SECURITY_HEADER_NAMES.CONTENT_SECURITY_POLICY]
      expect(csp).toContain(`'nonce-${nonce}'`)
      expect(csp).toContain("'strict-dynamic'")
    })

    it('includes report-uri and report-to in CSP when reportUri provided', () => {
      const reportUri = 'https://example.com/api/csp-report'
      const headers = getSecurityHeaders({ reportUri })
      const csp = headers[SECURITY_HEADER_NAMES.CONTENT_SECURITY_POLICY]
      expect(csp).toContain(`report-uri ${reportUri}`)
      expect(csp).toContain('report-to csp-endpoint')
      expect(headers[SECURITY_HEADER_NAMES.REPORT_TO]).toBeDefined()
      expect(headers[SECURITY_HEADER_NAMES.REPORT_TO]).toContain('csp-endpoint')
    })

    it('sets Strict-Transport-Security only when isProduction is true', () => {
      const devHeaders = getSecurityHeaders({ isProduction: false })
      expect(devHeaders[SECURITY_HEADER_NAMES.STRICT_TRANSPORT_SECURITY]).toBeUndefined()

      const prodHeaders = getSecurityHeaders({ isProduction: true })
      expect(prodHeaders[SECURITY_HEADER_NAMES.STRICT_TRANSPORT_SECURITY]).toBeDefined()
      expect(prodHeaders[SECURITY_HEADER_NAMES.STRICT_TRANSPORT_SECURITY]).toContain('max-age=')
      expect(prodHeaders[SECURITY_HEADER_NAMES.STRICT_TRANSPORT_SECURITY]).toContain('includeSubDomains')
      expect(prodHeaders[SECURITY_HEADER_NAMES.STRICT_TRANSPORT_SECURITY]).toContain('preload')
    })

    it('does not set Report-To when reportUri is not provided', () => {
      const headers = getSecurityHeaders({})
      expect(headers[SECURITY_HEADER_NAMES.REPORT_TO]).toBeUndefined()
    })

    it('production CSP includes upgrade-insecure-requests; dev does not', () => {
      const devCsp = getSecurityHeaders({ isProduction: false })[SECURITY_HEADER_NAMES.CONTENT_SECURITY_POLICY]
      const prodCsp = getSecurityHeaders({ isProduction: true })[SECURITY_HEADER_NAMES.CONTENT_SECURITY_POLICY]
      expect(devCsp).not.toContain('upgrade-insecure-requests')
      expect(prodCsp).toContain('upgrade-insecure-requests')
    })
  })
})

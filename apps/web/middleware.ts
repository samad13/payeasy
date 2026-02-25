import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { runAuthMiddleware } from "./middleware/middleware";
import { getSecurityHeaders, CSP_REPORT_PATH } from "@/lib/security/headers";
import { logger } from "./lib/logging/logger";
import { monitoring } from "./lib/monitoring/sentry";

export async function middleware(request: NextRequest) {
  const start = Date.now();
  const requestId = crypto.randomUUID();
  const ip =
    request.ip || request.headers.get("x-forwarded-for") || "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";
  const pathname = request.nextUrl.pathname;
  const method = request.method;

  logger.info(
    { requestId, method, url: pathname, ip, userAgent },
    "Incoming Request"
  );

  try {
    // ---- Attach request ID + nonce ----
    const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-request-id", requestId);
    requestHeaders.set("x-nonce", nonce);

    const requestWithMeta = new NextRequest(request.url, {
      method,
      headers: requestHeaders,
      body: request.body,
    });

    let response = NextResponse.next({ request: requestWithMeta });

    // Ensure response carries request ID
    response.headers.set("X-Request-ID", requestId);

    // ---- Supabase session refresh + dashboard protection ----
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseAnonKey) {
      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );

            response = NextResponse.next({ request: requestWithMeta });

            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );

            response.headers.set("X-Request-ID", requestId);
          },
        },
      });

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user && pathname.startsWith("/dashboard")) {
        const url = request.nextUrl.clone();
        url.pathname = "/auth/login";
        return NextResponse.redirect(url);
      }
    }

    // ---- Run additional auth middleware ----
    response = await runAuthMiddleware(requestWithMeta, response);

    // ---- Apply security headers (CSP etc.) ----
    const reportUri = new URL(CSP_REPORT_PATH, request.url).toString();
    const isProduction = process.env.NODE_ENV === "production";

    const securityHeaders = getSecurityHeaders({
      nonce,
      reportUri,
      isProduction,
    });

    for (const [name, value] of Object.entries(securityHeaders)) {
      response.headers.set(name, value);
    }

    const duration = Date.now() - start;

    logger.info(
      {
        requestId,
        method,
        url: pathname,
        status: response.status,
        duration,
      },
      "Request Handled"
    );

    return response;
  } catch (error) {
    monitoring.captureException(error, {
      requestId,
      method: request.method,
      url: pathname,
    });

    logger.error(
      { requestId, error },
      "Middleware execution failed"
    );

    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
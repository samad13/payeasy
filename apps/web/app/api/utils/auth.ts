import type { NextRequest } from "next/server";
import { verifyJwt } from "@/lib/auth/stellar-auth";
import { UnauthorizedError } from "./errors";

/**
 * Extract the authenticated user's Stellar public key from the request.
 * Checks auth-token cookie first, then Authorization: Bearer <token>.
 *
 * @returns The public key (sub from JWT) or null if missing/invalid.
 */
export function getUserId(request: NextRequest | Request): string | null {
  let token: string | undefined;

  if ("cookies" in request && typeof (request as NextRequest).cookies?.get === "function") {
    token = (request as NextRequest).cookies.get("auth-token")?.value;
  }

  if (!token) {
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.slice(7);
    }
  }

  if (!token) return null;

  const payload = verifyJwt(token);
  if (!payload || typeof payload.sub !== "string") return null;

  return payload.sub;
}

/**
 * Require authentication for an API route.
 *
 * @returns The authenticated user's Stellar public key.
 * @throws UnauthorizedError if the request has no valid auth.
 */
export function requireAuth(request: NextRequest | Request): string {
  const userId = getUserId(request);
  if (!userId) {
    throw new UnauthorizedError("Authentication required.");
  }
  return userId;
}

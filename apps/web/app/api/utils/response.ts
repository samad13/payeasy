import { NextResponse } from "next/server";
import { isHttpError } from "./errors";

/**
 * Consistent API response shape: { success: boolean, data?: T, error?: string }
 */
export type ApiResponse<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Build a successful JSON response.
 */
export function successResponse<T>(data: T, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true, data } as ApiResponse<T>, { status });
}

/**
 * Build an error JSON response.
 */
export function errorResponse(
  error: string,
  status = 400,
  _code?: string
): NextResponse<ApiResponse<never>> {
  return NextResponse.json(
    { success: false, error } as ApiResponse<never>,
    { status }
  );
}

/**
 * Handle an unknown error and return a consistent API response.
 * Uses HttpError status/message when available; otherwise 500.
 */
export function handleError(err: unknown, requestId?: string): NextResponse<ApiResponse<never>> {
  if (isHttpError(err)) {
    return errorResponse(err.message, err.statusCode);
  }
  const message = err instanceof Error ? err.message : "Internal server error";
  if (requestId) {
    console.error(`[${requestId}]`, err);
  } else {
    console.error(err);
  }
  return errorResponse(message, 500);
}

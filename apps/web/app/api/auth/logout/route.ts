import { NextResponse } from "next/server";
import { getUserId } from "@/lib/api-utils";
import { logAuthEvent, AuthEventType } from "@/lib/security/authLogging";

/**
 * POST /api/auth/logout
 * 
 * Logs out the current user by clearing the auth-token cookie.
 * This route always succeeds, even if no user is logged in.
 */
export async function POST(request: Request) {
  // Capture user ID before clearing cookie
  const publicKey = await getUserId(request);

  if (publicKey) {
    await logAuthEvent({
      publicKey,
      eventType: AuthEventType.LOGOUT,
      status: "SUCCESS",
    }, request);
  }

  const response = NextResponse.json(
    { success: true, data: { message: "Logged out successfully" } },
    { status: 200 }
  );

  // Clear the auth-token cookie by setting it with maxAge: 0
  response.cookies.set("auth-token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0, // Expire immediately
  });

  return response;
}

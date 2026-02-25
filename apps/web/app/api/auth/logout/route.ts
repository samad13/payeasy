import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserId } from "@/lib/api-utils";
import { logAuthEvent, AuthEventType } from "@/lib/security/authLogging";
import { successResponse } from "@/app/api/utils/response";

/**
 * POST /api/auth/logout
 * 
 * Logs out the current user by clearing the auth-token cookie.
 * This route always succeeds, even if no user is logged in.
 */
export async function POST(request: Request) {
  try {
    // Capture user ID before clearing cookie for logging
    const publicKey = await getUserId(request);

    // Log the logout event if we have a user
    if (publicKey) {
      await logAuthEvent({
        publicKey,
        eventType: AuthEventType.LOGOUT,
        status: "SUCCESS",
        metadata: {
          timestamp: new Date().toISOString(),
          userAgent: request.headers.get("user-agent"),
          ip: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
        },
      }, request).catch(err => {
        // Don't let logging errors affect the logout response
        console.error("Failed to log auth event:", err);
      });
    }

    // Create response using either utility or standard NextResponse
    // Using successResponse utility for consistency with other endpoints
    const response = successResponse({ 
      success: true, 
      message: "Logged out successfully" 
    });

    // Clear the auth-token cookie by setting it with maxAge: 0
    response.cookies.set("auth-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 0, // Expire immediately
      ...(process.env.NODE_ENV === "production" && { domain: process.env.COOKIE_DOMAIN }),
    });

    return response;
  } catch (error) {
    // Even if something goes wrong, we should still clear the cookie and return success
    console.error("Error during logout:", error);
    
    // Ensure cookie is cleared even on error
    const fallbackResponse = NextResponse.json(
      { success: true, message: "Logged out successfully" },
      { status: 200 }
    );
    
    fallbackResponse.cookies.set("auth-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 0,
    });
    
    return fallbackResponse;
  }
}

/**
 * GET /api/auth/logout
 * 
 * Alternative method for logout via GET request (useful for simple links)
 * Redirects to home page after logout.
 */
export async function GET(request: Request) {
  try {
    // Capture user ID before clearing cookie for logging
    const publicKey = await getUserId(request);

    // Log the logout event if we have a user
    if (publicKey) {
      await logAuthEvent({
        publicKey,
        eventType: AuthEventType.LOGOUT,
        status: "SUCCESS",
        metadata: {
          timestamp: new Date().toISOString(),
          method: "GET",
        },
      }, request).catch(console.error);
    }

    // Create redirect response
    const response = NextResponse.redirect(new URL("/", request.url));

    // Clear the auth-token cookie
    response.cookies.set("auth-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error("Error during GET logout:", error);
    // Still redirect even on error
    return NextResponse.redirect(new URL("/", request.url));
  }
}
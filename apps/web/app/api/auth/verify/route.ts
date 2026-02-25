import { Request } from "next/server";
import {
  buildMessage,
  isTimestampValid,
  signJwt,
  verifySignature,
} from "@/lib/auth/stellar-auth";
import {
  successResponse,
  errorResponse,
  handleError,
} from "@/app/api/utils/response";
import { logAuthEvent, AuthEventType } from "@/lib/security/authLogging";

const COOKIE_MAX_AGE = 86_400; // 24 hours

/**
 * POST /api/auth/verify
 *
 * Accepts `{ publicKey, signature, nonce, timestamp }`, verifies the Stellar
 * signature, and returns a JWT stored in a secure HTTP-only cookie.
 */
export async function POST(request: Request) {
  const requestId = request.headers.get("x-request-id") ?? undefined;
  let publicKey: string | undefined;

  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return errorResponse("Invalid JSON body", 400);
    }

    const { signature, nonce, timestamp } = body;
    publicKey = body.publicKey;

    // --- Required fields validation ---
    if (!publicKey || !signature || !nonce || timestamp == null) {
      await logAuthEvent(
        {
          publicKey,
          eventType: AuthEventType.LOGIN_FAILURE,
          status: "FAILURE",
          failureReason: "Missing required fields",
        },
        request
      );

      return errorResponse(
        "publicKey, signature, nonce, and timestamp are required",
        400
      );
    }

    // --- Replay protection ---
    if (!isTimestampValid(timestamp)) {
      await logAuthEvent(
        {
          publicKey,
          eventType: AuthEventType.LOGIN_FAILURE,
          status: "FAILURE",
          failureReason: "Challenge expired",
        },
        request
      );

      return errorResponse("Challenge expired", 401);
    }

    // --- Signature verification ---
    const message = buildMessage(nonce, timestamp);
    if (!verifySignature(publicKey, signature, message)) {
      await logAuthEvent(
        {
          publicKey,
          eventType: AuthEventType.LOGIN_FAILURE,
          status: "FAILURE",
          failureReason: "Invalid signature",
        },
        request
      );

      return errorResponse("Invalid signature", 401);
    }

    // --- Issue JWT ---
    const token = signJwt(publicKey);

    await logAuthEvent(
      {
        publicKey,
        eventType: AuthEventType.LOGIN_SUCCESS,
        status: "SUCCESS",
      },
      request
    );

    const response = successResponse({ publicKey });
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: COOKIE_MAX_AGE,
    });

    return response;
  } catch (err) {
    await logAuthEvent(
      {
        publicKey,
        eventType: AuthEventType.LOGIN_FAILURE,
        status: "FAILURE",
        failureReason: "Internal server error during verification",
      },
      request
    );

    return handleError(err, requestId);
  }
}
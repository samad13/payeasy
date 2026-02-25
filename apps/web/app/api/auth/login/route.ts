import { Request } from "next/server";
import { Keypair } from "stellar-sdk";
import { generateChallenge } from "@/lib/auth/stellar-auth";
import {
  successResponse,
  errorResponse,
  handleError,
} from "@/app/api/utils/response";
import { logAuthEvent, AuthEventType } from "@/lib/security/authLogging";

/**
 * POST /api/auth/login
 *
 * Accepts `{ publicKey }` and returns a challenge the client must sign to
 * prove ownership of the corresponding private key.
 */
export async function POST(request: Request) {
  const requestId = request.headers.get("x-request-id") ?? undefined;
  let publicKey: string | undefined;

  try {
    const body = await request.json().catch(() => null);

    if (!body || typeof body.publicKey !== "string") {
      return errorResponse("publicKey is required", 400);
    }

    publicKey = body.publicKey;

    // Validate Stellar public key format
    try {
      Keypair.fromPublicKey(publicKey);
    } catch {
      return errorResponse("Invalid Stellar public key", 400);
    }

    const challenge = generateChallenge();

    // Log challenge generation
    await logAuthEvent(
      {
        publicKey,
        eventType: AuthEventType.CHALLENGE_GENERATED,
        status: "SUCCESS",
        metadata: { nonce: challenge.nonce },
      },
      request
    );

    return successResponse(challenge);
  } catch (err) {
    return handleError(err, requestId);
  }
}
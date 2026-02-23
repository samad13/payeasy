import {
    buildMessage,
    isTimestampValid,
    signJwt,
    verifySignature,
} from "@/lib/auth/stellar-auth";

import { NextResponse } from "next/server";
import { logAuthEvent, AuthEventType } from "@/lib/security/authLogging";

/** Cookie max-age in seconds (24 hours). */
const COOKIE_MAX_AGE = 86_400;

/**
 * POST /api/auth/verify
 *
 * Accepts `{ publicKey, signature, nonce, timestamp }`, verifies the Stellar
 * signature, and returns a JWT token stored in a secure HTTP-only cookie.
 */
export async function POST(request: Request) {
    let publicKey: string | undefined;
    try {
        const body = await request.json();
        ({ publicKey } = body);
        const { signature, nonce, timestamp } = body;

        // --- Input validation ------------------------------------------------

        if (!publicKey || !signature || !nonce || timestamp == null) {
            await logAuthEvent({
                publicKey,
                eventType: AuthEventType.LOGIN_FAILURE,
                status: "FAILURE",
                failureReason: "Missing required fields",
            }, request);

            return NextResponse.json(
                {
                    success: false,
                    error: { message: "publicKey, signature, nonce, and timestamp are required" },
                },
                { status: 400 }
            );
        }

        // --- Replay protection -----------------------------------------------

        if (!isTimestampValid(timestamp)) {
            await logAuthEvent({
                publicKey,
                eventType: AuthEventType.LOGIN_FAILURE,
                status: "FAILURE",
                failureReason: "Challenge expired",
            }, request);

            return NextResponse.json(
                {
                    success: false,
                    error: { message: "Challenge expired. Please request a new login challenge." },
                },
                { status: 401 }
            );
        }

        // --- Signature verification ------------------------------------------

        const message = buildMessage(nonce, timestamp);
        const isValid = verifySignature(publicKey, signature, message);

        if (!isValid) {
            await logAuthEvent({
                publicKey,
                eventType: AuthEventType.LOGIN_FAILURE,
                status: "FAILURE",
                failureReason: "Invalid signature",
            }, request);

            return NextResponse.json(
                {
                    success: false,
                    error: { message: "Invalid signature" },
                },
                { status: 401 }
            );
        }

        // --- Issue JWT -------------------------------------------------------

        const token = signJwt(publicKey);

        // Log success
        await logAuthEvent({
            publicKey,
            eventType: AuthEventType.LOGIN_SUCCESS,
            status: "SUCCESS",
        }, request);

        const response = NextResponse.json({
            success: true,
            data: { publicKey, token },
        });

        // Set the JWT in a secure HTTP-only cookie
        response.cookies.set("auth-token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: COOKIE_MAX_AGE,
        });

        return response;
    } catch {
        await logAuthEvent({
            publicKey,
            eventType: AuthEventType.LOGIN_FAILURE,
            status: "FAILURE",
            failureReason: "Internal server error during verification",
        }, request);

        return NextResponse.json(
            { success: false, error: { message: "Internal server error" } },
            { status: 500 }
        );
    }
}

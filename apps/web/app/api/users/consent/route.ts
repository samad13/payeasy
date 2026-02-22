import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUserId, successResponse, errorResponse } from "@/lib/api-utils";

/**
 * GET /api/users/consent
 * Retrieves consent history for the authenticated user.
 */
export async function GET(request: NextRequest) {
    try {
        const publicKey = getUserId(request);
        if (!publicKey) return errorResponse("Unauthorized", 401, "UNAUTHORIZED");

        const supabase = createAdminClient();

        const { data: user } = await supabase.from("users").select("id").eq("public_key", publicKey).single();
        if (!user) return errorResponse("User not found", 404, "USER_NOT_FOUND");

        const { data: consents, error } = await supabase
            .from("consent_records")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

        if (error) throw error;

        return successResponse({ consents });
    } catch (error) {
        return errorResponse("Internal error", 500, "INTERNAL_ERROR");
    }
}

/**
 * POST /api/users/consent
 * Records a new consent entry for the user.
 * Body: { consentType: string, version: string }
 */
export async function POST(request: NextRequest) {
    try {
        const publicKey = getUserId(request);
        if (!publicKey) return errorResponse("Unauthorized", 401, "UNAUTHORIZED");

        const body = await request.json();
        const { consentType, version } = body;

        if (!consentType || !version) {
            return errorResponse("Missing consentType or version", 400, "BAD_REQUEST");
        }

        const supabase = createAdminClient();

        const { data: user } = await supabase.from("users").select("id").eq("public_key", publicKey).single();
        if (!user) return errorResponse("User not found", 404, "USER_NOT_FOUND");

        const ipAddress = request.headers.get("x-forwarded-for") || request.ip || null;

        const { data: consent, error } = await supabase.from("consent_records").insert({
            user_id: user.id,
            consent_type: consentType,
            version: version,
            ip_address: ipAddress
        }).select().single();

        if (error) throw error;

        await supabase.from("audit_logs").insert({
            user_id: user.id,
            action_type: "RECORD_CONSENT",
            outcome: "SUCCESS",
            details: { consentType, version }
        });

        return successResponse(consent);
    } catch (error) {
        console.error("Consent POST error:", error);
        return errorResponse("Internal error", 500, "INTERNAL_ERROR");
    }
}

/**
 * DELETE /api/users/consent
 * Withdraws a specific consent type by appending a withdrew record
 * Body: { consentType: string }
 */
export async function DELETE(request: NextRequest) {
    try {
        const publicKey = getUserId(request);
        if (!publicKey) return errorResponse("Unauthorized", 401, "UNAUTHORIZED");

        const body = await request.json();
        const { consentType } = body;

        if (!consentType) return errorResponse("Missing consentType", 400, "BAD_REQUEST");

        const supabase = createAdminClient();
        const { data: user } = await supabase.from("users").select("id").eq("public_key", publicKey).single();
        if (!user) return errorResponse("User not found", 404, "USER_NOT_FOUND");

        // We don't delete consent history, we append a withdrawal record (version = withdrawn)
        const { data: consent, error } = await supabase.from("consent_records").insert({
            user_id: user.id,
            consent_type: consentType,
            version: "withdrawn",
            ip_address: request.headers.get("x-forwarded-for") || null
        }).select().single();

        if (error) throw error;

        await supabase.from("audit_logs").insert({
            user_id: user.id,
            action_type: "WITHDRAW_CONSENT",
            outcome: "SUCCESS",
            details: { consentType }
        });

        return successResponse(consent);
    } catch (error) {
        return errorResponse("Internal error", 500, "INTERNAL_ERROR");
    }
}

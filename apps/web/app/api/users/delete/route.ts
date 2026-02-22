import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUserId, successResponse, errorResponse } from "@/lib/api-utils";
import { sendEmail, getAccountDeletionEmailTemplate } from "@/lib/email";

/**
 * DELETE /api/users/delete
 *
 * Irreversibly deletes the authenticated user's account and all associated personal data via exhaustive cascading deletes.
 * An audit log entry is preserved since logs must be immutable.
 */
export async function DELETE(request: NextRequest) {
    try {
        const publicKey = getUserId(request);
        if (!publicKey) {
            return errorResponse("Unauthorized", 401, "UNAUTHORIZED");
        }

        const supabase = createAdminClient();

        // 1. Get user
        const { data: user, error: userError } = await supabase
            .from("users")
            .select("*")
            .eq("public_key", publicKey)
            .single();

        if (userError || !user) {
            return errorResponse("User not found", 404, "USER_NOT_FOUND");
        }

        const userId = user.id;
        const userEmail = user.email;

        // 2. Log deletion start
        await supabase.from("audit_logs").insert({
            user_id: userId,
            action_type: "DELETE_ACCOUNT",
            outcome: "PENDING",
            details: {
                started_at: new Date().toISOString()
            },
        });

        // 3. Exhaustive Cascading Deletes
        // We execute deletes directly to ensure compliance regardless of DB FK constraints

        // 3.1. Messages & Conversations
        await supabase.from("messages").delete().eq("sender_id", userId);
        await supabase.from("conversations").delete().or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

        // 3.2. Payment Records & Rent Agreements
        await supabase.from("payment_records").delete().eq("tenant_id", userId);
        await supabase.from("rent_agreements").delete().eq("landlord_id", userId);

        // 3.3. Favorites & Consents
        await supabase.from("user_favorites").delete().eq("user_id", userId);
        await supabase.from("consent_records").delete().eq("user_id", userId);

        // 3.4. Listings
        await supabase.from("listings").delete().eq("landlord_id", userId);

        // 3.5. Delete User Profile
        const { error: deletionError } = await supabase.from("users").delete().eq("id", userId);

        if (deletionError) {
            // Log failure
            await supabase.from("audit_logs").insert({
                user_id: userId,
                action_type: "DELETE_ACCOUNT",
                outcome: "FAILED",
                details: { error: deletionError }
            });
            return errorResponse("Failed to completely delete account", 500, "DELETE_FAILED");
        }

        // 4. Log successful outcome
        // (Note: audit logs are NOT deleted. This fits the immutability requirement).
        await supabase.from("audit_logs").insert({
            user_id: userId,
            action_type: "DELETE_ACCOUNT",
            outcome: "SUCCESS",
            details: {
                completed_at: new Date().toISOString()
            }
        });

        // 5. Send confirmation email if email existed
        if (userEmail) {
            await sendEmail({
                to: userEmail,
                subject: "Your Account has been Deleted",
                html: getAccountDeletionEmailTemplate(),
            }).catch(err => {
                // Email failure shouldn't fail the already processed deletion
                console.error("Failed to send deletion email", err);
            });
        }

        return successResponse({ deleted: true, userId });

    } catch (error) {
        console.error("Account deletion error:", error);
        return errorResponse("Internal server error", 500, "INTERNAL_ERROR");
    }
}

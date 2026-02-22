import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUserId, errorResponse } from "@/lib/api-utils";

/**
 * GET /api/users/export
 *
 * Exports all user data in JSON or CSV format.
 * Query Parameters:
 *   format: "json" | "csv" (default: "json")
 */
export async function GET(request: NextRequest) {
    try {
        const publicKey = getUserId(request);
        if (!publicKey) {
            return errorResponse("Unauthorized", 401, "UNAUTHORIZED");
        }

        const { searchParams } = new URL(request.url);
        const format = searchParams.get("format") || "json";

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

        // 2. Fetch all related data
        const [
            { data: listings },
            { data: favorites },
            { data: consentRecords },
            { data: userConversations },
            { data: sentMessages },
            { data: paymentRecords },
            { data: rentAgreementsAsLandlord },
        ] = await Promise.all([
            supabase.from("listings").select("*").eq("landlord_id", userId),
            supabase.from("user_favorites").select("*").eq("user_id", userId),
            supabase.from("consent_records").select("*").eq("user_id", userId),
            supabase.from("conversations").select("*").or(`user1_id.eq.${userId},user2_id.eq.${userId}`),
            supabase.from("messages").select("*").eq("sender_id", userId),
            supabase.from("payment_records").select("*").eq("tenant_id", userId),
            supabase.from("rent_agreements").select("*").eq("landlord_id", userId)
        ]);

        // 3. Log audit action
        await supabase.from("audit_logs").insert({
            user_id: userId,
            action_type: "EXPORT_DATA",
            outcome: "SUCCESS",
            details: { format }
        });

        const exportData = {
            user,
            listings: listings || [],
            favorites: favorites || [],
            consentRecords: consentRecords || [],
            conversations: userConversations || [],
            messages: sentMessages || [],
            paymentRecords: paymentRecords || [],
            rentAgreements: rentAgreementsAsLandlord || [],
        };

        if (format === "csv") {
            // Flatten or serialize each dataset as a simplified CSV text payload
            let csvOutput = "--- User Profile ---\n";
            csvOutput += "id,public_key,username,email,created_at\n";
            csvOutput += `${user.id},${user.public_key},${user.username},${user.email || ''},${user.created_at}\n\n`;

            csvOutput += "--- Listings ---\n";
            csvOutput += "id,title,address,rent_xlm,status,created_at\n";
            (listings || []).forEach(l => {
                csvOutput += `${l.id},"${l.title.replace(/"/g, '""')}","${l.address.replace(/"/g, '""')}",${l.rent_xlm},${l.status},${l.created_at}\n`;
            });
            csvOutput += "\n";

            csvOutput += "--- Consent Records ---\n";
            csvOutput += "consent_type,version,ip_address,created_at\n";
            (consentRecords || []).forEach(c => {
                csvOutput += `${c.consent_type},${c.version},${c.ip_address || ''},${c.created_at}\n`;
            });
            csvOutput += "\n";

            csvOutput += "--- Payment Records ---\n";
            csvOutput += "id,amount_xlm,status,payment_period,created_at\n";
            (paymentRecords || []).forEach(p => {
                csvOutput += `${p.id},${p.amount_xlm},${p.status},${p.payment_period},${p.created_at}\n`;
            });
            csvOutput += "\n";

            return new NextResponse(csvOutput, {
                headers: {
                    "Content-Type": "text/csv",
                    "Content-Disposition": `attachment; filename="userdata-${userId}.csv"`,
                },
            });
        }

        return new NextResponse(JSON.stringify(exportData, null, 2), {
            headers: {
                "Content-Type": "application/json",
                "Content-Disposition": `attachment; filename="userdata-${userId}.json"`,
            },
        });

    } catch (error) {
        console.error("Export error:", error);
        return errorResponse("Internal server error", 500, "INTERNAL_ERROR");
    }
}

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/security/monitoring
 * 
 * Fetch authentication events and security alerts for investigation.
 * Requires administrator privileges.
 */
export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Admin check
        const isAdmin = user.app_metadata?.role === "super_admin" ||
            user.user_metadata?.is_admin === true ||
            user.user_metadata?.is_admin === "true";

        if (!isAdmin) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const type = searchParams.get("type") || "events"; // 'events' or 'alerts'
        const publicKey = searchParams.get("public_key");
        const limit = parseInt(searchParams.get("limit") || "50", 10);
        const offset = parseInt(searchParams.get("offset") || "0", 10);

        const table = type === "alerts" ? "security_alerts" : "auth_events";

        let query = supabase
            .from(table)
            .select("*", { count: "exact" })
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1);

        if (publicKey) {
            query = query.eq("public_key", publicKey);
        }

        const { data, error, count } = await query;

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            data,
            meta: {
                total: count,
                limit,
                offset,
                type
            }
        });
    } catch (err) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

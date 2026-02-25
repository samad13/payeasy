import { NextRequest } from "next/server";
import { createClient } from "@/lib/superbase/server";
import { successResponse, handleError } from "@/app/api/utils/response";
import { requireAuth } from "@/app/api/utils/auth";

/**
 * GET /api/users/profile
 *
 * Returns the authenticated user profile (public key and DB profile if present).
 */
export async function GET(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") ?? undefined;
  try {
    const publicKey = requireAuth(request);
    const supabase = await createClient();
    if (!supabase) {
      return successResponse({ publicKey, profile: null });
    }
    const { data: profile } = await supabase
      .from("users")
      .select("id, public_key, username, email, avatar_url, bio, created_at, updated_at")
      .eq("public_key", publicKey)
      .maybeSingle();

    return successResponse({
      publicKey,
      profile: profile ?? null,
    });
  } catch (err) {
    return handleError(err, requestId);
  }
}

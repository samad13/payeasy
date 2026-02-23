import { type NextRequest } from "next/server";
import { getUserId, successResponse, errorResponse } from "@/lib/api-utils";
import { getServerClient } from "@/lib/supabase/server";
import { getMockUserById } from "@/lib/mock/users";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Simulate artificial delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  const mockData = getMockUserById(id);

  if (!mockData) {
    return errorResponse("User not found", 404);
  }

  return successResponse(mockData);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idParam } = await params;
    const supabase = await getServerClient();

    let targetId: string | null = null;
    if (idParam === "me") {
      targetId = getUserId(request) as string | null;
      if (!targetId) return errorResponse("Unauthorized", 401);
    } else {
      targetId = idParam;
    }

    // Only the owner may update their profile (service role can bypass)
    const requester = getUserId(request);
    if (requester !== targetId) return errorResponse("Forbidden", 403);

    const body = await request.json();
    const { username, email, avatar_url, bio } = body as {
      username?: string;
      email?: string | null;
      avatar_url?: string | null;
      bio?: string | null;
    };

    const update: Record<string, unknown> = {};
    if (typeof username === "string") update.username = username;
    if (typeof email === "string" || email === null) update.email = email;
    if (typeof avatar_url === "string" || avatar_url === null) update.avatar_url = avatar_url;
    if (typeof bio === "string" || bio === null) update.bio = bio;

    if (Object.keys(update).length === 0) return errorResponse("No valid fields to update", 400);

    const { data: updated, error: updErr } = await supabase
      .from("users")
      .update(update)
      .eq("id", targetId)
      .select("id,username,email,public_key,avatar_url,bio,created_at")
      .maybeSingle();

    if (updErr) return errorResponse(updErr.message, 400);
    if (!updated) return errorResponse("User not found", 404);

    return successResponse(updated);
  } catch (err) {
    return errorResponse("Internal server error", 500);
  }
}

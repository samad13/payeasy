import { type NextRequest, NextResponse } from "next/server";
import { getUserId, successResponse, errorResponse } from "@/lib/api-utils";
import { createClient } from "@/lib/supabase/server";
import { userUpdateSchema } from "@/lib/types/validation";

/**
 * GET /api/users/[id]
 *
 * Supports lookup by UUID or by public_key (Stellar G...).
 * Pass "me" to resolve the authenticated user.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const supabase = await createClient();

    let targetId: string | null = null;
    if (idParam === "me") {
      targetId = getUserId(request) as string | null;
      if (!targetId) return errorResponse("Unauthorized", 401);
    } else {
      targetId = idParam;
    }

    // Support lookup by UUID or by Stellar public key
    const isPublicKey = targetId.startsWith("G") && targetId.length === 56;
    const { data: user, error: userErr } = await supabase
      .from("users")
      .select("id,username,email,public_key,avatar_url,bio,created_at")
      .match(isPublicKey ? { public_key: targetId } : { id: targetId })
      .maybeSingle();

    if (userErr) return errorResponse(userErr.message, 400);
    if (!user) return errorResponse("User not found", 404);

    return successResponse(user);
  } catch (err) {
    return errorResponse("Internal server error", 500);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idParam } = await params;
    const supabase = await createClient();

    let targetId: string | null = null;
    if (idParam === "me") {
      targetId = getUserId(request) as string | null;
      if (!targetId) return errorResponse("Unauthorized", 401);
    } else {
      targetId = idParam;
    }

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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.id !== id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    const validationResult = userUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("users")
      .update(validationResult.data)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Failed to update user profile:", error);
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Unexpected error in PUT /api/users/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
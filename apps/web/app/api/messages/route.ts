import { Request } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse, handleError } from "@/app/api/utils";

export async function POST(request: Request) {
  const requestId = request.headers.get("x-request-id") ?? undefined;

  try {
    const supabase = await createClient();
    if (!supabase) {
      return errorResponse("Supabase is not configured.", 503);
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return errorResponse("Invalid JSON body", 400);
    }

    const { receiver_id, listing_id, content } = body;

    const { data, error } = await supabase
      .from("messages")
      .insert({
        sender_id: user.id,
        receiver_id,
        listing_id,
        content,
      })
      .select()
      .single();

    if (error) {
      return errorResponse(error.message, 400);
    }

    return successResponse(data, 201);
  } catch (err) {
    return handleError(err, requestId);
  }
}
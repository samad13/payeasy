import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { successResponse, errorResponse, getUserId } from "@/lib/api-utils";
import type { ConversationPreview } from "@/lib/types/messages";

/**
 * GET /api/conversations
 *
 * List all conversations for the authenticated user, ordered by most
 * recent activity (updated_at DESC). Each entry includes the last
 * message preview and participant list.
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate
    const userId = getUserId(request);
    if (!userId) {
      return errorResponse("Authentication required.", 401, "UNAUTHORIZED");
    }

    // 2. Get conversation IDs the user participates in
    const { data: participations, error: partError } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", userId);

    if (partError) {
      console.error("Failed to fetch participations:", partError);
      return errorResponse("Failed to load conversations.", 500, "INTERNAL_ERROR");
    }

    if (!participations || participations.length === 0) {
      return successResponse<ConversationPreview[]>([]);
    }

    const conversationIds = participations.map((p) => p.conversation_id);

    // 3. Fetch conversations with metadata
    const { data: conversations, error: convError } = await supabase
      .from("conversations")
      .select("id, created_at, updated_at")
      .in("id", conversationIds)
      .order("updated_at", { ascending: false });

    if (convError) {
      console.error("Failed to fetch conversations:", convError);
      return errorResponse("Failed to load conversations.", 500, "INTERNAL_ERROR");
    }

    // 4. Batch-load last messages + participants to avoid N+1 queries
    const [{ data: lastMessages, error: lastMessageError }, { data: participants, error: participantError }] =
      await Promise.all([
        supabase
          .from("conversation_last_messages")
          .select("conversation_id, content, sender_id, created_at")
          .in("conversation_id", conversationIds),
        supabase
          .from("conversation_participants")
          .select("id, user_id, conversation_id")
          .in("conversation_id", conversationIds),
      ]);

    if (lastMessageError) {
      console.error("Failed to fetch last messages:", lastMessageError);
      return errorResponse("Failed to load conversations.", 500, "INTERNAL_ERROR");
    }

    if (participantError) {
      console.error("Failed to fetch participants:", participantError);
      return errorResponse("Failed to load conversations.", 500, "INTERNAL_ERROR");
    }

    const lastMessageMap = new Map(
      (lastMessages ?? []).map((message) => [
        message.conversation_id,
        {
          content: message.content,
          sender_id: message.sender_id,
          created_at: message.created_at,
        },
      ])
    );

    const participantsMap = new Map<string, { id: string; user_id: string }[]>();
    (participants ?? []).forEach((participant) => {
      const list = participantsMap.get(participant.conversation_id) ?? [];
      list.push({ id: participant.id, user_id: participant.user_id });
      participantsMap.set(participant.conversation_id, list);
    });

    const previews: ConversationPreview[] = (conversations ?? []).map((conv) => ({
      id: conv.id,
      created_at: conv.created_at,
      updated_at: conv.updated_at,
      last_message: lastMessageMap.get(conv.id) ?? null,
      participants: participantsMap.get(conv.id) ?? [],
    }));

    return successResponse(previews);
  } catch (err) {
    console.error("GET /api/conversations error:", err);
    return errorResponse("Internal server error.", 500, "INTERNAL_ERROR");
  }
}

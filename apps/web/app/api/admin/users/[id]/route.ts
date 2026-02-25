import { type NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-utils";
import { getMockAdminUsers, type AdminUser } from "../route";

export interface AdminUserDetail extends AdminUser {
  activity_log: ActivityEvent[];
}

export interface ActivityEvent {
  id: string;
  type: "listing" | "payment" | "profile" | "auth" | "admin";
  description: string;
  created_at: string;
}

function buildUserDetail(user: AdminUser): AdminUserDetail {
  const activityLog: ActivityEvent[] = [
    {
      id: `${user.id}-act-1`,
      type: "auth",
      description: "User account created",
      created_at: user.created_at,
    },
    ...(user.verified
      ? [
          {
            id: `${user.id}-act-2`,
            type: "admin" as const,
            description: "Account verified by admin",
            created_at: user.updated_at,
          },
        ]
      : []),
    ...(user.listings_count > 0
      ? [
          {
            id: `${user.id}-act-3`,
            type: "listing" as const,
            description: `Created ${user.listings_count} listing${user.listings_count !== 1 ? "s" : ""}`,
            created_at: new Date(
              new Date(user.created_at).getTime() + 7 * 24 * 60 * 60 * 1000
            ).toISOString(),
          },
        ]
      : []),
    ...(user.payments_count > 0
      ? [
          {
            id: `${user.id}-act-4`,
            type: "payment" as const,
            description: `Processed ${user.payments_count} payment${user.payments_count !== 1 ? "s" : ""}`,
            created_at: user.last_active ?? user.updated_at,
          },
        ]
      : []),
    ...(user.status === "suspended"
      ? [
          {
            id: `${user.id}-act-5`,
            type: "admin" as const,
            description: "Account suspended by admin",
            created_at: user.updated_at,
          },
        ]
      : []),
    ...(user.status === "banned"
      ? [
          {
            id: `${user.id}-act-6`,
            type: "admin" as const,
            description: "Account banned by admin",
            created_at: user.updated_at,
          },
        ]
      : []),
  ].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return { ...user, activity_log: activityLog };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await new Promise((r) => setTimeout(r, 400));

  const { id } = await params;
  const users = getMockAdminUsers();
  const user = users.find((u) => u.id === id);

  if (!user) {
    return errorResponse("User not found", 404);
  }

  return successResponse(buildUserDetail(user));
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const users = getMockAdminUsers();
    const user = users.find((u) => u.id === id);

    if (!user) {
      return errorResponse("User not found", 404);
    }

    const body = await request.json();
    const allowed = ["status", "verified", "username", "email", "bio"];
    const update: Partial<AdminUser> = {};

    for (const key of allowed) {
      if (key in body) {
        (update as Record<string, unknown>)[key] = body[key];
      }
    }

    if (Object.keys(update).length === 0) {
      return errorResponse("No valid fields to update", 400);
    }

    // Simulate DB update – merge with mock record
    const updated: AdminUser = {
      ...user,
      ...update,
      updated_at: new Date().toISOString(),
    };

    return successResponse(buildUserDetail(updated));
  } catch {
    return errorResponse("Internal server error", 500);
  }
}

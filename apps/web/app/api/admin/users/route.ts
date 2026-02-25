import { type NextRequest } from "next/server";
import { successResponse } from "@/lib/api-utils";

export interface AdminUser {
  id: string;
  username: string;
  email: string | null;
  avatar_url: string | null;
  public_key: string;
  bio: string | null;
  created_at: string;
  updated_at: string;
  status: "active" | "suspended" | "banned";
  verified: boolean;
  listings_count: number;
  payments_count: number;
  last_active: string | null;
}

const MOCK_ADMIN_USERS: AdminUser[] = [
  {
    id: "user-1",
    username: "alice_wonder",
    email: "alice@example.com",
    avatar_url: "https://i.pravatar.cc/150?u=alice_wonder",
    bio: "Avid traveler and property enthusiast. Always looking for unique stays.",
    public_key: "GBFCPKHFTJPICMUBV56BKKKGWN7OOCQXHJ7H3Z6N5KXLX7QPWCJWZL",
    created_at: "2023-01-15T00:00:00.000Z",
    updated_at: "2024-06-01T00:00:00.000Z",
    status: "active",
    verified: true,
    listings_count: 2,
    payments_count: 8,
    last_active: "2026-02-20T10:00:00.000Z",
  },
  {
    id: "user-2",
    username: "bob_builder",
    email: "bob@example.com",
    avatar_url: null,
    bio: "Renovating homes and renting them out. Ask me about long-term stays.",
    public_key: "GAHJJJKMOKYE4RVPZEWZTKH5FVI4PA3VL7GK2LFNUBSGBDAGC7BFLE",
    created_at: "2022-11-10T00:00:00.000Z",
    updated_at: "2024-07-20T00:00:00.000Z",
    status: "active",
    verified: true,
    listings_count: 1,
    payments_count: 15,
    last_active: "2026-02-18T14:30:00.000Z",
  },
  {
    id: "user-3",
    username: "charlie_chef",
    email: "charlie@example.com",
    avatar_url: "https://i.pravatar.cc/150?u=charlie_chef",
    bio: "Foodie and host. My places are near the best restaurants!",
    public_key: "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGKN7BJKTJCW2PCGVXH3WB",
    created_at: "2023-08-05T00:00:00.000Z",
    updated_at: "2024-08-05T00:00:00.000Z",
    status: "suspended",
    verified: false,
    listings_count: 0,
    payments_count: 2,
    last_active: "2026-01-10T09:00:00.000Z",
  },
  {
    id: "user-4",
    username: "diana_prince",
    email: "diana@example.com",
    avatar_url: "https://i.pravatar.cc/150?u=diana_prince",
    bio: "Professional property manager with 10+ years of experience.",
    public_key: "GDQJUTQYK2MQX2DPDC7WWGM4WPGCF5HUFAAWBCBKYXK7QXKJQ7MZBX",
    created_at: "2022-05-20T00:00:00.000Z",
    updated_at: "2024-09-10T00:00:00.000Z",
    status: "active",
    verified: true,
    listings_count: 5,
    payments_count: 42,
    last_active: "2026-02-22T16:00:00.000Z",
  },
  {
    id: "user-5",
    username: "eve_techie",
    email: "eve@example.com",
    avatar_url: "https://i.pravatar.cc/150?u=eve_techie",
    bio: null,
    public_key: "GBRPYHIL2CI3FNQ4BXLFMNDLFJUNPU2HY3ZMFSHONUCEOASW7QC7OX2",
    created_at: "2023-03-01T00:00:00.000Z",
    updated_at: "2024-03-01T00:00:00.000Z",
    status: "banned",
    verified: false,
    listings_count: 0,
    payments_count: 0,
    last_active: "2025-11-05T08:00:00.000Z",
  },
  {
    id: "user-6",
    username: "frank_ocean",
    email: "frank@example.com",
    avatar_url: "https://i.pravatar.cc/150?u=frank_ocean",
    bio: "Love the ocean view. Renting my beach house part-time.",
    public_key: "GDRVKEYG7G4KHKKHB3DHKKWX2QJPQMTPSJKBF3QICBHYTM7RCFZ6OE",
    created_at: "2023-06-15T00:00:00.000Z",
    updated_at: "2024-10-15T00:00:00.000Z",
    status: "active",
    verified: true,
    listings_count: 1,
    payments_count: 6,
    last_active: "2026-02-21T11:30:00.000Z",
  },
  {
    id: "user-7",
    username: "grace_hopper",
    email: "grace@example.com",
    avatar_url: "https://i.pravatar.cc/150?u=grace_hopper",
    bio: "Engineer turned property investor. Tech-savvy landlord.",
    public_key: "GCFZB6L43AL5OVLJX72VKBW3Y5YQVL45QCNYWMXRSGKXBK2ELPGZGE",
    created_at: "2022-09-30T00:00:00.000Z",
    updated_at: "2024-11-30T00:00:00.000Z",
    status: "active",
    verified: true,
    listings_count: 3,
    payments_count: 27,
    last_active: "2026-02-19T09:45:00.000Z",
  },
  {
    id: "user-8",
    username: "henry_ford",
    email: null,
    avatar_url: "https://i.pravatar.cc/150?u=henry_ford",
    bio: "Old-school landlord, new-school crypto payments.",
    public_key: "GDFOROPCGXAA4IQHEKKWK3LQYXR3KW3FK3RJWHXQXJ5ZWLBXNHQB42",
    created_at: "2023-11-20T00:00:00.000Z",
    updated_at: "2024-12-20T00:00:00.000Z",
    status: "active",
    verified: false,
    listings_count: 4,
    payments_count: 19,
    last_active: "2026-02-15T14:00:00.000Z",
  },
  {
    id: "user-9",
    username: "iris_west",
    email: "iris@example.com",
    avatar_url: null,
    bio: null,
    public_key: "GCGX3BKPVPXXUQJBQ4WFPMLGCXKECUQ6GK3VDJDGV4WQXB7NXRCYVT",
    created_at: "2024-01-05T00:00:00.000Z",
    updated_at: "2024-02-05T00:00:00.000Z",
    status: "suspended",
    verified: false,
    listings_count: 0,
    payments_count: 1,
    last_active: "2025-12-01T10:00:00.000Z",
  },
  {
    id: "user-10",
    username: "jack_sparrow",
    email: "jack@example.com",
    avatar_url: "https://i.pravatar.cc/150?u=jack_sparrow",
    bio: "Sailing the seas of blockchain real estate.",
    public_key: "GDKIJJIKXLOM2NRMPNQBN2BSICP3QLZGD4KQPXG9QMJ2ZOPNWRQIAW",
    created_at: "2022-12-01T00:00:00.000Z",
    updated_at: "2025-01-01T00:00:00.000Z",
    status: "active",
    verified: true,
    listings_count: 7,
    payments_count: 63,
    last_active: "2026-02-23T08:15:00.000Z",
  },
  {
    id: "user-11",
    username: "kate_bishop",
    email: "kate@example.com",
    avatar_url: "https://i.pravatar.cc/150?u=kate_bishop",
    bio: "Archer-turned-landlord. Sharp on property deals.",
    public_key: "GBPXX3QHVPCLX3QXMXQNMXGXQKP6MHKPXQYXTPXQX5X4XQYXTPXQXY",
    created_at: "2024-02-14T00:00:00.000Z",
    updated_at: "2024-03-14T00:00:00.000Z",
    status: "active",
    verified: false,
    listings_count: 1,
    payments_count: 3,
    last_active: "2026-02-10T12:00:00.000Z",
  },
  {
    id: "user-12",
    username: "leo_messi",
    email: "leo@example.com",
    avatar_url: "https://i.pravatar.cc/150?u=leo_messi",
    bio: "Champion of finding perfect rental homes.",
    public_key: "GADZ7ZQFQXLQPXMNXBLBML7YQQ6VRMKXIXLPXZQQ5XQ4XQZXPXZQZX",
    created_at: "2023-07-10T00:00:00.000Z",
    updated_at: "2024-07-10T00:00:00.000Z",
    status: "banned",
    verified: false,
    listings_count: 0,
    payments_count: 0,
    last_active: "2025-10-20T16:00:00.000Z",
  },
  {
    id: "user-13",
    username: "maya_angelou",
    email: "maya@example.com",
    avatar_url: "https://i.pravatar.cc/150?u=maya_angelou",
    bio: "Writer and property curator. Every space tells a story.",
    public_key: "GBNQQQQQ5XQYXQXQXQXQXQXQXQXQXQXQXQXQXQXQXQXQXQXQXQXQZ",
    created_at: "2022-08-25T00:00:00.000Z",
    updated_at: "2025-02-25T00:00:00.000Z",
    status: "active",
    verified: true,
    listings_count: 2,
    payments_count: 11,
    last_active: "2026-02-24T07:30:00.000Z",
  },
  {
    id: "user-14",
    username: "nick_fury",
    email: "nick@example.com",
    avatar_url: "https://i.pravatar.cc/150?u=nick_fury",
    bio: "Director-level experience in real estate management.",
    public_key: "GCQXXQZQXQXQXQXQXQXQXQXQXQXQXQXQXQXQXQXQXQXQXQXQXQXQXQ",
    created_at: "2022-03-15T00:00:00.000Z",
    updated_at: "2025-03-15T00:00:00.000Z",
    status: "active",
    verified: true,
    listings_count: 6,
    payments_count: 48,
    last_active: "2026-02-23T18:00:00.000Z",
  },
  {
    id: "user-15",
    username: "olivia_newton",
    email: "olivia@example.com",
    avatar_url: "https://i.pravatar.cc/150?u=olivia_newton",
    bio: null,
    public_key: "GDZXQXQXQXQXQXQXQXQXQXQXQXQXQXQXQXQXQXQXQXQXQXQXQXQXQX",
    created_at: "2024-04-01T00:00:00.000Z",
    updated_at: "2024-05-01T00:00:00.000Z",
    status: "active",
    verified: false,
    listings_count: 0,
    payments_count: 2,
    last_active: "2026-01-30T11:00:00.000Z",
  },
];

export const getMockAdminUsers = () => MOCK_ADMIN_USERS;

export async function GET(request: NextRequest) {
  await new Promise((r) => setTimeout(r, 400));

  const { searchParams } = request.nextUrl;
  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "all";
  const sort = searchParams.get("sort") ?? "created_at";
  const order = searchParams.get("order") ?? "desc";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const pageSize = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("pageSize") ?? "10", 10))
  );

  let users = [...MOCK_ADMIN_USERS];

  if (search) {
    const q = search.toLowerCase();
    users = users.filter(
      (u) =>
        u.username.toLowerCase().includes(q) ||
        (u.email && u.email.toLowerCase().includes(q))
    );
  }

  if (status !== "all") {
    users = users.filter((u) => u.status === status);
  }

  const sortableFields = [
    "username",
    "email",
    "created_at",
    "listings_count",
    "payments_count",
    "status",
  ];
  if (sortableFields.includes(sort)) {
    users.sort((a, b) => {
      const aVal = String(a[sort as keyof AdminUser] ?? "");
      const bVal = String(b[sort as keyof AdminUser] ?? "");
      const cmp = aVal.localeCompare(bVal, undefined, { numeric: true });
      return order === "asc" ? cmp : -cmp;
    });
  }

  const total = users.length;
  const start = (page - 1) * pageSize;
  const paginated = users.slice(start, start + pageSize);

  const stats = {
    total: MOCK_ADMIN_USERS.length,
    active: MOCK_ADMIN_USERS.filter((u) => u.status === "active").length,
    suspended: MOCK_ADMIN_USERS.filter((u) => u.status === "suspended").length,
    banned: MOCK_ADMIN_USERS.filter((u) => u.status === "banned").length,
    verified: MOCK_ADMIN_USERS.filter((u) => u.verified).length,
  };

  return successResponse({ users: paginated, total, page, pageSize, stats });
}

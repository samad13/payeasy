"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Search,
  Users,
  UserCheck,
  UserX,
  AlertCircle,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  RefreshCw,
  Shield,
  ShieldOff,
} from "lucide-react";
import { TablePagination, type SortDirection } from "@/components/responsive/Table";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

interface AdminUser {
  id: string;
  username: string;
  email: string | null;
  avatar_url: string | null;
  public_key: string;
  created_at: string;
  status: "active" | "suspended" | "banned";
  verified: boolean;
  listings_count: number;
  payments_count: number;
  last_active: string | null;
}

interface UsersResponse {
  users: AdminUser[];
  total: number;
  page: number;
  pageSize: number;
  stats: {
    total: number;
    active: number;
    suspended: number;
    banned: number;
    verified: number;
  };
}

type StatusFilter = "all" | "active" | "suspended" | "banned";
type SortField =
  | "username"
  | "email"
  | "created_at"
  | "listings_count"
  | "payments_count"
  | "status";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function truncateKey(key: string) {
  return `${key.slice(0, 6)}…${key.slice(-4)}`;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: AdminUser["status"] }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap",
        status === "active" &&
          "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25",
        status === "suspended" &&
          "bg-yellow-500/15 text-yellow-400 border border-yellow-500/25",
        status === "banned" &&
          "bg-red-500/15 text-red-400 border border-red-500/25"
      )}
    >
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full",
          status === "active" && "bg-emerald-400",
          status === "suspended" && "bg-yellow-400",
          status === "banned" && "bg-red-400"
        )}
      />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function UserAvatar({
  user,
  size = "sm",
}: {
  user: Pick<AdminUser, "username" | "avatar_url">;
  size?: "sm" | "md";
}) {
  const sz = size === "sm" ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm";
  if (user.avatar_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={user.avatar_url}
        alt={user.username}
        className={cn("rounded-full object-cover flex-shrink-0", sz)}
      />
    );
  }
  return (
    <div
      className={cn(
        "rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0 font-semibold text-primary",
        sz
      )}
    >
      {user.username.charAt(0).toUpperCase()}
    </div>
  );
}

function SortIcon({
  column,
  sortBy,
  sortDir,
}: {
  column: string;
  sortBy: string | null;
  sortDir: SortDirection;
}) {
  if (sortBy !== column)
    return (
      <ChevronsUpDown className="h-3 w-3 text-gray-500 flex-shrink-0" />
    );
  if (sortDir === "asc")
    return <ChevronUp className="h-3 w-3 text-primary flex-shrink-0" />;
  return <ChevronDown className="h-3 w-3 text-primary flex-shrink-0" />;
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4">
      <div className={cn("p-2.5 rounded-lg", color)}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-white tabular-nums">{value}</p>
        <p className="text-xs text-gray-400 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

// ── Page Component ────────────────────────────────────────────────────────────

export default function AdminUsersPage() {
  const [data, setData] = useState<UsersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<SortField>("created_at");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce search input
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        search: debouncedSearch,
        status: statusFilter,
        sort: sortBy,
        order: sortDir ?? "desc",
        page: String(page),
        pageSize: String(pageSize),
      });
      const res = await fetch(`/api/admin/users?${params}`);
      if (!res.ok) throw new Error("Failed to load users");
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message ?? "Unknown error");
      setData(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter, sortBy, sortDir, page, pageSize]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  function handleSort(col: SortField) {
    if (sortBy === col) {
      setSortDir((d) => (d === "asc" ? "desc" : d === "desc" ? null : "asc"));
    } else {
      setSortBy(col);
      setSortDir("asc");
    }
    setPage(1);
  }

  function handleStatusFilter(s: StatusFilter) {
    setStatusFilter(s);
    setPage(1);
  }

  const stats = data?.stats;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <p className="text-gray-400 text-sm mt-1">
            View, search, and manage all platform users.
          </p>
        </div>
        <button
          onClick={fetchUsers}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-300 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors disabled:opacity-50"
          aria-label="Refresh users"
        >
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Stat cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            icon={Users}
            label="Total Users"
            value={stats.total}
            color="bg-primary/20 text-primary"
          />
          <StatCard
            icon={UserCheck}
            label="Active"
            value={stats.active}
            color="bg-emerald-500/20 text-emerald-400"
          />
          <StatCard
            icon={AlertCircle}
            label="Suspended"
            value={stats.suspended}
            color="bg-yellow-500/20 text-yellow-400"
          />
          <StatCard
            icon={UserX}
            label="Banned"
            value={stats.banned}
            color="bg-red-500/20 text-red-400"
          />
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by username or email…"
            className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-colors"
          />
        </div>

        {/* Status filter pills */}
        <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg p-1">
          {(["all", "active", "suspended", "banned"] as StatusFilter[]).map(
            (s) => (
              <button
                key={s}
                onClick={() => handleStatusFilter(s)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors",
                  statusFilter === s
                    ? s === "all"
                      ? "bg-white/15 text-white"
                      : s === "active"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : s === "suspended"
                      ? "bg-yellow-500/20 text-yellow-400"
                      : "bg-red-500/20 text-red-400"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
              >
                {s}
              </button>
            )
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        {/* Error state */}
        {error && (
          <div className="p-8 text-center">
            <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-3" />
            <p className="text-red-400 text-sm">{error}</p>
            <button
              onClick={fetchUsers}
              className="mt-3 text-sm text-gray-400 hover:text-white underline"
            >
              Try again
            </button>
          </div>
        )}

        {!error && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/3">
                  {(
                    [
                      { id: "username", label: "User" },
                      { id: "email", label: "Email", hide: true },
                      { id: "status", label: "Status" },
                      { id: "listings_count", label: "Listings", align: "right" },
                      { id: "payments_count", label: "Payments", align: "right", hide: true },
                      { id: "created_at", label: "Joined" },
                    ] as {
                      id: SortField;
                      label: string;
                      align?: "right";
                      hide?: boolean;
                    }[]
                  ).map((col) => (
                    <th
                      key={col.id}
                      onClick={() => handleSort(col.id)}
                      className={cn(
                        "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400 cursor-pointer select-none hover:text-white transition-colors whitespace-nowrap",
                        col.align === "right" && "text-right",
                        col.hide && "hidden md:table-cell"
                      )}
                    >
                      <span className="inline-flex items-center gap-1">
                        {col.label}
                        <SortIcon
                          column={col.id}
                          sortBy={sortBy}
                          sortDir={sortDir}
                        />
                      </span>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-400 w-20">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  Array.from({ length: pageSize > 5 ? 5 : pageSize }).map(
                    (_, i) => (
                      <tr key={i} className="animate-pulse">
                        {Array.from({ length: 7 }).map((__, j) => (
                          <td key={j} className="px-4 py-3.5">
                            <div className="h-3 rounded-full bg-white/10 w-3/4" />
                          </td>
                        ))}
                      </tr>
                    )
                  )
                ) : data?.users.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-16 text-center text-sm text-gray-500"
                    >
                      <Users className="h-8 w-8 mx-auto mb-3 opacity-30" />
                      No users found
                      {(search || statusFilter !== "all") && (
                        <span className="block mt-1 text-xs">
                          Try adjusting your search or filters
                        </span>
                      )}
                    </td>
                  </tr>
                ) : (
                  data?.users.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      {/* User cell */}
                      <td className="px-4 py-3.5">
                        <Link
                          href={`/admin/users/${user.id}`}
                          className="flex items-center gap-3 min-w-0"
                        >
                          <UserAvatar user={user} />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-medium text-white truncate">
                                {user.username}
                              </span>
                              {user.verified && (
                                <Shield
                                  className="h-3.5 w-3.5 text-primary flex-shrink-0"
                                  aria-label="Verified"
                                />
                              )}
                            </div>
                            <span className="text-xs text-gray-500 font-mono">
                              {truncateKey(user.public_key)}
                            </span>
                          </div>
                        </Link>
                      </td>

                      {/* Email */}
                      <td className="px-4 py-3.5 text-gray-400 hidden md:table-cell">
                        {user.email ?? (
                          <span className="text-gray-600 italic">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <StatusBadge status={user.status} />
                      </td>

                      {/* Listings */}
                      <td className="px-4 py-3.5 text-right text-gray-300 tabular-nums">
                        {user.listings_count}
                      </td>

                      {/* Payments */}
                      <td className="px-4 py-3.5 text-right text-gray-300 tabular-nums hidden md:table-cell">
                        {user.payments_count}
                      </td>

                      {/* Joined */}
                      <td className="px-4 py-3.5 text-gray-400 whitespace-nowrap">
                        {formatDate(user.created_at)}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <Link
                          href={`/admin/users/${user.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!error && data && data.total > 0 && (
          <div className="border-t border-white/10">
            <TablePagination
              page={page}
              pageSize={pageSize}
              total={data.total}
              onPageChange={setPage}
              onPageSizeChange={(s) => {
                setPageSize(s);
                setPage(1);
              }}
              className="[&_p]:text-gray-400 [&_button]:border-white/10 [&_button]:bg-white/5 [&_button:not(:disabled)]:hover:bg-white/10 [&_button]:text-gray-300 [&_span]:text-gray-400 [&_select]:bg-slate-900 [&_select]:border-white/10 [&_select]:text-gray-300"
            />
          </div>
        )}
      </div>
    </div>
  );
}

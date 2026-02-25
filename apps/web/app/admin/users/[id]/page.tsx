"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Shield,
  ShieldOff,
  Ban,
  UserX,
  UserCheck,
  Edit,
  Mail,
  Key,
  Calendar,
  Clock,
  Home,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Activity,
  Loader2,
} from "lucide-react";
import { ResponsiveModal, ConfirmModal } from "@/components/responsive/Modal";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

interface AdminUser {
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

interface ActivityEvent {
  id: string;
  type: "listing" | "payment" | "profile" | "auth" | "admin";
  description: string;
  created_at: string;
}

interface AdminUserDetail extends AdminUser {
  activity_log: ActivityEvent[];
}

type Action = "edit" | "verify" | "unverify" | "suspend" | "unsuspend" | "ban" | "unban";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 30) return `${diffDays}d ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: AdminUser["status"] }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium",
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
          "w-2 h-2 rounded-full",
          status === "active" && "bg-emerald-400",
          status === "suspended" && "bg-yellow-400",
          status === "banned" && "bg-red-400"
        )}
      />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function ActivityIcon({ type }: { type: ActivityEvent["type"] }) {
  const cls = "h-4 w-4";
  if (type === "listing")
    return <Home className={cn(cls, "text-blue-400")} />;
  if (type === "payment")
    return <CreditCard className={cn(cls, "text-emerald-400")} />;
  if (type === "auth")
    return <Key className={cn(cls, "text-purple-400")} />;
  if (type === "admin")
    return <Shield className={cn(cls, "text-primary")} />;
  return <Activity className={cn(cls, "text-gray-400")} />;
}

function InfoRow({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-white/5 last:border-0">
      <Icon className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-500 mb-0.5">{label}</p>
        <p className={cn("text-sm text-gray-200 break-all", mono && "font-mono text-xs text-gray-300")}>
          {value}
        </p>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
      <div className={cn("inline-flex p-2 rounded-lg mb-2", color)}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-2xl font-bold text-white tabular-nums">{value}</p>
      <p className="text-xs text-gray-400 mt-0.5">{label}</p>
    </div>
  );
}

// ── Page Component ────────────────────────────────────────────────────────────

export default function AdminUserDetailPage() {
  const params = useParams<{ id: string }>();
  const userId = params.id;

  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Modal state
  const [confirmAction, setConfirmAction] = useState<Action | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    username: "",
    email: "",
    bio: "",
  });

  const fetchUser = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}`);
      if (!res.ok) {
        if (res.status === 404) throw new Error("User not found");
        throw new Error("Failed to load user");
      }
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message ?? "Unknown error");
      setUser(json.data);
      setEditForm({
        username: json.data.username,
        email: json.data.email ?? "",
        bio: json.data.bio ?? "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load user");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  async function performAction(
    patch: Partial<AdminUser>,
    successMsg: string
  ) {
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const json = await res.json();
      if (!res.ok || !json.success)
        throw new Error(json.error?.message ?? "Action failed");
      setUser(json.data);
      setActionSuccess(successMsg);
      setTimeout(() => setActionSuccess(null), 3500);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setActionLoading(false);
    }
  }

  function handleConfirmedAction(action: Action) {
    setConfirmAction(null);
    switch (action) {
      case "verify":
        return performAction({ verified: true }, "User account verified.");
      case "unverify":
        return performAction({ verified: false }, "Verification removed.");
      case "suspend":
        return performAction({ status: "suspended" }, "User suspended.");
      case "unsuspend":
        return performAction({ status: "active" }, "User account restored.");
      case "ban":
        return performAction({ status: "banned" }, "User banned.");
      case "unban":
        return performAction({ status: "active" }, "User unbanned.");
    }
  }

  async function handleEditSave() {
    await performAction(
      {
        username: editForm.username,
        email: editForm.email || null,
        bio: editForm.bio || null,
      } as Partial<AdminUser>,
      "User profile updated."
    );
    setEditOpen(false);
  }

  const confirmConfig: Record<
    Exclude<Action, "edit">,
    {
      title: string;
      description: string;
      confirmLabel: string;
      destructive: boolean;
    }
  > = {
    verify: {
      title: "Verify Account",
      description: `Mark ${user?.username}'s account as verified? This grants them a verified badge on the platform.`,
      confirmLabel: "Verify Account",
      destructive: false,
    },
    unverify: {
      title: "Remove Verification",
      description: `Remove verification from ${user?.username}'s account?`,
      confirmLabel: "Remove Verification",
      destructive: true,
    },
    suspend: {
      title: "Suspend User",
      description: `Suspend ${user?.username}? They will be unable to log in or access the platform until reinstated.`,
      confirmLabel: "Suspend User",
      destructive: true,
    },
    unsuspend: {
      title: "Restore Account",
      description: `Restore ${user?.username}'s account? They will regain full platform access.`,
      confirmLabel: "Restore Access",
      destructive: false,
    },
    ban: {
      title: "Ban User",
      description: `Permanently ban ${user?.username}? This action is severe and will prevent them from accessing the platform.`,
      confirmLabel: "Ban User",
      destructive: true,
    },
    unban: {
      title: "Unban User",
      description: `Remove the ban from ${user?.username}'s account? They will regain platform access.`,
      confirmLabel: "Unban User",
      destructive: false,
    },
  };

  // ── Render ──

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Loading user…</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="p-6 lg:p-8">
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/admin/users"
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-bold text-white">User Not Found</h1>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
          <AlertCircle className="h-10 w-10 text-red-400 mx-auto mb-3" />
          <p className="text-red-400">{error ?? "User not found"}</p>
          <button
            onClick={fetchUser}
            className="mt-4 text-sm text-gray-400 hover:text-white underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Back nav + header */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <Link
          href="/admin/users"
          className="self-start p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          aria-label="Back to users"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>

        <div className="flex-1 min-w-0">
          {/* User header card */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {/* Avatar */}
              {user.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatar_url}
                  alt={user.username}
                  className="h-16 w-16 rounded-full object-cover flex-shrink-0 border-2 border-white/10"
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-primary/20 border-2 border-primary/30 flex items-center justify-center flex-shrink-0 text-2xl font-bold text-primary">
                  {user.username.charAt(0).toUpperCase()}
                </div>
              )}

              {/* Name + badges */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-xl font-bold text-white">
                    {user.username}
                  </h1>
                  {user.verified && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary border border-primary/30">
                      <Shield className="h-3 w-3" />
                      Verified
                    </span>
                  )}
                  <StatusBadge status={user.status} />
                </div>
                {user.email && (
                  <p className="text-sm text-gray-400">{user.email}</p>
                )}
                {user.bio && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {user.bio}
                  </p>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-2 sm:flex-col sm:items-end">
                <button
                  onClick={() => setEditOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-300 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <Edit className="h-3.5 w-3.5" />
                  Edit
                </button>

                {user.verified ? (
                  <button
                    onClick={() => setConfirmAction("unverify")}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 hover:bg-yellow-500/20 transition-colors"
                  >
                    <ShieldOff className="h-3.5 w-3.5" />
                    Unverify
                  </button>
                ) : (
                  <button
                    onClick={() => setConfirmAction("verify")}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-primary bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors"
                  >
                    <Shield className="h-3.5 w-3.5" />
                    Verify
                  </button>
                )}

                {user.status === "active" && (
                  <button
                    onClick={() => setConfirmAction("suspend")}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 hover:bg-yellow-500/20 transition-colors"
                  >
                    <UserX className="h-3.5 w-3.5" />
                    Suspend
                  </button>
                )}

                {user.status === "suspended" && (
                  <button
                    onClick={() => setConfirmAction("unsuspend")}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
                  >
                    <UserCheck className="h-3.5 w-3.5" />
                    Restore
                  </button>
                )}

                {user.status !== "banned" && (
                  <button
                    onClick={() => setConfirmAction("ban")}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                  >
                    <Ban className="h-3.5 w-3.5" />
                    Ban
                  </button>
                )}

                {user.status === "banned" && (
                  <button
                    onClick={() => setConfirmAction("unban")}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
                  >
                    <UserCheck className="h-3.5 w-3.5" />
                    Unban
                  </button>
                )}
              </div>
            </div>

            {/* Action feedback */}
            {(actionError || actionSuccess) && (
              <div
                className={cn(
                  "mt-4 flex items-center gap-2 text-sm px-4 py-2.5 rounded-lg",
                  actionError
                    ? "bg-red-500/10 border border-red-500/20 text-red-400"
                    : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                )}
              >
                {actionError ? (
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                ) : (
                  <CheckCircle className="h-4 w-4 flex-shrink-0" />
                )}
                {actionError ?? actionSuccess}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          icon={Home}
          label="Listings"
          value={user.listings_count}
          color="bg-blue-500/20 text-blue-400"
        />
        <StatCard
          icon={CreditCard}
          label="Payments"
          value={user.payments_count}
          color="bg-emerald-500/20 text-emerald-400"
        />
        <StatCard
          icon={Calendar}
          label="Member Since"
          value={new Date(user.created_at).getFullYear()}
          color="bg-primary/20 text-primary"
        />
        <StatCard
          icon={Clock}
          label="Last Active"
          value={user.last_active ? timeAgo(user.last_active) : "—"}
          color="bg-gray-500/20 text-gray-400"
        />
      </div>

      {/* Details + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Details */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-3">
            Account Details
          </h2>
          <div className="divide-y divide-white/5">
            <InfoRow
              icon={Mail}
              label="Email"
              value={user.email ?? <span className="text-gray-600 italic">Not provided</span>}
            />
            <InfoRow
              icon={Key}
              label="Stellar Public Key"
              value={user.public_key}
              mono
            />
            <InfoRow
              icon={Calendar}
              label="Joined"
              value={formatDate(user.created_at)}
            />
            <InfoRow
              icon={Clock}
              label="Last Active"
              value={
                user.last_active
                  ? formatDateTime(user.last_active)
                  : <span className="text-gray-600 italic">Unknown</span>
              }
            />
            <InfoRow
              icon={Shield}
              label="Verified"
              value={
                user.verified ? (
                  <span className="text-emerald-400">Yes</span>
                ) : (
                  <span className="text-gray-500">No</span>
                )
              }
            />
          </div>
        </div>

        {/* Activity Log */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-3">
            Activity Log
          </h2>
          {user.activity_log.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-500">
              <Activity className="h-6 w-6 mx-auto mb-2 opacity-30" />
              No activity recorded
            </div>
          ) : (
            <ol className="relative border-l border-white/10 ml-2 space-y-4">
              {user.activity_log.map((event) => (
                <li key={event.id} className="ml-4">
                  <div className="absolute -left-[9px] mt-0.5 h-4 w-4 rounded-full bg-slate-900 border border-white/20 flex items-center justify-center">
                    <ActivityIcon type={event.type} />
                  </div>
                  <p className="text-sm text-gray-300">{event.description}</p>
                  <time className="text-xs text-gray-500">
                    {formatDateTime(event.created_at)}
                  </time>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      {/* ── Edit Modal ── */}
      <ResponsiveModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit User Profile"
        description={`Update information for ${user.username}`}
        size="md"
        footer={
          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
            <button
              type="button"
              onClick={() => setEditOpen(false)}
              disabled={actionLoading}
              className="w-full sm:w-auto px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 dark:border-neutral-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleEditSave}
              disabled={actionLoading}
              aria-busy={actionLoading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-primary text-white hover:bg-primary/90 focus:ring-2 focus:ring-primary transition-colors disabled:opacity-50"
            >
              {actionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Changes
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Username
            </label>
            <input
              type="text"
              value={editForm.username}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, username: e.target.value }))
              }
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
              placeholder="username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              value={editForm.email}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, email: e.target.value }))
              }
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
              placeholder="user@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Bio
            </label>
            <textarea
              value={editForm.bio}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, bio: e.target.value }))
              }
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/60 resize-none"
              placeholder="User bio…"
            />
          </div>
        </div>
      </ResponsiveModal>

      {/* ── Confirm Modals ── */}
      {confirmAction && confirmAction !== "edit" && (
        <ConfirmModal
          isOpen={true}
          onConfirm={() => handleConfirmedAction(confirmAction)}
          onCancel={() => setConfirmAction(null)}
          isLoading={actionLoading}
          {...confirmConfig[confirmAction]}
        />
      )}
    </div>
  );
}

"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Bookmark, Play, Pencil, Trash2, Bell, BellOff, Loader2 } from "lucide-react";

export type SavedSearch = {
  id: string;
  name: string;
  filters: Record<string, unknown>;
  alert_enabled: boolean;
  result_count: number | null;
  created_at: string;
};

interface SavedSearchesListProps {
  onRerun: (filters: Record<string, unknown>) => void;
}

export default function SavedSearchesList({ onRerun }: SavedSearchesListProps) {
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchSearches = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/saved-searches");
      if (res.ok) setSearches(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSearches(); }, [fetchSearches]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/saved-searches/${id}`, { method: "DELETE" });
      if (!res.ok) {
        // Optionally handle error (e.g., show a message); keep item in local state on failure.
        return;
      }
      setSearches((prev) => prev.filter((s) => s.id !== id));
    } catch (error) {
      // Optionally log error; keep item in local state on failure.
      console.error("Failed to delete saved search", error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditSave = async (id: string) => {
    if (!editName.trim()) return;
    const res = await fetch(`/api/saved-searches/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName.trim() }),
    });
    if (res.ok) {
      const updated: SavedSearch = await res.json();
      setSearches((prev) => prev.map((s) => (s.id === id ? updated : s)));
    }
    setEditingId(null);
  };

  const handleToggleAlert = async (search: SavedSearch) => {
    const res = await fetch(`/api/saved-searches/${search.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alert_enabled: !search.alert_enabled }),
    });
    if (res.ok) {
      const updated: SavedSearch = await res.json();
      setSearches((prev) => prev.map((s) => (s.id === search.id ? updated : s)));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 size={20} className="animate-spin text-gray-400" />
      </div>
    );
  }

  if (searches.length === 0) {
    return (
      <div className="py-8 text-center">
        <Bookmark size={28} className="mx-auto mb-2 text-gray-300" />
        <p className="text-sm text-gray-500">No saved searches yet</p>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {searches.map((search) => (
        <li key={search.id} className="rounded-lg border border-gray-100 bg-white p-3 shadow-sm">
          {editingId === search.id ? (
            <div className="flex gap-2">
              <input
                autoFocus
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleEditSave(search.id);
                  if (e.key === "Escape") setEditingId(null);
                }}
                className="flex-1 rounded-md border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <button
                onClick={() => handleEditSave(search.id)}
                className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary/90"
              >
                Save
              </button>
              <button
                onClick={() => setEditingId(null)}
                className="rounded-md border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-gray-900">{search.name}</p>
                {search.result_count !== null && (
                  <p className="text-xs text-gray-400">{search.result_count} results</p>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => onRerun(search.filters)}
                  title="Re-run search"
                  className="rounded-md p-1.5 text-primary hover:bg-primary/10 transition-colors"
                >
                  <Play size={14} />
                </button>
                <button
                  onClick={() => handleToggleAlert(search)}
                  title={search.alert_enabled ? "Disable alerts" : "Enable alerts"}
                  className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 transition-colors"
                >
                  {search.alert_enabled ? <Bell size={14} className="text-primary" /> : <BellOff size={14} />}
                </button>
                <button
                  onClick={() => { setEditingId(search.id); setEditName(search.name); }}
                  title="Edit name"
                  className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 transition-colors"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => handleDelete(search.id)}
                  disabled={deletingId === search.id}
                  title="Delete"
                  className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50"
                >
                  {deletingId === search.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Trash2 size={14} />
                  )}
                </button>
              </div>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

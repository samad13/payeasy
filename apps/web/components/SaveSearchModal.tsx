"use client";

import React, { useState } from "react";
import { X, Bookmark, Bell } from "lucide-react";

interface SaveSearchModalProps {
  currentFilters: Record<string, unknown>;
  resultCount?: number;
  onClose: () => void;
  onSaved?: () => void;
}

export default function SaveSearchModal({
  currentFilters,
  resultCount,
  onClose,
  onSaved,
}: SaveSearchModalProps) {
  const [name, setName] = useState("");
  const [alertEnabled, setAlertEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/saved-searches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          filters: currentFilters,
          alert_enabled: alertEnabled,
          result_count: resultCount ?? null,
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? "Failed to save search");
      }

      onSaved?.();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const activeFilters = Object.entries(currentFilters).filter(
    ([, v]) => v !== "" && v !== false && v !== null && v !== undefined &&
      !(Array.isArray(v) && v.length === 0)
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <Bookmark size={18} className="text-primary" />
            <h2 className="text-base font-semibold text-gray-900">Save this search</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} className="px-6 py-5 space-y-5">
          {activeFilters.length > 0 && (
            <div className="rounded-lg bg-gray-50 px-4 py-3">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
                Active filters
              </p>
              <div className="flex flex-wrap gap-1.5">
                {activeFilters.map(([key, value]) => (
                  <span
                    key={key}
                    className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                  >
                    {key}: {Array.isArray(value) ? value.join(", ") : String(value)}
                  </span>
                ))}
              </div>
              {resultCount !== undefined && (
                <p className="mt-2 text-xs text-gray-500">
                  {resultCount} result{resultCount !== 1 ? "s" : ""} found
                </p>
              )}
            </div>
          )}

          <div>
            <label htmlFor="search-name" className="mb-1.5 block text-sm font-medium text-gray-700">
              Search name
            </label>
            <input
              id="search-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. 2BR in Miami under 3000 XLM"
              maxLength={100}
              autoFocus
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none transition-all placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <label className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-100 p-3 transition-colors hover:bg-gray-50">
            <div className="flex items-center gap-2.5">
              <Bell size={16} className={alertEnabled ? "text-primary" : "text-gray-400"} />
              <div>
                <p className="text-sm font-medium text-gray-800">Alert me on new listings</p>
                <p className="text-xs text-gray-500">Get notified when matching listings appear</p>
              </div>
            </div>
            <div className="relative">
              <input
                type="checkbox"
                checked={alertEnabled}
                onChange={(e) => setAlertEnabled(e.target.checked)}
                className="peer sr-only"
              />
              <div className="peer h-6 w-10 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-2 peer-focus:ring-primary/20" />
            </div>
          </label>

          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Saving…" : "Save search"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

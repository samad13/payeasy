import React, { useEffect, useMemo, useRef, useState } from "react";
import TableHeader from "./TableHeader";
import TableRow from "./TableRow";

export type Column<T> = {
  id: string;
  header: React.ReactNode;
  accessor?: keyof T | ((row: T) => React.ReactNode);
  sortable?: boolean;
  width?: number; // px
  minWidth?: number;
  align?: "left" | "center" | "right";
};

type SortState = { id: string | null; desc: boolean };

type TableProps<T> = {
  columns: Column<T>[];
  data: T[];
  pageSize?: number;
  rowKey?: keyof T | ((row: T) => string);
  className?: string;
};

function defaultAccessor<T>(accessor: Column<T>["accessor"], row: T) {
  if (!accessor) return "";
  if (typeof accessor === "function") return accessor(row);
  return (row as any)[accessor];
}

export default function Table<T extends Record<string, any>>({
  columns,
  data,
  pageSize = 10,
  rowKey,
  className = "",
}: TableProps<T>) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortState>({ id: null, desc: false });
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(pageSize);
  const [colWidths, setColWidths] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    columns.forEach((c) => {
      if (c.width) map[c.id] = c.width;
    });
    return map;
  });

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => setSize(pageSize), [pageSize]);

  const filtered = useMemo(() => {
    if (!query) return data;
    const q = query.toLowerCase();
    return data.filter((row) => {
      return columns.some((col) => {
        const v = defaultAccessor(col.accessor, row);
        return String(v ?? "")
          .toLowerCase()
          .includes(q);
      });
    });
  }, [query, data, columns]);

  const sorted = useMemo(() => {
    if (!sort.id) return filtered;
    const col = columns.find((c) => c.id === sort.id);
    if (!col) return filtered;
    const arr = [...filtered];
    arr.sort((a, b) => {
      const av = defaultAccessor(col.accessor, a);
      const bv = defaultAccessor(col.accessor, b);
      if (av == null && bv == null) return 0;
      if (av == null) return sort.desc ? -1 : 1;
      if (bv == null) return sort.desc ? 1 : -1;
      if (typeof av === "number" && typeof bv === "number") {
        return sort.desc ? bv - av : av - bv;
      }
      return sort.desc
        ? String(bv).localeCompare(String(av))
        : String(av).localeCompare(String(bv));
    });
    return arr;
  }, [sort, filtered, columns]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / size));
  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [pageCount]);

  const pageData = useMemo(() => {
    const start = (page - 1) * size;
    return sorted.slice(start, start + size);
  }, [sorted, page, size]);

  function toggleAll(checked: boolean) {
    const newSel: Record<string, boolean> = {};
    pageData.forEach((r) => {
      const key = getRowKey(r);
      newSel[key] = checked;
    });
    setSelected((s) => ({ ...s, ...newSel }));
  }

  function toggleRow(key: string, checked: boolean) {
    setSelected((s) => ({ ...s, [key]: checked }));
  }

  function getRowKey(row: T) {
    if (!rowKey) return JSON.stringify(row);
    if (typeof rowKey === "function") return rowKey(row);
    return String((row as any)[rowKey]);
  }

  function handleSort(id: string) {
    setSort((s) => {
      if (s.id !== id) return { id, desc: false };
      if (!s.desc) return { id, desc: true };
      return { id: null, desc: false };
    });
  }

  // Column resizing
  function startResize(e: React.MouseEvent, colId: string) {
    const startX = e.clientX;
    const startW = colWidths[colId] ?? 150;
    function onMove(ev: MouseEvent) {
      const dx = ev.clientX - startX;
      setColWidths((w) => ({ ...w, [colId]: Math.max(40, startW + dx) }));
    }
    function onUp() {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  return (
    <div className={`w-full ${className}`} ref={containerRef}>
      <div className="mb-2 flex items-center justify-between text-black">
        <div className="flex items-center gap-2">
          <input
            aria-label="Search table"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            className="rounded border px-2 py-1 text-sm"
          />
          <div className="text-sm text-gray-500">{sorted.length} matches</div>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Rows:</label>
          <select
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            className="rounded border px-2 py-1 text-sm"
          >
            {[5, 10, 25, 50].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Desktop / table view */}
      <div className="hidden overflow-auto rounded border md:block">
        <table className="min-w-full divide-y" role="table">
          <thead className="bg-gray-50">
            <TableHeader
              columns={columns}
              colWidths={colWidths}
              onStartResize={startResize}
              onSort={handleSort}
              sort={sort}
              onToggleAll={toggleAll}
              pageData={pageData}
              selected={selected}
              getRowKey={getRowKey}
            />
          </thead>
          <tbody className="bg-white">
            {pageData.map((row, idx) => {
              const key = getRowKey(row);
              return (
                <TableRow
                  key={key}
                  row={row}
                  columns={columns}
                  selected={!!selected[key]}
                  onToggle={(checked) => toggleRow(key, checked)}
                  index={idx}
                  colWidths={colWidths}
                />
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile / stacked view */}
      <div className="space-y-2 md:hidden">
        {pageData.map((row) => {
          const key = getRowKey(row);
          return (
            <div key={key} className="flex flex-col gap-2 rounded border bg-white p-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="font-medium">{String(key)}</div>
                <input
                  type="checkbox"
                  aria-label={`Select row ${key}`}
                  checked={!!selected[key]}
                  onChange={(e) => toggleRow(key, e.target.checked)}
                />
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                {columns.map((col) => (
                  <div key={col.id} className="flex gap-2">
                    <div className="w-24 font-semibold text-gray-600">{col.header}</div>
                    <div className="flex-1">{String(defaultAccessor(col.accessor, row) ?? "")}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      <div className="mt-3 flex items-center justify-between text-sm">
        <div className="text-gray-600">
          Page {page} of {pageCount}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(1)}
            disabled={page === 1}
            className="rounded border px-2 py-1 disabled:opacity-50"
          >
            First
          </button>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded border px-2 py-1 disabled:opacity-50"
          >
            Prev
          </button>
          <button
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            disabled={page === pageCount}
            className="rounded border px-2 py-1 disabled:opacity-50"
          >
            Next
          </button>
          <button
            onClick={() => setPage(pageCount)}
            disabled={page === pageCount}
            className="rounded border px-2 py-1 disabled:opacity-50"
          >
            Last
          </button>
        </div>
      </div>
    </div>
  );
}

import React from "react";
import type { Column } from "./Table";

type SortState = { id: string | null; desc: boolean };

type Props<T> = {
  columns: Column<T>[];
  colWidths: Record<string, number>;
  onStartResize: (e: React.MouseEvent, colId: string) => void;
  onSort: (id: string) => void;
  sort: SortState;
  onToggleAll: (checked: boolean) => void;
  pageData: T[];
  selected: Record<string, boolean>;
  getRowKey: (row: T) => string;
};

export default function TableHeader<T>({
  columns,
  colWidths,
  onStartResize,
  onSort,
  sort,
  onToggleAll,
  pageData,
  selected,
  getRowKey,
}: Props<T>) {
  const allChecked = pageData.length > 0 && pageData.every((r) => selected[getRowKey(r)]);
  const someChecked = pageData.some((r) => selected[getRowKey(r)]) && !allChecked;

  return (
    <tr>
      <th className="px-3 py-2 text-left">
        <input
          type="checkbox"
          aria-label="Select all rows"
          checked={allChecked}
          onChange={(e) => onToggleAll(e.target.checked)}
          ref={(el) => {
            if (el) el.indeterminate = someChecked;
          }}
        />
      </th>
      {columns.map((col) => {
        const width = colWidths[col.id];
        const ariaSort = sort.id === col.id ? (sort.desc ? "descending" : "ascending") : "none";
        return (
          <th
            key={col.id}
            scope="col"
            role="columnheader"
            aria-sort={ariaSort}
            className="relative px-3 py-2 text-left text-sm text-gray-700"
            style={width ? { width } : undefined}
          >
            <div className="flex items-center gap-2">
              <div className="flex-1">
                {col.sortable ? (
                  <button onClick={() => onSort(col.id)} className="flex items-center gap-1">
                    <span>{col.header}</span>
                    <SortIndicator active={sort.id === col.id} desc={sort.desc} />
                  </button>
                ) : (
                  <span>{col.header}</span>
                )}
              </div>
              <div
                onMouseDown={(e) => onStartResize(e, col.id)}
                className="h-6 w-1 cursor-col-resize bg-transparent hover:bg-gray-300"
                aria-hidden
              />
            </div>
          </th>
        );
      })}
    </tr>
  );
}

function SortIndicator({ active, desc }: { active: boolean; desc: boolean }) {
  return (
    <svg
      className={`h-3 w-3 text-gray-400 ${active ? "opacity-100" : "opacity-40"}`}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {desc ? (
        <path
          d="M5 8l5 5 5-5"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M5 12l5-5 5 5"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

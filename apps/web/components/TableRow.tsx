import React from "react";
import type { Column } from "./Table";

type Props<T> = {
  row: T;
  columns: Column<T>[];
  selected: boolean;
  onToggle: (checked: boolean) => void;
  index: number;
  colWidths: Record<string, number>;
};

export default function TableRow<T>({
  row,
  columns,
  selected,
  onToggle,
  index,
  colWidths,
}: Props<T>) {
  function accessor(accessor?: Column<T>["accessor"]) {
    if (!accessor) return "";
    if (typeof accessor === "function") return accessor(row);
    return (row as any)[accessor];
  }

  return (
    <tr className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-gray-100`}>
      <td className="px-3 py-2 align-top">
        <input
          type="checkbox"
          aria-label={`Select row ${index + 1}`}
          checked={selected}
          onChange={(e) => onToggle(e.target.checked)}
        />
      </td>
      {columns.map((col) => (
        <td
          key={col.id}
          className={`px-3 py-2 align-top text-sm text-gray-800`}
          style={colWidths[col.id] ? { width: colWidths[col.id] } : undefined}
        >
          {String(accessor(col.accessor) ?? "")}
        </td>
      ))}
    </tr>
  );
}

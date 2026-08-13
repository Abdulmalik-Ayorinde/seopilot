"use client";

import { useState } from "react";
import type { SyncedPageRow } from "@/lib/db-read";

type SortField = "page_url" | "query" | "position" | "impressions" | "clicks" | "ctr" | "score";
type SortDir = "asc" | "desc";

interface Props {
  rows: SyncedPageRow[];
}

function PositionBadge({ position }: { position: number }) {
  if (position < 10) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
        {position.toFixed(1)}
      </span>
    );
  }

  if (position <= 20) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
        {position.toFixed(1)}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
      {position.toFixed(1)}
    </span>
  );
}

function SortHeader({
  field,
  align,
  sortField,
  sortDir,
  onSort,
  children,
}: {
  field: SortField;
  align?: "left" | "right";
  sortField: SortField;
  sortDir: SortDir;
  onSort: (field: SortField) => void;
  children: React.ReactNode;
}) {
  const isActive = sortField === field;
  const arrow = isActive ? (sortDir === "asc" ? "↑" : "↓") : "";
  const alignClass = align === "right" ? "text-right" : "";

  return (
    <th
      className={`px-4 py-3 font-medium text-zinc-500 cursor-pointer select-none hover:text-zinc-700 dark:hover:text-zinc-300 ${alignClass} ${isActive ? "text-zinc-900 dark:text-zinc-100" : ""}`}
      onClick={() => onSort(field)}
    >
      <span className="inline-flex items-center gap-1">
        {children}
        <span className="text-xs w-3">{arrow}</span>
      </span>
    </th>
  );
}

export default function SyncedTable({ rows }: Props) {
  const [sortField, setSortField] = useState<SortField>("impressions");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [filter, setFilter] = useState("");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const filtered = filter
    ? rows.filter((row) => {
        const q = filter.toLowerCase();
        return row.page_url.toLowerCase().includes(q) || row.query.toLowerCase().includes(q);
      })
    : rows;

  const sorted = [...filtered].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];

    if (typeof aVal === "string" && typeof bVal === "string") {
      return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }

    return sortDir === "asc" ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
  });

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <input
          type="text"
          placeholder="Filter by page or query..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-80"
        />
        <span className="text-xs text-zinc-500 tabular-nums">
          {sorted.length} {sorted.length === 1 ? "result" : "results"}
        </span>
      </div>

      <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="sticky top-0 bg-zinc-50 dark:bg-zinc-950">
          <tr className="border-b border-zinc-200 dark:border-zinc-700">
            <SortHeader field="page_url" sortField={sortField} sortDir={sortDir} onSort={handleSort}>Page URL</SortHeader>
            <SortHeader field="query" sortField={sortField} sortDir={sortDir} onSort={handleSort}>Query</SortHeader>
            <SortHeader field="position" align="right" sortField={sortField} sortDir={sortDir} onSort={handleSort}>Position</SortHeader>
            <SortHeader field="impressions" align="right" sortField={sortField} sortDir={sortDir} onSort={handleSort}>Impressions</SortHeader>
            <SortHeader field="clicks" align="right" sortField={sortField} sortDir={sortDir} onSort={handleSort}>Clicks</SortHeader>
            <SortHeader field="ctr" align="right" sortField={sortField} sortDir={sortDir} onSort={handleSort}>CTR</SortHeader>
            <SortHeader field="score" align="right" sortField={sortField} sortDir={sortDir} onSort={handleSort}>Score</SortHeader>
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-4 py-8 text-center text-zinc-500">
                No results match your filter.
              </td>
            </tr>
          ) : (
            sorted.map((row) => (
              <tr
                key={row.id}
                className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 even:bg-zinc-50/50 dark:even:bg-zinc-900/50"
              >
                <td
                  className="px-4 py-2.5 max-w-[300px] truncate text-zinc-600 dark:text-zinc-400"
                  title={row.page_url}
                >
                  {row.page_url}
                </td>
                <td
                  className="px-4 py-2.5 max-w-[200px] truncate"
                  title={row.query}
                >
                  {row.query}
                </td>
                <td className="px-4 py-2.5 tabular-nums">
                  <PositionBadge position={row.position} />
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums">{row.impressions.toLocaleString()}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{row.clicks.toLocaleString()}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{(row.ctr * 100).toFixed(1)}%</td>
                <td className="px-4 py-2.5 text-right tabular-nums">
                  {row.score !== null ? (
                    <span
                      className="font-medium text-zinc-900 dark:text-zinc-100"
                      title={`Traffic upside: ${row.traffic_upside?.toFixed(1)}\nRanking probability: ${(row.ranking_probability! * 100).toFixed(0)}%\nData confidence: ${(row.data_confidence! * 100).toFixed(0)}%`}
                    >
                      {row.score.toFixed(1)}
                    </span>
                  ) : (
                    <span className="text-zinc-400">&mdash;</span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      </div>
    </div>
  );
}

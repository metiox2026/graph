"use client";

import { useMemo } from "react";

type Props = {
  branches: string[];
  selected: string[];
  onChange: (v: string[]) => void;
  search: string;
  onSearch: (v: string) => void;
  compareMode: boolean;
  onCompareChange: (v: boolean) => void;
  rankBy: "sales" | "kpi" | "units";
  onRankChange: (v: "sales" | "kpi" | "units") => void;
  onClearCache: () => void;
  onResetFilters: () => void;
  fileName: string;
  uploadedAt: string;
};

export default function BranchFilter({
  branches,
  selected,
  onChange,
  search,
  onSearch,
  compareMode,
  onCompareChange,
  rankBy,
  onRankChange,
  onClearCache: _onClearCache,
  onResetFilters,
  fileName,
  uploadedAt,
}: Props) {
  const toggle = (b: string) => {
    if (compareMode) {
      onChange(
        selected.includes(b)
          ? selected.filter((x) => x !== b)
          : [...selected, b],
      );
    } else {
      onChange(selected.includes(b) ? [] : [b]);
    }
  };

  const toggleAll = () => {
    const isAll = selected.length === branches.length && branches.length > 0;
    if (isAll) {
      onCompareChange(false);
      onChange([]);
    } else {
      onCompareChange(true);
      onChange(branches);
    }
  };

  const term = search.trim().toLowerCase();
  const visibleBranches = useMemo(
    () =>
      term
        ? branches.filter((b) => b.toLowerCase().includes(term))
        : branches,
    [branches, term],
  );

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-slate-200">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <label className="flex items-center gap-2 text-slate-700">
            <input
              type="checkbox"
              checked={compareMode}
              onChange={(e) => {
                onCompareChange(e.target.checked);
                if (!e.target.checked && compareMode) onChange([]);
              }}
              className="h-4 w-4 rounded border-slate-300 text-blue-600"
            />
            <span>Compare branches</span>
          </label>
          <label className="flex items-center gap-2 text-slate-700">
            <span className="text-slate-500">Rank by</span>
            <select
              value={rankBy}
              onChange={(e) => onRankChange(e.target.value as typeof rankBy)}
              className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm"
            >
              <option value="sales">Sales</option>
              <option value="kpi">KPI</option>
              <option value="units">Units</option>
            </select>
          </label>
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Search employee, branch…"
              className="w-full sm:w-64 rounded-md border border-slate-300 bg-white px-3 py-1 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="truncate max-w-[200px]" title={fileName}>
            📎 {fileName}
          </span>
          <span suppressHydrationWarning>
            {new Date(uploadedAt).toLocaleString(undefined, {
              month: "short",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          <button
            onClick={onResetFilters}
            className="rounded-md px-2 py-0.5 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            title="Reset branch filter, compare mode, and search — keep the uploaded file"
          >
            Reset filters
          </button>
        </div>
      </div>

      <div className="px-4 py-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={toggleAll}
          className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
            selected.length === branches.length && branches.length > 0
              ? "bg-slate-800 text-white border-slate-800"
              : "bg-white text-slate-700 border-slate-300 hover:border-blue-400"
          }`}
        >
          {selected.length === branches.length && branches.length > 0
            ? "✓ All selected"
            : "Select all"}
        </button>
        {visibleBranches.map((b) => {
          const on = selected.includes(b);
          return (
            <button
              key={b}
              type="button"
              onClick={() => toggle(b)}
              className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                on
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                  : "bg-white text-slate-700 border-slate-300 hover:border-blue-400"
              }`}
            >
              {b}
            </button>
          );
        })}
        {visibleBranches.length === 0 && (
          <span className="text-xs text-slate-400 italic">
            No branches match “{search.trim()}”
          </span>
        )}
        <span className="ml-auto text-xs text-slate-500">
          {selected.length === 0
            ? "Showing every branch"
            : `${selected.length} branch${selected.length > 1 ? "es" : ""} selected`}
        </span>
      </div>
    </div>
  );
}

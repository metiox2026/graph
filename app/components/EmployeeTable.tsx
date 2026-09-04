"use client";

import { useMemo, useState } from "react";
import { fmtAED, fmtKpi, fmtNum, kpiColor } from "../lib/format";
import type { Employee } from "../lib/excel";

type SortKey = "name" | "branch" | "totalSale" | "kpi" | "lateAttendance";

type Props = {
  employees: Employee[];
  productNames: string[];
  selected: string[];
  search: string;
};

export default function EmployeeTable({
  employees,
  productNames,
  selected,
  search,
}: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("totalSale");
  const [sortDir, setSortDir] = useState<1 | -1>(-1);

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return employees.filter((e) => {
      if (selected.length > 0 && !selected.includes(e.branch)) return false;
      if (!term) return true;
      return (
        e.name.toLowerCase().includes(term) ||
        e.branch.toLowerCase().includes(term)
      );
    });
  }, [employees, selected, search]);

  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => {
      const av = a[sortKey] as number | string;
      const bv = b[sortKey] as number | string;
      if (typeof av === "string" && typeof bv === "string") {
        return av.localeCompare(bv) * sortDir;
      }
      return ((av as number) - (bv as number)) * sortDir;
    });
  }, [rows, sortKey, sortDir]);

  const headerButton = (key: SortKey, label: string, align: "left" | "right" = "right") => (
    <button
      type="button"
      onClick={() => {
        if (sortKey === key) setSortDir((d) => (d === 1 ? -1 : 1));
        else {
          setSortKey(key);
          setSortDir(-1);
        }
      }}
      className={`inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wide ${
        align === "right" ? "justify-end" : "justify-start"
      } text-slate-600 hover:text-slate-900`}
    >
      {label}
      <span className="text-[10px] text-slate-400">
        {sortKey === key ? (sortDir === 1 ? "▲" : "▼") : ""}
      </span>
    </button>
  );

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 flex items-baseline justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Employee Leaderboard</h3>
        <span className="text-xs text-slate-500">
          {sorted.length} of {employees.length} rows
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3 py-2 text-left">
                {headerButton("name", "Employee", "left")}
              </th>
              <th className="px-3 py-2 text-left">
                {headerButton("branch", "Branch", "left")}
              </th>
              <th className="px-3 py-2 text-right">
                {headerButton("totalSale", "Sales (AED)")}
              </th>
              <th className="px-3 py-2 text-right">
                {headerButton("kpi", "KPI")}
              </th>
              <th className="px-3 py-2 text-right">
                {headerButton("lateAttendance", "Late Hrs")}
              </th>
              {productNames.map((p) => (
                <th key={p} className="px-3 py-2 text-right">
                  <span className="text-xs font-medium uppercase tracking-wide text-slate-600 whitespace-nowrap">
                    {p}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sorted.map((e, i) => {
              const rank = i + 1;
              return (
                <tr
                  key={`${e.empId}-${e.name}`}
                  className="hover:bg-slate-50/60"
                >
                  <td className="px-3 py-2 text-slate-900 font-medium">
                    <span className="text-xs text-slate-400 mr-2 tabular-nums">
                      {rank}.
                    </span>
                    {e.name}
                  </td>
                  <td className="px-3 py-2 text-slate-700">{e.branch}</td>
                  <td className="px-3 py-2 text-right tabular-nums font-semibold text-blue-700">
                    {fmtAED(e.totalSale)}
                  </td>
                  <td
                    className="px-3 py-2 text-right tabular-nums font-semibold"
                    style={{ background: kpiColor(e.kpi), color: "#0f172a" }}
                  >
                    {fmtKpi(e.kpi)}
                  </td>
                  <td
                    className={`px-3 py-2 text-right tabular-nums ${
                      e.lateAttendance > 4 ? "text-rose-600 font-semibold" : ""
                    }`}
                  >
                    {fmtNum(e.lateAttendance)}
                  </td>
                  {productNames.map((p) => (
                    <td key={p} className="px-3 py-2 text-right tabular-nums">
                      {fmtNum(e.products[p] ?? 0)}
                    </td>
                  ))}
                </tr>
              );
            })}
            {sorted.length === 0 && (
              <tr>
                <td
                  colSpan={5 + productNames.length}
                  className="px-3 py-10 text-center text-sm text-slate-400"
                >
                  No employees match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

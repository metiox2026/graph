"use client";

import { fmtAED, fmtKpi, fmtNum } from "../lib/format";
import type { BranchAgg, Employee } from "../lib/excel";

type Props = {
  employees: Employee[];
  branches: BranchAgg[];
  productNames: string[];
  selected: string[];
};

export default function Scorecards({
  employees,
  branches,
  productNames,
  selected,
}: Props) {
  const isFiltered = selected.length > 0;
  const fEmployees = isFiltered
    ? employees.filter((e) => selected.includes(e.branch))
    : employees;
  const fBranches = isFiltered
    ? branches.filter((b) => selected.includes(b.branch))
    : branches;

  const totalSales = fEmployees.reduce((s, e) => s + e.totalSale, 0);
  const totalLate = fEmployees.reduce((s, e) => s + e.lateAttendance, 0);
  const totalUnits = fEmployees.reduce(
    (s, e) => s + Object.values(e.products).reduce((a, b) => a + b, 0),
    0,
  );
  const cleanKpis = fEmployees.filter((e) => e.kpi <= 20);
  const avgKpi = cleanKpis.length
    ? cleanKpis.reduce((s, e) => s + e.kpi, 0) / cleanKpis.length
    : 0;
  const totalKpi = fEmployees.reduce((s, e) => s + e.kpi, 0);

  const productTotals = productNames.map((p) => ({
    p,
    units: fEmployees.reduce((s, e) => s + (e.products[p] ?? 0), 0),
  }));
  const topProduct = productTotals.sort((a, b) => b.units - a.units)[0];

  const topBranch = [...fBranches].sort(
    (a, b) => b.totalSale - a.totalSale,
  )[0];
  const avgPerEmp = fEmployees.length ? totalSales / fEmployees.length : 0;

  const scopeLabel = isFiltered ? "selected" : "all";

  const stats: { lbl: string; val: string; tone?: string }[] = [
    { lbl: `Employees (${scopeLabel})`, val: fmtNum(fEmployees.length) },
    {
      lbl: `Branches (${scopeLabel})`,
      val: fmtNum(fBranches.length),
    },
    {
      lbl: "Total Sales",
      val: fmtAED(totalSales),
      tone: "text-blue-700",
    },
    { lbl: "Total KPI", val: fmtKpi(totalKpi) },
    { lbl: "Avg KPI", val: fmtKpi(avgKpi) },
    {
      lbl: "Avg Sale / Emp",
      val: fEmployees.length ? fmtAED(avgPerEmp) : "—",
    },
    {
      lbl: "Late Hours",
      val: fmtNum(totalLate),
      tone: totalLate > 20 ? "text-rose-600" : "text-slate-900",
    },
    { lbl: "Product Units", val: fmtNum(totalUnits) },
    {
      lbl: "Top Branch",
      val: topBranch?.branch ?? "—",
      tone: "text-blue-700",
    },
    {
      lbl: "Top Product",
      val: topProduct ? `${topProduct.p}` : "—",
    },
  ];

  return (
    <div className="space-y-2">
      {isFiltered && (
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 font-medium text-blue-700">
            Filtered
          </span>
          Scorecards reflect:{" "}
          <strong className="text-slate-700">
            {selected.join(", ")}
          </strong>
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {stats.map((s) => (
          <div
            key={s.lbl}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
          >
            <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
              {s.lbl}
            </div>
            <div
              className={`mt-1 text-xl font-semibold ${
                s.tone ?? "text-slate-900"
              } truncate`}
            >
              {s.val}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

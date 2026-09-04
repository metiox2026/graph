"use client";

import { fmtAED, fmtKpi, fmtNum, kpiColor } from "../lib/format";
import type { BranchAgg } from "../lib/excel";

type Props = {
  branches: BranchAgg[];
  productNames: string[];
  selected: string[];
  rankBy: "sales" | "kpi" | "units";
};

const unitSum = (b: BranchAgg) =>
  Object.values(b.products).reduce((a, c) => a + c, 0);

export default function BranchTable({
  branches,
  productNames,
  selected,
  rankBy,
}: Props) {
  const filtered =
    selected.length === 0
      ? branches
      : branches.filter((b) => selected.includes(b.branch));

  const sorted = [...filtered].sort((a, b) => {
    if (rankBy === "sales") return b.totalSale - a.totalSale;
    if (rankBy === "kpi") return b.avgKpi - a.avgKpi;
    return unitSum(b) - unitSum(a);
  });

  const totals = sorted.reduce(
    (acc, b) => {
      acc.sales += b.totalSale;
      acc.employees += b.employees;
      acc.kpi += b.totalKpi;
      acc.late += b.lateHours;
      for (const p of productNames) acc.products[p] = (acc.products[p] ?? 0) + b.products[p];
      return acc;
    },
    {
      sales: 0,
      employees: 0,
      kpi: 0,
      late: 0,
      products: {} as Record<string, number>,
    },
  );

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 flex items-baseline justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Branch Overview</h3>
        <span className="text-xs text-slate-500">
          {sorted.length} of {branches.length} branches
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Branch</th>
              <th className="px-3 py-2 text-right font-medium">Employees</th>
              <th className="px-3 py-2 text-right font-medium">Sales (AED)</th>
              <th className="px-3 py-2 text-right font-medium">Sales / Emp</th>
              <th className="px-3 py-2 text-right font-medium">Avg KPI</th>
              <th className="px-3 py-2 text-right font-medium">Total KPI</th>
              <th className="px-3 py-2 text-right font-medium">Late Hrs</th>
              {productNames.map((p) => (
                <th key={p} className="px-3 py-2 text-right font-medium whitespace-nowrap">
                  {p}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sorted.map((b) => {
              const units = unitSum(b);
              const perEmp = b.employees ? b.totalSale / b.employees : 0;
              return (
                <tr key={b.branch} className="hover:bg-slate-50/60">
                  <td className="px-3 py-2 font-medium text-slate-900">{b.branch}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{b.employees}</td>
                  <td className="px-3 py-2 text-right tabular-nums font-semibold text-blue-700">
                    {fmtAED(b.totalSale)}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {b.employees ? fmtAED(perEmp) : "—"}
                  </td>
                  <td
                    className="px-3 py-2 text-right tabular-nums font-semibold"
                    style={{ background: kpiColor(b.avgKpi), color: "#0f172a" }}
                  >
                    {fmtKpi(b.avgKpi)}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {fmtKpi(b.totalKpi)}
                  </td>
                  <td
                    className={`px-3 py-2 text-right tabular-nums ${
                      b.lateHours > 5 ? "text-rose-600 font-semibold" : ""
                    }`}
                  >
                    {fmtNum(b.lateHours)}
                  </td>
                  {productNames.map((p) => (
                    <td key={p} className="px-3 py-2 text-right tabular-nums">
                      {fmtNum(b.products[p] ?? 0)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
          {sorted.length > 0 && (
            <tfoot className="bg-slate-100/80 text-slate-700 font-semibold">
              <tr>
                <td className="px-3 py-2">Total</td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {fmtNum(totals.employees)}
                </td>
                <td className="px-3 py-2 text-right tabular-nums text-blue-700">
                  {fmtAED(totals.sales)}
                </td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {totals.employees ? fmtAED(totals.sales / totals.employees) : "—"}
                </td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {totals.employees ? fmtKpi(totals.kpi / totals.employees) : "—"}
                </td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {fmtKpi(totals.kpi)}
                </td>
                <td className="px-3 py-2 text-right tabular-nums">{fmtNum(totals.late)}</td>
                {productNames.map((p) => (
                  <td key={p} className="px-3 py-2 text-right tabular-nums">
                    {fmtNum(totals.products[p] ?? 0)}
                  </td>
                ))}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}

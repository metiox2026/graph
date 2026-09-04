"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fmtAED } from "../lib/format";
import { PALETTE } from "../lib/format";
import type { BranchAgg, Employee } from "../lib/excel";

type Props = {
  branches: BranchAgg[];
  employees: Employee[];
  productNames: string[];
  selected: string[];
  rankBy: "sales" | "kpi" | "units";
};

const dataKey = (r: "sales" | "kpi" | "units"): "sales" | "avgKpi" | "units" =>
  r === "kpi" ? "avgKpi" : r === "sales" ? "sales" : "units";

export default function Charts({
  branches,
  employees,
  productNames,
  selected,
  rankBy,
}: Props) {
  const filteredBranches =
    selected.length === 0
      ? branches
      : branches.filter((b) => selected.includes(b.branch));

  const getRank = (b: (typeof branches)[number], k: typeof rankBy): number => {
    if (k === "sales") return b.totalSale;
    if (k === "kpi") return b.avgKpi;
    return Object.values(b.products).reduce((a, c) => a + c, 0);
  };

  const sorted = [...filteredBranches].sort(
    (a, b) => getRank(b, rankBy) - getRank(a, rankBy),
  );

  const totals = employees.reduce(
    (acc, e) => {
      acc.sales += e.totalSale;
      for (const p of productNames) {
        const v = e.products[p] ?? 0;
        acc.unitsByProduct[p] = (acc.unitsByProduct[p] ?? 0) + v;
      }
      return acc;
    },
    { sales: 0, unitsByProduct: {} as Record<string, number> },
  );

  const productData = Object.entries(totals.unitsByProduct)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const comparisonData = sorted.map((b) => {
    const units = Object.values(b.products).reduce((a, c) => a + c, 0);
    const lateHours = b.lateHours;
    const avgKpi = b.avgKpi;
    return {
      branch: b.branch,
      sales: b.totalSale,
      units,
      lateHours,
      avgKpi: Math.round(avgKpi * 10) / 10,
    };
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Sales by Branch */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-2">
        <header className="mb-3">
          <h3 className="text-sm font-semibold text-slate-900">
            Branch Performance
          </h3>
          <p className="text-xs text-slate-500">
            Sorted by{" "}
            <span className="font-medium text-slate-700">
              {rankBy === "sales"
                ? "total sales (AED)"
                : rankBy === "kpi"
                  ? "average KPI"
                  : "units sold"}
            </span>
          </p>
        </header>
        <div className="h-72">
          <ResponsiveContainer>
            <BarChart data={comparisonData} margin={{ left: 0, right: 8, top: 6, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="branch"
                tick={{ fontSize: 11, fill: "#475569" }}
                interval={0}
                angle={-20}
                textAnchor="end"
                height={50}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#475569" }}
                tickFormatter={(v) =>
                  typeof v === "number" && v >= 1000
                    ? `${Math.round(v / 1000)}k`
                    : String(v)
                }
                width={56}
              />
              <Tooltip
                cursor={{ fill: "rgba(37,99,235,0.06)" }}
                formatter={(value) => {
                  const v = Number(value);
                  if (rankBy === "sales") return `${fmtAED(v)} AED`;
                  return Math.round(v * 10) / 10;
                }}
                labelStyle={{ color: "#0f172a", fontWeight: 600 }}
              />
              <Bar dataKey={dataKey(rankBy)} radius={[6, 6, 0, 0]}>
                {comparisonData.map((_, i) => (
                  <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Product Mix */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <header className="mb-3">
          <h3 className="text-sm font-semibold text-slate-900">Product Mix</h3>
          <p className="text-xs text-slate-500">Units sold by product</p>
        </header>
        <div className="h-72">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={productData}
                dataKey="value"
                nameKey="name"
                innerRadius={45}
                outerRadius={85}
                paddingAngle={2}
              >
                {productData.map((_, i) => (
                  <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => Number(value).toLocaleString()} />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconSize={9}
                wrapperStyle={{ fontSize: 11 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Employees per branch */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-3">
        <header className="mb-3 flex items-baseline justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Employees per Branch
            </h3>
            <p className="text-xs text-slate-500">Headcount distribution</p>
          </div>
          <span className="text-xs text-slate-500">
            Total {employees.length} employees across {branches.length} branches
          </span>
        </header>
        <div className="h-56">
          <ResponsiveContainer>
            <BarChart
              data={branches.map((b) => ({ branch: b.branch, count: b.employees }))}
              margin={{ left: 0, right: 8, top: 6, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="branch" tick={{ fontSize: 11, fill: "#475569" }} />
              <YAxis tick={{ fontSize: 11, fill: "#475569" }} allowDecimals={false} />
              <Tooltip cursor={{ fill: "rgba(37,99,235,0.06)" }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {branches.map((_, i) => (
                  <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

"use client";

import { fmtAED, fmtKpi } from "../lib/format";
import type { BranchAgg, Employee } from "../lib/excel";

type Props = {
  employees: Employee[];
  branches: BranchAgg[];
  selected: string[];
};

export default function Insights({
  employees,
  branches,
  selected,
}: Props) {
  const isFiltered = selected.length > 0;
  const fEmployees = isFiltered
    ? employees.filter((e) => selected.includes(e.branch))
    : employees;
  const fBranches = isFiltered
    ? branches.filter((b) => selected.includes(b.branch))
    : branches;

  const salesSorted = [...fBranches].sort((a, b) => b.totalSale - a.totalSale);
  const kpiSorted = [...fBranches].sort((a, b) => b.avgKpi - a.avgKpi);
  const lateSorted = [...fBranches].sort((a, b) => b.lateHours - a.lateHours);

  const top = salesSorted[0];
  const bottom = salesSorted[salesSorted.length - 1];
  const bestKpi = kpiSorted[0];

  const topSaleByEmp = [...fEmployees]
    .filter((e) => e.totalSale > 0)
    .sort((a, b) => b.totalSale - a.totalSale)
    .slice(0, 3);

  const lateEmployees = [...fEmployees]
    .filter((e) => e.lateAttendance > 4)
    .sort((a, b) => b.lateAttendance - a.lateAttendance)
    .slice(0, 5);

  const outliers = fEmployees
    .filter((e) => e.kpi > 20 || e.kpi < 0)
    .sort((a, b) => b.kpi - a.kpi);

  return (
    <div className="space-y-2">
    {isFiltered && (
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 font-medium text-blue-700">
          Filtered
        </span>
        Insights reflect:{" "}
        <strong className="text-slate-700">{selected.join(", ")}</strong>
      </div>
    )}
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {!isFiltered && (
        <Card title="Top branch by sales" tone="blue">
          {top ? (
            <>
              <Stat label={top.branch} value={fmtAED(top.totalSale)} />
              <Sub>Avg KPI {fmtKpi(top.avgKpi)} · {top.employees} employees</Sub>
            </>
          ) : (
            <p className="text-sm text-slate-400">No data.</p>
          )}
        </Card>
      )}

      {!isFiltered && (
        <Card title="Worst branch by sales" tone="rose">
          {bottom && bottom !== top ? (
            <>
              <Stat label={bottom.branch} value={fmtAED(bottom.totalSale)} />
              <Sub>
                Gap to leader: {fmtAED((top?.totalSale ?? 0) - bottom.totalSale)} AED
              </Sub>
            </>
          ) : (
            <p className="text-sm text-slate-400">No data.</p>
          )}
        </Card>
      )}

      {!isFiltered && (
        <Card title="Highest branch KPI" tone="emerald">
          {bestKpi ? (
            <>
              <Stat label={bestKpi.branch} value={fmtKpi(bestKpi.avgKpi)} />
              <Sub>{bestKpi.employees} employees</Sub>
            </>
          ) : (
            <p className="text-sm text-slate-400">No data.</p>
          )}
        </Card>
      )}

      <Card
        title="Late hours leaderboard"
        tone={lateSorted[0]?.lateHours ? "amber" : "slate"}
      >
        {lateSorted.length ? (
          <ol className="text-sm space-y-1">
            {lateSorted.slice(0, 4).map((b, i) => (
              <li key={b.branch} className="flex justify-between">
                <span className="text-slate-700">
                  {i + 1}. {b.branch}
                </span>
                <span className="font-semibold tabular-nums">{b.lateHours}h</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-slate-400">No late hours recorded.</p>
        )}
      </Card>

      <Card title="Top sales employees" tone="blue">
        {topSaleByEmp.length ? (
          <ol className="text-sm space-y-1">
            {topSaleByEmp.map((e, i) => (
              <li key={`${e.empId}-${e.name}`} className="flex justify-between gap-2">
                <span className="truncate text-slate-700">
                  {i + 1}. {e.name}{" "}
                  <span className="text-slate-400 text-xs">· {e.branch}</span>
                </span>
                <span className="font-semibold tabular-nums">
                  {fmtAED(e.totalSale)}
                </span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-slate-400">No sales recorded.</p>
        )}
      </Card>

      <Card
        title="Attendance risk"
        tone={lateEmployees.length ? "rose" : "emerald"}
      >
        {lateEmployees.length ? (
          <ol className="text-sm space-y-1">
            {lateEmployees.map((e, i) => (
              <li key={`late-${e.empId}-${e.name}`} className="flex justify-between gap-2">
                <span className="truncate text-slate-700">
                  {i + 1}. {e.name}{" "}
                  <span className="text-slate-400 text-xs">· {e.branch}</span>
                </span>
                <span className="font-semibold tabular-nums text-rose-600">
                  {e.lateAttendance}h
                </span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-emerald-700 font-medium">
            All clean — no employees above 4 late hours.
          </p>
        )}
      </Card>

      <Card title="KPI outliers" tone={outliers.length ? "amber" : "emerald"}>
        {outliers.length ? (
          <>
            <ul className="text-sm space-y-1 max-h-72 overflow-auto pr-1">
              {outliers.map((e) => (
                <li
                  key={`out-${e.empId}-${e.name}`}
                  className="flex justify-between"
                >
                  <span className="truncate text-slate-700">
                    {e.name}{" "}
                    <span className="text-slate-400 text-xs">· {e.branch}</span>
                  </span>
                  <span className="font-semibold tabular-nums">
                    {fmtKpi(e.kpi)}
                  </span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-amber-700 mt-2">
              {outliers.length} outlier{outliers.length === 1 ? "" : "s"} —
              worth confirming with the field.
            </p>
          </>
        ) : (
          <p className="text-sm text-emerald-700 font-medium">
            No outliers detected.
          </p>
        )}
      </Card>

      {!isFiltered && (
        <Card title="Spread" tone="slate">
          {salesSorted.length ? (
            <>
              <Stat
                label="Range"
                value={fmtAED(salesSorted[0].totalSale - salesSorted[salesSorted.length - 1].totalSale)}
              />
              <Sub>
                between top &amp; bottom branch
                <br />
                Median sales:{" "}
                {fmtAED(
                  salesSorted[Math.floor(salesSorted.length / 2)]?.totalSale ?? 0,
                )}
              </Sub>
            </>
          ) : (
            <p className="text-sm text-slate-400">No data.</p>
          )}
        </Card>
      )}
    </div>
    </div>
  );
}

function Card({
  title,
  tone,
  children,
}: {
  title: string;
  tone: "blue" | "rose" | "emerald" | "amber" | "slate";
  children: React.ReactNode;
}) {
  const tones: Record<typeof tone, string> = {
    blue: "border-blue-200 bg-blue-50/40",
    rose: "border-rose-200 bg-rose-50/40",
    emerald: "border-emerald-200 bg-emerald-50/40",
    amber: "border-amber-200 bg-amber-50/40",
    slate: "border-slate-200 bg-slate-50/40",
  };
  return (
    <div className={`rounded-xl border ${tones[tone]} p-4 shadow-sm`}>
      <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-600">
        {title}
      </h4>
      <div className="mt-2 space-y-2">{children}</div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-sm text-slate-700 truncate">{label}</span>
      <span className="text-xl font-semibold tabular-nums text-slate-900">
        {value}
      </span>
    </div>
  );
}

function Sub({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-slate-500">{children}</p>;
}

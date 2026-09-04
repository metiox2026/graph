import * as XLSX from "xlsx";

export type Employee = {
  empId: string | number;
  name: string;
  branch: string;
  lateAttendance: number;
  kpi: number;
  totalSale: number;
  products: Record<string, number>;
};

export type BranchAgg = {
  branch: string;
  employees: number;
  totalSale: number;
  totalKpi: number;
  avgKpi: number;
  lateHours: number;
  products: Record<string, number>;
};

export type Dataset = {
  fileName: string;
  uploadedAt: string;
  employees: Employee[];
  branches: BranchAgg[];
  productNames: string[];
};

const PRODUCT_HINTS = [
  "abaya",
  "sumo",
  "shilla",
  "shila",
  "prayer",
  "jalabiya",
  "amoudi",
  "dalma",
  "dress",
];

const BRANCH_SHEET_HINTS = ["branch summary", "branch", "summary"];
const EMPLOYEE_SHEET_HINTS = ["employee report", "data", "employees", "employee"];

const norm = (v: unknown) =>
  String(v ?? "").replace(/\s+/g, " ").trim();

const num = (v: unknown) => {
  if (v === null || v === undefined || v === "") return 0;
  if (typeof v === "number") return v;
  const s = String(v).replace(/[,\s]/g, "");
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : 0;
};

function pickHeader(headers: string[], aliases: string[]) {
  const lower = headers.map((h) => h.toLowerCase());
  for (const alias of aliases) {
    const idx = lower.findIndex((h) => h.includes(alias));
    if (idx !== -1) return headers[idx];
  }
  return undefined;
}

function detectProductColumns(headers: string[]) {
  // Metric column names that look like totals are excluded via the picks below.
  const excludeNames = new Set(
    [
      ...headers,
    ]
      .map((h) => h.toLowerCase())
      .filter((l) => l.includes("total") && (l.includes("sale") || l.includes("sales")))
      .concat(
        headers
          .map((h) => h.toLowerCase())
          .filter((l) => /(kpi|rank|emp ?id|branch|name|late|attendance)/.test(l)),
      ),
  );
  return headers.filter((h) => {
    const l = h.toLowerCase();
    if (!l) return false;
    if (excludeNames.has(l)) return false;
    return PRODUCT_HINTS.some((p) => l.includes(p)) || /units?/i.test(h);
  });
}

function arrayBufferToWorkbook(buf: ArrayBuffer) {
  return XLSX.read(buf, { type: "array", cellDates: false });
}

function sheetToRows(sheet: XLSX.WorkSheet): Record<string, unknown>[] {
  return XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
    raw: false,
  });
}

function pickEmployeeSheet(wb: XLSX.WorkBook): string | undefined {
  const names = wb.SheetNames;
  for (const hint of EMPLOYEE_SHEET_HINTS) {
    const m = names.find((n) => n.toLowerCase().includes(hint));
    if (m) return m;
  }
  // Fallback: take the sheet with the most rows that look like data
  let best: { name: string; rows: number } | undefined;
  for (const name of names) {
    const rows = sheetToRows(wb.Sheets[name]).length;
    if (!best || rows > best.rows) best = { name, rows };
  }
  return best?.name;
}

function parseEmployees(sheet: XLSX.WorkSheet): {
  employees: Employee[];
  productNames: string[];
} {
  const rows = sheetToRows(sheet);
  if (!rows.length) return { employees: [], productNames: [] };

  const headers = Object.keys(rows[0]);
  const nameKey =
    pickHeader(headers, ["name", "employee"]) ?? headers.find((h) => /name/i.test(h));
  if (!nameKey) return { employees: [], productNames: [] };

  const branchKey = pickHeader(headers, ["branch"]);
  const idKey = pickHeader(headers, ["emp id", "empid", "id"]);
  const kpiKey = pickHeader(headers, ["kpi"]);
  const lateKey = pickHeader(headers, ["late", "attendance"]);
  const saleKey = pickHeader(headers, ["total sale", "sale aed", "sales"]);
  const productCols = detectProductColumns(headers);

  const employees: Employee[] = rows
    .map((r) => {
      const name = norm(r[nameKey]);
      if (!name) return null;
      const products: Record<string, number> = {};
      for (const col of productCols) products[col] = num(r[col]);
      return {
        empId: idKey ? r[idKey] ?? name : name,
        name,
        branch: branchKey ? norm(r[branchKey]) || "Unassigned" : "Unassigned",
        lateAttendance: num(lateKey ? r[lateKey] : 0),
        kpi: num(kpiKey ? r[kpiKey] : 0),
        totalSale: num(saleKey ? r[saleKey] : 0),
        products,
      };
    })
    .filter((e): e is Employee => e !== null);

  return { employees, productNames: productCols };
}

function aggregateBranches(
  employees: Employee[],
  productNames: string[],
): BranchAgg[] {
  const map = new Map<string, BranchAgg>();
  for (const e of employees) {
    let b = map.get(e.branch);
    if (!b) {
      b = {
        branch: e.branch,
        employees: 0,
        totalSale: 0,
        totalKpi: 0,
        avgKpi: 0,
        lateHours: 0,
        products: Object.fromEntries(productNames.map((p) => [p, 0])),
      };
      map.set(e.branch, b);
    }
    b.employees += 1;
    b.totalSale += e.totalSale;
    b.totalKpi += e.kpi;
    b.lateHours += e.lateAttendance;
    for (const p of productNames) b.products[p] += e.products[p] ?? 0;
  }
  for (const b of map.values()) {
    b.avgKpi = b.employees ? b.totalKpi / b.employees : 0;
  }
  return [...map.values()].sort((a, b) => b.totalSale - a.totalSale);
}

export async function parseExcelFile(file: File): Promise<Dataset> {
  const buf = await file.arrayBuffer();
  const wb = arrayBufferToWorkbook(buf);
  const employeeSheetName = pickEmployeeSheet(wb);
  if (!employeeSheetName) throw new Error("No data sheet found in workbook.");
  const { employees, productNames } = parseEmployees(wb.Sheets[employeeSheetName]);
  if (!employees.length)
    throw new Error(
      `Sheet "${employeeSheetName}" had no recognizable employee rows.`,
    );
  const branches = aggregateBranches(employees, productNames);
  return {
    fileName: file.name,
    uploadedAt: new Date().toISOString(),
    employees,
    branches,
    productNames,
  };
}

export function loadCachedDataset(): Dataset | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("wsad:dataset");
    return raw ? (JSON.parse(raw) as Dataset) : null;
  } catch {
    return null;
  }
}

export function saveCachedDataset(d: Dataset) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("wsad:dataset", JSON.stringify(d));
  } catch {
    /* quota — ignore */
  }
}

export function clearCachedDataset() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("wsad:dataset");
}

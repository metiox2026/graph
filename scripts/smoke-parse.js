const XLSX = require("xlsx");
const file = process.argv[2] || "C:/Users/LOQ/Downloads/Weekly_Sales_Attendance_Dashboard (1).xlsx";
const wb = XLSX.readFile(file, { cellDates: false });
const target = wb.SheetNames.find((n) => /data|employee/i.test(n));
const ws = wb.Sheets[target];
const rows = XLSX.utils.sheet_to_json(ws, { defval: "", raw: false });
const headers = Object.keys(rows[0]);

// Mirror the TS implementation
const PRODUCT_HINTS = ["abaya", "sumo", "shilla", "shila", "prayer", "jalabiya", "amoudi", "dalma", "dress"];
const excludeNames = new Set(
  headers
    .map((h) => h.toLowerCase())
    .filter((l) => l.includes("total") && (l.includes("sale") || l.includes("sales")))
    .concat(
      headers
        .map((h) => h.toLowerCase())
        .filter((l) => /(kpi|rank|emp ?id|branch|name|late|attendance)/.test(l)),
    ),
);
const products = headers.filter((h) => {
  const l = h.toLowerCase();
  if (!l) return false;
  if (excludeNames.has(l)) return false;
  return PRODUCT_HINTS.some((p) => l.includes(p)) || /units?/i.test(h);
});
console.log("Detected products:", products);

const num = (v) => {
  if (v === null || v === undefined || v === "") return 0;
  if (typeof v === "number") return v;
  const s = String(v).replace(/[,\s]/g, "");
  return Number.isFinite(parseFloat(s)) ? parseFloat(s) : 0;
};
const norm = (v) => String(v ?? "").replace(/\s+/g, " ").trim();
const pickHeader = (headers, aliases) => {
  const lower = headers.map((h) => h.toLowerCase());
  for (const a of aliases) {
    const i = lower.findIndex((h) => h.includes(a));
    if (i !== -1) return headers[i];
  }
};
const nameKey = pickHeader(headers, ["name"]);
const branchKey = pickHeader(headers, ["branch"]);
const saleKey = pickHeader(headers, ["total sale"]);

const employees = rows
  .map((r) => ({
    name: norm(r[nameKey]),
    branch: norm(r[branchKey]),
    sale: num(r[saleKey]),
    prods: Object.fromEntries(products.map((p) => [p, num(r[p])])),
  }))
  .filter((e) => e.name);

console.log("\nTotal sales:", employees.reduce((s, e) => s + e.sale, 0));
console.log("\nTotal units per product:");
const productTotals = {};
for (const p of products) {
  productTotals[p] = employees.reduce((s, e) => s + (e.prods[p] ?? 0), 0);
}
console.log(productTotals);

const branches = new Map();
for (const e of employees) {
  if (!branches.has(e.branch)) branches.set(e.branch, { branch: e.branch, n: 0, sale: 0 });
  const b = branches.get(e.branch);
  b.n += 1; b.sale += e.sale;
}
console.log("\nBranches (by sales):", [...branches.values()].sort((a, b) => b.sale - a.sale));

export const fmtNum = (n: number) =>
  Math.round(n).toLocaleString("en-US");

export const fmtAED = (n: number) => `${fmtNum(n)}`;

export const fmtPct = (n: number, digits = 1) => `${n.toFixed(digits)}%`;

export const fmtKpi = (n: number) => n.toFixed(1);

export const fmtRelative = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Color a KPI cell. The user's sample used a 0-10 scale; values > 10 (capped)
 * trend toward green and values > 20 trend red.
 */
export function kpiColor(v: number): string {
  if (v > 20) return "#f87171"; // clearly an outlier
  const clamped = Math.min(Math.max(v, 0), 10);
  const t = clamped / 10; // 0 → 1
  // From amber/orange (low) → green (high)
  const r = Math.round(254 + (99 - 254) * t);
  const g = Math.round(215 + (230 - 215) * t);
  const b = Math.round(170 + (99 - 170) * t);
  return `rgb(${r}, ${g}, ${b})`;
}

export const PALETTE = [
  "#2563eb",
  "#0ea5e9",
  "#14b8a6",
  "#10b981",
  "#f59e0b",
  "#f97316",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#64748b",
  "#84cc16",
  "#06b6d4",
];

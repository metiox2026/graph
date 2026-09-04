"use client";

import { useEffect, useMemo, useState } from "react";
import {
  clearCachedDataset,
  loadCachedDataset,
  saveCachedDataset,
  type Dataset,
} from "./lib/excel";
import Uploader from "./components/Uploader";
import UploadModal from "./components/UploadModal";
import ConfirmModal from "./components/ConfirmModal";
import Scorecards from "./components/Scorecards";
import BranchFilter from "./components/BranchFilter";
import BranchTable from "./components/BranchTable";
import Charts from "./components/Charts";
import EmployeeTable from "./components/EmployeeTable";
import Insights from "./components/Insights";

export default function Home() {
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [ready, setReady] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [compareMode, setCompareMode] = useState(false);
  const [rankBy, setRankBy] = useState<"sales" | "kpi" | "units">("sales");
  const [hydrated, setHydrated] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [confirmHome, setConfirmHome] = useState(false);

  useEffect(() => {
    setHydrated(true);
    const cached = loadCachedDataset();
    if (cached) setDataset(cached);
    setReady(true);
  }, []);

  const handleLoaded = (d: Dataset) => {
    setDataset(d);
    setSelected([]);
    setSearch("");
    saveCachedDataset(d);
  };

  const handleClear = () => {
    clearCachedDataset();
    setDataset(null);
    setSelected([]);
    setSearch("");
    setCompareMode(false);
  };

  const confirmAndGoHome = () => {
    setConfirmHome(false);
    handleClear();
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const branches = dataset?.branches ?? [];
  const branchNames = useMemo(() => branches.map((b) => b.branch), [branches]);

  if (!hydrated) return null;

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        Loading…
      </div>
    );
  }

  if (!dataset) {
    return (
      <main className="min-h-screen grid place-items-center px-4 py-12">
        <div className="w-full max-w-xl">
          <header className="mb-6 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Weekly Sales &amp; Attendance
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Upload this week&apos;s report to build the dashboard.
            </p>
          </header>
          <Uploader onLoaded={handleLoaded} hasCache={false} />
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="mx-auto max-w-7xl px-4 py-6 space-y-5">
        <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Weekly Sales &amp; Attendance Dashboard
          </h1>
          <p className="text-sm text-slate-500">
            Re-upload each week to refresh — last file is cached in
            localStorage.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowUpload(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Upload new week
          </button>
        </div>
      </header>

      <BranchFilter
        branches={branchNames}
        selected={selected}
        onChange={setSelected}
        search={search}
        onSearch={setSearch}
        compareMode={compareMode}
        onCompareChange={setCompareMode}
        rankBy={rankBy}
        onRankChange={setRankBy}
        onClearCache={handleClear}
        onResetFilters={() => {
          setSelected([]);
          setSearch("");
          setCompareMode(false);
        }}
        fileName={dataset.fileName}
        uploadedAt={dataset.uploadedAt}
      />

      <Scorecards
        employees={dataset.employees}
        branches={dataset.branches}
        productNames={dataset.productNames}
        selected={selected}
      />

      <Charts
        branches={dataset.branches}
        employees={dataset.employees}
        productNames={dataset.productNames}
        selected={selected}
        rankBy={rankBy}
      />

      <Insights
        employees={dataset.employees}
        branches={dataset.branches}
        selected={selected}
      />

      <BranchTable
        branches={dataset.branches}
        productNames={dataset.productNames}
        selected={selected}
        rankBy={rankBy}
      />

      <EmployeeTable
        employees={dataset.employees}
        productNames={dataset.productNames}
        selected={selected}
        search={search}
      />

      <footer className="mt-8 border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between gap-3 text-[11px] text-slate-400">
          <span>
            © {new Date().getFullYear()} · Internal use only — figures are
            derived from uploaded weekly management reports.
          </span>
          <button
            type="button"
            onClick={() => setConfirmHome(true)}
            className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1 font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            title="Return to upload screen — clears the cached file"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 11l9-8 9 8" />
              <path d="M5 10v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V10" />
            </svg>
            Home
          </button>
        </div>
      </footer>
      </main>

      <UploadModal
        open={showUpload}
        onClose={() => setShowUpload(false)}
        onLoaded={handleLoaded}
      />

      <ConfirmModal
        open={confirmHome}
        title="Return to upload screen?"
        message="This will clear the cached Excel file from your browser. You can upload it again anytime, but it will need to be re-imported."
        confirmLabel="Yes, clear & go home"
        cancelLabel="Stay"
        tone="danger"
        onConfirm={confirmAndGoHome}
        onCancel={() => setConfirmHome(false)}
      />
    </>
  );
}

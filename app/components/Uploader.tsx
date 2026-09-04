"use client";

import { useCallback, useRef, useState } from "react";
import { parseExcelFile, type Dataset } from "../lib/excel";

type Props = {
  onLoaded: (d: Dataset, replace: boolean) => void;
  hasCache: boolean;
};

export default function Uploader({ onLoaded, hasCache }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File, replace = true) => {
      setError(null);
      setBusy(true);
      try {
        const ds = await parseExcelFile(file);
        onLoaded(ds, replace);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to parse the file.");
      } finally {
        setBusy(false);
      }
    },
    [onLoaded],
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={onDrop}
      className={`relative rounded-2xl border-2 border-dashed transition-all p-10 text-center ${
        drag
          ? "border-blue-500 bg-blue-50/60"
          : "border-slate-300 bg-white hover:bg-slate-50"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls,.xlsm"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 ring-1 ring-blue-100">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
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
      </div>
      <h2 className="text-lg font-semibold text-slate-900">
        {busy ? "Parsing workbook…" : "Drop the weekly Excel file here"}
      </h2>
      <p className="text-sm text-slate-500 mt-1">
        or click to browse · .xlsx .xls .xlsm
      </p>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="mt-5 inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50"
      >
        {busy ? "Loading…" : "Choose file"}
      </button>
      {hasCache && (
        <p className="text-xs text-slate-500 mt-4">
          A previous week is cached locally — uploading again will replace it.
        </p>
      )}
      {error && (
        <p className="mt-3 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

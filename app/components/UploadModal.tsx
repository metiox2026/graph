"use client";

import { useEffect } from "react";
import Uploader from "./Uploader";
import type { Dataset } from "../lib/excel";

type Props = {
  open: boolean;
  onClose: () => void;
  onLoaded: (d: Dataset) => void;
};

export default function UploadModal({ open, onClose, onLoaded }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center overflow-hidden bg-slate-900/75 backdrop-blur-sm p-4 sm:p-12"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-modal-title"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
        aria-label="Close"
      />
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200">
          <h2
            id="upload-modal-title"
            className="text-base font-semibold text-slate-900"
          >
            Upload a new week
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            aria-label="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="p-5">
          <p className="text-sm text-slate-600 mb-4">
            Drop a fresh <code>.xlsx</code> report here — the dashboard will
            reload with the new week's data.
          </p>
          <Uploader
            onLoaded={(d) => {
              onLoaded(d);
              onClose();
            }}
            hasCache
          />
        </div>
      </div>
    </div>
  );
}

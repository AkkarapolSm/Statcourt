"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("StatCourtTH App Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0F172A] text-white flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="w-16 h-16 rounded-full bg-red-950/80 border border-red-500/50 flex items-center justify-center mb-6 text-red-400">
        <AlertTriangle className="w-8 h-8" />
      </div>

      <span className="text-xs font-mono font-bold tracking-widest text-red-400 uppercase mb-2">
        APPLICATION ERROR / เกิดข้อผิดพลาด
      </span>

      <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mb-3">
        Something went wrong
      </h1>

      <p className="text-slate-400 text-sm max-w-md mb-8 leading-relaxed">
        {error.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล กรุณาลองใหม่อีกครั้ง หรือกลับสู่หน้าหลัก"}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3 font-mono text-xs font-bold">
        <button
          onClick={() => reset()}
          className="px-5 py-2.5 rounded bg-[#DC2626] hover:bg-[#B91C1C] text-white flex items-center gap-2 transition uppercase shadow-lg shadow-red-950/50 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>ลองใหม่อีกครั้ง (Retry)</span>
        </button>

        <Link
          href="/"
          className="px-5 py-2.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 transition uppercase"
        >
          <Home className="w-4 h-4" />
          <span>กลับหน้าหลัก (Home)</span>
        </Link>
      </div>
    </div>
  );
}

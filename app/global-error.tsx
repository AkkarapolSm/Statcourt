"use client";

import React, { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("StatCourtTH Global Error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0F172A] text-white flex flex-col items-center justify-center p-6 text-center font-sans antialiased">
        <div className="w-16 h-16 rounded-full bg-red-950/80 border border-red-500/50 flex items-center justify-center mb-6 text-red-400">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <span className="text-xs font-mono font-bold tracking-widest text-red-400 uppercase mb-2">
          CRITICAL SYSTEM ERROR / ข้อผิดพลาดระบบ
        </span>

        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mb-3">
          Failed to load layout
        </h1>

        <p className="text-slate-400 text-sm max-w-md mb-8 leading-relaxed">
          {error.message || "เกิดข้อผิดพลาดในการโหลดโครงสร้างหน้าเว็บ กรุณารีเฟรชเพื่อลองใหม่"}
        </p>

        <button
          onClick={() => reset()}
          className="px-6 py-3 rounded bg-[#DC2626] hover:bg-[#B91C1C] text-white flex items-center gap-2 transition uppercase font-mono text-xs font-bold shadow-lg shadow-red-950/50 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>รีโหลดระบบ (Reload)</span>
        </button>
      </body>
    </html>
  );
}

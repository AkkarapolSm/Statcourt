"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw, Home } from "lucide-react";

export default function AthleteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[ATHLETE SEGMENT ERROR]", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h2 className="text-xl font-bold text-white mb-2">
        เกิดข้อผิดพลาดในการโหลดโปรไฟล์นักกีฬา
      </h2>
      <p className="text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
        {error.message || "ไม่สามารถแสดงข้อมูลสถิติหรือโปรไฟล์ของนักกีฬาได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง"}
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => reset()}
          className="px-4 py-2 rounded-lg bg-primary hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 transition"
        >
          <RotateCcw className="w-4 h-4" />
          ลองใหม่อีกครั้ง (Retry)
        </button>
        <Link
          href="/leaderboard"
          className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1.5 transition"
        >
          <Home className="w-4 h-4" />
          ไปที่ทำเนียบนักกีฬา
        </Link>
      </div>
    </div>
  );
}

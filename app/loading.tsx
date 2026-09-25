import React from "react";
import { Loader2 } from "lucide-react";

export default function RootLoading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-background px-4">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center font-bold text-xs text-primary font-mono">
            SC
          </div>
        </div>
        <div className="text-center space-y-1">
          <p className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
            STATCOURT.TH
          </p>
          <p className="text-sm font-semibold text-slate-200">
            กำลังโหลดข้อมูลระบบ (Loading...)
          </p>
        </div>
      </div>
    </div>
  );
}

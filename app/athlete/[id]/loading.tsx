import React from "react";
import { User } from "lucide-react";

export default function AthleteLoading() {
  return (
    <div className="min-h-screen bg-background text-on-background py-8 px-4 max-w-7xl mx-auto space-y-8 animate-pulse">
      {/* Hero skeleton */}
      <div className="h-64 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex items-center p-6 gap-6">
        <div className="w-28 h-36 rounded-xl bg-slate-800 flex items-center justify-center text-slate-700">
          <User className="w-12 h-12" />
        </div>
        <div className="space-y-3 flex-1">
          <div className="h-6 w-48 bg-slate-800 rounded" />
          <div className="h-4 w-32 bg-slate-800/60 rounded" />
          <div className="flex gap-2 pt-2">
            <div className="h-8 w-20 bg-slate-800 rounded" />
            <div className="h-8 w-24 bg-slate-800 rounded" />
            <div className="h-8 w-20 bg-slate-800 rounded" />
          </div>
        </div>
      </div>

      {/* Tabs skeleton */}
      <div className="h-12 rounded-xl bg-surface-container-low border border-outline-variant/30 flex gap-2 p-1">
        <div className="h-full w-28 bg-slate-800 rounded-lg" />
        <div className="h-full w-28 bg-slate-800/40 rounded-lg" />
        <div className="h-full w-28 bg-slate-800/40 rounded-lg" />
      </div>

      {/* Content grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-72 rounded-2xl bg-surface-container-low border border-outline-variant/30" />
        <div className="h-72 rounded-2xl bg-surface-container-low border border-outline-variant/30 md:col-span-2" />
      </div>
    </div>
  );
}

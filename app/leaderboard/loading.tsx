import React from "react";
import { Trophy } from "lucide-react";

export default function LeaderboardLoading() {
  return (
    <div className="min-h-screen bg-background text-on-background py-8 px-4 max-w-7xl mx-auto space-y-6 animate-pulse">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-64 bg-slate-800 rounded" />
          <div className="h-4 w-96 bg-slate-800/60 rounded" />
        </div>
        <div className="h-10 w-44 bg-slate-800 rounded" />
      </div>

      {/* Podium Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
        <div className="h-64 rounded-2xl bg-surface-container-low border border-outline-variant/30" />
        <div className="h-72 rounded-2xl bg-surface-container-low border border-outline-variant/30 -translate-y-2" />
        <div className="h-64 rounded-2xl bg-surface-container-low border border-outline-variant/30" />
      </div>

      {/* Table Skeleton */}
      <div className="h-96 rounded-2xl bg-surface-container-low border border-outline-variant/30 p-4 space-y-3">
        <div className="h-10 bg-slate-800 rounded" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-12 bg-slate-800/40 rounded" />
        ))}
      </div>
    </div>
  );
}

import React from "react";

export default function MatchesLoading() {
  return (
    <div className="min-h-screen bg-[#070B14] text-white py-8 px-4 sm:px-6 lg:px-8 max-w-[1536px] mx-auto space-y-8 animate-pulse">
      {/* Hero skeleton */}
      <div className="h-44 rounded-2xl bg-slate-900/80 border border-slate-800" />

      {/* Filter bar skeleton */}
      <div className="h-14 rounded-xl bg-slate-900/80 border border-slate-800" />

      {/* Featured match skeleton */}
      <div className="h-64 rounded-2xl bg-slate-900/80 border border-slate-800" />

      {/* Match cards grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-56 rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-4">
            <div className="h-4 w-28 bg-slate-800 rounded" />
            <div className="h-16 bg-slate-800/50 rounded-xl" />
            <div className="h-10 bg-slate-800/70 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}

import React from "react";

export default function TournamentsLoading() {
  return (
    <div className="min-h-screen bg-background text-on-background py-8 px-4 max-w-7xl mx-auto space-y-6 animate-pulse">
      <div className="h-8 w-56 bg-slate-800 rounded" />
      <div className="h-12 rounded-xl bg-surface-container-low border border-outline-variant/30 flex gap-2 p-2">
        <div className="h-full w-24 bg-slate-800 rounded" />
        <div className="h-full w-24 bg-slate-800/40 rounded" />
        <div className="h-full w-24 bg-slate-800/40 rounded" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-64 rounded-2xl bg-surface-container-low border border-outline-variant/30 p-5 space-y-4">
            <div className="h-6 w-3/4 bg-slate-800 rounded" />
            <div className="h-4 w-1/2 bg-slate-800/60 rounded" />
            <div className="h-20 bg-slate-800/30 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}

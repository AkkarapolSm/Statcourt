import React from "react";

export default function ScoutLoading() {
  return (
    <div className="min-h-screen bg-background text-on-background py-8 px-4 max-w-7xl mx-auto space-y-6 animate-pulse">
      <div className="h-8 w-72 bg-slate-800 rounded" />
      <div className="h-14 rounded-xl bg-surface-container-low border border-outline-variant/30" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-72 rounded-2xl bg-surface-container-low border border-outline-variant/30 p-5 space-y-3">
            <div className="flex gap-3">
              <div className="w-14 h-16 rounded-xl bg-slate-800" />
              <div className="space-y-2 flex-1">
                <div className="h-5 w-3/4 bg-slate-800 rounded" />
                <div className="h-3 w-1/2 bg-slate-800/60 rounded" />
              </div>
            </div>
            <div className="h-24 bg-slate-800/30 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}

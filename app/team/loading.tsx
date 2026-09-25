import React from "react";

export default function TeamLoading() {
  return (
    <div className="min-h-screen bg-background text-on-background py-8 px-4 max-w-7xl mx-auto space-y-6 animate-pulse">
      <div className="h-8 w-60 bg-slate-800 rounded" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="h-96 rounded-2xl bg-surface-container-low border border-outline-variant/30 p-4 space-y-3">
          <div className="h-8 bg-slate-800 rounded" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 bg-slate-800/40 rounded" />
          ))}
        </div>
        <div className="md:col-span-3 h-96 rounded-2xl bg-surface-container-low border border-outline-variant/30 p-6 space-y-4">
          <div className="h-8 w-48 bg-slate-800 rounded" />
          <div className="h-64 bg-slate-800/30 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

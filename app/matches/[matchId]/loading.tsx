import React from "react";

export default function MatchLoading() {
  return (
    <div className="min-h-screen bg-[#0A0F1D] text-white py-8 px-4 max-w-7xl mx-auto space-y-6 animate-pulse">
      <div className="h-20 rounded-2xl bg-slate-900/80 border border-slate-800" />
      <div className="h-[460px] rounded-2xl bg-slate-900/80 border border-slate-800" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-64 rounded-xl bg-slate-900/80 border border-slate-800" />
        <div className="h-64 rounded-xl bg-slate-900/80 border border-slate-800" />
      </div>
    </div>
  );
}

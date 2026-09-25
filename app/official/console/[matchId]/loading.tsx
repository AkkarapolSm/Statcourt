import React from "react";

export default function OfficialConsoleLoading() {
  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 space-y-4 animate-pulse">
      <div className="h-16 rounded-xl bg-slate-900 border border-slate-800 p-4 flex items-center justify-between">
        <div className="h-6 w-48 bg-slate-800 rounded" />
        <div className="h-10 w-32 bg-slate-800 rounded" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="h-[75vh] rounded-xl bg-slate-900 border border-slate-800" />
        <div className="h-[75vh] rounded-xl bg-slate-900 border border-slate-800" />
        <div className="h-[75vh] rounded-xl bg-slate-900 border border-slate-800" />
      </div>
    </div>
  );
}

import React from "react";

export default function LiveLoading() {
  return (
    <div className="min-h-screen bg-[#070b14] text-white py-6 px-4 max-w-7xl mx-auto space-y-6 animate-pulse">
      {/* Scoreboard banner skeleton */}
      <div className="h-40 rounded-2xl bg-slate-900 border border-slate-800 p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-slate-800" />
          <div className="space-y-2">
            <div className="h-5 w-32 bg-slate-800 rounded" />
            <div className="h-8 w-16 bg-slate-800 rounded" />
          </div>
        </div>
        <div className="h-10 w-24 bg-slate-800 rounded-xl" />
        <div className="flex items-center gap-4">
          <div className="space-y-2 text-right">
            <div className="h-5 w-32 bg-slate-800 rounded" />
            <div className="h-8 w-16 bg-slate-800 rounded ml-auto" />
          </div>
          <div className="w-16 h-16 rounded-xl bg-slate-800" />
        </div>
      </div>

      {/* Main split skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-96 rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4">
          <div className="h-6 w-48 bg-slate-800 rounded" />
          <div className="h-72 bg-slate-800/40 rounded-xl" />
        </div>
        <div className="h-96 rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-3">
          <div className="h-6 w-32 bg-slate-800 rounded" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-14 bg-slate-800/40 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

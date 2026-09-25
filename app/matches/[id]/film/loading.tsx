import React from "react";

export default function MatchFilmLoading() {
  return (
    <div className="min-h-screen bg-[#060a12] text-white py-6 px-4 max-w-7xl mx-auto space-y-6 animate-pulse">
      <div className="h-14 rounded-xl bg-slate-900 border border-slate-800" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-[500px] rounded-2xl bg-slate-900 border border-slate-800" />
        <div className="h-[500px] rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-3">
          <div className="h-6 w-32 bg-slate-800 rounded" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-slate-800/40 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

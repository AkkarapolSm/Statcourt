import React from "react";

export default function MatchDetailLoading() {
  return (
    <div className="min-h-screen bg-background text-on-background py-8 px-4 max-w-7xl mx-auto space-y-6 animate-pulse">
      <div className="h-44 rounded-2xl bg-surface-container-low border border-outline-variant/30 p-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-80 rounded-2xl bg-surface-container-low border border-outline-variant/30" />
        <div className="h-80 rounded-2xl bg-surface-container-low border border-outline-variant/30" />
      </div>
    </div>
  );
}

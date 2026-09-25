"use client";

import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import UnifiedLiveMatchHub from "@/components/live/UnifiedLiveMatchHub";

export default function MatchFilmReviewPage({
  params,
}: {
  params: { matchId: string };
}) {
  return (
    <div className="min-h-screen bg-[#0A0F1D] text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pb-16 max-w-[1536px] mx-auto w-full px-4 sm:px-6 lg:px-8 pt-6">
        <UnifiedLiveMatchHub matchId={params.matchId} />
      </main>

      <Footer />
    </div>
  );
}

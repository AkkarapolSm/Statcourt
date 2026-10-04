"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  Radio,
  ChevronRight,
  ArrowRight,
  Trophy,
  Filter,
  Loader2,
} from "lucide-react";

interface MatchItem {
  id: string;
  tournamentId?: string;
  tournamentName?: string;
  tournament?: { name: string };
  homeTeam: { id?: string; name: string; shortName?: string | null };
  awayTeam: { id?: string; name: string; shortName?: string | null };
  homeScore: number;
  awayScore: number;
  status: "SCHEDULED" | "LIVE" | "COMPLETED" | "DISPUTED";
  resultStatus?: string | null;
  currentQuarter?: number;
  gameClockDisplay?: string;
  venue?: string;
  scheduledTime?: string;
  scheduledAt?: string;
}

export default function TodaysGamesSection() {
  const [filter, setFilter] = useState<"ALL" | "LIVE" | "COMPLETED" | "SCHEDULED">("ALL");
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchMatches() {
      try {
        setIsLoading(true);
        setIsError(false);
        const res = await fetch("/api/matches");
        if (!res.ok) throw new Error("Failed to fetch matches");
        const json = await res.json();
        if (isMounted && json.success && Array.isArray(json.data)) {
          setMatches(json.data);
        }
      } catch (err) {
        console.warn("Failed to load today's matches from API:", err);
        if (isMounted) setIsError(true);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    fetchMatches();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredMatches = matches.filter((match) => {
    if (filter === "ALL") return true;
    if (filter === "LIVE") return match.status === "LIVE";
    if (filter === "COMPLETED") return match.status === "COMPLETED";
    if (filter === "SCHEDULED") return match.status === "SCHEDULED";
    return true;
  });

  return (
    <section className="py-10 bg-white border-b border-borderNeutral">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with Filter Tabs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0B1C30] tracking-tight font-sans">
              โปรแกรมและผลการแข่งขัน
            </h2>
            <p className="text-xs sm:text-sm text-[#5B6574] font-sans">
              คะแนนสด ควอเตอร์ต่อควอเตอร์ และตารางสนามแข่งขันทางการ
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto font-sans">
            {[
              { id: "ALL", label: "ทั้งหมด" },
              { id: "LIVE", label: "กำลังแข่งขัน" },
              { id: "COMPLETED", label: "จบการแข่งขัน" },
              { id: "SCHEDULED", label: "โปรแกรมถัดไป" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id as typeof filter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  filter === tab.id
                    ? "bg-[#0B1C30] text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}

            <Link
              href="/matches"
              className="px-3 py-1.5 rounded-lg border border-borderStrong text-[#0B1C30] hover:border-[#AF101A] hover:text-[#AF101A] text-xs font-medium transition-colors flex items-center gap-1 whitespace-nowrap ml-1"
            >
              <span>ดูทั้งหมด</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Loading State Skeleton */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="rounded-2xl border border-slate-200 bg-white p-5 animate-pulse space-y-4"
              >
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <div className="h-4 bg-slate-200 rounded w-1/2" />
                  <div className="h-4 bg-slate-200 rounded w-16" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-slate-200 rounded w-2/3" />
                    <div className="h-5 bg-slate-200 rounded w-8" />
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-slate-200 rounded w-2/3" />
                    <div className="h-5 bg-slate-200 rounded w-8" />
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-100 flex justify-between">
                  <div className="h-4 bg-slate-200 rounded w-1/3" />
                  <div className="h-4 bg-slate-200 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredMatches.length === 0 && (
          <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl mt-6 bg-slate-50/50">
            <Calendar className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-[#0B1C30]">ไม่พบรายการแข่งขันในหมวดนี้</p>
            <p className="text-xs text-[#5B6574] mt-1">
              {isError ? "ไม่สามารถโหลดข้อมูลจากเซิร์ฟเวอร์ได้" : "ไม่มีแมตช์ที่ตรงตามเงื่อนไขตัวกรองในขณะนี้"}
            </p>
            {isError && (
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-borderStrong text-xs font-semibold text-[#0B1C30] hover:bg-slate-100 transition cursor-pointer"
              >
                <span>ลองใหม่อีกครั้ง</span>
              </button>
            )}
          </div>
        )}

        {/* Matches Grid */}
        {!isLoading && filteredMatches.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {filteredMatches.slice(0, 6).map((match) => {
              const isLive = match.status === "LIVE";
              const isDone = match.status === "COMPLETED";
              const tourneyName =
                match.tournament?.name || match.tournamentName || "TOA Youth League";

              return (
                <div
                  key={match.id}
                  className="rounded-xl border border-borderNeutral bg-white hover:border-slate-400 transition-colors p-4 sm:p-5 flex flex-col justify-between space-y-4"
                >
                  {/* Match Card Top Metadata */}
                  <div className="flex items-center justify-between text-xs text-[#5B6574] font-sans pb-3 border-b border-slate-100">
                    <div className="truncate max-w-[200px] font-medium text-slate-700">
                      {tourneyName}
                    </div>
                    <div>
                      {isLive ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-50 text-[#AF101A] text-[11px] font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#AF101A]" />
                          <span>LIVE Q{match.currentQuarter || 1}</span>
                        </span>
                      ) : isDone ? (
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium">
                          จบการแข่งขัน
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[11px] font-medium">
                          รอเริ่มแข่ง
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Teams & Scores */}
                  <div className="space-y-2.5 font-sans">
                    {/* Home Team */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-[11px] text-slate-800 shrink-0">
                          {match.homeTeam.shortName || match.homeTeam.name?.substring(0, 3) || "HOM"}
                        </div>
                        <span className="font-semibold text-sm text-[#0B1C30] truncate max-w-[160px]">
                          {match.homeTeam.name}
                        </span>
                      </div>
                      <span className="font-headline-md text-2xl font-bold text-[#0B1C30] tabular-nums">
                        {match.homeScore}
                      </span>
                    </div>

                    {/* Away Team */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-[11px] text-slate-800 shrink-0">
                          {match.awayTeam.shortName || match.awayTeam.name?.substring(0, 3) || "AWY"}
                        </div>
                        <span className="font-semibold text-sm text-[#0B1C30] truncate max-w-[160px]">
                          {match.awayTeam.name}
                        </span>
                      </div>
                      <span className="font-headline-md text-2xl font-bold text-[#0B1C30] tabular-nums">
                        {match.awayScore}
                      </span>
                    </div>
                  </div>

                  {/* Card Footer Action */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-sans text-[#5B6574]">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate max-w-[140px]">{match.venue || "นิมิบุตร (สนาม 1)"}</span>
                    </div>

                    <Link
                      href={isLive ? `/live` : `/matches/${match.id}/film`}
                      className="inline-flex items-center gap-1 text-[#AF101A] font-semibold hover:underline"
                    >
                      <span>{isLive ? "ชมถ่ายทอดสด" : "ดูสถิติเกม"}</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

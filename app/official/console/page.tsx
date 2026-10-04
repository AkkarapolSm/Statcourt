"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Trophy,
  ArrowRight,
  Loader2,
  Calendar,
  Activity,
  CheckCircle2,
  SlidersHorizontal,
} from "lucide-react";

interface MatchSummary {
  id: string;
  tournamentId?: string;
  tournament?: { name: string };
  tournamentName?: string;
  homeTeamId: string;
  awayTeamId: string;
  homeTeam: { name: string; shortName?: string; primaryColor?: string };
  awayTeam: { name: string; shortName?: string; primaryColor?: string };
  homeScore?: number;
  awayScore?: number;
  currentQuarter?: number;
  status: string;
}

export default function OfficialConsoleIndexPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<MatchSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await fetch("/api/matches", { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            setMatches(json.data);
            // If live match found, we could auto-route, but let's show all matches so official can pick!
          }
        }
      } catch (err) {
        console.error("Failed to load matches for official console:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#070D19] text-slate-100 flex flex-col">
      {/* Top Banner */}
      <header className="border-b border-slate-800 bg-[#0B132B]/90 backdrop-blur px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              FIBA Official Table Console
              <span className="text-xs px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 font-mono border border-blue-700/40">
                Match Selector
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              เลือกแมตช์ที่ต้องการเปิดโต๊ะบันทึกสถิติสดและควบคุมคะแนน
            </p>
          </div>
        </div>

        <Link
          href="/"
          className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
        >
          กลับหน้าหลัก
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            รายการแข่งขันทั้งหมดในระบบ ({matches.length})
          </h2>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            <p className="text-sm">กำลังโหลดรายการแข่งขัน...</p>
          </div>
        ) : matches.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <p>ไม่พบรายการแข่งขันในระบบ</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {matches.map((m) => {
              const isLive = ["LIVE", "DRAFT"].includes(m.status);
              const isFinished = ["COMPLETED", "DISPUTED"].includes(m.status);
              const tournName = m.tournament?.name || m.tournamentName || "TOA Youth Basketball League Thailand 2026";

              return (
                <div
                  key={m.id}
                  onClick={() => router.push(`/official/console/${m.id}`)}
                  className="group p-4 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800/60 transition-all cursor-pointer flex flex-col justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mb-2">
                      <span className="truncate max-w-[260px]">{tournName}</span>
                      {isLive ? (
                        <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold flex items-center gap-1 animate-pulse">
                          <Activity className="w-3 h-3" /> LIVE Q{m.currentQuarter || 1}
                        </span>
                      ) : isFinished ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-semibold">
                          <CheckCircle2 className="w-3 h-3" /> FINAL
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1 font-semibold">
                          <Calendar className="w-3 h-3" /> SCHEDULED
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1">
                        <div className="text-sm font-bold text-white truncate">
                          {m.homeTeam?.name}
                        </div>
                        <div className="text-xs text-slate-400 font-mono">
                          {m.homeTeam?.shortName}
                        </div>
                      </div>

                      <div className="px-3 py-1 rounded bg-slate-950 border border-slate-800 text-center font-mono font-bold text-amber-400 text-base">
                        {m.status === "SCHEDULED" ? "VS" : `${m.homeScore ?? 0} : ${m.awayScore ?? 0}`}
                      </div>

                      <div className="flex-1 text-right">
                        <div className="text-sm font-bold text-white truncate">
                          {m.awayTeam?.name}
                        </div>
                        <div className="text-xs text-slate-400 font-mono">
                          {m.awayTeam?.shortName}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 group-hover:text-amber-400 transition-colors">
                    <span className="font-mono text-[11px]">รหัสแมตช์: {m.id}</span>
                    <span className="flex items-center gap-1 font-semibold">
                      เปิดคอนโซลโต๊ะ <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

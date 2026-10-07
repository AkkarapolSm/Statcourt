"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Trophy, Award, ArrowRight, ChevronRight, TrendingUp, Loader2 } from "lucide-react";
import { mockLeaderboardAthletes } from "@/lib/db/seed-data";
import { AthleteSeasonStats } from "@/lib/types";

interface StandingRow {
  rank: number;
  team: string;
  shortName?: string;
  played: number;
  won: number;
  lost: number;
  pts: number;
  diff: string | number;
}

export default function StandingsAndLeadersSection() {
  const [leaderCategory, setLeaderCategory] = useState<"PPG" | "RPG" | "APG" | "EFF">("PPG");
  const [athletes, setAthletes] = useState<AthleteSeasonStats[]>(mockLeaderboardAthletes);
  const [standings, setStandings] = useState<StandingRow[]>([
    { rank: 1, team: "Bangkok Christian College", shortName: "BCC", played: 4, won: 4, lost: 0, pts: 8, diff: "+54" },
    { rank: 2, team: "Assumption College", shortName: "AC", played: 4, won: 3, lost: 1, pts: 7, diff: "+28" },
    { rank: 3, team: "Debsirin School", shortName: "DS", played: 4, won: 2, lost: 2, pts: 6, diff: "+4" },
    { rank: 4, team: "Suankularb Wittayalai School", shortName: "SK", played: 4, won: 1, lost: 3, pts: 5, diff: "-32" },
    { rank: 5, team: "Satriwitthaya 2 School", shortName: "SW2", played: 4, won: 0, lost: 4, pts: 4, diff: "-54" },
  ]);
  const [tournamentTitle, setTournamentTitle] = useState("TOA YOUTH BASKETBALL LEAGUE 2026");
  const [isLeadersLoading, setIsLeadersLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // Fetch dynamic leaders from DB API
    async function loadLeaders() {
      try {
        setIsLeadersLoading(true);
        const res = await fetch("/api/leaderboard?limit=10");
        if (res.ok) {
          const json = await res.json();
          if (isMounted && json.success && Array.isArray(json.data) && json.data.length > 0) {
            setAthletes(json.data);
          }
        }
      } catch (err) {
        console.warn("Using fallback leaders data:", err);
      } finally {
        if (isMounted) setIsLeadersLoading(false);
      }
    }

    // Fetch dynamic tournament standings if available
    async function loadStandings() {
      try {
        const tourneysRes = await fetch("/api/tournaments");
        if (tourneysRes.ok) {
          const tourneyJson = await tourneysRes.json();
          const firstTourney = tourneyJson.data?.[0];
          if (firstTourney?.id) {
            if (firstTourney.name) setTournamentTitle(firstTourney.name);
            const standingsRes = await fetch(`/api/tournaments/${firstTourney.id}/standings`);
            if (standingsRes.ok) {
              const standingsJson = await standingsRes.json();
              if (isMounted && standingsJson.success && Array.isArray(standingsJson.data) && standingsJson.data.length > 0) {
                const formatted: StandingRow[] = standingsJson.data.slice(0, 5).map((s: any, idx: number) => ({
                  rank: s.rank || idx + 1,
                  team: s.teamName || s.team?.name || "Team",
                  shortName: s.teamShortName || s.team?.shortName || undefined,
                  played: s.played || 0,
                  won: s.won || 0,
                  lost: s.lost || 0,
                  pts: s.points ?? 0,
                  diff: s.pointDiff > 0 ? `+${s.pointDiff}` : `${s.pointDiff || 0}`,
                }));
                setStandings(formatted);
              }
            }
          }
        }
      } catch (err) {
        console.warn("Using default tournament standings:", err);
      }
    }

    loadLeaders();
    loadStandings();

    return () => {
      isMounted = false;
    };
  }, []);

  // Leaders sorted dynamically
  const sortedLeaders = [...athletes]
    .sort((a, b) => {
      if (leaderCategory === "PPG") return b.ppg - a.ppg;
      if (leaderCategory === "RPG") return b.rpg - a.rpg;
      if (leaderCategory === "APG") return b.apg - a.apg;
      return b.effPerGame - a.effPerGame;
    })
    .slice(0, 5);

  return (
    <section className="py-12 bg-[#F8FAFC] border-b border-slate-200">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ========================================================= */}
          {/* LEFT: TOURNAMENT LEAGUE STANDINGS TABLE (7 COLS)          */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="space-y-0.5">
                <span className="text-xs text-slate-500 font-sans block">{tournamentTitle}</span>
                <h3 className="text-xl font-bold text-[#0B1C30] font-sans">
                  ตารางคะแนนรอบแบ่งกลุ่ม
                </h3>
              </div>

              <Link
                href="/tournaments"
                className="text-xs font-sans font-medium text-slate-500 hover:text-[#AF101A] flex items-center gap-1 transition-colors"
              >
                <span>ดูทุกกลุ่ม</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Standings Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-slate-50 text-slate-600 font-sans text-xs border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 text-center w-10">อันดับ</th>
                    <th className="py-2.5 px-3">ทีม</th>
                    <th className="py-2.5 px-3 text-center">แข่ง</th>
                    <th className="py-2.5 px-3 text-center">ชนะ</th>
                    <th className="py-2.5 px-3 text-center">แพ้</th>
                    <th className="py-2.5 px-3 text-right">ผลต่าง</th>
                    <th className="py-2.5 px-3 text-right font-bold text-[#0B1C30]">แต้ม</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 tabular-nums">
                  {standings.map((row) => (
                    <tr key={row.rank} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3 text-center font-bold text-slate-700">
                        {row.rank <= 2 ? (
                          <span className="w-5 h-5 rounded-full bg-red-50 text-[#AF101A] inline-flex items-center justify-center font-bold text-[11px]">
                            {row.rank}
                          </span>
                        ) : (
                          row.rank
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <Link href="/teams" className="font-semibold text-[#0B1C30] hover:text-[#AF101A] transition-colors font-sans">
                          {row.team}
                        </Link>
                      </td>
                      <td className="py-3 px-3 text-center text-slate-600">{row.played}</td>
                      <td className="py-3 px-3 text-center text-emerald-700 font-semibold">{row.won}</td>
                      <td className="py-3 px-3 text-center text-slate-500">{row.lost}</td>
                      <td className="py-3 px-3 text-right text-slate-600">{row.diff}</td>
                      <td className="py-3 px-3 text-right font-bold text-sm text-[#0B1C30]">
                        {row.pts}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-2 text-[11px] text-[#5B6574] font-sans flex items-center justify-between">
              <span>* ชนะ 2 แต้ม, แพ้ 1 แต้ม, สละสิทธิ์ 0 แต้ม</span>
              <span className="text-[#AF101A] font-medium">อันดับ 1-2 ผ่านเข้ารอบรองชนะเลิศ</span>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT: STAT LEADERS SHOWCASE (5 COLS)                     */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="space-y-0.5">
                <span className="text-xs text-slate-500 font-sans block">Season 2026</span>
                <h3 className="text-xl font-bold text-[#0B1C30] font-sans">
                  ผู้นำสถิติยอดเยี่ยม
                </h3>
              </div>

              <Link
                href="/leaderboard"
                className="text-xs font-sans font-medium text-slate-500 hover:text-[#AF101A] flex items-center gap-1 transition-colors"
              >
                <span>ดูทั้งหมด</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Category Selector Buttons */}
            <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-xl font-sans text-xs font-medium text-slate-600">
              {[
                { id: "PPG", label: "คะแนน" },
                { id: "RPG", label: "รีบาวด์" },
                { id: "APG", label: "แอสซิสต์" },
                { id: "EFF", label: "EFF" },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setLeaderCategory(c.id as typeof leaderCategory)}
                  className={`py-1.5 rounded-lg transition-colors cursor-pointer text-center ${
                    leaderCategory === c.id
                      ? "bg-white text-[#AF101A] font-semibold shadow-xs"
                      : "hover:text-[#0B1C30]"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Leaders Ranking List */}
            <div className="space-y-2.5">
              {isLeadersLoading && (
                <div className="space-y-2 py-4">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="h-12 bg-slate-100 animate-pulse rounded-xl" />
                  ))}
                </div>
              )}

              {!isLeadersLoading && sortedLeaders.map((athlete, index) => {
                const statValue =
                  leaderCategory === "PPG"
                    ? athlete.ppg.toFixed(1)
                    : leaderCategory === "RPG"
                    ? athlete.rpg.toFixed(1)
                    : leaderCategory === "APG"
                    ? athlete.apg.toFixed(1)
                    : athlete.effPerGame.toFixed(1);

                return (
                  <Link
                    key={athlete.athleteId}
                    href={`/athlete/${athlete.athleteId}`}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50/70 transition-colors group font-sans"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                          index === 0
                            ? "bg-[#AF101A] text-white"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {index + 1}
                      </span>
                      <div>
                        <div className="font-semibold text-sm text-[#0B1C30] group-hover:text-[#AF101A] transition-colors">
                          {athlete.firstName} {athlete.lastName}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          #{athlete.jerseyNumber || 0} · {athlete.schoolOrClub} ({athlete.position})
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-base font-bold text-[#AF101A] tabular-nums leading-none">
                        {statValue}
                      </div>
                      <div className="text-[10px] text-[#5B6574] mt-0.5">
                        {leaderCategory}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

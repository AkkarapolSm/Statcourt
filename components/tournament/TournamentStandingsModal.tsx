"use client";

import React, { useState, useEffect } from "react";
import { X, Trophy, Shield, Info, ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface StandingRow {
  rank: number;
  teamId: string;
  teamName: string;
  teamShortName?: string;
  teamLogo?: string | null;
  institution?: string;
  groupName: string;
  played: number;
  won: number;
  lost: number;
  pointsFor: number;
  pointsAgainst: number;
  pointDiff: number;
  points: number;
  streak: string;
}

interface TournamentStandingsModalProps {
  tournament: {
    id: string;
    name: string;
    category?: string;
  };
  onClose: () => void;
}

export default function TournamentStandingsModal({
  tournament,
  onClose,
}: TournamentStandingsModalProps) {
  const [standings, setStandings] = useState<StandingRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/tournaments/${encodeURIComponent(tournament.id)}/standings`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setStandings(data.data);
        }
      })
      .catch((err) => console.error("Failed to load standings:", err))
      .finally(() => setLoading(false));
  }, [tournament.id]);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col">
        {/* Header */}
        <div className="bg-[#0B1C30] text-white p-6 relative flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white transition p-1 rounded-full hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-amber-500/20 text-amber-300 text-xs px-2.5 py-0.5 rounded font-mono font-bold border border-amber-500/30 flex items-center gap-1">
              <Trophy className="w-3 h-3 text-amber-400" />
              FIBA OFFICIAL STANDINGS
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold font-headline-md tracking-wide">
            ตารางคะแนนและอันดับการแข่งขัน
          </h2>
          <p className="text-xs text-slate-300 mt-1 line-clamp-1">{tournament.name}</p>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* FIBA Tie-break Protocol Callout */}
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold">กติกาการจัดอันดับมาตรฐาน FIBA:</span> ชนะได้ 2 คะแนน, แพ้ได้ 1 คะแนน (ไม่มาแข่งขันได้ 0 คะแนน) กรณีคะแนนเท่ากัน ตัดสินด้วย <span className="font-bold">Head-to-Head</span> และผลต่างคะแนนได้เสีย (Point Diff)
            </div>
          </div>

          {loading ? (
            <div className="space-y-2 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 bg-slate-100 rounded-lg" />
              ))}
            </div>
          ) : standings.length === 0 ? (
            <div className="p-8 text-center text-slate-500 border border-slate-200 rounded-xl bg-slate-50">
              ยังไม่มีข้อมูลผลการแข่งขันที่เสร็จสิ้นสำหรับคำนวณตารางคะแนน
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-mono font-bold uppercase border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-3 text-center w-12">#</th>
                      <th className="py-3 px-4">ทีม / สถาบัน</th>
                      <th className="py-3 px-2 text-center">แข่ง</th>
                      <th className="py-3 px-2 text-center text-emerald-700">ชนะ</th>
                      <th className="py-3 px-2 text-center text-red-700">แพ้</th>
                      <th className="py-3 px-2 text-center">ได้</th>
                      <th className="py-3 px-2 text-center">เสีย</th>
                      <th className="py-3 px-2 text-center">+/-</th>
                      <th className="py-3 px-3 text-center bg-slate-200/70 font-extrabold text-slate-900">แต้ม</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {standings.map((row, idx) => (
                      <tr
                        key={row.teamId}
                        className={`hover:bg-slate-50 transition-colors ${
                          idx < 2 ? "bg-emerald-50/20" : ""
                        }`}
                      >
                        <td className="py-3 px-3 text-center font-mono font-bold text-slate-900">
                          {row.rank}
                        </td>
                        <td className="py-3 px-4">
                          <Link
                            href={`/teams/${row.teamId}`}
                            className="font-bold text-slate-900 hover:text-primary transition flex items-center gap-1.5"
                          >
                            <span>{row.teamName}</span>
                            <ArrowUpRight className="w-3 h-3 text-slate-400" />
                          </Link>
                          {row.institution && (
                            <span className="text-[11px] text-slate-400 block line-clamp-1">
                              {row.institution}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-2 text-center font-mono">{row.played}</td>
                        <td className="py-3 px-2 text-center font-mono font-bold text-emerald-700">
                          {row.won}
                        </td>
                        <td className="py-3 px-2 text-center font-mono text-red-700">{row.lost}</td>
                        <td className="py-3 px-2 text-center font-mono text-slate-600">{row.pointsFor}</td>
                        <td className="py-3 px-2 text-center font-mono text-slate-600">{row.pointsAgainst}</td>
                        <td className={`py-3 px-2 text-center font-mono font-bold ${
                          row.pointDiff > 0 ? "text-emerald-700" : row.pointDiff < 0 ? "text-red-700" : "text-slate-600"
                        }`}>
                          {row.pointDiff > 0 ? `+${row.pointDiff}` : row.pointDiff}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-extrabold text-slate-950 bg-slate-50">
                          {row.points}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-mono">
          <span>Official Thailand Basketball Federation Index</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold transition cursor-pointer"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
}

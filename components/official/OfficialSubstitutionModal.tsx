"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  ArrowRightLeft,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  Users,
  AlertTriangle,
} from "lucide-react";
import { RosterPlayer, Team } from "@/lib/types";

interface OfficialSubstitutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: Team;
  isHome: boolean;
  preselectedOutId?: string | null;
  onConfirmSub: (teamId: string, outAthleteId: string, inAthleteId: string) => void;
}

export default function OfficialSubstitutionModal({
  isOpen,
  onClose,
  team,
  isHome,
  preselectedOutId,
  onConfirmSub,
}: OfficialSubstitutionModalProps) {
  const onCourtPlayers = React.useMemo(() => team.roster.filter((p) => p.isOnCourt), [team.roster]);
  const benchPlayers = React.useMemo(() => team.roster.filter((p) => !p.isOnCourt), [team.roster]);

  const [selectedOutId, setSelectedOutId] = useState<string | null>(null);
  const [selectedInId, setSelectedInId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (preselectedOutId && onCourtPlayers.some((p) => p.athleteId === preselectedOutId)) {
        setSelectedOutId(preselectedOutId);
      } else if (onCourtPlayers.length > 0) {
        setSelectedOutId(onCourtPlayers[0].athleteId);
      }
      setSelectedInId(null);
    }
  }, [isOpen, onCourtPlayers, preselectedOutId]);

  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const playerOut = onCourtPlayers.find((p) => p.athleteId === selectedOutId);
  const playerIn = benchPlayers.find((p) => p.athleteId === selectedInId);

  const handleConfirm = () => {
    if (!selectedOutId || !selectedInId) return;
    onConfirmSub(team.id, selectedOutId, selectedInId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0B1C30]/80 backdrop-blur-md animate-fadeIn font-sans">
      <div className="bg-[#0B1C30] border border-slate-700/80 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: team.primaryColor || (isHome ? "#3B82F6" : "#AF101A") }}
            />
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
                เปลี่ยนตัวผู้เล่น (Substitution)
                <span
                  className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${
                    isHome
                      ? "bg-blue-900/60 text-blue-300 border-blue-700/40"
                      : "bg-rose-900/60 text-rose-300 border-rose-700/40"
                  }`}
                >
                  {isHome ? "ทีมเหย้า (HOME)" : "ทีมเยือน (AWAY)"}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {team.name} ({team.shortName}) — ตามระเบียบ FIBA Official Basketball Rules
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="ปิดหน้าต่าง (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Swap Preview Bar */}
        <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm">
          {/* Out summary */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-rose-300 uppercase tracking-wider bg-rose-500/20 px-2 py-0.5 rounded-full border border-rose-500/30">
              OUT (ออก)
            </span>
            {playerOut ? (
              <span className="font-bold text-white tabular-nums">
                #{playerOut.jerseyNumber} {playerOut.firstName} {playerOut.lastName}
              </span>
            ) : (
              <span className="text-slate-500 italic">เลือกผู้เล่นในสนาม</span>
            )}
          </div>

          <ArrowRight className="w-4 h-4 text-amber-400 flex-shrink-0" />

          {/* In summary */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
              IN (เข้า)
            </span>
            {playerIn ? (
              <span className="font-bold text-white tabular-nums">
                #{playerIn.jerseyNumber} {playerIn.firstName} {playerIn.lastName}
              </span>
            ) : (
              <span className="text-slate-500 italic">เลือกผู้เล่นสำรอง</span>
            )}
          </div>
        </div>

        {/* Selection Columns */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Column 1: On-Court (5 Players - Select OUT) */}
          <div className="flex flex-col bg-slate-900/50 border border-slate-800 rounded-xl p-3">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" /> 5 ตัวจริงในสนาม (Select OUT)
              </span>
              <span className="text-[11px] text-slate-500 tabular-nums">
                {onCourtPlayers.length} ผู้เล่น
              </span>
            </div>

            <div className="space-y-1.5">
              {onCourtPlayers.map((player) => {
                const isSelected = selectedOutId === player.athleteId;
                return (
                  <button
                    key={player.athleteId}
                    type="button"
                    onClick={() => setSelectedOutId(player.athleteId)}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? "bg-rose-950/40 border-[#AF101A] text-white shadow-sm ring-1 ring-[#AF101A]/60"
                        : "bg-slate-900/90 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-7 h-7 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center tabular-nums font-bold text-xs text-amber-400">
                        #{player.jerseyNumber}
                      </span>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold truncate text-white">
                          {player.firstName} {player.lastName}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {player.position} • <span className="tabular-nums">{player.heightCm}</span> cm
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0 text-right">
                      <div className="text-[11px] tabular-nums font-semibold text-slate-300">
                        {player.points} PTS
                      </div>
                      <span
                        className={`text-[10px] tabular-nums font-bold px-1.5 py-0.5 rounded border ${
                          player.fouls >= 4
                            ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                            : "bg-slate-800 text-slate-400 border-slate-700"
                        }`}
                      >
                        {player.fouls}F
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Column 2: Bench (7 Substitutes - Select IN) */}
          <div className="flex flex-col bg-slate-900/50 border border-slate-800 rounded-xl p-3">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" /> 7 ตัวสำรอง (Select IN)
              </span>
              <span className="text-[11px] text-slate-500 tabular-nums">
                {benchPlayers.length} ผู้เล่น
              </span>
            </div>

            <div className="space-y-1.5">
              {benchPlayers.map((player) => {
                const isSelected = selectedInId === player.athleteId;
                const isFouledOut = player.fouls >= 5;

                return (
                  <button
                    key={player.athleteId}
                    type="button"
                    disabled={isFouledOut}
                    onClick={() => setSelectedInId(player.athleteId)}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between ${
                      isFouledOut
                        ? "bg-slate-950/40 border-slate-900 text-slate-600 opacity-60 cursor-not-allowed"
                        : isSelected
                        ? "bg-emerald-950/40 border-emerald-500 text-white shadow-sm ring-1 ring-emerald-500/50 cursor-pointer"
                        : "bg-slate-900/90 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700 cursor-pointer"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-7 h-7 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center tabular-nums font-bold text-xs text-slate-300">
                        #{player.jerseyNumber}
                      </span>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold truncate text-white">
                          {player.firstName} {player.lastName}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {player.position} • <span className="tabular-nums">{player.heightCm}</span> cm
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0 text-right">
                      {isFouledOut ? (
                        <span className="text-[10px] font-bold text-rose-400 bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-800">
                          FOUL OUT
                        </span>
                      ) : (
                        <>
                          <div className="text-[11px] tabular-nums font-semibold text-slate-300">
                            {player.points} PTS
                          </div>
                          <span
                            className={`text-[10px] tabular-nums font-bold px-1.5 py-0.5 rounded border ${
                              player.fouls >= 4
                                ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                                : "bg-slate-800 text-slate-400 border-slate-700"
                            }`}
                          >
                            {player.fouls}F
                          </span>
                        </>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-[#0F172A]/90 flex items-center justify-between">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <ArrowRightLeft className="w-4 h-4 text-amber-400" />
            <span>เลือกผู้เล่นออกและผู้เล่นเข้าเพื่อทำการเปลี่ยนตัว</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              disabled={!selectedOutId || !selectedInId}
              onClick={handleConfirm}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedOutId && selectedInId
                  ? "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md cursor-pointer active:scale-95"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>ยืนยันการเปลี่ยนตัว</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

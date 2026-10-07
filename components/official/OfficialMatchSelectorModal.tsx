"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Search,
  Trophy,
  Activity,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ShieldAlert,
  Loader2,
  SlidersHorizontal,
} from "lucide-react";

interface MatchItem {
  id: string;
  tournamentId?: string;
  tournament?: { name: string };
  tournamentName?: string;
  homeTeamId: string;
  awayTeamId: string;
  homeTeam: {
    name: string;
    shortName?: string;
    primaryColor?: string;
    logoUrl?: string;
  };
  awayTeam: {
    name: string;
    shortName?: string;
    primaryColor?: string;
    logoUrl?: string;
  };
  homeScore?: number;
  awayScore?: number;
  currentQuarter?: number;
  status: "DRAFT" | "LIVE" | "COMPLETED" | "SCHEDULED" | "DISPUTED" | string;
  createdAt?: string;
}

interface OfficialMatchSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMatchId: string;
}

type FilterTab = "ALL" | "LIVE" | "SCHEDULED" | "COMPLETED";

export default function OfficialMatchSelectorModal({
  isOpen,
  onClose,
  currentMatchId,
}: OfficialMatchSelectorModalProps) {
  const router = useRouter();
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterTab>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    const fetchMatches = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/matches", { cache: "no-store" });
        if (!res.ok) throw new Error("ไม่สามารถดึงข้อมูลรายการแมตช์ได้");
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setMatches(json.data);
        } else {
          setMatches([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการโหลดแมตช์");
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const filteredMatches = useMemo(() => {
    return matches.filter((m) => {
      // Filter by status tab
      if (filter === "LIVE") {
        if (!["LIVE", "DRAFT"].includes(m.status)) return false;
      } else if (filter === "SCHEDULED") {
        if (m.status !== "SCHEDULED") return false;
      } else if (filter === "COMPLETED") {
        if (!["COMPLETED", "DISPUTED"].includes(m.status)) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const homeName = (m.homeTeam?.name || "").toLowerCase();
        const homeShort = (m.homeTeam?.shortName || "").toLowerCase();
        const awayName = (m.awayTeam?.name || "").toLowerCase();
        const awayShort = (m.awayTeam?.shortName || "").toLowerCase();
        const tourn = (m.tournament?.name || m.tournamentName || "").toLowerCase();
        const matchId = m.id.toLowerCase();

        return (
          homeName.includes(q) ||
          homeShort.includes(q) ||
          awayName.includes(q) ||
          awayShort.includes(q) ||
          tourn.includes(q) ||
          matchId.includes(q)
        );
      }

      return true;
    });
  }, [matches, filter, searchQuery]);

  const handleSelectMatch = (matchId: string) => {
    if (matchId === currentMatchId) {
      onClose();
      return;
    }
    onClose();
    router.push(`/official/console/${matchId}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0B1C30]/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#0B1C30] border border-[#213145] rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-[#213145] flex items-center justify-between bg-[#071322]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#AF101A]/15 text-[#AF101A] border border-[#AF101A]/30">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-headline text-white flex items-center gap-2">
                เลือกแมตช์ควบคุมการแข่งขัน
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#142C47] text-slate-300 font-sans border border-[#213145]">
                  FIBA Match Hub
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-sans">
                สลับโต๊ะควบคุมคะแนนไปยังแมตช์อื่นในทัวร์นาเมนต์ได้ทันที
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-[#142C47] rounded-xl transition-colors cursor-pointer"
            title="ปิดหน้าต่าง (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters & Search Bar */}
        <div className="p-4 border-b border-[#213145] bg-[#081729] flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 bg-[#071322] p-1 rounded-xl border border-[#213145] text-xs font-medium">
            {(
              [
                { key: "ALL", label: "ทั้งหมด" },
                { key: "LIVE", label: "กำลังแข่ง (LIVE)" },
                { key: "SCHEDULED", label: "กำหนดการ" },
                { key: "COMPLETED", label: "จบแล้ว" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  filter === tab.key
                    ? "bg-[#AF101A] text-white font-bold shadow-xs"
                    : "text-slate-400 hover:text-slate-200 hover:bg-[#142C47]/50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหาทีม, ทัวร์นาเมนต์ หรือรหัสแมตช์..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#071322] border border-[#213145] pl-9 pr-3 py-1.5 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#AF101A]"
            />
          </div>
        </div>

        {/* Match List Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 min-h-[280px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3 font-sans">
              <Loader2 className="w-8 h-8 animate-spin text-[#AF101A]" />
              <span className="text-sm">กำลังค้นหาแมตช์การแข่งขัน...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-rose-400 gap-2 font-sans">
              <ShieldAlert className="w-8 h-8 text-rose-500" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          ) : filteredMatches.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2 font-sans">
              <Calendar className="w-8 h-8 opacity-40" />
              <span className="text-sm">ไม่พบแมตช์ที่ตรงกับเงื่อนไขการค้นหา</span>
            </div>
          ) : (
            filteredMatches.map((m) => {
              const isCurrent = m.id === currentMatchId;
              const isLive = ["LIVE", "DRAFT"].includes(m.status);
              const isFinished = ["COMPLETED", "DISPUTED"].includes(m.status);
              const isScheduled = m.status === "SCHEDULED";

              const tournName = m.tournament?.name || m.tournamentName || "TOA Youth Basketball League Thailand 2026";

              return (
                <div
                  key={m.id}
                  onClick={() => handleSelectMatch(m.id)}
                  className={`group relative p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isCurrent
                      ? "bg-[#AF101A]/10 border-[#AF101A]/60 ring-1 ring-[#AF101A]/40"
                      : "bg-[#0d223a]/50 border-[#213145] hover:bg-[#142C47]/50 hover:border-slate-600"
                  }`}
                >
                  {/* Left: Tournament & Status */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 font-sans">
                      <span className="text-[11px] text-slate-400 truncate max-w-[280px]">
                        {tournName}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">#{m.id}</span>
                    </div>

                    {/* Team Matchup */}
                    <div className="flex items-center gap-4">
                      {/* Home Team */}
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: m.homeTeam?.primaryColor || "#3B82F6" }}
                        />
                        <span className="text-sm font-semibold text-white truncate font-sans">
                          {m.homeTeam?.name || "Home Team"}
                        </span>
                        {m.homeTeam?.shortName && (
                          <span className="text-xs text-slate-400 font-mono">
                            ({m.homeTeam.shortName})
                          </span>
                        )}
                      </div>

                      {/* Score / VS badge */}
                      <div className="flex-shrink-0 px-2 py-0.5 rounded-lg bg-[#071322] border border-[#213145] text-center min-w-[70px]">
                        {isScheduled ? (
                          <span className="text-xs font-mono text-slate-400 font-semibold">VS</span>
                        ) : (
                          <span className="text-sm font-bold font-mono tabular-nums text-white tracking-wider">
                            {m.homeScore ?? 0} : {m.awayScore ?? 0}
                          </span>
                        )}
                      </div>

                      {/* Away Team */}
                      <div className="flex items-center gap-2 min-w-0 flex-1 justify-end sm:justify-start">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0 sm:order-first order-last"
                          style={{ backgroundColor: m.awayTeam?.primaryColor || "#EF4444" }}
                        />
                        <span className="text-sm font-semibold text-white truncate font-sans">
                          {m.awayTeam?.name || "Away Team"}
                        </span>
                        {m.awayTeam?.shortName && (
                          <span className="text-xs text-slate-400 font-mono">
                            ({m.awayTeam.shortName})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Badge & Action */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#213145]/60">
                    {/* Status Badge */}
                    <div>
                      {isLive && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 text-xs font-bold animate-pulse font-mono">
                          <Activity className="w-3 h-3" /> LIVE Q{m.currentQuarter || 1}
                        </span>
                      )}
                      {isScheduled && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30 text-xs font-medium font-mono">
                          <Calendar className="w-3 h-3" /> SCHEDULED
                        </span>
                      )}
                      {isFinished && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-medium font-mono">
                          <CheckCircle2 className="w-3 h-3" /> FINAL
                        </span>
                      )}
                    </div>

                    {/* Current Indicator or Switch Button */}
                    {isCurrent ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/30 font-sans">
                        <CheckCircle2 className="w-3.5 h-3.5" /> แมตช์ปัจจุบัน
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectMatch(m.id);
                        }}
                        className="inline-flex items-center gap-1 text-xs font-medium text-slate-300 group-hover:text-white bg-[#142C47] group-hover:bg-[#AF101A] px-3 py-1.5 rounded-xl transition-colors cursor-pointer font-sans"
                      >
                        ควบคุมแมตช์นี้ <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-3 border-t border-[#213145] bg-[#071322] flex items-center justify-between text-xs text-slate-300 font-sans">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#AF101A]" />
            <span>พบทั้งหมด <strong className="text-white tabular-nums">{filteredMatches.length}</strong> แมตช์</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#142C47] hover:bg-[#1E3E64] text-white transition-colors cursor-pointer font-medium"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Play,
  Pause,
  RotateCcw,
  Undo2,
  Wifi,
  WifiOff,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  KeyRound,
  Clock,
  Flame,
  AlertTriangle,
  ChevronRight,
  ArrowLeft,
  RefreshCw,
  LogOut,
  History,
  Download,
  Radio,
  Sliders,
  UploadCloud,
  BadgeCheck,
  Info,
  Check,
  ArrowRightLeft,
  Users,
  Zap,
} from "lucide-react";
import OfficialAuditLogModal from "@/components/official/OfficialAuditLogModal";
import OfficialMatchSelectorModal from "@/components/official/OfficialMatchSelectorModal";
import OfficialSubstitutionModal from "@/components/official/OfficialSubstitutionModal";
import MatchResultControls from "@/components/official/MatchResultControls";
import { useScorekeeperStore } from "@/lib/store/useScorekeeperStore";
import { useAuthStore } from "@/lib/auth/useAuthStore";
import { EventType } from "@/lib/types";

const formatClock = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
};

export default function ScorekeeperConsolePage({
  params,
}: {
  params: { matchId: string };
}) {
  const { currentUser, refreshSession, logout } = useAuthStore();

  const {
    match,
    loadMatch,
    isClockRunning,
    selectedPlayer,
    reversalRail,
    isOnline,
    pendingSyncCount,
    isQueueWarning,
    exportOfflineLedger,
    toggleClock,
    resetClock,
    setQuarter,
    selectPlayer,
    recordAction,
    reverseAction,
    setOnlineStatus,
    syncPendingOfflineEvents,
    substitutePlayer,
  } = useScorekeeperStore();

  const [notification, setNotification] = useState<string | null>(null);

  const [authError, setAuthError] = useState<string | null>(null);
  const [shotClock, setShotClock] = useState(14);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isMatchSelectorOpen, setIsMatchSelectorOpen] = useState(false);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [subModalTeam, setSubModalTeam] = useState<"HOME" | "AWAY">("HOME");
  const [preselectedOutPlayerId, setPreselectedOutPlayerId] = useState<string | null>(null);
  const [matchAccess, setMatchAccess] = useState(false);
  const [accessChecked, setAccessChecked] = useState(false);
  const [resultStatus, setResultStatus] = useState("LOADING");
  const handleResultStatusChange = useCallback((status: string) => {
    setResultStatus(status);
    if (status !== "DRAFT") useScorekeeperStore.setState({ isClockRunning: false });
  }, []);

  const isAuthorizedOfficial =
    matchAccess &&
    (currentUser.role === "OFFICIAL" || currentUser.role === "ADMIN") &&
    (currentUser.approvalStatus === "APPROVED" || currentUser.role === "ADMIN");

  // Check active server-side session on mount
  useEffect(() => {
    const checkActiveSession = async () => {
      try {
        const res = await fetch(`/api/official/verify?matchId=${encodeURIComponent(params.matchId)}`, { cache: "no-store" });
        if (res.ok) {
          const loaded = await loadMatch(params.matchId);
          setMatchAccess(loaded);
          if (!loaded) setAuthError("โหลดข้อมูลแมตช์จากฐานข้อมูลไม่สำเร็จ");
          await refreshSession();
        } else setMatchAccess(false);
      } catch (err) {
        console.warn("Could not verify active table session:", err);
        setMatchAccess(false);
      } finally {
        setAccessChecked(true);
      }
    };
    checkActiveSession();
  }, [params.matchId, refreshSession, loadMatch]);

  // Online / offline listeners
  useEffect(() => {
    const handleOnline = () => setOnlineStatus(true);
    const handleOffline = () => setOnlineStatus(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [setOnlineStatus]);

  // Game clock countdown interval with real-time SSE broadcast
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isAuthorizedOfficial && resultStatus === "DRAFT" && isClockRunning) {
      interval = setInterval(() => {
        const state = useScorekeeperStore.getState();
        if (state.match.gameClockSec > 0) {
          const nextSec = state.match.gameClockSec - 1;
          useScorekeeperStore.setState((s) => ({
            match: {
              ...s.match,
              gameClockSec: nextSec,
            },
          }));

          // Broadcast every 2 seconds or when <= 10 seconds
          if (nextSec % 2 === 0 || nextSec <= 10) {
            fetch(`/api/matches/${params.matchId}/live`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action: "CLOCK_SYNC",
                gameClockSec: nextSec,
                isClockRunning: true,
              }),
            }).catch(() => {});
          }
        } else {
          useScorekeeperStore.setState({ isClockRunning: false });
          fetch(`/api/matches/${params.matchId}/live`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "CLOCK_SYNC",
              gameClockSec: 0,
              isClockRunning: false,
            }),
          }).catch(() => {});
        }
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAuthorizedOfficial, isClockRunning, params.matchId, resultStatus]);

  const handleToggleClock = useCallback(() => {
    if (resultStatus !== "DRAFT") return;
    toggleClock();
    const nextRunning = !isClockRunning;
    fetch(`/api/matches/${params.matchId}/live`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "CLOCK_SYNC",
        gameClockSec: match.gameClockSec,
        isClockRunning: nextRunning,
      }),
    }).catch(() => {});
  }, [isClockRunning, match.gameClockSec, params.matchId, resultStatus, toggleClock]);

  const handleSetShotClock = (sec: number) => {
    if (resultStatus !== "DRAFT") return;
    setShotClock(sec);
    fetch(`/api/matches/${params.matchId}/live`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "SHOT_CLOCK",
        shotClockSec: sec,
      }),
    }).catch(() => {});
  };

  const logAuditEvent = useCallback(async (actionType: string, details: any) => {
    try {
      await fetch(`/api/matches/${params.matchId}/audit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionType,
          quarter: match.currentQuarter,
          gameClockDisplay: formatClock(match.gameClockSec),
          details,
        }),
      });
    } catch (e) {
      console.warn("Audit log dispatch warning:", e);
    }
  }, [match.currentQuarter, match.gameClockSec, params.matchId]);

  const handleActionClick = async (action: EventType, label: string) => {
    if (resultStatus !== "DRAFT") { setNotification("ผลแข่งขันถูกล็อกแล้ว"); return; }
    if (!selectedPlayer) {
      setNotification("Please select an on-court player first");
      setTimeout(() => setNotification(null), 3000);
      return;
    }
    const saved = await recordAction(action);
    if (!saved) { setNotification("บันทึกรายการไม่สำเร็จ กรุณาตรวจสิทธิ์และสถานะแมตช์"); return; }
    setNotification(
      `Recorded: #${selectedPlayer.jerseyNumber} ${selectedPlayer.name} — ${label}`
    );

    // Record digital audit trail event
    logAuditEvent(action, {
      player: selectedPlayer.name,
      jersey: selectedPlayer.jerseyNumber,
      teamId: selectedPlayer.teamId,
      actionLabel: label,
      quarter: match.currentQuarter,
    });

    setTimeout(() => setNotification(null), 2500);
  };

  const handleReverseClick = useCallback(async (eventId: string) => {
    if (resultStatus !== "DRAFT") { setNotification("ผลแข่งขันถูกล็อกแล้ว"); return; }
    const success = await reverseAction(eventId);
    if (success) {
      setNotification("Action reversed successfully within 60s window.");
      logAuditEvent("ACTION_REVERSED", {
        reversedEventId: eventId,
        timestamp: new Date().toISOString(),
        reason: "Scorekeeper executed action reversal within 60s window",
      });
    } else {
      setNotification("Action reversal window expired (exceeded 60 seconds).");
    }
    setTimeout(() => setNotification(null), 3000);
  }, [logAuditEvent, resultStatus, reverseAction]);

  const handleLogoutOfficial = async () => {
    await fetch("/api/official/logout", { method: "POST" });
    setMatchAccess(false);
    logout();
  };

  const openSubstitutionModal = useCallback((teamSide: "HOME" | "AWAY", outId?: string) => {
    setSubModalTeam(teamSide);
    setPreselectedOutPlayerId(outId || null);
    setIsSubModalOpen(true);
  }, []);

  const handleConfirmSubstitution = useCallback((teamId: string, outId: string, inId: string) => {
    substitutePlayer(teamId, outId, inId);

    const team = teamId === match.homeTeamId ? match.homeTeam : match.awayTeam;
    const outPlayer = team.roster.find((p) => p.athleteId === outId);
    const inPlayer = team.roster.find((p) => p.athleteId === inId);

    const msg = `เปลี่ยนตัวสำเร็จ: #${outPlayer?.jerseyNumber ?? "?"} ${outPlayer?.lastName ?? ""} (ออก) ➔ #${inPlayer?.jerseyNumber ?? "?"} ${inPlayer?.lastName ?? ""} (เข้า)`;
    setNotification(msg);

    logAuditEvent("SUBSTITUTION", {
      teamId,
      teamName: team.name,
      outAthleteId: outId,
      outJersey: outPlayer?.jerseyNumber,
      outName: `${outPlayer?.firstName} ${outPlayer?.lastName}`,
      inAthleteId: inId,
      inJersey: inPlayer?.jerseyNumber,
      inName: `${inPlayer?.firstName} ${inPlayer?.lastName}`,
      quarter: match.currentQuarter,
      gameClock: formatClock(match.gameClockSec),
    });

    setTimeout(() => setNotification(null), 3500);
  }, [logAuditEvent, match.awayTeam, match.currentQuarter, match.gameClockSec, match.homeTeam, match.homeTeamId, substitutePlayer]);

  // Courtside Table Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        const currentRail = useScorekeeperStore.getState().reversalRail;
        if (currentRail.length > 0) {
          handleReverseClick(currentRail[0].event.id);
        }
      } else if (e.code === "Space") {
        e.preventDefault();
        handleToggleClock();
      } else if (e.key === "F4") {
        e.preventDefault();
        openSubstitutionModal("HOME");
      } else if (e.key === "F5") {
        e.preventDefault();
        openSubstitutionModal("AWAY");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleReverseClick, handleToggleClock, openSubstitutionModal]);

  if (!isAuthorizedOfficial) {
    return (
      <div className="min-h-screen bg-[#0B1C30] text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-lg border border-white/10 bg-[#112338] p-8 shadow-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-[#AF101A] animate-pulse" />
            <p className="text-xs font-mono font-bold uppercase tracking-widest text-red-400">
              StatCourtTH • Official Table
            </p>
          </div>
          <h1 className="mt-2 text-2xl font-bold font-sans text-white">โต๊ะบันทึกคะแนนเจ้าหน้าที่</h1>
          <p className="mt-3 text-slate-300 text-sm leading-relaxed">
            {accessChecked
              ? "ต้องใช้บัญชีเจ้าหน้าที่ที่ได้รับอนุมัติและได้รับมอบหมายให้ดูแลแมตช์นี้"
              : "กำลังตรวจสอบสิทธิ์การแข่งขัน..."}
          </p>
          {authError && <p role="alert" className="mt-4 text-xs font-mono text-red-400 bg-red-950/60 p-2.5 rounded-sm border border-red-700/50">{authError}</p>}
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={async () => {
                const { switchRole } = useAuthStore.getState();
                await switchRole("OFFICIAL", "PRO");
                window.location.reload();
              }}
              className="rounded-sm bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 font-bold font-mono text-xs text-slate-950 transition active:scale-95 shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-slate-950" />
              <span>เข้าสู่โหมดทดสอบเจ้าหน้าที่ (1-Click Demo)</span>
            </button>
            <Link href="/auth/login" className="rounded-sm bg-[#AF101A] hover:bg-[#8F0D15] px-4 py-2.5 font-bold font-mono text-xs text-white transition active:scale-95 shadow-sm">
              เข้าสู่ระบบเจ้าหน้าที่
            </Link>
            <Link href="/matches" className="rounded-sm border border-[#1E3A5F] hover:bg-[#1E3A5F]/50 px-4 py-2.5 font-bold font-mono text-xs text-slate-200 transition active:scale-95">
              กลับไปหน้ารวมแมตช์
            </Link>
          </div>
        </div>
      </div>
    );
  }
  const homeOnCourt = match.homeTeam.roster.filter((p) => p.isOnCourt);
  const awayOnCourt = match.awayTeam.roster.filter((p) => p.isOnCourt);
  const homeBench = match.homeTeam.roster.filter((p) => !p.isOnCourt);
  const awayBench = match.awayTeam.roster.filter((p) => !p.isOnCourt);

  const activePlayerObj = selectedPlayer
    ? [...match.homeTeam.roster, ...match.awayTeam.roster].find(
        (p) => p.athleteId === selectedPlayer.athleteId
      )
    : null;

  return (
    <div className="bg-[#070F1A] text-slate-100 min-h-screen flex flex-col antialiased select-none font-sans">
      <MatchResultControls matchId={params.matchId} pendingSyncCount={pendingSyncCount} onStatusChange={handleResultStatusChange} />
      {/* ================= TOP OPERATOR HUD BAR ================= */}
      <header role="banner" className="w-full bg-[#0B1C30] text-white border-b border-[#1E3A5F] py-2 px-4 sm:px-6 shadow-sm flex items-center justify-between z-30">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-slate-200 hover:text-white hover:bg-white/10 px-2 py-1 rounded-sm transition font-mono text-xs uppercase font-bold tracking-wider"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>HOME</span>
          </Link>
          <div className="h-4 w-px bg-white/20 mx-0.5"></div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm tracking-wider font-extrabold text-white">
              STATCOURT.TH
            </span>
            <span className="bg-[#AF101A] text-white px-2 py-0.5 rounded-sm font-mono text-[10px] uppercase tracking-widest font-extrabold shadow-xs">
              OFFICIAL TABLE CONSOLE
            </span>
          </div>
          {/* Match Switcher Trigger Button */}
          <button
            onClick={() => setIsMatchSelectorOpen(true)}
            className="flex items-center gap-1.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 px-2.5 py-1 rounded-sm text-xs font-bold font-mono transition cursor-pointer shadow-xs active:scale-95 ml-1"
            title="สลับไปควบคุมแมตช์อื่นในทัวร์นาเมนต์ (FIBA Match Hub)"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">สลับแมตช์:</span>
            <span className="text-white">{match.homeTeam.shortName} vs {match.awayTeam.shortName}</span>
            <span className="text-[10px] text-amber-400">▾</span>
          </button>

          <span className="text-slate-400 font-mono text-xs hidden 2xl:inline-block">
            | &nbsp; {match.tournamentName || "TOA Youth Basketball League Thailand 2026 - Quarterfinals"}
          </span>
        </div>

        {/* Right Operator Status / Telemetry */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live Broadcast to /live Stream link badge */}
          <Link
            href="/live"
            target="_blank"
            className="flex items-center gap-1.5 bg-red-950/80 hover:bg-red-900 border border-red-500/60 text-white px-2.5 py-1 rounded-sm text-xs font-bold tracking-wider transition shadow-xs"
            title="เปิดหน้าผู้ชมถ่ายทอดสด /live เพื่อดูผลการ Broadcast แบบเรียลไทม์"
          >
            <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
            <span className="text-red-200 font-mono text-[11px] uppercase">
              LIVE BROADCAST
            </span>
          </Link>

          {/* Live Sync Badge with pending count & manual sync trigger */}
          {isOnline ? (
            <button
              onClick={() => syncPendingOfflineEvents()}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-semibold tracking-wider transition border cursor-pointer ${
                pendingSyncCount > 0
                  ? "bg-amber-950/80 border-amber-500/50 text-amber-300 hover:bg-amber-900"
                  : "bg-[#112338] border-[#1E3A5F] text-slate-200 hover:bg-[#172e4a]"
              }`}
              title={pendingSyncCount > 0 ? "กดเพื่อซิงก์ข้อมูลออฟไลน์ทันที" : "เชื่อมต่อและซิงก์เรียลไทม์สมบูรณ์"}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  pendingSyncCount > 0 ? "bg-amber-400 animate-pulse" : "bg-emerald-400"
                }`}
              />
              {pendingSyncCount > 0 ? (
                <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              ) : (
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              )}
              <span className={`font-mono text-[11px] uppercase tracking-wider ${pendingSyncCount > 0 ? "text-amber-300 font-bold" : "text-emerald-300"}`}>
                {pendingSyncCount > 0 ? `${pendingSyncCount} PENDING SYNC` : "LIVE TABLE SYNC"}
              </span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 bg-red-950/80 border border-red-500/50 text-red-200 px-2.5 py-1 rounded-sm text-xs font-semibold tracking-wider">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <WifiOff className="w-3.5 h-3.5 text-red-400" />
              <span className="font-mono text-[11px] uppercase tracking-wider text-red-300">
                OFFLINE ({pendingSyncCount} QUEUED)
              </span>
            </div>
          )}

          {/* Emergency Offline Ledger Export Button */}
          <button
            onClick={async () => {
              const json = await exportOfflineLedger();
              const blob = new Blob([json], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `offline_ledger_match_${params.matchId}_${Date.now()}.json`;
              a.click();
              URL.revokeObjectURL(url);
              setNotification("ดาวน์โหลดบันทึก Offline Ledger (JSON) สำเร็จ");
              setTimeout(() => setNotification(null), 3000);
            }}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-amber-300 px-2.5 py-1 rounded-sm text-xs font-bold tracking-wider transition cursor-pointer shadow-xs active:scale-95"
            title="ดาวน์โหลดไฟล์สำรองเหตุการณ์ออฟไลน์ฉุกเฉิน (Emergency JSON Ledger Export)"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="font-mono text-[11px] uppercase">EXPORT LEDGER</span>
          </button>

          {/* FIBA / BSAT Anti-Tamper Dispute Audit Trail Trigger */}
          <button
            onClick={() => setIsAuditModalOpen(true)}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-cyan-500/50 hover:border-cyan-400 text-cyan-200 px-2.5 py-1 rounded-sm text-xs font-bold tracking-wider transition shadow-xs cursor-pointer active:scale-95"
            title="เปิดประวัติการตัดสินและ Audit Trail แบบ Anti-Tamper สำหรับข้อพิพาท FIBA/BSAT"
          >
            <History className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-mono text-[11px] uppercase tracking-wider">
              AUDIT TRAIL (BSAT)
            </span>
          </button>

          {/* Scorekeeper Profile Stamp */}
          <div className="flex items-center gap-2 border-l border-white/20 pl-3">
            <BadgeCheck className="w-4 h-4 text-slate-300" />
            <div className="text-right">
              <p className="font-sans text-xs leading-tight font-bold text-white">
                {currentUser.name || "Somchai Srivichai"}
              </p>
              <p className="font-mono text-[10px] text-slate-400 tracking-wider">
                {currentUser.licenseNumber || "BSAT-TABLE-2026-088"}
              </p>
            </div>
            <button
              onClick={handleLogoutOfficial}
              className="p-1 hover:bg-white/10 rounded-sm transition text-slate-300 hover:text-white cursor-pointer"
              title="ออกจากระบบเจ้าหน้าที่โต๊ะบันทึกคะแนน"
            >
              <Unlock className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Floating Notification Toast (Floating overlay — Zero Layout Shift) */}
      {notification && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed top-14 right-4 sm:right-6 z-50 pointer-events-none transition-all duration-200"
        >
          <div className="pointer-events-auto bg-[#112338] text-white border border-[#AF101A] shadow-2xl rounded-sm px-4 py-2.5 flex items-center gap-3 max-w-md animate-fadeIn">
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-mono text-xs leading-tight flex-1">{notification}</span>
            <button
              type="button"
              onClick={() => setNotification(null)}
              className="text-slate-400 hover:text-white text-[10px] uppercase font-mono font-bold cursor-pointer ml-1 px-1.5 py-0.5 hover:bg-white/10 rounded-xs transition"
            >
              DISMISS
            </button>
          </div>
        </aside>
      )}

      {/* ================= JUMBO SCOREBOARD & GAME CLOCK PODIUM ================= */}
      <section role="region" aria-label="Scoreboard and Game Clock" className="w-full bg-[#070F1A] border-b border-[#1E3A5F] py-3 px-4 sm:px-6 shadow-sm">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4">
          {/* HOME TEAM SUMMARY (BCC) */}
          <div className="flex items-center gap-4 flex-1 justify-end">
            <div className="text-right">
              <p className="font-mono text-[11px] text-red-400 font-bold tracking-widest uppercase">
                HOME
              </p>
              <h2 className="font-sans text-xl sm:text-2xl font-bold text-white leading-tight">
                {match.homeTeam.shortName}
              </h2>
              <div className="flex items-center justify-end gap-3 text-slate-400 font-mono text-xs mt-0.5">
                <span>
                  FOULS: <b className="text-red-400 font-bold tabular-nums">3</b>
                </span>
                <span>
                  TO: <b className="text-white font-bold tabular-nums">2</b>
                </span>
              </div>
            </div>
            {/* Big Crimson Score Tile */}
            <div className="w-20 h-16 bg-[#AF101A] text-white rounded-lg flex items-center justify-center font-mono text-4xl font-extrabold leading-none shadow-md border-b-2 border-red-700 tabular-nums">
              <span>{match.homeScore}</span>
            </div>
          </div>

          {/* CENTER MATCH CHRONOMETER ENGINE */}
          <div className="bg-[#0B1C30] text-slate-100 rounded-lg p-3 px-5 flex flex-col items-center justify-center shadow-lg border border-[#1E3A5F] min-w-[340px]">
            {/* Quarter Tabs */}
            <div className="flex items-center gap-1 mb-1">
              {[1, 2, 3, 4].map((q) => (
                <button
                  key={q}
                  onClick={() => setQuarter(q)}
                  className={`px-2.5 py-0.5 rounded-sm font-mono text-xs uppercase font-bold transition cursor-pointer ${
                    match.currentQuarter === q
                      ? "bg-[#AF101A] text-white tracking-wider shadow-xs"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  Q{q}
                </button>
              ))}
              <button
                onClick={() => setQuarter(5)}
                className={`px-2.5 py-0.5 rounded-sm font-mono text-xs uppercase font-bold transition cursor-pointer ${
                  match.currentQuarter === 5
                    ? "bg-[#AF101A] text-white tracking-wider shadow-xs"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                OT
              </button>
              <span className="text-slate-500 font-mono text-[10px] tracking-widest pl-2">
                | QUARTER {match.currentQuarter <= 4 ? match.currentQuarter : "OT"}
              </span>
            </div>

            {/* Jumbo Digital LED Clock Display */}
            <div className="flex items-center gap-4">
              <div className="font-mono text-4xl sm:text-5xl tracking-widest text-rose-400 font-extrabold select-all leading-none py-0.5 drop-shadow-[0_0_8px_rgba(244,63,94,0.4)] tabular-nums">
                <span>{formatClock(match.gameClockSec)}</span>
              </div>
              {/* Shot Clock Inset Box */}
              <div className="bg-black/80 border-2 border-amber-500/80 px-2.5 py-1 rounded-sm text-center min-w-[50px]">
                <span className="block font-mono text-[9px] text-amber-400 font-bold uppercase tracking-wider leading-tight">
                  SHOT
                </span>
                <span className="font-mono text-2xl text-amber-300 font-black leading-none tabular-nums">
                  {shotClock}
                </span>
              </div>
            </div>

            {/* Clock Action Triggers */}
            <div className="flex items-center gap-2 mt-2 w-full justify-center">
              <button
                onClick={handleToggleClock}
                className={`flex-1 max-w-[140px] font-mono text-xs font-bold py-1.5 px-3 rounded-sm flex items-center justify-center gap-1.5 tracking-wider shadow transition active:scale-95 cursor-pointer ${
                  isClockRunning
                    ? "bg-amber-600 hover:bg-amber-500 text-white"
                    : "bg-emerald-600 hover:bg-emerald-500 text-white"
                }`}
              >
                {isClockRunning ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    <span>HOLD / PAUSE</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>START CLOCK</span>
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  if (isClockRunning) handleToggleClock();
                }}
                title="Hold Clock"
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-bold py-1.5 px-2.5 rounded-sm active:scale-95 transition cursor-pointer"
              >
                <Pause className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleSetShotClock(24)}
                title="Reset Shot Clock (24s)"
                className="bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-bold py-1.5 px-2.5 rounded-sm active:scale-95 transition cursor-pointer flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3 text-slate-400" />
                <span>24s</span>
              </button>
              <button
                onClick={() => handleSetShotClock(14)}
                title="Reset Shot Clock (14s offensive rebound)"
                className="bg-amber-950/80 hover:bg-amber-900 border border-amber-600/50 text-amber-300 hover:text-white font-mono text-xs font-bold py-1.5 px-2.5 rounded-sm active:scale-95 transition cursor-pointer flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3 text-amber-400" />
                <span>14s</span>
              </button>
            </div>
          </div>

          {/* AWAY TEAM SUMMARY (DS) */}
          <div className="flex items-center gap-4 flex-1 justify-start">
            {/* Big Dark Blue Score Tile */}
            <div className="w-20 h-16 bg-[#112338] text-white rounded-lg flex items-center justify-center font-mono text-4xl font-extrabold leading-none shadow-md border-b-2 border-[#1E3A5F] tabular-nums">
              <span>{match.awayScore}</span>
            </div>
            <div className="text-left">
              <p className="font-mono text-[11px] text-cyan-400 font-bold tracking-widest uppercase">
                AWAY
              </p>
              <h2 className="font-sans text-xl sm:text-2xl font-bold text-white leading-tight">
                {match.awayTeam.shortName}
              </h2>
              <div className="flex items-center justify-start gap-3 text-slate-400 font-mono text-xs mt-0.5">
                <span>
                  FOULS: <b className="text-cyan-400 font-bold tabular-nums">2</b>
                </span>
                <span>
                  TO: <b className="text-white font-bold tabular-nums">3</b>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= ACTIVE TARGET PLAYER BANNER ================= */}
      <section role="region" aria-label="Active Target Player" className="bg-[#0B1C30] border-b border-[#1E3A5F] py-2 px-4 sm:px-6">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-slate-400 font-bold tracking-wider uppercase">
              ACTIVE TARGET:
            </span>
            {selectedPlayer ? (
              <div className="flex items-center gap-2.5 bg-[#112338] border border-[#AF101A] px-3 py-1 rounded-sm shadow-xs">
                <span className="bg-[#AF101A] text-white font-mono text-xs px-2 py-0.5 rounded-sm leading-none font-bold">
                  #{selectedPlayer.jerseyNumber}
                </span>
                <span className="font-sans font-bold text-sm text-white uppercase tracking-wide">
                  {selectedPlayer.name}
                </span>
                <span className="text-slate-400 font-mono text-xs">
                  (
                  {selectedPlayer.teamId === match.homeTeamId
                    ? match.homeTeam.shortName
                    : match.awayTeam.shortName}{" "}
                  • {activePlayerObj?.position ? activePlayerObj.position.replace("_", " ") : "Point Guard"}
                  )
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-1"></span>
              </div>
            ) : (
              <span className="text-amber-400 font-mono text-xs">
                กรุณาคลิกเลือกเบอร์เสื้อของผู้เล่นในสนาม 5 คนด้านล่างก่อนกดบันทึกสถิติ
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] text-slate-400 font-semibold uppercase">
              STATION ID:
            </span>
            <span className="bg-[#112338] border border-[#1E3A5F] text-slate-300 font-mono text-xs px-2 py-0.5 rounded-sm font-bold">
              STC-TABLE-BKK-01
            </span>
          </div>
        </div>
      </section>

      {/* ================= MAIN 3-COLUMN OPERATOR ARENA ================= */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-4 grid grid-cols-12 gap-4 items-start">
        {/* ----------------- LEFT COLUMN: HOME TEAM 12-PLAYER ROSTER (BCC) ----------------- */}
        <aside role="region" aria-label="Home Team Roster" className="col-span-12 lg:col-span-3 flex flex-col gap-2">
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-[#AF101A] pb-1.5">
            <div>
              <span className="font-mono text-[10px] text-red-400 uppercase font-bold tracking-wider block">
                HOME TEAM (5 ตัวจริง + 7 สำรอง)
              </span>
              <h3 className="font-sans font-bold text-base text-white">
                {match.homeTeam.name}
              </h3>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="bg-[#AF101A] text-white px-2 py-0.5 font-mono text-xs rounded-sm font-bold">
                {match.homeTeam.shortName}
              </span>
              <button
                type="button"
                onClick={() => openSubstitutionModal("HOME")}
                className="flex items-center gap-1 bg-red-950/80 hover:bg-[#AF101A] border border-red-500/50 text-white px-2 py-0.5 rounded-sm font-mono text-[10px] font-bold transition cursor-pointer shadow-xs active:scale-95"
                title="เปลี่ยนตัวผู้เล่นทีมเหย้า (Quick Sub [F4])"
              >
                <ArrowRightLeft className="w-3 h-3 text-red-300" />
                <span>เปลี่ยนตัว [F4]</span>
              </button>
            </div>
          </div>

          {/* Player Cards Feed (5 On-Court) */}
          <div className="flex flex-col gap-1.5 mt-1">
            <div className="text-[10px] font-mono text-slate-400 uppercase flex items-center justify-between px-0.5">
              <span className="text-red-400 font-bold flex items-center gap-1">
                <Users className="w-3 h-3" /> 5 ตัวจริงในสนาม (ON-COURT)
              </span>
              <span>แต้ม / ฟาวล์</span>
            </div>
            {homeOnCourt.map((player) => {
              const isSelected = selectedPlayer?.athleteId === player.athleteId;
              return (
                <div
                  key={player.athleteId}
                  onClick={() => selectPlayer(match.homeTeamId, player.athleteId)}
                  className={`player-card cursor-pointer p-2 rounded-lg transition flex items-center justify-between group ${
                    isSelected
                      ? "active-card bg-[#112338] border-2 border-[#AF101A] shadow-md"
                      : "bg-[#0B1C30] border border-[#1E3A5F] hover:border-[#AF101A] shadow-sm"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-sm font-mono text-sm flex items-center justify-center font-bold shrink-0 ${
                        isSelected
                          ? "bg-[#AF101A] text-white"
                          : "bg-slate-800 text-slate-200"
                      }`}
                    >
                      #{player.jerseyNumber}
                    </div>
                    <div className="min-w-0">
                      <p className="font-sans text-xs font-bold text-white group-hover:text-red-400 transition-colors leading-tight truncate">
                        {player.firstName} {player.lastName}
                      </p>
                      <p className="font-mono text-[10px] text-slate-400 uppercase mt-0.5 truncate">
                        {player.position.replace("_", " ")} | {player.heightCm}CM
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <span className="font-mono text-xs text-white block font-bold tabular-nums">
                        {player.points} PTS
                      </span>
                      <span
                        className={`font-mono text-[10px] tabular-nums ${
                          player.fouls >= 4
                            ? "text-red-400 font-bold"
                            : player.fouls > 0
                            ? "text-amber-400 font-bold"
                            : "text-slate-400"
                        }`}
                      >
                        {player.fouls} FOULS
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openSubstitutionModal("HOME", player.athleteId);
                      }}
                      className="p-1.5 rounded-sm bg-slate-800 hover:bg-[#AF101A] text-slate-300 hover:text-white transition cursor-pointer"
                      title={`เปลี่ยนตัว #${player.jerseyNumber} ออก`}
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bench Substitutes Section (7 Players) */}
          <div className="mt-2 border-t border-slate-800/80 pt-2 flex flex-col gap-1.5">
            <div className="text-[10px] font-mono text-slate-400 uppercase flex items-center justify-between px-0.5">
              <span className="text-slate-300 font-bold flex items-center gap-1">
                <Users className="w-3 h-3 text-slate-400" /> ม้านั่งสำรอง (BENCH - {homeBench.length} คน)
              </span>
              <button
                type="button"
                onClick={() => openSubstitutionModal("HOME")}
                className="text-red-400 hover:text-red-300 hover:underline font-bold text-[10px]"
              >
                + เปลี่ยนตัวเข้า
              </button>
            </div>

            <div className="flex flex-col gap-1 max-h-[220px] overflow-y-auto pr-0.5">
              {homeBench.map((player) => {
                const isFouledOut = player.fouls >= 5;
                return (
                  <div
                    key={player.athleteId}
                    className="p-1.5 px-2 rounded bg-[#091524] border border-slate-800/80 flex items-center justify-between hover:border-slate-700 transition"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-6 h-6 rounded-xs bg-slate-900 border border-slate-800 flex items-center justify-center font-mono text-[11px] font-bold text-slate-300 shrink-0">
                        #{player.jerseyNumber}
                      </span>
                      <div className="min-w-0">
                        <p className="font-sans text-[11px] font-semibold text-slate-200 truncate">
                          {player.firstName} {player.lastName}
                        </p>
                        <p className="font-mono text-[9px] text-slate-500 uppercase truncate">
                          {player.position.replace("_", " ")} • {player.heightCm}cm
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <span className="font-mono text-[10px] text-slate-400 block tabular-nums">
                          {player.points}p
                        </span>
                        <span
                          className={`font-mono text-[9px] ${
                            isFouledOut
                              ? "text-red-400 font-bold"
                              : player.fouls >= 4
                              ? "text-amber-400 font-bold"
                              : "text-slate-500"
                          }`}
                        >
                          {isFouledOut ? "FOUL OUT" : `${player.fouls}F`}
                        </span>
                      </div>

                      <button
                        type="button"
                        disabled={isFouledOut}
                        onClick={() => openSubstitutionModal("HOME")}
                        className="px-1.5 py-0.5 rounded-xs bg-slate-800 hover:bg-[#AF101A] disabled:opacity-30 disabled:hover:bg-slate-800 text-slate-300 hover:text-white font-mono text-[9px] font-bold uppercase transition flex items-center gap-0.5 cursor-pointer disabled:cursor-not-allowed"
                        title={isFouledOut ? "ฟาวล์ครบ 5 ครั้ง ไม่สามารถลงสนามได้" : `เปลี่ยน #${player.jerseyNumber} ลงสนาม`}
                      >
                        <span>Sub</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        {/* ----------------- CENTER COLUMN: OFFICIAL ACTION MATRIX ----------------- */}
        <section role="region" aria-label="Official Action Matrix" className="col-span-12 lg:col-span-6 flex flex-col gap-2">
          {/* Section Tag */}
          <div className="flex items-center justify-between border-b border-[#1E3A5F] pb-1.5">
            <span className="font-mono text-xs text-white font-bold tracking-wider uppercase flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-[#AF101A]" />
              OFFICIAL COURTSIDE ACTION MATRIX
            </span>
            <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider">
              TOUCH TO LOG STAT • INSTANT FIBA DISPATCH
            </span>
          </div>

          {/* Action Button Grid (5 Rows x 3 Columns) */}
          <div className="grid grid-cols-3 gap-2 mt-1">
            {/* ROW 1: SCORING (MADE SHOTS) */}
            <button
              onClick={() => handleActionClick("FREE_THROW_MADE", "+1 Free Throw Made")}
              className="bg-emerald-700 hover:bg-emerald-600 active:scale-95 text-white p-3 rounded-sm flex flex-col items-center justify-center shadow transition-all cursor-pointer"
            >
              <span className="font-mono text-xl font-extrabold leading-none">+1 FT</span>
              <span className="font-mono text-[10px] uppercase tracking-wider mt-1 opacity-90">
                FREE THROW MADE
              </span>
            </button>

            <button
              onClick={() => handleActionClick("TWO_POINT_MADE", "+2 Field Goal Made")}
              className="bg-[#AF101A] hover:bg-[#8F0D15] active:scale-95 text-white p-3 rounded-sm flex flex-col items-center justify-center shadow transition-all cursor-pointer"
            >
              <span className="font-mono text-xl font-extrabold leading-none">+2 PTS</span>
              <span className="font-mono text-[10px] uppercase tracking-wider mt-1 opacity-90">
                FIELD GOAL MADE
              </span>
            </button>

            <button
              onClick={() => handleActionClick("THREE_POINT_MADE", "+3 Three Pointer Made")}
              className="bg-red-900 hover:bg-red-800 border border-red-600/50 active:scale-95 text-white p-3 rounded-sm flex flex-col items-center justify-center shadow transition-all cursor-pointer"
            >
              <span className="font-mono text-xl font-extrabold leading-none">+3 PTS</span>
              <span className="font-mono text-[10px] uppercase tracking-wider mt-1 opacity-90">
                THREE POINTER MADE
              </span>
            </button>

            {/* ROW 2: SHOT ATTEMPTS (MISSED) */}
            <button
              onClick={() => handleActionClick("TWO_POINT_MISSED", "Missed 2PT")}
              className="bg-[#0B1C30] hover:bg-[#112338] active:scale-95 border border-[#1E3A5F] text-slate-200 p-3 rounded-sm flex flex-col items-center justify-center shadow-xs transition-all cursor-pointer"
            >
              <span className="font-mono text-lg font-bold leading-none text-slate-300">
                MISS 2PT
              </span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400 mt-1">
                2-Point Attempt
              </span>
            </button>

            <button
              onClick={() => handleActionClick("THREE_POINT_MISSED", "Missed 3PT")}
              className="bg-[#0B1C30] hover:bg-[#112338] active:scale-95 border border-[#1E3A5F] text-slate-200 p-3 rounded-sm flex flex-col items-center justify-center shadow-xs transition-all cursor-pointer"
            >
              <span className="font-mono text-lg font-bold leading-none text-slate-300">
                MISS 3PT
              </span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400 mt-1">
                3-Point Attempt
              </span>
            </button>

            <button
              onClick={() => handleActionClick("FREE_THROW_MISSED", "Missed Free Throw")}
              className="bg-[#0B1C30] hover:bg-[#112338] active:scale-95 border border-[#1E3A5F] text-slate-200 p-3 rounded-sm flex flex-col items-center justify-center shadow-xs transition-all cursor-pointer"
            >
              <span className="font-mono text-lg font-bold leading-none text-slate-300">
                MISS FT
              </span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400 mt-1">
                Free Throw Miss
              </span>
            </button>

            {/* ROW 3: REBOUNDS & PLAYMAKING */}
            <button
              onClick={() => handleActionClick("OFFENSIVE_REBOUND", "Offensive Rebound")}
              className="bg-blue-700 hover:bg-blue-600 active:scale-95 text-white p-3 rounded-sm flex flex-col items-center justify-center shadow transition-all cursor-pointer"
            >
              <span className="font-mono text-lg font-bold leading-none">OFF REB</span>
              <span className="font-mono text-[10px] uppercase tracking-wider mt-1 opacity-90">
                Offensive Board
              </span>
            </button>

            <button
              onClick={() => handleActionClick("DEFENSIVE_REBOUND", "Defensive Rebound")}
              className="bg-indigo-800 hover:bg-indigo-700 active:scale-95 text-white p-3 rounded-sm flex flex-col items-center justify-center shadow transition-all cursor-pointer"
            >
              <span className="font-mono text-lg font-bold leading-none">DEF REB</span>
              <span className="font-mono text-[10px] uppercase tracking-wider mt-1 opacity-90">
                Defensive Board
              </span>
            </button>

            <button
              onClick={() => handleActionClick("ASSIST", "Assist Credited")}
              className="bg-teal-700 hover:bg-teal-600 active:scale-95 text-white p-3 rounded-sm flex flex-col items-center justify-center shadow transition-all cursor-pointer"
            >
              <span className="font-mono text-lg font-bold leading-none">AST</span>
              <span className="font-mono text-[10px] uppercase tracking-wider mt-1 opacity-90">
                Assist
              </span>
            </button>

            {/* ROW 4: DEFENSIVE & TURNOVERS */}
            <button
              onClick={() => handleActionClick("STEAL", "Steal")}
              className="bg-emerald-800 hover:bg-emerald-700 active:scale-95 text-white p-3 rounded-sm flex flex-col items-center justify-center shadow transition-all cursor-pointer"
            >
              <span className="font-mono text-lg font-bold leading-none">STL</span>
              <span className="font-mono text-[10px] uppercase tracking-wider mt-1 opacity-90">
                Steal
              </span>
            </button>

            <button
              onClick={() => handleActionClick("BLOCK", "Shot Block")}
              className="bg-cyan-800 hover:bg-cyan-700 active:scale-95 text-white p-3 rounded-sm flex flex-col items-center justify-center shadow transition-all cursor-pointer"
            >
              <span className="font-mono text-lg font-bold leading-none">BLK</span>
              <span className="font-mono text-[10px] uppercase tracking-wider mt-1 opacity-90">
                Shot Block
              </span>
            </button>

            <button
              onClick={() => handleActionClick("TURNOVER", "Turnover Committed")}
              className="bg-amber-700 hover:bg-amber-600 active:scale-95 text-white p-3 rounded-sm flex flex-col items-center justify-center shadow transition-all cursor-pointer"
            >
              <span className="font-mono text-lg font-bold leading-none">TO</span>
              <span className="font-mono text-[10px] uppercase tracking-wider mt-1 opacity-90">
                Turnover
              </span>
            </button>
          </div>

          {/* ROW 5: FOULS MATRIX (Full Width Span) */}
          <div className="grid grid-cols-2 gap-2 mt-1">
            <button
              onClick={() => handleActionClick("PERSONAL_FOUL", "Personal Foul Added")}
              className="bg-[#AF101A] hover:bg-[#8F0D15] active:scale-95 text-white p-3 rounded-sm flex flex-col items-center justify-center shadow transition-all cursor-pointer"
            >
              <span className="font-mono text-base font-bold leading-none">PERSONAL FOUL</span>
              <span className="font-mono text-[10px] uppercase tracking-wider mt-1 opacity-90">
                Player Foul Call (+1 FL)
              </span>
            </button>

            <button
              onClick={() => handleActionClick("TECHNICAL_FOUL", "Technical / Bench Foul")}
              className="bg-purple-900 hover:bg-purple-800 border border-purple-600/50 active:scale-95 text-white p-3 rounded-sm flex flex-col items-center justify-center shadow transition-all cursor-pointer"
            >
              <span className="font-mono text-base font-bold leading-none">TECH FOUL</span>
              <span className="font-mono text-[10px] uppercase tracking-wider mt-1 opacity-90">
                Bench / Tech Violation
              </span>
            </button>
          </div>

          {/* Tactical Matrix Sub-Controls */}
          <div className="bg-[#0B1C30] p-2.5 rounded-lg border border-[#1E3A5F] flex flex-wrap items-center justify-between gap-2 text-xs mt-1">
            <div className="flex items-center gap-2">
              <UploadCloud className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-mono text-slate-400 text-[11px]">
                Last event synced:{" "}
                <b className="text-white">
                  Q{match.currentQuarter} | Clock: {formatClock(match.gameClockSec)}
                  {notification ? ` (${notification})` : ""}
                </b>
              </span>
            </div>
            <Link
              href={`/matches/${match.id}/film`}
              className="text-red-400 hover:text-red-300 font-mono font-bold text-[11px] uppercase flex items-center gap-1"
            >
              <span>Review Match Film &amp; Timestamps</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </section>

        {/* ----------------- RIGHT COLUMN: AWAY TEAM 12-PLAYER ROSTER (DS) ----------------- */}
        <aside role="region" aria-label="Away Team Roster" className="col-span-12 lg:col-span-3 flex flex-col gap-2">
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-cyan-500 pb-1.5">
            <div>
              <span className="font-mono text-[10px] text-cyan-400 uppercase font-bold tracking-wider block">
                AWAY TEAM (5 ตัวจริง + 7 สำรอง)
              </span>
              <h3 className="font-sans font-bold text-base text-white">
                {match.awayTeam.name}
              </h3>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="bg-[#112338] text-cyan-300 border border-cyan-500/40 px-2 py-0.5 font-mono text-xs rounded-sm font-bold">
                {match.awayTeam.shortName}
              </span>
              <button
                type="button"
                onClick={() => openSubstitutionModal("AWAY")}
                className="flex items-center gap-1 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-200 px-2 py-0.5 rounded-sm font-mono text-[10px] font-bold transition cursor-pointer shadow-xs active:scale-95"
                title="เปลี่ยนตัวผู้เล่นทีมเยือน (Quick Sub [F5])"
              >
                <ArrowRightLeft className="w-3 h-3 text-cyan-400" />
                <span>เปลี่ยนตัว [F5]</span>
              </button>
            </div>
          </div>

          {/* Player Cards Feed (5 On-Court) */}
          <div className="flex flex-col gap-1.5 mt-1">
            <div className="text-[10px] font-mono text-slate-400 uppercase flex items-center justify-between px-0.5">
              <span className="text-cyan-400 font-bold flex items-center gap-1">
                <Users className="w-3 h-3" /> 5 ตัวจริงในสนาม (ON-COURT)
              </span>
              <span>แต้ม / ฟาวล์</span>
            </div>
            {awayOnCourt.map((player) => {
              const isSelected = selectedPlayer?.athleteId === player.athleteId;
              return (
                <div
                  key={player.athleteId}
                  onClick={() => selectPlayer(match.awayTeamId, player.athleteId)}
                  className={`player-card cursor-pointer p-2 rounded-lg transition flex items-center justify-between group ${
                    isSelected
                      ? "active-card bg-[#112338] border-2 border-cyan-400 shadow-md"
                      : "bg-[#0B1C30] border border-[#1E3A5F] hover:border-cyan-400 shadow-sm"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-sm font-mono text-sm flex items-center justify-center font-bold shrink-0 ${
                        isSelected
                          ? "bg-cyan-700 text-white"
                          : "bg-slate-800 text-slate-200"
                      }`}
                    >
                      #{player.jerseyNumber}
                    </div>
                    <div className="min-w-0">
                      <p className="font-sans text-xs font-bold text-white group-hover:text-cyan-400 transition-colors leading-tight truncate">
                        {player.firstName} {player.lastName}
                      </p>
                      <p className="font-mono text-[10px] text-slate-400 uppercase mt-0.5 truncate">
                        {player.position.replace("_", " ")} | {player.heightCm}CM
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <span className="font-mono text-xs text-white block font-bold tabular-nums">
                        {player.points} PTS
                      </span>
                      <span
                        className={`font-mono text-[10px] tabular-nums ${
                          player.fouls >= 4
                            ? "text-red-400 font-bold"
                            : "text-slate-400"
                        }`}
                      >
                        {player.fouls} FOULS
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openSubstitutionModal("AWAY", player.athleteId);
                      }}
                      className="p-1.5 rounded-sm bg-slate-800 hover:bg-cyan-700 text-slate-300 hover:text-white transition cursor-pointer"
                      title={`เปลี่ยนตัว #${player.jerseyNumber} ออก`}
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bench Substitutes Section (7 Players) */}
          <div className="mt-2 border-t border-slate-800/80 pt-2 flex flex-col gap-1.5">
            <div className="text-[10px] font-mono text-slate-400 uppercase flex items-center justify-between px-0.5">
              <span className="text-slate-300 font-bold flex items-center gap-1">
                <Users className="w-3 h-3 text-slate-400" /> ม้านั่งสำรอง (BENCH - {awayBench.length} คน)
              </span>
              <button
                type="button"
                onClick={() => openSubstitutionModal("AWAY")}
                className="text-cyan-400 hover:text-cyan-300 hover:underline font-bold text-[10px]"
              >
                + เปลี่ยนตัวเข้า
              </button>
            </div>

            <div className="flex flex-col gap-1 max-h-[220px] overflow-y-auto pr-0.5">
              {awayBench.map((player) => {
                const isFouledOut = player.fouls >= 5;
                return (
                  <div
                    key={player.athleteId}
                    className="p-1.5 px-2 rounded bg-[#091524] border border-slate-800/80 flex items-center justify-between hover:border-slate-700 transition"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-6 h-6 rounded-xs bg-slate-900 border border-slate-800 flex items-center justify-center font-mono text-[11px] font-bold text-slate-300 shrink-0">
                        #{player.jerseyNumber}
                      </span>
                      <div className="min-w-0">
                        <p className="font-sans text-[11px] font-semibold text-slate-200 truncate">
                          {player.firstName} {player.lastName}
                        </p>
                        <p className="font-mono text-[9px] text-slate-500 uppercase truncate">
                          {player.position.replace("_", " ")} • {player.heightCm}cm
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <span className="font-mono text-[10px] text-slate-400 block tabular-nums">
                          {player.points}p
                        </span>
                        <span
                          className={`font-mono text-[9px] ${
                            isFouledOut
                              ? "text-red-400 font-bold"
                              : player.fouls >= 4
                              ? "text-amber-400 font-bold"
                              : "text-slate-500"
                          }`}
                        >
                          {isFouledOut ? "FOUL OUT" : `${player.fouls}F`}
                        </span>
                      </div>

                      <button
                        type="button"
                        disabled={isFouledOut}
                        onClick={() => openSubstitutionModal("AWAY")}
                        className="px-1.5 py-0.5 rounded-xs bg-slate-800 hover:bg-cyan-700 disabled:opacity-30 disabled:hover:bg-slate-800 text-slate-300 hover:text-white font-mono text-[9px] font-bold uppercase transition flex items-center gap-0.5 cursor-pointer disabled:cursor-not-allowed"
                        title={isFouledOut ? "ฟาวล์ครบ 5 ครั้ง ไม่สามารถลงสนามได้" : `เปลี่ยน #${player.jerseyNumber} ลงสนาม`}
                      >
                        <span>Sub</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </main>

      {/* ================= 60-SECOND ACTION REVERSAL RAIL (UNDO DOCK) ================= */}
      <footer role="region" aria-label="Action Reversal Rail" className="w-full bg-[#0B1C30] text-slate-200 py-2.5 px-4 sm:px-6 border-t border-[#1E3A5F] z-20">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Reversal Rail Intro */}
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-red-400" />
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-xs font-bold text-white tracking-wide uppercase">
                60-SECOND ACTION REVERSAL RAIL
              </span>
              <span className="text-slate-400 font-mono text-[11px] hidden sm:inline">
                Last 5 official table events — undo within 60s
              </span>
            </div>
          </div>

          {/* Recent Event Pills Horizontal Feed */}
          <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 md:pb-0">
            {reversalRail.length === 0 ? (
              <span className="text-xs text-slate-500 font-mono italic">
                No recent actions recorded in this session.
              </span>
            ) : (
              reversalRail.slice(0, 5).map((item) => {
                const elapsedSec = Math.floor(
                  (Date.now() - item.registeredAtMs) / 1000
                );
                const isReversible = elapsedSec <= 60;
                return (
                  <div
                    key={item.event.id}
                    className={`flex items-center gap-1.5 bg-[#070F1A] border border-[#1E3A5F] px-2.5 py-1 rounded-sm text-xs shrink-0 font-mono ${
                      isReversible ? "opacity-100" : "opacity-50"
                    }`}
                  >
                    <span className="text-red-400 font-bold">
                      #{item.event.jerseyNumber}
                    </span>
                    <span className="text-white uppercase font-semibold">
                      {item.event.eventType.replace(/_/g, " ")}
                    </span>
                    <span className="text-slate-400 text-[10px]">
                      Q{item.event.quarter} {item.event.gameClockDisplay}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* Quick Action Undo Button */}
          <button
            onClick={() => {
              if (reversalRail.length > 0) {
                handleReverseClick(reversalRail[0].event.id);
              }
            }}
            disabled={reversalRail.length === 0}
            className="bg-rose-950/80 hover:bg-rose-900 disabled:opacity-40 text-rose-200 border border-rose-700/60 font-mono text-xs font-bold uppercase px-3 py-1.5 rounded-sm flex items-center gap-1.5 active:scale-95 transition cursor-pointer shrink-0"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span>REVERSE EVENT [CTRL+Z]</span>
          </button>
        </div>
      </footer>

      {/* Official Anti-Tamper Dispute Audit Log Modal */}
      <OfficialAuditLogModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        matchId={params.matchId}
        matchTitle={match.tournamentName || "TOA Youth Basketball League Thailand 2026"}
      />

      {/* Official Match Selector Modal */}
      <OfficialMatchSelectorModal
        isOpen={isMatchSelectorOpen}
        onClose={() => setIsMatchSelectorOpen(false)}
        currentMatchId={params.matchId}
      />

      {/* Official Courtside Substitution Modal */}
      <OfficialSubstitutionModal
        isOpen={isSubModalOpen}
        onClose={() => setIsSubModalOpen(false)}
        team={subModalTeam === "HOME" ? match.homeTeam : match.awayTeam}
        isHome={subModalTeam === "HOME"}
        preselectedOutId={preselectedOutPlayerId}
        onConfirmSub={handleConfirmSubstitution}
      />
    </div>
  );
}

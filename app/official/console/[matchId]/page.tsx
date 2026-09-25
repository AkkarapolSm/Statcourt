"use client";

import React, { useEffect, useState } from "react";
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
  KeyRound,
  Clock,
  Flame,
  AlertTriangle,
  ChevronRight,
  ArrowLeft,
  RefreshCw,
  LogOut,
  History,
} from "lucide-react";
import OfficialAuditLogModal from "@/components/official/OfficialAuditLogModal";
import { useScorekeeperStore } from "@/lib/store/useScorekeeperStore";
import { useAuthStore } from "@/lib/auth/useAuthStore";
import { EventType } from "@/lib/types";

export default function ScorekeeperConsolePage({
  params,
}: {
  params: { matchId: string };
}) {
  const { currentUser, loginAs, verifyOfficialTablePin, logout } =
    useAuthStore();

  const {
    match,
    isClockRunning,
    selectedPlayer,
    reversalRail,
    isOnline,
    pendingSyncCount,
    toggleClock,
    resetClock,
    setQuarter,
    selectPlayer,
    recordAction,
    reverseAction,
    setOnlineStatus,
    syncPendingOfflineEvents,
  } = useScorekeeperStore();

  const [notification, setNotification] = useState<string | null>(null);

  // Official Table Authorization Form State
  const [pinInput, setPinInput] = useState("");
  const [licenseInput, setLicenseInput] = useState("BSAT-TABLE-2026-088");
  const [authError, setAuthError] = useState<string | null>(null);
  const [showPin, setShowPin] = useState(false);
  const [shotClock, setShotClock] = useState(14);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [officialToken, setOfficialToken] = useState<string | null>(null);

  const isAuthorizedOfficial =
    currentUser.role === "OFFICIAL" && currentUser.approvalStatus === "APPROVED";

  // Check active server-side session on mount
  useEffect(() => {
    const checkActiveSession = async () => {
      try {
        const storedToken =
          typeof window !== "undefined"
            ? localStorage.getItem("statcourt_official_token")
            : null;

        const res = await fetch("/api/official/verify", {
          headers: storedToken ? { "x-official-token": storedToken } : {},
        });

        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.official) {
            loginAs("OFFICIAL");
            if (storedToken) setOfficialToken(storedToken);
          }
        }
      } catch (err) {
        console.warn("Could not verify active table session:", err);
      }
    };
    checkActiveSession();
  }, [loginAs]);

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
    if (isAuthorizedOfficial && isClockRunning) {
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
  }, [isAuthorizedOfficial, isClockRunning, params.matchId]);

  const handleToggleClock = () => {
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
  };

  const handleSetShotClock = (sec: number) => {
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

  const formatClock = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const logAuditEvent = async (actionType: string, details: any) => {
    try {
      const token =
        officialToken ||
        (typeof window !== "undefined"
          ? localStorage.getItem("statcourt_official_token")
          : null);

      await fetch(`/api/matches/${params.matchId}/audit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "x-official-token": token } : {}),
        },
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
  };

  const handleActionClick = async (action: EventType, label: string) => {
    if (!selectedPlayer) {
      setNotification("Please select an on-court player first");
      setTimeout(() => setNotification(null), 3000);
      return;
    }
    await recordAction(action);
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

  const handleReverseClick = async (eventId: string) => {
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
  };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setAuthError(null);

    try {
      const res = await fetch("/api/official/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          licenseNumber: licenseInput,
          pin: pinInput,
          matchId: params.matchId,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "รหัส PIN หรือเลขที่ใบอนุญาตไม่ถูกต้อง");
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("statcourt_official_token", data.token);
      }
      setOfficialToken(data.token);
      loginAs("OFFICIAL");
    } catch (err: any) {
      setAuthError(err.message || "เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleQuickAuth = async (license: string = "BSAT-TABLE-2026-088", pin: string = "7788") => {
    setLicenseInput(license);
    setPinInput(pin);
    setIsAuthenticating(true);
    setAuthError(null);

    try {
      const res = await fetch("/api/official/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          licenseNumber: license,
          pin,
          matchId: params.matchId,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (typeof window !== "undefined") {
          localStorage.setItem("statcourt_official_token", data.token);
        }
        setOfficialToken(data.token);
        loginAs("OFFICIAL");
      } else {
        setAuthError(data.error || "รหัส PIN หรือเลขที่ใบอนุญาตไม่ถูกต้อง");
      }
    } catch (err: any) {
      setAuthError(err.message || "เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogoutOfficial = async () => {
    try {
      const token =
        officialToken ||
        (typeof window !== "undefined"
          ? localStorage.getItem("statcourt_official_token")
          : null);

      await fetch("/api/official/logout", {
        method: "POST",
        headers: token ? { "x-official-token": token } : {},
      });
    } catch (e) {
      console.warn("Logout error:", e);
    }

    if (typeof window !== "undefined") {
      localStorage.removeItem("statcourt_official_token");
    }
    setOfficialToken(null);
    logout();
  };

  // If NOT authorized official table member, show strict RBAC security lock screen
  if (!isAuthorizedOfficial) {
    return (
      <div className="bg-[#080c14] text-white min-h-screen flex flex-col font-body-md text-body-md antialiased selection:bg-primary selection:text-white relative overflow-x-hidden">
        {/* Subtle Court Tactical Grid Background Atmosphere */}
        <div className="fixed inset-0 court-grid-pattern pointer-events-none opacity-60" />
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-primary/10 blur-[130px] rounded-full pointer-events-none" />

        {/* Top Navigation Header (Focused Access Shell) */}
        <header className="w-full relative z-20 border-b border-white/10 bg-[#090d16]/90 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-gutter-desktop py-space-md flex justify-between items-center">
            {/* Back Link */}
            <Link
              href="/"
              className="inline-flex items-center gap-space-xs text-secondary-fixed-dim hover:text-white transition-colors duration-150 group"
            >
              <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform duration-150">
                arrow_back
              </span>
              <span className="font-label-caps text-label-caps tracking-widest uppercase">
                RETURN TO PUBLIC MATCH CENTER
              </span>
            </Link>

            {/* Brand & Table Access Label */}
            <div className="flex items-center gap-3">
              <div className="bg-primary px-2.5 py-0.5 rounded-[2px] shadow-sm">
                <span className="font-headline-sm text-headline-sm uppercase tracking-wider text-white">
                  STATCOURT.TH
                </span>
              </div>
              <span className="font-label-caps text-label-caps tracking-wider uppercase text-secondary-fixed-dim border-l border-white/15 pl-3 hidden sm:inline-block">
                TABLE ACCESS CONTROL
              </span>
            </div>
          </div>
        </header>

        {/* Main Security Canvas */}
        <main className="flex-1 flex items-center justify-center p-4 sm:p-gutter relative z-10 my-auto py-space-xl">
          {/* Central Shield Security Card Container */}
          <div className="w-full max-w-[480px] bg-[#101622] rounded-xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] p-6 sm:p-8 relative backdrop-blur-md">
            {/* Top Subtle Red Accent Line */}
            <div className="absolute top-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-primary-container to-transparent" />

            {/* Lock Shield Icon & Restricted Badge */}
            <div className="flex flex-col items-center text-center mb-6">
              {/* Glowing Red Lock Container */}
              <div className="relative w-16 h-16 rounded-xl bg-primary-container/10 border border-primary-container/40 flex items-center justify-center mb-4 shadow-[0_0_24px_rgba(211,47,47,0.3)]">
                <span
                  className="material-symbols-outlined text-primary-container text-[32px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  lock
                </span>
                {/* Radar Pulse Ping Corner */}
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-container opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
                </span>
              </div>

              {/* Official Table Restricted Chip */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#2b1014] border border-primary-container/30 mb-3 shadow-inner">
                <span className="material-symbols-outlined text-primary-fixed-dim text-[14px]">
                  shield
                </span>
                <span className="font-label-caps text-label-caps uppercase text-primary-fixed-dim tracking-wider font-bold">
                  RESTRICTED OFFICIAL TABLE
                </span>
              </div>

              {/* Title */}
              <h1 className="font-headline-lg text-headline-lg uppercase text-white tracking-wide mb-2">
                Scorekeeper Table Access Guard
              </h1>

              {/* Subtitle Context Statement */}
              <p className="font-body-md text-body-md text-secondary-fixed-dim leading-relaxed max-w-[390px]">
                Under federation rules, the Official Table is the Single Source of Truth. Public spectators and unverified accounts cannot input official match scores.
              </p>
            </div>

            {authError && (
              <div className="mb-4 p-3 bg-red-950/80 border border-red-600 rounded-lg text-xs text-red-200 font-mono text-center">
                {authError}
              </div>
            )}

            {/* Form Inputs Section */}
            <form onSubmit={handlePinSubmit} className="space-y-4">
              {/* Input 1: Official Table License */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="font-label-caps text-label-caps uppercase tracking-wider text-secondary-fixed">
                    Official Table License Number
                  </label>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 font-label-caps">
                    <span
                      className="material-symbols-outlined text-[13px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      verified
                    </span>
                    BSAT VERIFIED
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-secondary-fixed-dim">
                    <span className="material-symbols-outlined text-[18px]">badge</span>
                  </div>
                  <input
                    type="text"
                    required
                    value={licenseInput}
                    onChange={(e) => setLicenseInput(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-[#090d15] border border-white/15 rounded-lg text-white font-mono text-[14px] tracking-wider focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-emerald-400">
                    <span
                      className="material-symbols-outlined text-[18px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      check_circle
                    </span>
                  </div>
                </div>
              </div>

              {/* Input 2: Courtside Security PIN */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="font-label-caps text-label-caps uppercase tracking-wider text-secondary-fixed">
                    Courtside Security PIN
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setPinInput("7788");
                      setAuthError(null);
                    }}
                    className="font-body-sm text-body-sm text-secondary-fixed-dim hover:text-white transition cursor-pointer"
                  >
                    Demo: <span className="text-white font-mono font-bold underline">7788</span>
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-secondary-fixed-dim">
                    <span className="material-symbols-outlined text-[18px]">pin</span>
                  </div>
                  <input
                    type={showPin ? "text" : "password"}
                    required
                    maxLength={4}
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    placeholder="Enter 4-digit PIN (Demo: 7788)"
                    className="w-full pl-10 pr-10 py-2.5 bg-[#090d15] border border-white/15 rounded-lg text-white placeholder-secondary focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container font-mono text-[14px] tracking-widest transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-secondary hover:text-white transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showPin ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Primary Action Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isAuthenticating}
                  className="w-full bg-primary-container hover:bg-primary active:scale-[0.98] transition-all duration-150 py-3 rounded-lg text-white font-headline-md text-headline-md uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_6px_20px_-4px_rgba(211,47,47,0.5)] border-t border-white/20 cursor-pointer disabled:opacity-60"
                >
                  {isAuthenticating ? (
                    <>
                      <span className="material-symbols-outlined text-[20px] animate-spin">
                        progress_activity
                      </span>
                      <span>VERIFYING CRYPTOGRAPHIC TOKEN...</span>
                    </>
                  ) : (
                    <>
                      <span
                        className="material-symbols-outlined text-[20px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        vpn_key
                      </span>
                      <span>UNLOCK SCOREKEEPER CONSOLE</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Testing & Evaluation Bypass Section */}
            <div className="mt-6 pt-5 border-t border-white/10">
              <div className="text-center mb-3">
                <span className="font-label-caps text-label-caps tracking-widest uppercase text-secondary-fixed-dim">
                  TESTING &amp; EVALUATION BYPASS
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleQuickAuth("BSAT-TABLE-2026-088", "7788")}
                disabled={isAuthenticating}
                className="w-full bg-[#16202e] hover:bg-[#1d2a3d] border border-emerald-500/30 hover:border-emerald-500/60 rounded-lg p-2.5 flex items-center justify-center gap-2 transition-all group cursor-pointer disabled:opacity-60"
              >
                <span className="material-symbols-outlined text-emerald-400 text-[18px]">
                  verified_user
                </span>
                <span className="font-body-md text-body-md text-emerald-100 group-hover:text-white font-medium">
                  Quick Auth: Somchai Srivichai{" "}
                  <span className="text-emerald-400/80 font-mono text-body-sm">(BSAT #2026-088)</span>
                </span>
              </button>
            </div>

            {/* Quick Session Indicator */}
            <div className="mt-5 flex items-center justify-between text-secondary-fixed-dim text-[11px] font-label-caps border-t border-white/5 pt-3">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                STATION: ARENA-TABLE-COURT-A
              </span>
              <span className="text-secondary-fixed-dim uppercase tracking-wider">
                SYNC CLOCK: 24s PRO
              </span>
            </div>
          </div>
        </main>

        {/* Bottom System Status & Certifications */}
        <footer className="w-full relative z-20 py-space-sm border-t border-white/10 bg-[#090d16]">
          <div className="max-w-7xl mx-auto px-gutter-desktop flex flex-col sm:flex-row justify-between items-center gap-2 text-center sm:text-left">
            {/* Integrity Protocol Badge */}
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="font-label-caps text-label-caps tracking-widest uppercase text-emerald-400">
                FIBA INTEGRITY PROTOCOL ACTIVE v4.2.8 // SEC-ENCRYPTED
              </span>
            </div>

            {/* Verification Specs */}
            <div className="flex items-center gap-4 text-secondary-fixed-dim font-label-caps text-label-caps">
              <span>BSAT CERTIFIED #2026</span>
              <span>•</span>
              <span>SHA-256 TABLE SESSION</span>
              <span>•</span>
              <span>BANGKOK LOCAL 1000Hz SYNC</span>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  const homeOnCourt = match.homeTeam.roster.filter((p) => p.isOnCourt);
  const awayOnCourt = match.awayTeam.roster.filter((p) => p.isOnCourt);

  const activePlayerObj = selectedPlayer
    ? [...match.homeTeam.roster, ...match.awayTeam.roster].find(
        (p) => p.athleteId === selectedPlayer.athleteId
      )
    : null;

  return (
    <div className="bg-background text-on-surface font-body-md text-body-md min-h-screen flex flex-col antialiased select-none">
      {/* ================= TOP OPERATOR HUD BAR ================= */}
      <header className="w-full bg-primary text-on-primary py-space-xs px-gutter-desktop shadow-md flex items-center justify-between z-30">
        <div className="flex items-center gap-space-md">
          <Link
            href="/"
            className="flex items-center gap-1 text-on-primary hover:bg-on-primary/10 px-2 py-1 rounded transition-colors font-headline-sm text-headline-sm uppercase tracking-wider"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            <span>HOME</span>
          </Link>
          <div className="h-5 w-px bg-on-primary/30 mx-1"></div>
          <div className="flex items-baseline gap-2">
            <span className="font-headline-md text-headline-md tracking-wider font-bold">
              STATCOURT.TH
            </span>
            <span className="bg-on-primary text-primary px-1.5 py-0.5 rounded font-label-badge text-label-badge uppercase tracking-widest font-extrabold">
              OFFICIAL TABLE CONSOLE
            </span>
          </div>
          <span className="text-on-primary/70 font-body-md text-body-md hidden xl:inline-block">
            | &nbsp; {match.tournamentName || "TOA Youth Basketball League Thailand 2026 - Quarterfinals"}
          </span>
        </div>

        {/* Right Operator Status / Telemetry */}
        <div className="flex items-center gap-space-md">
          {/* Live Broadcast to /live Stream link badge */}
          <Link
            href="/live"
            target="_blank"
            className="flex items-center gap-1.5 bg-red-950/80 hover:bg-red-900 border border-red-500/60 text-white px-3 py-1 rounded-full text-xs font-bold tracking-wider transition-all shadow-md shadow-red-950/40"
            title="เปิดหน้าผู้ชมถ่ายทอดสด /live เพื่อดูผลการ Broadcast แบบเรียลไทม์"
          >
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-red-300 font-mono text-[11px] uppercase">
              LIVE BROADCAST TO /LIVE
            </span>
          </Link>

          {/* Live Sync Badge with pending count & manual sync trigger */}
          {isOnline ? (
            <button
              onClick={() => syncPendingOfflineEvents()}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wider transition-colors border ${
                pendingSyncCount > 0
                  ? "bg-amber-950/80 border-amber-500/50 text-amber-300 hover:bg-amber-900"
                  : "bg-inverse-surface/60 border-inverse-surface text-on-primary"
              }`}
              title={pendingSyncCount > 0 ? "Click to force sync queued events" : "Connected & synchronized"}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  pendingSyncCount > 0 ? "bg-amber-400 animate-pulse" : "bg-emerald-400 pulse-indicator"
                }`}
              />
              <span className={`material-symbols-outlined text-sm ${pendingSyncCount > 0 ? "text-amber-400" : "text-emerald-400"}`}>
                {pendingSyncCount > 0 ? "sync" : "wifi"}
              </span>
              <span className={`font-label-caps text-label-caps uppercase tracking-wider ${pendingSyncCount > 0 ? "text-amber-300" : "text-emerald-300"}`}>
                {pendingSyncCount > 0 ? `${pendingSyncCount} PENDING SYNC` : "LIVE TABLE SYNC"}
              </span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 bg-red-950/80 border border-red-500/50 text-red-200 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wider">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="material-symbols-outlined text-red-400 text-sm">wifi_off</span>
              <span className="font-label-caps text-label-caps uppercase tracking-wider text-red-300">
                OFFLINE ({pendingSyncCount} QUEUED)
              </span>
            </div>
          )}

          {/* FIBA / BSAT Anti-Tamper Dispute Audit Trail Trigger */}
          <button
            onClick={() => setIsAuditModalOpen(true)}
            className="flex items-center gap-1.5 bg-slate-900/90 hover:bg-slate-800 border border-cyan-400/50 hover:border-cyan-300 text-cyan-200 px-3 py-1 rounded-full text-xs font-bold tracking-wider transition-all shadow-sm cursor-pointer"
            title="เปิดประวัติการตัดสินและ Audit Trail แบบ Anti-Tamper สำหรับข้อพิพาท FIBA/BSAT"
          >
            <span className="material-symbols-outlined text-cyan-400 text-[16px]">
              history_edu
            </span>
            <span className="font-mono text-[11px] uppercase tracking-wider">
              AUDIT TRAIL (BSAT)
            </span>
          </button>

          {/* Scorekeeper Profile Stamp */}
          <div className="flex items-center gap-2 border-l border-on-primary/20 pl-space-md">
            <span className="material-symbols-outlined text-on-primary/80">badge</span>
            <div className="text-right">
              <p className="font-body-sm text-body-sm leading-tight font-bold">
                {currentUser.name || "Somchai Srivichai"}
              </p>
              <p className="font-label-badge text-label-badge text-on-primary/75 tracking-wider">
                {currentUser.licenseNumber || "BSAT-TABLE-2026-088"}
              </p>
            </div>
            <button
              onClick={handleLogoutOfficial}
              className="p-1 hover:bg-on-primary/10 rounded transition-colors cursor-pointer"
              title="Lock console and sign out"
            >
              <span className="material-symbols-outlined text-sm">lock_open</span>
            </button>
          </div>
        </div>
      </header>

      {/* Notification Toast */}
      {notification && (
        <div className="bg-inverse-surface text-white text-xs px-gutter-desktop py-1 flex items-center justify-between border-b border-primary z-20">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-400 text-sm">info</span>
            <span className="font-body-sm">{notification}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-surface-dim hover:text-white text-xs uppercase font-label-caps cursor-pointer"
          >
            DISMISS
          </button>
        </div>
      )}

      {/* ================= JUMBO SCOREBOARD & GAME CLOCK PODIUM ================= */}
      <section className="w-full bg-surface-container-lowest border-b border-surface-container py-space-sm px-gutter-desktop shadow-sm">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-gutter-desktop">
          {/* HOME TEAM SUMMARY (BCC) */}
          <div className="flex items-center gap-space-md flex-1 justify-end">
            <div className="text-right">
              <p className="font-label-caps text-label-caps text-secondary font-bold tracking-widest uppercase">
                HOME
              </p>
              <h2 className="font-headline-lg text-headline-lg text-on-surface leading-none">
                {match.homeTeam.shortName}
              </h2>
              <div className="flex items-center justify-end gap-3 text-secondary font-body-sm text-body-sm mt-1">
                <span className="font-semibold">
                  FOULS: <b className="text-primary font-bold">3</b>
                </span>
                <span>
                  TO: <b className="text-on-surface font-bold">2</b>
                </span>
              </div>
            </div>
            {/* Big Crimson Score Tile */}
            <div className="w-20 h-16 bg-primary-container text-on-primary rounded-lg flex items-center justify-center font-headline-xl text-headline-xl leading-none shadow-md border-b-2 border-primary">
              <span>{match.homeScore}</span>
            </div>
          </div>

          {/* CENTER MATCH CHRONOMETER ENGINE */}
          <div className="bg-inverse-surface text-inverse-on-surface rounded-xl p-space-sm px-space-lg flex flex-col items-center justify-center shadow-lg border border-inverse-surface min-w-[340px]">
            {/* Quarter Tabs */}
            <div className="flex items-center gap-1 mb-1">
              {[1, 2, 3, 4].map((q) => (
                <button
                  key={q}
                  onClick={() => setQuarter(q)}
                  className={`px-2 py-0.5 rounded font-label-caps text-label-caps transition-colors cursor-pointer ${
                    match.currentQuarter === q
                      ? "bg-primary-container text-white font-bold tracking-wider"
                      : "text-surface-dim hover:text-white"
                  }`}
                >
                  Q{q}
                </button>
              ))}
              <button
                onClick={() => setQuarter(5)}
                className={`px-2 py-0.5 rounded font-label-caps text-label-caps transition-colors cursor-pointer ${
                  match.currentQuarter === 5
                    ? "bg-primary-container text-white font-bold tracking-wider"
                    : "text-surface-dim hover:text-white"
                }`}
              >
                OT
              </button>
              <span className="text-surface-variant font-label-badge text-label-badge tracking-widest pl-2">
                | QUARTER {match.currentQuarter <= 4 ? match.currentQuarter : "OT"}
              </span>
            </div>

            {/* Jumbo Digital LED Clock Display */}
            <div className="flex items-center gap-space-md">
              <div className="font-headline-xl text-headline-xl tracking-wider text-rose-400 font-extrabold select-all leading-none py-0.5 drop-shadow-[0_0_8px_rgba(244,63,94,0.4)]">
                <span>{formatClock(match.gameClockSec)}</span>
              </div>
              {/* Shot Clock Inset Box */}
              <div className="bg-black/70 border-2 border-amber-500/80 px-2.5 py-1 rounded text-center">
                <span className="block font-label-badge text-label-badge text-amber-400 leading-tight">
                  SHOT
                </span>
                <span className="font-title-stat text-title-stat text-amber-300 font-bold leading-none">
                  {shotClock}
                </span>
              </div>
            </div>

            {/* Clock Action Triggers */}
            <div className="flex items-center gap-2 mt-2 w-full justify-center">
              <button
                onClick={handleToggleClock}
                className={`flex-1 max-w-[130px] font-headline-sm text-headline-sm py-1 px-3 rounded flex items-center justify-center gap-1 tracking-wider shadow transition-all active:scale-95 cursor-pointer ${
                  isClockRunning
                    ? "bg-amber-600 hover:bg-amber-700 text-white"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white"
                }`}
              >
                <span
                  className="material-symbols-outlined text-sm"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {isClockRunning ? "pause" : "play_arrow"}
                </span>
                <span>{isClockRunning ? "HOLD / PAUSE" : "START CLOCK"}</span>
              </button>
              <button
                onClick={() => {
                  if (isClockRunning) handleToggleClock();
                }}
                title="Hold Clock"
                className="bg-tertiary-container hover:bg-tertiary text-on-tertiary-container font-headline-sm text-headline-sm py-1 px-2.5 rounded active:scale-95 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">pause</span>
              </button>
              <button
                onClick={() => handleSetShotClock(24)}
                title="Reset Shot Clock (24s)"
                className="bg-secondary/40 hover:bg-secondary text-white font-headline-sm text-headline-sm py-1 px-2 rounded active:scale-95 transition-all cursor-pointer flex items-center gap-0.5"
              >
                <span className="material-symbols-outlined text-sm">restart_alt</span>
                <span className="text-xs font-bold">24s</span>
              </button>
              <button
                onClick={() => handleSetShotClock(14)}
                title="Reset Shot Clock (14s offensive rebound)"
                className="bg-amber-600/40 hover:bg-amber-600 text-amber-200 hover:text-white font-headline-sm text-headline-sm py-1 px-2 rounded active:scale-95 transition-all cursor-pointer flex items-center gap-0.5"
              >
                <span className="text-xs font-bold">14s</span>
              </button>
            </div>
          </div>

          {/* AWAY TEAM SUMMARY (DS) */}
          <div className="flex items-center gap-space-md flex-1 justify-start">
            {/* Big Dark Blue Score Tile */}
            <div className="w-20 h-16 bg-inverse-surface text-inverse-on-surface rounded-lg flex items-center justify-center font-headline-xl text-headline-xl leading-none shadow-md border-b-2 border-secondary">
              <span>{match.awayScore}</span>
            </div>
            <div className="text-left">
              <p className="font-label-caps text-label-caps text-secondary font-bold tracking-widest uppercase">
                AWAY
              </p>
              <h2 className="font-headline-lg text-headline-lg text-on-surface leading-none">
                {match.awayTeam.shortName}
              </h2>
              <div className="flex items-center justify-start gap-3 text-secondary font-body-sm text-body-sm mt-1">
                <span className="font-semibold">
                  FOULS: <b className="text-secondary-fixed-dim font-bold">2</b>
                </span>
                <span>
                  TO: <b className="text-on-surface font-bold">3</b>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= ACTIVE TARGET PLAYER BANNER ================= */}
      <section className="bg-surface border-b border-surface-container py-1.5 px-gutter-desktop">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-space-sm">
            <span className="font-label-caps text-label-caps text-secondary font-bold tracking-wider">
              ACTIVE TARGET:
            </span>
            {selectedPlayer ? (
              <div className="flex items-center gap-2 bg-surface-container-lowest border border-primary px-3 py-1 rounded-md shadow-sm">
                <span className="bg-primary text-white font-headline-sm text-headline-sm px-1.5 py-0.2 rounded leading-none">
                  #{selectedPlayer.jerseyNumber}
                </span>
                <span className="font-headline-sm text-headline-sm text-on-surface uppercase tracking-wide">
                  {selectedPlayer.name}
                </span>
                <span className="text-secondary font-body-sm text-body-sm">
                  (
                  {selectedPlayer.teamId === match.homeTeamId
                    ? match.homeTeam.shortName
                    : match.awayTeam.shortName}{" "}
                  - {activePlayerObj?.position ? activePlayerObj.position.replace("_", " ") : "Point Guard"}
                  )
                </span>
                <span className="w-2 h-2 rounded-full bg-primary pulse-indicator ml-1"></span>
              </div>
            ) : (
              <span className="text-secondary font-body-sm italic">
                Tap any jersey below to change assignment target before recording action
              </span>
            )}
            <span className="text-secondary font-body-sm text-body-sm italic hidden md:inline ml-2">
              Tap any jersey below to change assignment target before recording action
            </span>
          </div>

          <div className="flex items-center gap-space-sm">
            <span className="font-label-badge text-label-badge text-secondary font-semibold">
              STATION ID:
            </span>
            <span className="bg-secondary-fixed text-on-secondary-fixed font-label-caps text-label-caps px-2 py-0.5 rounded font-mono">
              STC-TABLE-BKK-01
            </span>
          </div>
        </div>
      </section>

      {/* ================= MAIN 3-COLUMN OPERATOR ARENA ================= */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-gutter-desktop py-space-sm grid grid-cols-12 gap-space-md items-start">
        {/* ----------------- LEFT COLUMN: HOME TEAM 5 ON-COURT (BCC) ----------------- */}
        <aside className="col-span-12 lg:col-span-3 flex flex-col gap-2">
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-primary pb-1">
            <div>
              <span className="font-label-caps text-label-caps text-primary uppercase font-bold tracking-wider block">
                HOME TEAM (5 ON-COURT)
              </span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface">
                {match.homeTeam.name}
              </h3>
            </div>
            <span className="bg-primary-container text-on-primary-container px-2 py-0.5 font-label-badge text-label-badge rounded font-bold">
              {match.homeTeam.shortName}
            </span>
          </div>

          {/* Player Cards Feed (5 On-Court) */}
          <div className="flex flex-col gap-1.5 mt-1">
            {homeOnCourt.map((player) => {
              const isSelected = selectedPlayer?.athleteId === player.athleteId;
              return (
                <div
                  key={player.athleteId}
                  onClick={() => selectPlayer(match.homeTeamId, player.athleteId)}
                  className={`player-card cursor-pointer p-2.5 rounded-lg transition-all flex items-center justify-between group ${
                    isSelected
                      ? "active-card bg-surface-container-lowest border-2 border-primary shadow-sm"
                      : "bg-surface-container-lowest border border-outline-variant/60 shadow-sm hover:border-primary"
                  }`}
                >
                  <div className="flex items-center gap-space-sm">
                    <div
                      className={`w-10 h-10 rounded font-headline-md text-headline-md flex items-center justify-center font-bold ${
                        isSelected
                          ? "bg-primary-container text-white"
                          : "bg-secondary-fixed text-on-secondary-fixed"
                      }`}
                    >
                      #{player.jerseyNumber}
                    </div>
                    <div>
                      <p className="font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors leading-tight">
                        {player.firstName} {player.lastName}
                      </p>
                      <p className="font-label-badge text-label-badge text-secondary uppercase">
                        {player.position.replace("_", " ")} | {player.heightCm}CM
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-headline-sm text-headline-sm text-on-surface block font-bold">
                      {player.points} PTS
                    </span>
                    <span
                      className={`font-label-badge text-label-badge ${
                        player.fouls >= 4
                          ? "text-red-600 font-bold"
                          : player.fouls > 0
                          ? "text-primary font-bold"
                          : "text-secondary"
                      }`}
                    >
                      {player.fouls} FOULS
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-1 flex items-center justify-between p-2 bg-surface-container-low rounded border border-surface-container text-xs text-secondary font-medium">
            <span>
              Substitutions Queue: <b>3 Pending</b>
            </span>
            <button
              onClick={() => {
                setNotification("Substitutions queue opened for BCC bench");
                setTimeout(() => setNotification(null), 2500);
              }}
              className="text-primary hover:underline font-bold uppercase text-label-badge cursor-pointer"
            >
              Quick Sub [F4]
            </button>
          </div>
        </aside>

        {/* ----------------- CENTER COLUMN: OFFICIAL ACTION MATRIX ----------------- */}
        <section className="col-span-12 lg:col-span-6 flex flex-col gap-2">
          {/* Section Tag */}
          <div className="flex items-center justify-between border-b border-surface-container pb-1">
            <span className="font-label-caps text-label-caps text-on-surface font-bold tracking-wider uppercase flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-sm">touch_app</span>
              OFFICIAL COURTSIDE ACTION MATRIX
            </span>
            <span className="font-label-badge text-label-badge text-secondary">
              TOUCH TO LOG STAT • INSTANT FIBA DISPATCH
            </span>
          </div>

          {/* Action Button Grid (5 Rows x 3 Columns) */}
          <div className="grid grid-cols-3 gap-2 mt-1">
            {/* ROW 1: SCORING (MADE SHOTS) */}
            <button
              onClick={() => handleActionClick("FREE_THROW_MADE", "+1 Free Throw Made")}
              className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white p-3 rounded-lg flex flex-col items-center justify-center shadow transition-transform cursor-pointer"
            >
              <span className="font-headline-lg text-headline-lg leading-none">+1 FT</span>
              <span className="font-label-badge text-label-badge uppercase tracking-wider mt-1 opacity-90">
                FREE THROW MADE
              </span>
            </button>

            <button
              onClick={() => handleActionClick("TWO_POINT_MADE", "+2 Field Goal Made")}
              className="bg-primary-container hover:bg-primary active:scale-95 text-white p-3 rounded-lg flex flex-col items-center justify-center shadow transition-transform cursor-pointer"
            >
              <span className="font-headline-lg text-headline-lg leading-none">+2 PTS</span>
              <span className="font-label-badge text-label-badge uppercase tracking-wider mt-1 opacity-90">
                FIELD GOAL MADE
              </span>
            </button>

            <button
              onClick={() => handleActionClick("THREE_POINT_MADE", "+3 Three Pointer Made")}
              className="bg-primary hover:bg-on-primary-fixed-variant active:scale-95 text-white p-3 rounded-lg flex flex-col items-center justify-center shadow transition-transform cursor-pointer"
            >
              <span className="font-headline-lg text-headline-lg leading-none">+3 PTS</span>
              <span className="font-label-badge text-label-badge uppercase tracking-wider mt-1 opacity-90">
                THREE POINTER MADE
              </span>
            </button>

            {/* ROW 2: SHOT ATTEMPTS (MISSED) */}
            <button
              onClick={() => handleActionClick("TWO_POINT_MISSED", "Missed 2PT")}
              className="bg-surface-container-lowest hover:bg-surface-container-high active:scale-95 border border-outline-variant/80 text-on-surface p-3 rounded-lg flex flex-col items-center justify-center shadow-sm transition-transform cursor-pointer"
            >
              <span className="font-headline-md text-headline-md leading-none text-secondary">
                MISS 2PT
              </span>
              <span className="font-label-badge text-label-badge uppercase tracking-wider text-secondary mt-1">
                2-Point Attempt
              </span>
            </button>

            <button
              onClick={() => handleActionClick("THREE_POINT_MISSED", "Missed 3PT")}
              className="bg-surface-container-lowest hover:bg-surface-container-high active:scale-95 border border-outline-variant/80 text-on-surface p-3 rounded-lg flex flex-col items-center justify-center shadow-sm transition-transform cursor-pointer"
            >
              <span className="font-headline-md text-headline-md leading-none text-secondary">
                MISS 3PT
              </span>
              <span className="font-label-badge text-label-badge uppercase tracking-wider text-secondary mt-1">
                3-Point Attempt
              </span>
            </button>

            <button
              onClick={() => handleActionClick("FREE_THROW_MISSED", "Missed Free Throw")}
              className="bg-surface-container-lowest hover:bg-surface-container-high active:scale-95 border border-outline-variant/80 text-on-surface p-3 rounded-lg flex flex-col items-center justify-center shadow-sm transition-transform cursor-pointer"
            >
              <span className="font-headline-md text-headline-md leading-none text-secondary">
                MISS FT
              </span>
              <span className="font-label-badge text-label-badge uppercase tracking-wider text-secondary mt-1">
                Free Throw Miss
              </span>
            </button>

            {/* ROW 3: REBOUNDS & PLAYMAKING */}
            <button
              onClick={() => handleActionClick("OFFENSIVE_REBOUND", "Offensive Rebound")}
              className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white p-3 rounded-lg flex flex-col items-center justify-center shadow transition-transform cursor-pointer"
            >
              <span className="font-headline-md text-headline-md leading-none">OFF REB</span>
              <span className="font-label-badge text-label-badge uppercase tracking-wider mt-1 opacity-90">
                Offensive Board
              </span>
            </button>

            <button
              onClick={() => handleActionClick("DEFENSIVE_REBOUND", "Defensive Rebound")}
              className="bg-blue-800 hover:bg-blue-900 active:scale-95 text-white p-3 rounded-lg flex flex-col items-center justify-center shadow transition-transform cursor-pointer"
            >
              <span className="font-headline-md text-headline-md leading-none">DEF REB</span>
              <span className="font-label-badge text-label-badge uppercase tracking-wider mt-1 opacity-90">
                Defensive Board
              </span>
            </button>

            <button
              onClick={() => handleActionClick("ASSIST", "Assist Credited")}
              className="bg-teal-700 hover:bg-teal-800 active:scale-95 text-white p-3 rounded-lg flex flex-col items-center justify-center shadow transition-transform cursor-pointer"
            >
              <span className="font-headline-md text-headline-md leading-none">AST</span>
              <span className="font-label-badge text-label-badge uppercase tracking-wider mt-1 opacity-90">
                Assist
              </span>
            </button>

            {/* ROW 4: DEFENSIVE & TURNOVERS */}
            <button
              onClick={() => handleActionClick("STEAL", "Steal")}
              className="bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white p-3 rounded-lg flex flex-col items-center justify-center shadow transition-transform cursor-pointer"
            >
              <span className="font-headline-md text-headline-md leading-none">STL</span>
              <span className="font-label-badge text-label-badge uppercase tracking-wider mt-1 opacity-90">
                Steal
              </span>
            </button>

            <button
              onClick={() => handleActionClick("BLOCK", "Shot Block")}
              className="bg-cyan-700 hover:bg-cyan-800 active:scale-95 text-white p-3 rounded-lg flex flex-col items-center justify-center shadow transition-transform cursor-pointer"
            >
              <span className="font-headline-md text-headline-md leading-none">BLK</span>
              <span className="font-label-badge text-label-badge uppercase tracking-wider mt-1 opacity-90">
                Shot Block
              </span>
            </button>

            <button
              onClick={() => handleActionClick("TURNOVER", "Turnover Committed")}
              className="bg-amber-600 hover:bg-amber-700 active:scale-95 text-white p-3 rounded-lg flex flex-col items-center justify-center shadow transition-transform cursor-pointer"
            >
              <span className="font-headline-md text-headline-md leading-none">TO</span>
              <span className="font-label-badge text-label-badge uppercase tracking-wider mt-1 opacity-90">
                Turnover
              </span>
            </button>
          </div>

          {/* ROW 5: FOULS MATRIX (Full Width Span) */}
          <div className="grid grid-cols-2 gap-2 mt-1">
            <button
              onClick={() => handleActionClick("PERSONAL_FOUL", "Personal Foul Added")}
              className="bg-primary hover:bg-on-primary-fixed-variant active:scale-95 text-white p-3 rounded-lg flex flex-col items-center justify-center shadow transition-transform cursor-pointer"
            >
              <span className="font-headline-md text-headline-md leading-none">PERSONAL FOUL</span>
              <span className="font-label-badge text-label-badge uppercase tracking-wider mt-1 opacity-90">
                Player Foul Call (+1 FL)
              </span>
            </button>

            <button
              onClick={() => handleActionClick("TECHNICAL_FOUL", "Technical / Bench Foul")}
              className="bg-purple-800 hover:bg-purple-900 active:scale-95 text-white p-3 rounded-lg flex flex-col items-center justify-center shadow transition-transform cursor-pointer"
            >
              <span className="font-headline-md text-headline-md leading-none">TECH FOUL</span>
              <span className="font-label-badge text-label-badge uppercase tracking-wider mt-1 opacity-90">
                Bench / Tech Violation
              </span>
            </button>
          </div>

          {/* Tactical Matrix Sub-Controls */}
          <div className="bg-surface-container-low p-2 rounded-lg border border-surface-container flex items-center justify-between text-xs mt-1">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-sm">cloud_upload</span>
              <span className="font-body-sm text-body-sm text-secondary">
                Last event synced at:{" "}
                <b className="text-on-surface">
                  Q{match.currentQuarter} | Clock: {formatClock(match.gameClockSec)}
                  {notification ? ` (${notification})` : ""}
                </b>
              </span>
            </div>
            <Link
              href={`/matches/${match.id}/film`}
              className="text-primary hover:underline font-bold text-label-caps uppercase flex items-center gap-1"
            >
              <span>Review Match Film &amp; Event Timestamps</span>
              <span className="material-symbols-outlined text-xs">chevron_right</span>
            </Link>
          </div>
        </section>

        {/* ----------------- RIGHT COLUMN: AWAY TEAM 5 ON-COURT (DS) ----------------- */}
        <aside className="col-span-12 lg:col-span-3 flex flex-col gap-2">
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-secondary pb-1">
            <div>
              <span className="font-label-caps text-label-caps text-secondary uppercase font-bold tracking-wider block">
                AWAY TEAM (5 ON-COURT)
              </span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface">
                {match.awayTeam.name}
              </h3>
            </div>
            <span className="bg-inverse-surface text-inverse-on-surface px-2 py-0.5 font-label-badge text-label-badge rounded font-bold">
              {match.awayTeam.shortName}
            </span>
          </div>

          {/* Player Cards Feed (5 On-Court) */}
          <div className="flex flex-col gap-1.5 mt-1">
            {awayOnCourt.map((player) => {
              const isSelected = selectedPlayer?.athleteId === player.athleteId;
              return (
                <div
                  key={player.athleteId}
                  onClick={() => selectPlayer(match.awayTeamId, player.athleteId)}
                  className={`player-card cursor-pointer p-2.5 rounded-lg transition-all flex items-center justify-between group ${
                    isSelected
                      ? "active-card bg-surface-container-lowest border-2 border-inverse-surface shadow-sm"
                      : "bg-surface-container-lowest border border-outline-variant/60 shadow-sm hover:border-inverse-surface"
                  }`}
                >
                  <div className="flex items-center gap-space-sm">
                    <div
                      className={`w-10 h-10 rounded font-headline-md text-headline-md flex items-center justify-center font-bold ${
                        isSelected
                          ? "bg-inverse-surface text-white"
                          : "bg-secondary-fixed text-on-secondary-fixed"
                      }`}
                    >
                      #{player.jerseyNumber}
                    </div>
                    <div>
                      <p className="font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors leading-tight">
                        {player.firstName} {player.lastName}
                      </p>
                      <p className="font-label-badge text-label-badge text-secondary uppercase">
                        {player.position.replace("_", " ")} | {player.heightCm}CM
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-headline-sm text-headline-sm text-on-surface block font-bold">
                      {player.points} PTS
                    </span>
                    <span
                      className={`font-label-badge text-label-badge ${
                        player.fouls >= 4
                          ? "text-red-600 font-bold"
                          : "text-secondary"
                      }`}
                    >
                      {player.fouls} FOULS
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-1 flex items-center justify-between p-2 bg-surface-container-low rounded border border-surface-container text-xs text-secondary font-medium">
            <span>
              Substitutions Queue: <b>1 Pending</b>
            </span>
            <button
              onClick={() => {
                setNotification("Substitutions queue opened for Debsirin bench");
                setTimeout(() => setNotification(null), 2500);
              }}
              className="text-on-surface hover:underline font-bold uppercase text-label-badge cursor-pointer"
            >
              Quick Sub [F5]
            </button>
          </div>
        </aside>
      </main>

      {/* ================= 60-SECOND ACTION REVERSAL RAIL (UNDO DOCK) ================= */}
      <footer className="w-full bg-inverse-surface text-inverse-on-surface py-2 px-gutter-desktop border-t border-inverse-surface z-20">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Reversal Rail Intro */}
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-fixed-dim text-lg">history</span>
            <div className="flex items-baseline gap-2">
              <span className="font-headline-sm text-headline-sm text-primary-fixed font-bold tracking-wide">
                60-SECOND ACTION REVERSAL RAIL
              </span>
              <span className="text-surface-dim font-body-sm text-body-sm hidden sm:inline">
                Last 5 official table events — undo within 60s
              </span>
            </div>
          </div>

          {/* Recent Event Pills Horizontal Feed */}
          <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 md:pb-0">
            {reversalRail.length === 0 ? (
              <span className="text-xs text-surface-dim italic">
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
                    className={`flex items-center gap-1.5 bg-black/40 border border-outline/30 px-2.5 py-1 rounded text-xs shrink-0 ${
                      isReversible ? "opacity-100" : "opacity-50"
                    }`}
                  >
                    <span className="text-primary-fixed font-bold">
                      #{item.event.jerseyNumber}
                    </span>
                    <span className="text-white uppercase">
                      {item.event.eventType.replace(/_/g, " ")}
                    </span>
                    <span className="text-surface-dim text-[10px]">
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
            className="bg-rose-950/80 hover:bg-rose-900 disabled:opacity-50 text-rose-200 border border-rose-700/60 font-label-caps text-label-caps uppercase px-3 py-1.5 rounded flex items-center gap-1 active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-sm">undo</span>
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
    </div>
  );
}


"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Filter,
  Film,
  CheckCircle2,
  Clock,
  Shield,
  User,
  SlidersHorizontal,
  Lock,
  Sparkles,
  X,
} from "lucide-react";
import { MatchEvent } from "@/lib/types";
import { useAuthStore } from "@/lib/auth/useAuthStore";
import PricingModal from "@/components/premium/PricingModal";
import ProBadge from "@/components/premium/ProBadge";
import { getMaxDailyVideoClips } from "@/lib/permissions";

interface GameFilmPlayerProps {
  videoUrl?: string | null;
  events: MatchEvent[];
  homeTeamName: string;
  awayTeamName: string;
  matchTitle: string;
}

export default function GameFilmPlayer({
  videoUrl,
  events,
  homeTeamName,
  awayTeamName,
  matchTitle,
}: GameFilmPlayerProps) {
  const { currentUser } = useAuthStore();
  const isPro = currentUser.tier === "PRO";
  const maxClips = getMaxDailyVideoClips(currentUser.tier);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(360); // fallback 6-minute sample duration
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Freemium clip tracking state (starts at 4 so next click demonstrates limit in Free mode)
  const [clipsWatchedCount, setClipsWatchedCount] = useState<number>(4);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [showQuotaWarning, setShowQuotaWarning] = useState(false);

  // Filter Drawer state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [playerFilter, setPlayerFilter] = useState<string>("ALL");
  const [eventTypeFilter, setEventTypeFilter] = useState<string>("ALL");

  // Fallback demo clip if no video URL is provided
  const activeVideoUrl =
    videoUrl ||
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4";

  // Unique players and event types for filter options
  const players = Array.from(
    new Set(
      events
        .filter((e) => e.athleteName && e.jerseyNumber !== undefined)
        .map((e) => JSON.stringify({ name: e.athleteName, jersey: e.jerseyNumber }))
    )
  ).map((str) => JSON.parse(str) as { name: string; jersey: number });

  // Filter markers based on drawer selections
  const filteredEvents = events.filter((ev) => {
    if (playerFilter !== "ALL" && ev.jerseyNumber?.toString() !== playerFilter) {
      return false;
    }
    if (eventTypeFilter === "3PT" && ev.eventType !== "THREE_POINT_MADE") {
      return false;
    }
    if (eventTypeFilter === "AST" && ev.eventType !== "ASSIST") {
      return false;
    }
    if (
      eventTypeFilter === "DEF" &&
      ev.eventType !== "BLOCK" &&
      ev.eventType !== "STEAL"
    ) {
      return false;
    }
    return true;
  });

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleReplay8s = () => {
    if (!videoRef.current) return;
    const target = Math.max(0, videoRef.current.currentTime - 8);
    videoRef.current.currentTime = target;
    videoRef.current.play();
    setIsPlaying(true);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current && videoRef.current.duration) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    setCurrentTime(targetTime);
    if (videoRef.current) {
      videoRef.current.currentTime = targetTime;
    }
  };

  // Requirement: Selecting any event marker seeks playback directly to max(0, event.videoElapsedSec - 8) seconds
  const handleMarkerClick = (event: MatchEvent) => {
    if (!isPro && clipsWatchedCount >= maxClips) {
      setShowQuotaWarning(true);
      return;
    }

    if (!videoRef.current) return;
    const targetSec = Math.max(0, (event.videoElapsedSec ?? 0) - 8);
    videoRef.current.currentTime = targetSec;
    videoRef.current.play();
    setIsPlaying(true);
    setSelectedEventId(event.id);
    if (!isPro) {
      setClipsWatchedCount((prev) => prev + 1);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen().catch(console.error);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const newMuted = !isMuted;
    videoRef.current.muted = newMuted;
    setIsMuted(newMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (videoRef.current) {
      videoRef.current.volume = newVol;
      setIsMuted(newVol === 0);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Marker Color Coding:
  // Brand Crimson: 3PT scoring plays
  // Slate: Assists
  // Emerald: Blocks and Steals
  const getMarkerColor = (eventType: string) => {
    if (eventType === "THREE_POINT_MADE") return "bg-[#AF101A] ring-rose-300";
    if (eventType === "ASSIST") return "bg-slate-600 ring-slate-300";
    if (eventType === "BLOCK" || eventType === "STEAL")
      return "bg-[#15803D] ring-emerald-300";
    return "bg-amber-500 ring-amber-200";
  };

  const getEventLabel = (eventType: string) => {
    switch (eventType) {
      case "THREE_POINT_MADE":
        return "ยิง 3 แต้มลง";
      case "TWO_POINT_MADE":
        return "ยิง 2 แต้มลง";
      case "ASSIST":
        return "แอสซิสต์";
      case "BLOCK":
        return "บล็อก";
      case "STEAL":
        return "สตีล";
      case "REBOUND":
        return "รีบาวด์";
      case "FREE_THROW_MADE":
        return "ลูกโทษลง";
      case "FOUL":
        return "ฟาวล์";
      case "TURNOVER":
        return "เทิร์นโอเวอร์";
      default:
        return eventType.replace(/_/g, " ");
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative bg-[#0B1C30] rounded-2xl overflow-hidden shadow-2xl border border-slate-800 text-white flex flex-col select-none font-sans"
    >
      {/* Video Viewport Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-[#0B1C30]/95 via-[#0B1C30]/70 to-transparent p-4 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2.5">
          <span className="bg-[#AF101A] text-white text-[10px] font-black tracking-wider px-2 py-0.5 rounded shadow-xs">
            VERIFIED FILM
          </span>
          <span className="text-xs font-bold text-white tracking-wide truncate max-w-sm">
            {matchTitle}
          </span>
          <span className="text-xs text-slate-300 hidden sm:inline">
            ({homeTeamName} พบ {awayTeamName})
          </span>
        </div>

        {/* Top Bar Actions: Freemium Quota Counter & Filter Button */}
        <div className="flex items-center gap-2">
          {!isPro ? (
            <button
              onClick={() => setIsPricingModalOpen(true)}
              className="flex items-center gap-1.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-300 px-3 py-1.5 rounded-xl text-xs transition cursor-pointer"
              title="ดูรายละเอียดการอัปเกรด"
            >
              <span className="text-[10px] text-amber-400 font-bold">โควตาฟรี:</span>
              <span className="font-bold text-white tabular-nums">{clipsWatchedCount}/{maxClips} คลิป</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400 ml-0.5" />
            </button>
          ) : (
            <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-xl text-xs">
              <ProBadge size="sm" variant="amber" label="UNLIMITED FILM" />
            </div>
          )}

          {/* Filter Drawer Toggle Button */}
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border transition cursor-pointer ${
              isFilterOpen || playerFilter !== "ALL" || eventTypeFilter !== "ALL"
                ? "bg-[#AF101A] border-[#AF101A] text-white shadow"
                : "bg-slate-900/80 border-slate-700 text-slate-300 hover:text-white"
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>ตัวกรองเพลย์</span>
            {(playerFilter !== "ALL" || eventTypeFilter !== "ALL") && (
              <span className="w-2 h-2 rounded-full bg-white"></span>
            )}
          </button>
        </div>
      </div>

      {/* Filter Drawer Overlay */}
      {isFilterOpen && (
        <div className="absolute top-14 right-4 z-30 w-72 bg-[#0B1C30]/95 backdrop-blur-md border border-slate-700 rounded-2xl p-4 shadow-2xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
              <SlidersHorizontal className="w-3.5 h-3.5 text-rose-400" />
              <span>ตัวกรองเหตุการณ์ไทม์ไลน์</span>
            </div>
            <button
              onClick={() => {
                setPlayerFilter("ALL");
                setEventTypeFilter("ALL");
              }}
              className="text-[11px] text-slate-400 hover:text-white underline cursor-pointer"
            >
              รีเซ็ต
            </button>
          </div>

          {/* Filter by Event Type */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1.5">
              ประเภทเหตุการณ์
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => setEventTypeFilter("ALL")}
                className={`text-xs px-2.5 py-1.5 rounded-lg text-left transition cursor-pointer ${
                  eventTypeFilter === "ALL"
                    ? "bg-slate-700 text-white font-bold"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                ทั้งหมด ({events.length})
              </button>
              <button
                onClick={() => setEventTypeFilter("3PT")}
                className={`text-xs px-2.5 py-1.5 rounded-lg text-left flex items-center gap-1.5 transition cursor-pointer ${
                  eventTypeFilter === "3PT"
                    ? "bg-[#AF101A] text-white font-bold"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                <span>ลูกยิง 3 แต้ม</span>
              </button>
              <button
                onClick={() => setEventTypeFilter("AST")}
                className={`text-xs px-2.5 py-1.5 rounded-lg text-left flex items-center gap-1.5 transition cursor-pointer ${
                  eventTypeFilter === "AST"
                    ? "bg-slate-600 text-white font-bold"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                <span>แอสซิสต์</span>
              </button>
              <button
                onClick={() => setEventTypeFilter("DEF")}
                className={`text-xs px-2.5 py-1.5 rounded-lg text-left flex items-center gap-1.5 transition cursor-pointer ${
                  eventTypeFilter === "DEF"
                    ? "bg-[#15803D] text-white font-bold"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>บล็อก / สตีล</span>
              </button>
            </div>
          </div>

          {/* Filter by Player */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1.5">
              เลือกเฉพาะนักกีฬา
            </label>
            <select
              value={playerFilter}
              onChange={(e) => setPlayerFilter(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#AF101A]"
            >
              <option value="ALL">นักกีฬาทุกคน</option>
              {players.map((p) => (
                <option key={p.jersey} value={p.jersey.toString()}>
                  #{p.jersey} {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2 text-[11px] text-slate-400 text-center border-t border-slate-800 tabular-nums">
            แสดง {filteredEvents.length} จากทั้งหมด {events.length} จังหวะ
          </div>
        </div>
      )}

      {/* Main Video Viewport */}
      <div className="relative aspect-video w-full bg-black flex items-center justify-center">
        <video
          ref={videoRef}
          src={activeVideoUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onClick={togglePlay}
          className="w-full h-full object-contain cursor-pointer"
          playsInline
        />

        {/* Center Play Watermark overlay when paused */}
        {!isPlaying && (
          <button
            onClick={togglePlay}
            className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-[#AF101A]/90 hover:bg-[#AF101A] text-white flex items-center justify-center shadow-2xl transition transform hover:scale-105 pointer-events-auto cursor-pointer"
            title="เล่นวิดีโอ"
          >
            <Play className="w-8 h-8 ml-1 fill-white" />
          </button>
        )}
      </div>

      {/* Scrubber Bar Container with Interactive Event Markers */}
      <div className="px-4 pt-3 pb-1 bg-slate-900 border-t border-slate-800">
        <div className="relative w-full h-7 flex items-center">
          {/* Main Scrubber Range Input */}
          <input
            type="range"
            min={0}
            max={duration || 360}
            step={0.1}
            value={currentTime}
            onChange={handleScrub}
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#AF101A] z-10"
          />

          {/* Timeline Event Markers Overlay along Scrubber */}
          <div className="absolute inset-x-0 h-4 pointer-events-none flex items-center">
            {filteredEvents.map((ev) => {
              if (ev.videoElapsedSec === undefined || ev.videoElapsedSec === null)
                return null;
              const percent = Math.min(
                100,
                Math.max(0, (ev.videoElapsedSec / (duration || 360)) * 100)
              );
              const isSelected = selectedEventId === ev.id;
              const colorClass = getMarkerColor(ev.eventType);

              return (
                <button
                  key={ev.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkerClick(ev);
                  }}
                  style={{ left: `${percent}%` }}
                  title={`ไปยัง: #${ev.jerseyNumber} ${ev.athleteName} - ${getEventLabel(ev.eventType)} (-8 วิ)`}
                  className={`pointer-events-auto absolute -top-1 -ml-2 w-4 h-4 rounded-full border border-white shadow-md transition-transform hover:scale-150 z-20 cursor-pointer ${colorClass} ${
                    isSelected ? "ring-4 scale-125" : ""
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* Legend for Markers */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 pb-1">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#AF101A] border border-white"></span>
              <span>ลูกยิง 3 แต้ม</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-500 border border-white"></span>
              <span>แอสซิสต์</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#15803D] border border-white"></span>
              <span>บล็อก / สตีล</span>
            </span>
          </div>

          <div className="tabular-nums text-xs text-slate-300 font-medium">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>
      </div>

      {/* SVG Player Controls Bar */}
      <div className="px-4 py-2.5 bg-[#0B1C30] flex items-center justify-between border-t border-slate-900">
        {/* Playback Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={togglePlay}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition cursor-pointer"
            title={isPlaying ? "หยุดชั่วคราว" : "เล่น"}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-white" />
            ) : (
              <Play className="w-4 h-4 fill-white ml-0.5" />
            )}
          </button>

          <button
            onClick={handleReplay8s}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition cursor-pointer"
            title="ย้อนหลัง 8 วินาที"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
            <span className="font-semibold">ย้อนหลัง 8 วิ</span>
          </button>

          {/* Volume Control */}
          <div className="flex items-center gap-2 ml-2">
            <button
              onClick={toggleMute}
              className="p-2 text-slate-400 hover:text-white transition cursor-pointer"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-16 h-1 bg-slate-700 rounded appearance-none accent-[#AF101A] cursor-pointer hidden sm:block"
            />
          </div>
        </div>

        {/* Selected Event Tag & Fullscreen */}
        <div className="flex items-center gap-3">
          {selectedEventId && (
            <div className="hidden md:flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1 rounded-xl text-xs">
              <Clock className="w-3.5 h-3.5 text-rose-400" />
              <span className="text-slate-300">
                เล่นจังหวะนี้: ย้อนหลัง 8 วินาทีล่วงหน้า
              </span>
            </div>
          )}

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            title="เต็มจอ"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Clickable Event Highlights Ticker */}
      <div className="bg-slate-900 border-t border-slate-800 px-4 py-2.5 flex items-center gap-2 overflow-x-auto">
        <span className="text-[11px] font-bold text-slate-400 shrink-0">
          เลือกดูจังหวะ:
        </span>
        {filteredEvents.map((ev) => (
          <button
            key={ev.id}
            onClick={() => handleMarkerClick(ev)}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition border cursor-pointer ${
              selectedEventId === ev.id
                ? "bg-[#AF101A] border-[#AF101A] text-white shadow-xs"
                : "bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${getMarkerColor(
                ev.eventType
              )}`}
            />
            <span className="font-bold tabular-nums">#{ev.jerseyNumber}</span>
            <span className="truncate max-w-[120px] font-medium">{getEventLabel(ev.eventType)}</span>
            <span className="text-[11px] text-slate-400 tabular-nums">
              Q{ev.quarter} {ev.gameClockDisplay}
            </span>
          </button>
        ))}
      </div>

      {/* Freemium Clip Quota Warning Modal */}
      {showQuotaWarning && (
        <div className="fixed inset-0 z-50 bg-[#0B1C30]/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-700 max-w-md w-full p-6 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-950/80 border border-red-500/50 flex items-center justify-center text-rose-400">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">
                    ครบกำหนดโควตาชมคลิปฟรีรายวัน (5/5)
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    ถึงขีดจำกัดการรับชมคลิปสำหรับ Free Plan
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowQuotaWarning(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              ผู้ใช้งาน <strong>Free Plan</strong> สามารถรับชมคลิปเหตุการณ์ย้อนหลังได้ 5 คลิปต่อวัน เพื่อปลดล็อกการชมเทปย้อนหลังทั้งเกม (Full Season Match Film) และเข้าถึงฟิลเตอร์สเกาต์แบบไม่จำกัด กรุณาอัปเกรดเป็น <strong>StatCourtTH Pro</strong>
            </p>

            <div className="pt-2 flex items-center justify-end gap-2 text-xs">
              <button
                onClick={() => setShowQuotaWarning(false)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer font-semibold"
              >
                ปิด
              </button>
              <button
                onClick={() => {
                  setShowQuotaWarning(false);
                  setIsPricingModalOpen(true);
                }}
                className="px-5 py-2 rounded-xl font-bold bg-[#AF101A] hover:bg-[#8E0D15] active:scale-[0.98] text-white shadow-md flex items-center gap-1.5 transition cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>อัปเกรดเป็น PRO</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pricing Modal */}
      <PricingModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
        defaultPerspective="SCOUT"
      />
    </div>
  );
}

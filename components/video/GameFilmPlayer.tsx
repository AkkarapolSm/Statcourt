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
  // Red: 3PT scoring plays
  // Slate: Assists
  // Green: Blocks and Steals
  const getMarkerColor = (eventType: string) => {
    if (eventType === "THREE_POINT_MADE") return "bg-red-600 ring-red-300";
    if (eventType === "ASSIST") return "bg-slate-600 ring-slate-300";
    if (eventType === "BLOCK" || eventType === "STEAL")
      return "bg-emerald-600 ring-emerald-300";
    return "bg-amber-500 ring-amber-200";
  };

  return (
    <div
      ref={containerRef}
      className="relative bg-slate-950 rounded-xl overflow-hidden shadow-2xl border border-slate-800 text-white flex flex-col select-none"
    >
      {/* Video Viewport Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-slate-950/90 to-transparent p-4 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2.5">
          <span className="bg-brand-primary text-white text-[10px] font-black tracking-widest px-2 py-0.5 rounded font-mono">
            VERIFIED FILM
          </span>
          <span className="text-xs font-bold text-white tracking-wide truncate max-w-sm">
            {matchTitle}
          </span>
          <span className="text-xs text-slate-400 font-mono hidden sm:inline">
            ({homeTeamName} vs {awayTeamName})
          </span>
        </div>

        {/* Top Bar Actions: Freemium Quota Counter & Filter Button */}
        <div className="flex items-center gap-2">
          {!isPro ? (
            <button
              onClick={() => setIsPricingModalOpen(true)}
              className="flex items-center gap-1.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-300 px-2.5 py-1.5 rounded-lg text-xs font-mono transition"
              title="Click to view upgrade options"
            >
              <span className="text-[10px] text-amber-400 font-bold">FREE QUOTA:</span>
              <span className="font-bold text-white">{clipsWatchedCount}/{maxClips} CLIPS</span>
              <Sparkles className="w-3 h-3 text-amber-400 ml-0.5" />
            </button>
          ) : (
            <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-lg text-xs font-mono">
              <ProBadge size="sm" variant="amber" label="UNLIMITED FILM" />
            </div>
          )}

          {/* Filter Drawer Toggle Button */}
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition ${
              isFilterOpen || playerFilter !== "ALL" || eventTypeFilter !== "ALL"
                ? "bg-brand-primary border-red-500 text-white shadow"
                : "bg-slate-900/80 border-slate-700 text-slate-300 hover:text-white"
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>FILTER CLIPS</span>
            {(playerFilter !== "ALL" || eventTypeFilter !== "ALL") && (
              <span className="w-2 h-2 rounded-full bg-white"></span>
            )}
          </button>
        </div>
      </div>

      {/* Filter Drawer Overlay */}
      {isFilterOpen && (
        <div className="absolute top-14 right-4 z-30 w-72 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl p-4 shadow-2xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
              <SlidersHorizontal className="w-3.5 h-3.5 text-brand-signal" />
              <span>TIMELINE EVENT FILTERS</span>
            </div>
            <button
              onClick={() => {
                setPlayerFilter("ALL");
                setEventTypeFilter("ALL");
              }}
              className="text-[11px] text-slate-400 hover:text-white font-mono"
            >
              RESET
            </button>
          </div>

          {/* Filter by Event Type */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1 uppercase tracking-wider">
              Play Event Type
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => setEventTypeFilter("ALL")}
                className={`text-xs px-2 py-1 rounded text-left ${
                  eventTypeFilter === "ALL"
                    ? "bg-slate-700 text-white font-bold"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                All Events ({events.length})
              </button>
              <button
                onClick={() => setEventTypeFilter("3PT")}
                className={`text-xs px-2 py-1 rounded text-left flex items-center gap-1.5 ${
                  eventTypeFilter === "3PT"
                    ? "bg-brand-primary text-white font-bold"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                <span>3-Pointers</span>
              </button>
              <button
                onClick={() => setEventTypeFilter("AST")}
                className={`text-xs px-2 py-1 rounded text-left flex items-center gap-1.5 ${
                  eventTypeFilter === "AST"
                    ? "bg-slate-600 text-white font-bold"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                <span>Assists</span>
              </button>
              <button
                onClick={() => setEventTypeFilter("DEF")}
                className={`text-xs px-2 py-1 rounded text-left flex items-center gap-1.5 ${
                  eventTypeFilter === "DEF"
                    ? "bg-emerald-600 text-white font-bold"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Blocks/Steals</span>
              </button>
            </div>
          </div>

          {/* Filter by Player */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1 uppercase tracking-wider">
              Filter by Athlete
            </label>
            <select
              value={playerFilter}
              onChange={(e) => setPlayerFilter(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-brand-primary"
            >
              <option value="ALL">All Players</option>
              {players.map((p) => (
                <option key={p.jersey} value={p.jersey.toString()}>
                  #{p.jersey} {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2 text-[10px] text-slate-400 font-mono text-center border-t border-slate-800">
            Showing {filteredEvents.length} of {events.length} verified events
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
            className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-brand-primary/90 hover:bg-brand-primary text-white flex items-center justify-center shadow-2xl transition transform hover:scale-105 pointer-events-auto"
            title="Play Video"
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
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-600 z-10"
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
                  title={`Seek: #${ev.jerseyNumber} ${ev.athleteName} - ${ev.eventType} (-8s replay)`}
                  className={`pointer-events-auto absolute -top-1 -ml-2 w-4 h-4 rounded-full border border-white shadow-md transition-transform hover:scale-150 z-20 ${colorClass} ${
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
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 border border-white"></span>
              <span>Three-Point Made</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-500 border border-white"></span>
              <span>Assist</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 border border-white"></span>
              <span>Block / Steal</span>
            </span>
          </div>

          <div className="font-mono text-xs text-slate-300">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>
      </div>

      {/* SVG Player Controls Bar */}
      <div className="px-4 py-2.5 bg-slate-950 flex items-center justify-between border-t border-slate-900">
        {/* Playback Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={togglePlay}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-white" />
            ) : (
              <Play className="w-4 h-4 fill-white ml-0.5" />
            )}
          </button>

          <button
            onClick={handleReplay8s}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-mono transition"
            title="Replay previous 8 seconds"
          >
            <RotateCcw className="w-3.5 h-3.5 text-brand-signal" />
            <span>8s REPLAY</span>
          </button>

          {/* Volume Control */}
          <div className="flex items-center gap-2 ml-2">
            <button
              onClick={toggleMute}
              className="p-2 text-slate-400 hover:text-white transition"
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
              className="w-16 h-1 bg-slate-700 rounded appearance-none accent-red-600 cursor-pointer hidden sm:block"
            />
          </div>
        </div>

        {/* Selected Event Tag & Fullscreen */}
        <div className="flex items-center gap-3">
          {selectedEventId && (
            <div className="hidden md:flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1 rounded-md text-xs font-mono">
              <Clock className="w-3.5 h-3.5 text-brand-signal" />
              <span className="text-slate-300">
                Seek Play: -8s lead-in anchored
              </span>
            </div>
          )}

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
            title="Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Clickable Event Highlights Ticker */}
      <div className="bg-slate-900 border-t border-slate-800 px-4 py-2.5 flex items-center gap-2 overflow-x-auto">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0 font-mono">
          SEEK TO PLAY:
        </span>
        {filteredEvents.map((ev) => (
          <button
            key={ev.id}
            onClick={() => handleMarkerClick(ev)}
            className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono transition border ${
              selectedEventId === ev.id
                ? "bg-brand-primary border-red-500 text-white"
                : "bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${getMarkerColor(
                ev.eventType
              )}`}
            />
            <span className="font-bold">#{ev.jerseyNumber}</span>
            <span className="truncate max-w-[110px]">{ev.eventType.replace(/_/g, " ")}</span>
            <span className="text-[10px] text-slate-400">
              Q{ev.quarter} {ev.gameClockDisplay}
            </span>
          </button>
        ))}
      </div>

      {/* Freemium Clip Quota Warning Modal */}
      {showQuotaWarning && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-700 max-w-md w-full p-6 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-red-950/80 border border-red-500/50 flex items-center justify-center text-red-400">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-white font-mono">
                    FREE FILM QUOTA EXCEEDED (5/5)
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">
                    DAILY CLIP PLAYBACK LIMIT REACHED
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowQuotaWarning(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              ผู้ใช้งาน <strong>Free Plan</strong> สามารถรับชมคลิปเหตุการณ์ย้อนหลังได้ 5 คลิปต่อวัน เพื่อปลดล็อกการชมเทปย้อนหลังทั้งเกม (Full Season Match Film) และเข้าถึงฟิลเตอร์สเกาต์แบบไม่จำกัด กรุณาอัปเกรดเป็น <strong>StatCourtTH Pro</strong>
            </p>

            <div className="pt-2 flex items-center justify-end gap-2 font-mono text-xs">
              <button
                onClick={() => setShowQuotaWarning(false)}
                className="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                ปิด
              </button>
              <button
                onClick={() => {
                  setShowQuotaWarning(false);
                  setIsPricingModalOpen(true);
                }}
                className="px-5 py-2 rounded-lg font-black bg-brand-primary hover:bg-brand-crimson text-white shadow flex items-center gap-1.5"
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

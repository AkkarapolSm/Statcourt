"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  Radio,
  Tv,
  Volume2,
  VolumeX,
  Maximize2,
  Eye,
  ShieldCheck,
  Settings,
  Flame,
  CheckCircle2,
  Play,
  Pause,
  RefreshCw,
  Share2,
  Edit3,
} from "lucide-react";
import { LiveStreamItem } from "@/lib/store/useLiveStreamStore";

interface LiveMatchBroadcastPlayerProps {
  stream: LiveStreamItem;
  isOrganizer: boolean;
  onEditStream?: () => void;
}

export default function LiveMatchBroadcastPlayer({
  stream,
  isOrganizer,
  onEditStream,
}: LiveMatchBroadcastPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(0.8);
  const [viewerCount, setViewerCount] = useState(stream.viewerCount || 1240);

  // Sync video source when stream changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {
        // Autoplay may require mute
        setIsMuted(true);
      });
      setIsPlaying(true);
    }
  }, [stream.id, stream.streamUrl]);

  // Simulate viewer fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setViewerCount((prev) =>
        Math.max(200, prev + Math.floor(Math.random() * 9) - 4)
      );
    }, 4000);
    return () => clearInterval(interval);
  }, []);

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

  const toggleMute = () => {
    if (!videoRef.current) return;
    const newMuted = !isMuted;
    videoRef.current.muted = newMuted;
    setIsMuted(newMuted);
    if (!newMuted && volume === 0) setVolume(0.8);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
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

  return (
    <div
      ref={containerRef}
      className="relative bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-800 text-white flex flex-col select-none"
    >
      {/* Live Stream Top Overlay Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/90 via-black/50 to-transparent p-3 sm:p-4 flex items-center justify-between pointer-events-auto">
        {/* Live Indicator & Tournament / Court Tag */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-brand-primary text-white text-xs font-mono font-black px-2.5 py-1 rounded-md shadow animate-pulse">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            <span>LIVE</span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-sm border border-slate-700 px-2.5 py-1 rounded-md text-xs font-mono text-slate-300">
            <Eye className="w-3.5 h-3.5 text-red-400" />
            <span>{viewerCount.toLocaleString()} กำลังรับชม</span>
          </div>

          <span className="text-xs font-bold text-slate-200 bg-red-950/60 border border-red-800/40 px-2 py-0.5 rounded font-mono hidden sm:inline">
            {stream.courtName}
          </span>
        </div>

        {/* Organizer Manage Button (ONLY visible to verified Organizers) */}
        {isOrganizer && onEditStream && (
          <button
            onClick={onEditStream}
            className="flex items-center gap-1.5 text-xs font-mono bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded-lg shadow transition"
            title="จัดการสัญญาณถ่ายทอดสดคอร์ทนี้ (เฉพาะผู้จัด)"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>จัดการสัญญาณคอร์ทนี้</span>
          </button>
        )}
      </div>

      {/* Live Video Frame */}
      <div className="relative aspect-video w-full bg-black flex items-center justify-center">
        <video
          ref={videoRef}
          src={stream.streamUrl}
          autoPlay
          playsInline
          muted={isMuted}
          loop
          onClick={togglePlay}
          className="w-full h-full object-contain cursor-pointer"
        />

        {/* Top-Left Live Official Table Watermark */}
        <div className="absolute top-14 left-4 z-10 hidden sm:flex items-center gap-2 bg-slate-950/85 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-lg shadow-lg">
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="font-bold text-white">
              {stream.homeTeam.shortName}{" "}
              <span className="text-brand-signal font-black">
                {stream.homeTeam.score}
              </span>
            </span>
            <span className="text-slate-500 font-bold">-</span>
            <span className="font-bold text-white">
              <span className="text-white font-black">
                {stream.awayTeam.score}
              </span>{" "}
              {stream.awayTeam.shortName}
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-red-400 font-bold">
              Q{stream.currentQuarter}
            </span>
          </div>
        </div>

        {/* Center Play Button Overlay if Paused */}
        {!isPlaying && (
          <button
            onClick={togglePlay}
            className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-brand-primary/90 hover:bg-brand-primary text-white flex items-center justify-center shadow-2xl transition transform hover:scale-105 pointer-events-auto"
            title="เล่นถ่ายทอดสด"
          >
            <Play className="w-8 h-8 ml-1 fill-white" />
          </button>
        )}
      </div>

      {/* Live Player Bottom Controls Bar */}
      <div className="bg-slate-950 px-4 py-3 flex items-center justify-between border-t border-slate-900">
        {/* Left Play/Pause & Live Info */}
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition"
            title={isPlaying ? "หยุดชั่วคราว" : "เล่น"}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-white" />
            ) : (
              <Play className="w-4 h-4 fill-white ml-0.5" />
            )}
          </button>

          <div className="flex items-center gap-1.5 text-xs font-mono">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
            <span className="text-red-400 font-bold">กำลังถ่ายทอดสด</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300 font-semibold">{stream.courtName}</span>
          </div>
        </div>

        {/* Right Volume & Fullscreen */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="p-2 text-slate-400 hover:text-white transition"
              title={isMuted ? "เปิดเสียง" : "ปิดเสียง"}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-red-400" />
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
              className="w-16 sm:w-20 h-1 bg-slate-700 rounded appearance-none accent-red-600 cursor-pointer"
            />
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition"
            title="เต็มจอ (Fullscreen)"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

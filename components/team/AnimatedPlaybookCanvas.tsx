"use client";

import React, { useState, useEffect } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  Share2,
  Smartphone,
  Sparkles,
  Info,
  CheckCircle2,
  Layers,
  Zap,
} from "lucide-react";
import { PlaybookPlay, PlaybookPlayerCoord } from "@/lib/types";
import { mockPlaybookPlays } from "@/lib/db/phase3-data";

interface AnimatedPlaybookCanvasProps {
  initialPlays?: PlaybookPlay[];
}

export default function AnimatedPlaybookCanvas({
  initialPlays = mockPlaybookPlays,
}: AnimatedPlaybookCanvasProps) {
  const [plays, setPlays] = useState<PlaybookPlay[]>(initialPlays);
  const [selectedPlayId, setSelectedPlayId] = useState<string>(plays[0].id);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  useEffect(() => {
    fetch("/api/team/playbook?teamId=team-bcc")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const valid = json.data.filter((p: any) => p && Array.isArray(p.steps) && p.steps.length > 0);
          if (valid.length > 0) {
            setPlays(valid);
            setSelectedPlayId(valid[0].id);
          }
        }
      })
      .catch((err) => console.warn("Failed to fetch playbook items:", err));
  }, []);

  const activePlay = plays.find((p) => p.id === selectedPlayId) || plays[0];
  const steps = activePlay.steps;
  const currentStep = steps[currentStepIndex] || steps[0];

  // Auto-play interval
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setTimeout(() => {
        if (currentStepIndex < steps.length - 1) {
          setCurrentStepIndex((prev) => prev + 1);
        } else {
          // Loop back to start
          setCurrentStepIndex(0);
        }
      }, 2400 / playbackSpeed);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStepIndex, steps.length, playbackSpeed]);

  const handleNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
  };

  const handleShareMobile = () => {
    setCopiedLink(true);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
    }
    setTimeout(() => setCopiedLink(false), 3000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col text-white">
      {/* Top Playbook Header & Play Selector */}
      <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-[#AF101A] flex items-center justify-center font-bold text-white shadow-xs">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-headline-lg uppercase text-lg sm:text-xl tracking-wide font-normal">
                {activePlay.title}
              </span>
              <span className="bg-red-950 text-red-300 border border-red-800 text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase">
                {activePlay.category}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              {activePlay.tags.join(" • ")}
            </p>
          </div>
        </div>

        {/* Play Selector Dropdown & Mobile Push Button */}
        <div className="flex items-center gap-2.5 font-mono text-xs">
          <select
            value={selectedPlayId}
            onChange={(e) => {
              setSelectedPlayId(e.target.value);
              setCurrentStepIndex(0);
              setIsPlaying(false);
            }}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold focus:outline-none focus:border-red-500"
          >
            {plays.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleShareMobile}
            className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold flex items-center gap-1.5 transition"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span>{copiedLink ? "คัดลอกลิงก์แล้ว!" : "ส่งเข้ามือถือนักกีฬา"}</span>
          </button>
        </div>
      </div>

      {/* Main Court Canvas & Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
        
        {/* Left Side: 2D Animated Basketball Half-Court */}
        <div className="lg:col-span-8 flex flex-col items-center">
          <div className="relative w-full aspect-[14/11] max-w-[620px] bg-[#0B1528] border-2 border-slate-700 rounded-xl overflow-hidden shadow-inner select-none p-4">
            
            {/* Basketball Court Markings (Half Court SVG) */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none opacity-40 stroke-slate-400 fill-none"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              strokeWidth="0.8"
            >
              {/* Half Court Line */}
              <line x1="0" y1="99" x2="100" y2="99" strokeWidth="1.2" />
              {/* Center Circle */}
              <path d="M 38 100 A 12 12 0 0 1 62 100" />
              
              {/* Key / Paint Area */}
              <rect x="32" y="0" width="36" height="52" strokeWidth="1" />
              {/* Free Throw Circle */}
              <circle cx="50" cy="52" r="14" strokeDasharray="2,2" />
              <path d="M 36 52 A 14 14 0 0 1 64 52" />

              {/* Restricted Area Arc */}
              <path d="M 44 8 A 6 6 0 0 0 56 8" />
              {/* Backboard & Rim */}
              <line x1="42" y1="4" x2="58" y2="4" strokeWidth="1.5" stroke="#FFF" />
              <circle cx="50" cy="8" r="3" stroke="#DC2626" strokeWidth="1.5" />

              {/* 3-Point Line */}
              <line x1="8" y1="0" x2="8" y2="28" />
              <line x1="92" y1="0" x2="92" y2="28" />
              <path d="M 8 28 A 43 43 0 0 0 92 28" strokeWidth="1" />
            </svg>

            {/* Tactical Action Vectors (Passing / Cutting dashed lines) */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-10"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <defs>
                <marker
                  id="arrow-pass"
                  viewBox="0 0 10 10"
                  refX="5"
                  refY="5"
                  markerWidth="5"
                  markerHeight="5"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#38BDF8" />
                </marker>
                <marker
                  id="arrow-cut"
                  viewBox="0 0 10 10"
                  refX="5"
                  refY="5"
                  markerWidth="5"
                  markerHeight="5"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#F87171" />
                </marker>
              </defs>

              {/* Render dynamic vectors based on player action */}
              {currentStep.players.map((p) => {
                if (p.action === "CUT") {
                  return (
                    <line
                      key={`cut-${p.id}`}
                      x1={p.x - 3}
                      y1={p.y + 4}
                      x2={p.x}
                      y2={p.y}
                      stroke="#F87171"
                      strokeWidth="1.2"
                      markerEnd="url(#arrow-cut)"
                    />
                  );
                }
                if (p.action === "SCREEN") {
                  return (
                    <line
                      key={`screen-${p.id}`}
                      x1={p.x - 3}
                      y1={p.y}
                      x2={p.x + 3}
                      y2={p.y}
                      stroke="#FBBF24"
                      strokeWidth="2.5"
                    />
                  );
                }
                return null;
              })}
            </svg>

            {/* Render Players with smooth CSS transitions */}
            {currentStep.players.map((player) => {
              const isBallCarrier = player.id === currentStep.ballCarrierId;

              return (
                <div
                  key={player.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-700 ease-out flex flex-col items-center z-20"
                  style={{
                    left: `${player.x}%`,
                    top: `${player.y}%`,
                  }}
                >
                  {/* Player Token */}
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-black text-xs font-mono shadow-lg transition-transform ${
                      player.isOffense
                        ? "bg-[#DC2626] text-white ring-2 ring-white/60"
                        : "bg-slate-700 text-slate-200 border border-slate-500"
                    } ${isBallCarrier ? "scale-110 ring-4 ring-amber-400" : ""}`}
                  >
                    {player.id}
                  </div>

                  {/* Ball Indicator */}
                  {isBallCarrier && (
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-amber-900 shadow-sm mt-0.5 animate-bounce" />
                  )}

                  {/* Label */}
                  <span className="text-[9px] font-mono text-slate-300 bg-black/60 px-1 rounded mt-0.5 font-bold whitespace-nowrap">
                    {player.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Control Bar: Play / Pause, Prev, Next, Speed */}
          <div className="w-full max-w-[620px] mt-4 p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between font-mono text-xs">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-8 h-8 rounded-lg bg-[#DC2626] hover:bg-[#B91C1C] text-white flex items-center justify-center transition"
                title={isPlaying ? "Pause" : "Play Animation"}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                title="Reset to Step 1"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <div className="h-5 w-px bg-slate-800 mx-1" />

              <button
                type="button"
                disabled={currentStepIndex === 0}
                onClick={handlePrevStep}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-slate-300 font-bold px-1">
                เฟรม {currentStepIndex + 1} / {steps.length}
              </span>

              <button
                type="button"
                disabled={currentStepIndex === steps.length - 1}
                onClick={handleNextStep}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Speed Control */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 text-[11px]">สปีด:</span>
              <button
                type="button"
                onClick={() => setPlaybackSpeed(playbackSpeed === 1 ? 0.5 : 1)}
                className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-white font-bold text-[11px]"
              >
                {playbackSpeed}x
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Step-by-Step Instructions & Coaching Key Points */}
        <div className="lg:col-span-4 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Step Card */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-red-400 font-bold uppercase flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  <span>STEP {currentStep.stepIndex}: {currentStep.title}</span>
                </span>
                <span className="text-[10px] text-slate-500 font-bold">
                  บอลอยู่ที่: #{currentStep.ballCarrierId}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {currentStep.description}
              </p>
            </div>

            {/* Step Indicators Selector */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono text-slate-400 uppercase font-bold block">
                ลำดับขั้นตอนการเคลื่อนที่ (PLAY PHASES)
              </span>
              <div className="space-y-2">
                {steps.map((st, idx) => (
                  <button
                    key={st.stepIndex}
                    type="button"
                    onClick={() => {
                      setCurrentStepIndex(idx);
                      setIsPlaying(false);
                    }}
                    className={`w-full p-2.5 rounded-lg border text-left font-mono text-xs transition flex items-center justify-between ${
                      idx === currentStepIndex
                        ? "bg-[#AF101A]/20 border-red-600 text-white"
                        : "bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/40"
                    }`}
                  >
                    <span>เฟรม {st.stepIndex}: {st.title}</span>
                    {idx === currentStepIndex && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Key Coaching Point */}
            <div className="bg-red-950/30 border border-red-900/40 rounded-xl p-3.5 space-y-1 text-xs">
              <div className="flex items-center gap-1.5 text-red-300 font-mono font-bold uppercase text-[11px]">
                <Info className="w-3.5 h-3.5 text-red-400" />
                <span>COACHING KEYS (หัวใจสำคัญของแผน)</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {activePlay.keyCoachingPoint}
              </p>
            </div>
          </div>

          {/* Quick Push Status */}
          <div className="pt-2 text-[11px] font-mono text-slate-500 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>ซิงค์แผนการเล่นตรงกับแอปพลิเคชันมือถือของนักกีฬาในทีม BCC</span>
          </div>
        </div>

      </div>
    </div>
  );
}

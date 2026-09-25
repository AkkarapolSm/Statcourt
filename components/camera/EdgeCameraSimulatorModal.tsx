"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Camera,
  Activity,
  Cpu,
  Wifi,
  Sparkles,
  Maximize2,
  Settings,
  CircleDot,
  Radio,
  Video,
  ShieldCheck,
  CheckCircle2,
  Layers,
  Smartphone,
  Eye,
} from "lucide-react";

interface EdgeCameraSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  courtName?: string;
}

export default function EdgeCameraSimulatorModal({
  isOpen,
  onClose,
  courtName = "Nimibutr Stadium - Court 1 (Main Arena)",
}: EdgeCameraSimulatorModalProps) {
  const [isStreaming, setIsStreaming] = useState(true);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true);
  const [showBallTracker, setShowBallTracker] = useState(true);
  const [selectedQuality, setSelectedQuality] = useState<"1080p60" | "720p60">("1080p60");
  
  // Simulated tracking coordinates
  const [ballPos, setBallPos] = useState({ x: 52, y: 44 });
  const [cameraPanOffset, setCameraPanOffset] = useState(0);
  const [fps, setFps] = useState(60);
  const [latencyMs, setLatencyMs] = useState(14);

  useEffect(() => {
    if (!isOpen) return;

    // Simulate ball movement and auto-pan camera
    const interval = setInterval(() => {
      setBallPos((prev) => {
        const nextX = Math.max(20, Math.min(80, prev.x + (Math.random() * 8 - 4)));
        const nextY = Math.max(25, Math.min(75, prev.y + (Math.random() * 6 - 3)));
        
        // Camera smooth pan towards ball
        setCameraPanOffset((nextX - 50) * 0.35);
        return { x: nextX, y: nextY };
      });

      // Fluctuate latency slightly
      setLatencyMs(12 + Math.floor(Math.random() * 5));
    }, 400);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#0B132B] border border-slate-700 w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] text-white">
        
        {/* Top Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#AF101A] flex items-center justify-center text-white">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-headline-lg uppercase text-lg sm:text-xl tracking-wide font-normal">
                  StatCourt Focus Mobile (Edge AI Camera)
                </h3>
                <span className="inline-flex items-center gap-1 bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase">
                  <Radio className="w-3 h-3 animate-pulse text-emerald-400" />
                  <span>EDGE NEURAL ENGINE ACTIVE</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                {courtName} • โมเดล Computer Vision ตรวจจับลูกบาสและติดตามอัตโนมัติบนสมาร์ตโฟน
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport Simulation */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          
          {/* Virtual Camera Feed Screen */}
          <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center">
            
            {/* Background Simulated Court Feed (Dynamic pan offset) */}
            <div
              className="absolute inset-0 bg-gradient-to-b from-slate-900 via-[#1C2541] to-slate-950 transition-transform duration-500 ease-out"
              style={{
                transform: `translateX(${-cameraPanOffset}%) scale(1.08)`,
              }}
            >
              {/* Synthetic Basketball Court Floor lines */}
              <div className="absolute inset-0 court-grid-pattern opacity-25" />
              <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-80 h-40 border-2 border-white/20 rounded-t-full pointer-events-none" />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-32 border-2 border-white/30 pointer-events-none" />
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full border-2 border-red-500/60 pointer-events-none" />
            </div>

            {/* AI Bounding Boxes: Offense Players (Red) */}
            {showBoundingBoxes && (
              <>
                <div
                  className="absolute transition-all duration-500 border border-red-500/80 bg-red-500/10 rounded px-1 flex flex-col items-center pointer-events-none"
                  style={{ left: `${ballPos.x - 4}%`, top: `${ballPos.y - 2}%`, width: "42px", height: "74px" }}
                >
                  <span className="text-[9px] font-mono font-bold bg-red-600 text-white px-1 rounded -mt-2.5">
                    #7 BCC (PG)
                  </span>
                </div>

                <div
                  className="absolute transition-all duration-700 border border-red-500/80 bg-red-500/10 rounded px-1 flex flex-col items-center pointer-events-none"
                  style={{ left: `${ballPos.x + 18}%`, top: `${ballPos.y + 8}%`, width: "40px", height: "70px" }}
                >
                  <span className="text-[9px] font-mono font-bold bg-red-600 text-white px-1 rounded -mt-2.5">
                    #11 BCC (SG)
                  </span>
                </div>

                {/* AI Bounding Boxes: Defense Players (Blue) */}
                <div
                  className="absolute transition-all duration-500 border border-cyan-400/80 bg-cyan-500/10 rounded px-1 flex flex-col items-center pointer-events-none"
                  style={{ left: `${ballPos.x + 3}%`, top: `${ballPos.y - 1}%`, width: "42px", height: "74px" }}
                >
                  <span className="text-[9px] font-mono font-bold bg-cyan-600 text-white px-1 rounded -mt-2.5">
                    #23 DS (DEF)
                  </span>
                </div>
              </>
            )}

            {/* AI Ball Tracking Reticle (Amber) */}
            {showBallTracker && (
              <div
                className="absolute transition-all duration-300 pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${ballPos.x}%`, top: `${ballPos.y}%` }}
              >
                <div className="w-5 h-5 rounded-full border-2 border-amber-400 shadow-md animate-ping opacity-75" />
                <div className="w-3.5 h-3.5 rounded-full bg-amber-400/90 border border-amber-900 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-xs" />
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[8px] font-mono bg-amber-950/80 text-amber-300 border border-amber-700 px-1 rounded whitespace-nowrap">
                  BALL (v: 4.8 m/s)
                </span>
              </div>
            )}

            {/* Camera Viewport Crosshairs & HUD Overlay */}
            <div className="absolute inset-0 p-4 flex flex-col justify-between pointer-events-none">
              <div className="flex items-center justify-between font-mono text-[11px]">
                <div className="flex items-center gap-2 bg-black/60 px-2.5 py-1 rounded backdrop-blur-xs border border-white/10">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-red-400 font-bold">REC [LIVE 00:42:15]</span>
                  <span className="text-slate-400">|</span>
                  <span className="text-white font-bold">{selectedQuality}</span>
                </div>

                <div className="flex items-center gap-3 bg-black/60 px-3 py-1 rounded backdrop-blur-xs border border-white/10">
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <Activity className="w-3 h-3" />
                    <span>{fps} FPS</span>
                  </span>
                  <span className="text-slate-400">|</span>
                  <span className="text-slate-300">Inference: {latencyMs} ms</span>
                  <span className="text-slate-400">|</span>
                  <span className="text-cyan-300 flex items-center gap-1">
                    <Cpu className="w-3 h-3" />
                    <span>WebGPU / NPU</span>
                  </span>
                </div>
              </div>

              {/* Bottom Target Bar */}
              <div className="flex items-center justify-between font-mono text-[10px] text-slate-400">
                <span className="bg-black/60 px-2 py-0.5 rounded">
                  AUTO-TRACKING: PAN +{cameraPanOffset.toFixed(1)}°
                </span>
                <span className="bg-black/60 px-2 py-0.5 rounded text-emerald-400 font-bold">
                  ENCRYPTION: CLOUDFLARE STREAM R2 SECURE
                </span>
              </div>
            </div>

          </div>

          {/* Controls & Metrics Panel */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-slate-900 border border-slate-800 rounded-xl font-mono text-xs">
            
            {/* Toggle Overlays */}
            <div className="space-y-2">
              <span className="text-slate-400 uppercase font-bold text-[10px] block">
                การแสดงผลระบบ AI (OVERLAYS)
              </span>
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={showBallTracker}
                  onChange={(e) => setShowBallTracker(e.target.checked)}
                  className="accent-amber-500 w-3.5 h-3.5 rounded"
                />
                <span>ตรวจจับลูกบาส (Ball Trajectory)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={showBoundingBoxes}
                  onChange={(e) => setShowBoundingBoxes(e.target.checked)}
                  className="accent-red-500 w-3.5 h-3.5 rounded"
                />
                <span>ตรวจจับผู้เล่น (Player Bounding Box)</span>
              </label>
            </div>

            {/* Quality Selector */}
            <div className="space-y-1.5">
              <span className="text-slate-400 uppercase font-bold text-[10px] block">
                คุณภาพการสตรีม (RESOLUTION)
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedQuality("1080p60")}
                  className={`flex-1 py-1.5 rounded font-bold transition text-xs border ${
                    selectedQuality === "1080p60"
                      ? "bg-[#AF101A] border-red-500 text-white"
                      : "bg-slate-800 border-slate-700 text-slate-400"
                  }`}
                >
                  1080p 60fps (Pro)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedQuality("720p60")}
                  className={`flex-1 py-1.5 rounded font-bold transition text-xs border ${
                    selectedQuality === "720p60"
                      ? "bg-[#AF101A] border-red-500 text-white"
                      : "bg-slate-800 border-slate-700 text-slate-400"
                  }`}
                >
                  720p 60fps (Lite)
                </button>
              </div>
            </div>

            {/* Hardware Status */}
            <div className="space-y-1">
              <span className="text-slate-400 uppercase font-bold text-[10px] block">
                สถานะฮาร์ดแวร์ประมวลผล
              </span>
              <div className="text-emerald-400 font-bold text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>On-Device Neural Inference 100%</span>
              </div>
              <p className="text-[11px] text-slate-400">
                ประมวลผลบนชิปมือถือโดยตรง ไม่กินค่า Bandwidth Cloud สำหรับการตรวจจับ
              </p>
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between font-mono text-xs">
          <span className="text-slate-400">
            ระบบรองรับทั้งขาตั้งกล้องอัตโนมัติ (Gimbal) และสมาร์ตโฟนบนขาตั้งนิ่ง
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold transition"
          >
            ปิดหน้าต่าง
          </button>
        </div>

      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import {
  X,
  Play,
  Pause,
  Video,
  Music,
  Share2,
  Download,
  CheckCircle2,
  Film,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Trash2,
  Layers,
  Smartphone,
  Monitor,
  ShieldCheck,
  Check,
  Clock,
} from "lucide-react";
import { HighlightClipItem } from "@/lib/types";
import { mockHighlightClips } from "@/lib/db/phase2-data";

interface HighlightReelGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  athleteName?: string;
  jerseyNumber?: number;
  schoolName?: string;
  tcasCode?: string;
  statsSummary?: string;
}

export default function HighlightReelGeneratorModal({
  isOpen,
  onClose,
  athleteName = "Thanakorn Siriphan",
  jerseyNumber = 7,
  schoolName = "Bangkok Christian College",
  tcasCode = "STC-VERIFIED-TH-BCC-007",
  statsSummary = "18.0 PPG • 6.4 APG • 62.4% TS • 26.4 EFF",
}: HighlightReelGeneratorModalProps) {
  const [clips, setClips] = useState<HighlightClipItem[]>(mockHighlightClips);
  const [selectedFormat, setSelectedFormat] = useState<"9:16" | "16:9">("9:16");
  const [selectedSoundtrack, setSelectedSoundtrack] = useState<string>("trap");
  const [includeIntroSlide, setIncludeIntroSlide] = useState(true);
  const [includeWatermark, setIncludeWatermark] = useState(true);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportDone, setExportDone] = useState(false);

  if (!isOpen) return null;

  const totalDuration = clips
    .filter((c) => c.isSelected)
    .reduce((acc, c) => acc + c.durationSec, includeIntroSlide ? 3 : 0);

  const maxAllowedSec = 60;

  const handleToggleSelect = (id: string) => {
    setClips(
      clips.map((c) => (c.id === id ? { ...c, isSelected: !c.isSelected } : c))
    );
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const next = [...clips];
    const temp = next[index - 1];
    next[index - 1] = next[index];
    next[index] = temp;
    setClips(next);
  };

  const handleMoveDown = (index: number) => {
    if (index === clips.length - 1) return;
    const next = [...clips];
    const temp = next[index + 1];
    next[index + 1] = next[index];
    next[index] = temp;
    setClips(next);
  };

  const handleStartExport = () => {
    setIsExporting(true);
    setExportProgress(10);
    setExportDone(false);

    const interval = setInterval(() => {
      setExportProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsExporting(false);
          setExportDone(true);
          return 100;
        }
        return prev + 15;
      });
    }, 400);
  };

  const selectedClipsCount = clips.filter((c) => c.isSelected).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto font-sans">
      <div className="bg-[#0B1C30] border border-[#213145] w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#071322] border-b border-[#213145] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#AF101A] flex items-center justify-center text-white shadow-sm">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-white font-headline-lg uppercase text-lg sm:text-xl tracking-wide font-normal flex items-center gap-2">
                <span>Highlight Reel Generator</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#AF101A]/20 text-red-200 border border-[#AF101A]/60 font-bold">
                  1-MIN REEL COMPILER
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {athleteName} (#{jerseyNumber}) • {schoolName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Demo Simulation Notice */}
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-2.5 flex items-center justify-between text-xs text-amber-300">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold uppercase text-[10px] border border-amber-400/30 shrink-0 font-mono">
              รุ่นทดลอง / DEMO SIMULATION
            </span>
            <span>
              Client-side Preview: เครื่องมือรวมคลิปจำลองการตัดต่อและการเรนเดอร์ในเบราว์เซอร์ ยังไม่ได้เชื่อมต่อไปยัง Cloud GPU Video Transcoder จริง
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-200">
          
          {/* Top Bar: Duration & Format Controls */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-[#071322] p-4 rounded-xl border border-[#213145]">
            {/* Duration Meter */}
            <div className="md:col-span-6 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-bold uppercase flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-red-400" />
                  <span>TOTAL RUNTIME:</span>
                </span>
                <span
                  className={`font-bold font-mono tabular-nums ${
                    totalDuration > maxAllowedSec ? "text-amber-400" : "text-emerald-400"
                  }`}
                >
                  00:{totalDuration < 10 ? `0${totalDuration}` : totalDuration} / 01:00 MAX
                </span>
              </div>
              <div className="w-full bg-[#0d223a] h-2.5 rounded-full overflow-hidden border border-[#213145]">
                <div
                  className={`h-full transition-all duration-300 ${
                    totalDuration > maxAllowedSec ? "bg-amber-500" : "bg-[#AF101A]"
                  }`}
                  style={{ width: `${Math.min(100, (totalDuration / maxAllowedSec) * 100)}%` }}
                />
              </div>
              <div className="text-[11px] text-slate-400">
                เลือกจำนวน <span className="tabular-nums font-semibold text-white">{selectedClipsCount}</span> จังหวะการเล่น • เหมาะสำหรับสื่อสังคมออนไลน์และเอกสารประกอบ TCAS Portfolio
              </div>
            </div>

            {/* Aspect Ratio Switch */}
            <div className="md:col-span-3 space-y-1">
              <label className="text-[11px] text-slate-400 uppercase font-bold block">
                ASPECT RATIO
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedFormat("9:16")}
                  className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition cursor-pointer ${
                    selectedFormat === "9:16"
                      ? "bg-[#AF101A] border-red-500 text-white"
                      : "bg-[#0d223a] border-[#213145] text-slate-300 hover:bg-[#142C47]"
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>9:16 Reel</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFormat("16:9")}
                  className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition cursor-pointer ${
                    selectedFormat === "16:9"
                      ? "bg-[#AF101A] border-red-500 text-white"
                      : "bg-[#0d223a] border-[#213145] text-slate-300 hover:bg-[#142C47]"
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>16:9 HD</span>
                </button>
              </div>
            </div>

            {/* Soundtrack Selector */}
            <div className="md:col-span-3 space-y-1">
              <label className="text-[11px] text-slate-400 uppercase font-bold block">
                SOUNDTRACK
              </label>
              <select
                value={selectedSoundtrack}
                onChange={(e) => setSelectedSoundtrack(e.target.value)}
                className="w-full bg-[#0d223a] border border-[#213145] rounded-xl text-xs py-1.5 px-2.5 text-white focus:outline-none focus:border-[#AF101A]"
              >
                <option value="trap">Trap Beat (140 BPM)</option>
                <option value="hiphop">Energetic Hiphop (128 BPM)</option>
                <option value="cinematic">Cinematic Arena Brass</option>
                <option value="none">Raw Court Audio (Ambient Only)</option>
              </select>
            </div>
          </div>

          {/* Main Grid: Left Side Player Simulation / Right Side Clips Order */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Player & Title Card Preview */}
            <div className="lg:col-span-5 space-y-4">
              <div
                className={`relative bg-black rounded-xl overflow-hidden border border-slate-800 flex flex-col justify-between items-center shadow-lg ${
                  selectedFormat === "9:16" ? "aspect-[9/16] max-h-[380px] mx-auto w-auto" : "aspect-video w-full"
                }`}
              >
                {/* Intro Title Overlay or Playing State */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col justify-between p-4 z-10 pointer-events-none">
                  <div className="flex items-center justify-between">
                    <span className="bg-[#AF101A] text-white font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      STATCOURT REEL
                    </span>
                    {includeWatermark && (
                      <span className="flex items-center gap-1 text-[10px] font-mono text-slate-300 bg-black/60 px-2.5 py-0.5 rounded-full border border-white/10">
                        <ShieldCheck className="w-3 h-3 text-[#AF101A]" />
                        <span>FIBA VERIFIED</span>
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 text-center bg-black/75 p-3 rounded-xl border border-white/10 backdrop-blur-xs">
                    <div className="text-white font-headline-lg text-lg uppercase tracking-wide">
                      {athleteName} #{jerseyNumber}
                    </div>
                    <div className="text-[11px] text-slate-300">
                      {schoolName}
                    </div>
                    <div className="text-[10px] text-red-400 font-mono font-bold pt-1 tabular-nums">
                      {statsSummary}
                    </div>
                    <div className="text-[9px] text-slate-400 font-mono">
                      TCAS ID: {tcasCode}
                    </div>
                  </div>
                </div>

                {/* Video Playback Trigger */}
                <div className="absolute inset-0 flex items-center justify-center z-20">
                  <button
                    type="button"
                    onClick={() => setIsPlayingPreview(!isPlayingPreview)}
                    className="w-14 h-14 rounded-full bg-[#AF101A] hover:bg-[#8E0D15] text-white flex items-center justify-center shadow-xl hover:scale-105 transition cursor-pointer"
                  >
                    {isPlayingPreview ? (
                      <Pause className="w-6 h-6" />
                    ) : (
                      <Play className="w-6 h-6 ml-1" />
                    )}
                  </button>
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-2 bg-[#071322] p-3.5 rounded-xl border border-[#213145] text-xs">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeIntroSlide}
                    onChange={(e) => setIncludeIntroSlide(e.target.checked)}
                    className="accent-[#AF101A] w-4 h-4 rounded"
                  />
                  <span>ผนวกหน้าแนะนำตัวนักกีฬาพร้อมข้อมูลสถิติและรหัส TCAS <span className="font-mono text-slate-400 tabular-nums">(+3 วินาที)</span></span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeWatermark}
                    onChange={(e) => setIncludeWatermark(e.target.checked)}
                    className="accent-[#AF101A] w-4 h-4 rounded"
                  />
                  <span>ประทับตราสัญลักษณ์รับรองความถูกต้อง <span className="font-mono text-slate-300">StatCourt FIBA Verified Watermark</span></span>
                </label>
              </div>
            </div>

            {/* Right: Clip Sequencing List */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center justify-between text-xs pb-1 border-b border-[#213145]">
                <span className="font-bold text-white flex items-center gap-1.5 font-mono">
                  <Layers className="w-3.5 h-3.5 text-[#AF101A]" />
                  <span>SEQUENCE CLIPS ({selectedClipsCount} SELECTED)</span>
                </span>
                <span className="text-slate-400">จัดลำดับคลิปจากบนลงล่าง</span>
              </div>

              <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                {clips.map((clip, index) => (
                  <div
                    key={clip.id}
                    className={`p-3 rounded-xl border transition flex items-center justify-between gap-3 ${
                      clip.isSelected
                        ? "bg-[#0d223a] border-[#213145] text-white"
                        : "bg-[#071322]/80 border-[#213145]/70 text-slate-500 opacity-60"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={clip.isSelected}
                        onChange={() => handleToggleSelect(clip.id)}
                        className="accent-[#AF101A] w-4 h-4 rounded cursor-pointer shrink-0"
                      />
                      <div className="w-7 h-7 rounded-lg bg-[#071322] border border-[#213145] flex items-center justify-center font-mono text-xs font-bold text-slate-300 shrink-0">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-bold text-xs sm:text-sm text-white flex items-center gap-2">
                          <span>{clip.title}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-950/80 text-red-300 border border-red-800/60 tabular-nums">
                            {clip.timestampDisplay}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-1">
                          {clip.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-xs font-mono font-bold text-slate-400 mr-2 tabular-nums">
                        {clip.durationSec}s
                      </span>
                      <button
                        type="button"
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        className="p-1 rounded-lg bg-[#071322] hover:bg-[#142C47] border border-[#213145] disabled:opacity-30 text-slate-300 transition cursor-pointer"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveDown(index)}
                        disabled={index === clips.length - 1}
                        className="p-1 rounded-lg bg-[#071322] hover:bg-[#142C47] border border-[#213145] disabled:opacity-30 text-slate-300 transition cursor-pointer"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Export Status / Output Simulation */}
          {isExporting && (
            <div className="bg-slate-900 border border-red-900/60 p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-white font-bold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-red-400 animate-spin" />
                  <span>กำลังประมวลผลและสร้างวิดีโอไฮไลต์ ({selectedFormat})...</span>
                </span>
                <span className="text-red-400 font-bold">{exportProgress}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#DC2626] h-full transition-all duration-300"
                  style={{ width: `${exportProgress}%` }}
                />
              </div>
            </div>
          )}

          {exportDone && (
            <div className="bg-emerald-950/60 border border-emerald-800 p-4 rounded-xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center text-white shrink-0">
                  <Check className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    ประมวลผลวิดีโอไฮไลต์ทางการสำเร็จ
                  </h4>
                  <p className="text-xs text-emerald-300/80">
                    ไฟล์วิดีโอพร้อมสำหรับการส่งให้ผู้ฝึกสอนสถาบันอุดมศึกษา หรือประกอบแฟ้มผลงาน
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => alert("ดาวน์โหลดไฟล์ไฮไลต์ MP4 (1080p) เรียบร้อยแล้ว")}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ดาวน์โหลด MP4</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-[#071322] border-t border-[#213145] flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>

          <div className="flex items-center gap-3 text-xs">
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(window.location.href);
                alert("คัดลอกลิงก์ไฮไลต์ส่วนตัวสำหรับส่งโค้ชมหาวิทยาลัยแล้ว!");
              }}
              className="px-4 py-2.5 rounded-xl bg-[#0d223a] hover:bg-[#142C47] text-slate-200 border border-[#213145] font-semibold flex items-center gap-2 transition cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>คัดลอกลิงก์สำหรับผู้ฝึกสอน</span>
            </button>

            <button
              type="button"
              disabled={isExporting || totalDuration === 0}
              onClick={handleStartExport}
              className="px-5 py-2.5 rounded-xl bg-[#AF101A] hover:bg-[#8E0D15] disabled:opacity-50 text-white font-bold flex items-center gap-2 transition shadow-lg shadow-red-950/50 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>ประมวลผลและส่งออกวิดีโอไฮไลต์ (60 วินาที)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

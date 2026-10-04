"use client";

import React, { useState } from "react";
import {
  X,
  Radio,
  Tv,
  Plus,
  Trash2,
  Edit3,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Link as LinkIcon,
} from "lucide-react";
import { useLiveStreamStore, LiveStreamItem } from "@/lib/store/useLiveStreamStore";

interface OrganizerStreamModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingStreamId?: string | null;
}

export default function OrganizerStreamModal({
  isOpen,
  onClose,
  editingStreamId,
}: OrganizerStreamModalProps) {
  const { streams, addStream, updateStream, removeStream } =
    useLiveStreamStore();

  const activeStreamToEdit = streams.find((s) => s.id === editingStreamId);

  // Form states
  const [courtName, setCourtName] = useState(
    activeStreamToEdit?.courtName || "สนาม 4 (Court D)"
  );
  const [tournament, setTournament] = useState(
    activeStreamToEdit?.tournament ||
      "TOA Youth Basketball League Thailand 2026"
  );
  const [homeTeamName, setHomeTeamName] = useState(
    activeStreamToEdit?.homeTeam.name || "Hitech Basketball Academy"
  );
  const [homeTeamShort, setHomeTeamShort] = useState(
    activeStreamToEdit?.homeTeam.shortName || "HITECH"
  );
  const [homeScore, setHomeScore] = useState(
    activeStreamToEdit?.homeTeam.score || 42
  );
  const [awayTeamName, setAwayTeamName] = useState(
    activeStreamToEdit?.awayTeam.name || "Siam Raptors Basketball"
  );
  const [awayTeamShort, setAwayTeamShort] = useState(
    activeStreamToEdit?.awayTeam.shortName || "RAPTORS"
  );
  const [awayScore, setAwayScore] = useState(
    activeStreamToEdit?.awayTeam.score || 39
  );
  const [currentQuarter, setCurrentQuarter] = useState(
    activeStreamToEdit?.currentQuarter || 3
  );
  const [gameClock, setGameClock] = useState(
    activeStreamToEdit?.gameClock || "06:30"
  );
  const [streamUrl, setStreamUrl] = useState(
    activeStreamToEdit?.streamUrl ||
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4"
  );
  const [status, setStatus] = useState<"LIVE" | "UPCOMING" | "ENDED">(
    activeStreamToEdit?.status || "LIVE"
  );
  const [organizerName, setOrganizerName] = useState(
    activeStreamToEdit?.organizerName || "ฝ่ายจัดการแข่งขันและถ่ายทอดสด BSAT"
  );
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (activeStreamToEdit) {
      updateStream(activeStreamToEdit.id, {
        courtName,
        tournament,
        title: `${homeTeamName} vs ${awayTeamName}`,
        homeTeam: {
          ...activeStreamToEdit.homeTeam,
          name: homeTeamName,
          shortName: homeTeamShort,
          score: Number(homeScore),
        },
        awayTeam: {
          ...activeStreamToEdit.awayTeam,
          name: awayTeamName,
          shortName: awayTeamShort,
          score: Number(awayScore),
        },
        currentQuarter: Number(currentQuarter),
        gameClock,
        streamUrl,
        status,
        organizerName,
      });
      setFeedback("อัปเดตข้อมูลสัญญาณถ่ายทอดสดสำเร็จ!");
    } else {
      addStream({
        matchId: `match-custom-${Date.now()}`,
        courtName,
        title: `${homeTeamName} vs ${awayTeamName}`,
        tournament,
        homeTeam: {
          name: homeTeamName,
          shortName: homeTeamShort,
          score: Number(homeScore),
          color: "#DC2626",
        },
        awayTeam: {
          name: awayTeamName,
          shortName: awayTeamShort,
          score: Number(awayScore),
          color: "#2563EB",
        },
        currentQuarter: Number(currentQuarter),
        gameClock,
        streamUrl,
        status,
        organizerName,
      });
      setFeedback("นำสัญญาณถ่ายทอดสดขึ้นระบบเรียบร้อยแล้ว!");
    }

    setTimeout(() => {
      setFeedback(null);
      onClose();
    }, 1200);
  };

  const handleDelete = (id: string) => {
    if (confirm("ยืนยันการนำสัญญาณถ่ายทอดสดนี้ออกจากระบบ?")) {
      removeStream(id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface-container rounded-2xl border border-borderNeutral max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-borderNeutral">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-100 text-brand-primary flex items-center justify-center font-mono">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-mono font-bold text-brand-primary uppercase">
                ORGANIZER BROADCAST STUDIO
              </div>
              <h3 className="font-extrabold text-base text-textHeading">
                {activeStreamToEdit
                  ? `แก้ไขสัญญาณถ่ายทอดสด: ${activeStreamToEdit.courtName}`
                  : "นำสัญญาณถ่ายทอดสดขึ้นเว็บไซต์ (เพิ่มสนามแข่ง)"}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-textHeading"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {feedback ? (
          <div className="py-8 text-center space-y-2 font-mono">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h4 className="font-bold text-sm text-textHeading">{feedback}</h4>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
            {/* Court & Tournament */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-textHeading font-bold block mb-1">
                  ชื่อสนาม / คอร์ทแข่งขัน (เช่น สนาม 4 หรือ Court D)
                </label>
                <input
                  type="text"
                  required
                  value={courtName}
                  onChange={(e) => setCourtName(e.target.value)}
                  placeholder="สนาม 4 (Court D)"
                  className="w-full p-2.5 bg-surface-base border border-borderNeutral rounded-lg text-textHeading focus:outline-none focus:border-brand-primary"
                />
              </div>
              <div>
                <label className="text-textHeading font-bold block mb-1">
                  ชื่อรายการแข่งขัน / ทัวร์นาเมนต์
                </label>
                <input
                  type="text"
                  required
                  value={tournament}
                  onChange={(e) => setTournament(e.target.value)}
                  placeholder="TOA Youth Basketball League Thailand 2026"
                  className="w-full p-2.5 bg-surface-base border border-borderNeutral rounded-lg text-textHeading focus:outline-none focus:border-brand-primary"
                />
              </div>
            </div>

            {/* Teams & Scores */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="text-[11px] font-bold text-textHeading uppercase">
                คู่แข่งขันและผลคะแนนสด
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                <div>
                  <label className="text-[10px] text-textSecondary block mb-0.5">
                    ทีมเหย้า (Home Team)
                  </label>
                  <input
                    type="text"
                    required
                    value={homeTeamName}
                    onChange={(e) => setHomeTeamName(e.target.value)}
                    placeholder="ชื่อทีมเหย้า"
                    className="w-full p-2 bg-white border border-borderNeutral rounded-lg"
                  />
                  <input
                    type="text"
                    required
                    value={homeTeamShort}
                    onChange={(e) => setHomeTeamShort(e.target.value)}
                    placeholder="ตัวย่อ (เช่น BCC)"
                    className="w-full p-1.5 mt-1 bg-white border border-borderNeutral rounded text-[11px]"
                  />
                </div>

                <div className="flex flex-col items-center justify-center">
                  <span className="text-[10px] text-textSecondary uppercase block mb-1">
                    คะแนนสด (Home - Away)
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={homeScore}
                      onChange={(e) => setHomeScore(Number(e.target.value))}
                      className="w-16 p-2 bg-white border border-borderNeutral rounded text-center font-black text-brand-primary"
                    />
                    <span className="font-bold text-slate-400">-</span>
                    <input
                      type="number"
                      value={awayScore}
                      onChange={(e) => setAwayScore(Number(e.target.value))}
                      className="w-16 p-2 bg-white border border-borderNeutral rounded text-center font-black text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-textSecondary block mb-0.5">
                    ทีมเยือน (Away Team)
                  </label>
                  <input
                    type="text"
                    required
                    value={awayTeamName}
                    onChange={(e) => setAwayTeamName(e.target.value)}
                    placeholder="ชื่อทีมเยือน"
                    className="w-full p-2 bg-white border border-borderNeutral rounded-lg"
                  />
                  <input
                    type="text"
                    required
                    value={awayTeamShort}
                    onChange={(e) => setAwayTeamShort(e.target.value)}
                    placeholder="ตัวย่อ (เช่น DS)"
                    className="w-full p-1.5 mt-1 bg-white border border-borderNeutral rounded text-[11px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[10px] text-textSecondary block mb-0.5">
                    ควอเตอร์ปัจจุบัน
                  </label>
                  <select
                    value={currentQuarter}
                    onChange={(e) => setCurrentQuarter(Number(e.target.value))}
                    className="w-full p-2 bg-white border border-borderNeutral rounded text-xs"
                  >
                    <option value={1}>Quarter 1</option>
                    <option value={2}>Quarter 2</option>
                    <option value={3}>Quarter 3</option>
                    <option value={4}>Quarter 4</option>
                    <option value={5}>Overtime (OT)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-textSecondary block mb-0.5">
                    เวลาแข่งขันที่เหลือ
                  </label>
                  <input
                    type="text"
                    value={gameClock}
                    onChange={(e) => setGameClock(e.target.value)}
                    placeholder="05:20"
                    className="w-full p-2 bg-white border border-borderNeutral rounded text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Stream URL */}
            <div>
              <label className="text-textHeading font-bold block mb-1">
                URL สัญญาณถ่ายทอดสด (HLS .m3u8 / MP4 / Direct Stream)
              </label>
              <div className="relative">
                <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  required
                  value={streamUrl}
                  onChange={(e) => setStreamUrl(e.target.value)}
                  placeholder="https://live.statcourt.th/hls/court4.m3u8"
                  className="w-full pl-9 pr-3 py-2.5 bg-surface-base border border-borderNeutral rounded-lg text-textHeading focus:outline-none focus:border-brand-primary text-xs"
                />
              </div>
              <span className="text-[10px] text-textSecondary mt-1 block">
                สามารถนำ URL สตรีมจาก OBS, กล้องสนาม หรือ CDN ถ่ายทอดสดมาวางได้ทันที
              </span>
            </div>

            {/* Status & Organizer info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-textHeading font-bold block mb-1">
                  สถานะการถ่ายทอดสด
                </label>
                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as "LIVE" | "UPCOMING" | "ENDED")
                  }
                  className="w-full p-2.5 bg-surface-base border border-borderNeutral rounded-lg text-xs"
                >
                  <option value="LIVE">กำลังถ่ายทอดสด (LIVE STREAMING)</option>
                  <option value="UPCOMING">เร็วๆ นี้ (UPCOMING)</option>
                  <option value="ENDED">จบการแข่งขันแล้ว (ENDED)</option>
                </select>
              </div>

              <div>
                <label className="text-textHeading font-bold block mb-1">
                  ชื่อหน่วยงานผู้จัด / ผู้ถ่ายทอดสด
                </label>
                <input
                  type="text"
                  value={organizerName}
                  onChange={(e) => setOrganizerName(e.target.value)}
                  placeholder="ฝ่ายจัดการแข่งขัน TOA"
                  className="w-full p-2.5 bg-surface-base border border-borderNeutral rounded-lg text-xs"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-borderNeutral flex items-center justify-between">
              {activeStreamToEdit ? (
                <button
                  type="button"
                  onClick={() => handleDelete(activeStreamToEdit.id)}
                  className="bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 border border-red-200 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" /> ลบสัญญาณนี้
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold text-textSecondary hover:bg-slate-100 rounded-lg transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="bg-brand-primary hover:bg-brand-crimson text-white font-bold text-xs px-5 py-2 rounded-lg shadow flex items-center gap-1.5 transition"
                >
                  <Upload className="w-3.5 h-3.5" />
                  {activeStreamToEdit ? "บันทึกการแก้ไข" : "นำขึ้นถ่ายทอดสดทันที"}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

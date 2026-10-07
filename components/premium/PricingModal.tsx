"use client";

import React, { useState } from "react";
import {
  X,
  Check,
  Zap,
  ShieldCheck,
  Trophy,
  Film,
  Target,
  FileSpreadsheet,
  Users,
  Search,
  Lock,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth/useAuthStore";
import ProBadge from "./ProBadge";

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPerspective?: "ATHLETE" | "SCOUT";
}

export default function PricingModal({
  isOpen,
  onClose,
  defaultPerspective = "ATHLETE",
}: PricingModalProps) {
  const { currentUser, setSubscriptionTier } = useAuthStore();
  const [perspective, setPerspective] = useState<"ATHLETE" | "SCOUT">(defaultPerspective);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isCurrentPro = currentUser.tier === "PRO";

  const handleSelectTier = (tier: "FREE" | "PRO") => {
    setSubscriptionTier(tier);
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0B1C30] border border-[#213145] rounded-2xl max-w-4xl w-full text-white shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200 cursor-default"
      >
        {/* Modal Top Header */}
        <div className="bg-[#071322] px-6 py-5 border-b border-[#213145] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#AF101A]/20 border border-[#AF101A]/40 flex items-center justify-center">
              <Zap className="w-5 h-5 text-[#AF101A] fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold tracking-wider text-red-300 uppercase">
                  STATCOURTTH MEMBERSHIP
                </span>
                <ProBadge size="sm" variant="amber" />
              </div>
              <h2 className="text-xl font-black tracking-tight text-white mt-0.5">
                Freemium Data Access Tiering
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#213145]/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Demo Simulation Notice */}
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-2.5 flex items-center justify-between text-xs text-amber-300">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 font-bold uppercase text-[10px] border border-amber-400/30 shrink-0">
              รุ่นทดลอง / DEMO SIMULATION
            </span>
            <span className="font-sans leading-relaxed">
              Sandbox Mode: การสลับแพ็กเกจ PRO ในเวอร์ชันนี้เป็นการจำลองสิทธิ์ (Instant Feature Unlock) เพื่อให้ทดสอบฟีเจอร์ระดับ Pro ได้โดยไม่มีการตัดบัตรเครดิตจริง
            </span>
          </div>
        </div>

        {/* Perspective Switcher Tabs */}
        <div className="px-6 pt-5 bg-[#071322]/60 border-b border-[#213145] flex items-center gap-3">
          <button
            onClick={() => setPerspective("ATHLETE")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition border-b-2 ${
              perspective === "ATHLETE"
                ? "bg-[#0d223a] text-white border-[#AF101A] shadow-sm"
                : "text-slate-400 hover:text-slate-200 border-transparent"
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            1. สิทธิ์สำหรับนักกีฬา (Athlete Tiering)
          </button>
          <button
            onClick={() => setPerspective("SCOUT")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition border-b-2 ${
              perspective === "SCOUT"
                ? "bg-[#0d223a] text-white border-[#AF101A] shadow-sm"
                : "text-slate-400 hover:text-slate-200 border-transparent"
            }`}
          >
            <Users className="w-4 h-4 text-blue-400" />
            2. สิทธิ์สำหรับโค้ชและแมวมอง (Coach & Scout Tiering)
          </button>
        </div>

        {/* Pricing Cards Content */}
        <div className="p-6 space-y-6">
          {perspective === "ATHLETE" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Athlete Free Plan */}
              <div className="rounded-xl border border-[#213145] bg-[#071322]/80 p-6 flex flex-col justify-between space-y-5">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                        FREE TIER
                      </span>
                      <h3 className="text-xl font-black text-white">สายฟรี (Free Plan)</h3>
                    </div>
                    <span className="text-lg font-black font-mono tabular-nums text-slate-300">฿0 / ตลอดชีพ</span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    เหมาะสำหรับนักเรียนนักกีฬาเริ่มต้น บันทึกและดูสถิติพื้นฐานหลังจบเกมได้ทันที
                  </p>

                  <div className="border-t border-[#213145] pt-4 space-y-2.5 text-xs">
                    <div className="flex items-start gap-2 text-slate-300">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>สถิติพื้นฐาน Box Score ทั้งหมด (PTS, REB, AST, STL, BLK, FG%)</span>
                    </div>
                    <div className="flex items-start gap-2 text-slate-300">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>คำนวณค่า FIBA EFF รวมของตนเอง</span>
                    </div>
                    <div className="flex items-start gap-2 text-slate-300">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>ดูอันดับ Leaderboard ของตนเอง และ Top 10 แต่ละตำแหน่ง</span>
                    </div>
                    <div className="flex items-start gap-2 text-slate-300">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>ดูคลิปสั้นไฮไลต์ของตนเองได้ 3-5 คลิปหลังจบเกม</span>
                    </div>
                    <div className="flex items-start gap-2 text-slate-300">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>ดาวน์โหลดการ์ดภาพนิ่งมาตรฐานสำหรับแชร์ลงโซเชียล</span>
                    </div>
                    <div className="flex items-start gap-2 text-slate-300">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>ลงขายรองเท้า/อุปกรณ์มือสองได้ 1 ชิ้นพร้อมกัน</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleSelectTier("FREE")}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition ${
                    !isCurrentPro
                      ? "bg-[#213145] text-slate-300 cursor-default"
                      : "bg-[#0d223a] hover:bg-[#213145] text-white border border-[#213145]"
                  }`}
                >
                  {!isCurrentPro ? "สถานะปัจจุบันของคุณ" : "สลับเป็นโหมด FREE"}
                </button>
              </div>

              {/* Athlete Pro Plan */}
              <div className="rounded-xl border-2 border-[#AF101A] bg-gradient-to-b from-[#AF101A]/20 via-[#0B1C30] to-[#071322] p-6 flex flex-col justify-between space-y-5 relative shadow-xl">
                <div className="absolute -top-3 right-5">
                  <span className="bg-[#AF101A] text-white text-[10px] font-mono font-black uppercase px-2.5 py-0.5 rounded shadow">
                    RECOMMENDED FOR TCAS
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-mono font-bold text-red-400 uppercase tracking-wider">
                          ATHLETE PRO
                        </span>
                        <ProBadge size="sm" variant="amber" />
                      </div>
                      <h3 className="text-xl font-black text-white">สมาชิกรายเดือน (Pro Athlete)</h3>
                    </div>
                    <div>
                      <span className="text-2xl font-black font-mono tabular-nums text-white">฿199</span>
                      <span className="text-xs text-slate-400"> / เดือน</span>
                    </div>
                  </div>

                  <p className="text-xs text-red-200/90 leading-relaxed font-sans">
                    สำหรับนักกีฬาที่ต้องการยื่นพอร์ตโควตากีฬา TCAS และสร้างโปรไฟล์ไฮไลต์สู่ระดับอาชีพ
                  </p>

                  <div className="border-t border-[#AF101A]/30 pt-4 space-y-2.5 text-xs">
                    <div className="flex items-start gap-2 text-white font-medium">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>ทุกฟังก์ชันในแพ็กเกจฟรีแบบไม่จำกัด</span>
                    </div>
                    <div className="flex items-start gap-2 text-white font-medium">
                      <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>แสดงค่า EFF รวม พร้อมกราฟเปรียบเทียบแนวโน้มฟอร์มย้อนหลัง</span>
                    </div>
                    <div className="flex items-start gap-2 text-white font-medium">
                      <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>ดูอันดับทั้งกระดาน Top 100 แบบไม่จำกัด</span>
                    </div>
                    <div className="flex items-start gap-2 text-white font-medium">
                      <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>ดูคลิปเหตุการณ์ย้อนหลังได้ทุกช็อตตลอดทั้งฤดูกาล</span>
                    </div>
                    <div className="flex items-start gap-2 text-white font-medium">
                      <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>สร้างเพลย์ลิสต์รวมไฮไลต์ และตัดเป็นคลิปยาว 1 นาทีได้ไม่จำกัด</span>
                    </div>
                    <div className="flex items-start gap-2 text-white font-medium">
                      <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>ส่งออกเอกสาร PDF พอร์ตโฟลิโอมาตรฐาน TCAS พร้อม QR Code วิดีโอ</span>
                    </div>
                    <div className="flex items-start gap-2 text-white font-medium">
                      <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>ลงขายอุปกรณ์ใน Marketplace ได้ไม่จำกัด พร้อมป้ายยืนยัน</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleSelectTier("PRO")}
                  className={`w-full py-2.5 rounded-xl text-xs font-black transition shadow-lg ${
                    isCurrentPro
                      ? "bg-emerald-600 text-white cursor-default"
                      : "bg-[#AF101A] hover:bg-[#8E0D15] text-white"
                  }`}
                >
                  {isCurrentPro ? "คุณกำลังใช้งานสิทธิ์ PRO อยู่แล้ว" : "อัปเกรดเป็น PRO ATHLETE (฿199/ด.)"}
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Scout Free Plan */}
              <div className="rounded-xl border border-[#213145] bg-[#071322]/80 p-6 flex flex-col justify-between space-y-5">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                        SCOUT FREE
                      </span>
                      <h3 className="text-xl font-black text-white">โค้ชสายฟรี (Free Tier)</h3>
                    </div>
                    <span className="text-lg font-black font-mono tabular-nums text-slate-300">฿0 / ตลอดชีพ</span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    สำหรับโค้ชทั่วไปดูผลการแข่งขันและรายชื่อนักกีฬาในสังกัด
                  </p>

                  <div className="border-t border-[#213145] pt-4 space-y-2.5 text-xs">
                    <div className="flex items-start gap-2 text-slate-300">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>ดูรายชื่อนักกีฬาในทีมตัวเองและผลการแข่งย้อนหลัง</span>
                    </div>
                    <div className="flex items-start gap-2 text-slate-300">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>ดูเฉพาะค่าเฉลี่ยสถิติพื้นฐานของนักกีฬาในทัวร์นาเมนต์</span>
                    </div>
                    <div className="flex items-start gap-2 text-slate-300">
                      <Lock className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                      <span className="text-slate-400 font-sans">แผนที่จุดยิง (Shot Chart) ถูกล็อก (แสดงเฉพาะเปอร์เซ็นต์รวม)</span>
                    </div>
                    <div className="flex items-start gap-2 text-slate-300">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>ค้นหานักกีฬาได้เฉพาะ: ชื่อ, โรงเรียน, ตำแหน่ง</span>
                    </div>
                    <div className="flex items-start gap-2 text-slate-300">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>ดูคลิปสถิติได้เฉพาะนักกีฬาในทีมของตัวเอง</span>
                    </div>
                    <div className="flex items-start gap-2 text-slate-300">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>ดูรายงานสรุปคะแนนบนหน้าเว็บ</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleSelectTier("FREE")}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition ${
                    !isCurrentPro
                      ? "bg-[#213145] text-slate-300 cursor-default"
                      : "bg-[#0d223a] hover:bg-[#213145] text-white border border-[#213145]"
                  }`}
                >
                  {!isCurrentPro ? "สถานะปัจจุบันของคุณ" : "สลับเป็นโหมด FREE"}
                </button>
              </div>

              {/* Scout Pro Plan */}
              <div className="rounded-xl border-2 border-blue-500 bg-gradient-to-b from-blue-950/40 via-[#0B1C30] to-[#071322] p-6 flex flex-col justify-between space-y-5 relative shadow-xl">
                <div className="absolute -top-3 right-5">
                  <span className="bg-blue-600 text-white text-[10px] font-mono font-black uppercase px-2.5 py-0.5 rounded shadow">
                    SCOUT & ACADEMY PRO
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider">
                          SCOUT PRO
                        </span>
                        <ProBadge size="sm" variant="slate" className="bg-blue-900 border-blue-400" />
                      </div>
                      <h3 className="text-xl font-black text-white">แมวมองและอะคาเดมี่ (Scout Pro)</h3>
                    </div>
                    <div>
                      <span className="text-2xl font-black font-mono tabular-nums text-white">฿890</span>
                      <span className="text-xs text-slate-400"> / เดือน</span>
                    </div>
                  </div>

                  <p className="text-xs text-blue-200/90 leading-relaxed font-sans">
                    สำหรับสโมสร มหาวิทยาลัย และแมวมองทีมชาติ ค้นหาช้างเผือกด้วยข้อมูลสถิติขั้นสูง
                  </p>

                  <div className="border-t border-blue-900/40 pt-4 space-y-2.5 text-xs">
                    <div className="flex items-start gap-2 text-white font-medium">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>จัดการรายชื่อทีมได้ไม่จำกัดทีม/รุ่นอายุ</span>
                    </div>
                    <div className="flex items-start gap-2 text-white font-medium">
                      <Check className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                      <span>สถิติเชิงลึก FIBA: TS%, eFG%, AST/TO Ratio, Points in Paint</span>
                    </div>
                    <div className="flex items-start gap-2 text-white font-medium">
                      <Check className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                      <span>ปลดล็อก Shot Chart 5 โซน พร้อมสถิติความแม่นยำรายจุด</span>
                    </div>
                    <div className="flex items-start gap-2 text-white font-medium">
                      <Check className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                      <span>ค้นหาขั้นสูง: ส่วนสูง 190+ cm, ช่วงแขน (Wingspan), TS% 50%+</span>
                    </div>
                    <div className="flex items-start gap-2 text-white font-medium">
                      <Check className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                      <span>ดูคลิปวิดีโอเบื้องหลังทุกลูกยิง/แอสซิสต์ของนักกีฬาทุกคนในระบบ</span>
                    </div>
                    <div className="flex items-start gap-2 text-white font-medium">
                      <Check className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                      <span>Export ข้อมูลเป็น Excel / PDF ละเอียดสำหรับประชุมทีมและยื่นโควตา</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleSelectTier("PRO")}
                  className={`w-full py-2.5 rounded-xl text-xs font-black transition shadow-lg ${
                    isCurrentPro
                      ? "bg-emerald-600 text-white cursor-default"
                      : "bg-[#AF101A] hover:bg-[#8E0D15] text-white"
                  }`}
                >
                  {isCurrentPro ? "คุณกำลังใช้งานสิทธิ์ PRO อยู่แล้ว" : "อัปเกรดเป็น SCOUT PRO (฿890/ด.)"}
                </button>
              </div>
            </div>
          )}

          {/* Quick Simulation Bar for Pair-Programming Testing */}
          <div className="bg-[#071322] p-4 rounded-xl border border-[#213145] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-400 font-mono">
                CURRENT TIER: <strong className="text-white uppercase">{currentUser.tier}</strong>
              </span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400 font-sans">
                ROLE: <strong className="text-white">{currentUser.role}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSelectTier("FREE")}
                className={`px-3 py-1.5 rounded-xl font-mono text-[11px] font-bold transition ${
                  currentUser.tier === "FREE"
                    ? "bg-[#213145] text-white border border-slate-500"
                    : "bg-[#0B1C30] hover:bg-[#213145] text-slate-400"
                }`}
              >
                TEST AS FREE USER
              </button>
              <button
                onClick={() => handleSelectTier("PRO")}
                className={`px-3 py-1.5 rounded-xl font-mono text-[11px] font-black transition ${
                  currentUser.tier === "PRO"
                    ? "bg-[#AF101A] text-white border border-red-400"
                    : "bg-[#AF101A]/20 hover:bg-[#AF101A]/40 text-red-200 border border-[#AF101A]/50"
                }`}
              >
                TEST AS PRO USER
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

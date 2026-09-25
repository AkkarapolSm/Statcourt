"use client";

import React from "react";
import Link from "next/link";
import {
  RotateCcw,
  Trophy,
  Brain,
  Cpu,
  Play,
  Video,
  QrCode,
  Search,
  Film,
  GraduationCap,
  Activity,
  AlertTriangle,
  Award,
  Radio,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth/useAuthStore";
import { canAccessOfficialConsole, canAccessScoutHub } from "@/lib/auth/rbac";

interface EcosystemArchitectureSectionProps {
  activePhase: 1 | 2 | 3 | 4;
  onSelectPhase: (phase: 1 | 2 | 3 | 4) => void;
  onOpenPlayerPass: () => void;
  onOpenHighlightModal: () => void;
  onOpenEdgeCameraModal: () => void;
}

export default function EcosystemArchitectureSection({
  activePhase,
  onSelectPhase,
  onOpenPlayerPass,
  onOpenHighlightModal,
  onOpenEdgeCameraModal,
}: EcosystemArchitectureSectionProps) {
  const { currentUser } = useAuthStore();
  const hasOfficialAccess = canAccessOfficialConsole(currentUser);
  const hasScoutAccess = canAccessScoutHub(currentUser);
  const isMember = currentUser.role !== "PUBLIC";
  return (
    <section id="ecosystem" className="py-16 max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-10 space-y-2">
        <span className="text-xs font-mono font-bold tracking-widest text-[#AF101A] uppercase">
          END-TO-END BASKETBALL INTELLIGENCE ECOSYSTEM
        </span>
        <h2 className="font-headline-lg text-[#0B1C30] uppercase tracking-wide text-3xl sm:text-4xl font-normal">
          สถาปัตยกรรมระบบ 4 มิติ ยกระดับมาตรฐานบาสเกตบอลครบวงจร
        </h2>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          โครงสร้างพื้นฐานเทคโนโลยีบาสเกตบอลมาตรฐานสากล เชื่อมโยงระบบบันทึกสถิติภาคสนาม การวิเคราะห์ข้อมูลเชิงลึก ระบบกล้อง Edge AI จนถึงการต่อยอดสู่เส้นทางทุนการศึกษาและระดับอาชีพ
        </p>
      </div>

      {/* Phase Selector Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <button
          type="button"
          onClick={() => onSelectPhase(1)}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            activePhase === 1
              ? "bg-[#0F172A] border-[#AF101A] text-white shadow-lg"
              : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${
              activePhase === 1 ? "bg-[#AF101A] text-white" : "bg-slate-100 text-slate-600"
            }`}>
              01
            </span>
            <RotateCcw className={`w-4 h-4 ${activePhase === 1 ? "text-red-400" : "text-slate-400"}`} />
          </div>
          <h3 className="font-headline-sm font-bold uppercase text-base">Courtside &amp; Film Core</h3>
          <p className="text-xs text-slate-400 mt-1">บันทึกสถิติสดภาคสนาม, วิดีโอซิงก์สถิติ และบัตรนักกีฬาดิจิทัล</p>
        </button>

        <button
          type="button"
          onClick={() => onSelectPhase(2)}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            activePhase === 2
              ? "bg-[#0F172A] border-[#AF101A] text-white shadow-lg"
              : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${
              activePhase === 2 ? "bg-[#AF101A] text-white" : "bg-slate-100 text-slate-600"
            }`}>
              02
            </span>
            <Trophy className={`w-4 h-4 ${activePhase === 2 ? "text-red-400" : "text-slate-400"}`} />
          </div>
          <h3 className="font-headline-sm font-bold uppercase text-base">Scout &amp; TCAS Hub</h3>
          <p className="text-xs text-slate-400 mt-1">ประเมินสรีระชีวมิติ, วิดีโอไฮไลต์อัจฉริยะ และโควตาทุนการศึกษา</p>
        </button>

        <button
          type="button"
          onClick={() => onSelectPhase(3)}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            activePhase === 3
              ? "bg-[#0F172A] border-[#AF101A] text-white shadow-lg"
              : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${
              activePhase === 3 ? "bg-[#AF101A] text-white" : "bg-slate-100 text-slate-600"
            }`}>
              03
            </span>
            <Brain className={`w-4 h-4 ${activePhase === 3 ? "text-red-400" : "text-slate-400"}`} />
          </div>
          <h3 className="font-headline-sm font-bold uppercase text-base">Team Ops &amp; Tactical</h3>
          <p className="text-xs text-slate-400 mt-1">แท็กติกเพลย์บุ๊ก 2 มิติ, วิเคราะห์คู่แข่งขัน และติดตามความพร้อม (ACWR)</p>
        </button>

        <button
          type="button"
          onClick={() => onSelectPhase(4)}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            activePhase === 4
              ? "bg-[#0F172A] border-[#AF101A] text-white shadow-lg"
              : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${
              activePhase === 4 ? "bg-[#AF101A] text-white" : "bg-slate-100 text-slate-600"
            }`}>
              04
            </span>
            <Cpu className={`w-4 h-4 ${activePhase === 4 ? "text-red-400" : "text-slate-400"}`} />
          </div>
          <h3 className="font-headline-sm font-bold uppercase text-base">Academy &amp; Edge AI</h3>
          <p className="text-xs text-slate-400 mt-1">สถาบันพัฒนาผู้ตัดสิน FIBA, กล้อง Edge AI Tracking และศูนย์ถ่ายทอดสด</p>
        </button>
      </div>

      {/* Active Phase Deep Dive Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        {activePhase === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-red-100 text-[#AF101A] font-mono font-bold text-xs uppercase">
                LIVE RECORDING &amp; VERIFICATION
              </div>
              <h3 className="font-headline-lg text-[#0B1C30] uppercase text-2xl sm:text-3xl font-bold">
                Courtside Console, Click-to-Clip &amp; Digital Player Pass
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                ระบบบันทึกสถิติโต๊ะเทคนิคข้างสนามมาตรฐาน FIBA ทำงานด้วยสถาปัตยกรรม Offline-First บน IndexedDB บันทึกข้อมูลได้ต่อเนื่องแม้สัญญาณอินเทอร์เน็ตขัดข้อง ผสานคลิปวิดีโอเข้ากับทุกเหตุการณ์การแข่งขัน (Shot, Foul, Rebound) แบบ Zero-Latency พร้อมระบบ Digital Player Pass ยืนยันตัวตนนักกีฬาผ่านรหัส QR Code เพื่อความโปร่งใสและตรวจสอบคุณสมบัติตามรุ่นอายุได้อย่างแม่นยำ
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-mono">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="font-bold text-slate-900 block mb-1">Click-to-Clip Play Verification</span>
                  <span className="text-slate-500">เชื่อมโยงตัวเลขสถิติเข้ากับคลิปวิดีโอเหตุการณ์จริง ตรวจสอบย้อนหลังได้ทุกจังหวะในทันที</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="font-bold text-slate-900 block mb-1">FIBA Audit Trail &amp; Video Sync</span>
                  <span className="text-slate-500">บันทึกเหตุการณ์การแข่งขันอย่างเป็นทางการ พร้อมระบบซิงก์ภาพเพื่อการตัดสินและการวิเคราะห์</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 pt-4">
                {hasOfficialAccess ? (
                  <Link
                    href="/official/console/match-bcc-ds-01"
                    className="px-5 py-2.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-mono font-bold uppercase rounded flex items-center gap-2 transition"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>เข้าสู่ Live Courtside Console</span>
                  </Link>
                ) : (
                  <Link
                    href="/live"
                    className="px-5 py-2.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-mono font-bold uppercase rounded flex items-center gap-2 transition"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>เข้าสู่ศูนย์ถ่ายทอดสด &amp; สถิติสด (Live Hub)</span>
                  </Link>
                )}
                <Link
                  href="/matches/match-bcc-ds-01/film"
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-mono font-bold uppercase rounded flex items-center gap-2 transition"
                >
                  <Video className="w-3.5 h-3.5 text-red-400" />
                  <span>รับชม Game Film &amp; วิดีโอรีวิว</span>
                </Link>
                <button
                  type="button"
                  onClick={onOpenPlayerPass}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-mono font-bold uppercase rounded flex items-center gap-2 transition border border-slate-300 cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5 text-slate-700" />
                  <span>ตรวจสอบ Digital Player Pass</span>
                </button>
              </div>
            </div>
            <div className="lg:col-span-5 bg-[#0F172A] rounded-xl p-5 text-white font-mono text-xs space-y-3 border border-slate-800">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="text-red-400 font-bold uppercase">OFFICIAL AUDIT LOG</span>
                <span className="text-slate-400 text-[10px]">FIBA LIVESTATS ENGINE</span>
              </div>
              <div className="space-y-2 text-[11px]">
                <div className="bg-slate-800/80 p-2 rounded flex justify-between">
                  <span className="text-slate-300">05:20 Q4: #7 3-PT MAKE (BCC)</span>
                  <span className="text-white font-bold">+3 PTS [SYNCED]</span>
                </div>
                <div className="bg-slate-800/80 p-2 rounded flex justify-between">
                  <span className="text-slate-300">05:42 Q4: #23 DEF REBOUND (DS)</span>
                  <span className="text-slate-300 font-bold">DREB [SYNCED]</span>
                </div>
                <div className="bg-slate-800/80 p-2 rounded flex justify-between">
                  <span className="text-slate-300">06:05 Q4: #7 STEAL &amp; FASTBREAK</span>
                  <span className="text-red-400 font-bold">STL +2 PTS</span>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
                <span>IndexedDB Cache: 100% Synced</span>
                <span className="text-slate-300 font-bold">Active Connection</span>
              </div>
            </div>
          </div>
        )}

        {activePhase === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-red-50 text-[#AF101A] border border-red-200 font-mono font-bold text-xs uppercase">
                RECRUITMENT &amp; SCHOLARSHIPS
              </div>
              <h3 className="font-headline-lg text-[#0B1C30] uppercase text-2xl sm:text-3xl font-bold">
                College Scout Engine, Highlight Reels &amp; TCAS Tracker
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                แพลตฟอร์มค้นหาและประเมินศักยภาพนักกีฬาสำหรับผู้ฝึกสอนระดับอุดมศึกษา คัดกรองข้อมูลสรีระและสมรรถภาพทางกายภาพจริง (Biometrics: Wingspan, Standing Reach, Agility) พร้อมระบบสร้างคลิปไฮไลต์ประกอบสถิติทางการอัตโนมัติ และศูนย์รวมข้อมูลโควตาทุนการศึกษา TCAS รอบแฟ้มสะสมผลงาน พร้อมระบบตรวจสอบคุณสมบัติทางวิชาการ (GPAX)
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-mono">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="font-bold text-slate-900 block mb-1">Automated Highlight Reel</span>
                  <span className="text-slate-500">ประมวลผลคลิปเพลย์สำคัญ (3 แต้ม, บล็อก, ฟาสต์เบรก) พร้อมตราประทับรับรองสถิติทางการ</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="font-bold text-slate-900 block mb-1">Recruiter Talent Radar</span>
                  <span className="text-slate-500">ระบบแจ้งเตือนเชิงรุกเมื่อผู้ฝึกสอนและแมวมองระดับมหาวิทยาลัยชั้นนำเข้าชมแฟ้มประวัติ</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 pt-4">
                {hasScoutAccess ? (
                  <Link
                    href="/scout"
                    className="px-5 py-2.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-mono font-bold uppercase rounded flex items-center gap-2 transition"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>เข้าสู่ Scout Intelligence Platform</span>
                  </Link>
                ) : !isMember ? (
                  <Link
                    href="/auth/register"
                    className="px-5 py-2.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-mono font-bold uppercase rounded flex items-center gap-2 transition shadow-md shadow-red-950/40"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>สมัครสมาชิกเพื่อปลดล็อก Scout Hub</span>
                  </Link>
                ) : (
                  <Link
                    href="/opportunities"
                    className="px-5 py-2.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-mono font-bold uppercase rounded flex items-center gap-2 transition"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>ศูนย์ข้อมูลทุนการศึกษา TCAS</span>
                  </Link>
                )}
                <button
                  type="button"
                  onClick={onOpenHighlightModal}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-mono font-bold uppercase rounded flex items-center gap-2 transition cursor-pointer"
                >
                  <Film className="w-3.5 h-3.5 text-red-400" />
                  <span>สร้างคลิปไฮไลต์ประจำตัว (Reel Generator)</span>
                </button>
                <Link
                  href="/opportunities"
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-mono font-bold uppercase rounded flex items-center gap-2 transition border border-slate-300"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-slate-700" />
                  <span>ศูนย์ข้อมูลทุนการศึกษา TCAS</span>
                </Link>
              </div>
            </div>
            <div className="lg:col-span-5 bg-[#0F172A] rounded-xl p-5 text-white font-mono text-xs space-y-3 border border-slate-800">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="text-red-400 font-bold uppercase">SCOUT BIOMETRIC FILTER</span>
                <span className="text-slate-400 text-[10px]">TCAS BATCH 68-69</span>
              </div>
              <div className="space-y-2 text-[11px]">
                <div className="bg-slate-800/80 p-2.5 rounded border border-slate-700 flex justify-between items-center">
                  <div>
                    <div className="text-white font-bold">Phurinat Wongsuwan (BCC)</div>
                    <div className="text-[10px] text-slate-400">Wingspan: 194 cm | GPAX: 3.68</div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 text-[10px] font-bold border border-slate-700">
                    CU / TU ELIGIBLE
                  </span>
                </div>
                <div className="bg-slate-800/80 p-2.5 rounded border border-slate-700 flex justify-between items-center">
                  <div>
                    <div className="text-white font-bold">Nattawut Arthitprapan (SK)</div>
                    <div className="text-[10px] text-slate-400">Wingspan: 211 cm | GPAX: 3.20</div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-[#AF101A]/20 text-red-200 text-[10px] font-bold border border-[#AF101A]/50">
                    NATIONAL TIER
                  </span>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
                <span>Target Universities: 12 Active Quotas</span>
                <span className="text-slate-300 font-bold">Verified Dossiers</span>
              </div>
            </div>
          </div>
        )}

        {activePhase === 3 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-red-50 text-[#AF101A] border border-red-200 font-mono font-bold text-xs uppercase">
                COACHING &amp; SPORTS SCIENCE
              </div>
              <h3 className="font-headline-lg text-[#0B1C30] uppercase text-2xl sm:text-3xl font-bold">
                2D Animated Playbook, Opposition Scouting &amp; ACWR Load
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                กระดานจำลองแผนการเล่น 2 มิติแบบแอนิเมชัน (Animated Playbook) รวบรวมชุดการเล่นระดับอาชีพ (Horns, Spain P&amp;R, Zone Trap) พร้อมระบบวิเคราะห์จุดแข็ง-จุดอ่อนทีมคู่แข่งขันเชิงลึก และระบบเวชศาสตร์การกีฬาติดตามภาระงานและความล้าสะสม (ACWR) เพื่อเพิ่มประสิทธิภาพการฝึกซ้อมและลดความเสี่ยงการบาดเจ็บของนักกีฬา
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-mono">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="font-bold text-slate-900 block mb-1">Opposition Tactical Scouting</span>
                  <span className="text-slate-500">วิเคราะห์รูปแบบแผนการเล่น ชาร์ตจุดยิง (Shot Chart) และสถิติประกบรายบุคคลเชิงลึก</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="font-bold text-slate-900 block mb-1">ACWR Sports Science Monitor</span>
                  <span className="text-slate-500">คำนวณอัตราส่วนภาระงานเฉียบพลันและสะสม เพื่อบริหารจัดการความเหนื่อยล้าและป้องกันอาการบาดเจ็บ</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 pt-4">
                <Link
                  href="/team"
                  className="px-5 py-2.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-mono font-bold uppercase rounded flex items-center gap-2 transition"
                >
                  <Brain className="w-3.5 h-3.5" />
                  <span>เข้าสู่ระบบจัดการและวิเคราะห์ทีม (Team Hub)</span>
                </Link>
                <Link
                  href="/team"
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-mono font-bold uppercase rounded flex items-center gap-2 transition"
                >
                  <Activity className="w-3.5 h-3.5 text-red-400" />
                  <span>รายงานวิเคราะห์คู่แข่งขัน (Tactical Matchup)</span>
                </Link>
              </div>
            </div>
            <div className="lg:col-span-5 bg-[#0F172A] rounded-xl p-5 text-white font-mono text-xs space-y-3 border border-slate-800">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="text-red-400 font-bold uppercase">OPPOSITION SCOUTING INTEL</span>
                <span className="text-slate-400 text-[10px]">TACTICAL MATCHUP ANALYSIS</span>
              </div>
              <div className="space-y-2 text-[11px]">
                <div className="bg-red-950/40 p-2.5 rounded border border-red-800/60">
                  <div className="flex items-center gap-1.5 text-red-300 font-bold mb-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                    <span>TACTICAL DROP-OFF ALERT</span>
                  </div>
                  <p className="text-slate-300 text-[10px]">
                    วิเคราะห์โรเตชันผู้เล่นเชิงลึก พบสถิติความแม่นยำระยะ 3 คะแนนลดลงอย่างมีนัยสำคัญในควอเตอร์ 3 จากความล้าสะสม
                  </p>
                </div>
                <div className="bg-slate-800/80 p-2.5 rounded border border-slate-700 flex justify-between items-center">
                  <div>
                    <div className="text-white font-bold">Phurinat (BCC) vs Siwat (DS)</div>
                    <div className="text-[10px] text-slate-400">Head-to-Head Paint FG%: 61.2% vs 44.8%</div>
                  </div>
                  <span className="text-white font-bold text-xs">+16.4% ADV</span>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
                <span>ACWR Team Status: Normal (1.18)</span>
                <span className="text-slate-300 font-bold">Zero High-Risk Injuries</span>
              </div>
            </div>
          </div>
        )}

        {activePhase === 4 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-red-50 text-[#AF101A] border border-red-200 font-mono font-bold text-xs uppercase">
                ACADEMY &amp; COMPUTER VISION
              </div>
              <h3 className="font-headline-lg text-[#0B1C30] uppercase text-2xl sm:text-3xl font-bold">
                StatCourt Academy, Edge AI Camera &amp; Live Stream
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                สถาบันพัฒนาและรับรองมาตรฐานผู้ตัดสินโต๊ะเทคนิคตามเกณฑ์ FIBA Official Level 1-3 พร้อมระบบประเมินผลและทะเบียนบุคลากรทางการ ผสานเทคโนโลยี Edge AI ตรวจจับและเคลื่อนกล้องติดตามลูกบาสเกตบอลอัตโนมัติด้วยสมาร์ทโฟน ยกระดับการถ่ายทอดสดคุณภาพสูงสู่มาตรฐานบรอดคาสต์ พร้อมสูจิบัตรการแข่งขันดิจิทัลและการมีส่วนร่วมของผู้ชม
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-mono">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="font-bold text-slate-900 block mb-1">Edge AI Auto-Tracking Camera</span>
                  <span className="text-slate-500">ประมวลผล Computer Vision 60 FPS หมุนติดตามทิศทางเกมแบบอัตโนมัติด้วยความแม่นยำสูง</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="font-bold text-slate-900 block mb-1">Official Certification Registry</span>
                  <span className="text-slate-500">ทำเนียบตรวจสอบคุณวุฒิและมาตรฐานการปฏิบัติหน้าที่ของผู้ตัดสินโต๊ะเทคนิคอย่างเป็นทางการ</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={onOpenEdgeCameraModal}
                  className="px-5 py-2.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-mono font-bold uppercase rounded flex items-center gap-2 transition shadow-md shadow-red-950/30 cursor-pointer"
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>ทดสอบระบบ Edge AI Tracking</span>
                </button>
                <Link
                  href="/academy"
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-mono font-bold uppercase rounded flex items-center gap-2 transition"
                >
                  <Award className="w-3.5 h-3.5 text-slate-400" />
                  <span>เข้าสู่สถาบัน StatCourt Academy</span>
                </Link>
                <Link
                  href="/live"
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-mono font-bold uppercase rounded flex items-center gap-2 transition border border-slate-300"
                >
                  <Radio className="w-3.5 h-3.5 text-red-600" />
                  <span>ศูนย์ถ่ายทอดสด Live Broadcast Hub</span>
                </Link>
              </div>
            </div>
            <div className="lg:col-span-5 bg-[#0F172A] rounded-xl p-5 text-white font-mono text-xs space-y-3 border border-slate-800">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="text-red-400 font-bold uppercase">EDGE AI CAMERA STATUS</span>
                <span className="text-slate-300 text-[10px] font-bold">● 60 FPS • 14ms LATENCY</span>
              </div>
              <div className="space-y-2 text-[11px]">
                <div className="bg-slate-800/80 p-2.5 rounded border border-slate-700">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-white font-bold">Ball Tracking Confidence:</span>
                    <span className="text-white font-bold">98.4%</span>
                  </div>
                  <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#AF101A] h-1.5 rounded-full w-[98.4%]" />
                  </div>
                </div>
                <div className="bg-slate-800/80 p-2.5 rounded border border-slate-700 flex justify-between items-center">
                  <div>
                    <div className="text-white font-bold">Active Camera Rig:</div>
                    <div className="text-[10px] text-slate-400">Smartphone Mount on Half-Court Center</div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 text-[10px] font-bold border border-slate-700">
                    1080p60
                  </span>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
                <span>Certified Officials: 40 Active</span>
                <span className="text-slate-300 font-bold">FIBA 2026 Rules Exam Active</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

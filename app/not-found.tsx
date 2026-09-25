import React from "react";
import Link from "next/link";
import { ArrowLeft, Home, Trophy, Search, ShieldAlert } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#060913] text-white flex flex-col justify-center items-center px-4 py-16 relative overflow-hidden">
      {/* Background radial glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-lg w-full text-center space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-2">
          <ShieldAlert className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <div className="text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-amber-200">
            404
          </div>
          <h1 className="text-2xl font-bold text-slate-100">
            ไม่พบหน้าที่คุณต้องการ (Page Not Found)
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            ข้อมูลนักกีฬา แมตช์ หรือหน้าที่ท่านกำลังค้นหาอาจถูกย้าย ลบ หรือไม่เคยมีอยู่ในฐานข้อมูลของระบบ StatCourt Thailand
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-left space-y-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            คำแนะนำสำหรับผู้ใช้งาน:
          </p>
          <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
            <li>ตรวจสอบรหัสไอดีนักกีฬา หรือ URL อีกครั้ง</li>
            <li>ค้นหาผ่านหน้ากระดานผู้นำ (Leaderboard) หรือศูนย์รวมแมตช์สด</li>
            <li>หากเป็นเจ้าหน้าที่โต๊ะเทคนิค กรุณาตรวจสอบรหัสแมตช์ที่ได้รับมอบหมาย</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-sm hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg shadow-amber-500/20"
          >
            <Home className="w-4 h-4" />
            กลับสู่หน้าหลัก
          </Link>

          <Link
            href="/leaderboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-sm transition-all"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            ทำเนียบนักกีฬา (Leaderboard)
          </Link>
        </div>
      </div>
    </div>
  );
}

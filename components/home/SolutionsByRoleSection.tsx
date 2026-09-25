"use client";

import React from "react";
import { Check } from "lucide-react";

interface SolutionsByRoleSectionProps {
  activeTab: "ORGANIZER" | "SCHOOL" | "SCOUT";
  onSelectTab: (tab: "ORGANIZER" | "SCHOOL" | "SCOUT") => void;
}

export default function SolutionsByRoleSection({
  activeTab,
  onSelectTab,
}: SolutionsByRoleSectionProps) {
  return (
    <section id="solutions" className="py-16 bg-[#0F172A] text-white border-y border-slate-800 scroll-mt-16">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-mono font-bold tracking-widest text-red-400 uppercase">
            TAILORED SOLUTIONS
          </span>
          <h2 className="font-headline-lg uppercase tracking-wide text-3xl sm:text-4xl font-normal text-white leading-tight">
            โซลูชันเทคโนโลยีที่ปรับแต่งเพื่อเป้าหมายของแต่ละองค์กร
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            เลือกบทบาทขององค์กรเพื่อสำรวจฟังก์ชันการทำงานและคุณประโยชน์เฉพาะทางที่ออกแบบมาโดยตรง
          </p>
        </div>

        {/* Tab Selector Buttons */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          <button
            type="button"
            onClick={() => onSelectTab("ORGANIZER")}
            className={`px-5 py-2.5 rounded text-xs font-mono font-bold uppercase tracking-wider transition border cursor-pointer ${
              activeTab === "ORGANIZER"
                ? "bg-[#DC2626] border-[#DC2626] text-white shadow-lg shadow-red-950/50"
                : "bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white"
            }`}
          >
            1. ฝ่ายจัดการแข่งขันและลีก (Tournament Organizers)
          </button>
          <button
            type="button"
            onClick={() => onSelectTab("SCHOOL")}
            className={`px-5 py-2.5 rounded text-xs font-mono font-bold uppercase tracking-wider transition border cursor-pointer ${
              activeTab === "SCHOOL"
                ? "bg-[#DC2626] border-[#DC2626] text-white shadow-lg shadow-red-950/50"
                : "bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white"
            }`}
          >
            2. สถานศึกษาและอะคาเดมี (Schools &amp; Basketball Clubs)
          </button>
          <button
            type="button"
            onClick={() => onSelectTab("SCOUT")}
            className={`px-5 py-2.5 rounded text-xs font-mono font-bold uppercase tracking-wider transition border cursor-pointer ${
              activeTab === "SCOUT"
                ? "bg-[#DC2626] border-[#DC2626] text-white shadow-lg shadow-red-950/50"
                : "bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white"
            }`}
          >
            3. ผู้ฝึกสอนระดับอุดมศึกษาและแมวมอง (Colleges &amp; Pro Scouts)
          </button>
        </div>

        {/* Tab Content Display */}
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 sm:p-8">
          {activeTab === "ORGANIZER" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-5">
                <span className="text-xs font-mono font-bold text-red-400 uppercase tracking-widest">
                  FOR TOURNAMENT ORGANIZERS
                </span>
                <h3 className="font-headline-lg text-white font-normal text-2xl sm:text-3xl uppercase leading-snug">
                  ยกระดับมาตรฐานการแข่งขัน ลดข้อพิพาท เพิ่มมูลค่าผู้สนับสนุน
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                  StatCourtTH ให้บริการแพลตฟอร์มบริหารจัดการการแข่งขันแบบ Turnkey Solution สำหรับลีกและทัวร์นาเมนต์บาสเกตบอลทุกระดับ 
                  รายงานผลคะแนนสดแบบเรียลไทม์ บริหารสายการแข่งขันอัตโนมัติ และป้องกันการสวมสิทธิ์แข่งขันได้อย่างมีประสิทธิภาพและโปร่งใส 100%
                </p>
                <div className="space-y-2.5 pt-1 text-xs">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">ระบบบริหารสายการแข่งขัน (Brackets) และโปรแกรมแข่งอัตโนมัติ</p>
                      <p className="text-slate-400 text-[11px]">คำนวณและอัปเดตผังสายแพ้-ชนะ พร้อมเวลาแข่งขันขึ้นสู่เว็บไซต์ทางการทันทีหลังจบเกม</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Live Courtside Scorekeeper Console สำหรับโต๊ะเทคนิค</p>
                      <p className="text-slate-400 text-[11px]">มาตรฐาน FIBA ป้องกันข้อผิดพลาดในการบันทึกคะแนน พร้อมระบบ Reverse Action และบันทึกประวัติ (Audit Log)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">เครือข่ายผู้ตัดสินโต๊ะเทคนิคที่ผ่านการรับรอง (Certified Officials)</p>
                      <p className="text-slate-400 text-[11px]">ระบบจัดสรรและมอบหมายงานเจ้าหน้าที่โต๊ะเทคนิคที่ผ่านการอบรมและทดสอบกติกา FIBA อย่างเป็นทางการ</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-5 bg-slate-900 border border-slate-700 rounded-xl p-6 text-xs font-mono space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-slate-400">TOURNAMENT PACKAGE</span>
                  <span className="text-white font-bold text-sm">฿3,000 – 15,000 / รายการ</span>
                </div>
                <div className="space-y-2 text-slate-300">
                  <p className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /><span>รองรับการแข่งขันไม่จำกัดจำนวนคู่ตลอดทัวร์นาเมนต์</span></p>
                  <p className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /><span>หน้ารายงานผลคะแนนและสถิติสดแบบเรียลไทม์บนสมาร์ทโฟน</span></p>
                  <p className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /><span>บัตร Digital Player Pass พร้อมระบบสแกนตรวจสอบคุณสมบัติหน้าสนาม</span></p>
                  <p className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /><span>รายงานสรุปสถิติการแข่งขันอย่างเป็นทางการและตารางจัดอันดับ</span></p>
                  <p className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /><span>ระบบประมวลผลกราฟิกสรุปผลการแข่งขัน (Final Score) สำหรับสื่อโซเชียล</span></p>
                </div>
                <a
                  href="#contact-form"
                  className="block w-full py-2.5 rounded bg-[#DC2626] hover:bg-[#B91C1C] text-center font-bold text-white uppercase tracking-wider transition"
                >
                  ติดต่อขอรับข้อเสนอสำหรับรายการแข่งขัน
                </a>
              </div>
            </div>
          )}

          {activeTab === "SCHOOL" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-5">
                <span className="text-xs font-mono font-bold text-red-400 uppercase tracking-widest">
                  FOR SCHOOLS &amp; ACADEMIES
                </span>
                <h3 className="font-headline-lg text-white font-normal text-2xl sm:text-3xl uppercase leading-snug">
                  ติดตามพัฒนาการนักกีฬา ยกระดับผลงานทีม พร้อมรายงานผลผู้บริหาร
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                  ยกระดับการฝึกซ้อมและการแข่งขันด้วยหลักฐานเชิงประจักษ์ โค้ชสามารถติดตามสถิติขั้นสูง 
                  (FIBA EFF, TS%, Shot Chart) บันทึกการเข้าซ้อม และส่งออกรายงานสรุปผลงานเสนอผู้บริหารสถานศึกษาได้ทันที
                </p>
                <div className="space-y-2.5 pt-1 text-xs">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Roster Management &amp; Player Growth Tracking</p>
                      <p className="text-slate-400 text-[11px]">กราฟวิเคราะห์แนวโน้มและพัฒนาการเชิงสถิติของนักกีฬาตลอดปีการศึกษา</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">รายงานสรุปผลงานสำหรับผู้บริหารสถานศึกษาและสมาคมผู้ปกครอง</p>
                      <p className="text-slate-400 text-[11px]">ส่งออกรายงานผลการแข่งขัน สถิติ และอัตราการเข้าฝึกซ้อมรูปแบบเอกสารทางการ (Official PDF)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">ระบบสนับสนุนแฟ้มสะสมผลงาน (TCAS Portfolio) สู่ระดับมหาวิทยาลัย</p>
                      <p className="text-slate-400 text-[11px]">แฟ้มสะสมผลงานของนักกีฬาในสังกัดได้รับการตรวจสอบสถิติและรับรองมาตรฐานอย่างเป็นทางการ</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-5 bg-slate-900 border border-slate-700 rounded-xl p-6 text-xs font-mono space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-slate-400">ACADEMY LICENSE</span>
                  <span className="text-white font-bold text-sm">฿1,500 – 3,500 / เดือน</span>
                </div>
                <div className="space-y-2 text-slate-300">
                  <p className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /><span>บริหารจัดการทีมได้สูงสุด 5 รุ่นอายุ (U12 – Open Division)</span></p>
                  <p className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /><span>สิทธิ์เข้าถึงระบบวิเคราะห์สถิติเชิงลึก (TS%, eFG%, Shot Chart)</span></p>
                  <p className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /><span>ระบบบันทึกการเข้าฝึกซ้อมและสถิติวินัย (Attendance Tracking)</span></p>
                  <p className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /><span>หน้าโปรไฟล์สถานศึกษาอย่างเป็นทางการบนศูนย์ข้อมูลกลาง</span></p>
                </div>
                <a
                  href="#contact-form"
                  className="block w-full py-2.5 rounded bg-[#DC2626] hover:bg-[#B91C1C] text-center font-bold text-white uppercase tracking-wider transition"
                >
                  ติดต่อขอรับสิทธิ์สำหรับสถานศึกษา
                </a>
              </div>
            </div>
          )}

          {activeTab === "SCOUT" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-5">
                <span className="text-xs font-mono font-bold text-red-400 uppercase tracking-widest">
                  FOR COLLEGES &amp; PRO SCOUTS
                </span>
                <h3 className="font-headline-lg text-white font-normal text-2xl sm:text-3xl uppercase leading-snug">
                  ค้นหาและคัดกรองบุคลากรนักกีฬาที่มีศักยภาพสูง พร้อมคลิปวิดีโอยืนยันทุกเพลย์
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                  เพิ่มประสิทธิภาพการเฟ้นหานักกีฬาของโค้ชมหาวิทยาลัยและแมวมองระดับอาชีพ คัดกรองตามข้อมูลสรีระชีวมิติ (Wingspan, Standing Reach) ดัชนีประสิทธิภาพสถิติ (FIBA EFF) และตรวจสอบวิดีโอคลิปการเล่นได้ทันทีแบบรอบด้าน
                </p>
                <div className="space-y-2.5 pt-1 text-xs">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Advanced Physical &amp; Efficiency Filters</p>
                      <p className="text-slate-400 text-[11px]">คัดกรองนักกีฬาขั้นสูงตามสรีระชีวมิติและสถิติ (เช่น ส่วนสูง, Wingspan, 3P%, FIBA EFF)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">ดัชนีวัดประสบการณ์และความต่อเนื่อง (Activity Index)</p>
                      <p className="text-slate-400 text-[11px]">ติดตามความสม่ำเสมอในการลงแข่งขันจริงย้อนหลัง เพื่อประเมินความพร้อมและเสถียรภาพของฟอร์มการเล่น</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">ระบบส่งสารทาบทามอย่างเป็นทางการ</p>
                      <p className="text-slate-400 text-[11px]">ระบบประสานงานติดต่อตรงถึงผู้ปกครองหรือผู้ฝึกสอนต้นสังกัดตามจรรยาบรรณวิชาชีพ</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-5 bg-slate-900 border border-slate-700 rounded-xl p-6 text-xs font-mono space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-slate-400">SCOUT PRO PASS</span>
                  <span className="text-white font-bold text-sm">฿890 – 1,500 / เดือน</span>
                </div>
                <div className="space-y-2 text-slate-300">
                  <p className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /><span>สิทธิ์เข้าถึงฐานข้อมูลและคัดกรองนักกีฬาทั่วประเทศไม่จำกัด</span></p>
                  <p className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /><span>ปลดล็อก Game Film ความละเอียดสูงและคลิปวิดีโอทุกเพลย์ตลอดฤดูกาล</span></p>
                  <p className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /><span>ระบบบันทึกรายชื่อนักกีฬาเป้าหมาย (Scout Shortlist) และติดตามผลงาน</span></p>
                  <p className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /><span>ส่งออกรายงานการประเมินสเกาต์รูปแบบ Excel / CSV และ PDF</span></p>
                </div>
                <a
                  href="#contact-form"
                  className="block w-full py-2.5 rounded bg-[#DC2626] hover:bg-[#B91C1C] text-center font-bold text-white uppercase tracking-wider transition"
                >
                  สมัครสมาชิกสิทธิ์ Scout Intelligence Pass
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

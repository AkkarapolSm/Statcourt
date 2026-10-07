"use client";

import React, { useState } from "react";
import {
  X,
  GraduationCap,
  Award,
  CheckCircle2,
  AlertCircle,
  FileText,
  Building,
  School,
  Download,
  Calendar,
  ShieldCheck,
  Plus,
} from "lucide-react";
import { AcademicRecord, TargetUniversityWish } from "@/lib/types";
import { mockAcademicRecords, mockTargetUniversities } from "@/lib/db/phase2-data";

interface AcademicTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  athleteId?: string;
  athleteName?: string;
  schoolName?: string;
}

export default function AcademicTrackerModal({
  isOpen,
  onClose,
  athleteId = "ath-1",
  athleteName = "Thanakorn Siriphan",
  schoolName = "Bangkok Christian College",
}: AcademicTrackerModalProps) {
  const athleteAcademic = mockAcademicRecords[athleteId] || { athleteId, gpax: 0, records: [] };
  const [records, setRecords] = useState<AcademicRecord[]>(athleteAcademic.records);
  const [gpax, setGpax] = useState(athleteAcademic.gpax);
  const [targetUnivs, setTargetUnivs] = useState<TargetUniversityWish[]>(mockTargetUniversities);
  const [activeTab, setActiveTab] = useState<"RECORDS" | "UNIVERSITIES">("RECORDS");

  React.useEffect(() => {
    if (!isOpen) return;
    fetch(`/api/athletes/${athleteId}/academic`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const mapped: AcademicRecord[] = json.data.map((r: any) => ({
            id: r.id,
            athleteId: r.athleteId,
            schoolYear: r.schoolYear,
            gradeLevel: r.gradeLevel,
            semester: r.semester,
            gpa: r.gpa,
            credits: 16.5,
            isVerified: r.isVerified ?? true,
            verifiedBy: "ฝ่ายทะเบียนและประมวลผล ร.ร.กรุงเทพคริสเตียนวิทยาลัย",
          }));
          setRecords(mapped);
          if (json.gpax) setGpax(json.gpax);
        }
      })
      .catch((err) => console.warn("Failed to load academic records from API:", err));
  }, [isOpen, athleteId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto font-sans">
      <div className="bg-[#0B1C30] border border-[#213145] w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#071322] border-b border-[#213145] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#AF101A] flex items-center justify-center text-white shadow-sm">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-white font-headline-lg uppercase text-lg sm:text-xl tracking-wide font-normal flex items-center gap-2">
                <span>Academic Eligibility &amp; GPAX Tracker</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#AF101A]/20 text-red-200 border border-[#AF101A]/60">
                  TCAS VERIFIED
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {athleteName} • {schoolName}
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

        {/* Top Summary Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-6 bg-[#081729]/70 border-b border-[#213145]">
          <div className="bg-[#0d223a] p-4 rounded-xl border border-[#213145]">
            <div className="text-[11px] text-slate-400 uppercase font-bold">
              ผลการเรียนเฉลี่ยสะสม (GPAX)
            </div>
            <div className="text-3xl font-headline-xl text-white font-normal mt-1 flex items-baseline gap-2">
              <span className="tabular-nums font-bold">{gpax.toFixed(2)}</span>
              <span className="text-xs font-mono text-slate-400">/ 4.00</span>
            </div>
            <div className="text-[11px] text-slate-300 flex items-center gap-1.5 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#AF101A]" />
              <span>ผ่านเกณฑ์ขั้นต่ำการคัดเลือกโควตานักกีฬา (&ge; 2.50)</span>
            </div>
          </div>

          <div className="bg-[#0d223a] p-4 rounded-xl border border-[#213145]">
            <div className="text-[11px] text-slate-400 uppercase font-bold">
              สถานะสิทธิ์โควตากีฬา TCAS
            </div>
            <div className="text-base font-bold text-white mt-1 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#AF101A]" />
              <span>ACADEMICALLY ELIGIBLE</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              ผ่านการตรวจสอบและรับรองผลการเรียนสะสม 4 ภาคเรียน
            </div>
          </div>

          <div className="bg-[#0d223a] p-4 rounded-xl border border-[#213145]">
            <div className="text-[11px] text-slate-400 uppercase font-bold">
              เป้าหมายสถาบันอุดมศึกษา
            </div>
            <div className="text-base font-bold text-white mt-1">
              <span className="tabular-nums">{targetUnivs.length}</span> สถาบันอุดมศึกษาเป้าหมาย
            </div>
            <div className="text-[11px] text-red-400 mt-1">
              มีคุณสมบัติตรงตามเกณฑ์ครบทุกสถาบัน (100%)
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-4 border-b border-[#213145] flex gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("RECORDS")}
            className={`pb-3 font-bold border-b-2 uppercase tracking-wide transition cursor-pointer ${
              activeTab === "RECORDS"
                ? "border-[#AF101A] text-white"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            ประวัติผลการเรียนสะสมรายภาคเรียน (Academic History)
          </button>
          <button
            onClick={() => setActiveTab("UNIVERSITIES")}
            className={`pb-3 font-bold border-b-2 uppercase tracking-wide transition cursor-pointer ${
              activeTab === "UNIVERSITIES"
                ? "border-[#AF101A] text-white"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            ตรวจสอบคุณสมบัติโควตาสถาบันอุดมศึกษา (University Matcher)
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-slate-200">
          
          {activeTab === "RECORDS" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">
                  บันทึกผลการเรียนเฉลี่ยรายภาคเรียน ระดับชั้นมัธยมศึกษาตอนปลาย
                </span>
                <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>ได้รับการรับรองโดยฝ่ายทะเบียนและวัดผลสถานศึกษา</span>
                </span>
              </div>

              <div className="border border-[#213145] rounded-xl overflow-hidden bg-[#0d223a]/60">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#071322] border-b border-[#213145] text-slate-400 uppercase text-[11px]">
                    <tr>
                      <th className="py-3 px-4">ระดับชั้น / ภาคเรียน</th>
                      <th className="py-3 px-4">ปีการศึกษา</th>
                      <th className="py-3 px-4 text-center">หน่วยกิตสะสม</th>
                      <th className="py-3 px-4 text-center">GPA ประจำภาค</th>
                      <th className="py-3 px-4 text-right">สถานะการรับรอง</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#213145]/60">
                    {records.map((rec) => (
                      <tr key={rec.id} className="hover:bg-white/[0.03] transition-colors">
                        <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                          <School className="w-3.5 h-3.5 text-red-400" />
                          <span>{rec.gradeLevel} ภาคเรียนที่ {rec.semester}</span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-300 tabular-nums">
                          {rec.schoolYear}
                        </td>
                        <td className="py-3.5 px-4 text-center text-slate-300 tabular-nums">
                          {rec.credits.toFixed(1)}
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-emerald-400 text-sm tabular-nums">
                          {rec.gpa.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/60 text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Verified</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-4 rounded-xl bg-[#0d223a] border border-[#213145] flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#AF101A]" />
                    <span>ใบระเบียนแสดงผลการเรียน (ปพ.1) ฉบับดิจิทัล</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    กำกับลายมือชื่ออิเล็กทรอนิกส์ (Digital Signature) พร้อมใช้เป็นเอกสารประกอบการยื่น TCAS Portfolio
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => alert("ดาวน์โหลดไฟล์ ปพ.1 ดิจิทัล (PDF) สำเร็จ")}
                  className="px-4 py-2 rounded-xl bg-[#071322] hover:bg-[#142C47] text-slate-200 border border-[#213145] text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#AF101A]" />
                  <span>ดาวน์โหลด ปพ.1 (PDF)</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === "UNIVERSITIES" && (
            <div className="space-y-3">
              <div className="text-xs text-slate-400">
                เกณฑ์การรับสมัครโควตากีฬาบาสเกตบอลของมหาวิทยาลัยพันธมิตรในระบบ TCAS
              </div>

              <div className="space-y-3">
                {targetUnivs.map((univ) => (
                  <div
                    key={univ.id}
                    className="p-4 rounded-xl bg-[#0d223a] border border-[#213145] hover:border-slate-600 transition space-y-3"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
                          <Building className="w-4 h-4 text-[#AF101A] shrink-0" />
                          <span>{univ.universityName}</span>
                        </div>
                        <div className="text-xs text-slate-300 mt-0.5">
                          {univ.faculty} • <span className="text-red-400 font-medium">{univ.quotaType}</span>
                        </div>
                      </div>

                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#AF101A]/20 text-red-200 border border-[#AF101A]/60 text-xs font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#AF101A]" />
                        <span>คุณสมบัติผ่านเกณฑ์</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs bg-[#071322] p-3 rounded-xl border border-[#213145]">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">เกณฑ์ผลการเรียนขั้นต่ำ (Min GPAX)</span>
                        <span className="font-bold text-white tabular-nums">&ge; {univ.minGpaxRequired.toFixed(2)}</span>
                        <span className="text-slate-300 ml-1.5 tabular-nums">(ผลการเรียนสะสม {univ.currentGpax.toFixed(2)})</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">สิทธิประโยชน์ทุนการศึกษา</span>
                        <span className="font-bold text-slate-200">{univ.scholarshipCoverage}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">กำหนดปิดรับสมัคร</span>
                        <span className="font-bold text-slate-300 flex items-center gap-1 tabular-nums">
                          <Calendar className="w-3 h-3 text-[#AF101A]" />
                          <span>{univ.deadlineDate}</span>
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400">
                      <span className="text-slate-300 font-bold">เงื่อนไข:</span> {univ.notes}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#071322] border-t border-[#213145] flex items-center justify-between">
          <span className="text-xs text-slate-400">
            ระบบเชื่อมโยงข้อมูลโดยตรงกับงานทะเบียนสถานศึกษาและระบบคัดเลือกกลางบุคคลเข้าศึกษาในสถาบันอุดมศึกษา (TCAS)
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#AF101A] hover:bg-[#8E0D15] text-white text-xs font-semibold tracking-wide transition shadow-md cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
}

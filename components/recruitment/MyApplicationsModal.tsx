"use client";

import React, { useState, useEffect } from "react";
import { X, Calendar, MapPin, CheckCircle2, Clock, AlertCircle, FileText, ChevronRight, Award, RefreshCw, Loader2 } from "lucide-react";
import { useAuthStore } from "@/lib/auth/useAuthStore";

interface MyApplicationsModalProps {
  onClose: () => void;
}

export default function MyApplicationsModal({ onClose }: MyApplicationsModalProps) {
  const { currentUser } = useAuthStore();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMyApplications = () => {
    setLoading(true);
    fetch("/api/opportunities/applications")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setApplications(data.data);
        }
      })
      .catch((err) => console.warn("Failed to load applications:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadMyApplications();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return { label: "ผ่านการคัดเลือก (รับเข้า)", bg: "bg-emerald-950 text-emerald-300 border-emerald-600" };
      case "INTERVIEW_SCHEDULED":
        return { label: "นัดคัดตัว / สัมภาษณ์", bg: "bg-amber-950 text-amber-300 border-amber-600" };
      case "SHORTLISTED":
        return { label: "ผ่านรอบคัดกรองพอร์ต", bg: "bg-blue-950 text-blue-300 border-blue-600" };
      case "REJECTED":
        return { label: "ไม่ผ่านการคัดเลือก", bg: "bg-red-950 text-red-300 border-red-600" };
      case "PENDING":
      default:
        return { label: "รอการตรวจสอบ", bg: "bg-slate-800 text-slate-300 border-slate-600" };
    }
  };

  const getStepIndex = (status: string) => {
    switch (status) {
      case "PENDING": return 1;
      case "SHORTLISTED": return 2;
      case "INTERVIEW_SCHEDULED": return 3;
      case "ACCEPTED":
      case "REJECTED": return 4;
      default: return 1;
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0B1C30] border border-slate-700 rounded-2xl max-w-2xl w-full p-6 text-white shadow-2xl space-y-5 cursor-default max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-[#DC2626] uppercase">
                ATHLETE RECRUITMENT STATUS
              </span>
              <button
                onClick={loadMyApplications}
                className="p-1 rounded text-slate-400 hover:text-white transition"
                title="รีเฟรชสถานะ"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>
            <h3 className="font-headline-md text-lg font-bold text-white mt-0.5">
              ติดตามสถานะใบสมัครโควตาและทุนการศึกษา
            </h3>
            <p className="text-xs text-slate-400">
              นักกีฬา: {currentUser.name} (TCAS Verified)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-12 text-center text-slate-400 flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-[#DC2626]" />
            <span className="text-xs font-mono">กำลังตรวจสอบสถานะใบสมัครจากระบบ...</span>
          </div>
        ) : applications.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
            <FileText className="w-8 h-8 text-slate-500 mx-auto" />
            <p className="text-sm font-bold text-slate-300">ยังไม่มีประวัติการยื่นใบสมัคร</p>
            <p className="text-xs text-slate-400">
              คุณสามารถดูโครงการทุนและโควตานักกีฬาที่เปิดรับสมัคร แล้วกดยื่นใบสมัครพร้อมพอร์ตดิจิทัลได้ทันที
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => {
              const badge = getStatusBadge(app.status);
              const step = getStepIndex(app.status);

              return (
                <div
                  key={app.id}
                  className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-3.5 text-xs font-mono"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">
                        {app.opportunity?.institution || "สถาบันการศึกษา"}
                      </span>
                      <h4 className="font-bold text-white text-sm">
                        {app.opportunity?.title || "ทุนการศึกษานักกีฬาบาสเกตบอล"}
                      </h4>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        ยื่นเมื่อ: {new Date(app.createdAt).toLocaleDateString("th-TH")} • รหัส {app.applicantTcasCode || app.id}
                      </span>
                    </div>

                    <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border ${badge.bg}`}>
                      {badge.label}
                    </span>
                  </div>

                  {/* Stepper indicator */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1.5">
                      <span className={step >= 1 ? "text-emerald-400 font-bold" : ""}>1. ยื่นใบสมัคร</span>
                      <span className={step >= 2 ? "text-blue-400 font-bold" : ""}>2. ตรวจสอบพอร์ต</span>
                      <span className={step >= 3 ? "text-amber-400 font-bold" : ""}>3. นัดคัดตัว</span>
                      <span className={step >= 4 ? (app.status === "ACCEPTED" ? "text-emerald-400 font-bold" : "text-red-400 font-bold") : ""}>
                        4. ผลการคัดเลือก
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden flex">
                      <div
                        className={`h-full transition-all duration-300 ${
                          app.status === "REJECTED" ? "bg-red-500" : "bg-emerald-500"
                        }`}
                        style={{ width: `${(step / 4) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Scheduled Tryout details if available */}
                  {app.interviewDate && (
                    <div className="p-3 bg-amber-950/40 border border-amber-500/40 rounded-lg space-y-1.5 text-[11px]">
                      <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>กำหนดการนัดคัดตัวสนามจริง / สัมภาษณ์:</span>
                      </div>
                      <div className="text-white">
                        วันเวลา: <span className="font-bold text-amber-200">{new Date(app.interviewDate).toLocaleString("th-TH")}</span>
                      </div>
                      {app.interviewVenue && (
                        <div className="text-slate-300 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-amber-400" />
                          <span>สถานที่: {app.interviewVenue}</span>
                        </div>
                      )}
                      {app.interviewNotes && (
                        <div className="text-slate-400 italic">
                          คำแนะนำ: {app.interviewNotes}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Decision notes if accepted */}
                  {app.decisionNotes && (
                    <div className="p-2.5 bg-slate-800/80 rounded-lg text-[11px] text-slate-300 border border-slate-700">
                      <span className="font-bold text-slate-200">ข้อความจากผู้รับสมัคร: </span>
                      {app.decisionNotes}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400 text-[11px]">
            * สถานะจะอัปเดตแบบเรียลไทม์เมื่อโค้ชผู้รับสมัครปรับข้อมูล
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold transition cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
}

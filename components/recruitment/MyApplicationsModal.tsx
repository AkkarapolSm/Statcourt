"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Calendar,
  MapPin,
  Check,
  Clock,
  FileText,
  RefreshCw,
  Loader2,
  Building2,
  Sparkles,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth/useAuthStore";

interface MyApplicationsModalProps {
  onClose: () => void;
}

const STEPS = [
  { id: 1, title: "ยื่นใบสมัคร" },
  { id: 2, title: "ตรวจสอบพอร์ต" },
  { id: 3, title: "นัดคัดตัว" },
  { id: 4, title: "ผลการคัดเลือก" },
];

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
        return {
          label: "ผ่านการคัดเลือก (รับเข้า)",
          bg: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
          dot: "bg-emerald-400",
        };
      case "INTERVIEW_SCHEDULED":
        return {
          label: "นัดคัดตัว / สัมภาษณ์",
          bg: "bg-purple-500/15 text-purple-300 border-purple-500/40",
          dot: "bg-purple-400",
        };
      case "SHORTLISTED":
        return {
          label: "ผ่านรอบคัดกรองพอร์ต",
          bg: "bg-sky-500/15 text-sky-300 border-sky-500/40",
          dot: "bg-sky-400",
        };
      case "REJECTED":
        return {
          label: "ไม่ผ่านการคัดเลือก",
          bg: "bg-rose-500/15 text-rose-300 border-rose-500/40",
          dot: "bg-rose-400",
        };
      case "PENDING":
      default:
        return {
          label: "รอการตรวจสอบ",
          bg: "bg-amber-500/15 text-amber-300 border-amber-500/40",
          dot: "bg-amber-400",
        };
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto cursor-pointer animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0B1C30] border border-[#213145] rounded-2xl max-w-2xl w-full p-6 sm:p-7 text-white shadow-2xl space-y-6 cursor-default max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#213145]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-semibold text-red-400 flex items-center gap-1.5 font-thai">
                <Sparkles className="w-3.5 h-3.5 text-[#AF101A]" />
                สถานะการคัดเลือกนักกีฬา
              </span>
              <button
                onClick={loadMyApplications}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition"
                title="รีเฟรชสถานะล่าสุด"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-emerald-400" : ""}`} />
              </button>
            </div>
            
            <h3 className="text-xl sm:text-2xl font-bold text-white font-headline">
              ติดตามสถานะใบสมัครโควตาและทุนการศึกษา
            </h3>
            
            <p className="text-xs sm:text-sm text-slate-300 font-sans mt-0.5">
              นักกีฬา: <strong className="text-white font-semibold">{currentUser.name || "ผู้สมัคร"}</strong>{" "}
              <span className="text-emerald-400 font-medium">(TCAS Verified)</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#0d223a] border border-transparent hover:border-[#213145] transition cursor-pointer"
            aria-label="ปิดหน้าต่าง"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-14 text-center text-slate-400 flex flex-col items-center gap-3">
            <Loader2 className="w-7 h-7 animate-spin text-[#AF101A]" />
            <span className="text-xs sm:text-sm font-sans">กำลังตรวจสอบสถานะใบสมัครจากระบบกลาง...</span>
          </div>
        ) : applications.length === 0 ? (
          <div className="p-8 text-center bg-white/[0.03] rounded-2xl border border-white/[0.08] space-y-3 font-thai">
            <FileText className="w-10 h-10 text-slate-500 mx-auto" />
            <p className="text-base font-bold text-slate-200">ยังไม่มีประวัติการยื่นใบสมัคร</p>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
              คุณสามารถดูโครงการทุนและโควตานักกีฬาที่เปิดรับสมัคร แล้วกดยื่นใบสมัครพร้อมพอร์ตดิจิทัลได้ทันที
            </p>
          </div>
        ) : (
          <div className="space-y-4 font-thai">
            {applications.map((app) => {
              const badge = getStatusBadge(app.status);
              const currentStep = getStepIndex(app.status);

              return (
                <div
                  key={app.id}
                  className="p-5 bg-white/[0.03] hover:bg-white/[0.05] rounded-2xl border border-white/[0.08] transition-all space-y-4"
                >
                  {/* Top Row: Institution + Title + Badge */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-[#A9B6C8]">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{app.opportunity?.institution || "สถาบันการศึกษา"}</span>
                      </div>
                      
                      <h4 className="font-bold text-white text-base leading-snug">
                        {app.opportunity?.title || "ทุนการศึกษานักกีฬาบาสเกตบอล"}
                      </h4>
                      
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 pt-0.5">
                        <span>ยื่นเมื่อ: {new Date(app.createdAt).toLocaleDateString("th-TH")}</span>
                        <span>•</span>
                        <span>รหัส: <code className="font-mono text-[11px] text-slate-300 bg-white/5 px-1.5 py-0.5 rounded">{app.applicantTcasCode || app.id}</code></span>
                      </div>
                    </div>

                    {/* Non-clickable status pill */}
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border shrink-0 ${badge.bg}`}>
                      <span className={`w-2 h-2 rounded-full ${badge.dot} animate-pulse`} />
                      <span>{badge.label}</span>
                    </div>
                  </div>

                  {/* Enhanced Stepper with Visual Nodes */}
                  <div className="pt-2">
                    <div className="relative flex items-center justify-between">
                      {/* Connecting Background Line */}
                      <div className="absolute top-3.5 left-4 right-4 h-1 bg-slate-800 -z-0 rounded-full" />
                      {/* Active Progress Fill */}
                      <div
                        className={`absolute top-3.5 left-4 h-1 rounded-full transition-all duration-500 -z-0 ${
                          app.status === "REJECTED" ? "bg-rose-500" : "bg-emerald-500"
                        }`}
                        style={{
                          width: `${Math.max(0, ((currentStep - 1) / (STEPS.length - 1)) * 90)}%`,
                        }}
                      />

                      {/* Step Nodes */}
                      {STEPS.map((step) => {
                        const isDone = currentStep > step.id;
                        const isCurrent = currentStep === step.id;
                        const isRejectedEnd = step.id === 4 && app.status === "REJECTED";

                        return (
                          <div key={step.id} className="flex flex-col items-center gap-2 z-10">
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                isDone
                                  ? "bg-emerald-500 text-white shadow-md shadow-emerald-950"
                                  : isCurrent
                                  ? isRejectedEnd
                                    ? "bg-rose-500 text-white ring-4 ring-rose-500/20"
                                    : "bg-[#0B1C30] border-2 border-emerald-400 text-emerald-400 ring-4 ring-emerald-500/20"
                                  : "bg-slate-800 border border-slate-700 text-slate-500"
                              }`}
                            >
                              {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : step.id}
                            </div>
                            <span
                              className={`text-[11px] font-medium text-center transition-colors ${
                                isCurrent
                                  ? isRejectedEnd
                                    ? "text-rose-400 font-bold"
                                    : "text-emerald-300 font-bold"
                                  : isDone
                                  ? "text-slate-300"
                                  : "text-slate-500"
                              }`}
                            >
                              {step.title}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Scheduled Tryout details if available */}
                  {app.interviewDate && (
                    <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-2 text-xs">
                      <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                        <Calendar className="w-4 h-4" />
                        <span>กำหนดการนัดคัดตัวสนามจริง / สัมภาษณ์</span>
                      </div>
                      <div className="text-slate-200">
                        วันเวลา: <span className="font-bold text-amber-200">{new Date(app.interviewDate).toLocaleString("th-TH")}</span>
                      </div>
                      {app.interviewVenue && (
                        <div className="text-slate-300 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
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

                  {/* Decision notes if available */}
                  {app.decisionNotes && (
                    <div className="p-3 bg-white/[0.04] rounded-xl text-xs text-slate-300 border border-white/[0.06]">
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
        <div className="pt-3 border-t border-[#213145] flex items-center justify-between text-xs font-thai">
          <span className="text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            สถานะจะอัปเดตแบบเรียลไทม์เมื่อโค้ชปรับข้อมูล
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#0d223a] hover:bg-[#122842] text-white font-medium border border-[#213145] transition-colors cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
}

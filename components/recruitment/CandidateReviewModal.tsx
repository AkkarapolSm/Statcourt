"use client";

import React, { useState } from "react";
import { X, Calendar, MapPin, CheckCircle2, Clock, AlertCircle, FileText, UserCheck, Loader2 } from "lucide-react";

interface CandidateReviewModalProps {
  application: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CandidateReviewModal({
  application,
  onClose,
  onSuccess,
}: CandidateReviewModalProps) {
  const [status, setStatus] = useState<string>(application.status || "PENDING");
  const [interviewDate, setInterviewDate] = useState<string>(
    application.interviewDate ? new Date(application.interviewDate).toISOString().slice(0, 16) : ""
  );
  const [interviewVenue, setInterviewVenue] = useState<string>(application.interviewVenue || "");
  const [interviewNotes, setInterviewNotes] = useState<string>(application.interviewNotes || "");
  const [decisionNotes, setDecisionNotes] = useState<string>(application.decisionNotes || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/opportunities/applications/${application.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          interviewDate: interviewDate || null,
          interviewVenue: interviewVenue || null,
          interviewNotes: interviewNotes || null,
          decisionNotes: decisionNotes || null,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "เกิดข้อผิดพลาดในการบันทึก");
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1C30]/85 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto cursor-pointer animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0B1C30] border border-[#213145] rounded-2xl max-w-xl w-full p-5 sm:p-6 text-white shadow-2xl space-y-5 cursor-default max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-[#213145]">
          <div>
            <span className="text-[10px] font-mono font-bold text-red-400 uppercase">
              RECRUITER CANDIDATE SCREENING
            </span>
            <h3 className="font-headline text-lg sm:text-xl font-bold text-white mt-0.5">
              คัดกรองและประเมินผู้สมัคร: {application.applicantName}
            </h3>
            <p className="text-xs text-slate-400 font-sans">
              โครงการ: {application.opportunity?.title || "ทุนนักกีฬาบาสเกตบอล"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#142C47] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Candidate Dossier Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 bg-[#071322] rounded-xl border border-[#213145] text-xs font-sans">
          <div>
            <span className="text-slate-400 block text-[10px]">ตำแหน่ง</span>
            <span className="font-bold text-white font-mono">{application.applicantPosition}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">GPAX</span>
            <span className="font-bold text-emerald-400 tabular-nums">{application.applicantGpax}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">เบอร์ติดต่อ</span>
            <span className="font-medium text-white tabular-nums">{application.applicantPhone}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">TCAS Code</span>
            <span className="font-mono text-amber-400 truncate block">
              {application.applicantTcasCode || "N/A"}
            </span>
          </div>
        </div>

        {application.applicantNotes && (
          <div className="p-3.5 bg-[#071322] rounded-xl border border-[#213145] text-xs font-sans">
            <span className="text-slate-400 text-[10px] font-bold block mb-1">
              ข้อความแนะนำตัวจากนักกีฬา:
            </span>
            <p className="text-slate-300 italic">"{application.applicantNotes}"</p>
          </div>
        )}

        {/* Action Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
          {error && (
            <div className="p-3 bg-red-950/80 border border-red-800 text-red-200 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Status Selection */}
          <div>
            <label className="block text-slate-300 font-bold mb-1.5">
              สถานะการพิจารณา (Recruitment Status)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { val: "PENDING", label: "รอการตรวจสอบ", color: "border-slate-600 text-slate-300" },
                { val: "SHORTLISTED", label: "ผ่านรอบพอร์ต", color: "border-blue-500 text-blue-300" },
                { val: "INTERVIEW_SCHEDULED", label: "นัดคัดตัว/สัมภาษณ์", color: "border-amber-500 text-amber-300" },
                { val: "ACCEPTED", label: "ผ่านการคัดเลือก (รับเข้า)", color: "border-emerald-500 text-emerald-300" },
                { val: "REJECTED", label: "ไม่ผ่านเกณฑ์", color: "border-red-500 text-red-300" },
              ].map((item) => (
                <button
                  type="button"
                  key={item.val}
                  onClick={() => setStatus(item.val)}
                  className={`p-2.5 rounded-xl border text-left font-bold transition cursor-pointer ${
                    status === item.val
                      ? `bg-white/10 ${item.color} ring-1 ring-white/30`
                      : "bg-[#071322] border-[#213145] text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <span className="block text-[11px]">{item.label}</span>
                  <span className="text-[9px] font-mono opacity-70">{item.val}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Interview / Tryout Scheduling Fields */}
          {(status === "INTERVIEW_SCHEDULED" || status === "SHORTLISTED") && (
            <div className="p-3.5 bg-[#071322] rounded-xl border border-amber-500/40 space-y-3 animate-in fade-in">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                <Calendar className="w-4 h-4" />
                <span>กำหนดการนัดคัดตัวสนามจริง / สัมภาษณ์ (Tryout &amp; Interview)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 text-[11px]">วันและเวลานัดหมาย</label>
                  <input
                    type="datetime-local"
                    value={interviewDate}
                    onChange={(e) => setInterviewDate(e.target.value)}
                    className="w-full bg-[#0d223a] border border-[#213145] rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400 text-xs tabular-nums"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 text-[11px]">สถานที่นัดหมาย / ยิมเนเซียม</label>
                  <input
                    type="text"
                    placeholder="เช่น ยิมเนเซียม 1 ศูนย์กีฬาจุฬาฯ"
                    value={interviewVenue}
                    onChange={(e) => setInterviewVenue(e.target.value)}
                    className="w-full bg-[#0d223a] border border-[#213145] rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 text-[11px]">คำแนะนำการเตรียมตัวสำหรับนักกีฬา</label>
                <textarea
                  rows={2}
                  placeholder="เช่น นำชุดฝึกซ้อมบาสเกตบอล รองเท้าคอร์ทในร่ม และสำเนา ปพ.1 ฉบับจริงมาด้วย"
                  value={interviewNotes}
                  onChange={(e) => setInterviewNotes(e.target.value)}
                  className="w-full bg-[#0d223a] border border-[#213145] rounded-xl p-2.5 text-white outline-none focus:border-amber-400 resize-none text-xs"
                />
              </div>
            </div>
          )}

          {/* Decision Notes */}
          <div>
            <label className="block text-slate-400 mb-1 text-[11px]">
              บันทึกผลการประเมินของผู้รับสมัคร (Internal / Decision Notes)
            </label>
            <textarea
              rows={2}
              placeholder="บันทึกความคิดเห็นโค้ช เช่น สมรรถภาพ Ape Index ดีเด่น, สไตล์เหมาะกับระบบ Offense ทีม"
              value={decisionNotes}
              onChange={(e) => setDecisionNotes(e.target.value)}
              className="w-full bg-[#071322] border border-[#213145] rounded-xl p-2.5 text-white outline-none focus:border-slate-500 resize-none text-xs"
            />
          </div>

          {/* Submit Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#0d223a] border border-[#213145] hover:bg-[#122842] text-slate-300 font-medium transition cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#AF101A] hover:bg-[#8E0D15] text-white font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>กำลังบันทึก...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>บันทึกผลการประเมิน</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

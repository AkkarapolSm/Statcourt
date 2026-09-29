"use client";

import React, { useState, useEffect } from "react";
import { X, Trophy, Users, ShieldCheck, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useAuthStore } from "@/lib/auth/useAuthStore";

interface TournamentRegisterModalProps {
  tournament: {
    id: string;
    name: string;
    category?: string;
    entryFeeThb?: number;
    maxTeams?: number;
    registeredTeams?: number;
    organizer?: string;
  };
  onClose: () => void;
  onSuccess?: () => void;
}

export default function TournamentRegisterModal({
  tournament,
  onClose,
  onSuccess,
}: TournamentRegisterModalProps) {
  const { currentUser } = useAuthStore();
  const [teams, setTeams] = useState<any[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [selectedRosterIds, setSelectedRosterIds] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    // Fetch available teams
    fetch("/api/teams")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setTeams(data.data);
          if (data.data.length > 0) {
            setSelectedTeamId(data.data[0].id);
          }
        }
      })
      .catch((err) => console.error("Failed to load teams:", err))
      .finally(() => setLoading(false));
  }, []);

  const selectedTeam = teams.find((t) => t.id === selectedTeamId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeamId) {
      setError("กรุณาเลือกทีมที่ต้องการส่งเข้าแข่งขัน");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/tournaments/${encodeURIComponent(tournament.id)}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId: selectedTeamId,
          rosterIds: selectedRosterIds,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "เกิดข้อผิดพลาดในการลงทะเบียนทีม");
      }

      setSuccessMessage(data.message || "ส่งใบสมัครเข้าร่วมการแข่งขันเรียบร้อยแล้ว");
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "การส่งใบสมัครไม่สำเร็จ");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#0B1C30] text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white transition p-1 rounded-full hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-red-600/30 text-red-400 text-xs px-2.5 py-0.5 rounded font-mono font-bold border border-red-500/30">
              OFFICIAL TEAM REGISTRATION
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold font-headline-md tracking-wide">
            ลงทะเบียนทีมเข้าร่วมการแข่งขัน
          </h2>
          <p className="text-xs text-slate-300 mt-1 line-clamp-1">{tournament.name}</p>
        </div>

        {/* Content */}
        {successMessage ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">ลงทะเบียนทีมเรียบร้อยแล้ว</h3>
            <p className="text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
              {successMessage} ทางคณะกรรมการฝ่ายเทคนิค BSAT จะดำเนินการตรวจสอบคุณสมบัติและแจ้งผลการรับรองรายชื่อ
            </p>
            <button
              onClick={onClose}
              className="bg-primary hover:bg-[#8e0d15] text-white px-6 py-2.5 rounded-lg font-bold text-sm transition"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Tournament Details Banner */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 grid grid-cols-2 gap-3 text-xs font-mono">
              <div>
                <span className="text-slate-500 block">ค่าธรรมเนียมสมัคร:</span>
                <span className="font-bold text-primary text-sm">
                  {tournament.entryFeeThb ? `฿${tournament.entryFeeThb.toLocaleString()} / ทีม` : "ฟรีค่าธรรมเนียม"}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">รุ่นอายุที่แข่งขัน:</span>
                <span className="font-bold text-slate-900 text-sm">
                  รุ่น {tournament.category || "U18"}
                </span>
              </div>
            </div>

            {/* Team Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                เลือกทีม / สโมสรที่ต้องการส่งสมัคร *
              </label>
              {loading ? (
                <div className="h-10 bg-slate-100 rounded-lg animate-pulse" />
              ) : teams.length === 0 ? (
                <p className="text-xs text-red-600">ไม่พบทีมที่คุณดูแลอยู่ในระบบ</p>
              ) : (
                <select
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm font-semibold focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                >
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.institution})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Roster Notification */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">ระบบตรวจสอบสิทธิ์อัตโนมัติ:</span> รายชื่อนักกีฬาของทีมจะถูกส่งเข้าสู่กระบวนการตรวจ Digital Player Pass และล็อกรายชื่อก่อนแข่งขัน 48 ชั่วโมง
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                หมายเหตุเพิ่มเติม / ผู้ติดต่อฉุกเฉิน
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="เช่น สีชุดแข่งหลัก/สำรอง, เบอร์โทรผู้ช่วยผู้ฝึกสอน..."
                rows={2}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={submitting || loading || teams.length === 0}
                className="bg-primary hover:bg-[#8e0d15] text-white px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>กำลังส่งใบสมัคร...</span>
                  </>
                ) : (
                  <span>ยืนยันการส่งใบสมัครทีม</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

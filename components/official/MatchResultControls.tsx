"use client";

import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import PreApprovalAuditModal from "@/components/admin/PreApprovalAuditModal";

export default function MatchResultControls({
  matchId,
  onStatusChange,
  pendingSyncCount,
}: {
  matchId: string;
  onStatusChange?: (status: string) => void;
  pendingSyncCount: number;
}) {
  const [status, setStatus] = useState<string>("LOADING");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [auditOpen, setAuditOpen] = useState(false);

  useEffect(() => {
    fetch(`/api/matches/${encodeURIComponent(matchId)}/result`)
      .then(async (response) => {
        if (!response.ok) throw new Error("โหลดสถานะผลแข่งขันไม่สำเร็จ");
        return response.json();
      })
      .then((data) => {
        setStatus(data.match.resultStatus);
        onStatusChange?.(data.match.resultStatus);
      })
      .catch((cause) => setError(cause instanceof Error ? cause.message : "เกิดข้อผิดพลาด"));
  }, [matchId, onStatusChange]);

  async function submit() {
    if (pendingSyncCount > 0) {
      setError("มีรายการออฟไลน์ที่ยังไม่ซิงก์ กรุณาซิงก์ก่อนส่งผล");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/matches/${encodeURIComponent(matchId)}/result`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "SUBMIT" }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "ส่งผลไม่สำเร็จ");
      setStatus(data.match.resultStatus);
      onStatusChange?.(data.match.resultStatus);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "ส่งผลไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="bg-[#0B1C30] border-b border-[#213145] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-200 font-sans">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-bold text-white flex items-center gap-2">
            <span>สถานะผลแข่งขัน:</span>
            <span
              className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] border ${
                status === "FINAL"
                  ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/50"
                  : status === "PENDING_APPROVAL"
                  ? "bg-amber-950/80 text-amber-300 border-amber-500/50"
                  : "bg-[#0d223a] text-slate-300 border-[#213145]"
              }`}
            >
              {status === "DRAFT"
                ? "กำลังบันทึก (DRAFT)"
                : status === "PENDING_APPROVAL"
                ? "รอผู้ดูแลรับรอง (PENDING)"
                : status === "FINAL"
                ? "รับรองแล้ว (FINAL)"
                : "กำลังโหลด"}
            </span>
          </span>

          {status === "DRAFT" && (
            <button
              disabled={busy || pendingSyncCount > 0}
              onClick={submit}
              className="rounded-xl bg-[#AF101A] hover:bg-[#8E0D15] px-4 py-1.5 font-bold text-white transition disabled:opacity-50 cursor-pointer shadow-xs active:scale-95"
            >
              {busy ? "กำลังส่ง..." : "ส่งผลเพื่อขอรับรอง"}
            </button>
          )}

          {/* Pre-approval Audit Button */}
          <button
            type="button"
            onClick={() => setAuditOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0d223a] border border-[#213145] hover:bg-[#142e4e] text-slate-200 font-semibold transition cursor-pointer shadow-xs active:scale-95"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>ตรวจความครบถ้วนก่อนรับรอง</span>
          </button>
        </div>

        {error && <span role="alert" className="text-red-400 text-xs font-semibold">{error}</span>}
      </div>

      <PreApprovalAuditModal
        isOpen={auditOpen}
        onClose={() => setAuditOpen(false)}
        matchId={matchId}
        onApprovedSuccess={() => {
          setStatus("FINAL");
          onStatusChange?.("FINAL");
        }}
        onReopenedSuccess={() => {
          setStatus("DRAFT");
          onStatusChange?.("DRAFT");
        }}
      />
    </>
  );
}

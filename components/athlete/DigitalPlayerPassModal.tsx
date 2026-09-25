"use client";

import React, { useState } from "react";
import {
  X,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  User,
  Calendar,
  Building,
  Hash,
  Download,
  Scan,
} from "lucide-react";

export interface DigitalPassData {
  athleteId: string;
  fullName: string;
  fullNameEn: string;
  jerseyNumber: number;
  schoolName: string;
  dateOfBirth: string;
  verifiedAge: number;
  eligibleCategory: string;
  nationalIdHashed: string;
  tcasBatch: string;
  status: "ACTIVE" | "SUSPENDED" | "BANNED";
  passQrCode: string;
  issuedBy: string;
  validUntil: string;
}

interface DigitalPlayerPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerData?: Partial<DigitalPassData>;
}

export default function DigitalPlayerPassModal({
  isOpen,
  onClose,
  playerData,
}: DigitalPlayerPassModalProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [passData, setPassData] = useState<Partial<DigitalPassData>>(playerData || {});
  const [scanResult, setScanResult] = useState<{
    verifiedAt: string;
    gatekeeper: string;
    court: string;
    verified: boolean;
  } | null>(null);

  React.useEffect(() => {
    if (!isOpen) return;
    const athleteId = playerData?.athleteId;
    if (!athleteId) return;

    fetch(`/api/athletes/${athleteId}/pass`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          const d = json.data;
          setPassData((prev) => ({
            ...prev,
            athleteId: d.athleteId || athleteId,
            nationalIdHashed: d.idCardNumberHash || prev?.nationalIdHashed,
            verifiedAge: d.verifiedAge || prev?.verifiedAge,
            passQrCode: d.qrPassCode || prev?.passQrCode,
            status: d.status || prev?.status,
            dateOfBirth: d.dateOfBirth ? new Date(d.dateOfBirth).toISOString().split("T")[0] : prev?.dateOfBirth,
          }));
        }
      })
      .catch((err) => console.warn("Failed to fetch digital pass from API:", err));
  }, [isOpen, playerData?.athleteId]);

  if (!isOpen) return null;

  const data: DigitalPassData = {
    athleteId: passData.athleteId || playerData?.athleteId || "ath-1",
    fullName: passData.fullName || playerData?.fullName || "ธนากร ศิริพันธ์",
    fullNameEn: passData.fullNameEn || playerData?.fullNameEn || "Thanakorn Siriphan",
    jerseyNumber: passData.jerseyNumber ?? playerData?.jerseyNumber ?? 7,
    schoolName: passData.schoolName || playerData?.schoolName || "โรงเรียนกรุงเทพคริสเตียนวิทยาลัย (BCC)",
    dateOfBirth: passData.dateOfBirth || playerData?.dateOfBirth || "2008-05-14",
    verifiedAge: passData.verifiedAge ?? playerData?.verifiedAge ?? 17,
    eligibleCategory: passData.eligibleCategory || playerData?.eligibleCategory || "U18 DIVISION 1",
    nationalIdHashed: passData.nationalIdHashed || playerData?.nationalIdHashed || "1-1004-XXXXX-78-9",
    tcasBatch: passData.tcasBatch || playerData?.tcasBatch || "TCAS-68",
    status: passData.status || playerData?.status || "ACTIVE",
    passQrCode: passData.passQrCode || playerData?.passQrCode || "STATCOURT-PASS-TH-2026-ATH-007",
    issuedBy: passData.issuedBy || playerData?.issuedBy || "สมาคมกีฬาบาสเกตบอลแห่งประเทศไทย (BSAT)",
    validUntil: passData.validUntil || playerData?.validUntil || "2027-03-31",
  };

  const handleSimulateScan = () => {
    setIsScanning(true);
    setScanResult(null);
    setTimeout(() => {
      setIsScanning(false);
      setScanResult({
        verifiedAt: new Date().toLocaleTimeString("th-TH"),
        gatekeeper: "นายศุภชัย โต๊ะเทคนิคสนาม 1",
        court: "อาคารนิมิบุตร สนามกีฬาแห่งชาติ",
        verified: true,
      });
    }, 1200);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full text-white shadow-2xl p-6 cursor-default space-y-5 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#DC2626]/20 border border-[#DC2626]/40 flex items-center justify-center text-[#DC2626]">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-red-400 uppercase tracking-widest block">
                TOURNAMENT INTEGRITY GUARD
              </span>
              <h3 className="font-headline-md text-white font-bold text-lg uppercase">
                Digital Player Pass (บัตรนักกีฬา)
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Digital Pass Card Body */}
        <div className="bg-gradient-to-b from-slate-800 via-slate-800/90 to-slate-900 border-2 border-[#AF101A] rounded-xl p-5 shadow-xl relative overflow-hidden space-y-4 font-mono select-none">
          {/* Watermark Logo */}
          <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-[#AF101A]/10 rounded-full blur-2xl pointer-events-none" />

          {/* Pass Card Top */}
          <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-[#AF101A] text-white font-black text-xs rounded flex items-center justify-center">
                SC
              </div>
              <span className="font-bold text-xs text-white">STATCOURT.TH PASS</span>
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#AF101A]/20 text-red-200 border border-[#AF101A]/60 text-[10px] font-bold">
              <ShieldCheck className="w-3 h-3 text-[#DC2626]" />
              VERIFIED ELIGIBLE
            </span>
          </div>

          {/* Athlete Info & Photo Row */}
          <div className="flex items-start gap-3.5 pt-1">
            <div className="w-20 h-24 rounded-lg bg-slate-700 border border-slate-600 flex flex-col items-center justify-center text-white shrink-0 relative overflow-hidden shadow">
              <User className="w-8 h-8 text-slate-400 mb-1" />
              <span className="font-headline-lg text-lg font-black text-[#DC2626] leading-none">
                #{data.jerseyNumber}
              </span>
              <span className="text-[8px] text-slate-400 mt-0.5">U18 ATHLETE</span>
            </div>

            <div className="space-y-1 text-xs">
              <p className="font-headline-sm text-white font-bold text-base uppercase font-sans">
                {data.fullName}
              </p>
              <p className="text-slate-400 text-[11px]">{data.fullNameEn}</p>
              <p className="text-slate-300 text-[11px] line-clamp-1">
                {data.schoolName}
              </p>
              <div className="pt-1 flex flex-wrap gap-1 text-[10px]">
                <span className="px-1.5 py-0.2 rounded bg-slate-900 border border-slate-700 text-slate-300">
                  อายุ {data.verifiedAge} ปี ({data.eligibleCategory})
                </span>
                <span className="px-1.5 py-0.2 rounded bg-red-950 border border-red-800 text-red-300 font-bold">
                  {data.tcasBatch}
                </span>
              </div>
            </div>
          </div>

          {/* QR Code and Hash Row */}
          <div className="p-3 bg-white rounded-lg flex items-center justify-between text-slate-900 gap-3">
            {/* Visual simulated QR */}
            <div className="w-16 h-16 bg-[#0F172A] rounded p-1 flex items-center justify-center shrink-0">
              <QrCode className="w-14 h-14 text-white" />
            </div>

            <div className="text-[10px] space-y-0.5 flex-1">
              <p className="font-bold text-slate-900 uppercase">PASS CODE:</p>
              <p className="text-[#DC2626] font-bold text-xs tracking-wider">{data.passQrCode}</p>
              <p className="text-slate-500">ID HASH: {data.nationalIdHashed}</p>
              <p className="text-slate-500">วันหมดอายุ: {data.validUntil}</p>
            </div>
          </div>

          {/* Pass Footer */}
          <div className="text-[9px] text-slate-400 text-center pt-1 border-t border-slate-800">
            ออกโดย: {data.issuedBy} • สแกนหน้าสนามก่อนลงแข่งทุกแมตช์
          </div>
        </div>

        {/* Scan & Verification Simulator */}
        <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 space-y-3 text-xs font-mono">
          <div className="flex items-center justify-between">
            <span className="text-slate-300 font-bold uppercase text-[11px]">
              เครื่องจำลองการสแกนหน้าสนาม (GATE SCANNER):
            </span>
            <button
              onClick={handleSimulateScan}
              disabled={isScanning}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold transition disabled:opacity-50"
            >
              <Scan className="w-3.5 h-3.5" />
              <span>{isScanning ? "กำลังสแกน..." : "สแกนตรวจสอบบัตร"}</span>
            </button>
          </div>

          {scanResult && (
            <div className="p-3 bg-slate-900 border border-slate-700 rounded text-white space-y-1 animate-in fade-in duration-200">
              <div className="flex items-center gap-1.5 font-bold text-white">
                <CheckCircle2 className="w-4 h-4 text-[#DC2626]" />
                <span>ยืนยันคุณสมบัตินักกีฬาถูกต้อง — อนุญาตให้ลงสนาม</span>
              </div>
              <p className="text-[11px] text-slate-300">
                เวลาที่สแกน: {scanResult.verifiedAt} | กรรมการ: {scanResult.gatekeeper}
              </p>
              <p className="text-[10px] text-slate-400">
                สนาม: {scanResult.court} • ป้องกันการสวมสิทธิ์สำเร็จ (Audit Log #LOG-889)
              </p>
            </div>
          )}
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-1">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs font-bold uppercase transition"
          >
            ปิดหน้าต่าง
          </button>
        </div>

      </div>
    </div>
  );
}

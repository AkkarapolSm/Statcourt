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
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1C30]/85 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto cursor-pointer animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0B1C30] border border-[#213145] rounded-2xl max-w-md w-full text-white shadow-2xl p-5 sm:p-6 cursor-default space-y-5"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#213145]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#AF101A]/20 border border-[#AF101A]/40 flex items-center justify-center text-red-400">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-red-400 uppercase tracking-widest block">
                TOURNAMENT INTEGRITY GUARD
              </span>
              <h3 className="font-headline font-bold text-white text-base sm:text-lg">
                บัตรประจำตัวนักกีฬาดิจิทัล (Digital Player Pass)
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#142C47] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Digital Pass Card Body */}
        <div className="bg-[#071322] border-2 border-[#AF101A] rounded-2xl p-5 shadow-xl relative overflow-hidden space-y-4 font-sans select-none">
          {/* Watermark Logo */}
          <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-[#AF101A]/10 rounded-full blur-2xl pointer-events-none" />

          {/* Pass Card Top */}
          <div className="flex items-center justify-between border-b border-[#213145] pb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-[#AF101A] text-white font-black text-xs rounded flex items-center justify-center font-headline">
                SC
              </div>
              <span className="font-bold text-xs text-white font-headline tracking-wide">STATCOURT.TH PASS</span>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-600/50 text-[10px] font-bold font-mono">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              VERIFIED ELIGIBLE
            </span>
          </div>

          {/* Athlete Info & Photo Row */}
          <div className="flex items-start gap-3.5 pt-1">
            <div className="w-20 h-24 rounded-xl bg-[#0d223a] border border-[#213145] flex flex-col items-center justify-center text-white shrink-0 relative overflow-hidden shadow-xs">
              <User className="w-8 h-8 text-slate-400 mb-1" />
              <span className="font-headline text-lg font-black text-red-400 leading-none tabular-nums">
                #{data.jerseyNumber}
              </span>
              <span className="text-[8px] text-slate-400 mt-0.5 font-mono">U18 ATHLETE</span>
            </div>

            <div className="space-y-1 text-xs">
              <p className="font-headline text-white font-bold text-base">
                {data.fullName}
              </p>
              <p className="text-slate-400 text-[11px] font-sans">{data.fullNameEn}</p>
              <p className="text-slate-300 text-[11px] line-clamp-1 font-sans">
                {data.schoolName}
              </p>
              <div className="pt-1 flex flex-wrap gap-1 text-[10px] font-sans">
                <span className="px-2 py-0.5 rounded-full bg-[#0d223a] border border-[#213145] text-slate-300">
                  อายุ <span className="tabular-nums">{data.verifiedAge}</span> ปี ({data.eligibleCategory})
                </span>
                <span className="px-2 py-0.5 rounded-full bg-red-950/80 border border-red-800 text-red-300 font-bold">
                  {data.tcasBatch}
                </span>
              </div>
            </div>
          </div>

          {/* QR Code and Hash Row */}
          <div className="p-3 bg-white rounded-xl flex items-center justify-between text-slate-900 gap-3">
            {/* Visual simulated QR */}
            <div className="w-16 h-16 bg-[#0B1C30] rounded-lg p-1 flex items-center justify-center shrink-0">
              <QrCode className="w-14 h-14 text-white" />
            </div>

            <div className="text-[10px] space-y-0.5 flex-1 font-sans">
              <p className="font-bold text-slate-900 uppercase font-mono">PASS CODE:</p>
              <p className="text-[#AF101A] font-bold text-xs tracking-wider font-mono">{data.passQrCode}</p>
              <p className="text-slate-600 font-mono">ID HASH: {data.nationalIdHashed}</p>
              <p className="text-slate-600">วันหมดอายุ: <span className="tabular-nums">{data.validUntil}</span></p>
            </div>
          </div>

          {/* Pass Footer */}
          <div className="text-[9px] text-slate-400 text-center pt-1 border-t border-[#213145] font-sans">
            หน่วยงานผู้ออกบัตร: {data.issuedBy} • ใช้สำหรับตรวจสอบคุณสมบัติก่อนลงทำการแข่งขันทุกแมตช์
          </div>
        </div>

        {/* Scan & Verification Simulator */}
        <div className="bg-[#071322] border border-[#213145] rounded-xl p-4 space-y-3 text-xs font-sans">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-slate-300 font-bold text-[11px]">
              ระบบจำลองการตรวจสอบสิทธิ์หน้าสนามแข่งขัน (Gate Scanner):
            </span>
            <button
              onClick={handleSimulateScan}
              disabled={isScanning}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#AF101A] hover:bg-[#8E0D15] text-white font-medium transition disabled:opacity-50 cursor-pointer"
            >
              <Scan className="w-3.5 h-3.5" />
              <span>{isScanning ? "กำลังสแกน..." : "ตรวจสอบความถูกต้องของบัตร"}</span>
            </button>
          </div>

          {scanResult && (
            <div className="p-3 bg-[#0d223a] border border-[#213145] rounded-xl text-white space-y-1 animate-in fade-in duration-200">
              <div className="flex items-center gap-1.5 font-bold text-white">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>รับรองคุณสมบัตินักกีฬาถูกต้องตามระเบียบการแข่งขัน — อนุมัติลงสนาม</span>
              </div>
              <p className="text-[11px] text-slate-300">
                เวลาที่ตรวจสอบ: <span className="tabular-nums">{scanResult.verifiedAt}</span> | เจ้าหน้าที่เทคนิค: {scanResult.gatekeeper}
              </p>
              <p className="text-[10px] text-slate-400">
                สถานที่แข่งขัน: {scanResult.court} • ผ่านการยืนยันตัวตนบุคคลเรียบร้อย (Audit Log #LOG-889)
              </p>
            </div>
          )}
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-1">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#142C47] hover:bg-[#1E3E64] text-slate-300 text-xs font-medium transition cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>

      </div>
    </div>
  );
}

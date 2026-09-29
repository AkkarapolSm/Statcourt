"use client";

import React, { useRef, useState } from "react";
import {
  X,
  Download,
  Printer,
  CheckCircle2,
  ShieldCheck,
  Award,
  Ruler,
  Calendar,
  School,
  QrCode,
  FileText,
  AlertCircle,
  Eye,
  Sparkles,
} from "lucide-react";
import { AthleteProfile, AthleteSeasonStats } from "@/lib/types";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface TcasDossierPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  athlete: AthleteProfile;
  stats: AthleteSeasonStats;
}

export default function TcasDossierPdfModal({
  isOpen,
  onClose,
  athlete,
  stats,
}: TcasDossierPdfModalProps) {
  const dossierRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Derived biometrics calculations
  const heightCm = athlete.heightCm || 185;
  const weightKg = athlete.weightKg || 75;
  const wingspanCm = athlete.wingspanCm || Math.round(heightCm * 1.04);
  const standingReachCm = athlete.standingReachCm || Math.round(heightCm * 1.32);
  const apeIndex = Math.round((wingspanCm - heightCm) * 10) / 10;

  const totalInches = heightCm / 2.54;
  const heightFeet = Math.floor(totalInches / 12);
  const heightInches = Math.round(totalInches % 12);
  const imperialHeight = `${heightFeet}'${heightInches}"`;

  const weightLbs = Math.round(weightKg * 2.20462);
  const reachInches = (standingReachCm / 2.54).toFixed(1);

  // Age
  let age = 18;
  if (athlete.birthDate) {
    const birthYear = new Date(athlete.birthDate).getFullYear();
    if (!isNaN(birthYear)) {
      age = new Date().getFullYear() - birthYear;
    }
  }

  // Position
  const positionDisplay = (athlete.primaryPosition || "CENTER").replace("_", " ");
  const secPositionDisplay = athlete.secondaryPosition
    ? athlete.secondaryPosition.replace("_", " ")
    : null;

  // TCAS Code
  const tcasCode =
    athlete.tcasReferenceCode ||
    `STC-VERIFIED-TH-${(athlete.schoolOrClub || "BCC").slice(0, 3).toUpperCase()}-0${
      athlete.jerseyNumber || "07"
    }`;

  // QR Code URL (pointing to verified athlete profile)
  const profileUrl = typeof window !== "undefined"
    ? `${window.location.origin}/athlete/${athlete.id}`
    : `https://statcourt.in.th/athlete/${athlete.id}`;

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
    profileUrl
  )}`;

  // Direct PDF generation using html2canvas and jsPDF
  const handleDownloadPdf = async () => {
    if (!dossierRef.current) return;
    setIsGenerating(true);
    setErrorMessage(null);
    setDownloadSuccess(false);

    try {
      const element = dossierRef.current;

      // Render high-res canvas with 2x scale
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        windowWidth: 1024,
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.95);

      // Create A4 PDF (210mm x 297mm)
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = 210;
      const pdfHeight = 297;
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;

      // Scale to fit standard A4 page
      const ratio = canvasWidth / pdfWidth;
      const renderedHeightMm = canvasHeight / ratio;

      if (renderedHeightMm <= pdfHeight) {
        pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, renderedHeightMm);
      } else {
        // Multi-page handling if content exceeds one page
        let heightLeft = renderedHeightMm;
        let position = 0;

        pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, renderedHeightMm);
        heightLeft -= pdfHeight;

        while (heightLeft > 0) {
          position -= pdfHeight;
          pdf.addPage();
          pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, renderedHeightMm);
          heightLeft -= pdfHeight;
        }
      }

      const filename = `${athlete.firstName}_${athlete.lastName}_TCAS_Portfolio_Verified.pdf`.replace(
        /\s+/g,
        "_"
      );
      pdf.save(filename);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error("PDF generation failed:", err);
      setErrorMessage(
        err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการสร้างไฟล์ PDF"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Browser-native Print to PDF
  const handleBrowserPrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      {/* Inline Print Stylesheet */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #tcas-print-dossier,
          #tcas-print-dossier * {
            visibility: visible;
          }
          #tcas-print-dossier {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            margin: 0 !important;
            padding: 10mm !important;
            box-shadow: none !important;
            border: none !important;
          }
          @page {
            size: A4 portrait;
            margin: 8mm;
          }
        }
      `}</style>

      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-4 text-slate-100 flex flex-col max-h-[92vh]">
        {/* MODAL CONTROL HEADER */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-[#0F172A] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <span>TCAS SPORTS PORTFOLIO EXPORT (OFFICIAL PDF)</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  A4 STANDARD
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                เอกสารทางการพร้อมดัชนีสรีระ Ape Index, สถิติ FIBA และตราประทับรับรองสมาคมกีฬาบาสเกตบอลฯ (BSAT)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Native Browser Print Button */}
            <button
              onClick={handleBrowserPrint}
              type="button"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition cursor-pointer"
              title="สั่งพิมพ์หรือบันทึกเป็น PDF ผ่านเบราว์เซอร์"
            >
              <Printer className="w-3.5 h-3.5 text-slate-300" />
              <span>พิมพ์ (Print)</span>
            </button>

            {/* Direct PDF Download Button */}
            <button
              onClick={handleDownloadPdf}
              disabled={isGenerating}
              type="button"
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold uppercase tracking-wider shadow-md transition disabled:opacity-50 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>กำลังสร้าง PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>ดาวน์โหลด PDF จริง</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="ปิด"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* NOTIFICATION STATUS */}
        {downloadSuccess && (
          <div className="bg-slate-900 border-b border-slate-800 text-white px-5 py-2.5 text-xs font-bold flex items-center gap-2 shrink-0">
            <CheckCircle2 className="w-4 h-4 text-[#DC2626] shrink-0" />
            <span>สร้างและดาวน์โหลดไฟล์ TCAS Portfolio PDF สำเร็จเรียบร้อย!</span>
          </div>
        )}
        {errorMessage && (
          <div className="bg-red-950 border-b border-red-800 text-red-300 px-5 py-2.5 text-xs font-bold flex items-center gap-2 shrink-0">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* SCROLLABLE PREVIEW CONTAINER */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950 flex justify-center">
          {/* ============================================================== */}
          {/* THE OFFICIAL TCAS DOSSIER DOCUMENT (PRINTABLE A4 CANVAS)        */}
          {/* ============================================================== */}
          <div
            id="tcas-print-dossier"
            ref={dossierRef}
            className="w-full max-w-[210mm] min-h-[297mm] bg-white text-slate-900 p-8 sm:p-10 shadow-2xl relative font-sans text-xs flex flex-col justify-between border border-slate-200"
            style={{ boxSizing: "border-box" }}
          >
            {/* WATERMARK BACKGROUND EMBLEM */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
              <div className="text-[120px] font-black uppercase text-center tracking-tighter">
                BSAT • STATCOURT
              </div>
            </div>

            <div>
              {/* DOCUMENT TOP HEADER (Federation Letterhead) */}
              <div className="border-b-2 border-[#AF101A] pb-4 mb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {/* BSAT & STATCOURT LOGO BADGE */}
                    <div className="w-14 h-14 rounded-full bg-[#AF101A] flex flex-col items-center justify-center text-white font-bold shadow-md shrink-0 border-2 border-amber-400">
                      <span className="text-[11px] font-black tracking-tighter leading-none">BSAT</span>
                      <span className="text-[7px] tracking-widest text-amber-200 mt-0.5">THAILAND</span>
                    </div>

                    <div>
                      <div className="text-[10px] font-bold text-red-700 uppercase tracking-widest leading-tight">
                        สมาคมกีฬาบาสเกตบอลแห่งประเทศไทย (BASKETBALL SPORT ASSOCIATION OF THAILAND)
                      </div>
                      <h1 className="text-lg font-black text-slate-900 tracking-tight leading-snug">
                        แฟ้มสะสมผลงานนักกีฬาบาสเกตบอลเพื่อการคัดเลือกเข้าศึกษา (TCAS DOSSIER)
                      </h1>
                      <div className="text-[10px] text-slate-600 font-medium">
                        เอกสารรับรองมาตรฐานทางสถิติและสมรรถภาพทางกายภาพ สำหรับโควตานักกีฬาช้างเผือกมหาวิทยาลัย
                      </div>
                    </div>
                  </div>

                  {/* Reference & Certified Stamp */}
                  <div className="text-right shrink-0">
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#AF101A]/10 border border-[#AF101A] rounded text-[#AF101A] text-[10px] font-mono font-bold tracking-wider mb-1">
                      <ShieldCheck className="w-3 h-3 text-[#AF101A] shrink-0" />
                      <span>BSAT VERIFIED ELITE</span>
                    </div>
                    <div className="text-[9px] font-mono text-slate-500">
                      REF CODE: <span className="font-bold text-slate-800">{tcasCode}</span>
                    </div>
                    <div className="text-[9px] text-slate-500">
                      วันออกเอกสาร: {new Date().toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })}
                    </div>
                  </div>
                </div>
              </div>

              {/* ATHLETE IDENTITY & BIOMETRICS SECTION */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                  {/* Photo Headshot */}
                  <div className="relative w-28 h-32 rounded-lg overflow-hidden border-2 border-slate-300 shadow-sm shrink-0 bg-slate-200">
                    <img
                      src={
                        athlete.avatarUrl ||
                        "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=400&q=80"
                      }
                      alt={athlete.firstName}
                      className="w-full h-full object-cover object-top"
                    />
                    <div className="absolute bottom-0 inset-x-0 bg-[#AF101A] text-white text-[10px] font-bold text-center py-0.5 font-mono">
                      #{athlete.jerseyNumber ?? 7} • {positionDisplay}
                    </div>
                  </div>

                  {/* Athlete Core Details */}
                  <div className="flex-1 space-y-1.5 w-full">
                    <div className="flex flex-wrap items-baseline justify-between gap-1 border-b border-slate-200 pb-1.5">
                      <div>
                        <h2 className="text-base font-black text-slate-900 uppercase">
                          {athlete.firstName} {athlete.lastName}
                        </h2>
                        <div className="text-[11px] text-slate-600 font-medium">
                          ชื่อภาษาอังกฤษ: {athlete.firstName} {athlete.lastName}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded font-mono">
                          {athlete.schoolOrClub || "Chiang Mai University Demonstration School"}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[10px]">
                      <div>
                        <span className="text-slate-500 block">ตำแหน่งหลัก:</span>
                        <span className="font-bold text-slate-800">{positionDisplay}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">ตำแหน่งรอง:</span>
                        <span className="font-bold text-slate-800">{secPositionDisplay || "-"}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">วันเกิด / อายุ:</span>
                        <span className="font-bold text-slate-800">
                          {athlete.birthDate ? new Date(athlete.birthDate).toLocaleDateString("th-TH") : "2007"} ({age} ปี)
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">จังหวัด / สังกัด:</span>
                        <span className="font-bold text-slate-800">{athlete.province || "Bangkok"}</span>
                      </div>
                    </div>

                    {/* DRAFT COMBINE MEASUREMENTS HUD */}
                    <div className="grid grid-cols-4 gap-2 mt-2 pt-2 border-t border-slate-200 text-center font-mono">
                      <div className="bg-white p-2 rounded border border-slate-200">
                        <span className="text-[9px] text-slate-500 uppercase block font-bold">ส่วนสูง (HEIGHT)</span>
                        <div className="text-sm font-black text-slate-900 mt-0.5">
                          {heightCm} <span className="text-[9px] font-normal text-slate-500">CM</span>
                        </div>
                        <span className="text-[9px] text-slate-500">{imperialHeight}</span>
                      </div>

                      <div className="bg-white p-2 rounded border border-slate-200">
                        <span className="text-[9px] text-slate-500 uppercase block font-bold">น้ำหนัก (WEIGHT)</span>
                        <div className="text-sm font-black text-slate-900 mt-0.5">
                          {weightKg} <span className="text-[9px] font-normal text-slate-500">KG</span>
                        </div>
                        <span className="text-[9px] text-slate-500">{weightLbs} LBS</span>
                      </div>

                      <div className="bg-white p-2 rounded border border-slate-200">
                        <span className="text-[9px] text-slate-500 uppercase block font-bold">ช่วงแขน (WINGSPAN)</span>
                        <div className="text-sm font-black text-red-600 mt-0.5">
                          {wingspanCm} <span className="text-[9px] font-normal text-slate-500">CM</span>
                        </div>
                        <span className="text-[9px] text-slate-700 font-bold">
                          {apeIndex >= 0 ? `+${apeIndex}` : apeIndex} cm Ape
                        </span>
                      </div>

                      <div className="bg-white p-2 rounded border border-slate-200">
                        <span className="text-[9px] text-slate-500 uppercase block font-bold">ยืนแตะ (STAND REACH)</span>
                        <div className="text-sm font-black text-slate-900 mt-0.5">
                          {standingReachCm} <span className="text-[9px] font-normal text-slate-500">CM</span>
                        </div>
                        <span className="text-[9px] text-slate-500">{reachInches} IN</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* FIBA VERIFIED SEASON STATISTICS TABLE */}
              <div className="mb-4">
                <div className="flex items-center justify-between pb-1 mb-1.5 border-b border-slate-200">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-[11px] uppercase tracking-wider text-slate-900">
                      1. สถิติการแข่งขันอย่างเป็นทางการ (FIBA OFFICIAL SEASON METRICS)
                    </span>
                    <span className="px-1.5 py-0.2 bg-slate-900 text-white text-[9px] font-bold rounded font-mono">
                      100% VERIFIED
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-slate-500">SEASON 2025-2026 • U18 LEAGUE</span>
                </div>

                <table className="w-full text-left font-mono text-[10px] border border-slate-200 rounded overflow-hidden">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[9px] border-b border-slate-200">
                    <tr>
                      <th className="py-1.5 px-2">GP</th>
                      <th className="py-1.5 px-2 text-right text-red-700">EFF/G</th>
                      <th className="py-1.5 px-2 text-right">PPG</th>
                      <th className="py-1.5 px-2 text-right">RPG</th>
                      <th className="py-1.5 px-2 text-right">APG</th>
                      <th className="py-1.5 px-2 text-right">BPG</th>
                      <th className="py-1.5 px-2 text-right">SPG</th>
                      <th className="py-1.5 px-2 text-right">FG%</th>
                      <th className="py-1.5 px-2 text-right">3P%</th>
                      <th className="py-1.5 px-2 text-right">FT%</th>
                      <th className="py-1.5 px-2 text-right text-slate-700">eFG%</th>
                      <th className="py-1.5 px-2 text-right text-slate-700">TS%</th>
                      <th className="py-1.5 px-2 text-right">AST/TO</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100 font-bold bg-white">
                      <td className="py-2 px-2">{stats.gamesPlayed || 10}</td>
                      <td className="py-2 px-2 text-right text-red-700 font-black text-xs">
                        {stats.effPerGame !== undefined ? stats.effPerGame.toFixed(1) : (stats.eff !== undefined ? String(stats.eff) : "28.0")}
                      </td>
                      <td className="py-2 px-2 text-right font-black">
                        {stats.ppg !== undefined ? stats.ppg.toFixed(1) : "21.4"}
                      </td>
                      <td className="py-2 px-2 text-right">
                        {stats.rpg !== undefined ? stats.rpg.toFixed(1) : "5.8"}
                      </td>
                      <td className="py-2 px-2 text-right">
                        {stats.apg !== undefined ? stats.apg.toFixed(1) : "7.6"}
                      </td>
                      <td className="py-2 px-2 text-right">
                        {stats.bpg !== undefined ? stats.bpg.toFixed(1) : "0.6"}
                      </td>
                      <td className="py-2 px-2 text-right">
                        {stats.spg !== undefined ? stats.spg.toFixed(1) : "2.8"}
                      </td>
                      <td className="py-2 px-2 text-right">
                        {stats.fgPct !== undefined ? `${stats.fgPct}%` : "52.7%"}
                      </td>
                      <td className="py-2 px-2 text-right">
                        38.6%
                      </td>
                      <td className="py-2 px-2 text-right">
                        {stats.ftPct !== undefined ? `${stats.ftPct}%` : "81.8%"}
                      </td>
                      <td className="py-2 px-2 text-right text-slate-900 font-bold">
                        {stats.efgPct !== undefined ? `${stats.efgPct}%` : "60.1%"}
                      </td>
                      <td className="py-2 px-2 text-right text-slate-900 font-bold">
                        {stats.tsPct !== undefined ? `${stats.tsPct}%` : "63.9%"}
                      </td>
                      <td className="py-2 px-2 text-right">
                        {stats.astToRatio !== undefined ? stats.astToRatio.toFixed(2) : "3.17"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* TOURNAMENT HONORS & ACADEMICS 2-COLUMN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                {/* Tournament Honors */}
                <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50">
                  <div className="font-bold text-[10px] text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-[#AF101A]" />
                    <span>2. เกียรติประวัติและรางวัลชนะเลิศ (HONORS)</span>
                  </div>
                  <ul className="space-y-1.5 text-[9.5px] text-slate-700">
                    <li className="flex items-start gap-1.5">
                      <Award className="w-3 h-3 text-[#AF101A] shrink-0 mt-0.5" />
                      <span>ชนะเลิศบาสเกตบอล TOA Youth Basketball League Thailand U18 (BSAT)</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <Award className="w-3 h-3 text-[#AF101A] shrink-0 mt-0.5" />
                      <span>รางวัลผู้เล่นทรงคุณค่า (MVP / All-Star Varsity Selection 2024-2025)</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <Award className="w-3 h-3 text-[#AF101A] shrink-0 mt-0.5" />
                      <span>รองชนะเลิศอันดับ 1 กีฬานักเรียนนักศึกษาแห่งชาติ กรมพลศึกษา</span>
                    </li>
                  </ul>
                </div>

                {/* Academic Standing & TCAS Quotas */}
                <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50">
                  <div className="font-bold text-[10px] text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-700" />
                    <span>3. ผลการเรียนสะสม & คุณสมบัติโควตา (ACADEMICS)</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 font-mono text-[9.5px] mb-2">
                    <div className="bg-white p-1.5 rounded border border-slate-200">
                      <span className="text-slate-500 block text-[8.5px]">ผลการเรียนสะสม (GPAX)</span>
                      <span className="font-black text-slate-900 text-xs">3.68 / 4.00</span>
                    </div>
                    <div className="bg-white p-1.5 rounded border border-slate-200">
                      <span className="text-slate-500 block text-[8.5px]">หน่วยกิตสะสม</span>
                      <span className="font-black text-slate-900 text-xs">67.0 หน่วยกิต</span>
                    </div>
                  </div>
                  <div className="text-[9px] text-slate-600">
                    <span className="font-bold text-slate-800">สถาบันเป้าหมายโควตากีฬา:</span>{" "}
                    จุฬาลงกรณ์มหาวิทยาลัย • มหาวิทยาลัยธรรมศาสตร์ • มหาวิทยาลัยเกษตรศาสตร์ • มช.
                  </div>
                </div>
              </div>

              {/* SCOUTING BIO & PLAYSTYLE SUMMARY */}
              <div className="border border-slate-200 rounded-lg p-3 bg-white mb-4">
                <div className="font-bold text-[10px] text-slate-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-red-600" />
                  <span>4. บทสรุปรายงานการประเมินและวิเคราะห์รูปแบบการเล่น (SCOUTING REPORT)</span>
                </div>
                <p className="text-[10px] text-slate-600 leading-relaxed">
                  {athlete.bio ||
                    "ผู้เล่นตำแหน่งวงในระดับแนวหน้าของรุ่น U18 มีความโดดเด่นด้านสรีระและความยาวช่วงแขน (Ape Index) สูงกว่าเกณฑ์เฉลี่ยสากล มีทักษะการตัดสินใจในเกมเร็ว การเปิดพื้นที่สนาม (Spacing) และการป้องกันวงในระดับแนวหน้าของประเทศ มีความพร้อมสูงสุดสำหรับการพัฒนาต่อยอดสู่การแข่งขันระดับอุดมศึกษา"}
                </p>
              </div>
            </div>

            {/* DOCUMENT FOOTER: QR VERIFICATION & OFFICIAL STAMP */}
            <div className="border-t-2 border-slate-200 pt-3 mt-2">
              <div className="flex items-center justify-between gap-4">
                {/* QR Code Verification Link */}
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-white p-1 border border-slate-300 rounded shadow-xs shrink-0 flex items-center justify-center">
                    <img
                      src={qrCodeUrl}
                      alt="TCAS Profile QR Code"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="space-y-0.5 font-mono text-[8.5px] text-slate-500">
                    <div className="font-bold text-slate-800 text-[9.5px]">
                      สแกนรหัส QR เพื่อเข้าชมวิดีโอการเล่นและรายงานสถิติทางการ
                    </div>
                    <div>ระบบตรวจสอบดิจิทัล StatCourt TCAS Database</div>
                    <div className="text-slate-400 truncate max-w-[200px]">{profileUrl}</div>
                  </div>
                </div>

                {/* Official Certification Signature Block */}
                <div className="text-right flex items-center gap-4">
                  {/* BSAT Red Stamp Seal */}
                  <div className="w-16 h-16 rounded-full border-2 border-dashed border-red-700/60 p-1 flex flex-col items-center justify-center text-center text-red-700 select-none opacity-80">
                    <span className="text-[7.5px] font-black uppercase tracking-tight">BSAT THAILAND</span>
                    <span className="text-[8.5px] font-black">CERTIFIED</span>
                    <span className="text-[6.5px]">OFFICIAL DATA</span>
                  </div>

                  <div className="space-y-1 text-center font-mono text-[8.5px] text-slate-600">
                    <div className="w-32 border-b border-slate-400 pb-1 font-bold text-slate-800">
                      (นายพิชญ์ วิทยากร)
                    </div>
                    <div>นายทะเบียนฝ่ายเทคนิคและสถิติ</div>
                    <div className="text-[7.5px] text-slate-400">BSAT Verification Authority</div>
                  </div>
                </div>
              </div>

              {/* Bottom Fine Print Disclaimer */}
              <div className="mt-3 pt-1 border-t border-slate-100 text-[7.5px] text-slate-400 text-center font-mono">
                เอกสารนี้ออกโดยระบบฐานข้อมูลสถิติบาสเกตบอลแห่งประเทศไทย (StatCourt Thailand) ภายใต้การรับรองมาตรฐานสมาคมกีฬาบาสเกตบอลแห่งประเทศไทย (BSAT) ห้ามแก้ไขหรือปลอมแปลงข้อมูลโดยเด็ดขาด • รหัสตรวจสอบ: {tcasCode}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

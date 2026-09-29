"use client";

import React, { useState } from "react";
import { AthleteActivityMetrics, AthleteProfile, AthleteSeasonStats } from "@/lib/types";

interface AthleteActivityIndexProps {
  athleteId: string;
  athlete?: AthleteProfile;
  stats?: AthleteSeasonStats;
  initialMetrics?: AthleteActivityMetrics;
  onNavigateLogs?: () => void;
}

export default function AthleteActivityIndex({
  athleteId,
  athlete,
  stats,
  initialMetrics,
  onNavigateLogs,
}: AthleteActivityIndexProps) {
  const [tournamentFilter, setTournamentFilter] = useState<"ALL" | "RECENT" | "NATIONAL">("ALL");
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleExport = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* ================= 2. TOP METRICS CARDS: MATCH ACTIVITY INDEX ================= */}
      <section className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 md:p-5 shadow-sm">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-outline-variant gap-2">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-headline-md text-headline-md uppercase tracking-wide text-on-surface">
                ประวัติการลงแข่งขัน (Match Experience & Activity Index)
              </h2>
              <span className="bg-primary-container text-on-primary font-label-badge text-label-badge uppercase px-2 py-0.5 rounded font-bold">
                VERIFIED 2026
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-secondary mt-0.5">
              ดัชนีชี้วัดประสบการณ์การลงสนามและเสถียรภาพการแข่งขันจริง • บันทึกและประมวลผลจากข้อมูลการแข่งขันทางการและทัวร์นาเมนต์มาตรฐานการกีฬาแห่งประเทศไทย (กกท.)
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <span className="inline-flex items-center px-2.5 py-1 rounded bg-surface-container text-on-surface font-label-caps text-label-caps font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-600 mr-1.5"></span>
              ACTIVE COMPETITOR
            </span>
            <button
              onClick={handleExport}
              className="px-3 py-1 bg-inverse-surface text-inverse-on-surface hover:bg-black font-label-caps text-label-caps uppercase rounded flex items-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              <span>{downloadSuccess ? "Exported" : "Export Sheet"}</span>
            </button>
          </div>
        </div>

        {/* 4 Core High-Octane Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {/* Card 1: Starter Ratio */}
          <div className="bg-surface-container-low border border-outline-variant rounded-lg p-4 relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="font-label-caps text-label-caps uppercase text-secondary font-bold">
                  สัดส่วนการลงเล่น 5 คนแรก (STARTING 5 RATIO)
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="font-headline-xl text-headline-xl text-primary leading-none">
                    95.2%
                  </span>
                  <span className="font-body-sm text-body-sm text-secondary font-semibold">
                    40 จาก 42 นัด
                  </span>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-primary">
                <span
                  className="material-symbols-outlined text-lg"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  star
                </span>
              </div>
            </div>
            <p className="mt-2 font-body-sm text-body-sm text-secondary">
              ได้รับความไว้วางใจลงสนามเป็น 5 คนแรกอย่างสม่ำเสมอในทุกรายการแข่งขันหลัก
            </p>
            <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-primary h-full rounded-full" style={{ width: "95.2%" }}></div>
            </div>
          </div>

          {/* Card 2: Top-tier Competition */}
          <div className="bg-surface-container-low border border-outline-variant rounded-lg p-4 relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="font-label-caps text-label-caps uppercase text-secondary font-bold">
                  การแข่งขันระดับชาติ (TIER-1 COMPETITION)
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="font-headline-xl text-headline-xl text-on-surface leading-none">
                    84.2%
                  </span>
                  <span className="font-body-sm text-body-sm text-secondary font-semibold">
                    ระดับชาติ / ตัวแทนภาค
                  </span>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface">
                <span className="material-symbols-outlined text-lg">military_tech</span>
              </div>
            </div>
            <p className="mt-2 font-body-sm text-body-sm text-secondary">
              สัดส่วนการลงแข่งขันในรายการมาตรฐานระดับสูง พบทีมชั้นนำระดับประเทศ
            </p>
            <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-tertiary-container h-full rounded-full" style={{ width: "84.2%" }}></div>
            </div>
          </div>

          {/* Card 3: Total Court Time */}
          <div className="bg-surface-container-low border border-outline-variant rounded-lg p-4 relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="font-label-caps text-label-caps uppercase text-secondary font-bold">
                  เวลาลงสนามรวมสะสม (TOTAL COURT TIME)
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="font-headline-xl text-headline-xl text-on-surface leading-none">
                    921
                  </span>
                  <span className="font-body-sm text-body-sm text-secondary font-semibold">
                    นาทีในการแข่งขัน
                  </span>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface">
                <span className="material-symbols-outlined text-lg">timer</span>
              </div>
            </div>
            <p className="mt-2 font-body-sm text-body-sm text-secondary">
              เฉลี่ย 21.9 นาทีต่อเกม (ตามกติกาสากล FIBA 40 นาที)
            </p>
            <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-secondary h-full rounded-full" style={{ width: "78%" }}></div>
            </div>
          </div>

          {/* Card 4: Tournament Win Rate */}
          <div className="bg-surface-container-low border border-outline-variant rounded-lg p-4 relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="font-label-caps text-label-caps uppercase text-secondary font-bold">
                  อัตราชนะการแข่งขันสะสม (OVERALL WIN RATE)
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="font-headline-xl text-headline-xl text-primary leading-none">
                    76.2%
                  </span>
                  <span className="font-body-sm text-body-sm text-secondary font-semibold">
                    32W - 10L
                  </span>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-lg">emoji_events</span>
              </div>
            </div>
            <p className="mt-2 font-body-sm text-body-sm text-secondary">
              ชนะเลิศ 4 รายการ • รองชนะเลิศ 2 รายการ
            </p>
            <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-primary h-full rounded-full" style={{ width: "76.2%" }}></div>
            </div>
          </div>
        </div>

        {/* Sub-record Inset Breakdown Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4 pt-4 border-t border-outline-variant text-center">
          <div className="p-2 bg-surface rounded border border-outline-variant">
            <span className="font-label-badge text-label-badge uppercase text-secondary">รางวัลชนะเลิศ</span>
            <div className="font-title-stat text-title-stat text-primary">
              4 <span className="font-body-sm text-body-sm text-secondary">รายการ</span>
            </div>
            <span className="font-body-sm text-body-sm text-secondary">ระดับตัวแทนภาค / ชิงชนะเลิศแห่งประเทศไทย</span>
          </div>
          <div className="p-2 bg-surface rounded border border-outline-variant">
            <span className="font-label-badge text-label-badge uppercase text-secondary">รางวัลรองชนะเลิศ</span>
            <div className="font-title-stat text-title-stat text-on-surface">
              2 <span className="font-body-sm text-body-sm text-secondary">รายการ</span>
            </div>
            <span className="font-body-sm text-body-sm text-secondary">สพฐ. ลีก &amp; กีฬาเยาวชนแห่งชาติ</span>
          </div>
          <div className="p-2 bg-surface rounded border border-outline-variant">
            <span className="font-label-badge text-label-badge uppercase text-secondary">ผลการแข่งขันที่ชนะ (Wins)</span>
            <div className="font-title-stat text-title-stat text-emerald-700">
              32 <span className="font-body-sm text-body-sm text-secondary">นัดทางการ</span>
            </div>
            <span className="font-body-sm text-body-sm text-secondary">ผลต่างคะแนนเฉลี่ย +14.2 คะแนน</span>
          </div>
          <div className="p-2 bg-surface rounded border border-outline-variant">
            <span className="font-label-badge text-label-badge uppercase text-secondary">จำนวนการลงสนามรวม</span>
            <div className="font-title-stat text-title-stat text-on-surface">
              42 <span className="font-body-sm text-body-sm text-secondary">นัดที่ได้รับการรับรอง</span>
            </div>
            <span className="font-body-sm text-body-sm text-secondary">บันทึกสถิติอย่างเป็นทางการตามมาตรฐาน FIBA LiveStats</span>
          </div>
        </div>
      </section>

      {/* ================= 3. TOURNAMENT HISTORY & HONORS CARDS ================= */}
      <section className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 md:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-outline-variant gap-2">
          <div className="flex items-center gap-2">
            <span
              className="material-symbols-outlined text-primary text-2xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              trophy
            </span>
            <div>
              <h2 className="font-headline-md text-headline-md uppercase tracking-wide text-on-surface">
                ประวัติเข้าร่วมการแข่งขันและเกียรติประวัติ (Tournament History & Honors)
              </h2>
              <p className="font-body-sm text-body-sm text-secondary">
                การคัดกรองผลงานอย่างเป็นทางการสำหรับการพิจารณาโควตากีฬาและคัดสรรตัวแทนทีมชาติ
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTournamentFilter("ALL")}
              className={`px-2.5 py-1 font-label-caps text-label-caps uppercase rounded font-bold transition-colors ${
                tournamentFilter === "ALL"
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container text-on-surface hover:bg-surface-container-high"
              }`}
            >
              ทุกรายการ (4)
            </button>
            <button
              onClick={() => setTournamentFilter("RECENT")}
              className={`px-2.5 py-1 font-label-caps text-label-caps uppercase rounded font-bold transition-colors ${
                tournamentFilter === "RECENT"
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container text-on-surface hover:bg-surface-container-high"
              }`}
            >
              ฤดูกาล 2026
            </button>
            <button
              onClick={() => setTournamentFilter("NATIONAL")}
              className={`px-2.5 py-1 font-label-caps text-label-caps uppercase rounded font-bold transition-colors ${
                tournamentFilter === "NATIONAL"
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container text-on-surface hover:bg-surface-container-high"
              }`}
            >
              ระดับชาติ (National)
            </button>
          </div>
        </div>

        <div className="space-y-4 mt-4">
          {/* Tournament Card 1: TOA Youth League (Champion) */}
          {(tournamentFilter === "ALL" || tournamentFilter === "RECENT" || tournamentFilter === "NATIONAL") && (
            <div className="border-2 border-primary-container bg-surface rounded-lg p-4 shadow-sm relative transition-all hover:shadow-md">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-primary-container text-on-primary font-label-badge text-label-badge uppercase px-2 py-0.5 rounded font-bold">
                      2026 • U18
                    </span>
                    <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-label-badge text-label-badge uppercase px-2 py-0.5 rounded font-bold">
                      OFFICIAL
                    </span>
                    <span className="text-secondary font-body-sm text-body-sm">
                      ผู้จัด: สมาคมกีฬาบาสเกตบอลแห่งประเทศไทย (BSAT)
                    </span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface mt-1">
                    TOA Youth Basketball League Thailand 2026
                  </h3>
                  <p className="font-body-sm text-body-sm text-secondary">
                    สถานะ: <strong className="text-on-surface">เซ็นเตอร์ตัวจริง (Starting Center)</strong> • ลงแข่งขัน <strong>10 นัด</strong> (สถิติ ชนะ 10 - แพ้ 0)
                  </p>
                </div>
                <div className="flex items-center gap-2 self-start lg:self-center">
                  <span className="inline-flex items-center px-3 py-1.5 rounded bg-tertiary-fixed text-on-tertiary-fixed font-label-caps text-label-caps font-bold border border-tertiary-container shadow-xs">
                    <span
                      className="material-symbols-outlined text-base mr-1"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      rewarded_ads
                    </span>
                    รางวัลชนะเลิศอันดับ 1 + ผู้เล่นเซ็นเตอร์ยอดเยี่ยม (Best Center)
                  </span>
                </div>
              </div>

              {/* Tournament Stat Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-3 pt-3 border-t border-outline-variant bg-surface-container-lowest p-2 rounded text-left">
                <div>
                  <span className="block font-label-badge text-label-badge text-secondary uppercase">POINTS / G</span>
                  <span className="font-headline-sm text-headline-sm text-primary">19.1 PPG</span>
                </div>
                <div>
                  <span className="block font-label-badge text-label-badge text-secondary uppercase">REBOUNDS / G</span>
                  <span className="font-headline-sm text-headline-sm text-on-surface">14.2 RPG</span>
                </div>
                <div>
                  <span className="block font-label-badge text-label-badge text-secondary uppercase">BLOCKS / G</span>
                  <span className="font-headline-sm text-headline-sm text-on-surface">3.1 BPG</span>
                </div>
                <div>
                  <span className="block font-label-badge text-label-badge text-secondary uppercase">MINUTES / G</span>
                  <span className="font-headline-sm text-headline-sm text-on-surface">25.5 MPG</span>
                </div>
                <div>
                  <span className="block font-label-badge text-label-badge text-secondary uppercase">EFFICIENCY / G</span>
                  <span className="font-headline-sm text-headline-sm text-primary font-bold">29.6</span>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-secondary font-label-badge uppercase">
                <span>FIBA LiveStats / BSAT Certified Data</span>
                <span className="text-primary font-bold cursor-pointer hover:underline">
                  ดูตารางสถิติฉบับเต็ม →
                </span>
              </div>
            </div>
          )}

          {/* Tournament Card 2: OBEC Cup */}
          {(tournamentFilter === "ALL" || tournamentFilter === "NATIONAL") && (
            <div className="border border-outline-variant bg-surface rounded-lg p-4 shadow-sm relative hover:border-primary transition-all">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-secondary-container text-on-secondary-container font-label-badge text-label-badge uppercase px-2 py-0.5 rounded font-bold">
                      2025-2026 • U18
                    </span>
                    <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-label-badge text-label-badge uppercase px-2 py-0.5 rounded font-bold">
                      OFFICIAL
                    </span>
                    <span className="text-secondary font-body-sm text-body-sm">
                      ผู้จัด: สำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน (สพฐ.)
                    </span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface mt-1">
                    การแข่งขันบาสเกตบอลนักเรียน สพฐ. ลีก ชิงชนะเลิศแห่งประเทศไทย (OBEC Cup)
                  </h3>
                  <p className="font-body-sm text-body-sm text-secondary">
                    สถานะ: <strong className="text-on-surface">เซ็นเตอร์ตัวจริง (Starting Center)</strong> • ลงแข่งขัน <strong>12 นัด</strong> (สถิติ ชนะ 10 - แพ้ 2)
                  </p>
                </div>
                <div className="flex items-center gap-2 self-start lg:self-center">
                  <span className="inline-flex items-center px-3 py-1.5 rounded bg-secondary-fixed text-on-secondary-fixed font-label-caps text-label-caps font-bold border border-outline">
                    <span className="material-symbols-outlined text-base mr-1">military_tech</span>
                    รางวัลรองชนะเลิศอันดับ 1 ระดับประเทศ
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-3 pt-3 border-t border-outline-variant bg-surface-container-lowest p-2 rounded text-left">
                <div>
                  <span className="block font-label-badge text-label-badge text-secondary uppercase">POINTS / G</span>
                  <span className="font-headline-sm text-headline-sm text-on-surface">17.8 PPG</span>
                </div>
                <div>
                  <span className="block font-label-badge text-label-badge text-secondary uppercase">REBOUNDS / G</span>
                  <span className="font-headline-sm text-headline-sm text-on-surface">15.5 RPG</span>
                </div>
                <div>
                  <span className="block font-label-badge text-label-badge text-secondary uppercase">BLOCKS / G</span>
                  <span className="font-headline-sm text-headline-sm text-on-surface">2.9 BPG</span>
                </div>
                <div>
                  <span className="block font-label-badge text-label-badge text-secondary uppercase">MINUTES / G</span>
                  <span className="font-headline-sm text-headline-sm text-on-surface">28 MPG</span>
                </div>
                <div>
                  <span className="block font-label-badge text-label-badge text-secondary uppercase">EFFICIENCY / G</span>
                  <span className="font-headline-sm text-headline-sm text-primary font-bold">26.4</span>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-secondary font-label-badge uppercase">
                <span>ตารางสถิติสาย ก สพฐ.</span>
                <span className="text-primary font-bold cursor-pointer hover:underline">
                  ดูตารางสถิติฉบับเต็ม →
                </span>
              </div>
            </div>
          )}

          {/* Tournament Card 3: National Youth Games 40th */}
          {(tournamentFilter === "ALL" || tournamentFilter === "RECENT") && (
            <div className="border border-outline-variant bg-surface rounded-lg p-4 shadow-sm relative hover:border-primary transition-all">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-secondary-container text-on-secondary-container font-label-badge text-label-badge uppercase px-2 py-0.5 rounded font-bold">
                      2025 • U18
                    </span>
                    <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-label-badge text-label-badge uppercase px-2 py-0.5 rounded font-bold">
                      NATIONAL
                    </span>
                    <span className="text-secondary font-body-sm text-body-sm">
                      ผู้จัด: การกีฬาแห่งประเทศไทย (กกท. / SAT)
                    </span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface mt-1">
                    กีฬาเยาวชนแห่งชาติ ครั้งที่ 40 (รอบคัดเลือกตัวแทนภาค 5)
                  </h3>
                  <p className="font-body-sm text-body-sm text-secondary">
                    สถานะ: <strong className="text-on-surface">เซ็นเตอร์ตัวจริง (ตัวแทนจังหวัด)</strong> • ลงแข่งขัน <strong>8 นัด</strong> (สถิติ ชนะ 7 - แพ้ 1)
                  </p>
                </div>
                <div className="flex items-center gap-2 self-start lg:self-center">
                  <span className="inline-flex items-center px-3 py-1.5 rounded bg-slate-900 text-white font-label-caps text-label-caps font-bold">
                    <span
                      className="material-symbols-outlined text-base mr-1 text-[#AF101A]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      stars
                    </span>
                    เหรียญทอง บาสเกตบอลชาย ตัวแทนภาค 5
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-3 pt-3 border-t border-outline-variant bg-surface-container-lowest p-2 rounded text-left">
                <div>
                  <span className="block font-label-badge text-label-badge text-secondary uppercase">POINTS / G</span>
                  <span className="font-headline-sm text-headline-sm text-on-surface">16.5 PPG</span>
                </div>
                <div>
                  <span className="block font-label-badge text-label-badge text-secondary uppercase">REBOUNDS / G</span>
                  <span className="font-headline-sm text-headline-sm text-on-surface">12 RPG</span>
                </div>
                <div>
                  <span className="block font-label-badge text-label-badge text-secondary uppercase">BLOCKS / G</span>
                  <span className="font-headline-sm text-headline-sm text-on-surface">2.1 BPG</span>
                </div>
                <div>
                  <span className="block font-label-badge text-label-badge text-secondary uppercase">MINUTES / G</span>
                  <span className="font-headline-sm text-headline-sm text-on-surface">24.2 MPG</span>
                </div>
                <div>
                  <span className="block font-label-badge text-label-badge text-secondary uppercase">EFFICIENCY / G</span>
                  <span className="font-headline-sm text-headline-sm text-primary font-bold">23.8</span>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-secondary font-label-badge uppercase">
                <span>การกีฬาแห่งประเทศไทย (กกท.)</span>
                <span className="text-primary font-bold cursor-pointer hover:underline">
                  ดูตารางสถิติฉบับเต็ม →
                </span>
              </div>
            </div>
          )}

          {/* Tournament Card 4: TCAS Elite Invitational */}
          {tournamentFilter === "ALL" && (
            <div className="border border-outline-variant bg-surface rounded-lg p-4 shadow-sm relative hover:border-primary transition-all">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-secondary-container text-on-secondary-container font-label-badge text-label-badge uppercase px-2 py-0.5 rounded font-bold">
                      2025 • U18
                    </span>
                    <span className="bg-blue-100 text-blue-900 border border-blue-300 font-label-badge text-label-badge uppercase px-2 py-0.5 rounded font-bold">
                      INVITATIONAL
                    </span>
                    <span className="text-secondary font-body-sm text-body-sm">
                      ผู้จัด: คณะกรรมาธิการพัฒนากีฬาเพื่อการอุดมศึกษา
                    </span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface mt-1">
                    TCAS Elite High School Basketball Invitational
                  </h3>
                  <p className="font-body-sm text-body-sm text-secondary">
                    สถานะ: <strong className="text-on-surface">ผู้เล่น 5 คนแรก (กัปตันทีมเกมรับ)</strong> • ลงแข่งขัน <strong>6 นัด</strong> (สถิติ ชนะ 5 - แพ้ 1)
                  </p>
                </div>
                <div className="flex items-center gap-2 self-start lg:self-center">
                  <span className="inline-flex items-center px-3 py-1.5 rounded bg-rose-50 text-rose-900 font-label-caps text-label-caps font-bold border border-rose-200">
                    <span className="material-symbols-outlined text-base mr-1 text-rose-700">hotel_class</span>
                    รางวัลผู้เล่น 5 คนยอดเยี่ยม (All-Tournament 1st Team)
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-3 pt-3 border-t border-outline-variant bg-surface-container-lowest p-2 rounded text-left">
                <div>
                  <span className="block font-label-badge text-label-badge text-secondary uppercase">POINTS / G</span>
                  <span className="font-headline-sm text-headline-sm text-on-surface">20.4 PPG</span>
                </div>
                <div>
                  <span className="block font-label-badge text-label-badge text-secondary uppercase">REBOUNDS / G</span>
                  <span className="font-headline-sm text-headline-sm text-on-surface">15 RPG</span>
                </div>
                <div>
                  <span className="block font-label-badge text-label-badge text-secondary uppercase">BLOCKS / G</span>
                  <span className="font-headline-sm text-headline-sm text-on-surface">3.3 BPG</span>
                </div>
                <div>
                  <span className="block font-label-badge text-label-badge text-secondary uppercase">MINUTES / G</span>
                  <span className="font-headline-sm text-headline-sm text-on-surface">33 MPG</span>
                </div>
                <div>
                  <span className="block font-label-badge text-label-badge text-secondary uppercase">EFFICIENCY / G</span>
                  <span className="font-headline-sm text-headline-sm text-primary font-bold">31.5</span>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-secondary font-label-badge uppercase">
                <span>Standard Technical Table</span>
                <span className="text-primary font-bold cursor-pointer hover:underline">
                  ดูตารางสถิติฉบับเต็ม →
                </span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ================= 4. RECENT MATCH PERFORMANCE LOGS ================= */}
      <section className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 md:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-outline-variant gap-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-2xl">timeline</span>
            <div>
              <h2 className="font-headline-md text-headline-md uppercase tracking-wide text-on-surface">
                บันทึกผลงานการแข่งขันรายนัดล่าสุด (Recent Match Performance Logs)
              </h2>
              <p className="font-body-sm text-body-sm text-secondary">
                บันทึกสถิติแบบเรียลไทม์รายนัดพร้อมการประเมินจากระบบ FIBA LiveStats
              </p>
            </div>
          </div>
          <button
            onClick={onNavigateLogs}
            className="font-label-caps text-label-caps uppercase text-primary font-bold flex items-center gap-1 hover:underline cursor-pointer"
          >
            ดูบันทึกการแข่งขันทั้งหมด 42 นัด →
          </button>
        </div>

        {/* Match Logs List */}
        <div className="space-y-3 mt-4">
          {/* Match Row 1 */}
          <div className="border border-outline-variant rounded-lg p-3 hover:bg-surface transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 bg-surface-container-lowest">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 font-headline-sm text-headline-sm font-bold border border-emerald-300 shrink-0">
                WIN
              </span>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-label-badge text-label-badge uppercase bg-surface-container px-1.5 py-0.5 rounded text-secondary font-bold">
                    TOA U18
                  </span>
                  <span className="font-headline-sm text-headline-sm text-on-surface">Final Round (ชิงชนะเลิศ)</span>
                  <span className="text-secondary font-body-sm text-body-sm">• 28 ก.พ. 2026</span>
                </div>
                <p className="font-body-sm text-body-sm text-secondary">
                  vs <strong className="text-on-surface">Debsirin School</strong> (การแข่งขันบาสเกตบอลเยาวชนชิงชนะเลิศแห่งประเทศไทย)
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-2 md:pt-0 border-outline-variant">
              <div className="text-right">
                <span className="font-label-caps text-label-caps uppercase text-secondary font-bold">TEAM SCORE</span>
                <div className="font-headline-sm text-headline-sm text-on-surface font-bold">78 - 71</div>
              </div>
              <div className="border-l border-outline-variant pl-4 text-right">
                <span className="font-label-badge text-label-badge uppercase text-secondary font-bold">INDIVIDUAL LOG</span>
                <div className="font-headline-sm text-headline-sm text-primary font-bold">
                  24 PTS • 16 REB • 4 BLK
                </div>
                <span className="font-body-sm text-body-sm text-secondary">EFF: 32 • 28 MIN</span>
              </div>
              <div className="hidden sm:block">
                <span className="inline-flex items-center px-2 py-1 rounded bg-slate-900 text-white text-label-badge font-label-badge uppercase font-bold">
                  <span
                    className="material-symbols-outlined text-xs mr-1 text-[#AF101A]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    star
                  </span>
                  CLUTCH Q4
                </span>
              </div>
            </div>
          </div>

          {/* Match Row 2 */}
          <div className="border border-outline-variant rounded-lg p-3 hover:bg-surface transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 bg-surface-container-lowest">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 font-headline-sm text-headline-sm font-bold border border-emerald-300 shrink-0">
                WIN
              </span>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-label-badge text-label-badge uppercase bg-surface-container px-1.5 py-0.5 rounded text-secondary font-bold">
                    TOA U18
                  </span>
                  <span className="font-headline-sm text-headline-sm text-on-surface">Semi-Final (รอบรองชนะเลิศ)</span>
                  <span className="text-secondary font-body-sm text-body-sm">• 25 ก.พ. 2026</span>
                </div>
                <p className="font-body-sm text-body-sm text-secondary">
                  vs <strong className="text-on-surface">Bangkok Christian College</strong> (การแข่งขันบาสเกตบอลเยาวชนชิงชนะเลิศแห่งประเทศไทย)
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-2 md:pt-0 border-outline-variant">
              <div className="text-right">
                <span className="font-label-caps text-label-caps uppercase text-secondary font-bold">TEAM SCORE</span>
                <div className="font-headline-sm text-headline-sm text-on-surface font-bold">82 - 74</div>
              </div>
              <div className="border-l border-outline-variant pl-4 text-right">
                <span className="font-label-badge text-label-badge uppercase text-secondary font-bold">INDIVIDUAL LOG</span>
                <div className="font-headline-sm text-headline-sm text-primary font-bold">
                  19 PTS • 15 REB • 5 BLK
                </div>
                <span className="font-body-sm text-body-sm text-secondary">EFF: 28 • 26 MIN</span>
              </div>
              <div className="hidden sm:block">
                <span className="inline-flex items-center px-2 py-1 rounded bg-surface-container text-on-surface border border-outline-variant text-label-badge font-label-badge uppercase font-bold">
                  DOUBLE-DOUBLE
                </span>
              </div>
            </div>
          </div>

          {/* Match Row 3 */}
          <div className="border border-outline-variant rounded-lg p-3 hover:bg-surface transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 bg-surface-container-lowest">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 font-headline-sm text-headline-sm font-bold border border-emerald-300 shrink-0">
                WIN
              </span>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-label-badge text-label-badge uppercase bg-surface-container px-1.5 py-0.5 rounded text-secondary font-bold">
                    TOA U18
                  </span>
                  <span className="font-headline-sm text-headline-sm text-on-surface">Quarter-Final (รอบ 8 ทีม)</span>
                  <span className="text-secondary font-body-sm text-body-sm">• 21 ก.พ. 2026</span>
                </div>
                <p className="font-body-sm text-body-sm text-secondary">
                  vs <strong className="text-on-surface">Suankularb Wittayalai</strong> (การแข่งขันบาสเกตบอลเยาวชนชิงชนะเลิศแห่งประเทศไทย)
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-2 md:pt-0 border-outline-variant">
              <div className="text-right">
                <span className="font-label-caps text-label-caps uppercase text-secondary font-bold">TEAM SCORE</span>
                <div className="font-headline-sm text-headline-sm text-on-surface font-bold">69 - 61</div>
              </div>
              <div className="border-l border-outline-variant pl-4 text-right">
                <span className="font-label-badge text-label-badge uppercase text-secondary font-bold">INDIVIDUAL LOG</span>
                <div className="font-headline-sm text-headline-sm text-primary font-bold">
                  18 PTS • 12 REB • 2 BLK
                </div>
                <span className="font-body-sm text-body-sm text-secondary">EFF: 24 • 24 MIN</span>
              </div>
              <div className="hidden sm:block">
                <span className="inline-flex items-center px-2 py-1 rounded bg-surface-container text-on-surface border border-outline-variant text-label-badge font-label-badge uppercase font-bold">
                  RIM PROTECTOR
                </span>
              </div>
            </div>
          </div>

          {/* Match Row 4 */}
          <div className="border border-outline-variant rounded-lg p-3 hover:bg-surface transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 bg-surface-container-lowest">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 font-headline-sm text-headline-sm font-bold border border-emerald-300 shrink-0">
                WIN
              </span>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-label-badge text-label-badge uppercase bg-surface-container px-1.5 py-0.5 rounded text-secondary font-bold">
                    TOA U18
                  </span>
                  <span className="font-headline-sm text-headline-sm text-on-surface">Group Stage (รอบแบ่งกลุ่ม)</span>
                  <span className="text-secondary font-body-sm text-body-sm">• 17 ก.พ. 2026</span>
                </div>
                <p className="font-body-sm text-body-sm text-secondary">
                  vs <strong className="text-on-surface">Assumption College</strong> (การแข่งขันบาสเกตบอลเยาวชนชิงชนะเลิศแห่งประเทศไทย)
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-2 md:pt-0 border-outline-variant">
              <div className="text-right">
                <span className="font-label-caps text-label-caps uppercase text-secondary font-bold">TEAM SCORE</span>
                <div className="font-headline-sm text-headline-sm text-on-surface font-bold">75 - 58</div>
              </div>
              <div className="border-l border-outline-variant pl-4 text-right">
                <span className="font-label-badge text-label-badge uppercase text-secondary font-bold">INDIVIDUAL LOG</span>
                <div className="font-headline-sm text-headline-sm text-primary font-bold">
                  22 PTS • 18 REB • 3 BLK
                </div>
                <span className="font-body-sm text-body-sm text-secondary">EFF: 30 • 27 MIN</span>
              </div>
              <div className="hidden sm:block">
                <span className="inline-flex items-center px-2 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-label-badge font-label-badge uppercase font-bold">
                  GAME MVP
                </span>
              </div>
            </div>
          </div>

          {/* Match Row 5 (OBEC Final - Loss) */}
          <div className="border border-outline-variant rounded-lg p-3 hover:bg-surface transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 bg-surface-container-lowest">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded bg-rose-100 text-rose-800 font-headline-sm text-headline-sm font-bold border border-rose-300 shrink-0">
                LOSS
              </span>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-label-badge text-label-badge uppercase bg-surface-container px-1.5 py-0.5 rounded text-secondary font-bold">
                    OBEC CUP
                  </span>
                  <span className="font-headline-sm text-headline-sm text-on-surface">National Final (รอบชิงชนะเลิศ สพฐ.)</span>
                  <span className="text-secondary font-body-sm text-body-sm">• 11 ม.ค. 2026</span>
                </div>
                <p className="font-body-sm text-body-sm text-secondary">
                  vs <strong className="text-on-surface">Traim Udom Suksa</strong> (การแข่งขันบาสเกตบอลระดับมัธยมศึกษา สพฐ.)
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-2 md:pt-0 border-outline-variant">
              <div className="text-right">
                <span className="font-label-caps text-label-caps uppercase text-secondary font-bold">TEAM SCORE</span>
                <div className="font-headline-sm text-headline-sm text-on-surface font-bold">66 - 69</div>
              </div>
              <div className="border-l border-outline-variant pl-4 text-right">
                <span className="font-label-badge text-label-badge uppercase text-secondary font-bold">INDIVIDUAL LOG</span>
                <div className="font-headline-sm text-headline-sm text-on-surface font-bold">
                  21 PTS • 17 REB • 2 BLK
                </div>
                <span className="font-body-sm text-body-sm text-secondary">EFF: 27 • 32 MIN</span>
              </div>
              <div className="hidden sm:block">
                <span className="inline-flex items-center px-2 py-1 rounded bg-surface-container text-on-surface border border-outline-variant text-label-badge font-label-badge uppercase font-bold">
                  FOUGHT TO WIRE
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 5. WORKLOAD & CONDITIONING PROFILE (Minutes by Quarter) ================= */}
      <section className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 md:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-outline-variant gap-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-2xl">monitor_heart</span>
            <div>
              <h2 className="font-headline-md text-headline-md uppercase tracking-wide text-on-surface">
                การประเมินการแจกแจงเวลาและสมรรถภาพตามควอเตอร์ (Workload & Conditioning Profile)
              </h2>
              <p className="font-body-sm text-body-sm text-secondary">
                การกระจายนาทีการลงเล่นเฉลี่ยในแต่ละควอเตอร์ (Q1-Q4) สะท้อนความทนทานของกล้ามเนื้อและการยืนระยะสม่ำเสมอตลอด 40 นาที
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-label-badge text-label-badge uppercase font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1"></span>
              OPTIMAL CONDITION
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded bg-primary-fixed text-primary border border-outline-variant font-label-badge text-label-badge uppercase font-bold">
              Q4 FINISH RATE: 98%
            </span>
          </div>
        </div>

        {/* Quarter Breakdown Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {/* Quarter 1 */}
          <div className="bg-surface rounded-lg p-4 border border-outline-variant relative">
            <div className="flex justify-between items-baseline mb-1">
              <span className="font-headline-sm text-headline-sm text-on-surface">QUARTER 1</span>
              <span className="font-headline-sm text-headline-sm text-primary">8.2 MIN</span>
            </div>
            <p className="font-body-sm text-body-sm text-secondary mb-3">ลงเล่นเพื่อจัดระเบียบเกมรับและควบคุมการรีบาวด์</p>
            <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
              <div className="bg-primary h-full rounded-full" style={{ width: "82%" }}></div>
            </div>
            <div className="mt-3 pt-2 border-t border-outline-variant flex justify-between text-[11px] text-secondary font-label-badge uppercase">
              <span>EFFICIENCY: 8.4</span>
              <span className="text-emerald-700 font-bold">HIGH FOCUS</span>
            </div>
          </div>

          {/* Quarter 2 */}
          <div className="bg-surface rounded-lg p-4 border border-outline-variant relative">
            <div className="flex justify-between items-baseline mb-1">
              <span className="font-headline-sm text-headline-sm text-on-surface">QUARTER 2</span>
              <span className="font-headline-sm text-headline-sm text-primary">7.8 MIN</span>
            </div>
            <p className="font-body-sm text-body-sm text-secondary mb-3">ปรับเปลี่ยนผู้เล่นเพื่อควบคุมจำนวนฟาวล์สะสมและรักษาความสด</p>
            <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
              <div className="bg-primary h-full rounded-full" style={{ width: "78%" }}></div>
            </div>
            <div className="mt-3 pt-2 border-t border-outline-variant flex justify-between text-[11px] text-secondary font-label-badge uppercase">
              <span>EFFICIENCY: 7.9</span>
              <span className="text-secondary font-bold">ROTATION MANAGED</span>
            </div>
          </div>

          {/* Quarter 3 */}
          <div className="bg-surface rounded-lg p-4 border border-outline-variant relative">
            <div className="flex justify-between items-baseline mb-1">
              <span className="font-headline-sm text-headline-sm text-on-surface">QUARTER 3</span>
              <span className="font-headline-sm text-headline-sm text-primary">8.5 MIN</span>
            </div>
            <p className="font-body-sm text-body-sm text-secondary mb-3">เพิ่มประสิทธิภาพเกมรุกและเกมรับใต้แป้นช่วงเปิดครึ่งหลัง</p>
            <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
              <div className="bg-primary h-full rounded-full" style={{ width: "85%" }}></div>
            </div>
            <div className="mt-3 pt-2 border-t border-outline-variant flex justify-between text-[11px] text-secondary font-label-badge uppercase">
              <span>EFFICIENCY: 9.1</span>
              <span className="text-emerald-700 font-bold">PEAK OUTPUT</span>
            </div>
          </div>

          {/* Quarter 4 */}
          <div className="bg-surface rounded-lg p-4 border border-outline-variant relative">
            <div className="flex justify-between items-baseline mb-1">
              <span className="font-headline-sm text-headline-sm text-on-surface">QUARTER 4</span>
              <span className="font-headline-sm text-headline-sm text-primary">8.0 MIN</span>
            </div>
            <p className="font-body-sm text-body-sm text-secondary mb-3">ควบคุมจังหวะการเล่นช่วงท้ายเกมและป้องกันคะแนนชี้ขาด</p>
            <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
              <div className="bg-primary h-full rounded-full" style={{ width: "80%" }}></div>
            </div>
            <div className="mt-3 pt-2 border-t border-outline-variant flex justify-between text-[11px] text-secondary font-label-badge uppercase">
              <span>EFFICIENCY: 8.8</span>
              <span className="text-emerald-700 font-bold">CLUTCH TIME VERIFIED</span>
            </div>
          </div>
        </div>

        {/* Scout Summary Note */}
        <div className="mt-4 p-3 bg-surface-container-low rounded border border-outline-variant flex items-start gap-3">
          <span className="material-symbols-outlined text-primary text-xl shrink-0 mt-0.5">clinical_notes</span>
          <div className="text-body-sm font-body-sm text-secondary leading-relaxed">
            <strong className="text-on-surface">รายงานการประเมินสมรรถภาพทางกาย (Scout Physical Assessment):</strong> นักกีฬามีความแข็งแกร่งและทนทานต่อแรงปะทะสูง สามารถลงสนามเฉลี่ย 32.5 นาทีในนัดที่มีความกดดันสูง โดยค่าประสิทธิภาพ (EFF) ยังคงที่สม่ำเสมอในควอเตอร์สุดท้าย อัตราการทำฟาวล์เฉลี่ย 2.1 ครั้งต่อนัด สะท้อนถึงระเบียบวินัยในการเล่นเกมรับระดับสูง พร้อมสำหรับการแข่งขันระดับอุดมศึกษา (ช้างเผือก/TCAS) และลีกอาชีพ (TBL)
          </div>
        </div>
      </section>
    </div>
  );
}

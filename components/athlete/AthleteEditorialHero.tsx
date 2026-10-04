"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowDownRight, Share2, Check, Star, Pencil } from "lucide-react";
import { AthleteProfile, AthleteSeasonStats } from "@/lib/types";

interface Props { athlete: AthleteProfile; stats: AthleteSeasonStats; seasonLabel: string; onOpenEditProfile?: () => void; }
const positions: Record<string, string> = { POINT_GUARD: "POINT GUARD", SHOOTING_GUARD: "SHOOTING GUARD", SMALL_FORWARD: "SMALL FORWARD", POWER_FORWARD: "POWER FORWARD", CENTER: "CENTER" };
const metric = (value?: number | null) => value == null ? "—" : value.toFixed(1);

export default function AthleteEditorialHero({ athlete, stats, seasonLabel, onOpenEditProfile }: Props) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [shareStatus, setShareStatus] = useState("");
  const jersey = athlete.jerseyNumber ?? stats.jerseyNumber;
  const displayedSeason = stats.season || seasonLabel;
  const birth = athlete.birthDate ? new Date(athlete.birthDate) : null;
  const birthDisplay = birth && !isNaN(birth.getTime()) ? birth.toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" }) : "—";
  const handleShare = async () => {
    try { await navigator.clipboard.writeText(window.location.href); setShareStatus("คัดลอกลิงก์แล้ว"); }
    catch { setShareStatus("คัดลอกลิงก์จากแถบที่อยู่ได้เลย"); }
  };
  return (
    <section className="sc-athlete-hero" aria-label="ข้อมูลนักกีฬาและสถิติ">
      <div className="sc-athlete-toolbar">
        <Link href="/leaderboard"><ArrowLeft size={16} /> กลับสู่อันดับนักกีฬา</Link>
        <div>{onOpenEditProfile && <button onClick={onOpenEditProfile}><Pencil size={16} /> แก้ไขโปรไฟล์</button>}<button onClick={handleShare}>{shareStatus === "คัดลอกลิงก์แล้ว" ? <Check size={16} /> : <Share2 size={16} />} {shareStatus || "แชร์โปรไฟล์"}</button></div>
      </div>
      <div className="sc-athlete-stage">
        <div className="sc-athlete-heading"><h2>PLAYER ANALYTICS<br /><span>& STATISTICS.</span></h2><p>ทุกเกมของคุณ มีเรื่องราวให้ค้นพบ</p></div>
        <div className="sc-athlete-emblem" aria-hidden="true"><span>SC</span></div>
        <figure className="sc-athlete-art"><img src="/images/home/basketball-athlete.png" alt="" width={1024} height={1536} /><figcaption>ภาพประกอบนักกีฬาบาสเกตบอล</figcaption></figure>
        <div className="sc-athlete-profile">
          <div className="sc-athlete-profile-bar"><span>STATCOURT<span className="sc-dot-th">.TH</span></span><span>ฤดูกาล {displayedSeason} · {stats.ageCategory}</span></div>
          {displayedSeason !== seasonLabel && <p className="sc-athlete-season-note">ยังไม่มีสถิติฤดูกาล {seasonLabel} · แสดงข้อมูลฤดูกาล {displayedSeason}</p>}
          <div className="sc-athlete-identity">
            <div className="sc-athlete-number" aria-label={`เสื้อหมายเลข ${jersey ?? "ยังไม่ระบุ"}`}>{jersey != null ? `#${jersey}` : "SC"}</div>
            <div><p>{positions[athlete.primaryPosition] || athlete.primaryPosition}</p><h1>{athlete.firstName}<br />{athlete.lastName}</h1><span>{athlete.schoolOrClub}</span></div>
            <button className={`sc-athlete-follow ${isFollowing ? "is-following" : ""}`} aria-pressed={isFollowing} onClick={() => setIsFollowing(!isFollowing)} aria-label={isFollowing ? "เลิกติดตามนักกีฬาในหน้านี้" : "ติดตามนักกีฬาในหน้านี้"}><Star size={19} fill={isFollowing ? "currentColor" : "none"} /></button>
          </div>
          <dl className="sc-athlete-metrics">{[["PPG", stats.ppg], ["RPG", stats.rpg], ["APG", stats.apg], ["EFF/G", stats.effPerGame]].map(([label, value]) => <div key={String(label)}><dt>{label}</dt><dd>{metric(value as number)}</dd></div>)}</dl>
          <dl className="sc-athlete-bio">
            <div><dt>ส่วนสูง</dt><dd>{athlete.heightCm ? `${athlete.heightCm} ซม.` : "—"}</dd></div><div><dt>น้ำหนัก</dt><dd>{athlete.weightKg ? `${athlete.weightKg} กก.` : "—"}</dd></div>
            <div><dt>วันเกิด</dt><dd>{birthDisplay}</dd></div><div><dt>เกมที่ลงเล่น</dt><dd>{stats.gamesPlayed ?? "—"} เกม</dd></div>
          </dl>
          <div className="sc-athlete-profile-foot"><span>{athlete.province} · {athlete.country || "Thailand"}</span><a href="#athlete-details">ดูสถิติทั้งหมด <ArrowDownRight size={18} /></a></div>
        </div>
      </div>
    </section>
  );
}

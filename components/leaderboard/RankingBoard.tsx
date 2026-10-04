"use client";

import Link from "next/link";
import { Search, Download, FileCheck, ChevronLeft, ChevronRight, Trophy, List, LayoutGrid, ArrowDown, ArrowUp, Lock } from "lucide-react";
import { AthleteSeasonStats, Position } from "@/lib/types";

type SortField = "effPerGame" | "ppg" | "rpg" | "apg" | "fgPct" | "efgPct" | "tsPct" | "astToRatio" | "heightCm" | "weightKg";
interface Props {
  athletes: AthleteSeasonStats[]; count: number; page: number; pages: number; pageSize: number; onPage: (page: number) => void;
  search: string; onSearch: (value: string) => void; season: string; onSeason: (value: string) => void;
  age: string; onAge: (value: string) => void; province: string; onProvince: (value: string) => void;
  provinces: { value: string; label: string }[]; activity: string; onActivity: (value: string) => void;
  position: Position | "ALL"; onPosition: (value: Position | "ALL") => void;
  positions: { value: Position | "ALL"; label: string }[];
  sort: SortField; order: "asc" | "desc"; onSort: (field: SortField) => void;
  view: "TABLE" | "CARDS"; onView: (view: "TABLE" | "CARDS") => void;
  onExport: () => void; onAudit: () => void; provinceLabel: (value: string) => string;
  isPro: boolean; onPricing: () => void; dataStatus: "loading" | "ready" | "fallback";
}
const columns: { field: SortField; label: string }[] = [{ field: "ppg", label: "PPG" }, { field: "rpg", label: "RPG" }, { field: "apg", label: "APG" }, { field: "fgPct", label: "FG%" }, { field: "efgPct", label: "eFG%" }, { field: "tsPct", label: "TS%" }];
const advanced = (field: SortField) => ["efgPct", "tsPct", "astToRatio"].includes(field);
const format = (value: number | undefined, field: SortField) => value == null ? "—" : field === "heightCm" ? String(value) : value.toFixed(1);
const positions: Record<string, string> = { POINT_GUARD: "PG", SHOOTING_GUARD: "SG", SMALL_FORWARD: "SF", POWER_FORWARD: "PF", CENTER: "C" };

export default function RankingBoard(p: Props) {
  const sortChoices = [...columns, { field: "effPerGame", label: "EFF/G" }, { field: "heightCm", label: "ส่วนสูง" }, { field: "weightKg", label: "น้ำหนัก" }, { field: "astToRatio", label: "AST/TO" }];
  const sortLabel = sortChoices.find(c => c.field === p.sort)?.label;
  return <main className="sc-ranking">
    <div className="sc-ranking-inner">
      <header className="sc-ranking-title"><div><h1>THE LEADERBOARD<span>.</span></h1><p>นักบาสไทยบนกระดานเดียวกัน · เปรียบเทียบผลงานในทุกเกม</p></div><div className="sc-ranking-actions"><button onClick={p.onExport} disabled={p.dataStatus === "loading" || p.count === 0}><Download size={17} /> ส่งออก CSV</button><button onClick={p.onAudit} disabled={p.dataStatus === "loading" || p.count === 0}><FileCheck size={17} /> ดูรายงาน TCAS</button></div></header>
      <nav className="sc-ranking-positions" aria-label="ตำแหน่งนักกีฬา">{p.positions.map(position => <button key={position.value} aria-pressed={p.position === position.value} className={p.position === position.value ? "is-selected" : ""} onClick={() => p.onPosition(position.value)}>{position.label}</button>)}</nav>
      <div className="sc-ranking-filters">
        <label className="sc-ranking-search"><Search size={18} /><input aria-label="ค้นหานักกีฬาหรือโรงเรียน" value={p.search} onChange={e => p.onSearch(e.target.value)} placeholder="ค้นหานักกีฬา หรือโรงเรียน" /></label>
        <label><span>ฤดูกาล</span><select value={p.season} onChange={e => p.onSeason(e.target.value)}><option value="2026">2026</option><option value="2025">2025</option><option value="ALL">ทั้งหมด</option></select></label>
        <label><span>รุ่นอายุ</span><select value={p.age} onChange={e => p.onAge(e.target.value)}><option value="ALL">ทั้งหมด</option><option value="U14">U14</option><option value="U16">U16</option><option value="U18">U18</option><option value="Open">Open</option></select></label>
        <label><span>จังหวัด</span><select value={p.province} onChange={e => p.onProvince(e.target.value)}><option value="ALL">ทุกจังหวัด</option>{p.provinces.map(province => <option key={province.value} value={province.value}>{province.label}</option>)}</select></label>
        <label><span>การลงแข่ง</span><select value={p.activity} onChange={e => p.onActivity(e.target.value)}><option value="ALL">ทั้งหมด</option><option value="ACTIVE_30D">อย่างน้อย 4 เกม</option></select></label>
      </div>
      <div className="sc-ranking-viewbar"><p><strong>{p.count}</strong> นักกีฬา · เรียงตาม {sortLabel} {p.order === "desc" ? "มากไปน้อย" : "น้อยไปมาก"}</p><div><label className="sc-ranking-sort"><span>เรียงตาม</span><select aria-label="เลือกสถิติที่ใช้เรียงอันดับ" value={p.sort} onChange={e => p.onSort(e.target.value as SortField)}>{sortChoices.filter(c => c.field !== "heightCm" && c.field !== "weightKg" || p.athletes.some(a => a[c.field as SortField] != null)).map(c => <option value={c.field} key={c.field} disabled={!p.isPro && advanced(c.field as SortField)}>{c.label}</option>)}</select><button onClick={() => p.onSort(p.sort)} aria-label="สลับทิศทางการเรียง">{p.order === "desc" ? <ArrowDown size={16} /> : <ArrowUp size={16} />}</button></label><button onClick={() => p.onView("TABLE")} aria-label="แสดงแบบแถวอันดับ" aria-pressed={p.view === "TABLE"}><List size={18} /></button><button onClick={() => p.onView("CARDS")} aria-label="แสดงแบบการ์ด" aria-pressed={p.view === "CARDS"}><LayoutGrid size={18} /></button></div></div>
      <div className="sc-ranking-access">{p.dataStatus === "fallback" && <span>เชื่อมต่อข้อมูลไม่ได้ · กำลังแสดงข้อมูลตัวอย่าง</span>}{!p.isPro && <button onClick={p.onPricing}><Lock size={12} /> eFG% และ TS% สำหรับ PRO · ดูแพ็กเกจ</button>}</div>
      <div className={`sc-ranking-board ${p.view === "CARDS" ? "is-cards" : ""}`}>
        {p.view === "TABLE" && <div className="sc-ranking-column-head"><span>อันดับ</span><span>นักกีฬา / สังกัด</span><div>{columns.map(c => <button key={c.field} onClick={() => !p.isPro && advanced(c.field) ? p.onPricing() : p.onSort(c.field)} aria-label={`เรียงอันดับตาม ${c.label}`}>{c.label}{p.sort === c.field && (p.order === "desc" ? <ArrowDown size={12} /> : <ArrowUp size={12} />)}</button>)}</div><button onClick={() => p.onSort("effPerGame")} aria-label="เรียงอันดับตาม EFF ต่อเกม">EFF/G</button><span /></div>}
        <ol start={(p.page - 1) * p.pageSize + 1} className="sc-ranking-list">{p.athletes.map((athlete, index) => {
          const rank = (p.page - 1) * p.pageSize + index + 1;
          return <li key={athlete.athleteId}><Link className={`sc-ranking-row ${rank === 1 ? "is-first" : ""}`} href={`/athlete/${athlete.athleteId}`}>
            <div className="sc-ranking-rank">{rank === 1 && <Trophy size={20} />}<span>{rank}</span></div>
            <div className="sc-ranking-player"><div className="sc-ranking-avatar" aria-hidden="true">{athlete.firstName.slice(0, 1)}{athlete.lastName.slice(0, 1)}</div><div><h2>{athlete.firstName} {athlete.lastName}</h2><p>{athlete.schoolOrClub}</p><small>{positions[athlete.position] || athlete.position} · {p.provinceLabel(athlete.province)} · {athlete.ageCategory}</small></div></div>
            <dl className="sc-ranking-metrics">{columns.map(c => <div key={c.field}><dt>{c.label}</dt><dd>{!p.isPro && advanced(c.field) ? <Lock size={12} aria-label="สถิติสำหรับ PRO" /> : format(athlete[c.field], c.field)}</dd></div>)}</dl>
            <div className="sc-ranking-score"><span>EFF/G</span><strong>{format(athlete.effPerGame, "effPerGame")}</strong></div><ChevronRight className="sc-ranking-arrow" size={24} />
          </Link></li>;
        })}</ol>
      </div>
      {p.dataStatus === "loading" && <div className="sc-ranking-loading" role="status">กำลังโหลดอันดับนักกีฬา…</div>}
      {p.count === 0 && p.dataStatus !== "loading" && <div className="sc-ranking-empty"><Search size={30} /><h2>ไม่พบนักกีฬาที่ตรงกับตัวกรอง</h2><p>ลองเปลี่ยนชื่อ ตำแหน่ง หรือจังหวัดที่ค้นหา</p><button onClick={() => { p.onSearch(""); p.onPosition("ALL"); p.onAge("ALL"); p.onProvince("ALL"); p.onActivity("ALL"); }}>ล้างตัวกรอง</button></div>}
      <div className="sc-ranking-pagination"><p>{p.count ? `อันดับ ${(p.page - 1) * p.pageSize + 1}–${Math.min(p.page * p.pageSize, p.count)} จาก ${p.count} คน` : p.dataStatus === "loading" ? "กำลังโหลดข้อมูล" : "ไม่มีผลลัพธ์"}</p><div><button aria-label="หน้าก่อนหน้า" disabled={p.page === 1 || p.dataStatus === "loading"} onClick={() => p.onPage(p.page - 1)}><ChevronLeft size={18} /></button><span>{p.page} / {p.dataStatus === "loading" ? "—" : p.pages}</span><button aria-label="หน้าถัดไป" disabled={p.page >= p.pages || p.dataStatus === "loading"} onClick={() => p.onPage(p.page + 1)}><ChevronRight size={18} /></button></div></div>
      <details className="sc-ranking-formula"><summary>อ่านค่าสถิติบนกระดานอันดับ</summary><p>PPG = แต้มต่อเกม · RPG = รีบาวด์ต่อเกม · APG = แอสซิสต์ต่อเกม · eFG% = ความแม่นยำที่ปรับค่ายิงสามแต้ม · TS% = ประสิทธิภาพการทำคะแนน · FG% = ความแม่นยำในการยิง</p><p>EFF/G = (PTS + REB + AST + STL + BLK − (FGA − FGM) − (FTA − FTM) − TO) / จำนวนเกม</p></details>
    </div>
  </main>;
}

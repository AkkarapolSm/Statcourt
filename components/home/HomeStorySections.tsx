"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ArrowRight, Check, Plus, Play, ShieldCheck } from "lucide-react";

const metrics = {
  PTS: { title: "การทำคะแนน", value: "24", description: "ดูการทำคะแนนในแต่ละเกม ควบคู่กับวิดีโอของทุกเพลย์" },
  REB: { title: "การรีบาวด์", value: "8", description: "เห็นผลงานทั้งเกมรุกและเกมรับ จากจังหวะที่ทีมได้ครองบอลอีกครั้ง" },
  AST: { title: "การแอสซิสต์", value: "6", description: "มองเห็นการสร้างโอกาสให้เพื่อนร่วมทีม มากกว่าคะแนนของผู้เล่นคนเดียว" },
} as const;

export function PlayerAnalyticsSpotlight() {
  const [metric, setMetric] = useState<keyof typeof metrics>("PTS");
  return (
    <section className="sc-analytics sc-section" aria-labelledby="analytics-title">
      <div className="sc-analytics-copy">
        <h2 id="analytics-title">ให้ผลงานในสนาม<br /><span>เล่าเรื่องของคุณ</span></h2>
        <p>จากทุกแต้ม ทุกรีบาวด์ สู่ภาพรวมที่ชัดเจน ติดตามพัฒนาการของผู้เล่น และต่อยอดสู่แฟ้มสะสมผลงานนักกีฬา</p>
        <Link href="/leaderboard" className="sc-text-link">ค้นพบผู้เล่นและผู้นำสถิติ <ArrowUpRight size={20} /></Link>
        <div className="sc-analytics-note"><ShieldCheck size={18} /><span>เชื่อมสถิติกับวิดีโอเพลย์ต่อเพลย์</span></div>
      </div>
      <div className="sc-analytics-visual">
        <span className="sc-analytics-backtype" aria-hidden="true">PLAYER<br />ANALYTICS</span>
        <Image src="/images/home/basketball-athlete.png" alt="" width={1024} height={1536} unoptimized className="sc-analytics-athlete" />
        <div className="sc-player-sheet">
          <div className="sc-sheet-header"><strong>PLAYER INSIGHTS</strong><span>ตัวอย่างการแสดงสถิติ</span></div>
          <div className="sc-sheet-tabs" role="group" aria-label="เลือกสถิติตัวอย่าง">
            {(Object.keys(metrics) as Array<keyof typeof metrics>).map((item) => <button type="button" key={item} onClick={() => setMetric(item)} aria-pressed={metric === item} className={metric === item ? "is-active" : ""}>{item}</button>)}
          </div>
          <div className="sc-sheet-metric" aria-live="polite"><div><span>{metrics[metric].title}</span><strong>{metrics[metric].value}<small>{metric}</small></strong></div><div className="sc-shot-court" aria-hidden="true"><div className="sc-court-key" /><div className="sc-court-circle" /><i className="sc-shot sc-shot-one" /><i className="sc-shot sc-shot-two" /><i className="sc-shot sc-shot-three" /></div></div>
          <p>{metrics[metric].description}</p>
          <Link href="/leaderboard">สำรวจสถิติผู้เล่นจริง <ArrowRight size={16} /></Link>
        </div>
      </div>
    </section>
  );
}

export function BasketballCommunitySection() {
  return (
    <section className="sc-community sc-section" aria-labelledby="community-title">
      <div className="sc-section-heading"><h2 id="community-title">ผู้เล่น โค้ช และผู้จัด<br /><span>เชื่อมกันด้วยทุกเกม</span></h2><p>พื้นที่เดียวสำหรับคนบาสไทย<br />ตั้งแต่ข้างสนาม ไปถึงโอกาสครั้งต่อไป</p></div>
      <div className="sc-community-grid">
        <div className="sc-community-intro"><h3>เกมเดียวกัน<br />คนละบทบาท</h3><p>ติดตามผลงาน ค้นหานักกีฬา และจัดการการแข่งขัน ผ่านข้อมูลที่ทุกคนเข้าถึงและเข้าใจได้</p><Link href="/solutions" className="sc-button sc-button-primary">สำรวจโซลูชัน <ArrowUpRight size={18} /></Link></div>
        <Link href="/opportunities" className="sc-community-player"><Image src="/images/home/basketball-athlete.png" alt="นักบาสเกตบอลในชุดฝึกซ้อม" width={1024} height={1536} unoptimized /><div className="sc-community-card-copy"><span>สำหรับนักกีฬา</span><h3>ทุกความทุ่มเท<br />มีโอกาสไปต่อ</h3><span>สถิติและโควตากีฬา TCAS <ArrowUpRight size={20} /></span></div></Link>
        <Link href="/solutions" className="sc-community-organizer"><Image src="/images/court/hardwood-court.jpg" alt="พื้นและเส้นสนามบาสเกตบอล" fill sizes="(max-width: 700px) 100vw, 35vw" className="object-cover" /><div className="sc-community-card-copy"><span>สำหรับโค้ชและผู้จัด</span><h3>เห็นทั้งเกม<br />ดูแลทั้งทีม</h3><span>จัดการแข่งขันและค้นหาผู้เล่น <ArrowUpRight size={20} /></span></div></Link>
      </div>
    </section>
  );
}

export function BasketballPossibilityBanner() {
  return (
    <section className="sc-possibility" aria-labelledby="possibility-title">
      <div className="sc-possibility-image"><Image src="/images/home/basketball-athlete.png" alt="" width={1024} height={1536} unoptimized /></div>
      <div className="sc-possibility-copy"><h2 id="possibility-title">มากกว่าเกมวันนี้<br />คือโอกาสในวันข้างหน้า</h2><p>เก็บทุกผลงานให้มีความหมาย เชื่อมสถิติ วิดีโอ และเส้นทางนักกีฬาไว้ด้วยกัน</p><div className="sc-possibility-features"><span><Check size={18} /> สถิติผู้เล่น</span><span><Check size={18} /> วิดีโอทุกเพลย์</span><span><Check size={18} /> แฟ้มผลงาน TCAS</span></div><Link href="/auth/register" className="sc-button sc-button-light">เริ่มต้นเส้นทางของคุณ <ArrowUpRight size={18} /></Link></div>
    </section>
  );
}

export function LiveStatsIntroduction() {
  return (
    <section className="sc-live-intro sc-section" aria-labelledby="live-intro-title">
      <div><h2 id="live-intro-title">ไม่พลาดเกม<br /><span>ไม่พลาดทุกสถิติ</span></h2><p>ติดตามโปรแกรม ผลการแข่งขัน และผู้นำสถิติของลีก ในพื้นที่เดียว</p><Link href="/live" className="sc-text-link"><Play size={18} /> เปิดห้องถ่ายทอดสด <ArrowUpRight size={20} /></Link></div>
      <div className="sc-live-directory"><Link href="/matches"><span>โปรแกรมและผลการแข่งขัน</span><strong>MATCHES</strong><ArrowUpRight size={25} /></Link><Link href="/leaderboard"><span>สถิติและอันดับผู้เล่น</span><strong>LEADERBOARDS</strong><ArrowUpRight size={25} /></Link></div>
    </section>
  );
}

const questions = [
  { question: "เริ่มต้นใช้งาน StatCourtTH ได้อย่างไร?", answer: "คุณสามารถดูโปรแกรม ผลการแข่งขัน และผู้นำสถิติได้จากหน้าเว็บ หากต้องการใช้เครื่องมือสำหรับสมาชิก ให้สมัครสมาชิกหรือเข้าสู่ระบบด้วยบัญชีของคุณ" },
  { question: "ดูสถิติและวิดีโอการแข่งขันได้ที่ไหน?", answer: "เปิดเมนูโปรแกรมและผลการแข่งขัน เลือกเกมที่ต้องการ แล้วเข้าสู่หน้าสถิติเกมเพื่อดูข้อมูลและวิดีโอเพลย์ ส่วนเกมที่กำลังถ่ายทอดสดสามารถเปิดได้จากเมนูดูเกมสด" },
  { question: "นักกีฬาสามารถค้นหาโควตากีฬา TCAS ได้ไหม?", answer: "เปิดหน้าโอกาสและทุนการศึกษาเพื่อสำรวจประกาศคัดตัวและโควตากีฬา พร้อมตรวจรายละเอียดและเงื่อนไขของแต่ละโครงการ" },
  { question: "มีเครื่องมือสำหรับผู้จัดการแข่งขันหรือไม่?", answer: "มีโซลูชันสำหรับบริหารการแข่งขัน บันทึกสถิติ และจัดการข้อมูลนักกีฬา ดูรายละเอียดได้ที่หน้าโซลูชันสำหรับผู้จัด" },
];

export function HomeGuideSection() {
  return (
    <section className="sc-guide sc-section" aria-labelledby="guide-title">
      <h2 id="guide-title">เริ่มต้นให้พร้อม<br /><span>แล้วไปต่อด้วยกัน</span></h2>
      <p className="sc-guide-description">คำตอบสำหรับการติดตามเกม ใช้สถิติ และค้นหาโอกาส</p>
      <div className="sc-guide-grid"><div className="sc-faq">{questions.map(({ question, answer }) => <details key={question}><summary>{question}<Plus size={18} /></summary><p>{answer}</p></details>)}<Link href="/academy" className="sc-text-link">เรียนรู้การบันทึกสถิติ <ArrowUpRight size={18} /></Link></div><div className="sc-guide-photo"><Image src="/images/court/hardwood-court.jpg" alt="รายละเอียดสนามบาสเกตบอล" fill sizes="(max-width: 700px) 100vw, 35vw" className="object-cover" /><div><span>ทุกเกม มีความหมาย</span><strong>SEE YOU<br />ON COURT.</strong></div></div></div>
      <div className="sc-home-closing"><p>พร้อมสำหรับเกมต่อไปของคุณหรือยัง?</p><Link href="/auth/register">LET’S GO! <ArrowUpRight aria-hidden="true" /></Link><span>ร่วมเป็นส่วนหนึ่งของคนบาสไทย</span></div>
    </section>
  );
}

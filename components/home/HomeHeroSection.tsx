"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, QrCode, Share2, ShieldCheck } from "lucide-react";
import { useAuthStore } from "@/lib/auth/useAuthStore";
import { canAccessScoutHub } from "@/lib/auth/rbac";

interface HomeHeroSectionProps {
  onOpenSocialGraphics: () => void;
  onOpenPlayerPass: () => void;
}

export default function HomeHeroSection({ onOpenSocialGraphics, onOpenPlayerPass }: HomeHeroSectionProps) {
  const { currentUser } = useAuthStore();
  const hasScoutAccess = canAccessScoutHub(currentUser);
  return (
    <section aria-labelledby="home-hero-title" className="sc-home-hero">
      <div className="sc-hero-stage">
        <div className="sc-hero-wordmark" aria-hidden="true">STATCOURT<span>.TH</span></div>
        <Image src="/images/home/basketball-athlete.png" alt="นักบาสเกตบอลถือบอลและมองไปยังห่วง" width={1024} height={1536} priority unoptimized className="sc-hero-athlete" />
        <div className="sc-hero-copy">
          <h1 id="home-hero-title">ทุกเกม<br />มีความหมาย<span className="sc-hero-english">EVERY GAME. MORE POSSIBILITY.</span></h1>
          <p>ติดตามเกม ดูสถิติ และค้นพบโอกาสต่อไปของนักบาสไทย</p>
          <div className="sc-hero-actions">
            <Link href="/live" className="sc-button sc-button-primary">ดูเกมและสถิติ <ArrowUpRight size={18} /></Link>
            <Link href={hasScoutAccess ? "/scout" : "/tournaments"} className="sc-hero-secondary">{hasScoutAccess ? "คลังแมวมอง TCAS" : "สำรวจการแข่งขัน"} <ArrowRight size={16} /></Link>
          </div>
        </div>
        <Link href="/live" className="sc-hero-match">
          <div className="sc-hero-match-photo"><Image src="/images/court/hardwood-court.jpg" alt="สนามบาสเกตบอล" width={340} height={180} className="object-cover w-full h-full" /></div>
          <div className="sc-hero-match-content"><span>บาสไทย อยู่ใกล้กว่าที่เคย</span><strong>MATCH CENTER</strong><span className="sc-hero-match-link">เข้าสู่สนาม <ArrowUpRight size={16} /></span></div>
        </Link>
        <span className="sc-hero-side-note" aria-hidden="true">THAI BASKETBALL / ALL CONNECTED</span>
      </div>
      <div className="sc-intro-ribbon">
        <div className="sc-intro-standard"><ShieldCheck size={25} /><div><strong>ทุกเพลย์มีคุณค่า</strong><span>สถิติ · วิดีโอ · โอกาส</span></div></div>
        <p>ผลงานในสนาม กลายเป็นข้อมูลที่เข้าใจได้<br className="hidden lg:block" /><span>และเป็นโอกาสต่อไปของนักบาสไทย</span></p>
        <div className="sc-intro-tools">
          <button type="button" onClick={onOpenPlayerPass}><QrCode size={17} /> Digital Player Pass <ArrowUpRight size={15} /></button>
          <button type="button" onClick={onOpenSocialGraphics}><Share2 size={17} /> สร้างภาพสรุปโซเชียล <ArrowUpRight size={15} /></button>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useState } from "react";
import { ArrowUpRight, ArrowRight, Search, ShoppingBag, Footprints, Dumbbell, Shirt, Shield, Heart, Users, MessageCircle, Plus } from "lucide-react";
import { MarketplaceItem } from "@/lib/types";

interface Props {
  items: MarketplaceItem[]; categories: { id: string; label: string }[];
  selectedCategory: string; onCategory: (id: string) => void; searchQuery: string; onSearch: (value: string) => void;
  onCreate: () => void; onInquiry: (item: MarketplaceItem) => void; onHistory: (item: MarketplaceItem) => void;
  onTerms: () => void; onPricing: () => void; isPro: boolean; quota: string;
}
const categoryLabels: Record<string, string> = { ALL: "อุปกรณ์ทั้งหมด", Footwear: "รองเท้าบาส", "Protective Braces": "อุปกรณ์ป้องกัน", "Training Equipment": "อุปกรณ์ฝึกซ้อม", Uniforms: "ชุดแข่งขัน" };
const categoryIcons = [ShoppingBag, Footprints, Shield, Dumbbell, Shirt];

export default function MarketStorefront(props: Props) {
  const [saved, setSaved] = useState<string[]>([]);
  return <main className="sc-market">
    <div className="sc-market-top"><span>ตลาดอุปกรณ์บาสเกตบอลของนักกีฬาไทย</span><div><span>{props.isPro ? "PRO" : "FREE"} · โควตาประกาศ {props.quota}</span><button onClick={props.onCreate}><Plus size={15} /> ลงประกาศขาย</button></div></div>
    <section className="sc-market-hero">
      <img className="sc-market-hero-image" src="/images/market/gear-hero.png" alt="ภาพประกอบรองเท้า ลูกบาส และอุปกรณ์ฝึกซ้อม" width={1536} height={1024} />
      <div className="sc-market-hero-copy"><h1>GEAR UP.<br /><span>OWN THE COURT.</span></h1><p>อุปกรณ์คู่ใจ สำหรับเกมของคุณ<br />เลือกซื้อและส่งต่อจากนักบาสด้วยกัน</p><div><a href="#market-products" className="sc-sport-button">เลือกซื้ออุปกรณ์ <ArrowUpRight size={18} /></a><button onClick={props.onCreate} className="sc-sport-button is-outline">ลงประกาศขาย <Plus size={18} /></button></div></div>
      <span className="sc-market-art-caption">ภาพประกอบคอลเลกชัน</span>
    </section>
    <div className="sc-market-services"><div><Users /><span><b>จากนักกีฬา สู่นักกีฬา</b>ดูผู้ขายและสังกัด</span></div><div><Footprints /><span><b>ประวัติจากสนาม</b>ดูนักกีฬาที่เคยใช้อุปกรณ์</span></div><div><MessageCircle /><span><b>สอบถามโดยตรง</b>คุยเรื่องสภาพและขนาด</span></div><button onClick={props.onTerms}><Shield /><span><b>เงื่อนไขการซื้อขาย</b>อ่านก่อนตัดสินใจ</span><ArrowUpRight size={17} /></button></div>
    <div className="sc-market-demo">พื้นที่สาธิต · การส่งคำถามและลงประกาศเป็นการจำลอง ยังไม่มีการชำระเงินจริง</div>
    <section className="sc-market-body">
      <div className="sc-market-categories" aria-label="หมวดอุปกรณ์">{props.categories.map((category, i) => { const Icon = categoryIcons[i]; return <button key={category.id} aria-pressed={props.selectedCategory === category.id} onClick={() => props.onCategory(category.id)} className={props.selectedCategory === category.id ? "is-selected" : ""}><span><Icon size={34} strokeWidth={1.5} /></span><b>{categoryLabels[category.id] || category.label}</b><small>{props.selectedCategory === category.id ? "กำลังเลือก" : "ดูสินค้า"}</small></button>; })}</div>
      <section id="market-products" className="sc-market-products">
        <div className="sc-market-products-heading"><div><h2>FIND YOUR NEXT GEAR.</h2><p>{props.items.length} ประกาศ{props.selectedCategory !== "ALL" ? ` · ${categoryLabels[props.selectedCategory]}` : "จากชุมชนนักบาส"}</p></div><label className="sc-market-search"><Search size={18} /><input value={props.searchQuery} onChange={e => props.onSearch(e.target.value)} placeholder="ค้นหารุ่นสินค้า ผู้ขาย หรือโรงเรียน" aria-label="ค้นหาอุปกรณ์" /></label></div>
        <div className="sc-market-product-grid">{props.items.map(item => <article className="sc-market-product" key={item.id}>
          <div className="sc-market-product-image"><img src={item.imageUrls[0]} alt={item.title} loading="lazy" /><span>{item.condition}</span><button aria-label={`${saved.includes(item.id) ? "เลิกบันทึก" : "บันทึก"} ${item.title}`} aria-pressed={saved.includes(item.id)} onClick={() => setSaved(previous => previous.includes(item.id) ? previous.filter(id => id !== item.id) : [...previous, item.id])}><Heart size={18} fill={saved.includes(item.id) ? "currentColor" : "none"} /></button></div>
          <div className="sc-market-product-meta"><span>{item.brand} · {item.size}</span><h3>{item.title}</h3><strong>฿{item.priceThb.toLocaleString()}</strong><p>{item.sellerName}<small>{item.sellerSchool}</small></p>{item.wornByAthletes?.length > 0 && <button className="sc-market-history" onClick={() => props.onHistory(item)}><Footprints size={14} /> นักกีฬาที่เคยใช้ <ArrowRight size={14} /></button>}<button className="sc-market-inquire" disabled={item.isSold} onClick={() => props.onInquiry(item)}>{item.isSold ? "ขายแล้ว" : "สอบถามผู้ขาย"}<ArrowUpRight size={16} /></button></div>
        </article>)}</div>
        {props.items.length === 0 && <div className="sc-market-empty"><ShoppingBag size={32} /><h3>ไม่พบอุปกรณ์ที่ค้นหา</h3><p>ลองค้นด้วยชื่อรุ่นหรือเลือกหมวดอื่น</p><button onClick={() => { props.onCategory("ALL"); props.onSearch(""); }}>ดูอุปกรณ์ทั้งหมด</button></div>}
      </section>
      <div className="sc-market-promos"><section><h2>GOOD GEAR.<br />NEXT CHAPTER.</h2><p>อุปกรณ์ที่พร้อมส่งต่อ<br />อาจเป็นคู่ใจในเกมต่อไปของใครสักคน</p><button className="sc-sport-button" onClick={props.onCreate}>ลงประกาศของคุณ <ArrowUpRight size={18} /></button></section><section><h2>MORE ROOM.<br /><span>FOR YOUR GEAR.</span></h2><p>ดูแพ็กเกจและโควตาลงประกาศ<br />เลือกพื้นที่ที่เหมาะกับคุณ</p><button className="sc-sport-button" onClick={props.onPricing}>ดูแพ็กเกจ <ArrowUpRight size={18} /></button><img src="/images/market/gear-hero.png" alt="" loading="lazy" /></section></div>
    </section>
  </main>;
}

"use client";

import React, { useState } from "react";
import { CheckCircle2, Send } from "lucide-react";

export default function B2BLeadSection() {

  // Contact / Lead form state
  const [contactName, setContactName] = useState("");
  const [organization, setOrganization] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [orgType, setOrgType] = useState<"TOURNAMENT" | "SCHOOL" | "SCOUT">("TOURNAMENT");
  const [teamCount, setTeamCount] = useState("16");
  const [message, setMessage] = useState("");
  const [isLeadSubmitted, setIsLeadSubmitted] = useState(false);

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !phone) return;
    setIsLeadSubmitted(true);
  };

  return (
    <section id="contact-form" className="py-16 bg-[#0F172A] text-white">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: Heading & Value */}
          <div className="lg:col-span-5 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#DC2626]/20 border border-[#DC2626]/40 text-red-200 text-xs font-mono font-bold tracking-widest uppercase">
              READY TO ELEVATE
            </div>
            <h2 className="font-headline-xl text-white uppercase tracking-normal text-3xl sm:text-4xl font-normal leading-snug">
              พร้อมยกระดับการแข่งขันของคุณสู่มาตรฐานระดับอาชีพ
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              กรอกข้อมูลการแข่งขันเบื้องต้น ทีมงานผู้เชี่ยวชาญของ StatCourtTH จะติดต่อกลับภายใน 24 ชั่วโมง 
              เพื่อจัดทำข้อเสนอทางการพร้อมนัดหมายสาธิตการใช้งานระบบแก่ทีมงานของคุณ
            </p>
            <div className="space-y-2.5 pt-1 text-xs font-mono text-slate-400">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#DC2626] shrink-0" />
                <span>บริการสาธิตระบบฟรีผ่านออนไลน์ (Zoom) หรือ On-Site ณ สถานที่จัดการแข่งขัน</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#DC2626] shrink-0" />
                <span>จัดเตรียมสเปกแท็บเล็ตและอุปกรณ์สำหรับโต๊ะเทคนิคภาคสนามพร้อมใช้งาน</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#DC2626] shrink-0" />
                <span>เอกสารสัญญาและใบกำกับภาษีถูกต้องตามระเบียบพัสดุและเบิกจ่ายของหน่วยงาน</span>
              </div>
            </div>
          </div>

          {/* Right Column: Lead Form */}
          <div className="lg:col-span-7">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
              {isLeadSubmitted ? (
                <div className="py-10 text-center space-y-3 font-mono">
                  <div className="w-14 h-14 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-700 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="font-headline-md text-white font-bold text-xl uppercase">
                    ได้รับข้อมูลการติดต่อเรียบร้อยแล้ว
                  </h3>
                  <p className="text-slate-300 text-xs max-w-md mx-auto">
                    ทีมงานผู้ดูแลระบบของ StatCourtTH จะติดต่อกลับไปยังหมายเลข <span className="text-white font-bold">{phone}</span> ภายใน 24 ชั่วโมง ขอบคุณสำหรับความไว้วางใจ
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsLeadSubmitted(false)}
                    className="px-5 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase transition mt-2 cursor-pointer"
                  >
                    ส่งข้อมูลรายการแข่งขันอื่นเพิ่มเติม
                  </button>
                </div>
              ) : (
                <form onSubmit={handleLeadSubmit} className="space-y-4 text-xs font-mono">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 mb-1.5 uppercase font-bold">
                        ชื่อผู้ประสานงาน / ตำแหน่ง *
                      </label>
                      <input
                        required
                        type="text"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="เช่น ดร.ไชยปรีชา วัฒนพันธ์ (ผอ.จัดการแข่งขัน)"
                        className="w-full px-3.5 py-2 rounded bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-[#DC2626]"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 mb-1.5 uppercase font-bold">
                        หมายเลขโทรศัพท์ติดต่อ *
                      </label>
                      <input
                        required
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="08X-XXX-XXXX"
                        className="w-full px-3.5 py-2 rounded bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-[#DC2626]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 mb-1.5 uppercase font-bold">
                        ชื่อรายการแข่งขัน หรือ สถาบัน *
                      </label>
                      <input
                        required
                        type="text"
                        value={organization}
                        onChange={(e) => setOrganization(e.target.value)}
                        placeholder="เช่น Thailand Youth Basketball League 2026"
                        className="w-full px-3.5 py-2 rounded bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-[#DC2626]"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 mb-1.5 uppercase font-bold">
                        อีเมลสำหรับรับเอกสารทางการ *
                      </label>
                      <input
                        required
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tournament@organization.org"
                        className="w-full px-3.5 py-2 rounded bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-[#DC2626]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 mb-1.5 uppercase font-bold">
                        ประเภทหน่วยงาน / องค์กร
                      </label>
                      <select
                        value={orgType}
                        onChange={(e) => setOrgType(e.target.value as any)}
                        className="w-full px-3.5 py-2 rounded bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-[#DC2626]"
                      >
                        <option value="TOURNAMENT">ผู้จัดทัวร์นาเมนต์ / ฝ่ายจัดการแข่งขันลีก</option>
                        <option value="SCHOOL">สถานศึกษา / สโมสรบาสเกตบอลเยาวชน</option>
                        <option value="SCOUT">สถาบันอุดมศึกษา / สโมสรกีฬาอาชีพ</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-300 mb-1.5 uppercase font-bold">
                        จำนวนทีมแข่งขันโดยประมาณ
                      </label>
                      <select
                        value={teamCount}
                        onChange={(e) => setTeamCount(e.target.value)}
                        className="w-full px-3.5 py-2 rounded bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-[#DC2626]"
                      >
                        <option value="8">8 ทีม (มินิลีก / 1 สนามแข่งขัน)</option>
                        <option value="16">16 ทีม (ทัวร์นาเมนต์มาตรฐาน / 1-2 สนาม)</option>
                        <option value="32">32 ทีม (ลีกระดับภูมิภาค / 2-3 สนาม)</option>
                        <option value="64+">64+ ทีม (รายการชิงแชมป์ระดับประเทศ / หลายสนาม)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1.5 uppercase font-bold">
                      รายละเอียดเพิ่มเติม / กำหนดการแข่งขัน
                    </label>
                    <textarea
                      rows={2}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="ระบุสถานที่จัดการแข่งขัน วันที่เริ่ม หรือความประสงค์เฉพาะ เช่น ต้องการทีมงานโต๊ะเทคนิคพร้อมอุปกรณ์"
                      className="w-full px-3.5 py-2 rounded bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-[#DC2626]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded bg-[#DC2626] hover:bg-[#B91C1C] text-white font-mono font-bold text-xs tracking-wider uppercase transition shadow-lg shadow-red-950/40 flex items-center justify-center gap-2 mt-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>ส่งข้อมูลเพื่อขอรับข้อเสนอทางการ</span>
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

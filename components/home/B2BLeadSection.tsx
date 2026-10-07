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
    <section id="contact-form" className="py-16 bg-[#071322] text-white border-t border-[#213145]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: Heading & Value */}
          <div className="lg:col-span-5 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#AF101A]/20 border border-[#AF101A]/40 text-red-200 text-xs font-mono font-bold tracking-widest uppercase">
              READY TO ELEVATE
            </div>
            <h2 className="font-sans font-bold text-white text-2xl sm:text-3xl lg:text-4xl leading-snug">
              พร้อมยกระดับการแข่งขันของคุณสู่มาตรฐานระดับอาชีพ
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              กรอกข้อมูลการแข่งขันเบื้องต้น ทีมงานผู้เชี่ยวชาญของ StatCourtTH จะติดต่อกลับภายใน 24 ชั่วโมง 
              เพื่อจัดทำข้อเสนอทางการพร้อมนัดหมายสาธิตการใช้งานระบบแก่ทีมงานของคุณ
            </p>
            <div className="space-y-2.5 pt-1 text-xs text-slate-400">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>บริการสาธิตระบบฟรีผ่านออนไลน์ (Zoom) หรือ On-Site ณ สถานที่จัดการแข่งขัน</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>จัดเตรียมสเปกแท็บเล็ตและอุปกรณ์สำหรับโต๊ะเทคนิคภาคสนามพร้อมใช้งาน</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>เอกสารสัญญาและใบกำกับภาษีถูกต้องตามระเบียบพัสดุและเบิกจ่ายของหน่วยงาน</span>
              </div>
            </div>
          </div>

          {/* Right Column: Lead Form */}
          <div className="lg:col-span-7">
            <div className="bg-[#0B1C30] border border-[#213145] rounded-2xl p-6 sm:p-8 shadow-2xl">
              {isLeadSubmitted ? (
                <div className="py-10 text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-600/50 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="font-headline-md text-white font-bold text-xl">
                    ได้รับข้อมูลการติดต่อเรียบร้อยแล้ว
                  </h3>
                  <p className="text-slate-300 text-xs max-w-md mx-auto">
                    ทีมงานผู้ดูแลระบบของ StatCourtTH จะติดต่อกลับไปยังหมายเลข <span className="text-white font-bold font-mono tabular-nums">{phone}</span> ภายใน 24 ชั่วโมง ขอบคุณสำหรับความไว้วางใจ
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsLeadSubmitted(false)}
                    className="px-5 py-2.5 rounded-xl bg-[#0d223a] hover:bg-[#153354] text-slate-200 border border-[#213145] text-xs font-semibold transition mt-2 cursor-pointer"
                  >
                    ส่งข้อมูลรายการแข่งขันอื่นเพิ่มเติม
                  </button>
                </div>
              ) : (
                <form onSubmit={handleLeadSubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 mb-1.5 font-semibold">
                        ชื่อผู้ประสานงาน / ตำแหน่ง *
                      </label>
                      <input
                        required
                        type="text"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="เช่น ดร.ไชยปรีชา วัฒนพันธ์ (ผอ.จัดการแข่งขัน)"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#071322] border border-[#213145] text-white placeholder:text-slate-500 focus:outline-none focus:border-[#AF101A] transition"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 mb-1.5 font-semibold">
                        หมายเลขโทรศัพท์ติดต่อ *
                      </label>
                      <input
                        required
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="08X-XXX-XXXX"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#071322] border border-[#213145] text-white placeholder:text-slate-500 focus:outline-none focus:border-[#AF101A] font-mono tabular-nums transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 mb-1.5 font-semibold">
                        ชื่อรายการแข่งขัน หรือ สถาบัน *
                      </label>
                      <input
                        required
                        type="text"
                        value={organization}
                        onChange={(e) => setOrganization(e.target.value)}
                        placeholder="เช่น Thailand Youth Basketball League 2026"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#071322] border border-[#213145] text-white placeholder:text-slate-500 focus:outline-none focus:border-[#AF101A] transition"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 mb-1.5 font-semibold">
                        อีเมลสำหรับรับเอกสารทางการ *
                      </label>
                      <input
                        required
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tournament@organization.org"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#071322] border border-[#213145] text-white placeholder:text-slate-500 focus:outline-none focus:border-[#AF101A] transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 mb-1.5 font-semibold">
                        ประเภทหน่วยงาน / องค์กร
                      </label>
                      <select
                        value={orgType}
                        onChange={(e) => setOrgType(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#071322] border border-[#213145] text-white focus:outline-none focus:border-[#AF101A] transition"
                      >
                        <option value="TOURNAMENT">ผู้จัดทัวร์นาเมนต์ / ฝ่ายจัดการแข่งขันลีก</option>
                        <option value="SCHOOL">สถานศึกษา / สโมสรบาสเกตบอลเยาวชน</option>
                        <option value="SCOUT">สถาบันอุดมศึกษา / สโมสรกีฬาอาชีพ</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-300 mb-1.5 font-semibold">
                        จำนวนทีมแข่งขันโดยประมาณ
                      </label>
                      <select
                        value={teamCount}
                        onChange={(e) => setTeamCount(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#071322] border border-[#213145] text-white focus:outline-none focus:border-[#AF101A] transition"
                      >
                        <option value="8">8 ทีม (มินิลีก / 1 สนามแข่งขัน)</option>
                        <option value="16">16 ทีม (ทัวร์นาเมนต์มาตรฐาน / 1-2 สนาม)</option>
                        <option value="32">32 ทีม (ลีกระดับภูมิภาค / 2-3 สนาม)</option>
                        <option value="64+">64+ ทีม (รายการชิงแชมป์ระดับประเทศ / หลายสนาม)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1.5 font-semibold">
                      รายละเอียดเพิ่มเติม / กำหนดการแข่งขัน
                    </label>
                    <textarea
                      rows={2}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="ระบุสถานที่จัดการแข่งขัน วันที่เริ่ม หรือความประสงค์เฉพาะ เช่น ต้องการทีมงานโต๊ะเทคนิคพร้อมอุปกรณ์"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#071322] border border-[#213145] text-white placeholder:text-slate-500 focus:outline-none focus:border-[#AF101A] transition"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-[#AF101A] hover:bg-[#8E0D15] text-white font-semibold text-xs transition shadow-lg shadow-red-950/40 flex items-center justify-center gap-2 mt-2 cursor-pointer"
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

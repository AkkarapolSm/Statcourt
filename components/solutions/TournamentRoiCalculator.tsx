"use client";

import React, { useState } from "react";
import {
  Calculator,
  TrendingUp,
  Users,
  DollarSign,
  Sparkles,
} from "lucide-react";

export default function TournamentRoiCalculator() {
  const [teamCount, setTeamCount] = useState<number>(16);
  const [entryFee, setEntryFee] = useState<number>(8500);
  const [ticketPrice, setTicketPrice] = useState<number>(50);
  const [expectedViewersPerGame, setExpectedViewersPerGame] = useState<number>(300);

  // Calculations
  const totalGames = Math.floor(teamCount * 2.2); // Tournament formula estimate
  const registrationRevenue = teamCount * entryFee;
  const spectatorTicketRevenue = totalGames * expectedViewersPerGame * 0.4 * ticketPrice;
  const totalEstimatedRevenue = registrationRevenue + spectatorTicketRevenue;

  // Operational Savings with StatCourtTH SaaS
  const paperPrintingSavings = totalGames * 180; // Scoresheets, roster sheets, brackets
  const disputeCostSavings = 35000; // Estimated cost of appeals, arbitration, replay delays
  const staffHoursSaved = totalGames * 1.5; // Manual stat entry and bracket drawing hours saved
  const softwareCost = 8900; // StatCourt Pro Tier

  const netValueGain = totalEstimatedRevenue + paperPrintingSavings + disputeCostSavings - softwareCost;

  return (
    <div className="bg-white border border-[#DFE2EB] rounded-lg p-6 sm:p-8 shadow-xs relative overflow-hidden">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#DFE2EB]">
        <div>
          <div className="flex items-center gap-2 text-[#AF101A] font-mono text-xs uppercase font-bold tracking-wider mb-1">
            <Calculator className="w-4 h-4" />
            <span>INTERACTIVE ORGANIZER ROI CALCULATOR</span>
          </div>
          <h3 className="font-headline-lg text-[#0B1C30] uppercase text-2xl sm:text-3xl font-bold">
            คำนวณผลตอบแทนและความคุ้มค่าของการจัดทัวร์นาเมนต์
          </h3>
          <p className="text-xs sm:text-sm text-[#5B6574] mt-1 font-sans">
            ปรับเปลี่ยนพารามิเตอร์เพื่อจำลองรายรับและต้นทุนที่ประหยัดได้ด้วยระบบ StatCourtTH SaaS
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-sm bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono text-xs font-bold flex items-center gap-2 shrink-0">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>ESTIMATED ROI: &gt; 800%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
        {/* Sliders Control Panel (6 Cols) */}
        <div className="lg:col-span-6 space-y-5">
          {/* Slider 1: Team Count */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-[#0B1C30] font-bold flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#AF101A]" />
                จำนวนทีมเข้าร่วม (Teams)
              </span>
              <span className="text-[#AF101A] font-black text-sm tabular-nums">{teamCount} ทีม</span>
            </div>
            <input
              type="range"
              min={8}
              max={64}
              step={4}
              value={teamCount}
              onChange={(e) => setTeamCount(Number(e.target.value))}
              aria-label="จำนวนทีมเข้าร่วม"
              className="w-full h-2 bg-slate-200 rounded-sm appearance-none cursor-pointer accent-[#AF101A]"
            />
            <div className="flex justify-between text-[10px] text-[#5B6574] font-mono">
              <span>8 ทีม (Mini)</span>
              <span>16 ทีม (Standard)</span>
              <span>32 ทีม</span>
              <span>64 ทีม (Major)</span>
            </div>
          </div>

          {/* Slider 2: Entry Fee */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-[#0B1C30] font-bold flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                ค่าสมัครเฉลี่ยต่อทีม (Entry Fee / Team)
              </span>
              <span className="text-emerald-700 font-black text-sm tabular-nums">
                {entryFee.toLocaleString()} THB
              </span>
            </div>
            <input
              type="range"
              min={3000}
              max={25000}
              step={500}
              value={entryFee}
              onChange={(e) => setEntryFee(Number(e.target.value))}
              aria-label="ค่าสมัครเฉลี่ยต่อทีม"
              className="w-full h-2 bg-slate-200 rounded-sm appearance-none cursor-pointer accent-emerald-600"
            />
            <div className="flex justify-between text-[10px] text-[#5B6574] font-mono">
              <span>3,000 THB</span>
              <span>8,500 THB</span>
              <span>15,000 THB</span>
              <span>25,000 THB</span>
            </div>
          </div>

          {/* Slider 3: Ticket Price */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-[#0B1C30] font-bold">ราคาบัตรเข้าชมรอบชิง / ไฮไลท์ (Ticket Price)</span>
              <span className="text-amber-700 font-black text-sm tabular-nums">{ticketPrice} THB</span>
            </div>
            <input
              type="range"
              min={0}
              max={150}
              step={10}
              value={ticketPrice}
              onChange={(e) => setTicketPrice(Number(e.target.value))}
              aria-label="ราคาบัตรเข้าชมรอบชิง"
              className="w-full h-2 bg-slate-200 rounded-sm appearance-none cursor-pointer accent-amber-600"
            />
            <div className="flex justify-between text-[10px] text-[#5B6574] font-mono">
              <span>0 (ฟรี)</span>
              <span>50 THB</span>
              <span>100 THB</span>
              <span>150 THB</span>
            </div>
          </div>

          {/* Value Summary Cards */}
          <div className="grid grid-cols-2 gap-3 pt-2 font-mono text-xs">
            <div className="p-3.5 rounded-sm bg-[#F8F9FF] border border-[#DFE2EB] space-y-1">
              <span className="text-[10px] text-[#5B6574] uppercase block">จำนวนแมตช์รวม</span>
              <span className="text-lg font-black text-[#0B1C30] tabular-nums">{totalGames} แมตช์</span>
              <span className="text-[10px] text-[#5B6574] block">Single &amp; Group Stage</span>
            </div>
            <div className="p-3.5 rounded-sm bg-emerald-50/60 border border-emerald-200 space-y-1">
              <span className="text-[10px] text-emerald-800 uppercase block">ชั่วโมงงานที่ประหยัดได้</span>
              <span className="text-lg font-black text-emerald-700 tabular-nums">{Math.round(staffHoursSaved)} ชม.</span>
              <span className="text-[10px] text-emerald-700 block">ลดภาระสถิติและใบบันทึก</span>
            </div>
          </div>
        </div>

        {/* Projected Outcome Card (6 Cols) */}
        <div className="lg:col-span-6 bg-[#0B1C30] border border-slate-800 rounded-lg p-6 text-white flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <span className="text-xs font-mono text-[#A9B6C8] uppercase font-bold tracking-wider block">
              สรุปผลประกอบการและการประหยัดต้นทุนโดยประมาณ
            </span>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="text-slate-300">1. รายรับจากค่าสมัครทีม (Registration):</span>
                <span className="font-bold text-white text-sm tabular-nums">
                  {registrationRevenue.toLocaleString()} ฿
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="text-slate-300">2. รายรับจากบัตรและสปอนเซอร์สตรีมมิ่ง:</span>
                <span className="font-bold text-amber-400 text-sm tabular-nums">
                  {Math.round(spectatorTicketRevenue).toLocaleString()} ฿
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="text-slate-300">3. มูลค่าที่ประหยัดได้ (Paperless &amp; Anti-Dispute):</span>
                <span className="font-bold text-emerald-400 text-sm tabular-nums">
                  {(paperPrintingSavings + disputeCostSavings).toLocaleString()} ฿
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-800 text-slate-400">
                <span>ค่าบริการซอฟต์แวร์ StatCourtTH Pro (One-off):</span>
                <span className="tabular-nums">- {softwareCost.toLocaleString()} ฿</span>
              </div>
            </div>
          </div>

          {/* Big Result Box */}
          <div className="p-4 rounded-sm bg-[#213145] border border-slate-700 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#A9B6C8] block">
                มูลค่าสุทธิที่ผู้จัดได้รับ (Net Projected Value)
              </span>
              <span className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight tabular-nums">
                {Math.round(netValueGain).toLocaleString()} <span className="text-sm font-bold text-[#FF7A7A]">THB</span>
              </span>
            </div>
            <div className="text-right font-mono text-[11px] text-emerald-400 font-bold flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              <span>คุ้มค่าตั้งแต่แมตช์แรก</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Role, Position } from "@/lib/types";
import { useAuthStore } from "@/lib/auth/useAuthStore";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function RegisterPortalPage() {
  const { loginAs } = useAuthStore();
  const [selectedRole, setSelectedRole] = useState<Role>("FAN");
  const [submitted, setSubmitted] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);

  // Form fields
  const [fullName, setFullName] = useState("Thanakorn Siriphan");
  const [email, setEmail] = useState("athlete@statcourt.th");
  const [phoneNumber, setPhoneNumber] = useState("081-234-5678");
  const [schoolOrClub, setSchoolOrClub] = useState("Bangkok Christian College");
  const [position, setPosition] = useState<Position>("POINT_GUARD");
  const [heightCm, setHeightCm] = useState(185);
  const [wingspanCm, setWingspanCm] = useState(192);
  const [standingReachCm, setStandingReachCm] = useState(245);
  const [consentScout, setConsentScout] = useState(true);
  const [consentTerms, setConsentTerms] = useState(true);

  // Computed metrics
  const apeIndex = wingspanCm - heightCm;
  const heightFeetInches = `${Math.floor(heightCm / 30.48)}'${Math.round(
    (heightCm % 30.48) / 2.54
  )}"`;
  const reachFeetInches = `${Math.floor(standingReachCm / 30.48)}'${Math.round(
    (standingReachCm % 30.48) / 2.54
  )}"`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginAs(selectedRole);
    setSubmitted(true);
  };

  const handleSaveDraft = () => {
    setDraftSaved(true);
    setTimeout(() => setDraftSaved(false), 2500);
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col antialiased selection:bg-primary selection:text-white">
      {/* Universal Navbar */}
      <Navbar />

      {/* Sub-banner for Registration Portal */}
      <div className="w-full bg-[#AF101A] text-white py-2.5 px-4 shadow-sm border-b border-red-900">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center space-x-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1 bg-white/10 hover:bg-white/20 transition-colors px-2.5 py-1 rounded text-white font-bold uppercase tracking-wider text-[11px]"
            >
              <span className="material-symbols-outlined text-[14px]">arrow_back</span>
              <span>HOME</span>
            </Link>
            <span className="text-white/40">/</span>
            <span className="font-bold uppercase tracking-wide text-white">
              Role-Based Registration Portal
            </span>
          </div>

          <div className="flex items-center space-x-3 text-white/90">
            <div className="flex items-center gap-1.5 bg-black/20 px-2.5 py-0.5 rounded border border-white/10 text-[11px]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="tracking-wider uppercase text-white font-bold">
                BSAT OFFICIAL ENDORSED
              </span>
            </div>
            <div className="hidden lg:flex items-center gap-1 text-white/80 text-[11px]">
              <span className="material-symbols-outlined text-[14px]">verified</span>
              <span>FIBA LiveStats v4.2 Quota Validated</span>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN REGISTRATION CANVAS */}
      <main className="flex-grow py-space-lg md:py-space-xl px-4 md:px-gutter-desktop">
        <div className="max-w-4xl mx-auto">
          {/* Primary Card Container */}
          <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl shadow-sm overflow-hidden">
            {submitted ? (
              <div className="p-8 md:p-12 text-center space-y-4">
                {selectedRole === "FAN" ? (
                  <>
                    <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
                      <span
                        className="material-symbols-outlined text-[36px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        favorite
                      </span>
                    </div>
                    <h2 className="font-headline-lg text-headline-lg uppercase text-on-surface">
                      General Member Profile Activated!
                    </h2>
                    <div className="inline-block bg-amber-50 border border-amber-300 text-amber-900 px-4 py-1.5 rounded font-label-caps text-label-caps uppercase font-bold">
                      STATCOURT FAN ID #FAN-2026-BCC-889
                    </div>
                    <p className="font-body-md text-secondary max-w-md mx-auto leading-relaxed">
                      ยินดีต้อนรับสู่ประชาคมบาสเกตบอลไทย! บัญชีสมาชิกทั่วไปของคุณพร้อมใช้งานแล้ว คุณสามารถติดตามทีมโปรด รับการแจ้งเตือนสกอร์สด และเลือกซื้อสินค้าใน Gear Market ได้ทันที
                    </p>
                    <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
                      <Link
                        href="/team"
                        onClick={() => loginAs("FAN")}
                        className="bg-amber-600 hover:bg-amber-700 text-white px-7 py-2.5 rounded font-headline-sm text-headline-sm uppercase tracking-wider font-bold shadow-md hover:shadow-lg transition-all"
                      >
                        เข้าสู่ระบบด้วยบทบาทสมาชิกทั่วไป →
                      </Link>
                      <Link
                        href="/live"
                        className="border border-outline-variant px-5 py-2.5 rounded font-label-caps uppercase text-secondary hover:text-on-surface"
                      >
                        ดูผลสด &amp; ตารางแข่ง
                      </Link>
                      <button
                        onClick={() => setSubmitted(false)}
                        className="border border-outline-variant px-5 py-2.5 rounded font-label-caps uppercase text-secondary hover:text-on-surface cursor-pointer"
                      >
                        แก้ไขข้อมูล
                      </button>
                    </div>
                  </>
                ) : selectedRole === "ATHLETE" ? (
                  <>
                    <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
                      <span
                        className="material-symbols-outlined text-[36px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        check_circle
                      </span>
                    </div>
                    <h2 className="font-headline-lg text-headline-lg uppercase text-on-surface">
                      Athlete Profile Activated!
                    </h2>
                    <div className="inline-block bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-1.5 rounded font-label-caps text-label-caps uppercase font-bold">
                      TCAS SPORTS QUOTA ID #2026-BCC-007
                    </div>
                    <p className="font-body-md text-secondary max-w-md mx-auto leading-relaxed">
                      Your digital portfolio and physical metrics have been calibrated. You are now eligible to appear on tournament box scores, live scouting filters, and the footwear exchange.
                    </p>
                    <div className="pt-4 flex items-center justify-center gap-3">
                      <Link
                        href="/athlete/ath-1"
                        onClick={() => loginAs("ATHLETE")}
                        className="bg-primary hover:bg-[#8e0d15] text-white px-7 py-2.5 rounded font-headline-sm text-headline-sm uppercase tracking-wider font-bold shadow-md hover:shadow-lg transition-all"
                      >
                        VIEW DIGITAL PLAYER CARD →
                      </Link>
                      <button
                        onClick={() => setSubmitted(false)}
                        className="border border-outline-variant px-5 py-2.5 rounded font-label-caps uppercase text-secondary hover:text-on-surface"
                      >
                        Edit Details
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-inner">
                      <span className="material-symbols-outlined text-[36px]">schedule</span>
                    </div>
                    <h2 className="font-headline-lg text-headline-lg uppercase text-on-surface">
                      Registration Pending Administrative Review
                    </h2>
                    <div className="inline-block bg-amber-50 border border-amber-300 text-amber-900 px-4 py-1.5 rounded font-label-caps text-label-caps uppercase font-bold">
                      STATUS: PENDING VALIDATION
                    </div>
                    <p className="font-body-md text-secondary max-w-md mx-auto leading-relaxed">
                      {selectedRole === "OFFICIAL"
                        ? "To protect the Official Table as the single source of truth, access to the courtside touch console remains restricted until an Admin verifies your BSAT official table license."
                        : "Access to official tournament line-up submissions remains locked until an Admin validates your school or club affiliation credentials."}
                    </p>
                    <div className="pt-4 flex items-center justify-center gap-3">
                      <Link
                        href="/official/console/match-bcc-ds-01"
                        onClick={() => loginAs(selectedRole === "OFFICIAL" ? "OFFICIAL" : "COACH")}
                        className="bg-inverse-surface hover:bg-black text-white px-7 py-2.5 rounded font-headline-sm text-headline-sm uppercase tracking-wider font-bold shadow-md hover:shadow-lg transition-all"
                      >
                        DEMO VERIFIED TABLE CONSOLE →
                      </Link>
                      <button
                        onClick={() => setSubmitted(false)}
                        className="border border-outline-variant px-5 py-2.5 rounded font-label-caps uppercase text-secondary hover:text-on-surface"
                      >
                        Back to Form
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                {/* Form Header Section */}
                <div className="p-6 md:p-8 border-b border-outline-variant/40 bg-gradient-to-b from-surface-container-low/40 to-transparent">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-0.5 rounded font-label-caps text-label-caps tracking-widest uppercase font-bold">
                          <span className="material-symbols-outlined text-[14px]">
                            sports_basketball
                          </span>
                          AUTHENTICATED SCOUT REPOSITORY
                        </span>
                        <span className="text-secondary font-body-sm text-body-sm">
                          • THAILAND BASKETBALL FEDERATION
                        </span>
                      </div>
                      <h1 className="font-headline-lg text-headline-lg uppercase text-on-surface tracking-wide">
                        Join StatCourtTH Platform
                      </h1>
                      <p className="font-body-md text-body-md text-secondary mt-0.5">
                        Select your platform role to configure appropriate access boundaries, statistical quota credentials, and verification workflows.
                      </p>
                    </div>

                    <div className="flex-shrink-0 flex items-center gap-3 self-start md:self-auto bg-surface-container px-3 py-2 rounded-lg border border-outline-variant/30">
                      <span className="material-symbols-outlined text-primary text-[24px]">
                        assignment_ind
                      </span>
                      <div className="text-right">
                        <div className="font-label-caps text-label-caps uppercase text-secondary">
                          REGISTRATION FLOW
                        </div>
                        <div className="font-headline-sm text-headline-sm text-primary tracking-wider">
                          STEP 1 OF 3
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ROLE SELECTORS */}
                  <div className="mt-8">
                    <div className="font-label-caps text-label-caps text-secondary uppercase tracking-wider mb-2.5 flex items-center justify-between">
                      <span>SELECT YOUR ECOSYSTEM ROLE:</span>
                      <span className="text-primary font-bold">1 ROLE ACTIVE</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {/* Role 0: General Member / Fan */}
                      <div
                        onClick={() => setSelectedRole("FAN")}
                        className={`relative bg-surface-container-lowest rounded-lg p-4 cursor-pointer transition-all ${
                          selectedRole === "FAN"
                            ? "border-2 border-amber-500 shadow-md ring-1 ring-amber-500/20"
                            : "border border-outline-variant/60 hover:border-outline opacity-80 hover:opacity-100"
                        }`}
                      >
                        {selectedRole === "FAN" && (
                          <div className="absolute -top-2.5 right-3 bg-amber-500 text-white font-label-badge text-label-badge uppercase px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
                            <span
                              className="material-symbols-outlined text-[12px]"
                              style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                              check_circle
                            </span>
                            <span>SELECTED</span>
                          </div>
                        )}
                        <div className="font-label-caps text-label-caps text-amber-600 uppercase font-bold tracking-wider mb-1 flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px]">favorite</span>
                          GENERAL MEMBER
                        </div>
                        <div className="font-headline-sm text-headline-sm text-on-surface uppercase leading-snug">
                          แฟนคลับ / สมาชิกทั่วไป
                        </div>
                        <div className="font-body-sm text-body-sm text-secondary mt-1">
                          ติดตามทีมโปรด รับการแจ้งเตือนคะแนนสด ซื้อบัตร VIP &amp; Gear Market.
                        </div>
                        <div className="mt-3 pt-2.5 border-t border-outline-variant/40 flex items-center justify-between text-amber-700 font-label-caps text-label-caps">
                          <span className="font-bold">ฟรีค่าธรรมเนียม</span>
                          <span className="text-secondary font-normal">เปิดใช้งานทันที</span>
                        </div>
                      </div>

                      {/* Role 1: Athlete */}
                      <div
                        onClick={() => setSelectedRole("ATHLETE")}
                        className={`relative bg-surface-container-lowest rounded-lg p-4 cursor-pointer transition-all ${
                          selectedRole === "ATHLETE"
                            ? "border-2 border-primary shadow-md"
                            : "border border-outline-variant/60 hover:border-outline opacity-80 hover:opacity-100"
                        }`}
                      >
                        {selectedRole === "ATHLETE" && (
                          <div className="absolute -top-2.5 right-3 bg-primary text-white font-label-badge text-label-badge uppercase px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
                            <span
                              className="material-symbols-outlined text-[12px]"
                              style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                              check_circle
                            </span>
                            <span>SELECTED</span>
                          </div>
                        )}
                        <div className="font-label-caps text-label-caps text-primary uppercase font-bold tracking-wider mb-1 flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px]">person</span>
                          ATHLETE
                        </div>
                        <div className="font-headline-sm text-headline-sm text-on-surface uppercase leading-snug">
                          Student-Athlete
                        </div>
                        <div className="font-body-sm text-body-sm text-secondary mt-1">
                          Instant profile, TCAS card, talent showcase, verified stats &amp; gear market.
                        </div>
                        <div className="mt-3 pt-2.5 border-t border-outline-variant/40 flex items-center justify-between text-primary font-label-caps text-label-caps">
                          <span className="font-bold">TCAS QUOTA READY</span>
                          <span className="text-secondary font-normal">INSTANT ACCESS</span>
                        </div>
                      </div>

                      {/* Role 2: Coach / Scout */}
                      <div
                        onClick={() => setSelectedRole("COACH")}
                        className={`relative bg-surface-container-lowest rounded-lg p-4 cursor-pointer transition-all ${
                          selectedRole === "COACH"
                            ? "border-2 border-primary shadow-md"
                            : "border border-outline-variant/60 hover:border-outline opacity-80 hover:opacity-100"
                        }`}
                      >
                        {selectedRole === "COACH" && (
                          <div className="absolute -top-2.5 right-3 bg-primary text-white font-label-badge text-label-badge uppercase px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
                            <span
                              className="material-symbols-outlined text-[12px]"
                              style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                              check_circle
                            </span>
                            <span>SELECTED</span>
                          </div>
                        )}
                        <div className="font-label-caps text-label-caps text-secondary uppercase font-bold tracking-wider mb-1 flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px]">sports</span>
                          COACH
                        </div>
                        <div className="font-headline-sm text-headline-sm text-on-surface uppercase leading-snug">
                          Team Coach / Scout
                        </div>
                        <div className="font-body-sm text-body-sm text-secondary mt-1">
                          Team rosters, TCAS talent search, export scouting sheets &amp; video clip tags.
                        </div>
                        <div className="mt-3 pt-2.5 border-t border-outline-variant/40 flex items-center justify-between text-secondary font-label-caps text-label-caps">
                          <span className="text-tertiary font-bold">BSAT AFFILIATION</span>
                          <span>REQUIRES APPROVAL</span>
                        </div>
                      </div>

                      {/* Role 3: Table Official */}
                      <div
                        onClick={() => setSelectedRole("OFFICIAL")}
                        className={`relative bg-surface-container-lowest rounded-lg p-4 cursor-pointer transition-all ${
                          selectedRole === "OFFICIAL"
                            ? "border-2 border-primary shadow-md"
                            : "border border-outline-variant/60 hover:border-outline opacity-80 hover:opacity-100"
                        }`}
                      >
                        {selectedRole === "OFFICIAL" && (
                          <div className="absolute -top-2.5 right-3 bg-primary text-white font-label-badge text-label-badge uppercase px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
                            <span
                              className="material-symbols-outlined text-[12px]"
                              style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                              check_circle
                            </span>
                            <span>SELECTED</span>
                          </div>
                        )}
                        <div className="font-label-caps text-label-caps text-secondary uppercase font-bold tracking-wider mb-1 flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px]">co_present</span>
                          OFFICIAL
                        </div>
                        <div className="font-headline-sm text-headline-sm text-on-surface uppercase leading-snug">
                          Table Official / Referee
                        </div>
                        <div className="font-body-sm text-body-sm text-secondary mt-1">
                          Courtside scorekeeper console, FIBA LiveStats input, referee badge logs.
                        </div>
                        <div className="mt-3 pt-2.5 border-t border-outline-variant/40 flex items-center justify-between text-secondary font-label-caps text-label-caps">
                          <span className="text-secondary font-bold">FIBA LEVEL 1+</span>
                          <span>LICENSE CHECK</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* FORM CONTENT */}
                <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
                  {/* General Identity Fields */}
                  <div>
                    <div className="font-label-caps text-label-caps text-primary uppercase font-bold tracking-wider mb-3 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">badge</span>
                      LEGAL IDENTITY &amp; OFFICIAL CONTACT
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                      {/* Full Legal Name */}
                      <div>
                        <label
                          className="block font-body-sm text-body-sm font-semibold text-on-surface uppercase mb-1"
                          htmlFor="legal_name"
                        >
                          Full Legal Name (as in Thai ID / Passport) *
                        </label>
                        <div className="relative">
                          <input
                            id="legal_name"
                            required
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="e.g. Thanakorn Siriphan"
                            className="w-full bg-surface-container-low border border-outline-variant/80 rounded px-3.5 py-2 font-body-md text-body-md text-on-surface focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
                          />
                          <span className="material-symbols-outlined text-[18px] text-secondary absolute right-3 top-2.5">
                            verified_user
                          </span>
                        </div>
                        <span className="font-label-badge text-label-badge text-secondary mt-1 block">
                          {selectedRole === "FAN"
                            ? "USED FOR FAN MEMBERSHIP & DIGITAL TICKETING"
                            : "USED FOR OFFICIAL TCAS SPORTS QUOTA VERIFICATION"}
                        </span>
                      </div>

                      {/* Email Address */}
                      <div>
                        <label
                          className="block font-body-sm text-body-sm font-semibold text-on-surface uppercase mb-1"
                          htmlFor="email"
                        >
                          Official Email Address *
                        </label>
                        <div className="relative">
                          <input
                            id="email"
                            required
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={selectedRole === "FAN" ? "fan@statcourt.th" : "athlete@statcourt.th"}
                            className="w-full bg-surface-container-low border border-outline-variant/80 rounded px-3.5 py-2 font-body-md text-body-md text-on-surface focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
                          />
                          <span className="material-symbols-outlined text-[18px] text-secondary absolute right-3 top-2.5">
                            mail
                          </span>
                        </div>
                        <span className="font-label-badge text-label-badge text-secondary mt-1 block">
                          {selectedRole === "FAN"
                            ? "MATCH DAY LIVE ALERTS & FAN CLUB NEWSLETTER"
                            : "MATCH REPORTS & SCOUT DIRECTORY INVITATIONS"}
                        </span>
                      </div>

                      {/* Phone Number with OTP verification */}
                      <div>
                        <label
                          className="block font-body-sm text-body-sm font-semibold text-on-surface uppercase mb-1"
                          htmlFor="phone"
                        >
                          Phone Number (OTP Verification) *
                        </label>
                        <div className="flex gap-2">
                          <div className="relative flex-grow">
                            <input
                              id="phone"
                              required
                              type="tel"
                              value={phoneNumber}
                              onChange={(e) => setPhoneNumber(e.target.value)}
                              placeholder="081-234-5678"
                              className="w-full bg-surface-container-low border border-outline-variant/80 rounded px-3.5 py-2 font-body-md text-body-md text-on-surface focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
                            />
                            <span className="material-symbols-outlined text-[18px] text-secondary absolute right-3 top-2.5">
                              call
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setOtpSent(true)}
                            className="flex-shrink-0 bg-inverse-surface hover:bg-black text-white px-3 py-2 rounded font-label-caps text-label-caps uppercase tracking-wider transition-colors flex items-center gap-1 active:scale-95 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[14px]">send</span>
                            {otpSent ? "OTP SENT" : "SEND OTP"}
                          </button>
                        </div>
                        <span className="font-label-badge text-label-badge text-emerald-700 mt-1 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px]">check</span>{" "}
                          PHONE READY FOR 2FA COURTSIDE ACCESS
                        </span>
                      </div>

                      {/* School or Club Affiliation */}
                      <div>
                        <label
                          className="block font-body-sm text-body-sm font-semibold text-on-surface uppercase mb-1"
                          htmlFor="affiliation"
                        >
                          {selectedRole === "FAN"
                            ? "ทีมหรือสโมสรโปรดที่ติดตาม (Favorite Team / Club) *"
                            : "School or Club Affiliation *"}
                        </label>
                        <div className="relative">
                          <input
                            id="affiliation"
                            required
                            type="text"
                            value={schoolOrClub}
                            onChange={(e) => setSchoolOrClub(e.target.value)}
                            placeholder={selectedRole === "FAN" ? "e.g. Bangkok Christian College (BCC)" : "Bangkok Christian College"}
                            className="w-full bg-surface-container-low border border-outline-variant/80 rounded px-3.5 py-2 font-body-md text-body-md text-on-surface focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
                          />
                          <span className="material-symbols-outlined text-[18px] text-secondary absolute right-3 top-2.5">
                            {selectedRole === "FAN" ? "favorite" : "apartment"}
                          </span>
                        </div>
                        <span className="font-label-badge text-label-badge text-secondary mt-1 block">
                          {selectedRole === "FAN"
                            ? "รับการแจ้งเตือนสกอร์สดและสิทธิพิเศษจากทีมที่ติดตาม"
                            : "OFFICIAL REGISTERED MEMBER OF BSAT YOUTH LEAGUE"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* General Member Fan Club Perks Section (FAN ONLY) */}
                  {selectedRole === "FAN" && (
                    <div className="p-4 md:p-5 bg-amber-50/70 rounded-lg border border-amber-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="font-label-caps text-label-caps text-amber-900 uppercase font-bold tracking-wider flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[18px] text-amber-600">
                            card_membership
                          </span>
                          สิทธิประโยชน์สมาชิกทั่วไป (GENERAL MEMBER PRIVILEGES)
                        </div>
                        <span className="font-label-badge text-label-badge bg-amber-200/80 text-amber-950 px-2.5 py-0.5 rounded font-bold uppercase">
                          FREE LIFETIME
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div className="bg-white p-3 rounded-lg border border-amber-100 shadow-2xs">
                          <div className="font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                            <span className="material-symbols-outlined text-amber-600 text-[18px]">
                              notifications_active
                            </span>
                            <span>แจ้งเตือนคะแนนสด</span>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-snug">
                            อัปเดตผลการแข่งขันและตารางสายแข่งรอบน็อกเอาต์แบบ Real-time Play-by-Play
                          </p>
                        </div>

                        <div className="bg-white p-3 rounded-lg border border-amber-100 shadow-2xs">
                          <div className="font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                            <span className="material-symbols-outlined text-emerald-600 text-[18px]">
                              local_activity
                            </span>
                            <span>จองตั๋วเข้าชม VIP</span>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-snug">
                            สิทธิ์เลือกล็อคที่นั่งริมคอร์ทก่อนเปิดจำหน่ายรอบบุคคลทั่วไป
                          </p>
                        </div>

                        <div className="bg-white p-3 rounded-lg border border-amber-100 shadow-2xs">
                          <div className="font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                            <span className="material-symbols-outlined text-purple-600 text-[18px]">
                              shopping_bag
                            </span>
                            <span>Gear Market &amp; ตลาดมือสอง</span>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-snug">
                            ซื้อเสื้อแข่งและอุปกรณ์กีฬาของแท้พร้อมส่วนลดเฉพาะสมาชิก
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Biometric & On-Court Position Section (ATHLETE ONLY) */}
                  {selectedRole === "ATHLETE" && (
                    <div className="p-4 md:p-5 bg-surface-container-low/70 rounded-lg border border-outline-variant/60">
                      <div className="flex items-center justify-between mb-3">
                        <div className="font-label-caps text-label-caps text-primary uppercase font-bold tracking-wider flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px]">straighten</span>
                          BIOMETRIC &amp; ON-COURT POSITION
                        </div>
                        <span className="font-label-badge text-label-badge bg-surface-container-high px-2 py-0.5 rounded text-secondary uppercase">
                          SPORTS SCIENCE SPEC V2.1
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Primary Position Dropdown */}
                        <div>
                          <label
                            className="block font-body-sm text-body-sm font-semibold text-on-surface uppercase mb-1"
                            htmlFor="position"
                          >
                            Primary Position *
                          </label>
                          <div className="relative">
                            <select
                              id="position"
                              value={position}
                              onChange={(e) => setPosition(e.target.value as Position)}
                              className="w-full bg-surface-container-lowest border border-outline-variant/80 rounded px-3 py-2 font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none appearance-none cursor-pointer"
                            >
                              <option value="POINT_GUARD">Point Guard (PG)</option>
                              <option value="SHOOTING_GUARD">Shooting Guard (SG)</option>
                              <option value="SMALL_FORWARD">Small Forward (SF)</option>
                              <option value="POWER_FORWARD">Power Forward (PF)</option>
                              <option value="CENTER">Center (C)</option>
                            </select>
                            <span className="material-symbols-outlined text-[18px] text-secondary absolute right-2.5 top-2.5 pointer-events-none">
                              expand_more
                            </span>
                          </div>
                          <span className="font-label-badge text-label-badge text-secondary mt-1 block">
                            COURT ROLE #1
                          </span>
                        </div>

                        {/* Height Input */}
                        <div>
                          <label
                            className="block font-body-sm text-body-sm font-semibold text-on-surface uppercase mb-1"
                            htmlFor="height"
                          >
                            Height (cm) *
                          </label>
                          <div className="relative">
                            <input
                              id="height"
                              required
                              type="number"
                              value={heightCm}
                              onChange={(e) => setHeightCm(Number(e.target.value))}
                              placeholder="185"
                              className="w-full bg-surface-container-lowest border border-outline-variant/80 rounded px-3 py-2 font-headline-sm text-headline-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                            />
                            <span className="font-label-badge text-label-badge text-secondary absolute right-3 top-3">
                              CM
                            </span>
                          </div>
                          <div className="flex justify-between items-center mt-1 text-secondary font-label-badge text-label-badge">
                            <span>{heightFeetInches} EST</span>
                            <span className="text-tertiary">91ST PERCENTILE (U18)</span>
                          </div>
                        </div>

                        {/* Wingspan Input */}
                        <div>
                          <label
                            className="block font-body-sm text-body-sm font-semibold text-on-surface uppercase mb-1"
                            htmlFor="wingspan"
                          >
                            Wingspan (cm) *
                          </label>
                          <div className="relative">
                            <input
                              id="wingspan"
                              required
                              type="number"
                              value={wingspanCm}
                              onChange={(e) => setWingspanCm(Number(e.target.value))}
                              placeholder="192"
                              className="w-full bg-surface-container-lowest border border-outline-variant/80 rounded px-3 py-2 font-headline-sm text-headline-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                            />
                            <span className="font-label-badge text-label-badge text-secondary absolute right-3 top-3">
                              CM
                            </span>
                          </div>
                          <div className="flex justify-between items-center mt-1 text-secondary font-label-badge text-label-badge">
                            <span className="text-emerald-700 font-bold">
                              {apeIndex >= 0 ? `+${apeIndex}CM` : `${apeIndex}CM`} APE INDEX
                            </span>
                            <span>DEFENSIVE EDGE</span>
                          </div>
                        </div>

                        {/* Standing Reach Input */}
                        <div>
                          <label
                            className="block font-body-sm text-body-sm font-semibold text-on-surface uppercase mb-1"
                            htmlFor="reach"
                          >
                            Standing Reach (cm)
                          </label>
                          <div className="relative">
                            <input
                              id="reach"
                              type="number"
                              value={standingReachCm}
                              onChange={(e) => setStandingReachCm(Number(e.target.value))}
                              placeholder="245"
                              className="w-full bg-surface-container-lowest border border-outline-variant/80 rounded px-3 py-2 font-headline-sm text-headline-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                            />
                            <span className="font-label-badge text-label-badge text-secondary absolute right-3 top-3">
                              CM
                            </span>
                          </div>
                          <div className="flex justify-between items-center mt-1 text-secondary font-label-badge text-label-badge">
                            <span>{reachFeetInches} REACH</span>
                            <span>RIM CONTEST RATIO</span>
                          </div>
                        </div>
                      </div>

                      {/* Biometric Verification Callout */}
                      <div className="mt-3 pt-3 border-t border-outline-variant/40 flex flex-wrap items-center justify-between gap-2 text-secondary font-body-sm text-body-sm">
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px] text-primary">
                            info
                          </span>
                          <span>
                            Biometrics will be calibrated and verified during the next official BSAT Combine or FIBA Tournament check-in.
                          </span>
                        </div>
                        <span className="font-label-caps text-label-caps uppercase bg-white px-2 py-0.5 rounded border border-outline-variant text-on-surface">
                          COMBINE PROTOCOL 2025
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Consents & Legal Checkboxes */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-start gap-2.5">
                      <input
                        id="consent_scout"
                        required
                        type="checkbox"
                        checked={consentScout}
                        onChange={(e) => setConsentScout(e.target.checked)}
                        className="mt-1 rounded border-outline-variant text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer h-4 w-4"
                      />
                      <label
                        htmlFor="consent_scout"
                        className="font-body-md text-body-md text-on-surface cursor-pointer select-none"
                      >
                        {selectedRole === "ATHLETE" ? (
                          <>
                            I authorize <span className="font-bold">Basketball Sport Association of Thailand (BSAT)</span> and FIBA LiveStats official courtside scorers to stream, log, and index my game statistics into the National Scouting Database and TCAS Sports Quota verification portal.
                          </>
                        ) : selectedRole === "FAN" ? (
                          <>
                            ข้าพเจ้ายินยอมให้ <span className="font-bold">StatCourt.TH</span> จัดส่งข้อมูลการแจ้งเตือนคะแนนสด, โปรแกรมการแข่งขัน และสิทธิพิเศษสมาชิกแฟนคลับตามทีมที่ข้าพเจ้าเลือกติดตาม
                          </>
                        ) : (
                          <>
                            I authorize <span className="font-bold">Basketball Sport Association of Thailand (BSAT)</span> to verify my institutional credentials and coaching/officiating affiliation.
                          </>
                        )}
                      </label>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <input
                        id="consent_terms"
                        required
                        type="checkbox"
                        checked={consentTerms}
                        onChange={(e) => setConsentTerms(e.target.checked)}
                        className="mt-1 rounded border-outline-variant text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer h-4 w-4"
                      />
                      <label
                        htmlFor="consent_terms"
                        className="font-body-md text-body-md text-on-surface cursor-pointer select-none"
                      >
                        I agree to the{" "}
                        <span className="text-primary hover:underline font-bold cursor-pointer">
                          {selectedRole === "FAN" ? "Fan Community Guidelines" : "Courtside Rules & Code of Conduct"}
                        </span>{" "}
                        and{" "}
                        <span className="text-primary hover:underline font-bold cursor-pointer">
                          Data Privacy Policy
                        </span>
                        . {selectedRole === "ATHLETE" && "I confirm that the biometric measurements provided are accurate to the best of my knowledge."}
                      </label>
                    </div>
                  </div>

                  {/* ACTION FOOTER OF CARD */}
                  <div className="pt-6 border-t border-outline-variant/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-secondary font-body-md text-body-md">
                      <span>Already registered on StatCourt?</span>
                      <Link
                        href="/"
                        className="text-primary hover:underline font-bold uppercase tracking-wider"
                      >
                        Log in here
                      </Link>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={handleSaveDraft}
                        className="w-full sm:w-auto px-5 py-2.5 border border-outline-variant rounded font-label-caps text-label-caps uppercase text-secondary hover:text-on-surface hover:border-outline transition-colors cursor-pointer"
                      >
                        {draftSaved ? "DRAFT SAVED" : "SAVE DRAFT"}
                      </button>

                      <button
                        type="submit"
                        className="w-full sm:w-auto bg-primary hover:bg-[#8e0d15] text-white px-7 py-2.5 rounded font-label-caps text-label-caps uppercase tracking-wider font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">send</span>
                        <span>SUBMIT REGISTRATION / ยืนยันการลงทะเบียน</span>
                      </button>
                    </div>
                  </div>
                </form>
              </>
            )}
          </div>

          {/* Trust Bar / Verified Federation Badges Below Container */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-secondary font-label-caps text-label-caps uppercase tracking-wider text-center">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-emerald-700 text-[16px]">
                verified
              </span>
              <span>BSAT SANCTIONED DATABASE</span>
            </div>
            <div className="h-3 w-[1px] bg-outline-variant hidden sm:block"></div>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-[16px]">
                military_tech
              </span>
              <span>TCAS SPORTS QUOTA PORTAL READY</span>
            </div>
            <div className="h-3 w-[1px] bg-outline-variant hidden sm:block"></div>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-tertiary text-[16px]">
                speed
              </span>
              <span>FIBA LIVESTATS REAL-TIME INTEGRATION</span>
            </div>
          </div>
        </div>
      </main>

      {/* Universal Footer */}
      <Footer />
    </div>
  );
}

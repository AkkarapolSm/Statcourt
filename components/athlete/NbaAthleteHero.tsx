"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Share2, Check, Star, ShieldCheck, School } from "lucide-react";
import { AthleteProfile, AthleteSeasonStats } from "@/lib/types";

interface NbaAthleteHeroProps {
  athlete: AthleteProfile;
  stats: AthleteSeasonStats;
  onOpenEditProfile?: () => void;
}

// Convert Height (cm) -> 6'8" (204cm)
function formatHeight(cm?: number | null): { imperial: string; metric: string } {
  const heightCm = cm || 204;
  const totalInches = heightCm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return {
    imperial: `${feet}'${inches}"`,
    metric: `${heightCm}cm`,
  };
}

// Convert Weight (kg) -> 225lb (102kg)
function formatWeight(kg?: number | null): { lbs: string; kg: string } {
  const weightKg = kg || 102;
  const lbs = Math.round(weightKg * 2.20462);
  return {
    lbs: `${lbs}lb`,
    kg: `${weightKg}kg`,
  };
}

// Calculate Age from birthDate
function calculateAge(birthDateStr?: string | null): number {
  if (!birthDateStr) return 19;
  const birth = new Date(birthDateStr);
  if (isNaN(birth.getTime())) return 19;
  const diff = Date.now() - birth.getTime();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970) || 19;
}

// Format Birthdate: June 25, 2007
function formatBirthdate(birthDateStr?: string | null): string {
  if (!birthDateStr) return "June 25, 2007";
  const birth = new Date(birthDateStr);
  if (isNaN(birth.getTime())) return "June 25, 2007";
  return birth.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

// Format Position Code & Label
function formatPosition(pos?: string): { role: string; code: string } {
  switch (pos) {
    case "POINT_GUARD":
      return { role: "POINT GUARD", code: "PG" };
    case "SHOOTING_GUARD":
      return { role: "SHOOTING GUARD", code: "SG" };
    case "SMALL_FORWARD":
      return { role: "SMALL FORWARD", code: "SF" };
    case "POWER_FORWARD":
      return { role: "POWER FORWARD", code: "PF" };
    case "CENTER":
      return { role: "CENTER", code: "C" };
    default:
      return { role: pos?.replace("_", " ").toUpperCase() || "CENTER", code: "C" };
  }
}

export default function NbaAthleteHero({
  athlete,
  stats,
  onOpenEditProfile,
}: NbaAthleteHeroProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Dynamic metrics derived directly from athlete profile and verified stats
  const heightInfo = formatHeight(athlete.heightCm);
  const weightInfo = formatWeight(athlete.weightKg);
  const age = calculateAge(athlete.birthDate);
  const birthDateFormatted = formatBirthdate(athlete.birthDate);
  const posInfo = formatPosition(athlete.primaryPosition);
  const jerseyNum = athlete.jerseyNumber ?? stats.jerseyNumber ?? 0;
  const schoolName = (athlete.schoolOrClub || "VARSITY").toUpperCase();
  const varsityCode = `${schoolName.split(" ")[0] || "VARSITY"} VARSITY`;
  const demoShort = athlete.province ? `${athlete.province.toUpperCase()} SQUAD` : "VARSITY SQUAD";

  const ppgDisplay = stats.ppg !== undefined ? stats.ppg.toFixed(1) : "0.0";
  const rpgDisplay = stats.rpg !== undefined ? stats.rpg.toFixed(1) : "0.0";
  const apgDisplay = stats.apg !== undefined ? stats.apg.toFixed(1) : "0.0";
  const effDisplay = stats.effPerGame !== undefined ? stats.effPerGame.toFixed(1) : (stats.eff !== undefined ? String(stats.eff) : "0.0");
  const gamesDisplay = `${stats.gamesPlayed || 0} Games`;
  const ageCategory = stats.ageCategory || "U18";

  // Player portrait with reliable fallback
  const headshotSrc =
    athlete.avatarUrl ||
    "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=400&q=80";

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="w-full mb-4">
      {/* TOP ACTION SUB-BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <Link
          href="/leaderboard"
          className="inline-flex items-center gap-1.5 px-3 py-1 bg-inverse-surface text-surface-bright rounded text-label-caps font-label-caps tracking-wider hover:bg-on-surface transition-colors border border-outline"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          <span>LEADERBOARD</span>
        </Link>

        <div className="flex items-center gap-2 flex-wrap">
          {/* EDIT PROFILE / UPDATE BIOMETRICS BUTTON */}
          {onOpenEditProfile && (
            <button
              onClick={onOpenEditProfile}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-800 rounded text-label-caps font-label-caps tracking-wider transition-colors cursor-pointer"
              title="แก้ไขข้อมูลสรีระ (Height, Weight, Wingspan)"
            >
              <span className="material-symbols-outlined text-sm">straighten</span>
              <span>EDIT PROFILE</span>
            </button>
          )}

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1 px-3 py-1 bg-inverse-surface text-surface-bright rounded text-label-caps font-label-caps border border-outline hover:bg-secondary transition-colors"
            title="Share Athlete Profile"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>COPIED</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-sm">share</span>
                <span>SHARE</span>
              </>
            )}
          </button>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#AF101A] text-white border border-red-700 rounded text-label-caps font-label-caps tracking-wider font-bold shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-white" />
            <span>FIBA OFFICIAL</span>
          </span>
        </div>
      </div>

      {/* ATHLETE HERO BANNER (Stadium Carbon Backdrop + Portrait + Bio Metrics) */}
      <section className="bg-inverse-surface text-surface-bright rounded-xl overflow-hidden shadow-lg border border-outline relative">
        <div className="grid grid-cols-1 md:grid-cols-12">
          {/* Left Column: Headshot & University Shield */}
          <div className="md:col-span-4 lg:col-span-3 bg-gradient-to-t from-black via-inverse-surface to-slate-900 p-4 flex flex-col items-center justify-center relative border-b md:border-b-0 md:border-r border-outline">
            <div className="relative w-44 h-48 md:w-48 md:h-52 rounded-lg overflow-hidden border-2 border-primary-container shadow-2xl">
              <img
                src={headshotSrc}
                alt={`${athlete.firstName} ${athlete.lastName}`}
                className="w-full h-full object-cover object-top"
              />
              <span className="absolute bottom-2 left-2 bg-primary-container text-on-primary font-headline-sm text-headline-sm px-2 py-0.5 rounded shadow">
                #{jerseyNum}
              </span>
            </div>

            {/* University Stamp Badge */}
            <div className="mt-3 flex items-center gap-2 bg-surface-container-lowest/10 backdrop-blur px-3 py-1.5 rounded border border-outline w-full justify-center text-center">
              <span className="material-symbols-outlined text-tertiary-fixed-dim text-lg">school</span>
              <div className="text-left">
                <div className="font-label-caps text-label-caps text-tertiary-fixed tracking-widest leading-none uppercase">
                  {varsityCode}
                </div>
                <div className="font-body-sm text-body-sm text-surface-dim font-bold">
                  {demoShort}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Player Name, Position, Verification & Core Headline Bio */}
          <div className="md:col-span-8 lg:col-span-9 p-5 md:p-6 flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-label-caps text-label-caps tracking-widest text-surface-dim uppercase">
                    {schoolName}
                  </span>
                  <span className="text-surface-dim text-xs">•</span>
                  <span className="bg-primary text-on-primary font-label-caps text-label-caps px-2 py-0.5 rounded uppercase font-bold">
                    #{jerseyNum} {posInfo.role}
                  </span>
                </div>

                <button
                  onClick={() => setIsFollowing(!isFollowing)}
                  className={`inline-flex items-center gap-1 text-surface-bright hover:text-primary-fixed text-label-caps font-label-caps uppercase border border-outline px-3 py-1 rounded bg-surface-container-lowest/5 transition-colors ${
                    isFollowing ? "bg-primary/30 text-primary-fixed border-primary" : ""
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-sm"
                    style={isFollowing ? { fontVariationSettings: "'FILL' 1" } : undefined}
                  >
                    star
                  </span>
                  <span>{isFollowing ? "FOLLOWING" : "FOLLOW"}</span>
                </button>
              </div>

              <h1 className="font-headline-xl text-headline-xl uppercase tracking-wider text-surface-bright leading-none mb-3">
                {athlete.firstName} {athlete.lastName}
              </h1>

              <div className="flex flex-wrap items-center gap-2 mb-6">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-tertiary-container text-on-tertiary-container font-label-caps text-label-caps font-bold tracking-wider">
                  <span
                    className="material-symbols-outlined text-xs"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    verified_user
                  </span>
                  TCAS Verified Elite
                </span>

                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-surface-container-highest/20 text-surface-bright font-label-caps text-label-caps">
                  <span className="material-symbols-outlined text-xs">workspace_premium</span>
                  FIBA {ageCategory} National Pool
                </span>

                <span className="text-surface-dim font-body-sm text-body-sm">
                  DOB: {birthDateFormatted} (Age {age}) • Class 2026
                </span>
              </div>
            </div>

            {/* Bottom Stat Strip: PPG / RPG / APG / EFF + Measurables */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 pt-4 border-t border-outline/70 bg-surface-container-lowest/5 p-3 rounded-lg">
              <div className="text-center lg:text-left">
                <div className="font-label-caps text-label-caps uppercase text-surface-dim">PPG</div>
                <div className="font-title-stat text-title-stat text-primary-fixed leading-none">
                  {ppgDisplay}
                </div>
              </div>

              <div className="text-center lg:text-left">
                <div className="font-label-caps text-label-caps uppercase text-surface-dim">RPG</div>
                <div className="font-title-stat text-title-stat text-surface-bright leading-none">
                  {rpgDisplay}
                </div>
              </div>

              <div className="text-center lg:text-left">
                <div className="font-label-caps text-label-caps uppercase text-surface-dim">APG</div>
                <div className="font-title-stat text-title-stat text-surface-bright leading-none">
                  {apgDisplay}
                </div>
              </div>

              <div className="text-center lg:text-left">
                <div className="font-label-caps text-label-caps uppercase text-tertiary-fixed-dim">EFF/G</div>
                <div className="font-title-stat text-title-stat text-tertiary-fixed-dim leading-none">
                  {effDisplay}
                </div>
              </div>

              <div className="text-center lg:text-left">
                <div className="font-label-caps text-label-caps uppercase text-surface-dim">HEIGHT</div>
                <div className="font-body-lg text-body-lg text-surface-bright font-bold">
                  {heightInfo.imperial} <span className="text-surface-dim font-normal text-xs">({heightInfo.metric})</span>
                </div>
              </div>

              <div className="text-center lg:text-left">
                <div className="font-label-caps text-label-caps uppercase text-surface-dim">WEIGHT</div>
                <div className="font-body-lg text-body-lg text-surface-bright font-bold">
                  {weightInfo.lbs} <span className="text-surface-dim font-normal text-xs">({weightInfo.kg})</span>
                </div>
              </div>

              <div className="text-center lg:text-left">
                <div className="font-label-caps text-label-caps uppercase text-surface-dim">COUNTRY</div>
                <div className="font-body-lg text-body-lg text-surface-bright font-bold">
                  TH <span className="text-surface-dim font-normal text-xs">Thailand</span>
                </div>
              </div>

              <div className="text-center lg:text-left">
                <div className="font-label-caps text-label-caps uppercase text-surface-dim">EXPERIENCE</div>
                <div className="font-body-lg text-body-lg text-surface-bright font-bold">
                  {gamesDisplay} <span className="text-surface-dim font-normal text-xs">{ageCategory}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

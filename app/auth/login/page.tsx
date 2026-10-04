"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import QuickDemoLoginCard from "@/components/auth/QuickDemoLoginCard";
import { useAuthStore } from "@/lib/auth/useAuthStore";
import type { Role } from "@/lib/types";

interface RoleTabInfo {
  role: Role;
  label: string;
  icon: string;
  description: string;
  badge: string;
}

const roleTabs: RoleTabInfo[] = [
  {
    role: "ATHLETE",
    label: "นักกีฬา",
    icon: "person",
    description: "เข้าสู่ระบบเพื่อดู TCAS Sports Quota Portfolio & Digital Player Card",
    badge: "TCAS QUOTA READY",
  },
  {
    role: "COACH",
    label: "โค้ช / สเกาต์",
    icon: "sports",
    description: "เข้าสู่ระบบเพื่อจัดการรายชื่อทีม บันทึกแผนการเล่น และวิเคราะห์ข้อมูลคู่แข่ง",
    badge: "TEAM ACCESS",
  },
  {
    role: "OFFICIAL",
    label: "เจ้าหน้าที่โต๊ะคะแนน",
    icon: "co_present",
    description: "เข้าสู่ระบบโต๊ะคะแนนสำหรับจัดการบันทึกสถิติสด FIBA LiveStats",
    badge: "FIBA TABLE",
  },
  {
    role: "FAN",
    label: "แฟนคลับ",
    icon: "favorite",
    description: "เข้าสู่ระบบเพื่อติดตามผลการแข่งขันสด ตารางการแข่ง และสิทธิพิเศษ",
    badge: "GENERAL MEMBER",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const refreshSession = useAuthStore((state) => state.refreshSession);
  const [selectedRoleTab, setSelectedRoleTab] = useState<Role>("ATHLETE");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบอีเมลและรหัสผ่าน");
      }
      await refreshSession();
      if (data.role === "OFFICIAL") {
        router.push("/official/console/match-bcc-ds-01");
      } else if (data.role === "COACH") {
        router.push("/team");
      } else if (data.role === "ATHLETE") {
        router.push("/");
      } else {
        router.push("/live");
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "เข้าสู่ระบบไม่สำเร็จ");
    } finally {
      setPending(false);
    }
  }

  const activeTabInfo = roleTabs.find((t) => t.role === selectedRoleTab) || roleTabs[0];

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col antialiased selection:bg-primary selection:text-white">
      {/* Universal Navbar */}
      <Navbar />

      {/* Sub-banner for Authentication Gateway */}
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
              Official Portal Authentication
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
              <span>FIBA LiveStats v4.2 Security Protocol</span>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-grow py-8 sm:py-12 px-4 md:px-gutter-desktop flex items-center justify-center">
        <div className="w-full max-w-xl mx-auto space-y-6">
          {/* 1-Click Demo Login Box */}
          <QuickDemoLoginCard />

          {/* Divider between demo and manual login */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-300 w-full" />
            <span className="bg-background px-3 text-xs font-mono font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
              หรือเข้าสู่ระบบด้วยอีเมลและรหัสผ่าน (Manual Login)
            </span>
            <div className="border-t border-slate-300 w-full" />
          </div>

          {/* Primary Card Container */}
          <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl shadow-sm overflow-hidden">
            {/* Card Header Section */}
            <div className="p-6 md:p-8 border-b border-outline-variant/40 bg-gradient-to-b from-surface-container-low/40 to-transparent">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2.5 py-0.5 rounded font-label-caps text-label-caps tracking-widest uppercase font-bold text-xs">
                  <span className="material-symbols-outlined text-[14px]">sports_basketball</span>
                  FEDERATION AUTHENTICATION GATEWAY
                </span>
                <span className="text-secondary font-body-sm text-body-sm">
                  • BSAT CENTRAL REPOSITORY
                </span>
              </div>
              <h1 className="font-headline-lg text-headline-lg uppercase text-on-surface tracking-wide text-2xl md:text-3xl">
                Sign In to StatCourtTH
              </h1>
              <p className="font-body-md text-body-md text-secondary mt-1">
                เข้าสู่ระบบศูนย์ข้อมูลกลางสถิติและการแข่งขันบาสเกตบอลแห่งประเทศไทย เพื่อเข้าถึงข้อมูลตามบทบาทของคุณ
              </p>

              {/* Role Context Tabs */}
              <div className="mt-5">
                <div className="font-label-caps text-label-caps text-secondary uppercase tracking-wider mb-2 flex items-center justify-between text-xs">
                  <span>SELECT ACCOUNT CONTEXT:</span>
                  <span className="text-primary font-bold">{activeTabInfo.badge}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {roleTabs.map((tab) => {
                    const isSelected = selectedRoleTab === tab.role;
                    return (
                      <button
                        key={tab.role}
                        type="button"
                        onClick={() => setSelectedRoleTab(tab.role)}
                        className={`px-2.5 py-2 rounded-lg border text-left transition-all flex flex-col gap-1 cursor-pointer ${
                          isSelected
                            ? "bg-surface-container-low border-primary shadow-xs ring-1 ring-primary/20"
                            : "bg-surface-container-lowest border-outline-variant/50 hover:border-outline opacity-75 hover:opacity-100"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`material-symbols-outlined text-[18px] ${
                              isSelected ? "text-primary" : "text-secondary"
                            }`}
                          >
                            {tab.icon}
                          </span>
                          {isSelected && (
                            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                          )}
                        </div>
                        <span
                          className={`font-label-caps text-label-caps font-bold leading-tight ${
                            isSelected ? "text-primary" : "text-on-surface"
                          }`}
                        >
                          {tab.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-2.5 px-3 py-2 bg-surface-container-low/70 rounded-md border border-outline-variant/40 flex items-center gap-2 text-secondary font-body-sm text-xs">
                  <span className="material-symbols-outlined text-[16px] text-primary flex-shrink-0">
                    info
                  </span>
                  <span>{activeTabInfo.description}</span>
                </div>
              </div>
            </div>

            {/* Form Content */}
            <form onSubmit={onSubmit} className="p-6 md:p-8 space-y-5">
              {error && (
                <div
                  role="alert"
                  className="rounded-lg bg-red-50 border border-red-200 p-3.5 text-red-800 text-sm flex items-start gap-2.5"
                >
                  <span className="material-symbols-outlined text-[20px] text-red-600 flex-shrink-0 mt-0.5">
                    error
                  </span>
                  <div className="leading-snug">{error}</div>
                </div>
              )}

              {/* Email Address */}
              <div>
                <label
                  className="block font-body-sm text-body-sm font-semibold text-on-surface uppercase mb-1"
                  htmlFor="login_email"
                >
                  อีเมลบัญชีผู้ใช้ (Official Email) *
                </label>
                <div className="relative">
                  <input
                    id="login_email"
                    required
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. athlete@statcourt.th หรือ user@example.com"
                    className="w-full bg-surface-container-low border border-outline-variant/80 rounded px-3.5 py-2.5 font-body-md text-body-md text-on-surface focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
                  />
                  <span className="material-symbols-outlined text-[18px] text-secondary absolute right-3 top-3">
                    mail
                  </span>
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    className="block font-body-sm text-body-sm font-semibold text-on-surface uppercase"
                    htmlFor="login_password"
                  >
                    รหัสผ่าน (Password) *
                  </label>
                  <button
                    type="button"
                    onClick={() => alert("กรุณาติดต่อผู้ดูแลระบบ หรือลงทะเบียนใหม่หากลืมรหัสผ่าน")}
                    className="font-label-caps text-label-caps text-primary hover:underline uppercase text-xs"
                  >
                    ลืมรหัสผ่าน?
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="login_password"
                    required
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-surface-container-low border border-outline-variant/80 rounded px-3.5 py-2.5 font-body-md text-body-md text-on-surface focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="material-symbols-outlined text-[18px] text-secondary absolute right-3 top-3 hover:text-on-surface transition-colors cursor-pointer"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "visibility_off" : "visibility"}
                  </button>
                </div>
              </div>

              {/* Remember Me & Security Callout */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-outline-variant text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer h-4 w-4"
                  />
                  <span className="font-body-sm text-body-sm text-secondary">
                    จดจำการเข้าสู่ระบบในอุปกรณ์นี้
                  </span>
                </label>
                <div className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-secondary">
                  <span className="material-symbols-outlined text-[14px] text-emerald-600">lock</span>
                  <span>SSL 256-BIT ENCRYPTED</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={pending}
                className="w-full bg-primary hover:bg-[#8e0d15] text-white px-7 py-3 rounded font-label-caps text-label-caps uppercase tracking-wider font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer disabled:opacity-50 text-base"
              >
                {pending ? (
                  <>
                    <span className="inline-block animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                    <span>กำลังเข้าสู่ระบบ...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">login</span>
                    <span>SIGN IN / เข้าสู่ระบบ</span>
                  </>
                )}
              </button>

              {/* Link to Register */}
              <div className="pt-4 border-t border-outline-variant/40 text-center">
                <p className="font-body-md text-body-md text-secondary">
                  ยังไม่มีบัญชีสมาชิก StatCourtTH?
                </p>
                <Link
                  href="/auth/register"
                  className="mt-2 inline-flex items-center gap-1 text-primary hover:text-[#8e0d15] font-label-caps text-label-caps uppercase font-bold tracking-wider hover:underline text-sm"
                >
                  <span>REGISTER FOR TCAS / FEDERATION ID (สมัครสมาชิกใหม่)</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Link>
              </div>
            </form>
          </div>

          {/* Trust Bar / Verified Federation Badges Below Container */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-secondary font-label-caps text-label-caps uppercase tracking-wider text-center text-xs">
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

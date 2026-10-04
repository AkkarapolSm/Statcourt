"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  ShieldCheck,
  ArrowRight,
  Menu,
  X,
  Bell,
  Star,
  Globe,
  ChevronDown,
  Trophy,
  Award,
  Film,
  Users,
  UserCheck,
  Compass,
  GraduationCap,
  Store,
  Sparkles,
  Radio,
  Newspaper,
  Zap,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth/useAuthStore";
import {
  getRoleBadgeInfo,
  canAccessNavItem,
  canAccessOfficialConsole,
} from "@/lib/auth/rbac";
import PricingModal from "@/components/premium/PricingModal";
import UserRoleProfileMenu from "./UserRoleProfileMenu";
import NavbarRoleSwitcher from "./NavbarRoleSwitcher";
import NotificationCenter from "@/components/notifications/NotificationCenter";

interface SubNavItem {
  href: string;
  label: string;
  desc: string;
  icon: React.ElementType;
  badge?: string;
  isLive?: boolean;
}

interface NavGroupItem {
  id: string;
  label: string;
  subLabel?: string;
  items: SubNavItem[];
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileExpandedGroup, setMobileExpandedGroup] = useState<string | null>(null);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navContainerRef = useRef<HTMLDivElement | null>(null);

  const { currentUser } = useAuthStore();
  const isDev =
    process.env.NODE_ENV === "development" ||
    process.env.NEXT_PUBLIC_ENABLE_DEV_ROLE_SWITCHER === "true";

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setActiveDropdown(null);
    setMobileMenuOpen(false);
  }, [pathname]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        navContainerRef.current &&
        !navContainerRef.current.contains(event.target as Node)
      ) {
        setActiveDropdown(null);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveDropdown(null);
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const isPro = mounted && currentUser.tier === "PRO";

  // Mouse hover handlers with grace timeout
  const handleMouseEnter = (groupId: string) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setActiveDropdown(groupId);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 180);
  };

  // Dynamic role-specific Hub item replacing "Athlete Hub" in Navbar
  const roleHubItem: SubNavItem | null = (() => {
    switch (currentUser.role) {
      case "ATHLETE":
        return {
          href: "/athlete/ath-1",
          label: "Athlete Hub",
          desc: "โปรไฟล์นักกีฬา ประวัติ และประเมินศักยภาพ",
          icon: UserCheck,
          badge: "Verified",
        };
      case "COACH":
        return {
          href: "/scout",
          label: "Coach Hub",
          desc: "ศูนย์ผู้ฝึกสอน ค้นหาดาวรุ่ง และวิเคราะห์ศักยภาพ",
          icon: Compass,
          badge: "Coach",
        };
      case "OFFICIAL":
        return {
          href: "/official/console/match-bcc-ds-01",
          label: "Official Hub",
          desc: "ศูนย์กรรมการ โต๊ะเทคนิค และบันทึกคะแนน FIBA",
          icon: ShieldCheck,
          badge: "Official",
        };
      case "ADMIN":
        return {
          href: "/admin",
          label: "Admin Hub",
          desc: "ศูนย์บริหารจัดการทัวร์นาเมนต์ และระบบองค์กรกีฬา",
          icon: ShieldAlert,
          badge: "Admin",
        };
      case "PUBLIC":
      case "FAN":
      default:
        // Public and Fan users must NOT have an Athlete Hub that they can click into
        return null;
    }
  })();

  // Categorized Navigation Groups
  const navGroups: NavGroupItem[] = [
    {
      id: "competitions",
      label: "Competitions",
      subLabel: "การแข่งขัน & สถิติ",
      items: [
        {
          href: "/tournaments",
          label: "Tournaments & Brackets",
          desc: "ตารางแข่ง สายการแข่งขัน และผลสด",
          icon: Trophy,
          badge: "FIBA",
        },
        {
          href: "/leaderboard",
          label: "Stats Leaderboard",
          desc: "อันดับผู้เล่น ผู้นำคะแนน รีบาวด์ แอสซิสต์",
          icon: Award,
          badge: "Top 50",
        },
        {
          href: "/matches",
          label: "Matches & Game Film",
          desc: "คลังแมตช์แข่งขันและเทปวิดีโอย้อนหลัง",
          icon: Film,
          badge: "HD Film",
        },
        {
          href: "/official/console/match-bcc-ds-01",
          label: "Table Official Console",
          desc: "ระบบบันทึกคะแนนโต๊ะกลางมาตรฐานสากล",
          icon: ShieldCheck,
          badge: "Official",
        },
        {
          href: "/solutions",
          label: "For Organizers & SaaS",
          desc: "ระบบเปิดทัวร์นาเมนต์ โต๊ะ FIBA & ถ่ายทอดสด",
          icon: Sparkles,
          badge: "B2B SaaS",
        },
      ],
    },
    {
      id: "talent",
      label: "Talent & Teams",
      subLabel: "นักกีฬา & สโมสร",
      items: [
        ...(roleHubItem ? [roleHubItem] : []),
        ...(currentUser.role === "COACH"
          ? [
              {
                href: "/team",
                label: "Team Hub",
                desc: "ข้อมูลสโมสร แผนการเล่น และการฝึกซ้อม",
                icon: Users,
                badge: "Coach",
              },
            ]
          : []),
        ...(currentUser.role === "PUBLIC" || currentUser.role === "FAN"
          ? [
              {
                href: "/teams",
                label: "Clubs & Teams",
                desc: "ทำเนียบสโมสรและทีมที่เข้าร่วมการแข่งขัน",
                icon: Trophy,
              },
              {
                href: "/leaderboard",
                label: "Player Directory",
                desc: "ทำเนียบนักกีฬา สถิติ และอันดับผลงานการแข่งขัน",
                icon: Award,
                badge: "Top 50",
              },
            ]
          : []),
        ...(currentUser.role === "ATHLETE" || currentUser.role === "OFFICIAL" || currentUser.role === "ADMIN"
          ? [
              {
                href: "/teams",
                label: "Clubs & Teams",
                desc: "ทำเนียบสโมสร รายชื่อผู้เล่น และตารางแข่งขัน",
                icon: Trophy,
              },
            ]
          : []),
        ...(currentUser.role !== "COACH" && currentUser.role !== "PUBLIC" && currentUser.role !== "FAN"
          ? [
              {
                href: "/scout",
                label: "Scout Hub",
                desc: "ระบบค้นหาดาวรุ่ง คลังคลิป และรายงานเชิงลึก",
                icon: Compass,
                badge: "PRO",
              },
            ]
          : []),
      ],
    },
    {
      id: "pathways",
      label: "Pathways & Market",
      subLabel: "โอกาส & การพัฒนา",
      items: [
        {
          href: "/opportunities",
          label: "Scholarships & Quota",
          desc: "โควต้านักเรียนกีฬา ทุนการศึกษา มหาวิทยาลัย",
          icon: GraduationCap,
          badge: "TCAS",
        },
        {
          href: "/academy",
          label: "Academy & Clinics",
          desc: "แคมป์บาสเกตบอล คอร์สพัฒนาทักษะระดับโปร",
          icon: Sparkles,
        },
        {
          href: "/marketplace",
          label: "Gear Market",
          desc: "ตลาดอุปกรณ์บาสเกตบอลและสินค้าทางการ",
          icon: Store,
        },
      ],
    },
  ];

  // Categorized Navigation Groups filtered by RBAC permissions
  const filteredNavGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => canAccessNavItem(currentUser, item.href)),
    }))
    .filter((group) => group.items.length > 0);

  // Helper to check if any child link in a group is active
  const isGroupActive = (group: NavGroupItem) => {
    return group.items.some((item) => {
      const base = item.href.split("/")[1];
      return base ? pathname.startsWith(`/${base}`) : pathname === item.href;
    });
  };

  const isLinkActive = (href: string) => {
    return href === "/" ? pathname === "/" : pathname === href || pathname?.startsWith(href);
  };

  return (
    <>
      <header className="bg-white border-b border-outline-variant sticky top-0 z-50 shadow-xs select-none">
        <div className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-3 sm:gap-4">
          
          {/* Left: Logo & Search */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link href="/" className="flex items-center gap-2 group shrink-0" aria-label="StatCourt Thailand">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 shrink-0 text-[#AF101A] transition-transform group-hover:scale-105" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <rect x="2" y="11" width="4" height="11" rx="1" />
                <rect x="9.5" y="6" width="4" height="16" rx="1" />
                <rect x="17" y="2" width="4" height="20" rx="1" />
              </svg>
              <div className="flex items-baseline font-headline-lg tracking-normal leading-none select-none">
                <span className="font-bold text-xl sm:text-2xl text-[#0B1C30]">STATCOURT</span>
                <span className="font-bold text-xs sm:text-sm text-[#AF101A] ml-0.5">.TH</span>
              </div>
            </Link>

            <Link href="/search" aria-label="ค้นหานักกีฬาและทีม" className="hidden min-[1440px]:inline-flex min-[1800px]:hidden min-w-[44px] min-h-[44px] items-center justify-center rounded-lg text-slate-600 hover:bg-slate-50 hover:text-primary">
              <Search className="w-4 h-4" />
            </Link>

            {/* Compact Search Bar */}
            <form
              onSubmit={handleSearchSubmit}
              className="hidden min-[1800px]:flex items-center bg-[#f8f9fc] border border-outline-variant rounded-sm px-2.5 py-1.5 w-40 focus-within:border-primary focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/10 transition-all duration-200"
            >
              <Search className="w-3.5 h-3.5 text-slate-500 mr-2 shrink-0" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-0 p-0 text-xs font-medium text-slate-800 placeholder:text-slate-500 w-full outline-none"
                placeholder="Search athletes, teams..."
                type="text"
              />
            </form>
          </div>

          {/* Center: Categorized Desktop Navigation */}
          <nav
            ref={navContainerRef}
            className="hidden min-[1440px]:flex items-center gap-0 shrink-0 relative"
          >
            {/* 1. Home Direct Link */}
            <Link
              href="/"
              className={`px-2.5 py-1 rounded-sm text-xs font-bold uppercase tracking-wide whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isLinkActive("/")
                  ? "text-primary border-b-2 border-primary font-black pb-0.5"
                  : "text-slate-600 hover:text-primary hover:bg-slate-50"
              }`}
            >
              <span>Home</span>
            </Link>

            {/* 2. Live Stream Direct Link (High Priority with animated beacon) */}
            <Link
              href="/live"
              className={`px-2.5 py-1 rounded-sm text-xs font-bold uppercase tracking-wide whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isLinkActive("/live")
                  ? "text-primary border-b-2 border-primary font-black pb-0.5"
                  : "text-slate-600 hover:text-primary hover:bg-slate-50"
              }`}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600" />
              </span>
              <span>Live Hub</span>
            </Link>

            {/* 3. Dropdown Groups: Competitions, Talent & Teams, Pathways */}
            {filteredNavGroups.map((group) => {
              const active = isGroupActive(group);
              const isOpen = activeDropdown === group.id;

              return (
                <div
                  key={group.id}
                  className="relative"
                  onMouseEnter={() => handleMouseEnter(group.id)}
                  onMouseLeave={handleMouseLeave}
                >
                  {/* Dropdown Trigger Button */}
                  <button
                    onClick={() =>
                      setActiveDropdown(isOpen ? null : group.id)
                    }
                    className={`px-2.5 py-1 rounded-sm text-xs font-bold uppercase tracking-wide whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
                      active
                        ? "text-primary border-b-2 border-primary font-black pb-0.5"
                        : "text-slate-600 hover:text-primary hover:bg-slate-50"
                    } ${isOpen ? "bg-slate-50 text-primary" : ""}`}
                    aria-expanded={isOpen}
                  >
                    <span>{group.label}</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-primary" : "text-slate-400"
                      }`}
                    />
                  </button>

                  {/* Dropdown Flyout Card */}
                  {isOpen && (
                    <div
                      className="absolute top-full left-0 pt-2 z-50 min-w-[340px] animate-in fade-in zoom-in-95 duration-150"
                      onMouseEnter={() => handleMouseEnter(group.id)}
                      onMouseLeave={handleMouseLeave}
                    >
                      <div className="bg-white rounded-xl shadow-xl border border-slate-200/90 p-2.5 backdrop-blur-md">
                        {/* Section Header Hint */}
                        <div className="px-2.5 py-1 mb-1.5 flex items-center justify-between border-b border-slate-100">
                          <span className="text-[10px] font-black uppercase tracking-wider text-[#5B6574]">
                            {group.label}
                          </span>
                          {group.subLabel && (
                            <span className="text-[10px] font-semibold text-primary/80">
                              {group.subLabel}
                            </span>
                          )}
                        </div>

                        {/* Dropdown List Items */}
                        <div className="space-y-1">
                          {group.items.map((item) => {
                            const isCurrent = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
                            const IconComponent = item.icon;

                            return (
                              <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setActiveDropdown(null)}
                                className={`flex items-start gap-3 p-2 rounded-lg transition-all group ${
                                  isCurrent
                                    ? "bg-red-50/80 text-primary"
                                    : "hover:bg-slate-50 text-slate-700 hover:text-slate-950"
                                }`}
                              >
                                <div
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                                    isCurrent
                                      ? "bg-primary text-white"
                                      : "bg-slate-100 text-slate-600 group-hover:bg-primary group-hover:text-white"
                                  }`}
                                >
                                  <IconComponent className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-bold uppercase tracking-wide group-hover:text-primary transition-colors">
                                      {item.label}
                                    </span>
                                    {item.badge && (
                                      <span className="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 group-hover:bg-red-100 group-hover:text-primary transition-colors">
                                        {item.badge}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                                    {item.desc}
                                  </p>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* 4. News & Recaps Direct Link */}
            <Link
              href="/news"
              className={`px-2.5 py-1 rounded-sm text-xs font-bold uppercase tracking-wide whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isLinkActive("/news")
                  ? "text-primary border-b-2 border-primary font-black pb-0.5"
                  : "text-slate-600 hover:text-primary hover:bg-slate-50"
              }`}
            >
              <span>News & Recaps</span>
            </Link>
          </nav>

          {/* Right: Actions Cluster */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Interactive Developer Role Switcher & Demo Hub */}
            {isDev && (
              <>
                <Link
                  href="/demo"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/90 border border-emerald-400 text-emerald-300 hover:bg-emerald-900 font-mono text-xs font-black transition shadow-sm"
                  title="ศูนย์รวมทางลัดทดสอบระบบ (Demo Hub 15 หน้า)"
                >
                  <Zap className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400 animate-pulse" />
                  <span>DEMO HUB</span>
                </Link>
                <div className="hidden md:block"><NavbarRoleSwitcher /></div>
              </>
            )}

            {/* User Profile, Role Badge & Auth */}
            <div className={currentUser.role === "PUBLIC" ? "hidden sm:block" : ""}><UserRoleProfileMenu /></div>
            {currentUser.role === "PUBLIC" && <Link href="/auth/login" className="sm:hidden min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg border border-outline-variant" aria-label="เข้าสู่ระบบ"><UserCheck className="w-5 h-5" /></Link>}

            {/* Utility Icons: Notification Center & Globe */}
            <div className="hidden sm:flex items-center gap-1 pl-2 border-l border-outline-variant text-slate-500">
              <NotificationCenter />
              <button
                className="hidden sm:inline-flex hover:text-primary hover:bg-slate-100 p-1.5 rounded-lg transition"
                title="Language & Region"
                onClick={() => alert("Language: Thai / English (FIBA Livestats Standard)")}
              >
                <Globe className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Hamburger Menu Button (44x44px Courtside Touch Target) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="min-[1440px]:hidden min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg border border-outline-variant text-slate-700 hover:bg-slate-50 transition"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile / Tablet Accordion Drawer */}
        {mobileMenuOpen && (
          <div className="min-[1440px]:hidden bg-white border-b border-outline-variant px-4 py-3 space-y-3 animate-in fade-in max-h-[85vh] overflow-y-auto">
            {currentUser.role === "PUBLIC" && <UserRoleProfileMenu />}
            {/* Mobile User Profile Card & Role Switcher */}
            <div className="p-3 bg-slate-900 text-white rounded-xl shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs shrink-0 border border-white/20">
                    {currentUser.name ? currentUser.name.charAt(0) : "G"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold truncate">{currentUser.name || "Guest Spectator"}</p>
                    <span className="text-[9px] font-mono font-bold bg-white/20 px-1.5 py-0.5 rounded">
                      {currentUser.role}
                    </span>
                  </div>
                </div>
                <span className="text-xs text-slate-300">{currentUser.role}</span>
              </div>

              {/* Mobile Role Switcher Trigger & Demo Hub */}
              {isDev && (
                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-400">สลับสิทธิ์ทดสอบ:</span>
                    <NavbarRoleSwitcher />
                  </div>
                  <Link
                    href="/demo"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2 px-3 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-mono text-xs font-bold flex items-center justify-between transition hover:bg-emerald-900"
                  >
                    <div className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-emerald-400" />
                      <span>ศูนย์รวมทางลัดทดสอบระบบ (Demo Hub)</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>

            {/* Search Input for Mobile/Tablet */}
            <form onSubmit={handleSearchSubmit} className="flex items-center bg-[#f8f9fc] border border-outline-variant rounded-lg px-2.5 py-1.5 w-full">
              <Search className="w-3.5 h-3.5 text-slate-500 mr-2 shrink-0" />
              <input
                className="bg-transparent border-0 p-0 text-xs font-medium text-slate-800 placeholder:text-slate-500 w-full outline-none"
                placeholder="ค้นหานักกีฬา, ทีม, ทัวร์นาเมนต์..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>

            {/* Direct Links Top */}
            <div className="space-y-1 pt-1">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
                  pathname === "/"
                    ? "bg-red-50 text-primary font-black"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span>Home</span>
              </Link>

              <Link
                href="/live"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
                  pathname === "/live"
                    ? "bg-red-50 text-primary font-black"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600" />
                  </span>
                  <span>Live Match Hub</span>
                </div>
                <span className="text-[10px] font-mono bg-red-100 text-red-700 font-bold px-1.5 py-0.5 rounded">
                  LIVE
                </span>
              </Link>
            </div>

            {/* Accordion Dropdown Groups for Mobile */}
            <div className="space-y-1.5 pt-1 border-t border-slate-100">
              {filteredNavGroups.map((group) => {
                const active = isGroupActive(group);
                const isExpanded =
                  mobileExpandedGroup === group.id ||
                  (mobileExpandedGroup === null && active);

                return (
                  <div
                    key={group.id}
                    className="border border-slate-200/80 rounded-xl overflow-hidden"
                  >
                    {/* Accordion Header */}
                    <button
                      onClick={() =>
                        setMobileExpandedGroup(isExpanded ? "" : group.id)
                      }
                      className={`w-full flex items-center justify-between py-2.5 px-3 text-xs font-bold uppercase tracking-wider transition ${
                        active
                          ? "bg-slate-50 text-primary font-black"
                          : "text-slate-800 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{group.label}</span>
                        {group.subLabel && (
                          <span className="text-[10px] text-[#5B6574] font-normal">
                            ({group.subLabel})
                          </span>
                        )}
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isExpanded ? "rotate-180 text-primary" : "text-slate-400"
                        }`}
                      />
                    </button>

                    {/* Accordion Sub-items */}
                    {isExpanded && (
                      <div className="bg-slate-50/60 p-1.5 space-y-1 border-t border-slate-100">
                        {group.items.map((item) => {
                          const isCurrent =
                            pathname === item.href ||
                            (item.href !== "/" && pathname?.startsWith(item.href));
                          const IconComp = item.icon;

                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setMobileMenuOpen(false)}
                              className={`flex items-start gap-2.5 p-2 rounded-lg transition ${
                                isCurrent
                                  ? "bg-red-50 text-primary font-bold"
                                  : "bg-white hover:bg-slate-100 text-slate-700"
                              }`}
                            >
                              <div
                                className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
                                  isCurrent
                                    ? "bg-primary text-white"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                <IconComp className="w-3.5 h-3.5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold uppercase">
                                    {item.label}
                                  </span>
                                  {item.badge && (
                                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                                      {item.badge}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] text-slate-500 font-medium truncate">
                                  {item.desc}
                                </p>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Direct Link News */}
            <div className="pt-1 border-t border-slate-100">
              <Link
                href="/news"
                onClick={() => setMobileMenuOpen(false)}
                className={`block py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
                  pathname === "/news"
                    ? "bg-red-50 text-primary font-black"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span>News & Recaps</span>
              </Link>
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 border-t border-outline-variant flex items-center justify-between text-xs">
              {canAccessOfficialConsole(currentUser) ? (
                <Link
                  href="/official/console/match-bcc-ds-01"
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-bold text-primary flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Table Official Console</span>
                </Link>
              ) : currentUser.role === "ATHLETE" ? (
                <Link
                  href="/athlete/ath-1"
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1.5"
                >
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  <span>My Athlete Hub</span>
                </Link>
              ) : currentUser.role === "COACH" ? (
                <Link
                  href="/scout"
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1.5"
                >
                  <Compass className="w-4 h-4 text-emerald-600" />
                  <span>Coach Hub</span>
                </Link>
              ) : (
                <Link
                  href="/tournaments"
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-bold text-slate-700 hover:text-primary flex items-center gap-1.5"
                >
                  <Trophy className="w-4 h-4 text-primary" />
                  <span>Tournaments & Brackets</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Pricing Modal */}
      <PricingModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
      />
    </>
  );
}

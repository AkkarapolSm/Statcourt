"use client";

import React, { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuthStore } from "@/lib/auth/useAuthStore";
import PreApprovalAuditModal from "@/components/admin/PreApprovalAuditModal";
import {
  ShieldAlert,
  ShieldCheck,
  Users,
  Award,
  Trophy,
  History,
  FileCheck2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  ClipboardCheck,
  Lock,
  Calendar,
  Phone,
  Mail,
  UserCheck,
  Layers,
  ArrowRight,
  GitBranch,
  FileSpreadsheet,
  KeyRound,
  Smartphone,
} from "lucide-react";
import TournamentBracketManager from "@/components/tournaments/TournamentBracketManager";
import RosterImportModal from "@/components/import/RosterImportModal";
import AccountSecurityModal from "@/components/auth/AccountSecurityModal";

type OfficialItem = {
  id: string;
  fullName: string;
  licensingBody: string;
  licenseNumber: string | null;
  approvalStatus: string;
  user: {
    id: string;
    email: string;
    displayName: string | null;
    phoneNumber: string | null;
    accountStatus: string;
    createdAt: string;
  };
};

type TournamentRegistrationItem = {
  id: string;
  tournamentId: string;
  teamId: string;
  status: string;
  rosterJson: string;
  isRosterLocked: boolean;
  notes: string | null;
  submittedAt: string;
  reviewedAt: string | null;
  reviewerNotes: string | null;
  tournament: {
    id: string;
    name: string;
    category: string;
    status: string;
    startDate: string;
    endDate: string;
    maxTeams: number;
    registeredTeams: number;
  };
  team: {
    id: string;
    name: string;
    shortName: string | null;
    institution: string;
    logoUrl: string | null;
    coach?: {
      fullName: string;
      organization: string;
      phoneNumber: string;
    } | null;
  };
};

type AuditLogItem = {
  id: string;
  userId: string;
  action: string;
  targetEntity: string;
  targetId: string;
  metadataJson: string;
  createdAt: string;
  user: {
    id: string;
    email: string;
    displayName: string | null;
    role: string;
  };
};

type PendingUser = {
  id: string;
  email: string;
  displayName: string | null;
  role: string;
  createdAt: string;
  coachProfile?: { organization: string } | null;
  officialProfile?: { licenseNumber: string | null; licensingBody: string } | null;
};

type PendingMembership = {
  userId: string;
  teamId: string;
  user: { displayName: string | null; email: string };
  team: { name: string };
};

type ApprovedOfficial = {
  id: string;
  displayName: string | null;
  email: string;
  officialProfile: { licenseNumber: string | null } | null;
};

type PendingMatchItem = {
  id: string;
  tournamentId: string;
  homeScore: number;
  awayScore: number;
  resultStatus: string;
  scheduledAt: string;
  venue: string | null;
  tournament: {
    id: string;
    name: string;
    category: string;
  };
  homeTeam: {
    id: string;
    name: string;
    shortName: string | null;
  };
  awayTeam: {
    id: string;
    name: string;
    shortName: string | null;
  };
};

export default function AdminPage() {
  const { currentUser, loading: authLoading, switchRole } = useAuthStore();
  const [isPendingRoleSwitch, startRoleSwitch] = useTransition();

  const [activeTab, setActiveTab] = useState<"OFFICIALS" | "REGISTRATIONS" | "AUDIT" | "ACCOUNTS">("OFFICIALS");

  // Overview Stats
  const [stats, setStats] = useState<{
    pendingOfficials: number;
    pendingRegistrations: number;
    pendingUsers: number;
    pendingMatches: number;
    totalAudits: number;
  }>({
    pendingOfficials: 0,
    pendingRegistrations: 0,
    pendingUsers: 0,
    pendingMatches: 0,
    totalAudits: 0,
  });

  // Tab 1: Officials State
  const [officials, setOfficials] = useState<OfficialItem[]>([]);
  const [officialStatusFilter, setOfficialStatusFilter] = useState<string>("ALL");
  const [officialSearch, setOfficialSearch] = useState("");
  const [editingLicenses, setEditingLicenses] = useState<Record<string, string>>({});
  const [officialLoading, setOfficialLoading] = useState(false);

  // Tab 2: Registrations State
  const [registrations, setRegistrations] = useState<TournamentRegistrationItem[]>([]);
  const [registrationStatusFilter, setRegistrationStatusFilter] = useState<string>("ALL");
  const [registrationSearch, setRegistrationSearch] = useState("");
  const [registrationLoading, setRegistrationLoading] = useState(false);

  // Tab 3: Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [auditActionFilter, setAuditActionFilter] = useState<string>("ALL");
  const [auditSearch, setAuditSearch] = useState("");
  const [auditLoading, setAuditLoading] = useState(false);

  // Tab 4: Legacy Accounts & Match Approvals State
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [pendingMemberships, setPendingMemberships] = useState<PendingMembership[]>([]);
  const [approvedOfficialsList, setApprovedOfficialsList] = useState<ApprovedOfficial[]>([]);
  const [pendingMatches, setPendingMatches] = useState<PendingMatchItem[]>([]);
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [auditModalMatchId, setAuditModalMatchId] = useState("");
  const [matchId, setMatchId] = useState("");
  const [selectedOfficialId, setSelectedOfficialId] = useState("");
  const [matchStatus, setMatchStatus] = useState("");
  const [reopenReason, setReopenReason] = useState("");
  const [bracketModalOpen, setBracketModalOpen] = useState(false);
  const [bracketTournamentId, setBracketTournamentId] = useState("");
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [securityModalOpen, setSecurityModalOpen] = useState(false);
  const [securityModalTab, setSecurityModalTab] = useState<"EMAIL" | "PASSWORD" | "SESSIONS" | "STEP_UP">("STEP_UP");

  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Fetch overview stats
  const fetchOverview = async () => {
    try {
      const res = await fetch("/api/admin/overview", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setStats({
          pendingOfficials: data.pending?.officials || 0,
          pendingRegistrations: data.pending?.registrations || 0,
          pendingUsers: (data.pending?.users || 0) + (data.pending?.memberships || 0),
          pendingMatches: data.pending?.matchResults || 0,
          totalAudits: data.system?.auditLogs || 0,
        });
      }
    } catch (err) {
      console.error("Failed to fetch overview", err);
    }
  };

  // Fetch Officials
  const fetchOfficials = async () => {
    setOfficialLoading(true);
    try {
      const query = new URLSearchParams();
      if (officialStatusFilter !== "ALL") query.set("status", officialStatusFilter);
      if (officialSearch.trim()) query.set("q", officialSearch.trim());
      const res = await fetch(`/api/admin/officials?${query.toString()}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setOfficials(data.officials || []);
      }
    } catch (err) {
      console.error("Failed to fetch officials", err);
    } finally {
      setOfficialLoading(false);
    }
  };

  // Fetch Registrations
  const fetchRegistrations = async () => {
    setRegistrationLoading(true);
    try {
      const query = new URLSearchParams();
      if (registrationStatusFilter !== "ALL") query.set("status", registrationStatusFilter);
      if (registrationSearch.trim()) query.set("q", registrationSearch.trim());
      const res = await fetch(`/api/admin/registrations?${query.toString()}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setRegistrations(data.registrations || []);
      }
    } catch (err) {
      console.error("Failed to fetch registrations", err);
    } finally {
      setRegistrationLoading(false);
    }
  };

  // Fetch Audit Logs
  const fetchAuditLogs = async () => {
    setAuditLoading(true);
    try {
      const query = new URLSearchParams();
      if (auditActionFilter !== "ALL") query.set("action", auditActionFilter);
      if (auditSearch.trim()) query.set("q", auditSearch.trim());
      const res = await fetch(`/api/admin/audit-logs?${query.toString()}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data.logs || []);
      }
    } catch (err) {
      console.error("Failed to fetch audit logs", err);
    } finally {
      setAuditLoading(false);
    }
  };

  // Fetch Legacy Access Data & Pending Matches
  const fetchAccessData = async () => {
    try {
      const res = await fetch("/api/admin/access", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setPendingUsers(data.pendingUsers || []);
        setPendingMemberships(data.pendingMemberships || []);
        setApprovedOfficialsList(data.officials || []);
        setPendingMatches(data.pendingMatches || []);
      }
    } catch (err) {
      console.error("Failed to fetch access data", err);
    }
  };

  // Initial and reactive load
  useEffect(() => {
    if (currentUser.role === "ADMIN") {
      void fetchOverview();
      void fetchOfficials();
      void fetchRegistrations();
      void fetchAuditLogs();
      void fetchAccessData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser.role]);

  // Tab switch effect
  useEffect(() => {
    if (currentUser.role !== "ADMIN") return;
    if (activeTab === "OFFICIALS") void fetchOfficials();
    if (activeTab === "REGISTRATIONS") void fetchRegistrations();
    if (activeTab === "AUDIT") void fetchAuditLogs();
    if (activeTab === "ACCOUNTS") void fetchAccessData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, officialStatusFilter, registrationStatusFilter, auditActionFilter]);

  // Actions
  const handleModerateOfficial = async (officialId: string, approvalStatus: "APPROVED" | "REJECTED") => {
    setStatusMessage(null);
    const customLicense = editingLicenses[officialId];
    try {
      const res = await fetch("/api/admin/officials", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          officialId,
          approvalStatus,
          licenseNumber: customLicense || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMessage({ text: data.message || "บันทึกข้อมูลเรียบร้อย", type: "success" });
        await fetchOfficials();
        await fetchOverview();
        await fetchAuditLogs();
      } else {
        setStatusMessage({ text: data.error || "เกิดข้อผิดพลาดในการปรับสถานะ", type: "error" });
      }
    } catch {
      setStatusMessage({ text: "การเชื่อมต่อล้มเหลว", type: "error" });
    }
  };

  const handleModerateRegistration = async (
    registrationId: string,
    status: "APPROVED" | "REJECTED",
    lockRoster = false
  ) => {
    setStatusMessage(null);
    let reviewerNotes = "";
    if (status === "REJECTED") {
      const input = window.prompt("ระบุเหตุผลในการปฏิเสธ หรือคำแนะนำในการส่งเอกสารใหม่:");
      if (input === null) return;
      reviewerNotes = input;
    }

    try {
      const res = await fetch("/api/admin/registrations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationId,
          status,
          isRosterLocked: lockRoster,
          reviewerNotes: reviewerNotes || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMessage({ text: data.message || "บันทึกผลการตรวจสอบเรียบร้อย", type: "success" });
        await fetchRegistrations();
        await fetchOverview();
        await fetchAuditLogs();
      } else {
        setStatusMessage({ text: data.error || "บันทึกไม่สำเร็จ", type: "error" });
      }
    } catch {
      setStatusMessage({ text: "การเชื่อมต่อล้มเหลว", type: "error" });
    }
  };

  const handleAccessAction = async (action: string, data: object) => {
    setStatusMessage(null);
    try {
      const res = await fetch("/api/admin/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...data }),
      });
      const result = await res.json();
      if (res.ok) {
        setStatusMessage({ text: "ดำเนินการเสร็จสิ้น", type: "success" });
        await fetchAccessData();
        await fetchOverview();
        await fetchAuditLogs();
      } else {
        setStatusMessage({ text: result.error || "เกิดข้อผิดพลาด", type: "error" });
      }
    } catch {
      setStatusMessage({ text: "การเชื่อมต่อล้มเหลว", type: "error" });
    }
  };

  const handleMatchResultAction = async (action: "APPROVE" | "REOPEN") => {
    setStatusMessage(null);
    if (action === "REOPEN" && reopenReason.trim().length < 10) {
      setStatusMessage({ text: "กรุณาระบุเหตุผลการเปิดแก้ไขอย่างน้อย 10 ตัวอักษร", type: "error" });
      return;
    }
    try {
      const res = await fetch(`/api/matches/${encodeURIComponent(matchId)}/result`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason: reopenReason }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMessage({ text: "อัปเดตผลการแข่งขันและบันทึกประวัติสำเร็จ", type: "success" });
        setMatchStatus(data.match.resultStatus);
        await fetchOverview();
        await fetchAuditLogs();
      } else {
        setStatusMessage({ text: data.error || "อัปเดตไม่สำเร็จ", type: "error" });
      }
    } catch {
      setStatusMessage({ text: "การเชื่อมต่อล้มเหลว", type: "error" });
    }
  };

  const handleLoadMatch = async () => {
    if (!matchId.trim()) return;
    try {
      const res = await fetch(`/api/matches/${encodeURIComponent(matchId)}/result`);
      const data = await res.json();
      setMatchStatus(res.ok ? `${data.match.resultStatus} · ${data.match.homeScore}-${data.match.awayScore}` : "ไม่พบแมตช์");
    } catch {
      setMatchStatus("ตรวจสอบไม่สำเร็จ");
    }
  };

  // If loading session
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FF] text-[#0B1C30] flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="flex items-center gap-3 text-slate-600 font-mono text-sm">
            <RefreshCw className="w-5 h-5 animate-spin text-[#AF101A]" />
            <span>กำลังตรวจสอบสิทธิ์ระบบผู้ดูแลสหพันธ์...</span>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // If not admin, show developer switcher gate
  if (currentUser.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-[#F8F9FF] text-[#0B1C30] flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
          <div className="max-w-xl w-full bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xl text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-red-100 text-[#AF101A] flex items-center justify-center mx-auto shadow-inner">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-[#AF101A] text-xs font-mono font-bold tracking-wider uppercase">
                FEDERATION ADMIN RESTRICTED
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#0B1C30]">
                พื้นที่เฉพาะผู้ดูแลระบบสหพันธ์ (Admin)
              </h1>
              <p className="text-sm text-slate-600 leading-relaxed">
                ขณะนี้คุณกำลังเข้าสู่ระบบในบทบาท{" "}
                <span className="font-mono font-bold text-[#AF101A] bg-red-50 px-2 py-0.5 rounded">
                  {currentUser.role}
                </span>{" "}
                หน้านี้สงวนไว้สำหรับกรรมการบริหารสหพันธ์บาสเกตบอล และผู้ดูแลระบบในการอนุมัติใบอนุญาตและผลแข่งขัน
              </p>
            </div>

            {/* Quick Dev Switcher Button */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <button
                type="button"
                disabled={isPendingRoleSwitch}
                onClick={() => {
                  startRoleSwitch(async () => {
                    await switchRole("ADMIN");
                  });
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-[#0B1C30] hover:bg-[#1A365D] text-white font-mono text-sm font-bold flex items-center justify-center gap-2 shadow-lg transition disabled:opacity-60 cursor-pointer"
              >
                {isPendingRoleSwitch ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>กำลังสลับสิทธิ์เป็นผู้ดูแลระบบ...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>สลับสิทธิ์เป็น ADMIN ทันที (Dev Switcher)</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-4 text-xs text-slate-500 font-mono">
                <Link href="/" className="hover:text-[#AF101A] underline">
                  กลับสู่หน้าหลัก
                </Link>
                <span>•</span>
                <Link href="/auth/login" className="hover:text-[#AF101A] underline">
                  เข้าสู่ระบบด้วยบัญชีอื่น
                </Link>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FF] text-[#0B1C30] flex flex-col font-sans antialiased">
      <Navbar />

      <main className="flex-1 pb-20">
        {/* Federation Admin Hero Header */}
        <section className="bg-[#0F172A] text-white py-10 sm:py-12 border-b border-slate-800">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#AF101A]/30 border border-[#AF101A]/50 text-red-200 text-xs font-mono font-bold tracking-widest uppercase">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>STATCOURTTH FEDERATION BACK-OFFICE CONTROL</span>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight text-white">
                  ศูนย์บริหารจัดการส่วนกลางและรับรองสิทธิ์
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
                  อนุมัติใบอนุญาตผู้ตัดสินโต๊ะเทคนิค, ตรวจรับรองทีมสมัครแข่งขันทัวร์นาเมนต์, ตรวจสอบ Audit Log ตามระเบียบ FIBA และรับรองผลการแข่งขัน
                </p>
              </div>

              {/* Live Session Details & Security Action */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-mono">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#AF101A] flex items-center justify-center text-white shrink-0 font-bold">
                    ADM
                  </div>
                  <div>
                    <div className="text-white font-bold">{currentUser.name}</div>
                    <div className="text-slate-400">{currentUser.email || "admin@statcourt.th"}</div>
                    <div className="text-emerald-400 text-[11px] font-bold mt-0.5">
                      ● ACTIVE FEDERATION ROLE
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSecurityModalTab("STEP_UP");
                    setSecurityModalOpen(true);
                  }}
                  className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono text-xs font-bold transition flex items-center gap-2 cursor-pointer"
                  title="จัดการความปลอดภัย อุปกรณ์ และการยกระดับสิทธิ์"
                >
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                  <span>ความปลอดภัยบัญชี</span>
                </button>
              </div>
            </div>

            {/* Notification alert */}
            {statusMessage && (
              <div
                role="status"
                className={`mt-6 p-4 rounded-xl border text-sm font-sans flex items-center justify-between gap-3 ${
                  statusMessage.type === "success"
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                    : "bg-red-500/10 border-red-500/30 text-red-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  {statusMessage.type === "success" ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                  )}
                  <span>{statusMessage.text}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setStatusMessage(null)}
                  className="text-xs font-mono uppercase underline hover:opacity-80"
                >
                  ปิด
                </button>
              </div>
            )}

            {/* KPI Cards Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-8">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                  <span>เจ้าหน้าที่รออนุมัติ</span>
                  <Award className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                  {stats.pendingOfficials}
                </div>
                <div className="text-[11px] text-amber-400 font-mono">รอตรวจสอบใบอนุญาต</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                  <span>ทีมรอรับรองทัวร์นาเมนต์</span>
                  <Trophy className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                  {stats.pendingRegistrations}
                </div>
                <div className="text-[11px] text-blue-400 font-mono">รอตรวจสอบรายชื่อ</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                  <span>แมตช์รอรับรองผล</span>
                  <FileCheck2 className="w-4 h-4 text-rose-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                  {stats.pendingMatches}
                </div>
                <div className="text-[11px] text-rose-400 font-mono">รอตรวจสอบความครบถ้วน</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                  <span>คำขอบัญชี/สังกัด</span>
                  <Users className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                  {stats.pendingUsers}
                </div>
                <div className="text-[11px] text-emerald-400 font-mono">รอเปิดใช้งาน</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1 col-span-2 sm:col-span-1">
                <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                  <span>Audit Logs ในระบบ</span>
                  <History className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                  {stats.totalAudits}
                </div>
                <div className="text-[11px] text-purple-400 font-mono">บันทึกความปลอดภัย</div>
              </div>
            </div>
          </div>
        </section>

        {/* Tab Navigation */}
        <section className="bg-white border-b border-slate-200 sticky top-16 z-20 shadow-xs">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 overflow-x-auto py-2">
              <button
                type="button"
                onClick={() => setActiveTab("OFFICIALS")}
                className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold whitespace-nowrap transition flex items-center gap-2 cursor-pointer ${
                  activeTab === "OFFICIALS"
                    ? "bg-[#AF101A] text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Award className="w-4 h-4" />
                <span>อนุมัติเจ้าหน้าที่และใบอนุญาต ({officials.filter((o) => o.approvalStatus === "PENDING").length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("REGISTRATIONS")}
                className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold whitespace-nowrap transition flex items-center gap-2 cursor-pointer ${
                  activeTab === "REGISTRATIONS"
                    ? "bg-[#AF101A] text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Trophy className="w-4 h-4" />
                <span>รับรองทีมสมัครแข่งขันทัวร์นาเมนต์ ({registrations.filter((r) => r.status === "PENDING").length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("AUDIT")}
                className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold whitespace-nowrap transition flex items-center gap-2 cursor-pointer ${
                  activeTab === "AUDIT"
                    ? "bg-[#AF101A] text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <History className="w-4 h-4" />
                <span>บันทึกตรวจสอบระบบ (Audit Trail)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("ACCOUNTS")}
                className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold whitespace-nowrap transition flex items-center gap-2 cursor-pointer ${
                  activeTab === "ACCOUNTS"
                    ? "bg-[#AF101A] text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <FileCheck2 className="w-4 h-4" />
                <span>รับรองผลแมตช์ &amp; สิทธิ์ ({pendingMatches.length})</span>
              </button>
            </div>
          </div>
        </section>

        {/* Tab 1: Officials Management */}
        {activeTab === "OFFICIALS" && (
          <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Status Filter Buttons */}
              <div className="flex items-center gap-2 overflow-x-auto">
                <span className="text-xs font-mono text-slate-500 font-bold uppercase mr-1">สถานะ:</span>
                {[
                  { id: "ALL", label: "ทั้งหมด" },
                  { id: "PENDING", label: "รอพิจารณา (Pending)" },
                  { id: "APPROVED", label: "อนุมัติแล้ว (Approved)" },
                  { id: "REJECTED", label: "ไม่อนุมัติ (Rejected)" },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setOfficialStatusFilter(f.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                      officialStatusFilter === f.id
                        ? "bg-[#0B1C30] text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="flex items-center gap-2 max-w-sm w-full">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={officialSearch}
                    onChange={(e) => setOfficialSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && fetchOfficials()}
                    placeholder="ค้นชื่อเจ้าหน้าที่, สังกัด หรือเลขใบอนุญาต..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-sans text-slate-800 focus:outline-none focus:border-[#AF101A]"
                  />
                </div>
                <button
                  type="button"
                  onClick={fetchOfficials}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-mono font-bold transition"
                >
                  ค้นหา
                </button>
              </div>
            </div>

            {/* Officials List / Table */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-[#0B1C30]">
                    รายชื่อเจ้าหน้าที่โต๊ะเทคนิค &amp; ผู้ตัดสิน ({officials.length})
                  </h2>
                  <p className="text-xs text-slate-500">
                    ตรวจสอบคุณสมบัติ ออกรหัสใบอนุญาตประจำตัว และควบคุมสิทธิ์เข้าสู่ Table Official Console
                  </p>
                </div>
                <button
                  type="button"
                  onClick={fetchOfficials}
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-600 hover:text-[#AF101A] transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${officialLoading ? "animate-spin" : ""}`} />
                  <span>รีเฟรช</span>
                </button>
              </div>

              {officialLoading ? (
                <div className="p-12 text-center text-slate-500 text-xs font-mono">กำลังโหลดข้อมูล...</div>
              ) : officials.length === 0 ? (
                <div className="p-12 text-center text-slate-500 space-y-2">
                  <Award className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-sm font-bold">ไม่พบข้อมูลเจ้าหน้าที่ตามเงื่อนไขที่เลือก</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-sans">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono uppercase text-[11px]">
                      <tr>
                        <th className="py-3 px-4">ชื่อ - นามสกุล</th>
                        <th className="py-3 px-4">สังกัด / หน่วยงานออกใบอนุญาต</th>
                        <th className="py-3 px-4">เลขที่ใบอนุญาต</th>
                        <th className="py-3 px-4">ข้อมูลติดต่อ</th>
                        <th className="py-3 px-4">สถานะการรับรอง</th>
                        <th className="py-3 px-4 text-right">การจัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {officials.map((official) => {
                        const isPending = official.approvalStatus === "PENDING";
                        const isApproved = official.approvalStatus === "APPROVED";
                        const currentInput =
                          editingLicenses[official.id] !== undefined
                            ? editingLicenses[official.id]
                            : official.licenseNumber || "";

                        return (
                          <tr key={official.id} className="hover:bg-slate-50/70 transition">
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-slate-900 text-sm">{official.fullName}</div>
                              <div className="text-[11px] text-slate-400 font-mono">ID: {official.id}</div>
                            </td>
                            <td className="py-3.5 px-4 font-mono text-slate-700">
                              <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                                {official.licensingBody}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-1.5 max-w-[200px]">
                                <input
                                  type="text"
                                  value={currentInput}
                                  onChange={(e) =>
                                    setEditingLicenses((prev) => ({
                                      ...prev,
                                      [official.id]: e.target.value,
                                    }))
                                  }
                                  placeholder="เช่น BSAT-2026-088"
                                  className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs font-mono focus:border-[#AF101A] focus:outline-none"
                                />
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-slate-600 font-mono space-y-0.5">
                              <div className="flex items-center gap-1.5">
                                <Mail className="w-3 h-3 text-slate-400" />
                                <span>{official.user.email}</span>
                              </div>
                              {official.user.phoneNumber && (
                                <div className="flex items-center gap-1.5">
                                  <Phone className="w-3 h-3 text-slate-400" />
                                  <span>{official.user.phoneNumber}</span>
                                </div>
                              )}
                            </td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-mono text-[11px] font-bold uppercase ${
                                  isApproved
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : isPending
                                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                                    : "bg-red-50 text-red-700 border border-red-200"
                                }`}
                              >
                                {isApproved && <CheckCircle2 className="w-3 h-3" />}
                                {isPending && <AlertCircle className="w-3 h-3" />}
                                {!isApproved && !isPending && <XCircle className="w-3 h-3" />}
                                <span>{official.approvalStatus}</span>
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="inline-flex items-center gap-1.5">
                                {official.approvalStatus !== "APPROVED" && (
                                  <button
                                    type="button"
                                    onClick={() => handleModerateOfficial(official.id, "APPROVED")}
                                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                                  >
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>อนุมัติใบอนุญาต</span>
                                  </button>
                                )}
                                {official.approvalStatus !== "REJECTED" && (
                                  <button
                                    type="button"
                                    onClick={() => handleModerateOfficial(official.id, "REJECTED")}
                                    className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-red-50 text-red-600 border border-slate-200 font-mono text-xs font-bold transition cursor-pointer"
                                  >
                                    ปฏิเสธ
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Tab 2: Tournament Registrations Management */}
        {activeTab === "REGISTRATIONS" && (
          <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2 overflow-x-auto">
                <span className="text-xs font-mono text-slate-500 font-bold uppercase mr-1">สถานะ:</span>
                {[
                  { id: "ALL", label: "ทั้งหมด" },
                  { id: "PENDING", label: "รอการตรวจสอบ (Pending)" },
                  { id: "APPROVED", label: "อนุมัติแล้ว (Approved)" },
                  { id: "REJECTED", label: "ปฏิเสธ (Rejected)" },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setRegistrationStatusFilter(f.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                      registrationStatusFilter === f.id
                        ? "bg-[#0B1C30] text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 max-w-sm w-full">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={registrationSearch}
                    onChange={(e) => setRegistrationSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && fetchRegistrations()}
                    placeholder="ค้นหาชื่อทีม, โรงเรียน หรือทัวร์นาเมนต์..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-sans text-slate-800 focus:outline-none focus:border-[#AF101A]"
                  />
                </div>
                <button
                  type="button"
                  onClick={fetchRegistrations}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-mono font-bold transition"
                >
                  ค้นหา
                </button>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-[#0B1C30]">
                    คำขอเข้าร่วมการแข่งขัน ({registrations.length})
                  </h2>
                  <p className="text-xs text-slate-500">
                    ตรวจคุณสมบัตินักกีฬา ล็อกรายชื่อ (Roster Lock) และจัดสาย/ตารางแข่งขันอัตโนมัติ
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setImportModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-mono text-xs font-bold transition cursor-pointer"
                    title="นำเข้ารายชื่อนักกีฬาจาก CSV และตรวจสอบข้อมูลซ้ำซ้อน"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                    <span>นำเข้ารายชื่อ CSV</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const firstId = registrations[0]?.tournamentId || "tourn-national-youth-2025";
                      setBracketTournamentId(firstId);
                      setBracketModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-mono text-xs font-bold transition cursor-pointer"
                    title="จัดการสายการแข่งขันและวางตารางสนามอัตโนมัติ"
                  >
                    <GitBranch className="w-3.5 h-3.5 text-indigo-600" />
                    <span>จัดการสายแข่ง &amp; ตารางสนาม</span>
                  </button>
                  <button
                    type="button"
                    onClick={fetchRegistrations}
                    className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-600 hover:text-[#AF101A] transition"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${registrationLoading ? "animate-spin" : ""}`} />
                    <span>รีเฟรช</span>
                  </button>
                </div>
              </div>

              {registrationLoading ? (
                <div className="p-12 text-center text-slate-500 text-xs font-mono">กำลังโหลดคำขอ...</div>
              ) : registrations.length === 0 ? (
                <div className="p-12 text-center text-slate-500 space-y-2">
                  <Trophy className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-sm font-bold">ไม่พบคำขอสมัครเข้าร่วมแข่งขันตามตัวกรอง</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {registrations.map((reg) => {
                    let rosterCount = 0;
                    try {
                      const parsed = JSON.parse(reg.rosterJson || "[]");
                      rosterCount = Array.isArray(parsed) ? parsed.length : 0;
                    } catch {
                      rosterCount = 0;
                    }

                    const isPending = reg.status === "PENDING";
                    const isApproved = reg.status === "APPROVED";

                    return (
                      <div key={reg.id} className="p-5 hover:bg-slate-50/70 transition flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                        <div className="space-y-2 max-w-3xl">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase ${
                                isApproved
                                  ? "bg-emerald-100 text-emerald-800"
                                  : isPending
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {reg.status}
                            </span>
                            {reg.isRosterLocked && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-800 text-white font-mono text-[10px] font-bold">
                                <Lock className="w-3 h-3 text-amber-400" />
                                <span>ROSTER LOCKED</span>
                              </span>
                            )}
                            <span className="text-xs font-mono text-slate-400">
                              ยื่นเมื่อ: {new Date(reg.submittedAt).toLocaleDateString("th-TH")}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <h3 className="text-base font-bold text-[#0B1C30]">
                              {reg.team.name}
                            </h3>
                            <span className="text-slate-400 font-mono text-xs">•</span>
                            <span className="text-xs text-slate-600 font-mono">
                              สังกัด: {reg.team.institution}
                            </span>
                          </div>

                          <div className="text-xs text-slate-600 flex flex-wrap items-center gap-4">
                            <button
                              type="button"
                              onClick={() => {
                                setBracketTournamentId(reg.tournamentId);
                                setBracketModalOpen(true);
                              }}
                              className="font-semibold text-[#AF101A] hover:underline cursor-pointer inline-flex items-center gap-1"
                              title="เปิดดูและจัดการสายการแข่งขันของทัวร์นาเมนต์นี้"
                            >
                              <span>🏆 {reg.tournament.name} ({reg.tournament.category})</span>
                              <GitBranch className="w-3 h-3 text-indigo-500" />
                            </button>
                            <span>👥 ผู้เล่นใน Roster: {rosterCount} คน</span>
                            {reg.team.coach && (
                              <span>👔 โค้ช: {reg.team.coach.fullName} ({reg.team.coach.phoneNumber})</span>
                            )}
                          </div>

                          {reg.notes && (
                            <p className="text-xs text-slate-500 bg-slate-100 p-2 rounded-lg font-mono">
                              หมายเหตุจากทีม: {reg.notes}
                            </p>
                          )}

                          {reg.reviewerNotes && (
                            <p className="text-xs text-blue-800 bg-blue-50 border border-blue-200 p-2 rounded-lg font-mono">
                              ความเห็นผู้ตรวจสอบ: {reg.reviewerNotes}
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          {reg.status !== "APPROVED" && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleModerateRegistration(reg.id, "APPROVED", true)}
                                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                              >
                                <Lock className="w-3.5 h-3.5" />
                                <span>อนุมัติและล็อกรายชื่อ</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleModerateRegistration(reg.id, "APPROVED", false)}
                                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-xs font-bold transition cursor-pointer"
                              >
                                อนุมัติทั่วไป
                              </button>
                            </>
                          )}

                          {reg.status !== "REJECTED" && (
                            <button
                              type="button"
                              onClick={() => handleModerateRegistration(reg.id, "REJECTED", false)}
                              className="px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-mono text-xs font-bold transition cursor-pointer"
                            >
                              ปฏิเสธ / แจ้งแก้ไข
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Tab 3: System Audit Trail Inspector */}
        {activeTab === "AUDIT" && (
          <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2 overflow-x-auto">
                <span className="text-xs font-mono text-slate-500 font-bold uppercase mr-1">ACTION:</span>
                {[
                  { id: "ALL", label: "ทั้งหมด" },
                  { id: "APPROVE_OFFICIAL", label: "APPROVE_OFFICIAL" },
                  { id: "APPROVE_TOURNAMENT_REGISTRATION", label: "TOURNAMENT_REG" },
                  { id: "APPROVE_USER", label: "APPROVE_USER" },
                  { id: "ASSIGN_MATCH", label: "ASSIGN_MATCH" },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setAuditActionFilter(f.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                      auditActionFilter === f.id
                        ? "bg-[#0B1C30] text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 max-w-sm w-full">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={auditSearch}
                    onChange={(e) => setAuditSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && fetchAuditLogs()}
                    placeholder="ค้นหา Action, Target หรืออีเมล..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-sans text-slate-800 focus:outline-none focus:border-[#AF101A]"
                  />
                </div>
                <button
                  type="button"
                  onClick={fetchAuditLogs}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-mono font-bold transition"
                >
                  ค้นหา
                </button>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-[#0B1C30]">
                    บันทึกการตรวจสอบระบบ (Audit Log Trail) ({auditLogs.length})
                  </h2>
                  <p className="text-xs text-slate-500">
                    ประวัติการแก้ไขสิทธิ์ อนุมัติใบอนุญาต และการแทรกแซงผลแข่งขันตามมาตรฐานความโปร่งใส
                  </p>
                </div>
                <button
                  type="button"
                  onClick={fetchAuditLogs}
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-600 hover:text-[#AF101A] transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${auditLoading ? "animate-spin" : ""}`} />
                  <span>รีเฟรช</span>
                </button>
              </div>

              {auditLoading ? (
                <div className="p-12 text-center text-slate-500 text-xs font-mono">กำลังโหลดบันทึก...</div>
              ) : auditLogs.length === 0 ? (
                <div className="p-12 text-center text-slate-500 space-y-2">
                  <History className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-sm font-bold">ไม่พบบันทึกการตรวจสอบระบบ</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-sans">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono uppercase text-[11px]">
                      <tr>
                        <th className="py-3 px-4">วันและเวลา (UTC+7)</th>
                        <th className="py-3 px-4">ผู้ดำเนินการ (Operator)</th>
                        <th className="py-3 px-4">ACTION</th>
                        <th className="py-3 px-4">TARGET ENTITY</th>
                        <th className="py-3 px-4">METADATA / รายละเอียด</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                            {new Date(log.createdAt).toLocaleString("th-TH")}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900 font-sans">
                              {log.user?.displayName || log.user?.email || log.userId}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              ROLE: {log.user?.role || "SYSTEM"}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded bg-slate-900 text-white text-[11px] font-bold">
                              {log.action}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-700">
                            <div>{log.targetEntity}</div>
                            <div className="text-[10px] text-slate-400">ID: {log.targetId}</div>
                          </td>
                          <td className="py-3 px-4 text-slate-600 max-w-xs break-all">
                            <pre className="text-[10px] bg-slate-100 p-1.5 rounded overflow-x-auto">
                              {log.metadataJson}
                            </pre>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Tab 4: Legacy Accounts, Memberships & Match Results */}
        {activeTab === "ACCOUNTS" && (
          <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
            {/* Account Lifecycle & Security Operations Banner Card */}
            <div className="bg-gradient-to-r from-slate-900 via-[#0B1C30] to-slate-900 rounded-2xl p-6 text-white border border-slate-800 shadow-md">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-bold uppercase">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>ACCOUNT LIFECYCLE &amp; SECURITY PROTOCOLS (3.5)</span>
                  </div>
                  <h2 className="text-xl font-black text-white tracking-tight">
                    ศูนย์ควบคุมความปลอดภัยบัญชีและอุปกรณ์เข้าใช้งาน
                  </h2>
                  <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                    บริหารจัดการการยืนยันอีเมลสมาคม, การเปลี่ยน/กู้คืนรหัสผ่านด้วย scrypt hashing, ตรวจสอบเซสชันอุปกรณ์ที่เข้าสู่ระบบทั้งหมด พร้อมระบบยกระดับสิทธิ์ผู้ดูแลระบบ (Admin Step-Up Elevation) สำหรับงานความปลอดภัยสูง
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setSecurityModalTab("STEP_UP");
                      setSecurityModalOpen(true);
                    }}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-mono text-xs font-bold transition shadow-sm cursor-pointer"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>ยกระดับสิทธิ์ (Step-Up)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSecurityModalTab("SESSIONS");
                      setSecurityModalOpen(true);
                    }}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-mono text-xs font-bold transition cursor-pointer"
                  >
                    <Smartphone className="w-4 h-4 text-blue-400" />
                    <span>อุปกรณ์ &amp; เซสชัน</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSecurityModalTab("EMAIL");
                      setSecurityModalOpen(true);
                    }}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-mono text-xs font-bold transition cursor-pointer"
                  >
                    <Mail className="w-4 h-4 text-emerald-400" />
                    <span>ยืนยันอีเมล</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSecurityModalTab("PASSWORD");
                      setSecurityModalOpen(true);
                    }}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-mono text-xs font-bold transition cursor-pointer"
                  >
                    <Lock className="w-4 h-4 text-rose-400" />
                    <span>เปลี่ยนรหัสผ่าน</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Pending Accounts */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h2 className="text-base font-bold text-[#0B1C30] flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-[#AF101A]" />
                    <span>คำขอบัญชีที่รอตรวจสอบ ({pendingUsers.length})</span>
                  </h2>
                </div>

                <div className="space-y-3">
                  {pendingUsers.length === 0 ? (
                    <p className="text-slate-500 text-xs py-4 text-center">ไม่มีคำขอบัญชีค้าง</p>
                  ) : (
                    pendingUsers.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100"
                      >
                        <div>
                          <strong className="text-sm text-slate-900">{item.displayName || item.email}</strong>
                          <p className="text-xs text-slate-500 font-mono">
                            บทบาท: {item.role} • {item.coachProfile?.organization || item.officialProfile?.licensingBody || item.email}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAccessAction("APPROVE_USER", { userId: item.id })}
                          className="px-3 py-1.5 rounded-lg bg-[#0B1C30] hover:bg-[#1A365D] text-white font-mono text-xs font-bold transition cursor-pointer"
                        >
                          อนุมัติบัญชี
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Pending Team Memberships */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h2 className="text-base font-bold text-[#0B1C30] flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <span>คำขอสังกัดทีม ({pendingMemberships.length})</span>
                  </h2>
                </div>

                <div className="space-y-3">
                  {pendingMemberships.length === 0 ? (
                    <p className="text-slate-500 text-xs py-4 text-center">ไม่มีคำขอสังกัดทีมค้าง</p>
                  ) : (
                    pendingMemberships.map((item) => (
                      <div
                        key={`${item.userId}-${item.teamId}`}
                        className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100"
                      >
                        <div className="text-xs">
                          <span className="font-bold text-slate-900">{item.user.displayName || item.user.email}</span>
                          <span className="text-slate-500 mx-2">→</span>
                          <span className="font-bold text-[#AF101A]">{item.team.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAccessAction("APPROVE_TEAM", { userId: item.userId, teamId: item.teamId })}
                          className="px-3 py-1.5 rounded-lg bg-[#0B1C30] hover:bg-[#1A365D] text-white font-mono text-xs font-bold transition cursor-pointer"
                        >
                          อนุมัติเข้าทีม
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Pending Match Certification Table */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-base font-bold text-[#0B1C30] flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-indigo-600" />
                    <span>แมตช์รอการรับรองผลอย่างเป็นทางการ ({pendingMatches.length})</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    ระบบตรวจสอบความครบถ้วน 5 มิติ (คะแนน Play-by-Play, ทะเบียนนักกีฬา, กติกาการฟาวล์ FIBA, ควอเตอร์ และเจ้าหน้าที่) ก่อนอนุมัติผล
                  </p>
                </div>
                <button
                  type="button"
                  onClick={fetchAccessData}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-xs font-bold flex items-center gap-1.5 self-start cursor-pointer transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>รีเฟรชรายการ</span>
                </button>
              </div>

              {pendingMatches.length === 0 ? (
                <div className="py-8 text-center bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                  <p className="text-xs font-bold text-slate-700">ไม่มีแมตช์ที่รอการรับรองผลค้างอยู่ในระบบ</p>
                  <p className="text-[11px] text-slate-500">ทุกแมตช์ที่ส่งผลเข้ามาได้รับการตรวจสอบและรับรองเป็นทางการแล้ว</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-mono uppercase text-[10px] border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">รหัสแมตช์</th>
                        <th className="py-3 px-4">ทัวร์นาเมนต์</th>
                        <th className="py-3 px-4">คู่แข่งขัน &amp; คะแนน</th>
                        <th className="py-3 px-4">กำหนดการ</th>
                        <th className="py-3 px-4 text-center">สถานะ</th>
                        <th className="py-3 px-4 text-right">การตรวจสอบ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {pendingMatches.map((m) => (
                        <tr key={m.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3 px-4 font-mono font-bold text-slate-800">{m.id}</td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-slate-900">{m.tournament?.name || "Tournament"}</span>
                            <span className="block text-[11px] text-slate-500 font-mono">{m.tournament?.category}</span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">
                              {m.homeTeam?.name} <span className="text-[#AF101A] font-mono">{m.homeScore}</span> - <span className="text-[#AF101A] font-mono">{m.awayScore}</span> {m.awayTeam?.name}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                            {m.scheduledAt ? new Date(m.scheduledAt).toLocaleString("th-TH") : "-"}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              {m.resultStatus}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                setAuditModalMatchId(m.id);
                                setAuditModalOpen(true);
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-mono text-xs font-bold transition shadow-xs cursor-pointer"
                            >
                              <ShieldCheck className="w-4 h-4" />
                              <span>ตรวจความครบถ้วนก่อนรับรอง</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Official Match Assignment & Result Certification */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-[#0B1C30] flex items-center gap-2">
                  <ClipboardCheck className="w-5 h-5 text-[#AF101A]" />
                  <span>ค้นหาแมตช์ กำหนดเจ้าหน้าที่ และเปิดแก้ไขผล (Manual Match Audit &amp; Controls)</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  ค้นหารหัสแมตช์เพื่อตรวจสอบความครบถ้วน, มอบหมายผู้ตัดสินโต๊ะเทคนิค หรือเปิดคำร้องแก้ไขผลการแข่งขัน (Dispute Reopen)
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-3">
                  <label className="block text-xs font-mono font-bold text-slate-700 uppercase">
                    รหัสแมตช์ (Match ID)
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="text"
                        value={matchId}
                        onChange={(e) => setMatchId(e.target.value)}
                        placeholder="เช่น match-u18-final หรือ match-01"
                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:border-[#AF101A] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleLoadMatch}
                        disabled={!matchId.trim()}
                        className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-mono font-bold transition disabled:opacity-50 cursor-pointer"
                      >
                        ตรวจสถานะ
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAuditModalMatchId(matchId.trim());
                          setAuditModalOpen(true);
                        }}
                        disabled={!matchId.trim()}
                        className="px-3 py-2 rounded-xl bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 text-xs font-mono font-bold transition disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Audit</span>
                      </button>
                    </div>
                  </label>
                  {matchStatus && (
                    <div className="p-2.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-mono text-slate-800">
                      สถานะแมตช์: <span className="font-bold text-[#AF101A]">{matchStatus}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="block text-xs font-mono font-bold text-slate-700 uppercase">
                    เลือกเจ้าหน้าที่ที่ผ่านการอนุมัติใบอนุญาต
                    <select
                      value={selectedOfficialId}
                      onChange={(e) => setSelectedOfficialId(e.target.value)}
                      className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:border-[#AF101A] focus:outline-none"
                    >
                      <option value="">-- เลือกเจ้าหน้าที่เพื่อมอบหมาย --</option>
                      {approvedOfficialsList.map((official) => (
                        <option key={official.id} value={official.id}>
                          {official.displayName || official.email}
                          {official.officialProfile?.licenseNumber ? ` • ${official.officialProfile.licenseNumber}` : ""}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleAccessAction("ASSIGN_MATCH", { userId: selectedOfficialId, matchId })}
                    disabled={!matchId.trim() || !selectedOfficialId}
                    className="w-full py-2.5 rounded-xl bg-[#0B1C30] hover:bg-[#1A365D] text-white font-mono text-xs font-bold transition disabled:opacity-50 cursor-pointer"
                  >
                    มอบหมายคุมโต๊ะเทคนิคแมตช์นี้
                  </button>
                </div>
              </div>

              {/* Match Result Actions */}
              <div className="pt-4 border-t border-slate-100 flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
                <div className="flex-1 space-y-2 w-full">
                  <label className="block text-xs font-mono font-bold text-slate-700 uppercase">
                    เหตุผลในการเปิดแก้ไขผลแข่งขัน (Dispute / Correction Audit)
                    <input
                      type="text"
                      value={reopenReason}
                      onChange={(e) => setReopenReason(e.target.value)}
                      placeholder="ระบุเหตุผลอย่างน้อย 10 ตัวอักษร เช่น เกิดข้อพิพาทคะแนนควอเตอร์ 4..."
                      className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-sans focus:border-[#AF101A] focus:outline-none"
                    />
                  </label>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setAuditModalMatchId(matchId.trim());
                      setAuditModalOpen(true);
                    }}
                    disabled={!matchId.trim()}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-mono text-xs font-bold transition disabled:opacity-50 shadow-sm cursor-pointer flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>ตรวจความครบถ้วนก่อนรับรอง</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMatchResultAction("APPROVE")}
                    disabled={!matchId.trim()}
                    className="px-4 py-2.5 rounded-xl bg-[#AF101A] hover:bg-[#8F0D15] text-white font-mono text-xs font-bold transition disabled:opacity-50 shadow-sm cursor-pointer"
                  >
                    รับรองผลด่วน
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMatchResultAction("REOPEN")}
                    disabled={!matchId.trim() || reopenReason.trim().length < 10}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-mono text-xs font-bold transition disabled:opacity-50 cursor-pointer"
                  >
                    เปิดแก้ไขผล (Reopen)
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />

      {/* Pre-Approval Match Integrity Audit Modal */}
      {auditModalMatchId && (
        <PreApprovalAuditModal
          isOpen={auditModalOpen}
          onClose={() => setAuditModalOpen(false)}
          matchId={auditModalMatchId}
          onApprovedSuccess={async () => {
            await fetchAccessData();
            await fetchOverview();
            await fetchAuditLogs();
            if (matchId.trim()) void handleLoadMatch();
          }}
          onReopenedSuccess={async () => {
            await fetchAccessData();
            await fetchOverview();
            await fetchAuditLogs();
            if (matchId.trim()) void handleLoadMatch();
          }}
        />
      )}

      {/* Tournament Bracket & Scheduling Engine Modal */}
      {bracketTournamentId && (
        <TournamentBracketManager
          isOpen={bracketModalOpen}
          tournamentId={bracketTournamentId}
          canManage={true}
          onClose={() => setBracketModalOpen(false)}
        />
      )}

      {/* CSV Roster Import & Deduplication Modal */}
      <RosterImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onSuccess={() => {
          fetchRegistrations();
          fetchOverview();
        }}
      />

      {/* Account Lifecycle & Security Modal */}
      <AccountSecurityModal
        isOpen={securityModalOpen}
        onClose={() => setSecurityModalOpen(false)}
        defaultTab={securityModalTab}
      />
    </div>
  );
}

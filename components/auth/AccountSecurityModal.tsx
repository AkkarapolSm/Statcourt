"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  Mail,
  KeyRound,
  Smartphone,
  Laptop,
  LogOut,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  X,
  Clock,
  Check,
  Eye,
  EyeOff,
  UserCheck,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth/useAuthStore";

interface SessionItem {
  id: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
  lastActiveAt: string;
  isCurrent: boolean;
}

interface AccountSecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "EMAIL" | "PASSWORD" | "SESSIONS" | "STEP_UP";
}

export default function AccountSecurityModal({
  isOpen,
  onClose,
  defaultTab = "EMAIL",
}: AccountSecurityModalProps) {
  const { currentUser } = useAuthStore();
  const isAdminOrOfficial = currentUser.role === "ADMIN" || currentUser.role === "OFFICIAL";

  const [activeTab, setActiveTab] = useState<"EMAIL" | "PASSWORD" | "SESSIONS" | "STEP_UP">(defaultTab);

  // Tab 1: Email Verification
  const [emailStatus, setEmailStatus] = useState<{
    email: string;
    isVerified: boolean;
    emailVerifiedAt: string | null;
  } | null>(null);
  const [requestingEmail, setRequestingEmail] = useState(false);
  const [verifyTokenInput, setVerifyTokenInput] = useState("");
  const [confirmingEmail, setConfirmingEmail] = useState(false);

  // Tab 2: Password Change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Tab 3: Sessions
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [revokingSessionId, setRevokingSessionId] = useState<string | null>(null);
  const [revokingOthers, setRevokingOthers] = useState(false);

  // Tab 4: Admin Step-Up
  const [stepUpSecret, setStepUpSecret] = useState("");
  const [isElevated, setIsElevated] = useState(false);
  const [elevating, setElevating] = useState(false);

  // Feedback notifications
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Fetch initial data when opened
  useEffect(() => {
    if (isOpen) {
      fetchEmailStatus();
      fetchSessions();
      if (isAdminOrOfficial) {
        checkStepUpStatus();
      }
    }
  }, [isOpen, isAdminOrOfficial]);

  const fetchEmailStatus = async () => {
    try {
      const res = await fetch("/api/auth/verify-email");
      if (res.ok) {
        const data = await res.json();
        setEmailStatus(data);
      }
    } catch {}
  };

  const fetchSessions = async () => {
    setLoadingSessions(true);
    try {
      const res = await fetch("/api/auth/sessions");
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions || []);
      }
    } catch {}
    finally {
      setLoadingSessions(false);
    }
  };

  const checkStepUpStatus = async () => {
    try {
      const res = await fetch("/api/admin/step-up");
      if (res.ok) {
        const data = await res.json();
        setIsElevated(Boolean(data.isElevated));
      }
    } catch {}
  };

  if (!isOpen) return null;

  // Handler: Request Email Verification
  const handleRequestVerification = async () => {
    setRequestingEmail(true);
    setMessage(null);
    try {
      const res = await fetch("/api/auth/verify-email/request", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({ text: data.message, type: "success" });
        if (data.verificationToken) {
          setVerifyTokenInput(data.verificationToken);
        }
      } else {
        setMessage({ text: data.error || "ขอโทเค็นไม่สำเร็จ", type: "error" });
      }
    } catch {
      setMessage({ text: "เกิดข้อผิดพลาดในการเชื่อมต่อ", type: "error" });
    } finally {
      setRequestingEmail(false);
    }
  };

  // Handler: Confirm Email Verification
  const handleConfirmVerification = async () => {
    if (!verifyTokenInput.trim()) {
      setMessage({ text: "กรุณาระบุรหัสโทเค็นยืนยันอีเมล", type: "error" });
      return;
    }
    setConfirmingEmail(true);
    setMessage(null);
    try {
      const res = await fetch("/api/auth/verify-email/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: verifyTokenInput.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({ text: data.message, type: "success" });
        await fetchEmailStatus();
        setVerifyTokenInput("");
      } else {
        setMessage({ text: data.error || "ยืนยันอีเมลไม่สำเร็จ", type: "error" });
      }
    } catch {
      setMessage({ text: "เกิดข้อผิดพลาดในการเชื่อมต่อ", type: "error" });
    } finally {
      setConfirmingEmail(false);
    }
  };

  // Handler: Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      setMessage({ text: "รหัสผ่านใหม่และการยืนยันไม่ตรงกัน", type: "error" });
      return;
    }
    if (newPassword.length < 12) {
      setMessage({ text: "รหัสผ่านต้องมีความยาวอย่างน้อย 12 ตัวอักษร", type: "error" });
      return;
    }

    setChangingPassword(true);
    setMessage(null);
    try {
      const res = await fetch("/api/auth/password/change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({ text: data.message, type: "success" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
      } else {
        setMessage({ text: data.error || "เปลี่ยนรหัสผ่านไม่สำเร็จ", type: "error" });
      }
    } catch {
      setMessage({ text: "เกิดข้อผิดพลาดในการเชื่อมต่อ", type: "error" });
    } finally {
      setChangingPassword(false);
    }
  };

  // Handler: Revoke Single Session
  const handleRevokeSession = async (sessionId: string) => {
    setRevokingSessionId(sessionId);
    try {
      const res = await fetch(`/api/auth/sessions?id=${sessionId}`, { method: "DELETE" });
      if (res.ok) {
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        setMessage({ text: "ออกจากระบบอุปกรณ์ดังกล่าวเรียบร้อยแล้ว", type: "success" });
      }
    } catch {
      setMessage({ text: "ไม่สามารถออกจากระบบเซสชันนี้ได้", type: "error" });
    } finally {
      setRevokingSessionId(null);
    }
  };

  // Handler: Revoke Other Sessions
  const handleRevokeOthers = async () => {
    setRevokingOthers(true);
    try {
      const res = await fetch("/api/auth/sessions/revoke-others", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({ text: data.message, type: "success" });
        await fetchSessions();
      }
    } catch {
      setMessage({ text: "เกิดข้อผิดพลาดในการปิดเซสชันอุปกรณ์อื่น", type: "error" });
    } finally {
      setRevokingOthers(false);
    }
  };

  // Handler: Admin Step-Up
  const handleAdminStepUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stepUpSecret.trim()) return;

    setElevating(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/step-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secretKeyOrPin: stepUpSecret.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsElevated(true);
        setMessage({ text: data.message, type: "success" });
        setStepUpSecret("");
      } else {
        setMessage({ text: data.error || "รหัสผ่านหรือ PIN ไม่ถูกต้อง", type: "error" });
      }
    } catch {
      setMessage({ text: "เกิดข้อผิดพลาดในการยืนยันสิทธิ์ขั้นสูง", type: "error" });
    } finally {
      setElevating(false);
    }
  };

  // Calculate password strength percentage (0-100)
  const calculatePasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 12) score += 40;
    if (/[A-Z]/.test(pass)) score += 20;
    if (/[a-z]/.test(pass)) score += 15;
    if (/[0-9]/.test(pass)) score += 15;
    if (/[^A-Za-z0-9]/.test(pass)) score += 10;
    return Math.min(100, score);
  };

  const passwordStrength = calculatePasswordStrength(newPassword);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden font-sans text-slate-800">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:px-6 bg-[#071322] border-b border-[#213145] text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#AF101A]/20 border border-[#AF101A]/40 flex items-center justify-center text-red-300 shrink-0">
              <KeyRound className="w-5 h-5 text-[#AF101A]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-red-400 bg-red-400/10 border border-red-400/20 px-2 py-0.5 rounded-full">
                  ACCOUNT LIFECYCLE &amp; SECURITY
                </span>
                <span className="text-slate-400 font-mono text-xs">{currentUser.role}</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-white mt-0.5">
                การจัดการบัญชีและความปลอดภัย
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#213145]/60 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Strip */}
        <div className="flex items-center gap-2 p-3 bg-slate-100 border-b border-slate-200 overflow-x-auto text-xs font-sans shrink-0">
          <button
            onClick={() => { setActiveTab("EMAIL"); setMessage(null); }}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === "EMAIL"
                ? "bg-[#071322] text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>ยืนยันอีเมล</span>
          </button>

          <button
            onClick={() => { setActiveTab("PASSWORD"); setMessage(null); }}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === "PASSWORD"
                ? "bg-[#071322] text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>เปลี่ยนรหัสผ่าน</span>
          </button>

          <button
            onClick={() => { setActiveTab("SESSIONS"); setMessage(null); fetchSessions(); }}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === "SESSIONS"
                ? "bg-[#071322] text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>อุปกรณ์ &amp; เซสชัน ({sessions.length})</span>
          </button>

          {isAdminOrOfficial && (
            <button
              onClick={() => { setActiveTab("STEP_UP"); setMessage(null); checkStepUpStatus(); }}
              className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === "STEP_UP"
                  ? "bg-[#AF101A] text-white shadow-xs"
                  : "text-red-700 bg-red-50 hover:bg-red-100 border border-red-200"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>ยืนยันสิทธิ์ Admin</span>
            </button>
          )}
        </div>

        {/* Feedback Message */}
        {message && (
          <div
            className={`p-3 px-6 text-xs font-sans flex items-center justify-between border-b ${
              message.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-red-50 text-red-800 border-red-200"
            }`}
          >
            <div className="flex items-center gap-2">
              {message.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
            <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-slate-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">

          {/* TAB 1: EMAIL VERIFICATION */}
          {activeTab === "EMAIL" && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-[#AF101A] flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">อีเมลประจำบัญชี:</span>
                    <span className="text-sm font-bold text-slate-900 font-mono">
                      {emailStatus?.email || currentUser.email}
                    </span>
                  </div>

                  <div className="pt-1">
                    {emailStatus?.isVerified ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>ยืนยันอีเมลแล้ว (Verified)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        <span>ยังไม่ยืนยันอีเมล (Pending Verification)</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {!emailStatus?.isVerified && (
                <div className="space-y-4 p-5 rounded-2xl border border-slate-200 bg-white">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-900">
                      ขั้นตอนยืนยันที่อยู่อีเมล
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-sans">
                      กดปุ่มเพื่อรับรหัสยืนยันผ่านอีเมล หรือกรอกรหัสโทเค็น 32 หลักเพื่อยืนยันสถานะบัญชี
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleRequestVerification}
                      disabled={requestingEmail}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#AF101A] hover:bg-[#8E0D15] text-white text-xs font-bold transition shadow-xs disabled:opacity-50 cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${requestingEmail ? "animate-spin" : ""}`} />
                      <span>{requestingEmail ? "กำลังส่งคำขอ..." : "ส่งรหัสยืนยันอีเมล"}</span>
                    </button>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <label className="text-xs font-bold text-slate-700">
                      กรอกรหัสยืนยัน (Verification Token):
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={verifyTokenInput}
                        onChange={(e) => setVerifyTokenInput(e.target.value)}
                        placeholder="วางโทเค็นที่ได้รับจากอีเมล..."
                        className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-[#AF101A]"
                      />
                      <button
                        type="button"
                        onClick={handleConfirmVerification}
                        disabled={confirmingEmail || !verifyTokenInput.trim()}
                        className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition disabled:opacity-50 cursor-pointer"
                      >
                        {confirmingEmail ? "กำลังตรวจสอบ..." : "ยืนยัน"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CHANGE PASSWORD */}
          {activeTab === "PASSWORD" && (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  รหัสผ่านปัจจุบัน (Current Password):
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="กรอกรหัสผ่านปัจจุบัน..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs bg-white pr-10 focus:outline-hidden focus:ring-2 focus:ring-[#AF101A]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  รหัสผ่านใหม่ (New Password):
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="ความยาวอย่างน้อย 12-128 ตัวอักษร..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-[#AF101A]"
                />

                {/* Password Strength Meter */}
                {newPassword && (
                  <div className="pt-1 space-y-1">
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          passwordStrength >= 80
                            ? "bg-emerald-500"
                            : passwordStrength >= 50
                            ? "bg-amber-500"
                            : "bg-[#AF101A]"
                        }`}
                        style={{ width: `${passwordStrength}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 font-sans">
                      <span>ความปลอดภัยของรหัสผ่าน:</span>
                      <span className="font-bold">
                        {passwordStrength >= 80 ? "แข็งแรงมาก" : passwordStrength >= 50 ? "ปานกลาง" : "สั้นเกินไป"}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  ยืนยันรหัสผ่านใหม่ (Confirm New Password):
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="กรอกรหัสผ่านใหม่อีกครั้ง..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-[#AF101A]"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 leading-relaxed font-sans">
                🛡️ มาตรการความปลอดภัย: เมื่อเปลี่ยนรหัสผ่านสำเร็จ เซสชันบนอุปกรณ์อื่นทั้งหมดจะถูกปิดใช้งานทันที
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={changingPassword || newPassword.length < 12 || newPassword !== confirmNewPassword}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#071322] hover:bg-[#0B1C30] text-white text-xs font-bold transition shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  <KeyRound className={`w-3.5 h-3.5 ${changingPassword ? "animate-spin" : ""}`} />
                  <span>{changingPassword ? "กำลังเปลี่ยนรหัสผ่าน..." : "บันทึกรหัสผ่านใหม่"}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: ACTIVE SESSIONS */}
          {activeTab === "SESSIONS" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    อุปกรณ์ที่เข้าสู่ระบบอยู่ในขณะนี้
                  </h3>
                  <p className="text-xs text-slate-500 font-sans">
                    คุณสามารถปิดเซสชันอุปกรณ์ที่ไม่รู้จักเพื่อป้องกันการเข้าถึงที่ไม่ได้รับอนุญาต
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleRevokeOthers}
                    disabled={revokingOthers || sessions.length <= 1}
                    className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold transition disabled:opacity-50 cursor-pointer"
                  >
                    {revokingOthers ? "กำลังออกจากระบบ..." : "ออกจากระบบอุปกรณ์อื่นทั้งหมด"}
                  </button>
                  <button
                    type="button"
                    onClick={fetchSessions}
                    className="p-1.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingSessions ? "animate-spin" : ""}`} />
                  </button>
                </div>
              </div>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                {sessions.map((sess) => (
                  <div
                    key={sess.id}
                    className={`p-4 flex items-center justify-between gap-4 transition ${
                      sess.isCurrent ? "bg-red-50/20" : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          sess.isCurrent
                            ? "bg-[#AF101A] text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {sess.userAgent.toLowerCase().includes("mobile") ? (
                          <Smartphone className="w-4 h-4" />
                        ) : (
                          <Laptop className="w-4 h-4" />
                        )}
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-slate-900">
                            {sess.ipAddress}
                          </span>
                          {sess.isCurrent && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              เซสชันปัจจุบันนี้ (Current)
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 font-sans truncate max-w-sm">
                          {sess.userAgent}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono tabular-nums">
                          เข้าสู่ระบบเมื่อ: {new Date(sess.createdAt).toLocaleString("th-TH")}
                        </p>
                      </div>
                    </div>

                    {!sess.isCurrent && (
                      <button
                        type="button"
                        onClick={() => handleRevokeSession(sess.id)}
                        disabled={revokingSessionId === sess.id}
                        className="px-3 py-1.5 rounded-xl border border-slate-300 hover:border-red-300 hover:bg-red-50 text-slate-600 hover:text-red-700 text-xs font-bold transition shrink-0 cursor-pointer"
                      >
                        {revokingSessionId === sess.id ? "กำลังปิด..." : "ออกจากระบบ"}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: ADMIN STEP-UP ELEVATION */}
          {activeTab === "STEP_UP" && isAdminOrOfficial && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-red-50/70 border border-red-100 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#AF101A] text-white flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-red-950">
                      สถานะการยืนยันสิทธิ์ขั้นสูง (Step-Up Elevation):
                    </span>
                    {isElevated ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                        ACTIVE (ใช้งานได้ 15 นาที)
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[11px] font-bold">
                        INACTIVE (ต้องยืนยันตัวตน)
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-red-900/80 leading-relaxed font-sans">
                    ระบบป้องกันการแก้ไขคำขอสำคัญและการอนุมัติเจ้าหน้าที่ โดยกำหนดให้ Admin ต้องยืนยันรหัสผ่านหรือ PIN ทุก 15 นาที
                  </p>
                </div>
              </div>

              {!isElevated ? (
                <form onSubmit={handleAdminStepUp} className="space-y-3 p-5 rounded-2xl border border-slate-200 bg-white">
                  <label className="text-xs font-bold text-slate-700">
                    กรอกรหัสผ่าน Admin หรือ Official PIN:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="password"
                      value={stepUpSecret}
                      onChange={(e) => setStepUpSecret(e.target.value)}
                      placeholder="รหัสผ่านผู้ดูแลระบบ หรือ PIN 6 หลัก..."
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-[#AF101A]"
                    />
                    <button
                      type="submit"
                      disabled={elevating || !stepUpSecret.trim()}
                      className="px-5 py-2.5 rounded-xl bg-[#AF101A] hover:bg-[#8E0D15] text-white text-xs font-bold transition disabled:opacity-50 cursor-pointer"
                    >
                      {elevating ? "กำลังยืนยัน..." : "ปลดล็อกสิทธิ์"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-sans flex items-center justify-between">
                  <span>✅ บัญชีของคุณได้รับการยกระดับสิทธิ์เรียบร้อยแล้ว สามารถปฏิบัติการสำคัญได้ทันที</span>
                  <button
                    type="button"
                    onClick={() => setIsElevated(false)}
                    className="text-xs font-bold underline hover:text-emerald-950 cursor-pointer"
                  >
                    ล็อกสิทธิ์ทันที
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

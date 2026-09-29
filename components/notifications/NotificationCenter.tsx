"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Bell,
  Check,
  CheckCheck,
  Calendar,
  Clock,
  ClipboardCheck,
  Trophy,
  FileCheck2,
  Trash2,
  RefreshCw,
  ExternalLink,
  X,
  Inbox,
  AlertCircle,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth/useAuthStore";

export interface NotificationItem {
  id: string;
  userId: string;
  type: "SCHEDULE_CHANGE" | "OFFICIAL_ASSIGNMENT" | "MATCH_CERTIFIED" | "REGISTRATION_STATUS" | "SYSTEM";
  title: string;
  message: string;
  link: string | null;
  metadataJson: string | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

export default function NotificationCenter() {
  const { currentUser } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<string>("ALL");
  const [onlyUnread, setOnlyUnread] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    if (!currentUser?.id && !currentUser?.role) return;
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (onlyUnread) query.set("unreadOnly", "true");
      if (filterType !== "ALL") query.set("type", filterType);
      query.set("limit", "25");

      const res = await fetch(`/api/notifications?${query.toString()}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error("[NotificationCenter] fetch failed:", err);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id, currentUser?.role, filterType, onlyUnread]);

  // Initial and reactive load
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Poll notifications periodically (every 45s) when window is focused
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchNotifications();
      }
    }, 45000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Click outside to close popover
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Mark single notification as read
  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id }),
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error("Mark read failed:", err);
    }
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllAsRead: true }),
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
        );
        setUnreadCount(0);
      }
    } catch (err) {
      console.error("Mark all read failed:", err);
    }
  };

  // Delete notification
  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/notifications?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        fetchNotifications();
      }
    } catch (err) {
      console.error("Delete notification failed:", err);
    }
  };

  const getNotificationIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "SCHEDULE_CHANGE":
        return <Clock className="w-4 h-4 text-amber-500" />;
      case "OFFICIAL_ASSIGNMENT":
        return <ClipboardCheck className="w-4 h-4 text-indigo-500" />;
      case "MATCH_CERTIFIED":
        return <Trophy className="w-4 h-4 text-emerald-500" />;
      case "REGISTRATION_STATUS":
        return <FileCheck2 className="w-4 h-4 text-rose-500" />;
      default:
        return <Bell className="w-4 h-4 text-blue-500" />;
    }
  };

  const formatRelativeTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return "เมื่อสักครู่";
      if (diffMins < 60) return `${diffMins} นาทีที่แล้ว`;
      if (diffHours < 24) return `${diffHours} ชม. ที่แล้ว`;
      if (diffDays === 1) return "เมื่อวานนี้";
      if (diffDays < 7) return `${diffDays} วันที่แล้ว`;
      return date.toLocaleDateString("th-TH", { day: "numeric", month: "short" });
    } catch {
      return "";
    }
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        className="relative p-1.5 rounded-lg text-slate-600 hover:text-[#AF101A] hover:bg-slate-100 transition focus:outline-none cursor-pointer"
        title="ศูนย์แจ้งเตือน (Notifications)"
        aria-label="แจ้งเตือน"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] px-1 bg-[#AF101A] text-white text-[10px] font-mono font-black rounded-full flex items-center justify-center shadow-xs animate-in zoom-in-75">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown Flyout */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 font-sans text-slate-800">
          
          {/* Header */}
          <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider">
                ศูนย์การแจ้งเตือน
              </h3>
              {unreadCount > 0 && (
                <span className="bg-[#AF101A] text-white text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full">
                  {unreadCount} ใหม่
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={fetchNotifications}
                disabled={loading}
                title="รีเฟรชข้อมูล"
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              </button>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  title="ทำเครื่องหมายอ่านแล้วทั้งหมด"
                  className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-slate-200 transition flex items-center gap-1 cursor-pointer"
                >
                  <CheckCheck className="w-3 h-3 text-emerald-400" />
                  <span>อ่านทั้งหมด</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Filter Bar */}
          <div className="px-3 py-2 bg-slate-50 border-b border-slate-200/80 flex items-center gap-1.5 overflow-x-auto text-[11px] font-mono shrink-0">
            {[
              { id: "ALL", label: "ทั้งหมด" },
              { id: "SCHEDULE_CHANGE", label: "ตารางแข่ง" },
              { id: "MATCH_CERTIFIED", label: "ผลแข่งขัน" },
              { id: "REGISTRATION_STATUS", label: "ใบสมัคร" },
              { id: "OFFICIAL_ASSIGNMENT", label: "หน้าที่" },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilterType(f.id)}
                className={`px-2 py-0.5 rounded-md whitespace-nowrap transition cursor-pointer ${
                  filterType === f.id
                    ? "bg-[#0B1C30] text-white font-bold"
                    : "text-slate-600 hover:bg-slate-200"
                }`}
              >
                {f.label}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setOnlyUnread(!onlyUnread)}
              className={`ml-auto px-2 py-0.5 rounded-md whitespace-nowrap text-[10px] transition cursor-pointer ${
                onlyUnread
                  ? "bg-[#AF101A] text-white font-bold"
                  : "text-slate-500 hover:bg-slate-200"
              }`}
            >
              เฉพาะยังไม่อ่าน
            </button>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1 divide-y divide-slate-100 max-h-[420px]">
            {loading && notifications.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#AF101A]" />
                <span>กำลังโหลดการแจ้งเตือน...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-12 px-6 text-center text-slate-400 space-y-2">
                <Inbox className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-600">ไม่มีการแจ้งเตือนในขณะนี้</p>
                <p className="text-[11px] text-slate-400">
                  {onlyUnread
                    ? "คุณอ่านข้อความแจ้งเตือนทั้งหมดแล้ว"
                    : "เมื่อมีประกาศตารางแข่ง หรือการรับรองผล จะปรากฏที่นี่"}
                </p>
              </div>
            ) : (
              notifications.map((notif) => {
                const isUnread = !notif.isRead;
                return (
                  <div
                    key={notif.id}
                    onClick={() => {
                      if (isUnread) handleMarkAsRead(notif.id);
                    }}
                    className={`p-3.5 flex items-start gap-3 transition cursor-pointer relative group ${
                      isUnread
                        ? "bg-slate-50/80 hover:bg-slate-100/80"
                        : "hover:bg-slate-50/50"
                    }`}
                  >
                    {/* Unread indicator dot */}
                    {isUnread && (
                      <span className="w-2 h-2 rounded-full bg-[#AF101A] shrink-0 mt-1.5" />
                    )}

                    {/* Icon container */}
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-center shrink-0">
                      {getNotificationIcon(notif.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4
                          className={`text-xs leading-snug line-clamp-1 ${
                            isUnread ? "font-black text-[#0B1C30]" : "font-semibold text-slate-700"
                          }`}
                        >
                          {notif.title}
                        </h4>
                        <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap">
                          {formatRelativeTime(notif.createdAt)}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2">
                        {notif.message}
                      </p>

                      {/* Action Links / Buttons */}
                      <div className="pt-1 flex items-center gap-2">
                        {notif.link && (
                          <Link
                            href={notif.link}
                            onClick={() => {
                              if (isUnread) handleMarkAsRead(notif.id);
                              setIsOpen(false);
                            }}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition"
                          >
                            <span>เปิดดูข้อมูล</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        )}

                        <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5">
                          {isUnread && (
                            <button
                              type="button"
                              onClick={(e) => handleMarkAsRead(notif.id, e)}
                              className="p-1 rounded text-slate-400 hover:text-emerald-600 hover:bg-slate-200 transition"
                              title="ทำเครื่องหมายว่าอ่านแล้ว"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={(e) => handleDelete(notif.id, e)}
                            className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-slate-200 transition"
                            title="ลบการแจ้งเตือน"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer note */}
          <div className="p-2.5 bg-slate-50 border-t border-slate-200/80 text-center text-[10px] font-mono text-slate-400 shrink-0">
            ระบบแจ้งเตือนสหพันธ์บาสเกตบอล StatCourtTH
          </div>
        </div>
      )}
    </div>
  );
}

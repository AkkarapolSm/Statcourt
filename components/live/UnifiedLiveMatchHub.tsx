"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  Trophy,
  MapPin,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Settings,
  Maximize2,
  Send,
  History,
  RefreshCw,
  ShieldCheck,
  FileText,
  Radio,
  Eye,
  Flame,
  Zap,
  CheckCircle2,
  Clock,
  Dribbble,
  Share2,
  QrCode,
  SkipForward,
  SkipBack,
  X,
  MousePointerClick,
  Sparkles,
  Camera,
  Users,
  ChevronRight,
  Printer,
  BadgeCheck,
  Lock,
  UserPlus,
  LogIn,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth/useAuthStore";
import SocialGraphicsGeneratorModal from "@/components/video/SocialGraphicsGeneratorModal";
import DigitalPlayerPassModal from "@/components/athlete/DigitalPlayerPassModal";
import InstantReplayDisputeModal from "@/components/live/InstantReplayDisputeModal";
import { mockDisputeRequests } from "@/lib/db/phase4-data";
import { DisputeRequest } from "@/lib/types";
import { LiveMatchBroadcastState, LivePlayEvent } from "@/lib/live/liveMatchBroker";

interface ChatMessage {
  id: string;
  sender: string;
  badge: string;
  badgeType: "BCC" | "DS" | "STAFF" | "OFFICIAL";
  text: string;
  time: string;
}

export interface FilmClip {
  id: string;
  title: string;
  description: string;
  quarterClock: string;
  videoTimeSec: number;
  playerName: string;
  jerseyNumber: number;
  team: "BCC" | "DS";
  eventType: "3PT_MADE" | "2PT_MADE" | "ASSIST" | "STEAL" | "BLOCK" | "FOUL";
  points: number;
}

interface UnifiedLiveMatchHubProps {
  matchId?: string;
}

export default function UnifiedLiveMatchHub({
  matchId = "match-bcc-ds-01",
}: UnifiedLiveMatchHubProps) {
  // Authentication & Member RBAC
  const { currentUser, loginAs } = useAuthStore();
  const isMember = currentUser.role !== "PUBLIC";

  // Member-only prompt modal state
  const [memberModalConfig, setMemberModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    featureName: string;
  }>({
    isOpen: false,
    title: "",
    description: "",
    featureName: "",
  });

  const promptMemberOnlyFeature = (featureName: string, description?: string) => {
    setMemberModalConfig({
      isOpen: true,
      featureName,
      title: `ฟังก์ชัน ${featureName} สำหรับสมาชิกเท่านั้น`,
      description:
        description ||
        `ในฐานะผู้เข้าชมทั่วไป คุณสามารถรับชมการถ่ายทอดสดแบบ Real-time ได้ฟรี กรุณาสมัครสมาชิกทั่วไป (ฟรีไม่มีค่าธรรมเนียม) เพื่อเปิดสิทธิ์ใช้งาน ${featureName} และมีส่วนร่วมกับคอมมูนิตี้`,
    });
  };

  const handleCourtSwitch = (court: "court-1" | "court-2" | "court-3") => {
    if (court !== "court-1" && !isMember) {
      promptMemberOnlyFeature(
        "รับชมสนามสำรอง (Multi-Court Arena)",
        "การสลับรับชมการแข่งขันสดพร้อมกันหลายคอร์ต (สนาม 2 และ สนาม 3) สงวนสิทธิ์สำหรับสมาชิกทั่วไปขึ้นไป กรุณาสมัครสมาชิกฟรีเพื่อรับชมได้ทุกคอร์ตพร้อมกัน"
      );
      return;
    }
    setActiveCourt(court);
  };

  const handleOpenChallengeModal = () => {
    if (!isMember) {
      promptMemberOnlyFeature(
        "ระบบชาเลนจ์คำตัดสิน (IRS Review)",
        "ระบบตรวจสอบภาพช้าและยื่นคำร้องชาเลนจ์คำตัดสิน FIBA IRS สงวนสิทธิ์สำหรับผู้ฝึกสอน, กรรมการ และสมาชิกที่ผ่านการยืนยันตัวตน"
      );
      return;
    }
    setIsChallengeModalOpen(true);
  };

  const handleOpenSocialModal = () => {
    if (!isMember) {
      promptMemberOnlyFeature(
        "สร้างภาพสรุปคะแนนโซเชียลมีเดีย (Social Card)",
        "ระบบสร้างและส่งออกภาพกราฟิกสรุปคะแนนและ MVP สำหรับแชร์ลงโซเชียลมีเดีย สงวนสิทธิ์สำหรับสมาชิก StatCourtTH"
      );
      return;
    }
    setIsSocialModalOpen(true);
  };

  // Multi-court switcher
  const [activeCourt, setActiveCourt] = useState<"court-1" | "court-2" | "court-3">("court-1");

  // Determine current match ID from active court
  const currentMatchId =
    activeCourt === "court-1"
      ? matchId || "match-bcc-ds-01"
      : activeCourt === "court-2"
      ? "match-ac-sk-02"
      : "tourn-toa-2026";

  // SSE Live Broadcast State
  const [liveState, setLiveState] = useState<LiveMatchBroadcastState | null>(null);
  const [sseConnected, setSseConnected] = useState<boolean>(false);
  const [scoreHighlight, setScoreHighlight] = useState<"home" | "away" | null>(null);

  // Multi-camera switcher
  const [activeCam, setActiveCam] = useState<"CAM1" | "CAM2" | "CAM3">("CAM1");
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  // Right sidebar tab (PROGRAM, LINEUP, CHAT)
  const [activeTab, setActiveTab] = useState<"CHAT" | "PROGRAM" | "LINEUP">("CHAT");
  const [selectedTeamCheer, setSelectedTeamCheer] = useState<"ALL" | "BCC" | "DS">("ALL");
  const [chatInput, setChatInput] = useState("");

  // Modals state
  const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);
  const [matchDisputes, setMatchDisputes] = useState<DisputeRequest[]>(mockDisputeRequests);
  const [selectedPlayerForPass, setSelectedPlayerForPass] = useState<any>(null);

  const handleAddDispute = (newDispute: DisputeRequest) => {
    setMatchDisputes([newDispute, ...matchDisputes]);
  };

  // Click-to-Clip Sequence State
  const [activeClipQueue, setActiveClipQueue] = useState<FilmClip[] | null>(null);
  const [currentClipIndex, setCurrentClipIndex] = useState(0);
  const [simulatedVideoTimestamp, setSimulatedVideoTimestamp] = useState("05:20");

  // Establish real-time SSE stream connection to backend live broker
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let pollInterval: NodeJS.Timeout | null = null;

    try {
      eventSource = new EventSource(`/api/matches/${currentMatchId}/live/sse`);

      eventSource.addEventListener("open", () => {
        setSseConnected(true);
      });

      eventSource.addEventListener("snapshot", (e) => {
        try {
          const data = JSON.parse(e.data);
          setLiveState(data);
          if (data.gameClockDisplay) {
            setSimulatedVideoTimestamp(data.gameClockDisplay);
          }
        } catch (err) {}
      });

      eventSource.addEventListener("update", (e) => {
        try {
          const data = JSON.parse(e.data);
          setLiveState((prev) => {
            if (prev) {
              if (data.homeTeam.score > prev.homeTeam.score) {
                setScoreHighlight("home");
                setTimeout(() => setScoreHighlight(null), 1800);
              } else if (data.awayTeam.score > prev.awayTeam.score) {
                setScoreHighlight("away");
                setTimeout(() => setScoreHighlight(null), 1800);
              }
            }
            return data;
          });
          if (data.gameClockDisplay) {
            setSimulatedVideoTimestamp(data.gameClockDisplay);
          }
        } catch (err) {}
      });

      eventSource.onerror = () => {
        setSseConnected(false);
      };
    } catch {
      setSseConnected(false);
    }

    // High-resilience fallback: poll every 2.5s if SSE is not active
    pollInterval = setInterval(async () => {
      if (!sseConnected) {
        try {
          const res = await fetch(`/api/matches/${currentMatchId}/live`);
          if (res.ok) {
            const json = await res.json();
            if (json.data) {
              setLiveState(json.data);
              if (json.data.gameClockDisplay) {
                setSimulatedVideoTimestamp(json.data.gameClockDisplay);
              }
            }
          }
        } catch {}
      }
    }, 2500);

    return () => {
      if (eventSource) eventSource.close();
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [currentMatchId, sseConnected]);

  // Match Clips Library
  const allMatchClips: FilmClip[] = [
    {
      id: "c-1",
      title: "ช็อต 3 แต้มมุมปีกขวา",
      description: "Kittipong รับบอลส่งจาก Thanakorn แล้วยิง 3 คะแนนลงอย่างแม่นยำ",
      quarterClock: "Q4 05:20",
      videoTimeSec: 320,
      playerName: "Kittipong Rattana.",
      jerseyNumber: 24,
      team: "BCC",
      eventType: "3PT_MADE",
      points: 3,
    },
    {
      id: "c-2",
      title: "สกัดบอลกลางสนาม (Fastbreak Steal)",
      description: "Chayanon อ่านจังหวะจ่ายบอลของ DS ตัดบอลแล้วส่งต่อเร็ว",
      quarterClock: "Q4 06:05",
      videoTimeSec: 280,
      playerName: "Chayanon Wattana",
      jerseyNumber: 11,
      team: "BCC",
      eventType: "STEAL",
      points: 0,
    },
    {
      id: "c-3",
      title: "ไดรฟ์ลุยใต้แป้นวางบอลความเร็วสูง",
      description: "Nattapat เลี้ยงฝ่าวงล้อม 2 คนขึ้นวางบอลฝั่งซ้าย",
      quarterClock: "Q4 06:40",
      videoTimeSec: 250,
      playerName: "Nattapat Sukprasert",
      jerseyNumber: 23,
      team: "DS",
      eventType: "2PT_MADE",
      points: 2,
    },
    {
      id: "c-4",
      title: "Step-back 3 คะแนนสุดสวย",
      description: "Thanakorn หลอกดึงตัวประกบลอยแล้วสเต็ปแบ็กยิงสามแต้ม",
      quarterClock: "Q3 02:15",
      videoTimeSec: 180,
      playerName: "Thanakorn Siriphan",
      jerseyNumber: 7,
      team: "BCC",
      eventType: "3PT_MADE",
      points: 3,
    },
    {
      id: "c-5",
      title: "ช็อตยิงตัดสินเกมช่วง 1.5 วินาทีสุดท้าย",
      description: "Buzzer Beater ชนะเกมส์ในการแข่งขันสาย",
      quarterClock: "Q4 00:01",
      videoTimeSec: 359,
      playerName: "Thanakorn Siriphan",
      jerseyNumber: 7,
      team: "BCC",
      eventType: "2PT_MADE",
      points: 2,
    },
  ];

  // Function to launch Click-to-Clip for a specific player
  const handlePlayPlayerClips = (playerName: string, jersey: number) => {
    if (!isMember) {
      promptMemberOnlyFeature(
        "คลิปรีเพลย์รายบุคคล (Click-to-Clip)",
        "ระบบดูคลิปไฮไลต์ย้อนหลังและการเล่นรายบุคคล (Click-to-Clip) สงวนสิทธิ์สำหรับสมาชิกทั่วไปขึ้นไป กรุณาสมัครสมาชิกฟรีเพื่อเปิดใช้งาน"
      );
      return;
    }
    const playerClips = allMatchClips.filter(
      (c) => c.playerName.includes(playerName) || c.jerseyNumber === jersey
    );
    if (playerClips.length > 0) {
      setActiveClipQueue(playerClips);
      setCurrentClipIndex(0);
      setSimulatedVideoTimestamp(playerClips[0].quarterClock);
      setIsPlaying(true);
    } else {
      setActiveClipQueue(allMatchClips);
      setCurrentClipIndex(0);
      setSimulatedVideoTimestamp(allMatchClips[0].quarterClock);
    }
  };

  const handleSelectSingleEvent = (eventTitle: string, clock: string) => {
    if (!isMember) {
      promptMemberOnlyFeature(
        "คลิปรีเพลย์ย้อนหลัง (Click-to-Clip)",
        "ระบบคลิกดูคลิปย้อนหลังตามเหตุการณ์ Play-by-Play สงวนสิทธิ์สำหรับสมาชิกทั่วไปขึ้นไป กรุณาสมัครสมาชิกฟรีเพื่อเปิดใช้งาน"
      );
      return;
    }
    const matched = allMatchClips.find((c) => c.quarterClock === clock) || allMatchClips[0];
    setActiveClipQueue([matched]);
    setCurrentClipIndex(0);
    setSimulatedVideoTimestamp(clock);
    setIsPlaying(true);
  };

  const handleNextClip = () => {
    if (!activeClipQueue) return;
    if (currentClipIndex < activeClipQueue.length - 1) {
      const nextIdx = currentClipIndex + 1;
      setCurrentClipIndex(nextIdx);
      setSimulatedVideoTimestamp(activeClipQueue[nextIdx].quarterClock);
    }
  };

  const handlePrevClip = () => {
    if (!activeClipQueue) return;
    if (currentClipIndex > 0) {
      const prevIdx = currentClipIndex - 1;
      setCurrentClipIndex(prevIdx);
      setSimulatedVideoTimestamp(activeClipQueue[prevIdx].quarterClock);
    }
  };


  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "BCC_CheerL_07",
      badge: "BCC",
      badgeType: "BCC",
      text: "Thanakorn เบอร์ 7 pick and roll จังหวะนี้เฉียบขาดมาก ดึงแต้มหนีไป!",
      time: "17:21",
    },
    {
      id: "2",
      sender: "DebsirinFanClub",
      badge: "DS",
      badgeType: "DS",
      text: "Nattapat #23 จัดสามแต้มไล่มาหน่อยครับ อย่าเพิ่งยอมแพ้ สู้เต็มที่ลูกแม่รำเพย!",
      time: "17:22",
    },
    {
      id: "3",
      sender: "CoachKorn",
      badge: "STAFF",
      badgeType: "STAFF",
      text: "เวลาที่เหลือทั้งสองทีมเริ่มเล่นช้าลงคุมเพลย์ เน้นป้องกันเข้มข้น",
      time: "17:23",
    },
    {
      id: "4",
      sender: "BCC_Basketball",
      badge: "BCC",
      badgeType: "BCC",
      text: "Bhuripat #15 บล็อคใต้แป้นแน่นมาก เกมรับทำงานสมบูรณ์แบบ",
      time: "17:24",
    },
    {
      id: "5",
      sender: "BSAT_Referee_Off",
      badge: "OFFICIAL",
      badgeType: "OFFICIAL",
      text: "ผู้ตัดสินยืนยันคะแนน 3 แต้มท้าย Q4 ถูกต้องตามสัญญาณเสียง",
      time: "17:25",
    },
  ]);

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const textToSend = chatInput;
    setChatInput("");

    const newMsgObj: ChatMessage = {
      id: Date.now().toString(),
      sender: "Fan_LiveUser",
      badge: selectedTeamCheer === "DS" ? "DS" : "BCC",
      badgeType: selectedTeamCheer === "DS" ? "DS" : "BCC",
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setChatMessages((prev) => [...prev, newMsgObj]);

    // Broadcast to SSE stream for all live viewers
    try {
      await fetch(`/api/matches/${currentMatchId}/live`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SEND_CHAT",
          sender: "Fan_LiveUser",
          badge: selectedTeamCheer === "DS" ? "DS" : "BCC",
          badgeType: selectedTeamCheer === "DS" ? "DS" : "BCC",
          text: textToSend,
        }),
      });
    } catch (err) {
      console.warn("Failed to broadcast chat message:", err);
    }
  };

  const handleOpenPlayerPass = (player: any) => {
    if (!isMember) {
      promptMemberOnlyFeature(
        "ตรวจบัตรประจำตัวนักกีฬา (Digital Player Pass)",
        "ระบบตรวจบัตรประจำตัวนักกีฬาทางการและประวัติ TCAS กีฬา สงวนสิทธิ์สำหรับสมาชิกที่เข้าสู่ระบบ"
      );
      return;
    }
    setSelectedPlayerForPass({
      fullName: player.name,
      fullNameEn: player.nameEn || "ATHLETE VERIFIED",
      jerseyNumber: player.number,
      schoolName: player.team === "BCC" ? "Bangkok Christian College" : "Debsirin School",
      dateOfBirth: "15 ก.ค. 2008",
      verifiedAge: 17,
      eligibleCategory: "U18 (อายุไม่เกิน 18 ปี)",
      nationalIdHashed: "1-1002-XXXXX-92-1",
      tcasBatch: "TCAS 69 (โควตานักกีฬาช้างเผือก)",
      status: "ACTIVE",
      passQrCode: `STC-PASS-${player.team}-${player.number}`,
      issuedBy: "สมาคมกีฬาบาสเกตบอลแห่งประเทศไทย (BSAT)",
      validUntil: "31 ธ.ค. 2026",
    });
    setIsPassModalOpen(true);
  };

  const currentClip = activeClipQueue ? activeClipQueue[currentClipIndex] : null;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* GUEST ACCESS RESTRICTION BANNER (ถ้าไม่ได้เป็นสมาชิก ดู LIVE สดได้อย่างเดียว) */}
      {!isMember && (
        <div className="bg-gradient-to-r from-amber-950/70 via-slate-900 to-amber-950/50 border border-amber-500/40 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-white font-bold text-sm">
                  โหมดผู้เข้าชมทั่วไป (Guest Visitor Mode)
                </span>
                <span className="bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-amber-500/30">
                  ดู LIVE สดฟรี
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 font-sans">
                คุณสามารถรับชมการถ่ายทอดสดฟรีได้ทันที • สมัครสมาชิกทั่วไป (ฟรี) เพื่อเปิดสิทธิ์ร่วมส่งข้อความแชตสด, รีเพลย์คลิปเพลย์ย้อนหลัง และตรวจสอบสถิติเชิงลึก
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto font-mono">
            <Link
              href="/auth/register"
              className="flex-1 sm:flex-none text-center bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>สมัครสมาชิกฟรี</span>
            </Link>
            <button
              type="button"
              onClick={() => loginAs("FAN")}
              className="flex-1 sm:flex-none bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl border border-slate-700 transition cursor-pointer whitespace-nowrap"
              title="คลิกเพื่อจำลองเข้าสู่ระบบเป็น FAN ทันที"
            >
              เข้าสู่ระบบ (FAN)
            </button>
          </div>
        </div>
      )}
      {/* ============================================================== */}
      {/* 1. TOP MULTI-COURT ARENA BAR (STREAMING SYNC 3 COURTS)        */}
      {/* ============================================================== */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800 font-mono text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Radio className="w-4 h-4 text-red-500 animate-pulse" />
            <span className="font-bold text-white uppercase tracking-wider">
              AVAILABLE LIVE COURTS (MULTI-COURT ARENA)
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-mono">
            {sseConnected ? (
              <span className="bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                SSE REAL-TIME SYNCED (&lt; 30ms)
              </span>
            ) : (
              <span className="bg-amber-950/80 text-amber-400 border border-amber-800/80 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                LIVE STREAM SYNC ACTIVE
              </span>
            )}
            <span className="text-slate-400 hidden sm:inline">
              VIEWERS: <span className="text-white font-bold">{liveState?.viewerCount || 2840}</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3">
          {/* Court 1 */}
          <button
            type="button"
            onClick={() => handleCourtSwitch("court-1")}
            className={`p-3 rounded-xl border text-left font-mono transition-all duration-200 cursor-pointer ${
              activeCourt === "court-1"
                ? "bg-red-950/40 border-red-500 text-white shadow-lg shadow-red-950/30"
                : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
            }`}
          >
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="flex items-center gap-1.5 font-bold text-red-400">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                สนาม 1 (MAIN COURT)
              </span>
              <span className="bg-red-600 text-white text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">
                LIVE STREAM
              </span>
            </div>
            <div className="text-sm font-bold text-white">
              {liveState
                ? `${liveState.homeTeam.shortName} (${liveState.homeTeam.score}) vs ${liveState.awayTeam.shortName} (${liveState.awayTeam.score})`
                : "BCC (75) vs DS (63)"}
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
              <span>{liveState ? `${liveState.quarterDisplay} ${liveState.gameClockDisplay}` : "Q4 05:20"}</span>
              <span className="flex items-center gap-1 text-red-400">
                <Eye className="w-3 h-3" />
                {liveState?.viewerCount || 2840} VIEWERS
              </span>
            </div>
          </button>

          {/* Court 2 */}
          <button
            type="button"
            onClick={() => handleCourtSwitch("court-2")}
            className={`p-3 rounded-xl border text-left font-mono transition-all duration-200 cursor-pointer ${
              activeCourt === "court-2"
                ? "bg-red-950/40 border-red-500 text-white shadow-lg shadow-red-950/30"
                : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
            }`}
          >
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="flex items-center gap-1.5 font-bold text-slate-300">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                สนาม 2 (COURT B)
              </span>
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                {!isMember && <Lock className="w-2.5 h-2.5 text-amber-400" />}
                <span>Q3 04:11</span>
              </span>
            </div>
            <div className="text-sm font-bold text-slate-200">ACT (48) vs SK (48)</div>
            <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
              <span>อัสสัมชัญธนบุรี vs สวนกุหลาบ</span>
              <span className="flex items-center gap-1">
                {!isMember && <span className="text-[9px] text-amber-400 uppercase font-bold">MEMBER</span>}
                <span>382 VIEWERS</span>
              </span>
            </div>
          </button>

          {/* Court 3 */}
          <button
            type="button"
            onClick={() => handleCourtSwitch("court-3")}
            className={`p-3 rounded-xl border text-left font-mono transition-all duration-200 cursor-pointer ${
              activeCourt === "court-3"
                ? "bg-red-950/40 border-red-500 text-white shadow-lg shadow-red-950/30"
                : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
            }`}
          >
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="flex items-center gap-1.5 font-bold text-slate-300">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                สนาม 3 (COURT C)
              </span>
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                {!isMember && <Lock className="w-2.5 h-2.5 text-amber-400" />}
                <span>Q2 01:15</span>
              </span>
            </div>
            <div className="text-sm font-bold text-slate-200">CMU (34) vs CHON (38)</div>
            <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
              <span>สาธิต มช. vs ชลราษฎรอำรุง</span>
              <span className="flex items-center gap-1">
                {!isMember && <span className="text-[9px] text-amber-400 uppercase font-bold">MEMBER</span>}
                <span>519 VIEWERS</span>
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. MATCH BROADCAST HEADER BAR                                  */}
      {/* ============================================================== */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5 font-mono text-xs">
            <span className="bg-red-950 text-red-400 border border-red-800 text-[10px] px-2 py-0.5 rounded font-bold uppercase flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              LIVE BROADCAST
            </span>
            <span className="text-slate-400">
              TOA Youth Basketball League Thailand 2026 • U18 Final
            </span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="text-slate-400 hidden sm:inline flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-red-400" />
              สนาม 1 (Main Court) - อาคารนิมิบุตร สนามกีฬาแห่งชาติ
            </span>
          </div>

          <h1 className="font-headline-lg uppercase text-2xl sm:text-3xl font-black text-white tracking-wide">
            BANGKOK CHRISTIAN COLLEGE <span className="text-red-500 font-light text-xl">VS</span> DEBSIRIN SCHOOL
          </h1>
        </div>

        {/* Header Right: Two-Tier Layout (Row 1: Scoreboard, Row 2: Action Buttons) */}
        <div className="flex flex-col items-start lg:items-end gap-2.5 shrink-0">
          {/* Row 1: Quick Score Badge */}
          <div className="bg-slate-950 border border-slate-800 px-4 py-2 rounded-xl flex items-center gap-4 font-mono shadow-inner">
            <div className="text-center">
              <span className="text-[10px] text-slate-400 block font-bold">
                {liveState?.homeTeam.shortName || "BCC"}
              </span>
              <span
                className={`text-2xl font-black text-white transition-all duration-300 inline-block ${
                  scoreHighlight === "home"
                    ? "scale-125 text-red-400 drop-shadow-[0_0_12px_rgba(239,68,68,0.9)] animate-bounce"
                    : ""
                }`}
              >
                {liveState ? liveState.homeTeam.score : 75}
              </span>
            </div>
            <div className="text-slate-600 font-black text-lg">:</div>
            <div className="text-center">
              <span className="text-[10px] text-slate-400 block font-bold">
                {liveState?.awayTeam.shortName || "DS"}
              </span>
              <span
                className={`text-2xl font-black text-white transition-all duration-300 inline-block ${
                  scoreHighlight === "away"
                    ? "scale-125 text-amber-400 drop-shadow-[0_0_12px_rgba(245,158,11,0.9)] animate-bounce"
                    : ""
                }`}
              >
                {liveState ? liveState.awayTeam.score : 63}
              </span>
            </div>
            <div className="pl-3 border-l border-slate-800 text-right">
              <span className="px-1.5 py-0.5 rounded bg-red-600 text-white font-bold text-[10px] block">
                {liveState ? liveState.quarterDisplay : "Q4"}
              </span>
              <span className="text-xs font-bold text-amber-400 mt-0.5 block">
                {liveState ? liveState.gameClockDisplay : "05:20"}
              </span>
            </div>
            {liveState?.shotClockSec !== undefined && (
              <div className="pl-2 border-l border-slate-800/80 text-center">
                <span className="text-[8px] text-amber-400/80 block font-bold">SHOT</span>
                <span
                  className={`text-xs font-bold ${
                    liveState.shotClockSec <= 5
                      ? "text-red-500 animate-pulse font-black"
                      : "text-amber-400"
                  }`}
                >
                  {liveState.shotClockSec}s
                </span>
              </div>
            )}
          </div>

          {/* Row 2: All 3 Action Buttons in One Clean Aligned Row */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 font-mono text-xs">
            {/* Coach's Challenge & Instant Replay (IRS Review) Button */}
            <button
              type="button"
              onClick={handleOpenChallengeModal}
              className="px-3.5 py-2 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-800/80 text-white font-bold transition flex items-center gap-1.5 shadow-md shadow-red-950/40 shrink-0 cursor-pointer whitespace-nowrap"
              title="ระบบชาเลนจ์และตรวจสอบภาพช้าผู้ตัดสิน FIBA IRS"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>ระบบชาเลนจ์ (IRS REVIEW)</span>
              {!isMember ? (
                <Lock className="w-3 h-3 text-amber-400 ml-1" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse ml-0.5" />
              )}
            </button>

            {/* Social Card Modal Button */}
            <button
              type="button"
              onClick={handleOpenSocialModal}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition flex items-center gap-1.5 border border-slate-700 shadow-md shrink-0 cursor-pointer whitespace-nowrap"
              title="สร้างภาพกราฟิกสรุปผลคะแนนสำหรับโซเชียลมีเดีย"
            >
              <Share2 className="w-3.5 h-3.5 text-amber-400" />
              <span>ภาพสรุปโซเชียล (SOCIAL CARD)</span>
              {!isMember && <Lock className="w-3 h-3 text-amber-400 ml-1" />}
            </button>

            {/* Player Pass Modal Button */}
            <button
              type="button"
              onClick={() =>
                handleOpenPlayerPass({
                  name: "ธนากร ศิริพันธ์ (Thanakorn Siriphan)",
                  number: 7,
                  team: "BCC",
                })
              }
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-[#AF101A] hover:from-red-500 hover:to-red-700 text-white font-bold transition flex items-center gap-1.5 shadow-md shadow-red-950/40 shrink-0 cursor-pointer whitespace-nowrap"
              title="ตรวจบัตรประจำตัวนักกีฬาทางการ"
            >
              <BadgeCheck className="w-3.5 h-3.5" />
              <span>ตรวจบัตรนักกีฬา (PLAYER PASS)</span>
              {!isMember && <Lock className="w-3 h-3 text-amber-400 ml-1" />}
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. MAIN BROADCAST GRID: VIDEO PLAYER (8) + SIDEBAR TABS (4)   */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: HD LIVE BROADCAST VIDEO PLAYER (8 COLS) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center group select-none">
            
            {/* Synthetic Basketball Broadcast Background Canvas */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-black">
              {/* Animated Court Lines */}
              <div className="absolute inset-0 court-grid-pattern opacity-15" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-96 h-96 rounded-full border border-red-600/10 pointer-events-none" />
                <div className="w-[500px] h-[300px] border border-amber-500/10 rounded-3xl pointer-events-none" />
              </div>
            </div>

            {/* Top-Left Live Score Ticker Overlay (Screenshot 1 & 2) */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-slate-950/90 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-xl font-mono text-xs shadow-2xl">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="bg-red-600 text-white font-bold text-[10px] px-1.5 py-0.5 rounded">
                {liveState ? liveState.quarterDisplay : "Q4"}
              </span>
              <span className="font-bold text-white">
                {liveState?.homeTeam.shortName || "BCC"}
              </span>
              <span
                className={`font-black text-white text-sm transition-all inline-block ${
                  scoreHighlight === "home" ? "scale-125 text-red-400" : ""
                }`}
              >
                {liveState ? liveState.homeTeam.score : 75}
              </span>
              <span className="text-slate-500">:</span>
              <span
                className={`font-black text-white text-sm transition-all inline-block ${
                  scoreHighlight === "away" ? "scale-125 text-amber-400" : ""
                }`}
              >
                {liveState ? liveState.awayTeam.score : 63}
              </span>
              <span className="font-bold text-slate-300">
                {liveState?.awayTeam.shortName || "DS"}
              </span>
              <span className="text-amber-400 font-bold ml-1">
                {liveState ? liveState.gameClockDisplay : simulatedVideoTimestamp}
              </span>
              {liveState?.shotClockSec !== undefined && (
                <span
                  className={`ml-1 px-1.5 py-0.2 rounded text-[10px] font-bold border ${
                    liveState.shotClockSec <= 5
                      ? "bg-red-950 text-red-400 border-red-800 animate-pulse"
                      : "bg-black/60 text-amber-400 border-amber-800/60"
                  }`}
                >
                  {liveState.shotClockSec}s
                </span>
              )}
            </div>

            {/* Top-Right Player Controls: Camera Switchers */}
            <div className="absolute top-4 right-4 z-20 flex flex-wrap items-center gap-2">
              {/* Camera Switcher Buttons (CAM 1, CAM 2, CAM 3) */}
              <div className="flex items-center bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-xl p-1 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => setActiveCam("CAM1")}
                  className={`px-2.5 py-1 rounded-lg font-bold transition ${
                    activeCam === "CAM1"
                      ? "bg-red-600 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                  title="กล้องหลักมุมกว้าง"
                >
                  CAM 1 (กว้าง)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCam("CAM2")}
                  className={`px-2.5 py-1 rounded-lg font-bold transition ${
                    activeCam === "CAM2"
                      ? "bg-red-600 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                  title="กล้องระดับคอร์ต"
                >
                  CAM 2 (ริมคอร์ต)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCam("CAM3")}
                  className={`px-2.5 py-1 rounded-lg font-bold transition ${
                    activeCam === "CAM3"
                      ? "bg-red-600 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                  title="กล้องหลังแป้นบาส Tactical"
                >
                  CAM 3 (หลังแป้น)
                </button>
              </div>
            </div>

            {/* Center Broadcast Watermark & Status */}
            <div className="text-center space-y-2 pointer-events-none z-10">
              <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-slate-400">
                <Dribbble className="w-8 h-8 opacity-40 animate-spin-slow" />
              </div>
              <div className="font-mono text-xs text-slate-400 tracking-widest uppercase">
                OFFICIAL BROADCAST FEED • 1080P 60FPS
              </div>
              <div className="text-[11px] font-mono text-slate-500">
                COURTSIDE TRACKER: BANGKOK CHRISTIAN VS DEBSIRIN
              </div>
            </div>

            {/* Click-to-Clip Active Video Queue Banner */}
            {currentClip && (
              <div className="absolute bottom-12 inset-x-4 z-20 bg-slate-950/95 border border-red-500/60 p-3 rounded-xl shadow-2xl flex items-center justify-between gap-3 font-mono text-xs animate-slideUp">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center shrink-0">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-red-400 font-bold">
                        ไฮไลท์เพลย์: {currentClip.playerName} (#{currentClip.jerseyNumber})
                      </span>
                      <span className="bg-slate-800 text-slate-300 text-[10px] px-1.5 py-0.5 rounded">
                        {currentClip.quarterClock}
                      </span>
                    </div>
                    <div className="text-slate-300 text-[11px] font-sans mt-0.5">
                      {currentClip.title} — {currentClip.description}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={handlePrevClip}
                    disabled={currentClipIndex === 0}
                    className="p-1.5 rounded bg-slate-800 text-slate-300 hover:text-white disabled:opacity-40"
                    title="คลิปก่อนหน้า"
                  >
                    <SkipBack className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextClip}
                    disabled={
                      !activeClipQueue || currentClipIndex === activeClipQueue.length - 1
                    }
                    className="p-1.5 rounded bg-slate-800 text-slate-300 hover:text-white disabled:opacity-40"
                    title="คลิปถัดไป"
                  >
                    <SkipForward className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveClipQueue(null)}
                    className="p-1.5 rounded bg-red-950 text-red-300 hover:bg-red-900 ml-2"
                    title="ออกจากโหมดคลิป กลับสู่ Live สด"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Bottom Video Controls Bar */}
            <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black via-black/80 to-transparent flex items-center justify-between text-white font-mono text-xs z-10">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                </button>

                <div className="flex items-center gap-2 text-slate-300 text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span>Q4 {simulatedVideoTimestamp}</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-emerald-400 font-bold">LIVE SYNC</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                <span className="hidden sm:inline">อาคารนิมิบุตร สนามกีฬาแห่งชาติ</span>
                <span className="bg-red-600 text-white font-bold text-[9px] px-1.5 py-0.5 rounded">
                  1080p 60fps
                </span>
                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  className="hover:text-white transition"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <button type="button" className="hover:text-white transition">
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: RICH INTERACTIVE SIDEBAR (4 COLS - MERGED TABS) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col h-[520px] shadow-2xl">
          
          {/* Unified Tab Navigation Bar */}
          <div className="px-3 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center gap-1.5 font-mono text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("CHAT")}
              className={`flex-1 py-2 rounded-xl font-bold transition text-center whitespace-nowrap ${
                activeTab === "CHAT"
                  ? "bg-[#AF101A] text-white shadow-md shadow-red-950/40"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              แชตสด ({chatMessages.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("PROGRAM")}
              className={`flex-1 py-2 rounded-xl font-bold transition text-center whitespace-nowrap ${
                activeTab === "PROGRAM"
                  ? "bg-[#AF101A] text-white shadow-md shadow-red-950/40"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              สูจิบัตรดิจิทัล
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("LINEUP")}
              className={`flex-1 py-2 rounded-xl font-bold transition text-center whitespace-nowrap ${
                activeTab === "LINEUP"
                  ? "bg-[#AF101A] text-white shadow-md shadow-red-950/40"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              5 ตัวจริง
            </button>
          </div>

          {/* TAB 1: LIVE CHEER CHAT (Screenshot 2 + 1) */}
          {activeTab === "CHAT" && (
            <div className="flex-1 flex flex-col justify-between p-4 font-mono text-xs overflow-hidden">
              {/* Team Cheer Filter Buttons */}
              <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-[11px]">
                <span className="text-slate-400 text-[10px]">เลือกทีมเชียร์:</span>
                <button
                  type="button"
                  onClick={() => setSelectedTeamCheer("ALL")}
                  className={`px-2.5 py-1 rounded-lg font-bold transition ${
                    selectedTeamCheer === "ALL"
                      ? "bg-slate-700 text-white"
                      : "bg-slate-950 text-slate-400 hover:text-white"
                  }`}
                >
                  ทั้งหมด
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTeamCheer("BCC")}
                  className={`px-2.5 py-1 rounded-lg font-bold transition ${
                    selectedTeamCheer === "BCC"
                      ? "bg-red-600 text-white shadow"
                      : "bg-slate-950 text-red-400 hover:bg-red-950/40"
                  }`}
                >
                  เชียร์ BCC
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTeamCheer("DS")}
                  className={`px-2.5 py-1 rounded-lg font-bold transition ${
                    selectedTeamCheer === "DS"
                      ? "bg-amber-600 text-white shadow"
                      : "bg-slate-950 text-amber-400 hover:bg-amber-950/40"
                  }`}
                >
                  เชียร์ DS
                </button>
              </div>

              {/* Chat Message Stream */}
              <div className="flex-1 overflow-y-auto space-y-2 py-3 pr-1">
                {(liveState?.chatMessages?.length ? liveState.chatMessages : chatMessages)
                  .filter((m) =>
                    selectedTeamCheer === "ALL" ? true : m.badgeType === selectedTeamCheer
                  )
                  .map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-2.5 rounded-xl border text-[11px] space-y-1 ${
                        msg.badgeType === "BCC"
                          ? "bg-red-950/30 border-red-900/60"
                          : msg.badgeType === "DS"
                          ? "bg-amber-950/30 border-amber-900/60"
                          : "bg-slate-950 border-slate-800"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px]">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-1.5 py-0.2 rounded font-bold uppercase ${
                              msg.badgeType === "BCC"
                                ? "bg-red-600 text-white"
                                : msg.badgeType === "DS"
                                ? "bg-amber-600 text-white"
                                : "bg-emerald-700 text-white"
                            }`}
                          >
                            {msg.badge}
                          </span>
                          <span className="font-bold text-white">{msg.sender}</span>
                        </div>
                        <span className="text-slate-500">{msg.time}</span>
                      </div>
                      <p className="font-sans text-xs text-slate-200 leading-relaxed">
                        {msg.text}
                      </p>
                    </div>
                  ))}
              </div>

              {/* Send Chat Form (Members Only) */}
              {!isMember ? (
                <div className="pt-3 border-t border-slate-800 bg-slate-950/80 -mx-4 -mb-4 p-3.5 rounded-b-2xl text-center space-y-1.5 font-mono">
                  <div className="flex items-center justify-center gap-1.5 text-amber-400 font-bold text-xs">
                    <Lock className="w-3.5 h-3.5 shrink-0" />
                    <span>เฉพาะสมาชิกเท่านั้นที่สามารถส่งข้อความแชตได้</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-sans">
                    ผู้เข้าชมทั่วไปสามารถรับชม Live สดและอ่านข้อความแชตได้ฟรี
                  </p>
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <Link
                      href="/auth/register"
                      className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] transition shadow"
                    >
                      สมัครสมาชิกเพื่อแชต
                    </Link>
                    <button
                      type="button"
                      onClick={() => loginAs("FAN")}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold border border-slate-700 transition cursor-pointer"
                    >
                      ล็อกอินด่วน (FAN)
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSendChat} className="pt-3 border-t border-slate-800 flex items-center gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="พิมพ์ข้อความส่งแรงใจเชียร์..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-red-500 transition placeholder:text-slate-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-xs transition flex items-center gap-1 shadow-lg shadow-red-950/40 shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>ส่ง</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: DIGITAL GAME PROGRAM (Screenshot 1) */}
          {activeTab === "PROGRAM" && (
            <div className="p-4 overflow-y-auto flex-1 font-mono text-xs space-y-4">
              {/* QR Code Scan Box */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center space-y-2.5">
                <div className="w-16 h-16 rounded-xl bg-white text-slate-950 p-1 mx-auto flex items-center justify-center shadow-lg">
                  <QrCode className="w-14 h-14" />
                </div>
                <div className="text-xs font-bold text-white uppercase tracking-wider">
                  SCAN FOR DIGITAL GAME PROGRAM
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  ผู้ชมในสนามสามารถสแกน QR Code หน้าโรงยิมเพื่อเปิดสูจิบัตรดิจิทัลและสถิติสดบนมือถือได้แบบเรียลไทม์
                </p>
              </div>

              {/* Head-to-Head */}
              <div className="space-y-2">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                  ข้อมูลคู่แข่งขัน (HEAD-TO-HEAD)
                </span>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-[11px]">
                  <div className="flex justify-between items-center text-white font-bold">
                    <span>Bangkok Christian College</span>
                    <span className="text-emerald-400 font-mono">ชนะ 4 แพ้ 0</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Debsirin School</span>
                    <span className="text-amber-400 font-mono">ชนะ 3 แพ้ 1</span>
                  </div>
                </div>
              </div>

              {/* Match Details */}
              <div className="space-y-1.5 text-[11px] text-slate-400 p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div>
                  ผู้ตัดสินโต๊ะเทคนิค:{" "}
                  <span className="text-white font-bold">BSAT Certified Official Crew</span>
                </div>
                <div>
                  สถานที่:{" "}
                  <span className="text-white font-bold">อาคารนิมิบุตร สนามกีฬาแห่งชาติ ปทุมวัน</span>
                </div>
                <div>
                  เวลาแข่งขัน: <span className="text-amber-300 font-bold">17:00 น. (Final Round)</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: STARTING 5 LINEUP (Screenshot 1 & Custom Stats) */}
          {activeTab === "LINEUP" && (
            <div className="p-4 overflow-y-auto flex-1 font-mono text-xs space-y-4">
              {/* BCC Starting 5 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-red-400 font-bold uppercase tracking-wider block">
                    BCC STARTING 5 (กรุงเทพคริสเตียน)
                  </span>
                  <span className="text-[10px] text-slate-400">
                    ฟาวล์รวมทีม: <b className="text-red-400 font-bold">{liveState?.homeTeam.fouls ?? 4}</b>
                  </span>
                </div>
                <div className="space-y-1.5">
                  {[
                    { number: 7, name: "Thanakorn Siriphan", pos: "PG", pts: 18, ast: 8, reb: 3, fouls: 2 },
                    { number: 11, name: "Chayanon Wattana", pos: "SG", pts: 12, ast: 3, reb: 2, fouls: 1 },
                    { number: 24, name: "Kittipong Rattana.", pos: "SF", pts: 21, ast: 4, reb: 7, fouls: 3 },
                    { number: 15, name: "Bhuripat Kaewmanee", pos: "PF", pts: 14, ast: 1, reb: 9, fouls: 4 },
                    { number: 42, name: "Supanut Charoenrat", pos: "C", pts: 10, ast: 2, reb: 11, fouls: 2 },
                  ].map((rawP) => {
                    const found = liveState?.playerStats?.find((p) => p.number === rawP.number);
                    const p = found ? { ...rawP, pts: found.pts, fouls: found.fouls } : rawP;
                    return (
                      <div
                        key={p.number}
                        className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2 text-white text-[11px]"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="font-bold text-red-400 shrink-0">#{p.number}</span>
                            <span className="font-bold truncate">{p.name}</span>
                            <span className="text-slate-500 text-[10px] shrink-0">({p.pos})</span>
                          </div>
                        </div>

                        {/* Stats: แต้ม, แอสซิส, รีบาว, ฟาว */}
                        <div className="flex items-center gap-1 font-mono text-[10px] shrink-0">
                          <div className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 text-center min-w-[32px]">
                            <span className="text-[8px] text-slate-400 block leading-tight">แต้ม</span>
                            <span className="font-bold text-amber-400">{p.pts}</span>
                          </div>
                          <div className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 text-center min-w-[32px]">
                            <span className="text-[8px] text-slate-400 block leading-tight">แอสซิส</span>
                            <span className="font-bold text-slate-300">{p.ast}</span>
                          </div>
                          <div className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 text-center min-w-[32px]">
                            <span className="text-[8px] text-slate-400 block leading-tight">รีบาว</span>
                            <span className="font-bold text-slate-300">{p.reb}</span>
                          </div>
                          <div className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 text-center min-w-[32px]">
                            <span className="text-[8px] text-slate-400 block leading-tight">ฟาว</span>
                            <span
                              className={`font-bold ${
                                p.fouls >= 4 ? "text-red-400 font-black animate-pulse" : "text-slate-300"
                              }`}
                            >
                              {p.fouls}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* DS Starting 5 */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-amber-400 font-bold uppercase tracking-wider block">
                    DEBSIRIN STARTING 5 (เทพศิรินทร์)
                  </span>
                  <span className="text-[10px] text-slate-400">
                    ฟาวล์รวมทีม: <b className="text-amber-400 font-bold">{liveState?.awayTeam.fouls ?? 3}</b>
                  </span>
                </div>
                <div className="space-y-1.5">
                  {[
                    { number: 23, name: "Nattapat Sukprasert", pos: "SG", pts: 21, ast: 1, reb: 4, fouls: 2 },
                    { number: 34, name: "Teerawat Prasertkul", pos: "PF", pts: 15, ast: 2, reb: 8, fouls: 3 },
                    { number: 5, name: "Kittithat Wongsuwan", pos: "PG", pts: 11, ast: 6, reb: 3, fouls: 1 },
                    { number: 18, name: "Thanatorn Meesuk", pos: "SF", pts: 9, ast: 1, reb: 5, fouls: 2 },
                    { number: 9, name: "Sarawut Bunlert", pos: "C", pts: 7, ast: 0, reb: 10, fouls: 4 },
                  ].map((rawP) => {
                    const found = liveState?.playerStats?.find((p) => p.number === rawP.number);
                    const p = found ? { ...rawP, pts: found.pts, fouls: found.fouls } : rawP;
                    return (
                      <div
                        key={p.number}
                        className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2 text-white text-[11px]"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="font-bold text-amber-400 shrink-0">#{p.number}</span>
                            <span className="font-bold truncate">{p.name}</span>
                            <span className="text-slate-500 text-[10px] shrink-0">({p.pos})</span>
                          </div>
                        </div>

                        {/* Stats: แต้ม, แอสซิส, รีบาว, ฟาว */}
                        <div className="flex items-center gap-1 font-mono text-[10px] shrink-0">
                          <div className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 text-center min-w-[32px]">
                            <span className="text-[8px] text-slate-400 block leading-tight">แต้ม</span>
                            <span className="font-bold text-amber-400">{p.pts}</span>
                          </div>
                          <div className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 text-center min-w-[32px]">
                            <span className="text-[8px] text-slate-400 block leading-tight">แอสซิส</span>
                            <span className="font-bold text-slate-300">{p.ast}</span>
                          </div>
                          <div className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 text-center min-w-[32px]">
                            <span className="text-[8px] text-slate-400 block leading-tight">รีบาว</span>
                            <span className="font-bold text-slate-300">{p.reb}</span>
                          </div>
                          <div className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 text-center min-w-[32px]">
                            <span className="text-[8px] text-slate-400 block leading-tight">ฟาว</span>
                            <span
                              className={`font-bold ${
                                p.fouls >= 4 ? "text-red-400 font-black animate-pulse" : "text-slate-300"
                              }`}
                            >
                              {p.fouls}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* ============================================================== */}
      {/* 4. PLAY-BY-PLAY FEED & FIBA OFFICIAL OPERATOR BOX               */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Play-by-Play Feed (8 Cols - Screenshot 2) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 font-mono text-xs">
            <div className="flex items-center gap-2 text-white font-bold">
              <Clock className="w-4 h-4 text-red-500" />
              <span>ลำดับเหตุการณ์การแข่งขัน (PLAY-BY-PLAY FEED)</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>เรียลไทม์จากโต๊ะเทคนิค BSAT</span>
            </div>
          </div>

          <div className="space-y-2.5 font-mono text-xs">
            {(liveState?.recentEvents?.length ? liveState.recentEvents : allMatchClips).map((clip) => (
              <div
                key={clip.id}
                onClick={() => handleSelectSingleEvent(clip.title, clip.quarterClock)}
                className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-red-500/60 transition-all flex items-center justify-between gap-3 cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="text-center font-bold text-slate-400 shrink-0">
                    <span className="text-[11px] block text-white">{clip.quarterClock}</span>
                    <span className="text-[9px] text-red-400">VIDEO SYNC</span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      clip.team === "BCC" ? "bg-red-600 text-white" : "bg-amber-600 text-white"
                    }`}
                  >
                    #{clip.jerseyNumber}
                  </span>

                  <div>
                    <div className="text-white font-bold group-hover:text-red-400 transition">
                      {clip.playerName} ({clip.team}) — {clip.title}
                    </div>
                    <div className="text-[11px] text-slate-400 font-sans">{clip.description}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-bold text-red-400 flex items-center gap-1 group-hover:scale-105 transition">
                    {!isMember ? <Lock className="w-3 h-3 text-amber-400" /> : <Play className="w-3 h-3 fill-current" />}
                    <span>{!isMember ? "คลิป (สมาชิก)" : "ดูคลิปนี้"}</span>
                  </span>
                  {clip.points > 0 && (
                    <span className="px-2 py-0.5 rounded bg-red-600/20 text-red-400 border border-red-500/40 text-[10px] font-bold">
                      +{clip.points} PTS
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FIBA Official Operator Accreditation Card (4 Cols - Screenshot 2) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4">
          <div className="space-y-3 font-mono">
            <div className="flex items-center gap-2 text-white font-bold text-xs border-b border-slate-800 pb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>เจ้าหน้าที่โต๊ะบันทึกคะแนน FIBA</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-bold text-emerald-400 uppercase text-[11px]">
                  VERIFIED OPERATOR ACCREDITED
                </span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed font-sans">
                ข้อมูลสถิติถูกบันทึกและรับรองเรียลไทม์โดยกรรมการสมาคมกีฬาบาสเกตบอลแห่งประเทศไทย (BSAT)
                สอดคล้องกับมาตรฐาน FIBA LiveStats 2026
              </p>
              <div className="pt-2 border-t border-slate-800/80 space-y-1 text-[11px] text-slate-400 font-mono">
                <div>OPERATOR: <span className="text-white font-bold">BSAT-TABLE-2026-088</span></div>
                <div>TABLE CHIEF: <span className="text-white">อ.สมศักดิ์ วัฒนาเสถียร</span></div>
                <div>LICENSED LEVEL: <span className="text-amber-400 font-bold">NATIONAL LEVEL 1</span></div>
              </div>
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-400">กติกา FIBA 2026:</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              100% COMPLIANT
            </span>
          </div>
        </div>

      </div>

      {/* ============================================================== */}
      {/* 5. CLICK-TO-CLIP BOX SCORE SECTION (Screenshot 2)              */}
      {/* ============================================================== */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800 font-mono text-xs">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>สถิติคลิกระเบียบการเล่นรายบุคคล (CLICK-TO-CLIP BOX SCORE)</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              คลิกที่แถวนักกีฬาเพื่อเปิดเพลย์ลิสต์คลิปวิดีโอต่อเนื่องทันที
            </span>
            <button
              type="button"
              onClick={() => {
                if (!isMember) {
                  promptMemberOnlyFeature(
                    "พิมพ์ใบบันทึกคะแนน (FIBA Scoresheet)",
                    "การพิมพ์และส่งออกใบบันทึกคะแนนมาตรฐานทางการสงวนสิทธิ์สำหรับสมาชิก StatCourtTH"
                  );
                  return;
                }
                if (typeof window !== "undefined") {
                  window.print();
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center gap-1.5 transition text-[11px] border border-slate-700 shadow shrink-0 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>พิมพ์ใบบันทึกคะแนน (PRINT)</span>
              {!isMember && <Lock className="w-3 h-3 text-amber-400" />}
            </button>
          </div>
        </div>

        {/* Box Score Tables Grid (BCC & DS) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-mono text-xs">
          
          {/* BCC Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-red-950/60 border border-red-800/80 px-4 py-2.5 rounded-xl text-white font-bold">
              <span className="tracking-wide">BANGKOK CHRISTIAN COLLEGE (BCC)</span>
              <span className="text-base text-red-400">75 PTS</span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
              <table className="w-full text-left">
                <thead className="bg-slate-900 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">นักกีฬา (คลิกดูคลิป)</th>
                    <th className="py-2.5 px-2 text-center">PTS</th>
                    <th className="py-2.5 px-2 text-center">REB</th>
                    <th className="py-2.5 px-2 text-center">AST</th>
                    <th className="py-2.5 px-2 text-center">FG%</th>
                    <th className="py-2.5 px-2 text-center">PASS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-[11px]">
                  {[
                    { number: 7, name: "Thanakorn Siriphan", pts: 18, reb: 3, ast: 8, fg: "54.5%" },
                    { number: 24, name: "Kittipong Rattana.", pts: 21, reb: 7, ast: 4, fg: "62.5%" },
                    { number: 11, name: "Chayanon Wattana", pts: 12, reb: 2, ast: 3, fg: "45.0%" },
                    { number: 15, name: "Bhuripat Kaewmanee", pts: 14, reb: 9, ast: 1, fg: "50.0%" },
                    { number: 42, name: "Supanut Charoenrat", pts: 10, reb: 11, ast: 2, fg: "48.0%" },
                  ].map((player) => (
                    <tr
                      key={player.number}
                      className="hover:bg-slate-900/80 transition cursor-pointer group"
                      onClick={() => handlePlayPlayerClips(player.name, player.number)}
                    >
                      <td className="py-2.5 px-3 font-bold text-red-400">#{player.number}</td>
                      <td className="py-2.5 px-3 text-white font-bold group-hover:text-red-300">
                        {player.name}
                      </td>
                      <td className="py-2.5 px-2 text-center font-bold text-white">{player.pts}</td>
                      <td className="py-2.5 px-2 text-center text-slate-300">{player.reb}</td>
                      <td className="py-2.5 px-2 text-center text-slate-300">{player.ast}</td>
                      <td className="py-2.5 px-2 text-center text-emerald-400">{player.fg}</td>
                      <td className="py-2.5 px-2 text-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenPlayerPass({ ...player, team: "BCC" });
                          }}
                          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-red-600 text-white text-[9px] font-bold transition"
                        >
                          PASS
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* DS Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-amber-950/60 border border-amber-800/80 px-4 py-2.5 rounded-xl text-white font-bold">
              <span className="tracking-wide">DEBSIRIN SCHOOL (DS)</span>
              <span className="text-base text-amber-400">63 PTS</span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
              <table className="w-full text-left">
                <thead className="bg-slate-900 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">นักกีฬา (คลิกดูคลิป)</th>
                    <th className="py-2.5 px-2 text-center">PTS</th>
                    <th className="py-2.5 px-2 text-center">REB</th>
                    <th className="py-2.5 px-2 text-center">AST</th>
                    <th className="py-2.5 px-2 text-center">FG%</th>
                    <th className="py-2.5 px-2 text-center">PASS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-[11px]">
                  {[
                    { number: 23, name: "Nattapat Sukprasert", pts: 21, reb: 4, ast: 1, fg: "52.0%" },
                    { number: 34, name: "Teerawat Prasertkul", pts: 15, reb: 8, ast: 2, fg: "46.5%" },
                    { number: 5, name: "Kittithat Wongsuwan", pts: 11, reb: 3, ast: 6, fg: "40.0%" },
                    { number: 18, name: "Thanatorn Meesuk", pts: 9, reb: 5, ast: 1, fg: "42.5%" },
                    { number: 9, name: "Sarawut Bunlert", pts: 7, reb: 10, ast: 0, fg: "50.0%" },
                  ].map((player) => (
                    <tr
                      key={player.number}
                      className="hover:bg-slate-900/80 transition cursor-pointer group"
                      onClick={() => handlePlayPlayerClips(player.name, player.number)}
                    >
                      <td className="py-2.5 px-3 font-bold text-amber-400">#{player.number}</td>
                      <td className="py-2.5 px-3 text-white font-bold group-hover:text-amber-300">
                        {player.name}
                      </td>
                      <td className="py-2.5 px-2 text-center font-bold text-white">{player.pts}</td>
                      <td className="py-2.5 px-2 text-center text-slate-300">{player.reb}</td>
                      <td className="py-2.5 px-2 text-center text-slate-300">{player.ast}</td>
                      <td className="py-2.5 px-2 text-center text-emerald-400">{player.fg}</td>
                      <td className="py-2.5 px-2 text-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenPlayerPass({ ...player, team: "DS" });
                          }}
                          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-amber-600 text-white text-[9px] font-bold transition"
                        >
                          PASS
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>

      {/* ============================================================== */}
      {/* 6. MODALS: SOCIAL GRAPHICS & DIGITAL PLAYER PASS               */}
      {/* ============================================================== */}
      <SocialGraphicsGeneratorModal
        isOpen={isSocialModalOpen}
        onClose={() => setIsSocialModalOpen(false)}
        homeTeamName="Bangkok Christian College"
        awayTeamName="Debsirin School"
        homeScore={75}
        awayScore={63}
        tournamentName="TOA Youth Basketball League Thailand 2026"
        mvpPlayer={{
          name: "ธนากร ศิริพันธ์ (Thanakorn Siriphan)",
          number: 7,
          team: "BCC",
          points: 18,
          rebounds: 3,
          assists: 8,
          eff: 24,
          school: "Bangkok Christian College",
        }}
      />

      <DigitalPlayerPassModal
        isOpen={isPassModalOpen}
        onClose={() => setIsPassModalOpen(false)}
        playerData={selectedPlayerForPass || undefined}
      />

      <InstantReplayDisputeModal
        isOpen={isChallengeModalOpen}
        onClose={() => setIsChallengeModalOpen(false)}
        matchId={matchId}
        disputes={matchDisputes}
        onAddDispute={handleAddDispute}
        homeTeamName="Bangkok Christian College"
        awayTeamName="Debsirin School"
      />

      {/* MEMBER-ONLY FEATURE ACCESS PROMPT MODAL */}
      {memberModalConfig.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl p-6 relative overflow-hidden font-mono">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                <Lock className="w-6 h-6" />
              </div>
              <button
                type="button"
                onClick={() => setMemberModalConfig((prev) => ({ ...prev, isOpen: false }))}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h3 className="text-base font-bold text-white mb-2 leading-snug">
              {memberModalConfig.title}
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed mb-6 font-sans">
              {memberModalConfig.description}
            </p>

            <div className="space-y-2">
              <Link
                href="/auth/register"
                onClick={() => setMemberModalConfig((prev) => ({ ...prev, isOpen: false }))}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>สมัครสมาชิกทั่วไปฟรี (เปิดใช้งานทันที)</span>
              </Link>

              <button
                type="button"
                onClick={() => {
                  loginAs("FAN");
                  setMemberModalConfig((prev) => ({ ...prev, isOpen: false }));
                }}
                className="w-full py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4 text-amber-400" />
                <span>จำลองเข้าสู่ระบบทันที (DEMO AS FAN)</span>
              </button>

              <button
                type="button"
                onClick={() => setMemberModalConfig((prev) => ({ ...prev, isOpen: false }))}
                className="w-full py-2 text-center text-xs text-slate-400 hover:text-slate-200 transition cursor-pointer"
              >
                รับชม Live ถ่ายทอดสดต่อไป
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

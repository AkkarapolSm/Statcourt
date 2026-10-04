"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  MapPin,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Send,
  ShieldCheck,
  Radio,
  Eye,
  Flame,
  CheckCircle2,
  Clock,
  Dribbble,
  Share2,
  QrCode,
  SkipForward,
  SkipBack,
  X,
  Sparkles,
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
import { LiveMatchBroadcastState } from "@/lib/live/liveMatchBroker";

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
        `ในฐานะผู้เข้าชมทั่วไป คุณสามารถรับชมการถ่ายทอดสดความละเอียดสูงได้ฟรี กรุณาสมัครสมาชิกทั่วไป (ฟรีไม่มีค่าธรรมเนียม) เพื่อเปิดสิทธิ์ใช้งาน ${featureName} และมีส่วนร่วมในการเชียร์สด`,
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

  // Right sidebar tab (CHAT, PROGRAM, LINEUP)
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
      sender: currentUser.name || "Fan_LiveUser",
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
          sender: currentUser.name || "Fan_LiveUser",
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
    <div className="space-y-4">
      {/* 1. GUEST MODE COMPACT STRIP */}
      {!isMember && (
        <div className="bg-[#0B1C30] border border-[#1E3A5F] rounded-lg px-4 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="p-1 rounded-sm bg-amber-400/15 text-amber-400 shrink-0 border border-amber-400/30">
              <Lock className="w-3.5 h-3.5" />
            </span>
            <div className="font-sans text-slate-300">
              <span className="font-bold text-white mr-1.5">โหมดผู้เข้าชมทั่วไป:</span>
              รับชมสดความละเอียดสูงฟรี • สมัครสมาชิกฟรีเพื่อพิมพ์แชตเชียร์, ดูคลิปรีเพลย์ และตรวจบัตรนักกีฬา
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/auth/register"
              className="bg-[#AF101A] hover:bg-[#8E0D15] text-white font-bold text-xs px-3.5 py-1.5 rounded-sm transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>สมัครสมาชิกฟรี</span>
            </Link>
            <button
              type="button"
              onClick={() => loginAs("FAN")}
              className="bg-[#142338] hover:bg-[#1E3452] text-slate-200 font-semibold text-xs px-3 py-1.5 rounded-sm border border-[#1E3A5F] transition cursor-pointer"
            >
              เข้าสู่ระบบด่วน (FAN)
            </button>
          </div>
        </div>
      )}

      {/* 2. MULTI-COURT ARENA SELECTOR */}
      <div className="bg-[#0B1C30] border border-[#1E3A5F] rounded-lg p-3.5 shadow-xs select-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#1E3A5F] text-xs">
          <div className="flex items-center gap-2 font-mono uppercase tracking-wider text-slate-300">
            <Radio className="w-3.5 h-3.5 text-[#AF101A] animate-pulse" />
            <span className="font-bold text-white">ARENA COURTS SELECTOR</span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
            {sseConnected ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                LIVE SYNC
              </span>
            ) : (
              <span className="text-amber-400 font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                CONNECTED
              </span>
            )}
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              <span>ผู้ชม:</span>
              <strong className="text-white tabular-nums">
                {liveState?.viewerCount ? liveState.viewerCount.toLocaleString() : "2,840"}
              </strong>
            </span>
          </div>
        </div>

        {/* 3 Courts Segmented Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-2.5">
          {/* Court 1 */}
          <button
            type="button"
            onClick={() => handleCourtSwitch("court-1")}
            className={`p-3 rounded-sm border text-left transition cursor-pointer ${
              activeCourt === "court-1"
                ? "bg-[#142338] border-[#AF101A] text-white shadow-xs"
                : "bg-[#081422] border-[#1E3A5F] text-slate-400 hover:border-[#385B88] hover:text-slate-200"
            }`}
          >
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="flex items-center gap-1.5 font-bold font-mono uppercase text-[#AF101A]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#AF101A] animate-pulse" />
                สนาม 1 (MAIN COURT)
              </span>
              <span className="bg-[#AF101A] text-white text-[9px] px-1.5 py-0.5 rounded-sm font-mono font-bold uppercase tracking-wider">
                LIVE
              </span>
            </div>
            <div className="text-sm font-bold text-white flex items-center justify-between font-mono">
              <span>{liveState ? `${liveState.homeTeam.shortName} (${liveState.homeTeam.score}) vs ${liveState.awayTeam.shortName} (${liveState.awayTeam.score})` : "BCC (75) vs DS (63)"}</span>
              <span className="text-slate-400 text-xs font-normal tabular-nums">
                {liveState ? `${liveState.quarterDisplay} ${liveState.gameClockDisplay}` : "Q4 05:20"}
              </span>
            </div>
          </button>

          {/* Court 2 */}
          <button
            type="button"
            onClick={() => handleCourtSwitch("court-2")}
            className={`p-3 rounded-sm border text-left transition cursor-pointer ${
              activeCourt === "court-2"
                ? "bg-[#142338] border-[#AF101A] text-white shadow-xs"
                : "bg-[#081422] border-[#1E3A5F] text-slate-400 hover:border-[#385B88] hover:text-slate-200"
            }`}
          >
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="flex items-center gap-1.5 font-bold font-mono uppercase text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                สนาม 2 (COURT B)
              </span>
              {!isMember && (
                <span className="text-[9px] text-amber-400 uppercase font-bold flex items-center gap-0.5 font-mono">
                  <Lock className="w-2.5 h-2.5" />
                  MEMBER
                </span>
              )}
            </div>
            <div className="text-sm font-bold text-slate-200 flex items-center justify-between font-mono">
              <span>ACT (48) vs SK (48)</span>
              <span className="text-slate-400 text-xs font-normal tabular-nums">Q3 04:11</span>
            </div>
          </button>

          {/* Court 3 */}
          <button
            type="button"
            onClick={() => handleCourtSwitch("court-3")}
            className={`p-3 rounded-sm border text-left transition cursor-pointer ${
              activeCourt === "court-3"
                ? "bg-[#142338] border-[#AF101A] text-white shadow-xs"
                : "bg-[#081422] border-[#1E3A5F] text-slate-400 hover:border-[#385B88] hover:text-slate-200"
            }`}
          >
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="flex items-center gap-1.5 font-bold font-mono uppercase text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                สนาม 3 (COURT C)
              </span>
              {!isMember && (
                <span className="text-[9px] text-amber-400 uppercase font-bold flex items-center gap-0.5 font-mono">
                  <Lock className="w-2.5 h-2.5" />
                  MEMBER
                </span>
              )}
            </div>
            <div className="text-sm font-bold text-slate-200 flex items-center justify-between font-mono">
              <span>CMU (34) vs CHON (38)</span>
              <span className="text-slate-400 text-xs font-normal tabular-nums">Q2 01:15</span>
            </div>
          </button>
        </div>
      </div>

      {/* 3. BROADCAST COMMAND BAR (Scoreboard & Match Details) */}
      <div className="bg-[#0B1C30] border border-[#1E3A5F] rounded-lg p-4 sm:p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Match Identity */}
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="bg-[#AF101A]/20 text-red-200 border border-[#AF101A]/40 text-[10px] px-2 py-0.5 rounded-sm font-mono font-bold uppercase flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#AF101A] animate-pulse" />
              LIVE BROADCAST
            </span>
            <span className="text-slate-300 text-xs font-medium font-sans">
              TOA Youth Basketball League Thailand 2026 • U18 Final
            </span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="text-slate-400 text-xs hidden sm:inline flex items-center gap-1 font-sans">
              <MapPin className="w-3.5 h-3.5 text-[#AF101A]" />
              สนาม 1 (Main Court) - อาคารนิมิบุตร สนามกีฬาแห่งชาติ
            </span>
          </div>

          <h1 className="font-headline uppercase text-2xl sm:text-3xl font-extrabold text-white tracking-wide">
            BANGKOK CHRISTIAN COLLEGE <span className="text-[#AF101A] font-light text-xl sm:text-2xl mx-1.5">VS</span> DEBSIRIN SCHOOL
          </h1>
        </div>

        {/* Scoreboard & Tactical Action Rail */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-3 shrink-0">
          {/* Editorial Score Display */}
          <div className="bg-[#081422] border border-[#1E3A5F] px-4 py-2 rounded-sm flex items-center gap-4">
            <div className="text-center min-w-[48px]">
              <span className="text-[11px] text-slate-400 block font-mono font-bold uppercase tracking-wider">
                {liveState?.homeTeam.shortName || "BCC"}
              </span>
              <span
                className={`text-3xl sm:text-4xl font-mono font-bold text-white tabular-nums transition-all inline-block ${
                  scoreHighlight === "home" ? "scale-110 text-[#AF101A]" : ""
                }`}
              >
                {liveState ? liveState.homeTeam.score : 75}
              </span>
            </div>

            <div className="text-slate-600 font-mono font-bold text-2xl">:</div>

            <div className="text-center min-w-[48px]">
              <span className="text-[11px] text-slate-400 block font-mono font-bold uppercase tracking-wider">
                {liveState?.awayTeam.shortName || "DS"}
              </span>
              <span
                className={`text-3xl sm:text-4xl font-mono font-bold text-white tabular-nums transition-all inline-block ${
                  scoreHighlight === "away" ? "scale-110 text-amber-400" : ""
                }`}
              >
                {liveState ? liveState.awayTeam.score : 63}
              </span>
            </div>

            <div className="pl-3 border-l border-[#1E3A5F] text-right font-mono">
              <span className="px-2 py-0.5 rounded-sm bg-[#AF101A] text-white font-bold text-[10px] block uppercase tracking-wide">
                {liveState ? liveState.quarterDisplay : "Q4"}
              </span>
              <span className="text-sm font-bold text-amber-400 mt-0.5 block tabular-nums">
                {liveState ? liveState.gameClockDisplay : "05:20"}
              </span>
            </div>

            {liveState?.shotClockSec !== undefined && (
              <div className="pl-2 border-l border-[#1E3A5F] text-center font-mono">
                <span className="text-[8px] text-slate-400 block font-bold uppercase">SHOT</span>
                <span
                  className={`text-xs font-bold tabular-nums ${
                    liveState.shotClockSec <= 5
                      ? "text-[#AF101A] animate-pulse font-black"
                      : "text-amber-400"
                  }`}
                >
                  {liveState.shotClockSec}s
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={handleOpenChallengeModal}
              className="px-3 py-1.5 rounded-sm bg-[#142338] hover:bg-[#1E3452] border border-[#1E3A5F] text-white font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="ระบบชาเลนจ์และตรวจสอบภาพช้าผู้ตัดสิน FIBA IRS"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-mono tracking-wide">ชาเลนจ์ (IRS)</span>
              {!isMember && <Lock className="w-3 h-3 text-amber-400" />}
            </button>

            <button
              type="button"
              onClick={handleOpenSocialModal}
              className="px-3 py-1.5 rounded-sm bg-[#142338] hover:bg-[#1E3452] border border-[#1E3A5F] text-white font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="สร้างภาพกราฟิกสรุปผลคะแนนสำหรับโซเชียลมีเดีย"
            >
              <Share2 className="w-3.5 h-3.5 text-slate-300" />
              <span className="font-mono tracking-wide">ภาพสรุป</span>
              {!isMember && <Lock className="w-3 h-3 text-amber-400" />}
            </button>

            <button
              type="button"
              onClick={() =>
                handleOpenPlayerPass({
                  name: "ธนากร ศิริพันธ์ (Thanakorn Siriphan)",
                  number: 7,
                  team: "BCC",
                })
              }
              className="px-3.5 py-1.5 rounded-sm bg-[#AF101A] hover:bg-[#8E0D15] text-white font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="ตรวจบัตรประจำตัวนักกีฬาทางการ"
            >
              <BadgeCheck className="w-3.5 h-3.5" />
              <span className="font-mono tracking-wide">ตรวจบัตรนักกีฬา</span>
              {!isMember && <Lock className="w-3 h-3 text-white/80" />}
            </button>
          </div>
        </div>
      </div>

      {/* 4. MAIN BROADCAST GRID: VIDEO PLAYER (8) + SIDEBAR DOCK (4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT: 16:9 BROADCAST THEATER CANVAS (8 Cols) */}
        <div className="lg:col-span-8 space-y-3">
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden border border-[#1E3A5F] shadow-lg flex items-center justify-center group select-none">
            {/* Arena Canvas Graphic */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#0B1C30] via-[#081422] to-black">
              <div className="absolute inset-0 court-grid-pattern opacity-10 pointer-events-none" />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-80 h-80 rounded-full border border-red-600/10" />
                <div className="w-[480px] h-[280px] border border-amber-500/10 rounded-lg" />
              </div>
            </div>

            {/* Top-Left Live Score Bug */}
            <div className="absolute top-3.5 left-3.5 z-20 flex items-center gap-2 bg-[#0B1C30]/90 backdrop-blur-xs border border-white/10 px-3 py-1.5 rounded-sm font-mono text-xs shadow-md">
              <span className="w-2 h-2 rounded-full bg-[#AF101A] animate-pulse" />
              <span className="bg-[#AF101A] text-white font-bold text-[10px] px-1.5 py-0.2 rounded-sm uppercase">
                {liveState ? liveState.quarterDisplay : "Q4"}
              </span>
              <span className="font-bold text-white tracking-wide">
                {liveState?.homeTeam.shortName || "BCC"}
              </span>
              <span
                className={`font-bold text-white text-sm tabular-nums transition-all inline-block ${
                  scoreHighlight === "home" ? "scale-110 text-[#AF101A]" : ""
                }`}
              >
                {liveState ? liveState.homeTeam.score : 75}
              </span>
              <span className="text-slate-500">:</span>
              <span
                className={`font-bold text-white text-sm tabular-nums transition-all inline-block ${
                  scoreHighlight === "away" ? "scale-110 text-amber-400" : ""
                }`}
              >
                {liveState ? liveState.awayTeam.score : 63}
              </span>
              <span className="font-bold text-slate-300 tracking-wide">
                {liveState?.awayTeam.shortName || "DS"}
              </span>
              <span className="text-amber-400 font-bold ml-1 tabular-nums">
                {liveState ? liveState.gameClockDisplay : simulatedVideoTimestamp}
              </span>
              {liveState?.shotClockSec !== undefined && (
                <span
                  className={`ml-0.5 px-1.5 py-0.2 rounded-sm text-[10px] font-bold tabular-nums border ${
                    liveState.shotClockSec <= 5
                      ? "bg-[#AF101A]/30 text-red-200 border-[#AF101A]/50 animate-pulse"
                      : "bg-black/60 text-amber-400 border-amber-400/40"
                  }`}
                >
                  {liveState.shotClockSec}s
                </span>
              )}
            </div>

            {/* Top-Right Camera Switcher Buttons */}
            <div className="absolute top-3.5 right-3.5 z-20 flex items-center bg-[#0B1C30]/90 backdrop-blur-xs border border-white/10 rounded-sm p-1 font-mono text-xs shadow-md">
              <button
                type="button"
                onClick={() => setActiveCam("CAM1")}
                className={`px-2.5 py-0.5 rounded-sm font-bold transition cursor-pointer ${
                  activeCam === "CAM1"
                    ? "bg-[#AF101A] text-white shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
                title="กล้องหลักมุมกว้าง"
              >
                CAM 1
              </button>
              <button
                type="button"
                onClick={() => setActiveCam("CAM2")}
                className={`px-2.5 py-0.5 rounded-sm font-bold transition cursor-pointer ${
                  activeCam === "CAM2"
                    ? "bg-[#AF101A] text-white shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
                title="กล้องระดับคอร์ต"
              >
                CAM 2
              </button>
              <button
                type="button"
                onClick={() => setActiveCam("CAM3")}
                className={`px-2.5 py-0.5 rounded-sm font-bold transition cursor-pointer ${
                  activeCam === "CAM3"
                    ? "bg-[#AF101A] text-white shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
                title="กล้องหลังแป้นบาส Tactical"
              >
                CAM 3
              </button>
            </div>

            {/* Center Broadcast Watermark */}
            <div className="text-center space-y-1.5 pointer-events-none z-10">
              <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-slate-400">
                <Dribbble className="w-7 h-7 opacity-30 animate-spin-slow" />
              </div>
              <div className="font-mono text-xs text-slate-400 tracking-widest uppercase">
                OFFICIAL BROADCAST FEED • 1080P 60FPS
              </div>
              <div className="text-[11px] text-slate-500 font-sans">
                สัญญาณตรงจากสนามแข่งขัน อาคารนิมิบุตร
              </div>
            </div>

            {/* Click-to-Clip Active Video Banner (Overlay) */}
            {currentClip && (
              <div className="absolute bottom-12 inset-x-3.5 z-20 bg-[#0B1C30]/95 backdrop-blur-xs border border-[#AF101A] p-3 rounded-md shadow-2xl flex items-center justify-between gap-3 text-xs animate-slideUp">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-sm bg-[#AF101A] text-white flex items-center justify-center shrink-0">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-red-200 font-bold font-mono truncate">
                        ไฮไลท์เพลย์: {currentClip.playerName} (#{currentClip.jerseyNumber})
                      </span>
                      <span className="bg-[#142338] text-slate-200 text-[10px] px-1.5 py-0.2 rounded-sm font-mono tabular-nums shrink-0">
                        {currentClip.quarterClock}
                      </span>
                    </div>
                    <div className="text-slate-300 text-[11px] font-sans mt-0.5 truncate">
                      {currentClip.title} — {currentClip.description}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={handlePrevClip}
                    disabled={currentClipIndex === 0}
                    aria-label="คลิปก่อนหน้า"
                    className="p-1.5 rounded-sm bg-[#142338] text-slate-300 hover:text-white disabled:opacity-30 transition cursor-pointer"
                    title="คลิปก่อนหน้า"
                  >
                    <SkipBack className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextClip}
                    disabled={!activeClipQueue || currentClipIndex === activeClipQueue.length - 1}
                    aria-label="คลิปถัดไป"
                    className="p-1.5 rounded-sm bg-[#142338] text-slate-300 hover:text-white disabled:opacity-30 transition cursor-pointer"
                    title="คลิปถัดไป"
                  >
                    <SkipForward className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveClipQueue(null)}
                    aria-label="ปิดโหมดคลิป"
                    className="p-1.5 rounded-sm bg-[#AF101A]/30 text-red-200 hover:bg-[#AF101A] hover:text-white ml-1.5 transition cursor-pointer"
                    title="ออกจากโหมดคลิป กลับสู่ Live สด"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Bottom Controls Bar */}
            <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black via-black/80 to-transparent flex items-center justify-between text-white text-xs z-10 select-none">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  aria-label={isPlaying ? "หยุดชั่วคราว" : "เล่นต่อ"}
                  className="p-1.5 rounded-sm bg-white/10 hover:bg-white/20 transition cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                </button>

                <div className="flex items-center gap-2 text-slate-300 text-xs">
                  <span className="w-2 h-2 rounded-full bg-[#AF101A] animate-pulse" />
                  <span className="font-mono tabular-nums">Q4 {simulatedVideoTimestamp}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-emerald-400 font-mono font-bold">LIVE SYNC</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-400 text-xs">
                <span className="hidden sm:inline font-sans">อาคารนิมิบุตร</span>
                <span className="bg-[#AF101A] text-white font-mono font-bold text-[9px] px-1.5 py-0.5 rounded-sm uppercase">
                  1080p 60fps
                </span>
                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  aria-label={isMuted ? "เปิดเสียง" : "ปิดเสียง"}
                  className="hover:text-white transition cursor-pointer"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  aria-label="ขยายเต็มจอ"
                  className="hover:text-white transition cursor-pointer"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: INTERACTIVE SIDEBAR DOCK (4 Cols) */}
        <div className="lg:col-span-4 bg-[#0B1C30] border border-[#1E3A5F] rounded-lg overflow-hidden flex flex-col h-[520px] shadow-xs">
          {/* Sidebar Tab Bar */}
          <div className="p-1.5 bg-[#081422] border-b border-[#1E3A5F] flex items-center gap-1 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("CHAT")}
              aria-pressed={activeTab === "CHAT"}
              className={`flex-1 py-1.5 rounded-sm font-mono font-bold tracking-wide transition text-center cursor-pointer ${
                activeTab === "CHAT"
                  ? "bg-[#AF101A] text-white shadow-xs"
                  : "text-slate-400 hover:text-white hover:bg-[#142338]"
              }`}
            >
              แชตสด ({chatMessages.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("PROGRAM")}
              aria-pressed={activeTab === "PROGRAM"}
              className={`flex-1 py-1.5 rounded-sm font-mono font-bold tracking-wide transition text-center cursor-pointer ${
                activeTab === "PROGRAM"
                  ? "bg-[#AF101A] text-white shadow-xs"
                  : "text-slate-400 hover:text-white hover:bg-[#142338]"
              }`}
            >
              สูจิบัตรดิจิทัล
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("LINEUP")}
              aria-pressed={activeTab === "LINEUP"}
              className={`flex-1 py-1.5 rounded-sm font-mono font-bold tracking-wide transition text-center cursor-pointer ${
                activeTab === "LINEUP"
                  ? "bg-[#AF101A] text-white shadow-xs"
                  : "text-slate-400 hover:text-white hover:bg-[#142338]"
              }`}
            >
              5 ตัวจริง
            </button>
          </div>

          {/* TAB 1: LIVE CHEER CHAT */}
          {activeTab === "CHAT" && (
            <div className="flex-1 flex flex-col justify-between p-3.5 text-xs overflow-hidden">
              {/* Team Cheer Filter */}
              <div className="flex items-center gap-1.5 pb-2.5 border-b border-[#1E3A5F] text-[11px] font-mono">
                <span className="text-slate-400 text-[10px]">ทีม:</span>
                <button
                  type="button"
                  onClick={() => setSelectedTeamCheer("ALL")}
                  className={`px-2 py-0.5 rounded-sm font-medium transition cursor-pointer ${
                    selectedTeamCheer === "ALL"
                      ? "bg-[#1E3A5F] text-white"
                      : "bg-[#081422] text-slate-400 hover:text-white"
                  }`}
                >
                  ทั้งหมด
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTeamCheer("BCC")}
                  className={`px-2 py-0.5 rounded-sm font-bold transition cursor-pointer ${
                    selectedTeamCheer === "BCC"
                      ? "bg-[#AF101A] text-white shadow-xs"
                      : "bg-[#081422] text-red-300 hover:bg-[#AF101A]/20"
                  }`}
                >
                  เชียร์ BCC
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTeamCheer("DS")}
                  className={`px-2 py-0.5 rounded-sm font-bold transition cursor-pointer ${
                    selectedTeamCheer === "DS"
                      ? "bg-amber-600 text-white shadow-xs"
                      : "bg-[#081422] text-amber-300 hover:bg-amber-600/20"
                  }`}
                >
                  เชียร์ DS
                </button>
              </div>

              {/* Chat Message List */}
              <div className="flex-1 overflow-y-auto broadcast-scrollbar space-y-2 py-2 pr-1.5">
                {(liveState?.chatMessages?.length ? liveState.chatMessages : chatMessages)
                  .filter((m) =>
                    selectedTeamCheer === "ALL" ? true : m.badgeType === selectedTeamCheer
                  )
                  .map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-2.5 rounded-sm border text-xs space-y-1 transition-all ${
                        msg.badgeType === "BCC"
                          ? "bg-[#AF101A]/10 border-[#AF101A]/30"
                          : msg.badgeType === "DS"
                          ? "bg-amber-500/10 border-amber-500/30"
                          : "bg-[#081422] border-[#1E3A5F]"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-1.5 py-0.2 rounded-sm font-mono font-bold uppercase text-[10px] ${
                              msg.badgeType === "BCC"
                                ? "bg-[#AF101A] text-white"
                                : msg.badgeType === "DS"
                                ? "bg-amber-600 text-white"
                                : "bg-emerald-700 text-white"
                            }`}
                          >
                            {msg.badge}
                          </span>
                          <span className="font-bold text-white">{msg.sender}</span>
                        </div>
                        <span className="text-slate-500 font-mono tabular-nums">{msg.time}</span>
                      </div>
                      <p className="font-sans text-xs text-slate-200 leading-relaxed">
                        {msg.text}
                      </p>
                    </div>
                  ))}
              </div>

              {/* Chat Input or Member Gate */}
              {!isMember ? (
                <div className="pt-2 border-t border-[#1E3A5F] bg-[#081422] -mx-3.5 -mb-3.5 p-3 rounded-b-lg text-center space-y-1.5">
                  <div className="flex items-center justify-center gap-1.5 text-amber-400 font-bold text-xs">
                    <Lock className="w-3.5 h-3.5 shrink-0" />
                    <span>เฉพาะสมาชิกเท่านั้นที่สามารถส่งข้อความแชตได้</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 pt-0.5">
                    <Link
                      href="/auth/register"
                      className="px-3.5 py-1 rounded-sm bg-[#AF101A] hover:bg-[#8E0D15] text-white font-bold text-xs transition shadow-xs"
                    >
                      สมัครสมาชิกฟรี
                    </Link>
                    <button
                      type="button"
                      onClick={() => loginAs("FAN")}
                      className="px-3 py-1 rounded-sm bg-[#142338] hover:bg-[#1E3452] text-slate-200 text-xs border border-[#1E3A5F] transition cursor-pointer"
                    >
                      ล็อกอิน (FAN)
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSendChat} className="pt-2.5 border-t border-[#1E3A5F] flex items-center gap-2">
                  <label htmlFor="live-chat-input" className="sr-only">
                    ส่งข้อความเชียร์ในสนาม
                  </label>
                  <input
                    id="live-chat-input"
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="ส่งข้อความเชียร์ในสนาม..."
                    className="flex-1 bg-[#081422] border border-[#1E3A5F] focus:border-[#AF101A] rounded-sm px-3 py-1.5 text-xs text-white outline-none transition placeholder:text-slate-500 font-sans"
                  />
                  <button
                    type="submit"
                    aria-label="ส่งข้อความแชต"
                    className="px-3.5 py-1.5 rounded-sm bg-[#AF101A] hover:bg-[#8E0D15] text-white font-bold text-xs transition flex items-center gap-1 shrink-0 cursor-pointer shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>ส่ง</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: DIGITAL GAME PROGRAM */}
          {activeTab === "PROGRAM" && (
            <div className="p-3.5 overflow-y-auto broadcast-scrollbar flex-1 text-xs space-y-3.5">
              {/* QR Code */}
              <div className="bg-[#081422] p-3.5 rounded-sm border border-[#1E3A5F] text-center space-y-2">
                <div className="w-14 h-14 rounded-sm bg-white text-slate-950 p-1 mx-auto flex items-center justify-center shadow-xs">
                  <QrCode className="w-12 h-12" />
                </div>
                <div className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                  SCAN FOR DIGITAL GAME PROGRAM
                </div>
                <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                  สแกนเพื่อเปิดสูจิบัตรดิจิทัลและสถิติสดบนมือถือได้แบบเรียลไทม์
                </p>
              </div>

              {/* Head-to-Head */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-400 uppercase font-mono font-bold tracking-wider block">
                  HEAD-TO-HEAD
                </span>
                <div className="p-3 rounded-sm bg-[#081422] border border-[#1E3A5F] space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between items-center text-white font-bold">
                    <span>Bangkok Christian College</span>
                    <span className="text-emerald-400 tabular-nums">ชนะ 4 แพ้ 0</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Debsirin School</span>
                    <span className="text-amber-400 tabular-nums">ชนะ 3 แพ้ 1</span>
                  </div>
                </div>
              </div>

              {/* Match Details */}
              <div className="space-y-1.5 text-[11px] text-slate-400 p-3 rounded-sm bg-[#081422] border border-[#1E3A5F] font-sans">
                <div>
                  ผู้ตัดสินโต๊ะเทคนิค: <span className="text-white font-bold">BSAT Certified Official Crew</span>
                </div>
                <div>
                  สถานที่: <span className="text-white font-bold">อาคารนิมิบุตร สนามกีฬาแห่งชาติ</span>
                </div>
                <div>
                  เวลาแข่งขัน: <span className="text-amber-400 font-bold font-mono">17:00 น. (Final Round)</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: STARTING 5 LINEUP */}
          {activeTab === "LINEUP" && (
            <div className="p-3.5 overflow-y-auto broadcast-scrollbar flex-1 text-xs space-y-3.5">
              {/* BCC Starting 5 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-red-300 font-bold font-mono uppercase tracking-wider block">
                    BCC STARTING 5 (กรุงเทพคริสเตียน)
                  </span>
                  <span className="text-[11px] text-slate-400 font-sans">
                    ฟาวล์รวม: <b className="text-red-300 font-bold font-mono tabular-nums">{liveState?.homeTeam.fouls ?? 4}</b>
                  </span>
                </div>
                <div className="space-y-1.5 font-mono">
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
                        className="p-2 rounded-sm bg-[#081422] border border-[#1E3A5F] flex items-center justify-between gap-2 text-white text-xs"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="font-bold text-[#AF101A] shrink-0">#{p.number}</span>
                            <span className="font-medium truncate font-sans">{p.name}</span>
                            <span className="text-slate-500 text-[10px] shrink-0">({p.pos})</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs shrink-0 tabular-nums">
                          <span className="text-amber-400 font-bold">{p.pts} PTS</span>
                          <span className="text-slate-400">{p.reb} REB</span>
                          <span className="text-slate-400">{p.ast} AST</span>
                          <span className={`text-[10px] px-1 rounded-sm ${p.fouls >= 4 ? "bg-[#AF101A] text-white" : "text-slate-400"}`}>
                            {p.fouls} PF
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* DS Starting 5 */}
              <div className="space-y-2 pt-2 border-t border-[#1E3A5F]">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-amber-300 font-bold font-mono uppercase tracking-wider block">
                    DEBSIRIN STARTING 5 (เทพศิรินทร์)
                  </span>
                  <span className="text-[11px] text-slate-400 font-sans">
                    ฟาวล์รวม: <b className="text-amber-300 font-bold font-mono tabular-nums">{liveState?.awayTeam.fouls ?? 3}</b>
                  </span>
                </div>
                <div className="space-y-1.5 font-mono">
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
                        className="p-2 rounded-sm bg-[#081422] border border-[#1E3A5F] flex items-center justify-between gap-2 text-white text-xs"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="font-bold text-amber-400 shrink-0">#{p.number}</span>
                            <span className="font-medium truncate font-sans">{p.name}</span>
                            <span className="text-slate-500 text-[10px] shrink-0">({p.pos})</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs shrink-0 tabular-nums">
                          <span className="text-amber-400 font-bold">{p.pts} PTS</span>
                          <span className="text-slate-400">{p.reb} REB</span>
                          <span className="text-slate-400">{p.ast} AST</span>
                          <span className={`text-[10px] px-1 rounded-sm ${p.fouls >= 4 ? "bg-[#AF101A] text-white" : "text-slate-400"}`}>
                            {p.fouls} PF
                          </span>
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

      {/* 5. PLAY-BY-PLAY FEED & FIBA OFFICIAL OPERATOR BOX */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Play-by-Play Feed (8 Cols) */}
        <div className="lg:col-span-8 bg-[#0B1C30] border border-[#1E3A5F] rounded-lg p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2.5 border-b border-[#1E3A5F] text-xs">
            <div className="flex items-center gap-2 text-white font-bold font-mono uppercase tracking-wider">
              <Clock className="w-4 h-4 text-[#AF101A]" />
              <span>ลำดับเหตุการณ์การแข่งขัน (PLAY-BY-PLAY FEED)</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-sans">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>ซิงก์เรียลไทม์จากโต๊ะเทคนิค BSAT</span>
            </div>
          </div>

          <div className="space-y-2">
            {(liveState?.recentEvents?.length ? liveState.recentEvents : allMatchClips).map((clip) => (
              <div
                key={clip.id}
                onClick={() => handleSelectSingleEvent(clip.title, clip.quarterClock)}
                className="p-3 rounded-sm bg-[#081422] border border-[#1E3A5F] hover:border-[#AF101A] transition flex items-center justify-between gap-3 cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="text-center shrink-0 font-mono">
                    <span className="text-xs block text-white font-bold tabular-nums">{clip.quarterClock}</span>
                    <span className="text-[9px] text-red-300 uppercase font-bold tracking-wide">VIDEO SYNC</span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-sm text-[10px] font-mono font-bold shrink-0 ${
                      clip.team === "BCC" ? "bg-[#AF101A] text-white" : "bg-amber-600 text-white"
                    }`}
                  >
                    #{clip.jerseyNumber}
                  </span>

                  <div className="min-w-0">
                    <div className="text-white text-xs font-bold group-hover:text-red-300 transition font-sans truncate">
                      {clip.playerName} ({clip.team}) — {clip.title}
                    </div>
                    <div className="text-[11px] text-slate-400 font-sans mt-0.5 truncate">{clip.description}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 font-mono">
                  <span className="text-xs font-bold text-red-300 flex items-center gap-1 group-hover:scale-105 transition">
                    {!isMember ? <Lock className="w-3 h-3 text-amber-400" /> : <Play className="w-3 h-3 fill-current" />}
                    <span>{!isMember ? "คลิป (สมาชิก)" : "ดูคลิป"}</span>
                  </span>
                  {clip.points > 0 && (
                    <span className="px-2 py-0.5 rounded-sm bg-[#AF101A]/20 text-red-200 border border-[#AF101A]/40 text-[10px] font-bold tabular-nums">
                      +{clip.points} PTS
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FIBA Official Operator Accreditation Card (4 Cols) */}
        <div className="lg:col-span-4 bg-[#0B1C30] border border-[#1E3A5F] rounded-lg p-4 sm:p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-xs border-b border-[#1E3A5F] pb-2.5 font-mono uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>เจ้าหน้าที่โต๊ะบันทึกคะแนน FIBA</span>
            </div>

            <div className="p-3.5 rounded-sm bg-[#081422] border border-[#1E3A5F] space-y-2.5 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-bold text-emerald-400 uppercase text-[11px] font-mono tracking-wide">
                  VERIFIED OPERATOR ACCREDITED
                </span>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed font-sans">
                ข้อมูลสถิติถูกบันทึกและรับรองเรียลไทม์โดยกรรมการสมาคมกีฬาบาสเกตบอลแห่งประเทศไทย (BSAT)
                สอดคล้องกับมาตรฐาน FIBA LiveStats 2026
              </p>
              <div className="pt-2 border-t border-[#1E3A5F] space-y-1 text-xs text-slate-400 font-sans">
                <div>รหัสเจ้าหน้าที่: <span className="text-white font-mono font-bold">BSAT-TABLE-2026-088</span></div>
                <div>หัวหน้าโต๊ะเทคนิค: <span className="text-white">อ.สมศักดิ์ วัฒนาเสถียร</span></div>
                <div>ระดับใบอนุญาต: <span className="text-amber-400 font-mono font-bold">NATIONAL LEVEL 1</span></div>
              </div>
            </div>
          </div>

          <div className="bg-[#081422] p-3 rounded-sm border border-[#1E3A5F] flex items-center justify-between text-xs">
            <span className="text-slate-400 font-sans">กติกา FIBA 2026:</span>
            <span className="text-emerald-400 font-mono font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              100% COMPLIANT
            </span>
          </div>
        </div>
      </div>

      {/* 6. CLICK-TO-CLIP BOX SCORE SECTION */}
      <div className="bg-[#0B1C30] border border-[#1E3A5F] rounded-lg p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1E3A5F] text-xs">
          <div className="flex items-center gap-2 text-white font-bold font-mono text-sm uppercase tracking-wide">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>สถิติการเล่นรายบุคคล (CLICK-TO-CLIP BOX SCORE)</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 hidden sm:inline font-sans">
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
              className="px-3 py-1.5 rounded-sm bg-[#142338] hover:bg-[#1E3452] text-white font-semibold flex items-center gap-1.5 transition text-xs border border-[#1E3A5F] shadow-xs shrink-0 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="font-mono tracking-wide">พิมพ์ใบบันทึกคะแนน (PRINT)</span>
              {!isMember && <Lock className="w-3 h-3 text-amber-400" />}
            </button>
          </div>
        </div>

        {/* Box Score Tables Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 text-xs font-mono">
          {/* BCC Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between bg-[#142338] border border-[#1E3A5F] px-3.5 py-2 rounded-sm text-white font-bold">
              <span className="tracking-wide">BANGKOK CHRISTIAN COLLEGE (BCC)</span>
              <span className="text-base text-red-300 tabular-nums">75 PTS</span>
            </div>

            <div className="overflow-x-auto rounded-sm border border-[#1E3A5F] bg-[#081422]">
              <table className="w-full text-left">
                <thead className="bg-[#0B1C30] text-slate-400 text-xs uppercase border-b border-[#1E3A5F]">
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-center">#</th>
                    <th className="py-2.5 px-3">นักกีฬา (คลิกดูคลิป)</th>
                    <th className="py-2.5 px-2 w-14 text-right">PTS</th>
                    <th className="py-2.5 px-2 w-12 text-right">REB</th>
                    <th className="py-2.5 px-2 w-12 text-right">AST</th>
                    <th className="py-2.5 px-2 w-16 text-right">FG%</th>
                    <th className="py-2.5 px-2 w-16 text-center">PASS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E3A5F]/60 text-xs">
                  {[
                    { number: 7, name: "Thanakorn Siriphan", pts: 18, reb: 3, ast: 8, fg: "54.5%" },
                    { number: 24, name: "Kittipong Rattana.", pts: 21, reb: 7, ast: 4, fg: "62.5%" },
                    { number: 11, name: "Chayanon Wattana", pts: 12, reb: 2, ast: 3, fg: "45.0%" },
                    { number: 15, name: "Bhuripat Kaewmanee", pts: 14, reb: 9, ast: 1, fg: "50.0%" },
                    { number: 42, name: "Supanut Charoenrat", pts: 10, reb: 11, ast: 2, fg: "48.0%" },
                  ].map((player) => (
                    <tr
                      key={player.number}
                      className="hover:bg-[#142338]/50 transition-colors cursor-pointer group"
                      onClick={() => handlePlayPlayerClips(player.name, player.number)}
                    >
                      <td className="py-2 px-3 font-bold text-center text-[#AF101A]">#{player.number}</td>
                      <td className="py-2 px-3 text-white font-medium group-hover:text-red-300 transition font-sans">
                        {player.name}
                      </td>
                      <td className="py-2 px-2 text-right font-bold text-white tabular-nums">{player.pts}</td>
                      <td className="py-2 px-2 text-right text-slate-300 tabular-nums">{player.reb}</td>
                      <td className="py-2 px-2 text-right text-slate-300 tabular-nums">{player.ast}</td>
                      <td className="py-2 px-2 text-right text-emerald-400 font-bold tabular-nums">{player.fg}</td>
                      <td className="py-2 px-2 text-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenPlayerPass({ ...player, team: "BCC" });
                          }}
                          className="px-2 py-0.5 rounded-sm bg-[#1E3A5F] hover:bg-[#AF101A] text-white text-[10px] font-bold transition cursor-pointer"
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
          <div className="space-y-2">
            <div className="flex items-center justify-between bg-[#142338] border border-[#1E3A5F] px-3.5 py-2 rounded-sm text-white font-bold">
              <span className="tracking-wide">DEBSIRIN SCHOOL (DS)</span>
              <span className="text-base text-amber-300 tabular-nums">63 PTS</span>
            </div>

            <div className="overflow-x-auto rounded-sm border border-[#1E3A5F] bg-[#081422]">
              <table className="w-full text-left">
                <thead className="bg-[#0B1C30] text-slate-400 text-xs uppercase border-b border-[#1E3A5F]">
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-center">#</th>
                    <th className="py-2.5 px-3">นักกีฬา (คลิกดูคลิป)</th>
                    <th className="py-2.5 px-2 w-14 text-right">PTS</th>
                    <th className="py-2.5 px-2 w-12 text-right">REB</th>
                    <th className="py-2.5 px-2 w-12 text-right">AST</th>
                    <th className="py-2.5 px-2 w-16 text-right">FG%</th>
                    <th className="py-2.5 px-2 w-16 text-center">PASS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E3A5F]/60 text-xs">
                  {[
                    { number: 23, name: "Nattapat Sukprasert", pts: 21, reb: 4, ast: 1, fg: "52.0%" },
                    { number: 34, name: "Teerawat Prasertkul", pts: 15, reb: 8, ast: 2, fg: "46.5%" },
                    { number: 5, name: "Kittithat Wongsuwan", pts: 11, reb: 3, ast: 6, fg: "40.0%" },
                    { number: 18, name: "Thanatorn Meesuk", pts: 9, reb: 5, ast: 1, fg: "42.5%" },
                    { number: 9, name: "Sarawut Bunlert", pts: 7, reb: 10, ast: 0, fg: "50.0%" },
                  ].map((player) => (
                    <tr
                      key={player.number}
                      className="hover:bg-[#142338]/50 transition-colors cursor-pointer group"
                      onClick={() => handlePlayPlayerClips(player.name, player.number)}
                    >
                      <td className="py-2 px-3 font-bold text-center text-amber-400">#{player.number}</td>
                      <td className="py-2 px-3 text-white font-medium group-hover:text-amber-300 transition font-sans">
                        {player.name}
                      </td>
                      <td className="py-2 px-2 text-right font-bold text-white tabular-nums">{player.pts}</td>
                      <td className="py-2 px-2 text-right text-slate-300 tabular-nums">{player.reb}</td>
                      <td className="py-2 px-2 text-right text-slate-300 tabular-nums">{player.ast}</td>
                      <td className="py-2 px-2 text-right text-emerald-400 font-bold tabular-nums">{player.fg}</td>
                      <td className="py-2 px-2 text-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenPlayerPass({ ...player, team: "DS" });
                          }}
                          className="px-2 py-0.5 rounded-sm bg-[#1E3A5F] hover:bg-amber-600 text-white text-[10px] font-bold transition cursor-pointer"
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

      {/* 7. MODALS */}
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
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="member-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="bg-[#0B1C30] border border-[#1E3A5F] w-full max-w-md rounded-lg shadow-2xl p-6 relative overflow-hidden">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="w-10 h-10 rounded-sm bg-amber-400/15 border border-amber-400/30 text-amber-400 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <button
                type="button"
                onClick={() => setMemberModalConfig((prev) => ({ ...prev, isOpen: false }))}
                aria-label="ปิดหน้าต่าง"
                className="p-1.5 rounded-sm text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h3 id="member-modal-title" className="text-base font-bold text-white mb-2 leading-snug font-sans">
              {memberModalConfig.title}
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed mb-6 font-sans">
              {memberModalConfig.description}
            </p>

            <div className="space-y-2">
              <Link
                href="/auth/register"
                onClick={() => setMemberModalConfig((prev) => ({ ...prev, isOpen: false }))}
                className="w-full py-2.5 px-4 rounded-sm bg-[#AF101A] hover:bg-[#8E0D15] text-white font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
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
                className="w-full py-2 px-4 rounded-sm bg-[#142338] hover:bg-[#1E3452] text-white font-semibold text-xs border border-[#1E3A5F] transition cursor-pointer flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4 text-amber-400" />
                <span>เข้าสู่ระบบเพื่อใช้งาน</span>
              </button>

              <button
                type="button"
                onClick={() => setMemberModalConfig((prev) => ({ ...prev, isOpen: false }))}
                className="w-full py-1.5 text-center text-xs text-slate-400 hover:text-slate-200 transition cursor-pointer"
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

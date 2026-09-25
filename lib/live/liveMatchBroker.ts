import { prisma } from "@/lib/db/prisma";
import { mockMatch } from "@/lib/db/seed-data";

export interface LiveTeamState {
  id: string;
  name: string;
  shortName: string;
  score: number;
  fouls: number;
  timeoutsRemaining: number;
}

export interface LivePlayEvent {
  id: string;
  quarterClock: string;
  videoTimeSec: number;
  playerName: string;
  jerseyNumber: number;
  team: string;
  eventType: string;
  points: number;
  title: string;
  description: string;
  createdAt: string;
}

export interface LiveChatMessage {
  id: string;
  sender: string;
  badge: string;
  badgeType: "BCC" | "DS" | "STAFF" | "OFFICIAL";
  text: string;
  time: string;
}

export interface LivePlayerStat {
  athleteId: string;
  number: number;
  name: string;
  pos: string;
  pts: number;
  ast: number;
  reb: number;
  fouls: number;
  teamId: string;
}

export interface LiveMatchBroadcastState {
  matchId: string;
  tournamentName: string;
  venue: string;
  homeTeam: LiveTeamState;
  awayTeam: LiveTeamState;
  quarter: number;
  quarterDisplay: string;
  gameClockSec: number;
  gameClockDisplay: string;
  isClockRunning: boolean;
  shotClockSec: number;
  status: "SCHEDULED" | "LIVE" | "HALF_TIME" | "COMPLETED";
  possession: "HOME" | "AWAY" | null;
  lastEvent?: LivePlayEvent;
  recentEvents: LivePlayEvent[];
  chatMessages: LiveChatMessage[];
  playerStats: LivePlayerStat[];
  viewerCount: number;
  officialName: string;
  licenseNumber: string;
  updatedAt: number;
}

type Listener = (state: LiveMatchBroadcastState) => void;

interface BrokerStore {
  states: Map<string, LiveMatchBroadcastState>;
  listeners: Map<string, Set<Listener>>;
}

// Global singleton across Next.js dev server reloads
const globalBroker = globalThis as unknown as {
  __statcourt_live_broker__?: BrokerStore;
};

if (!globalBroker.__statcourt_live_broker__) {
  globalBroker.__statcourt_live_broker__ = {
    states: new Map(),
    listeners: new Map(),
  };
}

const brokerStore = globalBroker.__statcourt_live_broker__;

function formatClock(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function getQuarterDisplay(q: number): string {
  if (q <= 4) return `Q${q}`;
  return `OT${q - 4}`;
}

export async function getLiveState(matchId: string): Promise<LiveMatchBroadcastState> {
  const existing = brokerStore.states.get(matchId);
  if (existing) return existing;

  // Initialize state from SQLite DB if available
  let dbMatch: any = null;
  try {
    dbMatch = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        tournament: true,
        homeTeam: {
          include: {
            roster: {
              include: { athlete: true },
            },
          },
        },
        awayTeam: {
          include: {
            roster: {
              include: { athlete: true },
            },
          },
        },
        events: {
          include: { athlete: true },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });
  } catch (err) {
    console.warn("[LIVE BROKER] DB match lookup warning:", err);
  }

  const homeTeamName = dbMatch?.homeTeam?.name || "Bangkok Christian College";
  const homeShort = dbMatch?.homeTeam?.shortName || "BCC";
  const awayTeamName = dbMatch?.awayTeam?.name || "Debsirin School";
  const awayShort = dbMatch?.awayTeam?.shortName || "DS";

  const defaultEvents: LivePlayEvent[] = [
    {
      id: "ev-init-1",
      quarterClock: "Q4 05:20",
      videoTimeSec: 320,
      playerName: "Kittipong Rattana.",
      jerseyNumber: 24,
      team: "BCC",
      eventType: "THREE_POINT_MADE",
      points: 3,
      title: "ช็อต 3 แต้มมุมปีกขวา",
      description: "Kittipong รับบอลส่งจาก Thanakorn แล้วยิง 3 คะแนนลงอย่างแม่นยำ",
      createdAt: new Date().toISOString(),
    },
    {
      id: "ev-init-2",
      quarterClock: "Q4 06:05",
      videoTimeSec: 280,
      playerName: "Chayanon Wattana",
      jerseyNumber: 11,
      team: "BCC",
      eventType: "STEAL",
      points: 0,
      title: "สกัดบอลกลางสนาม (Fastbreak Steal)",
      description: "Chayanon อ่านจังหวะจ่ายบอลของ DS ตัดบอลแล้วส่งต่อเร็ว",
      createdAt: new Date(Date.now() - 45000).toISOString(),
    },
    {
      id: "ev-init-3",
      quarterClock: "Q4 06:40",
      videoTimeSec: 250,
      playerName: "Nattapat Sukprasert",
      jerseyNumber: 23,
      team: "DS",
      eventType: "TWO_POINT_MADE",
      points: 2,
      title: "ไดรฟ์ลุยใต้แป้นวางบอลความเร็วสูง",
      description: "Nattapat เลี้ยงฝ่าวงล้อม 2 คนขึ้นวางบอลฝั่งซ้าย",
      createdAt: new Date(Date.now() - 90000).toISOString(),
    },
  ];

  const defaultChat: LiveChatMessage[] = [
    {
      id: "chat-1",
      sender: "BCC_CheerL_07",
      badge: "BCC",
      badgeType: "BCC",
      text: "Thanakorn เบอร์ 7 pick and roll จังหวะนี้เฉียบขาดมาก ดึงแต้มหนีไป!",
      time: "17:21",
    },
    {
      id: "chat-2",
      sender: "DebsirinFanClub",
      badge: "DS",
      badgeType: "DS",
      text: "Nattapat #23 จัดสามแต้มไล่มาหน่อยครับ อย่าเพิ่งยอมแพ้ สู้เต็มที่ลูกแม่รำเพย!",
      time: "17:22",
    },
    {
      id: "chat-3",
      sender: "CoachKorn",
      badge: "STAFF",
      badgeType: "STAFF",
      text: "เวลาที่เหลือทั้งสองทีมเริ่มเล่นช้าลงคุมเพลย์ เน้นป้องกันเข้มข้น",
      time: "17:23",
    },
  ];

  const defaultPlayerStats: LivePlayerStat[] = [
    { athleteId: "ath-1", number: 7, name: "Thanakorn Siriphan", pos: "PG", pts: 18, ast: 8, reb: 3, fouls: 2, teamId: "team-bcc" },
    { athleteId: "ath-2", number: 11, name: "Chayanon Wattana", pos: "SG", pts: 12, ast: 3, reb: 2, fouls: 1, teamId: "team-bcc" },
    { athleteId: "ath-3", number: 24, name: "Kittipong Rattana.", pos: "SF", pts: 21, ast: 4, reb: 7, fouls: 3, teamId: "team-bcc" },
    { athleteId: "ath-4", number: 15, name: "Bhuripat Kaewmanee", pos: "PF", pts: 14, ast: 1, reb: 9, fouls: 4, teamId: "team-bcc" },
    { athleteId: "ath-5", number: 42, name: "Supanut Charoenrat", pos: "C", pts: 10, ast: 2, reb: 11, fouls: 2, teamId: "team-bcc" },
    { athleteId: "ath-6", number: 23, name: "Nattapat Sukprasert", pos: "SG", pts: 21, ast: 1, reb: 4, fouls: 2, teamId: "team-debsirin" },
    { athleteId: "ath-7", number: 34, name: "Teerawat Prasertkul", pos: "PF", pts: 15, ast: 2, reb: 8, fouls: 3, teamId: "team-debsirin" },
    { athleteId: "ath-8", number: 5, name: "Kittithat Wongsuwan", pos: "PG", pts: 11, ast: 6, reb: 3, fouls: 1, teamId: "team-debsirin" },
    { athleteId: "ath-9", number: 18, name: "Thanatorn Meesuk", pos: "SF", pts: 9, ast: 1, reb: 5, fouls: 2, teamId: "team-debsirin" },
    { athleteId: "ath-10", number: 9, name: "Sarawut Bunlert", pos: "C", pts: 7, ast: 0, reb: 10, fouls: 4, teamId: "team-debsirin" },
  ];

  const gameClockSec = dbMatch?.gameClockSec !== undefined ? dbMatch.gameClockSec : 320;
  const currentQuarter = dbMatch?.currentQuarter || 4;

  const initialState: LiveMatchBroadcastState = {
    matchId,
    tournamentName: dbMatch?.tournament?.name || "TOA Youth Basketball League Thailand 2026",
    venue: dbMatch?.tournament?.venue || "สนาม 1 (Main Court) - อาคารนิมิบุตร สนามกีฬาแห่งชาติ",
    homeTeam: {
      id: dbMatch?.homeTeamId || "team-bcc",
      name: homeTeamName,
      shortName: homeShort,
      score: dbMatch?.homeScore !== undefined ? dbMatch.homeScore : 75,
      fouls: 4,
      timeoutsRemaining: 2,
    },
    awayTeam: {
      id: dbMatch?.awayTeamId || "team-debsirin",
      name: awayTeamName,
      shortName: awayShort,
      score: dbMatch?.awayScore !== undefined ? dbMatch.awayScore : 63,
      fouls: 3,
      timeoutsRemaining: 1,
    },
    quarter: currentQuarter,
    quarterDisplay: getQuarterDisplay(currentQuarter),
    gameClockSec,
    gameClockDisplay: formatClock(gameClockSec),
    isClockRunning: false,
    shotClockSec: 14,
    status: (dbMatch?.status as any) || "LIVE",
    possession: "HOME",
    lastEvent: defaultEvents[0],
    recentEvents: defaultEvents,
    chatMessages: defaultChat,
    playerStats: defaultPlayerStats,
    viewerCount: 2840,
    officialName: "BSAT Certified Table Official",
    licenseNumber: "BSAT-TABLE-2026-088",
    updatedAt: Date.now(),
  };

  brokerStore.states.set(matchId, initialState);
  return initialState;
}

export async function updateLiveState(
  matchId: string,
  partialOrUpdater:
    | Partial<LiveMatchBroadcastState>
    | ((prev: LiveMatchBroadcastState) => Partial<LiveMatchBroadcastState>)
): Promise<LiveMatchBroadcastState> {
  const current = await getLiveState(matchId);

  const updates =
    typeof partialOrUpdater === "function"
      ? partialOrUpdater(current)
      : partialOrUpdater;

  const nextState: LiveMatchBroadcastState = {
    ...current,
    ...updates,
    homeTeam: {
      ...current.homeTeam,
      ...(updates.homeTeam || {}),
    },
    awayTeam: {
      ...current.awayTeam,
      ...(updates.awayTeam || {}),
    },
    quarterDisplay: updates.quarter !== undefined ? getQuarterDisplay(updates.quarter) : current.quarterDisplay,
    gameClockDisplay:
      updates.gameClockSec !== undefined
        ? formatClock(updates.gameClockSec)
        : current.gameClockDisplay,
    updatedAt: Date.now(),
  };

  brokerStore.states.set(matchId, nextState);
  notifyListeners(matchId, nextState);

  return nextState;
}

export function subscribeToLiveMatch(
  matchId: string,
  listener: Listener
): () => void {
  let listeners = brokerStore.listeners.get(matchId);
  if (!listeners) {
    listeners = new Set<Listener>();
    brokerStore.listeners.set(matchId, listeners);
  }
  listeners.add(listener);

  return () => {
    const list = brokerStore.listeners.get(matchId);
    if (list) {
      list.delete(listener);
      if (list.size === 0) {
        brokerStore.listeners.delete(matchId);
      }
    }
  };
}

function notifyListeners(matchId: string, state: LiveMatchBroadcastState) {
  const listeners = brokerStore.listeners.get(matchId);
  if (listeners) {
    listeners.forEach((listener) => {
      try {
        listener(state);
      } catch (err) {
        console.error("[LIVE BROKER NOTIFY ERROR]:", err);
      }
    });
  }
}

export async function addLiveChatMessage(
  matchId: string,
  msg: Omit<LiveChatMessage, "id" | "time"> & { time?: string }
): Promise<LiveChatMessage> {
  const newMsg: LiveChatMessage = {
    id: `chat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    time:
      msg.time ||
      new Date().toLocaleTimeString("th-TH", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    ...msg,
  };

  await updateLiveState(matchId, (prev) => ({
    chatMessages: [...prev.chatMessages, newMsg].slice(-100),
  }));

  return newMsg;
}

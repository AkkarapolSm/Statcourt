import { prisma } from "../db/prisma.ts";
import { mockMatch } from "../db/seed-data.ts";

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
  badgeType: "BCC" | "DS" | "STAFF" | "OFFICIAL" | "FAN" | "ADMIN" | "COACH" | string;
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
  sequence: number;
}

export interface LiveMatchDelta {
  sequence: number;
  matchId: string;
  type: string;
  timestamp: number;
  [key: string]: any;
}

type Listener = (state: LiveMatchBroadcastState) => void;
type DeltaListener = (delta: LiveMatchDelta) => void;

interface StateEntry {
  state: LiveMatchBroadcastState;
  lastAccessedAt: number;
  sequence: number;
}

interface BrokerStore {
  states: Map<string, StateEntry>;
  listeners: Map<string, Set<Listener>>;
  deltaListeners: Map<string, Set<DeltaListener>>;
}

const MAX_CACHED_MATCHES = 100;
const MATCH_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours of inactivity before eviction

// Global singleton across Next.js server reloads
const globalBroker = globalThis as unknown as {
  __statcourt_live_broker__?: BrokerStore;
};

if (!globalBroker.__statcourt_live_broker__) {
  globalBroker.__statcourt_live_broker__ = {
    states: new Map(),
    listeners: new Map(),
    deltaListeners: new Map(),
  };
} else {
  if (!globalBroker.__statcourt_live_broker__.states) {
    globalBroker.__statcourt_live_broker__.states = new Map();
  }
  if (!globalBroker.__statcourt_live_broker__.listeners) {
    globalBroker.__statcourt_live_broker__.listeners = new Map();
  }
  if (!globalBroker.__statcourt_live_broker__.deltaListeners) {
    globalBroker.__statcourt_live_broker__.deltaListeners = new Map();
  }
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

/**
 * LRU / TTL eviction routine to keep in-memory broker state bounded
 */
function evictStaleMatches(): void {
  const now = Date.now();
  brokerStore.states.forEach((val, matchId) => {
    const listeners = brokerStore.listeners?.get(matchId);
    const hasListeners = listeners && listeners.size > 0;
    const lastAccessed = (val as any)?.lastAccessedAt || now;
    if (!hasListeners && now - lastAccessed > MATCH_TTL_MS) {
      brokerStore.states.delete(matchId);
      brokerStore.listeners?.delete(matchId);
      brokerStore.deltaListeners?.delete(matchId);
    }
  });

  if (brokerStore.states.size > MAX_CACHED_MATCHES) {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;
    brokerStore.states.forEach((val, key) => {
      const listeners = brokerStore.listeners?.get(key);
      const lastAccessed = (val as any)?.lastAccessedAt || now;
      if ((!listeners || listeners.size === 0) && lastAccessed < oldestTime) {
        oldestTime = lastAccessed;
        oldestKey = key;
      }
    });
    if (oldestKey) {
      brokerStore.states.delete(oldestKey);
      brokerStore.listeners?.delete(oldestKey);
      brokerStore.deltaListeners?.delete(oldestKey);
    }
  }
}

/**
 * Explicitly evicts a match state from memory (e.g. for testing database hydration)
 */
export function evictLiveMatchState(matchId: string): void {
  brokerStore.states.delete(matchId);
}

/**
 * Retrieves the live broadcast state.
 * If not present in memory (due to server restart or cold cache),
 * automatically and authoritatively hydrates from SQLite / PostgreSQL database.
 */
export async function getLiveState(matchId: string): Promise<LiveMatchBroadcastState> {
  const existing = brokerStore.states.get(matchId);
  if (existing) {
    if ((existing as any).state) {
      existing.lastAccessedAt = Date.now();
      return (existing as any).state;
    }
    return existing as unknown as LiveMatchBroadcastState;
  }

  // 1. Authoritative Hydration from Database
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
          where: { reversedAt: null },
          include: { athlete: true },
          orderBy: { createdAt: "desc" },
          take: 30,
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

  // Reconstruct live events from DB if available
  let hydratedEvents: LivePlayEvent[] = [];
  if (dbMatch?.events && dbMatch.events.length > 0) {
    hydratedEvents = dbMatch.events.map((e: any) => ({
      id: e.id,
      quarterClock: e.gameClockDisplay,
      videoTimeSec: e.videoElapsedSec || 0,
      playerName: e.athlete ? `${e.athlete.firstName} ${e.athlete.lastName}` : "Player",
      jerseyNumber: e.athlete?.jerseyNumber || 0,
      team: e.teamId === dbMatch.homeTeamId ? "HOME" : "AWAY",
      eventType: e.eventType,
      points: e.points,
      title: e.eventType.replace(/_/g, " "),
      description: "",
      createdAt: e.createdAt.toISOString(),
    }));
  } else {
    hydratedEvents = [
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
    ];
  }

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
      text: "Nattapat #23 จัดสามแต้มไล่มาหน่อยครับ สู้เต็มที่ลูกแม่รำเพย!",
      time: "17:22",
    },
  ];

  const defaultPlayerStats: LivePlayerStat[] = [
    { athleteId: "ath-1", number: 7, name: "Thanakorn Siriphan", pos: "PG", pts: 18, ast: 8, reb: 3, fouls: 2, teamId: "team-bcc" },
    { athleteId: "ath-2", number: 11, name: "Chayanon Wattana", pos: "SG", pts: 12, ast: 3, reb: 2, fouls: 1, teamId: "team-bcc" },
    { athleteId: "ath-6", number: 23, name: "Nattapat Sukprasert", pos: "SG", pts: 21, ast: 1, reb: 4, fouls: 2, teamId: "team-debsirin" },
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
    lastEvent: hydratedEvents[0],
    recentEvents: hydratedEvents,
    chatMessages: defaultChat,
    playerStats: defaultPlayerStats,
    viewerCount: 2840,
    officialName: "BSAT Certified Table Official",
    licenseNumber: "BSAT-TABLE-2026-088",
    updatedAt: Date.now(),
    sequence: 1,
  };

  brokerStore.states.set(matchId, {
    state: initialState,
    lastAccessedAt: Date.now(),
    sequence: 1,
  });

  evictStaleMatches();
  return initialState;
}

/**
 * Updates match broadcast state with sequence numbering and notifies listeners
 */
export async function updateLiveState(
  matchId: string,
  partialOrUpdater:
    | Partial<LiveMatchBroadcastState>
    | ((prev: LiveMatchBroadcastState) => Partial<LiveMatchBroadcastState>)
): Promise<LiveMatchBroadcastState> {
  const current = await getLiveState(matchId);
  const entry = brokerStore.states.get(matchId);
  const nextSeq = (entry ? entry.sequence : current.sequence) + 1;

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
    sequence: nextSeq,
  };

  brokerStore.states.set(matchId, {
    state: nextState,
    lastAccessedAt: Date.now(),
    sequence: nextSeq,
  });

  notifyListeners(matchId, nextState);
  return nextState;
}

/**
 * Dispatches a lightweight delta event to all connected SSE clients
 */
export function broadcastMatchDelta(matchId: string, payload: Record<string, any>): LiveMatchDelta {
  const entry = brokerStore.states.get(matchId);
  const nextSeq = entry ? (entry.sequence + 1) : 1;
  if (entry) {
    entry.sequence = nextSeq;
    entry.lastAccessedAt = Date.now();
  }

  const delta: LiveMatchDelta = {
    sequence: nextSeq,
    matchId,
    timestamp: Date.now(),
    type: payload.type || "STATE_UPDATE",
    ...payload,
  };

  if (!brokerStore.deltaListeners) {
    brokerStore.deltaListeners = new Map();
  }
  const deltaListeners = brokerStore.deltaListeners.get(matchId);
  if (deltaListeners) {
    deltaListeners.forEach((listener) => {
      try {
        listener(delta);
      } catch (err) {
        console.error("[DELTA LISTENER ERROR]:", err);
      }
    });
  }

  return delta;
}

/**
 * Subscribe to full state broadcasts
 */
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

/**
 * Subscribe to lightweight incremental delta broadcasts
 */
export function subscribeToMatchDeltas(
  matchId: string,
  listener: DeltaListener
): () => void {
  if (!brokerStore.deltaListeners) {
    brokerStore.deltaListeners = new Map();
  }
  let listeners = brokerStore.deltaListeners.get(matchId);
  if (!listeners) {
    listeners = new Set<DeltaListener>();
    brokerStore.deltaListeners.set(matchId, listeners);
  }
  listeners.add(listener);

  return () => {
    const list = brokerStore.deltaListeners?.get(matchId);
    if (list) {
      list.delete(listener);
      if (list.size === 0) {
        brokerStore.deltaListeners?.delete(matchId);
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

  broadcastMatchDelta(matchId, {
    type: "CHAT_MESSAGE",
    message: newMsg,
  });

  return newMsg;
}

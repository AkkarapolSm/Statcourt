import { create } from "zustand";

export interface LiveStreamItem {
  id: string;
  matchId: string;
  courtName: string;
  title: string;
  tournament: string;
  homeTeam: {
    name: string;
    shortName: string;
    score: number;
    color: string;
  };
  awayTeam: {
    name: string;
    shortName: string;
    score: number;
    color: string;
  };
  currentQuarter: number;
  gameClock: string;
  streamUrl: string;
  status: "LIVE" | "UPCOMING" | "ENDED";
  viewerCount: number;
  organizerName: string;
  startedAt: string;
}

interface LiveStreamStore {
  streams: LiveStreamItem[];
  activeStreamId: string;
  setActiveStream: (id: string) => void;
  addStream: (stream: Omit<LiveStreamItem, "id" | "viewerCount" | "startedAt">) => void;
  updateStream: (id: string, updates: Partial<LiveStreamItem>) => void;
  removeStream: (id: string) => void;
}

export const initialStreams: LiveStreamItem[] = [
  {
    id: "stream-court-1",
    matchId: "match-bcc-ds-01",
    courtName: "สนาม 1 (Main Court)",
    title: "Bangkok Christian College vs Debsirin School",
    tournament: "TOA Youth Basketball League Thailand 2026 - U18 Final",
    homeTeam: {
      name: "Bangkok Christian College",
      shortName: "BCC",
      score: 75,
      color: "#4B0082",
    },
    awayTeam: {
      name: "Debsirin School",
      shortName: "DS",
      score: 63,
      color: "#006400",
    },
    currentQuarter: 4,
    gameClock: "05:20",
    streamUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
    status: "LIVE",
    viewerCount: 1480,
    organizerName: "ฝ่ายจัดการแข่งขัน TOA / BSAT",
    startedAt: "2026-09-22T14:00:00Z",
  },
  {
    id: "stream-court-2",
    matchId: "match-act-sk-02",
    courtName: "สนาม 2 (Court B)",
    title: "Assumption College Thonburi vs Suankularb Wittayalai",
    tournament: "TOA Youth Basketball League Thailand 2026 - U18 Semifinal",
    homeTeam: {
      name: "Assumption College Thonburi",
      shortName: "ACT",
      score: 68,
      color: "#DC2626",
    },
    awayTeam: {
      name: "Suankularb Wittayalai",
      shortName: "SK",
      score: 65,
      color: "#EC4899",
    },
    currentQuarter: 3,
    gameClock: "02:15",
    streamUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    status: "LIVE",
    viewerCount: 920,
    organizerName: "ฝ่ายถ่ายทอดสด กกท.",
    startedAt: "2026-09-22T14:30:00Z",
  },
  {
    id: "stream-court-3",
    matchId: "match-cmu-chon-03",
    courtName: "สนาม 3 (Court C)",
    title: "Chiang Mai University Demo vs Chonburi Sports School",
    tournament: "Thailand Youth League 2026 - U16 Quarterfinal",
    homeTeam: {
      name: "Chiang Mai Univ Demo",
      shortName: "CMU",
      score: 54,
      color: "#2563EB",
    },
    awayTeam: {
      name: "Chonburi Sports School",
      shortName: "CHON",
      score: 58,
      color: "#059669",
    },
    currentQuarter: 4,
    gameClock: "08:40",
    streamUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    status: "LIVE",
    viewerCount: 640,
    organizerName: "สโมสรบาสเกตบอลเยาวชนไทย",
    startedAt: "2026-09-22T15:00:00Z",
  },
];

export const useLiveStreamStore = create<LiveStreamStore>((set) => ({
  streams: initialStreams,
  activeStreamId: "stream-court-1",

  setActiveStream: (id: string) => set({ activeStreamId: id }),

  addStream: (newStreamData) =>
    set((state) => {
      const newId = `stream-court-${Date.now()}`;
      const newStream: LiveStreamItem = {
        ...newStreamData,
        id: newId,
        viewerCount: 1,
        startedAt: new Date().toISOString(),
      };
      return {
        streams: [newStream, ...state.streams],
        activeStreamId: newId,
      };
    }),

  updateStream: (id, updates) =>
    set((state) => ({
      streams: state.streams.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    })),

  removeStream: (id) =>
    set((state) => {
      const remaining = state.streams.filter((s) => s.id !== id);
      const nextActiveId =
        state.activeStreamId === id
          ? remaining[0]?.id || ""
          : state.activeStreamId;
      return {
        streams: remaining,
        activeStreamId: nextActiveId,
      };
    }),
}));

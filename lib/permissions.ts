import type {
  SubscriptionTier,
  AthleteSeasonStats,
  PlayerStatsResponse,
  ShotCoordinate,
  ShotZoneData,
} from "./types.ts";

/**
 * Check if the user tier has access to deep FIBA advanced analytics (TS%, eFG%, AST/TO)
 */
export function canAccessAdvancedMetrics(tier: SubscriptionTier): boolean {
  return tier === "PRO";
}

/**
 * Check if the user tier has access to the 5-zone interactive shot chart
 */
export function canAccessShotChart(tier: SubscriptionTier): boolean {
  return tier === "PRO";
}

/**
 * Check if the user tier can view the full Top 100 Leaderboard (Free is limited to Top 10 per position)
 */
export function canAccessFullLeaderboard(tier: SubscriptionTier): boolean {
  return tier === "PRO";
}

/**
 * Check if the athlete can export the official TCAS PDF portfolio with verified QR code
 */
export function canExportTcasPdf(tier: SubscriptionTier): boolean {
  return tier === "PRO";
}

/**
 * Check if coaches/scouts can use deep physical and efficiency filters (Height >= 190, Wingspan, TS%)
 */
export function canAccessAdvancedScouting(tier: SubscriptionTier): boolean {
  return tier === "PRO";
}

/**
 * Check if user can access full season video logs or create highlight reels
 */
export function canAccessFullVideoVault(tier: SubscriptionTier): boolean {
  return tier === "PRO";
}

export function canCreateHighlightReels(tier: SubscriptionTier): boolean {
  return tier === "PRO";
}

export function getMaxMarketplaceItems(tier: SubscriptionTier): number {
  return tier === "PRO" ? 999 : 1;
}

export function getMaxDailyVideoClips(tier: SubscriptionTier): number {
  return tier === "PRO" ? 999 : 5;
}

/**
 * Calculate accuracy statistics across 5 standard basketball zones
 */
export function calculateShotZones(shots: ShotCoordinate[]): ShotZoneData[] {
  const zones: Record<ShotCoordinate["zone"], { made: number; attempted: number; nameTh: string; nameEn: string }> = {
    PAINT_RESTRICTED: { made: 0, attempted: 0, nameTh: "ใต้แป้น (Restricted Area)", nameEn: "Paint / Restricted" },
    MID_RANGE: { made: 0, attempted: 0, nameTh: "ระยะกลาง (Mid-Range)", nameEn: "Mid-Range Paint & Key" },
    CORNER_3_LEFT: { made: 0, attempted: 0, nameTh: "สามแต้มมุมซ้าย (Left Corner 3)", nameEn: "Left Corner 3" },
    CORNER_3_RIGHT: { made: 0, attempted: 0, nameTh: "สามแต้มมุมขวา (Right Corner 3)", nameEn: "Right Corner 3" },
    ABOVE_BREAK_3: { made: 0, attempted: 0, nameTh: "สามแต้มหัวกะโหลก (Above the Break 3)", nameEn: "Above the Break 3" },
  };

  for (const s of shots) {
    if (zones[s.zone]) {
      zones[s.zone].attempted += 1;
      if (s.made) zones[s.zone].made += 1;
    }
  }

  return Object.entries(zones).map(([zoneKey, val]) => ({
    zone: zoneKey as ShotCoordinate["zone"],
    zoneNameTh: val.nameTh,
    zoneNameEn: val.nameEn,
    made: val.made,
    attempted: val.attempted,
    percentage: val.attempted > 0 ? Number(((val.made / val.attempted) * 100).toFixed(1)) : 0,
  }));
}

/**
 * Generate deterministic mock shot coordinates for an athlete based on their FG stats
 */
export function generateMockShots(athleteId: string, stats?: Partial<AthleteSeasonStats>): ShotCoordinate[] {
  const seed = athleteId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const totalShots = Math.min(32, Math.max(16, (stats?.fgMade ?? 12) + (stats?.fgMissed ?? 10)));
  const shots: ShotCoordinate[] = [];

  const zones: ShotCoordinate["zone"][] = [
    "PAINT_RESTRICTED",
    "MID_RANGE",
    "ABOVE_BREAK_3",
    "CORNER_3_LEFT",
    "CORNER_3_RIGHT",
  ];

  for (let i = 0; i < totalShots; i++) {
    const pseudoRand = Math.sin(seed + i * 17.13) * 10000;
    const norm = pseudoRand - Math.floor(pseudoRand);

    let zone: ShotCoordinate["zone"];
    let x: number;
    let y: number;
    let points: 2 | 3 = 2;

    if (i % 5 === 0) {
      zone = "CORNER_3_LEFT";
      x = 8 + (norm * 8);
      y = 10 + (norm * 14);
      points = 3;
    } else if (i % 5 === 1) {
      zone = "CORNER_3_RIGHT";
      x = 84 + (norm * 8);
      y = 10 + (norm * 14);
      points = 3;
    } else if (i % 5 === 2) {
      zone = "ABOVE_BREAK_3";
      x = 35 + (norm * 30);
      y = 65 + (norm * 22);
      points = 3;
    } else if (i % 5 === 3) {
      zone = "MID_RANGE";
      x = 26 + (norm * 48);
      y = 35 + (norm * 22);
      points = 2;
    } else {
      zone = "PAINT_RESTRICTED";
      x = 42 + (norm * 16);
      y = 14 + (norm * 18);
      points = 2;
    }

    const isMade = (norm * 100) < (points === 3 ? 38 : 56);

    shots.push({
      id: `shot-${athleteId}-${i + 1}`,
      x: Number(x.toFixed(1)),
      y: Number(y.toFixed(1)),
      made: isMade,
      zone,
      points,
      quarter: (i % 4) + 1,
      gameClock: `${String(10 - (i % 10)).padStart(2, "0")}:${String((i * 7) % 60).padStart(2, "0")}`,
    });
  }

  return shots;
}

/**
 * Sanitize athlete statistics according to user subscription tier
 * Implements server-side and client-side data gating
 */
export function sanitizeStatsForTier(
  stats: AthleteSeasonStats,
  userTier: SubscriptionTier,
  customShots?: ShotCoordinate[]
): PlayerStatsResponse {
  const isPro = userTier === "PRO";
  const shots = customShots ?? generateMockShots(stats.athleteId, stats);

  if (isPro) {
    return {
      athleteId: stats.athleteId,
      firstName: stats.firstName,
      lastName: stats.lastName,
      jerseyNumber: stats.jerseyNumber,
      schoolOrClub: stats.schoolOrClub,
      province: stats.province,
      position: stats.position,
      ageCategory: stats.ageCategory,
      gamesPlayed: stats.gamesPlayed,
      points: stats.points,
      rebounds: stats.rebounds,
      assists: stats.assists,
      steals: stats.steals,
      blocks: stats.blocks,
      turnovers: stats.turnovers,
      fouls: stats.fouls,
      fgMade: stats.fgMade,
      fgMissed: stats.fgMissed,
      ftMade: stats.ftMade,
      ftMissed: stats.ftMissed,
      eff: stats.eff,
      effPerGame: stats.effPerGame,
      ppg: stats.ppg,
      rpg: stats.rpg,
      apg: stats.apg,
      spg: stats.spg,
      bpg: stats.bpg,
      fgPct: stats.fgPct,
      ftPct: stats.ftPct,

      // PRO Unlocked Fields
      trueShootingPct: stats.tsPct,
      effectiveFgPct: stats.efgPct,
      astToRatio: stats.astToRatio,
      shotChartData: shots,
      shotZones: calculateShotZones(shots),
      effTrendHistory: [
        { gameIndex: 1, eff: Math.round(stats.effPerGame * 0.88), opponent: "Assumption College" },
        { gameIndex: 2, eff: Math.round(stats.effPerGame * 1.15), opponent: "Suankularb Wittayalai" },
        { gameIndex: 3, eff: Math.round(stats.effPerGame * 0.95), opponent: "Debsirin School" },
        { gameIndex: 4, eff: Math.round(stats.effPerGame * 1.08), opponent: "Bangkok Christian College" },
      ],
      isProGated: false,
    };
  }

  // FREE Tier: traditional box score + overall EFF only
  return {
    athleteId: stats.athleteId,
    firstName: stats.firstName,
    lastName: stats.lastName,
    jerseyNumber: stats.jerseyNumber,
    schoolOrClub: stats.schoolOrClub,
    province: stats.province,
    position: stats.position,
    ageCategory: stats.ageCategory,
    gamesPlayed: stats.gamesPlayed,
    points: stats.points,
    rebounds: stats.rebounds,
    assists: stats.assists,
    steals: stats.steals,
    blocks: stats.blocks,
    turnovers: stats.turnovers,
    fouls: stats.fouls,
    fgMade: stats.fgMade,
    fgMissed: stats.fgMissed,
    ftMade: stats.ftMade,
    ftMissed: stats.ftMissed,
    eff: stats.eff,
    effPerGame: stats.effPerGame,
    ppg: stats.ppg,
    rpg: stats.rpg,
    apg: stats.apg,
    spg: stats.spg,
    bpg: stats.bpg,
    fgPct: stats.fgPct,
    ftPct: stats.ftPct,

    // Gated Pro fields are nullified
    trueShootingPct: null,
    effectiveFgPct: null,
    astToRatio: null,
    shotChartData: null,
    shotZones: null,
    effTrendHistory: null,
    isProGated: true,
  };
}

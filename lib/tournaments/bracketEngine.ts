export interface TeamEntry {
  id: string;
  name: string;
  seed?: number;
}

export interface FixtureDraft {
  homeTeamId: string;
  awayTeamId: string;
  round: string;
  groupName?: string;
}

export interface ScheduledFixture extends FixtureDraft {
  scheduledAt: Date;
  venue: string;
  courtName: string;
}

export interface ScheduleOptions {
  startDate: Date | string;
  dailyStartTime?: string; // "09:00"
  matchDurationMins?: number; // 90
  minRestMins?: number; // 120 mins
  venue: string;
  courts: string[]; // ["คอร์ท 1", "คอร์ท 2"]
  maxDailyMatchesPerCourt?: number; // 4
}

export interface ScheduleConflict {
  type: "COURT_OVERLAP" | "TEAM_REST_CONFLICT";
  descriptionTh: string;
  descriptionEn: string;
  matchIdA?: string;
  matchIdB?: string;
  teamsInvolved: string[];
  scheduledTimeA: string;
  scheduledTimeB: string;
  courtName?: string;
}

/**
 * 1. Round Robin Fixtures Generator (สำหรับรอบแบ่งกลุ่ม Group Stage)
 * Standard Berger / Circle algorithm for balanced home/away pairings.
 */
export function generateRoundRobinFixtures(
  teams: TeamEntry[],
  groupName: string = "Group A"
): FixtureDraft[] {
  if (teams.length < 2) return [];

  const teamList = [...teams];
  // If odd number of teams, add a dummy bye team
  const hasBye = teamList.length % 2 !== 0;
  if (hasBye) {
    teamList.push({ id: "__BYE__", name: "BYE" });
  }

  const n = teamList.length;
  const rounds = n - 1;
  const half = n / 2;
  const fixtures: FixtureDraft[] = [];

  for (let roundIdx = 0; roundIdx < rounds; roundIdx++) {
    for (let i = 0; i < half; i++) {
      const home = teamList[i];
      const away = teamList[n - 1 - i];

      // Skip byes
      if (home.id === "__BYE__" || away.id === "__BYE__") continue;

      // Alternate home/away for fairness
      const isEvenRound = roundIdx % 2 === 0;
      fixtures.push({
        homeTeamId: isEvenRound ? home.id : away.id,
        awayTeamId: isEvenRound ? away.id : home.id,
        round: `รอบแบ่งกลุ่ม ${groupName} นัดที่ ${roundIdx + 1}`,
        groupName,
      });
    }

    // Rotate elements except the first one
    const fixed = teamList[0];
    const rest = teamList.slice(1);
    const last = rest.pop()!;
    rest.unshift(last);
    teamList.splice(0, teamList.length, fixed, ...rest);
  }

  return fixtures;
}

/**
 * 2. Knockout Bracket Generator (สำหรับรอบแพ้คัดออก Single Elimination)
 * Supports standard basketball seeds: 4, 8, 16 teams.
 */
export function generateKnockoutFixtures(teams: TeamEntry[]): FixtureDraft[] {
  if (teams.length < 2) return [];

  const count = teams.length;
  const fixtures: FixtureDraft[] = [];

  // Determine bracket size: 4, 8, or 16
  let bracketSize = 4;
  if (count > 8) bracketSize = 16;
  else if (count > 4) bracketSize = 8;

  // Pad with byes if count < bracketSize
  const seededTeams: (TeamEntry | null)[] = [...teams];
  while (seededTeams.length < bracketSize) {
    seededTeams.push(null);
  }

  // Standard tournament seeding pairings (e.g. 1 vs 8, 4 vs 5, 2 vs 7, 3 vs 6)
  const roundOf16Pairs = [
    [0, 15], [7, 8], [3, 12], [4, 11],
    [1, 14], [6, 9], [2, 13], [5, 10],
  ];

  const roundOf8Pairs = [
    [0, 7], [3, 4], [1, 6], [2, 5],
  ];

  const roundOf4Pairs = [
    [0, 3], [1, 2],
  ];

  if (bracketSize === 16) {
    roundOf16Pairs.forEach(([idxA, idxB], i) => {
      const teamA = seededTeams[idxA];
      const teamB = seededTeams[idxB];
      if (teamA && teamB) {
        fixtures.push({
          homeTeamId: teamA.id,
          awayTeamId: teamB.id,
          round: `รอบ 16 ทีม (Match ${i + 1})`,
        });
      }
    });
  } else if (bracketSize === 8) {
    roundOf8Pairs.forEach(([idxA, idxB], i) => {
      const teamA = seededTeams[idxA];
      const teamB = seededTeams[idxB];
      if (teamA && teamB) {
        fixtures.push({
          homeTeamId: teamA.id,
          awayTeamId: teamB.id,
          round: `รอบก่อนรองชนะเลิศ (QF ${i + 1})`,
        });
      }
    });
  } else {
    roundOf4Pairs.forEach(([idxA, idxB], i) => {
      const teamA = seededTeams[idxA];
      const teamB = seededTeams[idxB];
      if (teamA && teamB) {
        fixtures.push({
          homeTeamId: teamA.id,
          awayTeamId: teamB.id,
          round: `รอบรองชนะเลิศ (SF ${i + 1})`,
        });
      }
    });
  }

  return fixtures;
}

/**
 * 3. Automated Court & Time Slot Allocation (จัดตารางสนามและเวลาแข่งอัตโนมัติ)
 * Maps fixtures into court slots while enforcing team rest buffers.
 */
export function generateCourtSchedule(
  fixtures: FixtureDraft[],
  options: ScheduleOptions
): ScheduledFixture[] {
  const {
    startDate,
    dailyStartTime = "09:00",
    matchDurationMins = 90,
    minRestMins = 120,
    venue,
    courts,
    maxDailyMatchesPerCourt = 4,
  } = options;

  if (fixtures.length === 0 || courts.length === 0) return [];

  const [startHourStr, startMinStr] = dailyStartTime.split(":");
  const startHour = parseInt(startHourStr || "9", 10);
  const startMin = parseInt(startMinStr || "0", 10);

  const scheduled: ScheduledFixture[] = [];
  const teamLastPlayed: Record<string, number> = {}; // teamId -> timestamp ms

  let currentDayOffset = 0;
  let slotIndexInDay = 0;
  let courtIndex = 0;

  const baseDate = typeof startDate === "string" ? new Date(startDate) : new Date(startDate.getTime());

  for (const fix of fixtures) {
    let assigned = false;
    let attempts = 0;

    while (!assigned && attempts < 100) {
      attempts++;

      // Calculate candidate datetime
      const matchDate = new Date(baseDate.getTime());
      matchDate.setDate(matchDate.getDate() + currentDayOffset);
      matchDate.setHours(startHour, startMin, 0, 0);

      // Add minutes for slot
      const totalSlotMinutes = slotIndexInDay * matchDurationMins;
      matchDate.setMinutes(matchDate.getMinutes() + totalSlotMinutes);

      const candidateTime = matchDate.getTime();
      const currentCourt = courts[courtIndex];

      // Check team rest condition
      const homeLast = teamLastPlayed[fix.homeTeamId] || 0;
      const awayLast = teamLastPlayed[fix.awayTeamId] || 0;
      const minRequiredMs = minRestMins * 60 * 1000;

      const homeRestOk = candidateTime - homeLast >= minRequiredMs || homeLast === 0;
      const awayRestOk = candidateTime - awayLast >= minRequiredMs || awayLast === 0;

      if (homeRestOk && awayRestOk) {
        scheduled.push({
          ...fix,
          scheduledAt: matchDate,
          venue,
          courtName: currentCourt,
        });

        teamLastPlayed[fix.homeTeamId] = candidateTime + matchDurationMins * 60 * 1000;
        teamLastPlayed[fix.awayTeamId] = candidateTime + matchDurationMins * 60 * 1000;
        assigned = true;
      }

      // Increment slot or court
      courtIndex++;
      if (courtIndex >= courts.length) {
        courtIndex = 0;
        slotIndexInDay++;

        if (slotIndexInDay >= maxDailyMatchesPerCourt) {
          slotIndexInDay = 0;
          currentDayOffset++;
        }
      }
    }
  }

  return scheduled;
}

/**
 * 4. Conflict Detection Engine (ตรวจเวลาและสนามชนกัน)
 * Detects court overlap (< match duration) and team rest breaches (< min rest).
 */
export function detectScheduleConflicts(
  matches: Array<{
    id?: string;
    homeTeamId: string;
    awayTeamId: string;
    scheduledAt: Date | string | null;
    venue?: string | null;
    courtName?: string | null;
    homeTeamName?: string;
    awayTeamName?: string;
  }>,
  matchDurationMins: number = 90,
  minRestMins: number = 120
): ScheduleConflict[] {
  const conflicts: ScheduleConflict[] = [];
  const validMatches = matches.filter((m) => m.scheduledAt);

  for (let i = 0; i < validMatches.length; i++) {
    for (let j = i + 1; j < validMatches.length; j++) {
      const mA = validMatches[i];
      const mB = validMatches[j];

      const timeA = new Date(mA.scheduledAt!).getTime();
      const timeB = new Date(mB.scheduledAt!).getTime();
      const diffMins = Math.abs(timeA - timeB) / 60000;

      const teamA1 = mA.homeTeamId;
      const teamA2 = mA.awayTeamId;
      const teamB1 = mB.homeTeamId;
      const teamB2 = mB.awayTeamId;

      // 1. Check Court Overlap (same court, overlapping slot)
      const sameCourt =
        mA.courtName &&
        mB.courtName &&
        mA.courtName.trim().toLowerCase() === mB.courtName.trim().toLowerCase();

      if (sameCourt && diffMins < matchDurationMins) {
        conflicts.push({
          type: "COURT_OVERLAP",
          descriptionTh: `การแข่งขันชนกันบน ${mA.courtName || "คอร์ทเดียวกัน"} (${mA.homeTeamName || mA.homeTeamId} vs ${mA.awayTeamName || mA.awayTeamId} และ ${mB.homeTeamName || mB.homeTeamId} vs ${mB.awayTeamName || mB.awayTeamId}) ในเวลาไล่เลี่ยกัน (${Math.round(diffMins)} นาที)`,
          descriptionEn: `Court collision on ${mA.courtName} between two matches scheduled within ${Math.round(diffMins)} minutes.`,
          matchIdA: mA.id,
          matchIdB: mB.id,
          teamsInvolved: [mA.homeTeamName || mA.homeTeamId, mA.awayTeamName || mA.awayTeamId, mB.homeTeamName || mB.homeTeamId, mB.awayTeamName || mB.awayTeamId],
          scheduledTimeA: new Date(timeA).toISOString(),
          scheduledTimeB: new Date(timeB).toISOString(),
          courtName: mA.courtName || undefined,
        });
      }

      // 2. Check Team Rest Conflict (same team playing with < minRestMins rest buffer)
      const sharedTeam = [teamA1, teamA2].find((t) => [teamB1, teamB2].includes(t));
      const actualRestMins = diffMins - matchDurationMins;
      if (sharedTeam && (actualRestMins < minRestMins || diffMins < matchDurationMins)) {
        const teamName =
          sharedTeam === teamA1
            ? mA.homeTeamName || teamA1
            : sharedTeam === teamA2
            ? mA.awayTeamName || teamA2
            : sharedTeam;

        conflicts.push({
          type: "TEAM_REST_CONFLICT",
          descriptionTh: `ทีม '${teamName}' มีคิวแข่งขัน 2 นัดติดกันโดยมีเวลาพักจริงเพียง ${Math.max(0, Math.round(actualRestMins))} นาที (เกณฑ์มาตรฐาน FIBA แนะนำอย่างน้อย ${minRestMins} นาที)`,
          descriptionEn: `Team '${teamName}' has consecutive matches with only ${Math.max(0, Math.round(actualRestMins))} minutes rest buffer.`,
          matchIdA: mA.id,
          matchIdB: mB.id,
          teamsInvolved: [teamName],
          scheduledTimeA: new Date(timeA).toISOString(),
          scheduledTimeB: new Date(timeB).toISOString(),
        });
      }
    }
  }

  return conflicts;
}

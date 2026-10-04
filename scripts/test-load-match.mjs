import { mockTeams } from "../lib/db/seed-data.ts";

async function run() {
  try {
    const res = await fetch("http://localhost:3000/api/matches/match-bcc-ds-01");
    const payload = await res.json();
    console.log("payload success:", payload.success);
    const data = payload.data;
    console.log("homeTeam raw roster count:", data.homeTeam.roster.length);
    console.log("awayTeam raw roster count:", data.awayTeam.roster.length);

    const activeEvents = Array.isArray(data.events)
      ? data.events.filter((event) => !event.reversedAt)
      : [];

    const normalizeRoster = (rawTeam, teamId) => {
      const fallbackTeam = mockTeams.find((t) => t.id === teamId || t.name === rawTeam?.name);
      const fallbackRoster = fallbackTeam ? fallbackTeam.roster : [];

      let players = [];

      if (Array.isArray(rawTeam?.roster)) {
        players = rawTeam.roster.map((member, index) => {
          const athleteId = member.athleteId || member.id;
          const events = activeEvents.filter((event) => event.athleteId === athleteId);
          const firstName = member.athlete?.firstName || member.firstName || `Player`;
          const lastName = member.athlete?.lastName || member.lastName || `${member.jerseyNumber ?? index + 1}`;
          const position = member.athlete?.primaryPosition || member.position || "POINT_GUARD";
          const heightCm = member.athlete?.heightCm || member.heightCm || 185;
          const points = events.reduce((sum, event) => sum + (event.points || 0), 0) + (member.points || 0);
          const fouls = events.filter((event) => ["PERSONAL_FOUL", "TECHNICAL_FOUL"].includes(event.eventType)).length + (member.fouls || 0);
          return {
            athleteId,
            jerseyNumber: member.jerseyNumber ?? index + 1,
            firstName,
            lastName,
            position,
            heightCm,
            points,
            fouls,
            isOnCourt: member.isOnCourt !== undefined ? member.isOnCourt : index < 5,
          };
        });
      }

      console.log(`[${teamId}] initial mapped players:`, players.length);

      // Ensure 12 players from fallback or generated
      if (players.length < 12) {
        const existingIds = new Set(players.map((p) => p.athleteId));
        const existingNumbers = new Set(players.map((p) => p.jerseyNumber));

        for (const fb of fallbackRoster) {
          if (players.length >= 12) break;
          if (!existingIds.has(fb.athleteId) && !existingNumbers.has(fb.jerseyNumber)) {
            players.push({
              ...fb,
              isOnCourt: false,
            });
            existingIds.add(fb.athleteId);
            existingNumbers.add(fb.jerseyNumber);
          }
        }

        const defaultPositions = ["POINT_GUARD", "SHOOTING_GUARD", "SMALL_FORWARD", "POWER_FORWARD", "CENTER"];
        const thaiNames = [
          { f: "Kittipong", l: "Sanit" },
          { f: "Nattakit", l: "Prasert" },
          { f: "Chanon", l: "Kongpan" },
          { f: "Teerasak", l: "Klinhom" },
          { f: "Panupong", l: "Wichaidit" },
          { f: "Anucha", l: "Charoen" },
          { f: "Sorawit", l: "Petchkham" },
        ];
        let nameIdx = 0;
        let numCandidate = 1;
        while (players.length < 12) {
          while (existingNumbers.has(numCandidate)) numCandidate++;
          const name = thaiNames[nameIdx % thaiNames.length];
          const newPlayer = {
            athleteId: `ath-bench-${teamId}-${numCandidate}`,
            jerseyNumber: numCandidate,
            firstName: name.f,
            lastName: name.l,
            position: defaultPositions[players.length % defaultPositions.length],
            heightCm: 185 + (players.length % 15),
            points: 0,
            fouls: 0,
            isOnCourt: false,
          };
          players.push(newPlayer);
          existingNumbers.add(numCandidate);
          nameIdx++;
        }
      }

      if (players.length > 12) {
        const onCourt = players.filter((p) => p.isOnCourt);
        const bench = players.filter((p) => !p.isOnCourt);
        players = [...onCourt.slice(0, 5), ...bench.slice(0, 7)];
        while (players.length < 12 && bench[players.length - 5]) {
          players.push(bench[players.length - 5]);
        }
      }

      const onCourtCount = players.filter((p) => p.isOnCourt).length;
      if (onCourtCount !== 5) {
        players = players.map((p, idx) => ({
          ...p,
          isOnCourt: idx < 5,
        }));
      }

      console.log(`[${teamId}] final normalized players:`, players.length);
      return players;
    };

    const homeRoster = normalizeRoster(data.homeTeam, data.homeTeamId);
    const awayRoster = normalizeRoster(data.awayTeam, data.awayTeamId);

    console.log("home on-court:", homeRoster.filter(p => p.isOnCourt).length);
    console.log("away on-court:", awayRoster.filter(p => p.isOnCourt).length);
    console.log("TEST SUCCESSFUL!");
  } catch (err) {
    console.error("TEST FAILED:", err);
  }
}

run();

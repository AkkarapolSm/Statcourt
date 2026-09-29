import { PrismaClient } from "../generated/prisma";
import {
  mockTournaments,
  mockTeams,
  mockAthleteProfiles,
  mockLeaderboardAthletes,
  mockMatchEvents,
  mockMarketplaceItems,
} from "../lib/db/seed-data";
import { calculateFibaSeasonMetrics } from "../lib/analytics/fiba";
import { mockAcademicRecords, mockOpportunities } from "../lib/db/phase2-data";
import { mockPracticeSessions, mockPlaybookPlays, mockInjuryLogs } from "../lib/db/phase3-data";

const prisma = new PrismaClient();

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Demo seed is disabled in production");
  }
  const nonDemoUsers = await prisma.user.count({ where: { passwordHash: { not: null } } });
  if (nonDemoUsers > 0) {
    throw new Error("Demo seed would overwrite registered accounts; use a separate empty development database");
  }
  console.log("[STATCOURT DB SEED] Initializing real database persistence...");

  // 1. Clean existing records in referential order
  await prisma.opportunityApplication.deleteMany();
  await prisma.opportunity.deleteMany();
  await prisma.playbookItem.deleteMany();
  await prisma.injuryLog.deleteMany();
  await prisma.playerAttendance.deleteMany();
  await prisma.practiceSession.deleteMany();
  await prisma.digitalPlayerPass.deleteMany();
  await prisma.scoutProfileView.deleteMany();
  await prisma.academicRecord.deleteMany();
  await prisma.videoTelestrationNote.deleteMany();
  await prisma.matchResultApproval.deleteMany();
  await prisma.matchOfficialAssignment.deleteMany();
  await prisma.teamMembership.deleteMany();
  await prisma.userSession.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.marketplaceItem.deleteMany();
  await prisma.matchEvent.deleteMany();
  await prisma.matchParticipant.deleteMany();
  await prisma.match.deleteMany();
  await prisma.rosterMember.deleteMany();
  await prisma.team.deleteMany();
  await prisma.tournament.deleteMany();
  await prisma.athleteSeasonStats.deleteMany();
  await prisma.athleteProfile.deleteMany();
  await prisma.officialProfile.deleteMany();
  await prisma.coachProfile.deleteMany();
  await prisma.user.deleteMany();

  console.log("[STATCOURT DB SEED] Cleaned existing tables.");

  // 2. Create System Users and Profiles
  // 2.1 Official Scorekeeper (FIBA Asia Certified Table Official)
  const officialUser = await prisma.user.create({
    data: {
      id: "usr-official-01",
      email: "official.table@statcourt.th",
      phoneNumber: "+66812345001",
      role: "OFFICIAL",
      officialProfile: {
        create: {
          id: "off-01",
          fullName: "Kitisak Chaimongkol",
          licensingBody: "FIBA Asia & Basketball Sport Association of Thailand (BSAT)",
          licenseNumber: "FIBA-TH-STAT-2024-089",
          approvalStatus: "APPROVED",
        },
      },
    },
    include: { officialProfile: true },
  });

  // 2.2 Coaches
  const bccCoachUser = await prisma.user.create({
    data: {
      id: "usr-coach-bcc",
      email: "coach.bcc@statcourt.th",
      phoneNumber: "+66812345002",
      role: "COACH",
      coachProfile: {
        create: {
          id: "coach-bcc",
          fullName: "Somchai Prasert",
          organization: "Bangkok Christian College Basketball Program",
          phoneNumber: "+66812345002",
          isVerified: true,
        },
      },
    },
    include: { coachProfile: true },
  });

  const dsCoachUser = await prisma.user.create({
    data: {
      id: "usr-coach-ds",
      email: "coach.ds@statcourt.th",
      phoneNumber: "+66812345003",
      role: "COACH",
      coachProfile: {
        create: {
          id: "coach-ds",
          fullName: "Arthit Rattana",
          organization: "Debsirin School Basketball Academy",
          phoneNumber: "+66812345003",
          isVerified: true,
        },
      },
    },
    include: { coachProfile: true },
  });

  // 3. Create Tournaments (Full metadata list)
  const fullTournamentList = [
    {
      id: "tourn-toa-2026",
      name: "TOA Youth Basketball League Thailand 2026",
      organizer: "สมาคมกีฬาบาสเกตบอลแห่งประเทศไทย (BSAT) ร่วมกับ TOA",
      isOfficialEndorsed: true,
      category: "U18",
      region: "กรุงเทพฯ และปริมณฑล",
      province: "กรุงเทพมหานคร",
      venue: "อาคารนิมิบุตร สนามกีฬาแห่งชาติ เขตปทุมวัน",
      location: "Nimibutr Stadium, National Stadium Complex, Bangkok",
      startDate: new Date("2026-10-15"),
      endDate: new Date("2026-11-20"),
      status: "OPEN",
      maxTeams: 24,
      registeredTeams: 18,
      entryFeeThb: 8500,
      rulesPdfUrl: "#download-rules-toa",
      contactPerson: "ฝ่ายจัดการแข่งขัน บสท.",
      contactPhone: "02-170-XXXX",
      bannerColor: "from-[#0F172A] via-slate-900 to-slate-950",
    },
    {
      id: "tourn-tcas-invitational-2026",
      name: "TCAS Elite High School Invitational 2026",
      organizer: "ศูนย์ส่งเสริมกีฬาและการศึกษาต่อระดับอุดมศึกษา",
      isOfficialEndorsed: true,
      category: "U18",
      region: "กรุงเทพฯ และปริมณฑล",
      province: "กรุงเทพมหานคร",
      venue: "ศูนย์กีฬาจุฬาลงกรณ์มหาวิทยาลัย (CU Sports Complex)",
      location: "Chulalongkorn University Sports Complex, Bangkok",
      startDate: new Date("2026-10-25"),
      endDate: new Date("2026-11-05"),
      status: "CLOSING_SOON",
      maxTeams: 16,
      registeredTeams: 14,
      entryFeeThb: 10000,
      rulesPdfUrl: "#download-rules-tcas",
      contactPerson: "อาจารย์กิตติศักดิ์",
      contactPhone: "081-998-XXXX",
      bannerColor: "from-[#0F172A] via-slate-900 to-slate-950",
    },
    {
      id: "tourn-tcas-elite",
      name: "TCAS Elite High School Invitational",
      organizer: "ศูนย์ส่งเสริมกีฬาและการศึกษาต่อระดับอุดมศึกษา",
      isOfficialEndorsed: true,
      category: "U18",
      region: "กรุงเทพฯ และปริมณฑล",
      province: "กรุงเทพมหานคร",
      venue: "ศูนย์กีฬาจุฬาลงกรณ์มหาวิทยาลัย",
      location: "Chulalongkorn University Sports Complex, Bangkok",
      startDate: new Date("2026-09-01"),
      endDate: new Date("2026-10-15"),
      status: "IN_PROGRESS",
      maxTeams: 16,
      registeredTeams: 16,
      entryFeeThb: 10000,
    },
    {
      id: "tourn-korat-supercup-2026",
      name: "Nakhon Ratchasima Junior Super Cup 2026",
      organizer: "ชมรมกีฬาบาสเกตบอลจังหวัดนครราชสีมา",
      isOfficialEndorsed: false,
      category: "U16",
      region: "ภาคอีสาน",
      province: "นครราชสีมา",
      venue: "เทอร์มินอล ฮอลล์ ศูนย์การค้าเทอร์มินอล 21 โคราช",
      location: "Terminal 21 Korat, Nakhon Ratchasima",
      startDate: new Date("2026-11-12"),
      endDate: new Date("2026-11-16"),
      status: "OPEN",
      maxTeams: 20,
      registeredTeams: 11,
      entryFeeThb: 6500,
      rulesPdfUrl: "#download-rules-korat",
      contactPerson: "โค้ชสมนึก โคราช",
      contactPhone: "089-445-XXXX",
      bannerColor: "from-[#0F172A] via-slate-900 to-slate-950",
    },
    {
      id: "tourn-chiangmai-open-2026",
      name: "Northern Thailand Student Basketball Championship",
      organizer: "สมาคมกีฬาแห่งจังหวัดเชียงใหม่",
      isOfficialEndorsed: true,
      category: "U18",
      region: "ภาคเหนือ",
      province: "เชียงใหม่",
      venue: "โรงยิมเนเซียม 2 สนามกีฬาสมโภชเชียงใหม่ 700 ปี",
      location: "700th Anniversary Stadium, Chiang Mai",
      startDate: new Date("2026-12-01"),
      endDate: new Date("2026-12-10"),
      status: "OPEN",
      maxTeams: 32,
      registeredTeams: 19,
      entryFeeThb: 7000,
      rulesPdfUrl: "#download-rules-cm",
      contactPerson: "ฝ่ายกีฬาเยาวชนภาค 5",
      contactPhone: "053-221-XXXX",
      bannerColor: "from-[#0F172A] via-slate-900 to-slate-950",
    },
    {
      id: "tourn-hatyai-classic-2026",
      name: "Songkhla Hat Yai Youth Classic 2026",
      organizer: "เทศบาลนครหาดใหญ่ ร่วมกับ สโมสรบาสเกตบอลภาคใต้",
      isOfficialEndorsed: false,
      category: "U18",
      region: "ภาคใต้",
      province: "สงขลา",
      venue: "โรงยิมเนเซียมจิระนคร อำเภอหาดใหญ่",
      location: "Jiranakhon Stadium, Hat Yai, Songkhla",
      startDate: new Date("2026-11-28"),
      endDate: new Date("2026-12-04"),
      status: "OPEN",
      maxTeams: 16,
      registeredTeams: 9,
      entryFeeThb: 5500,
      rulesPdfUrl: "#download-rules-hatyai",
      contactPerson: "นายทะเบียนสโมสร",
      contactPhone: "074-233-XXXX",
      bannerColor: "from-[#0F172A] via-slate-900 to-slate-950",
    },
    {
      id: "tourn-chonburi-coastal-2026",
      name: "Eastern Coastal Basketball League 2026",
      organizer: "ชมรมบาสเกตบอลชลบุรี-ระยอง",
      isOfficialEndorsed: false,
      category: "Open",
      region: "ภาคตะวันออก",
      province: "ชลบุรี",
      venue: "ศูนย์กีฬาแห่งชาติภาคตะวันออก เมืองพัทยา",
      location: "Eastern National Sports Training Center, Pattaya",
      startDate: new Date("2026-12-15"),
      endDate: new Date("2026-12-22"),
      status: "OPEN",
      maxTeams: 16,
      registeredTeams: 7,
      entryFeeThb: 8000,
      rulesPdfUrl: "#download-rules-chonburi",
      contactPerson: "คุณกิตติศักดิ์ พัทยา",
      contactPhone: "038-412-XXXX",
      bannerColor: "from-[#0F172A] via-slate-900 to-slate-950",
    },
    {
      id: "tourn-bangkok-youth-2026",
      name: "Bangkok Metropolitan Youth League 2026",
      location: "Bangkok Sports Complex",
      startDate: new Date("2026-06-01"),
      endDate: new Date("2026-08-30"),
      category: "U18",
    },
    {
      id: "tourn-central-invitational-2026",
      name: "Central Region High School Invitational 2026",
      location: "Ayutthaya Provincial Stadium",
      startDate: new Date("2026-04-15"),
      endDate: new Date("2026-05-30"),
      category: "U18",
    },
    {
      id: "tourn-bangkok-youth-2025",
      name: "Bangkok Youth League 2025 (Season 1)",
      location: "Bangkok Sports Complex",
      startDate: new Date("2025-10-01"),
      endDate: new Date("2026-03-31"),
      category: "U18",
    },
    {
      id: "tourn-national-youth-2025",
      name: "Thailand National Youth Basketball Cup 2025",
      location: "Suphanburi Sports Complex",
      startDate: new Date("2025-06-01"),
      endDate: new Date("2025-08-31"),
      category: "U18",
    },
  ];

  for (const t of fullTournamentList) {
    await prisma.tournament.create({
      data: t,
    });
  }
  console.log(`[STATCOURT DB SEED] Created ${fullTournamentList.length} Tournaments with full metadata.`);

  // 4. Create Teams
  const teamRecords = [
    {
      id: "team-bcc",
      name: "Bangkok Christian College",
      shortName: "BCC",
      institution: "Bangkok Christian College, Silom, Bangkok",
      logoUrl: "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=120&q=80",
      primaryColor: "#4B0082",
      coachId: bccCoachUser.coachProfile?.id,
    },
    {
      id: "team-debsirin",
      name: "Debsirin School",
      shortName: "DS",
      institution: "Debsirin School, Pom Prap Sattru Phai, Bangkok",
      logoUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=120&q=80",
      primaryColor: "#006400",
      coachId: dsCoachUser.coachProfile?.id,
    },
    {
      id: "team-assumption",
      name: "Assumption College",
      shortName: "AC",
      institution: "Assumption College, Bang Rak, Bangkok",
      logoUrl: "https://images.unsplash.com/photo-1519766304817-4f37bda74a29?auto=format&fit=crop&w=120&q=80",
      primaryColor: "#DC2626",
      coachId: undefined,
    },
    {
      id: "team-suankularb",
      name: "Suankularb Wittayalai School",
      shortName: "SK",
      institution: "Suankularb Wittayalai School, Phra Nakhon, Bangkok",
      logoUrl: "https://images.unsplash.com/photo-1505666287802-931dc83948e9?auto=format&fit=crop&w=120&q=80",
      primaryColor: "#1E3A8A",
      coachId: undefined,
    },
  ];

  for (const tr of teamRecords) {
    await prisma.team.create({
      data: {
        id: tr.id,
        name: tr.name,
        shortName: tr.shortName,
        institution: tr.institution,
        logoUrl: tr.logoUrl,
        primaryColor: tr.primaryColor,
        coachId: tr.coachId,
      },
    });
  }
  console.log(`[STATCOURT DB SEED] Created ${teamRecords.length} Teams.`);

  // 5. Track created athlete IDs to avoid duplicates
  const createdAthleteIds = new Set<string>();

  // 5.1 Create Athletes from mockLeaderboardAthletes
  for (const stat of mockLeaderboardAthletes) {
    const athId = stat.athleteId;
    const profile = mockAthleteProfiles[athId];

    const userId = `usr-${athId}`;
    const email = `${stat.firstName.toLowerCase()}.${stat.lastName.toLowerCase()}@statcourt.th`.replace(/\s+/g, "");

    const heightCm = profile?.heightCm ?? (stat.position === "CENTER" ? 204 : stat.position === "POWER_FORWARD" ? 198 : stat.position === "SMALL_FORWARD" ? 193 : stat.position === "SHOOTING_GUARD" ? 188 : 182);
    const weightKg = profile?.weightKg ?? Math.round(heightCm * 0.43);
    const wingspanCm = profile?.wingspanCm ?? Math.round(heightCm * 1.04);
    const standingReachCm = profile?.standingReachCm ?? Math.round(heightCm * 1.30);
    const birthDate = profile?.birthDate ? new Date(profile.birthDate) : new Date("2008-05-15");
    const bio = profile?.bio ?? `Varsity basketball player for ${stat.schoolOrClub}. Evaluated under FIBA LiveStats standards for national grassroots scouting.`;
    const avatarUrl = profile?.avatarUrl ?? stat.avatarUrl ?? "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=400&q=80";
    const tcasReferenceCode = profile?.tcasReferenceCode ?? `STC-VERIFIED-TH-${stat.schoolOrClub.slice(0, 3).toUpperCase()}-${String(stat.jerseyNumber).padStart(3, "0")}`;

    const fibaMetrics = calculateFibaSeasonMetrics({
      gamesPlayed: stat.gamesPlayed,
      points: stat.points,
      rebounds: stat.rebounds,
      assists: stat.assists,
      steals: stat.steals,
      blocks: stat.blocks,
      turnovers: stat.turnovers,
      fgMade: stat.fgMade,
      fgMissed: stat.fgMissed,
      ftMade: stat.ftMade,
      ftMissed: stat.ftMissed,
      fg3Made: stat.fg3Made,
      fg3Missed: stat.fg3Missed,
    });

    await prisma.user.create({
      data: {
        id: userId,
        email,
        role: "ATHLETE",
        athleteProfile: {
          create: {
            id: athId,
            firstName: stat.firstName,
            lastName: stat.lastName,
            birthDate,
            primaryPosition: stat.position,
            secondaryPosition: profile?.secondaryPosition ?? null,
            heightCm,
            weightKg,
            wingspanCm,
            standingReachCm,
            schoolOrClub: stat.schoolOrClub,
            province: stat.province,
            jerseyNumber: stat.jerseyNumber,
            bio,
            avatarUrl,
            tcasReferenceCode,
            seasonStats: {
              create: {
                ageCategory: stat.ageCategory,
                gamesPlayed: stat.gamesPlayed,
                points: stat.points,
                rebounds: stat.rebounds,
                assists: stat.assists,
                steals: stat.steals,
                blocks: stat.blocks,
                turnovers: stat.turnovers,
                fouls: stat.fouls,
                fgMade: stat.fgMade,
                fgMissed: stat.fgMissed,
                ftMade: stat.ftMade,
                ftMissed: stat.ftMissed,
                fg3Made: stat.fg3Made,
                fg3Missed: stat.fg3Missed,

                eff: fibaMetrics.eff,
                effPerGame: fibaMetrics.effPerGame,
                efgPct: fibaMetrics.efgPct,
                tsPct: fibaMetrics.tsPct,
                astToRatio: fibaMetrics.astToRatio,

                per: stat.per,
                ppg: fibaMetrics.ppg,
                rpg: fibaMetrics.rpg,
                apg: fibaMetrics.apg,
                spg: fibaMetrics.spg,
                bpg: fibaMetrics.bpg,
                fgPct: fibaMetrics.fgPct,
                ftPct: fibaMetrics.ftPct,

                scoringRating: stat.scoringRating,
                playmakingRating: stat.playmakingRating,
                defenseRating: stat.defenseRating,
                athleticismRating: stat.athleticismRating,
              },
            },
          },
        },
      },
    });

    let teamId = "team-bcc";
    if (stat.schoolOrClub.includes("Debsirin")) {
      teamId = "team-debsirin";
    } else if (stat.schoolOrClub.includes("Assumption")) {
      teamId = "team-assumption";
    } else if (stat.schoolOrClub.includes("Suankularb")) {
      teamId = "team-suankularb";
    }

    await prisma.rosterMember.create({
      data: {
        teamId,
        athleteId: athId,
        jerseyNumber: stat.jerseyNumber,
      },
    });

    createdAthleteIds.add(athId);
  }

  // 5.2 Create any remaining players from mockTeams rosters
  for (const team of mockTeams) {
    for (const player of team.roster) {
      if (!createdAthleteIds.has(player.athleteId)) {
        const athId = player.athleteId;
        const userId = `usr-${athId}`;
        const email = `${player.firstName.toLowerCase()}.${player.lastName.toLowerCase()}@statcourt.th`.replace(/\s+/g, "");
        const heightCm = player.heightCm || 185;
        const weightKg = Math.round(heightCm * 0.42);
        const wingspanCm = Math.round(heightCm * 1.03);
        const standingReachCm = Math.round(heightCm * 1.28);

        const gamesPlayed = 8;
        const points = player.points * 4;
        const rebounds = Math.round(points * 0.4);
        const assists = Math.round(points * 0.25);
        const steals = Math.round(points * 0.12);
        const blocks = Math.round(points * 0.05);
        const turnovers = Math.round(assists * 0.6);
        const fgMade = Math.round(points * 0.4);
        const fgMissed = Math.round(fgMade * 0.9);
        const ftMade = Math.round(points * 0.2);
        const ftMissed = Math.round(ftMade * 0.3);
        const fg3Made = Math.round(fgMade * 0.3);
        const fg3Missed = Math.round(fg3Made * 1.4);

        const fibaMetrics = calculateFibaSeasonMetrics({
          gamesPlayed,
          points,
          rebounds,
          assists,
          steals,
          blocks,
          turnovers,
          fgMade,
          fgMissed,
          ftMade,
          ftMissed,
          fg3Made,
          fg3Missed,
        });

        await prisma.user.create({
          data: {
            id: userId,
            email,
            role: "ATHLETE",
            athleteProfile: {
              create: {
                id: athId,
                firstName: player.firstName,
                lastName: player.lastName,
                birthDate: new Date("2008-07-20"),
                primaryPosition: player.position,
                heightCm,
                weightKg,
                wingspanCm,
                standingReachCm,
                schoolOrClub: team.name,
                province: "Bangkok",
                jerseyNumber: player.jerseyNumber,
                bio: `Active roster player for ${team.name}. Official game statistics recorded courtside by verified table officials.`,
                avatarUrl: "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=400&q=80",
                tcasReferenceCode: `STC-VERIFIED-TH-${team.shortName || "BBL"}-${String(player.jerseyNumber).padStart(3, "0")}`,
                seasonStats: {
                  create: {
                    ageCategory: "U18",
                    gamesPlayed,
                    points,
                    rebounds,
                    assists,
                    steals,
                    blocks,
                    turnovers,
                    fouls: player.fouls * 3,
                    fgMade,
                    fgMissed,
                    ftMade,
                    ftMissed,
                    fg3Made,
                    fg3Missed,

                    eff: fibaMetrics.eff,
                    effPerGame: fibaMetrics.effPerGame,
                    efgPct: fibaMetrics.efgPct,
                    tsPct: fibaMetrics.tsPct,
                    astToRatio: fibaMetrics.astToRatio,

                    per: Number((fibaMetrics.effPerGame * 0.95).toFixed(1)),
                    ppg: fibaMetrics.ppg,
                    rpg: fibaMetrics.rpg,
                    apg: fibaMetrics.apg,
                    spg: fibaMetrics.spg,
                    bpg: fibaMetrics.bpg,
                    fgPct: fibaMetrics.fgPct,
                    ftPct: fibaMetrics.ftPct,

                    scoringRating: 72,
                    playmakingRating: 70,
                    defenseRating: 74,
                    athleticismRating: 75,
                  },
                },
              },
            },
          },
        });

        await prisma.rosterMember.create({
          data: {
            teamId: team.id,
            athleteId: athId,
            jerseyNumber: player.jerseyNumber,
          },
        });

        createdAthleteIds.add(athId);
      }
    }
  }

  console.log(`[STATCOURT DB SEED] Successfully registered ${createdAthleteIds.size} Athletes with complete FIBA metrics & team rosters.`);

  // 6. Create Matches
  const matchBccDs = await prisma.match.create({
    data: {
      id: "match-bcc-ds-01",
      tournamentId: "tourn-toa-2026",
      homeTeamId: "team-bcc",
      awayTeamId: "team-debsirin",
      homeScore: 78,
      awayScore: 75,
      currentQuarter: 4,
      gameClockSec: 0,
      status: "COMPLETED",
      rawVideoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      scoresheetPhotoUrl: "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80",
    },
  });

  await prisma.match.create({
    data: {
      id: "match-ac-sk-02",
      tournamentId: "tourn-toa-2026",
      homeTeamId: "team-assumption",
      awayTeamId: "team-suankularb",
      homeScore: 68,
      awayScore: 64,
      currentQuarter: 4,
      gameClockSec: 0,
      status: "COMPLETED",
      rawVideoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    },
  });

  console.log("[STATCOURT DB SEED] Created Matches (BCC vs DS, AC vs SK).");

  // 7. Create MatchEvents
  let createdEventsCount = 0;
  for (const ev of mockMatchEvents) {
    const athleteExists = await prisma.athleteProfile.findUnique({
      where: { id: ev.athleteId || "" },
    });

    await prisma.matchEvent.create({
      data: {
        id: ev.id,
        matchId: matchBccDs.id,
        officialId: officialUser.officialProfile!.id,
        athleteId: athleteExists ? ev.athleteId : null,
        teamId: ev.teamId,
        eventType: ev.eventType,
        points: ev.points,
        quarter: ev.quarter,
        gameClockDisplay: ev.gameClockDisplay,
        videoElapsedSec: ev.videoElapsedSec,
        isVerified: ev.isVerified,
      },
    });
    createdEventsCount++;
  }

  // Add additional verified events to ensure all quarters have complete play-by-play
  const extraEvents = [
    {
      id: "evt-bcc-q1-01",
      matchId: matchBccDs.id,
      officialId: officialUser.officialProfile!.id,
      athleteId: "ath-1",
      teamId: "team-bcc",
      eventType: "THREE_POINT_MADE",
      points: 3,
      quarter: 1,
      gameClockDisplay: "09:12",
      videoElapsedSec: 48,
      isVerified: true,
    },
    {
      id: "evt-ds-q1-02",
      matchId: matchBccDs.id,
      officialId: officialUser.officialProfile!.id,
      athleteId: "ath-8",
      teamId: "team-debsirin",
      eventType: "TWO_POINT_MADE",
      points: 2,
      quarter: 1,
      gameClockDisplay: "08:44",
      videoElapsedSec: 76,
      isVerified: true,
    },
    {
      id: "evt-bcc-q2-01",
      matchId: matchBccDs.id,
      officialId: officialUser.officialProfile!.id,
      athleteId: "ath-5",
      teamId: "team-bcc",
      eventType: "TWO_POINT_MADE",
      points: 2,
      quarter: 2,
      gameClockDisplay: "05:10",
      videoElapsedSec: 290,
      isVerified: true,
    },
    {
      id: "evt-ds-q3-01",
      matchId: matchBccDs.id,
      officialId: officialUser.officialProfile!.id,
      athleteId: "ath-10",
      teamId: "team-debsirin",
      eventType: "THREE_POINT_MADE",
      points: 3,
      quarter: 3,
      gameClockDisplay: "03:15",
      videoElapsedSec: 405,
      isVerified: true,
    },
  ];

  for (const ev of extraEvents) {
    await prisma.matchEvent.create({
      data: ev,
    });
    createdEventsCount++;
  }

  console.log(`[STATCOURT DB SEED] Created ${createdEventsCount} verified MatchEvents from the official table.`);

  // 7.1 Seed Additional Historical Tournaments & Matches for Match Continuity Index
  const extraTournaments = [
    {
      id: "tourn-provincial-cup-2026",
      name: "Thailand High School Provincial Cup 2026",
      location: "Chiang Mai Provincial Gymnasium, Chiang Mai",
      startDate: new Date("2026-05-10"),
      endDate: new Date("2026-06-20"),
      category: "U18",
    },
    {
      id: "tourn-bangkok-youth-2025",
      name: "Bangkok Youth Winter Championship 2025",
      location: "Thai-Japan Bangkok Youth Center, Din Daeng",
      startDate: new Date("2025-11-15"),
      endDate: new Date("2025-12-20"),
      category: "U18",
    },
    {
      id: "tourn-national-youth-2025",
      name: "Thailand National Youth Games 2025",
      location: "Ratchaburi Provincial Sports Complex, Ratchaburi",
      startDate: new Date("2025-07-05"),
      endDate: new Date("2025-08-10"),
      category: "U18",
    },
  ];

  for (const t of extraTournaments) {
    await prisma.tournament.upsert({
      where: { id: t.id },
      update: {},
      create: t,
    });
  }

  // Generate historical match schedule across 4 timeframes
  // Ref Date: 2026-09-22
  // 1M: 4 matches (Aug 25 - Sep 20, 2026) -> tourn-toa-2026
  // 6M: 14 matches (May - Aug 2026) -> tourn-toa-2026, tourn-tcas-elite, tourn-provincial-cup-2026
  // 1Y: 14 matches (Oct 2025 - Apr 2026) -> tourn-bangkok-youth-2025
  // ALL: 10 matches (Jul - Aug 2025) -> tourn-national-youth-2025
  const matchSchedules = [
    // 1 Month (4 matches)
    { id: "m-hist-1m-01", tournId: "tourn-toa-2026", date: "2026-09-18T15:00:00Z" },
    { id: "m-hist-1m-02", tournId: "tourn-toa-2026", date: "2026-09-12T13:00:00Z" },
    { id: "m-hist-1m-03", tournId: "tourn-toa-2026", date: "2026-09-05T14:30:00Z" },
    { id: "m-hist-1m-04", tournId: "tourn-toa-2026", date: "2026-08-28T16:00:00Z" },

    // 6 Months (14 matches: May - Aug 2026)
    { id: "m-hist-6m-01", tournId: "tourn-tcas-elite", date: "2026-08-15T15:00:00Z" },
    { id: "m-hist-6m-02", tournId: "tourn-tcas-elite", date: "2026-08-08T13:00:00Z" },
    { id: "m-hist-6m-03", tournId: "tourn-provincial-cup-2026", date: "2026-06-18T14:00:00Z" },
    { id: "m-hist-6m-04", tournId: "tourn-provincial-cup-2026", date: "2026-06-14T16:00:00Z" },
    { id: "m-hist-6m-05", tournId: "tourn-provincial-cup-2026", date: "2026-06-10T14:00:00Z" },
    { id: "m-hist-6m-06", tournId: "tourn-provincial-cup-2026", date: "2026-06-04T13:00:00Z" },
    { id: "m-hist-6m-07", tournId: "tourn-provincial-cup-2026", date: "2026-05-28T15:30:00Z" },
    { id: "m-hist-6m-08", tournId: "tourn-provincial-cup-2026", date: "2026-05-24T17:00:00Z" },
    { id: "m-hist-6m-09", tournId: "tourn-provincial-cup-2026", date: "2026-05-20T14:00:00Z" },
    { id: "m-hist-6m-10", tournId: "tourn-provincial-cup-2026", date: "2026-05-16T13:00:00Z" },
    { id: "m-hist-6m-11", tournId: "tourn-provincial-cup-2026", date: "2026-05-12T15:00:00Z" },
    { id: "m-hist-6m-12", tournId: "tourn-toa-2026", date: "2026-07-20T16:00:00Z" },
    { id: "m-hist-6m-13", tournId: "tourn-toa-2026", date: "2026-07-15T14:00:00Z" },
    { id: "m-hist-6m-14", tournId: "tourn-toa-2026", date: "2026-07-08T13:30:00Z" },

    // 1 Year (14 matches: Oct 2025 - Apr 2026)
    { id: "m-hist-1y-01", tournId: "tourn-bangkok-youth-2025", date: "2025-12-18T15:00:00Z" },
    { id: "m-hist-1y-02", tournId: "tourn-bangkok-youth-2025", date: "2025-12-14T13:00:00Z" },
    { id: "m-hist-1y-03", tournId: "tourn-bangkok-youth-2025", date: "2025-12-10T14:00:00Z" },
    { id: "m-hist-1y-04", tournId: "tourn-bangkok-youth-2025", date: "2025-12-05T16:00:00Z" },
    { id: "m-hist-1y-05", tournId: "tourn-bangkok-youth-2025", date: "2025-11-28T14:00:00Z" },
    { id: "m-hist-1y-06", tournId: "tourn-bangkok-youth-2025", date: "2025-11-22T13:30:00Z" },
    { id: "m-hist-1y-07", tournId: "tourn-bangkok-youth-2025", date: "2025-11-18T15:00:00Z" },
    { id: "m-hist-1y-08", tournId: "tourn-bangkok-youth-2025", date: "2026-02-20T14:00:00Z" },
    { id: "m-hist-1y-09", tournId: "tourn-bangkok-youth-2025", date: "2026-02-15T16:00:00Z" },
    { id: "m-hist-1y-10", tournId: "tourn-bangkok-youth-2025", date: "2026-03-10T15:00:00Z" },
    { id: "m-hist-1y-11", tournId: "tourn-bangkok-youth-2025", date: "2026-03-15T13:30:00Z" },
    { id: "m-hist-1y-12", tournId: "tourn-bangkok-youth-2025", date: "2026-03-22T14:00:00Z" },
    { id: "m-hist-1y-13", tournId: "tourn-bangkok-youth-2025", date: "2026-04-05T15:00:00Z" },
    { id: "m-hist-1y-14", tournId: "tourn-bangkok-youth-2025", date: "2026-04-12T16:30:00Z" },

    // All Time (10 matches: July - Aug 2025)
    { id: "m-hist-all-01", tournId: "tourn-national-youth-2025", date: "2025-08-08T15:00:00Z" },
    { id: "m-hist-all-02", tournId: "tourn-national-youth-2025", date: "2025-08-04T13:00:00Z" },
    { id: "m-hist-all-03", tournId: "tourn-national-youth-2025", date: "2025-07-30T14:00:00Z" },
    { id: "m-hist-all-04", tournId: "tourn-national-youth-2025", date: "2025-07-26T16:00:00Z" },
    { id: "m-hist-all-05", tournId: "tourn-national-youth-2025", date: "2025-07-22T14:00:00Z" },
    { id: "m-hist-all-06", tournId: "tourn-national-youth-2025", date: "2025-07-18T13:00:00Z" },
    { id: "m-hist-all-07", tournId: "tourn-national-youth-2025", date: "2025-07-14T15:00:00Z" },
    { id: "m-hist-all-08", tournId: "tourn-national-youth-2025", date: "2025-07-10T14:00:00Z" },
    { id: "m-hist-all-09", tournId: "tourn-national-youth-2025", date: "2025-07-08T13:30:00Z" },
    { id: "m-hist-all-10", tournId: "tourn-national-youth-2025", date: "2025-07-06T15:00:00Z" },
  ];

  for (const m of matchSchedules) {
    await prisma.match.create({
      data: {
        id: m.id,
        tournamentId: m.tournId,
        homeTeamId: "team-bcc",
        awayTeamId: "team-debsirin",
        homeScore: 75 + Math.floor(Math.random() * 15),
        awayScore: 70 + Math.floor(Math.random() * 15),
        status: "COMPLETED",
        createdAt: new Date(m.date),
      },
    });
  }

  // Also include the 2 original matches in participants
  const allMatchIdsWithDates = [
    { id: matchBccDs.id, date: new Date("2026-09-20T14:00:00Z") },
    { id: "match-ac-sk-02", date: new Date("2026-09-21T16:00:00Z") },
    ...matchSchedules.map((m) => ({ id: m.id, date: new Date(m.date) })),
  ];

  // Seed MatchParticipants for all registered athletes
  let participantCount = 0;
  const allAthletes = await prisma.athleteProfile.findMany({ select: { id: true } });

  for (const ath of allAthletes) {
    const isStarter = !ath.id.endsWith("4") && !ath.id.endsWith("9");
    const matchesForAthlete = isStarter ? matchSchedules : matchSchedules.slice(0, 24);

    for (const matchInfo of matchesForAthlete) {
      const minutes = isStarter ? 24 + Math.floor(Math.random() * 10) : 12 + Math.floor(Math.random() * 8);
      await prisma.matchParticipant.create({
        data: {
          matchId: matchInfo.id,
          athleteId: ath.id,
          isStarter,
          minutesPlayed: minutes,
          createdAt: new Date(matchInfo.date),
        },
      });
      participantCount++;
    }
  }

  console.log(`[STATCOURT DB SEED] Created ${participantCount} MatchParticipant records for Activity Index continuity.`);

  // 8. Create Marketplace Items
  let createdMarketplaceCount = 0;
  for (const item of mockMarketplaceItems) {
    const sellerExists = await prisma.athleteProfile.findUnique({
      where: { id: item.sellerId },
    });

    const validSellerId = sellerExists ? item.sellerId : "ath-1";

    await prisma.marketplaceItem.create({
      data: {
        id: item.id,
        sellerId: validSellerId,
        title: item.title,
        brand: item.brand,
        model: item.model,
        size: item.size,
        condition: item.condition,
        category: item.category,
        priceThb: item.priceThb,
        isSold: item.isSold,
        imageUrls: JSON.stringify(item.imageUrls),
      },
    });
    createdMarketplaceCount++;
  }
  console.log(`[STATCOURT DB SEED] Created ${createdMarketplaceCount} verified Marketplace equipment items.`);

  // 9. Create Opportunities (Scholarships & Athlete Quotas)
  for (const opp of mockOpportunities) {
    await prisma.opportunity.create({
      data: {
        id: opp.id,
        title: opp.title,
        institution: opp.institution,
        type: opp.level === "UNIVERSITY" ? "ATHLETE_QUOTA" : "SCHOLARSHIP",
        level: opp.level,
        funding: opp.scholarshipType,
        deadline: new Date(opp.deadline),
        openSpots: opp.quotaCount,
        province: opp.province,
        region: opp.region,
        requirementsJson: JSON.stringify(opp.requirements),
        minGpax: opp.minGpax,
        contactEmail: opp.contactEmail,
        contactPhone: opp.contactPhone,
        description: opp.description,
        status: opp.status,
      },
    });
  }
  console.log(`[STATCOURT DB SEED] Created ${mockOpportunities.length} Opportunity & Scholarship postings.`);

  // 10. Create Academic Records for Athletes
  let acadCount = 0;
  for (const [athId, acadData] of Object.entries(mockAcademicRecords)) {
    const athleteExists = await prisma.athleteProfile.findUnique({ where: { id: athId } });
    if (!athleteExists) continue;
    for (const rec of acadData.records) {
      await prisma.academicRecord.create({
        data: {
          id: rec.id,
          athleteId: athId,
          schoolYear: rec.schoolYear,
          gradeLevel: rec.gradeLevel,
          semester: rec.semester,
          gpa: rec.gpa,
          isVerified: rec.isVerified,
        },
      });
      acadCount++;
    }
  }
  console.log(`[STATCOURT DB SEED] Created ${acadCount} Academic Records.`);

  // 11. Create DigitalPlayerPass for athletes
  let passCount = 0;
  for (const ath of allAthletes) {
    await prisma.digitalPlayerPass.create({
      data: {
        athleteId: ath.id,
        idCardNumberHash: `SHA256-${ath.id}-THAI-PASS`,
        dateOfBirth: new Date("2008-05-14T00:00:00Z"),
        verifiedAge: 18,
        qrPassCode: `STC-PASS-${ath.id.toUpperCase()}-VERIFIED`,
        status: "ACTIVE",
      },
    });
    passCount++;
  }
  console.log(`[STATCOURT DB SEED] Created ${passCount} DigitalPlayerPass records.`);

  // 12. Create PracticeSessions & Attendances
  let sessionCount = 0;
  for (const sess of mockPracticeSessions) {
    const session = await prisma.practiceSession.create({
      data: {
        id: sess.id,
        teamId: "team-bcc",
        title: sess.title,
        sessionDate: new Date(sess.date),
        durationMin: 120,
        location: sess.location,
      },
    });
    sessionCount++;

    for (const p of sess.roster) {
      const athleteExists = await prisma.athleteProfile.findUnique({ where: { id: p.athleteId } });
      if (athleteExists) {
        await prisma.playerAttendance.create({
          data: {
            sessionId: session.id,
            athleteId: p.athleteId,
            status: p.status,
            notes: p.notes,
          },
        });
      }
    }
  }
  console.log(`[STATCOURT DB SEED] Created ${sessionCount} Practice Sessions with attendances.`);

  // 13. Create PlaybookItems
  let playCount = 0;
  for (const play of mockPlaybookPlays) {
    await prisma.playbookItem.create({
      data: {
        id: play.id,
        teamId: "team-bcc",
        title: play.title,
        category: play.category,
        playJson: JSON.stringify(play),
      },
    });
    playCount++;
  }
  console.log(`[STATCOURT DB SEED] Created ${playCount} 2D Playbook Items.`);

  // 14. Create InjuryLogs
  let injuryCount = 0;
  for (const inj of mockInjuryLogs) {
    const athleteExists = await prisma.athleteProfile.findUnique({ where: { id: inj.athleteId } });
    if (athleteExists) {
      await prisma.injuryLog.create({
        data: {
          id: inj.id,
          athleteId: inj.athleteId,
          injuryType: inj.injuryType,
          severity: inj.severity,
          occurredDate: new Date(inj.occurredDate),
          status: inj.status,
          notes: inj.treatmentProtocol,
        },
      });
      injuryCount++;
    }
  }
  console.log(`[STATCOURT DB SEED] Created ${injuryCount} Injury Log records.`);

  console.log("[STATCOURT DB SEED] Real database seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error("[STATCOURT DB SEED ERROR]", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/serverAuth";
import { requestOriginAllowed } from "@/lib/auth/session";
import {
  generateRoundRobinFixtures,
  generateKnockoutFixtures,
  generateCourtSchedule,
  detectScheduleConflicts,
  type FixtureDraft,
} from "@/lib/tournaments/bracketEngine";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!requestOriginAllowed(request)) {
    return NextResponse.json({ success: false, error: "Invalid origin" }, { status: 403 });
  }

  const auth = await requireRole(request, ["ADMIN", "OFFICIAL"]);
  if (!auth.authorized) return auth.response;

  try {
    const tournamentId = params.id;
    const body = await request.json().catch(() => ({}));

    const {
      format = "GROUP_STAGE", // "GROUP_STAGE" | "SINGLE_ELIMINATION"
      groupCount = 2,
      startDate,
      dailyStartTime = "09:00",
      matchDurationMins = 90,
      minRestMins = 120,
      venue,
      courts = ["คอร์ท 1", "คอร์ท 2"],
      lockRosters = true,
      clearExistingMatches = false,
    } = body;

    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        registrations: {
          where: { status: "APPROVED" },
          include: { team: true },
        },
      },
    });

    if (!tournament) {
      return NextResponse.json(
        { success: false, error: "ไม่พบข้อมูลทัวร์นาเมนต์นี้" },
        { status: 404 }
      );
    }

    const approvedTeams = tournament.registrations.map((r) => ({
      id: r.team.id,
      name: r.team.name,
    }));

    if (approvedTeams.length < 2) {
      return NextResponse.json(
        {
          success: false,
          error: "ต้องมีทีมที่ผ่านการรับรอง (APPROVED) อย่างน้อย 2 ทีมขึ้นไปเพื่อจัดสายการแข่งขัน",
        },
        { status: 400 }
      );
    }

    const targetStartDate = startDate ? new Date(startDate) : new Date(tournament.startDate);
    const targetVenue = venue || tournament.venue || "สนามกีฬากลาง";
    const targetCourts = Array.isArray(courts) && courts.length > 0 ? courts : ["คอร์ทหลัก"];

    let allFixtures: FixtureDraft[] = [];
    const groupInitialStandings: Array<{ teamId: string; groupName: string }> = [];

    if (format === "SINGLE_ELIMINATION") {
      allFixtures = generateKnockoutFixtures(approvedTeams);
    } else {
      // GROUP_STAGE
      const numGroups = Math.max(1, Math.min(groupCount, Math.floor(approvedTeams.length / 2)));
      const groupLetters = ["Group A", "Group B", "Group C", "Group D"];

      const partitionedGroups: Record<string, typeof approvedTeams> = {};
      for (let g = 0; g < numGroups; g++) {
        const letter = groupLetters[g] || `Group ${g + 1}`;
        partitionedGroups[letter] = [];
      }

      // Distribute teams evenly into groups
      approvedTeams.forEach((team, idx) => {
        const gIdx = idx % numGroups;
        const letter = groupLetters[gIdx] || `Group ${gIdx + 1}`;
        partitionedGroups[letter].push(team);
        groupInitialStandings.push({ teamId: team.id, groupName: letter });
      });

      // Generate round robin pairings for each group
      for (const [gName, gTeams] of Object.entries(partitionedGroups)) {
        const gFixtures = generateRoundRobinFixtures(gTeams, gName);
        allFixtures.push(...gFixtures);
      }
    }

    if (allFixtures.length === 0) {
      return NextResponse.json(
        { success: false, error: "ไม่สามารถสร้างคู่แข่งขันได้จากจำนวนทีมที่กำหนด" },
        { status: 400 }
      );
    }

    // Schedule fixtures on courts
    const scheduledMatches = generateCourtSchedule(allFixtures, {
      startDate: targetStartDate,
      dailyStartTime,
      matchDurationMins: Number(matchDurationMins) || 90,
      minRestMins: Number(minRestMins) || 120,
      venue: targetVenue,
      courts: targetCourts,
    });

    // Detect any residual conflicts
    const conflicts = detectScheduleConflicts(scheduledMatches);

    // Commit to Database within a transaction
    const createdMatches = await prisma.$transaction(async (tx) => {
      // Optional: Clear existing non-final matches
      if (clearExistingMatches) {
        await tx.match.deleteMany({
          where: {
            tournamentId,
            resultStatus: "DRAFT",
          },
        });
      }

      // Insert scheduled matches
      const matchPromises = scheduledMatches.map((m) =>
        tx.match.create({
          data: {
            tournamentId,
            homeTeamId: m.homeTeamId,
            awayTeamId: m.awayTeamId,
            round: m.round,
            scheduledAt: m.scheduledAt,
            venue: m.venue,
            courtName: m.courtName,
            status: "SCHEDULED",
            resultStatus: "DRAFT",
          },
        })
      );

      const savedMatches = await Promise.all(matchPromises);

      // Upsert Initial Group Standings if Group Stage
      for (const st of groupInitialStandings) {
        await tx.tournamentStanding.upsert({
          where: {
            tournamentId_teamId: { tournamentId, teamId: st.teamId },
          },
          create: {
            tournamentId,
            teamId: st.teamId,
            groupName: st.groupName,
            played: 0,
            won: 0,
            lost: 0,
            pointsFor: 0,
            pointsAgainst: 0,
            pointDiff: 0,
            points: 0,
            rank: 1,
          },
          update: {
            groupName: st.groupName,
          },
        });
      }

      // Lock rosters if requested
      if (lockRosters) {
        await tx.tournamentRegistration.updateMany({
          where: {
            tournamentId,
            status: "APPROVED",
          },
          data: {
            isRosterLocked: true,
          },
        });
      }

      // Log in AuditLog
      await tx.auditLog.create({
        data: {
          userId: auth.userId!,
          action: "GENERATE_TOURNAMENT_BRACKETS",
          targetEntity: "Tournament",
          targetId: tournamentId,
          metadataJson: JSON.stringify({
            format,
            teamsCount: approvedTeams.length,
            matchesGenerated: savedMatches.length,
            lockRosters,
            conflictsCount: conflicts.length,
          }),
        },
      });

      return savedMatches;
    });

    return NextResponse.json({
      success: true,
      message: `สร้างสายการแข่งขันและจัดตารางสำเร็จ ${createdMatches.length} แมตช์${lockRosters ? " พร้อมล็อกรายชื่อนักกีฬาแล้ว" : ""}`,
      matchesCount: createdMatches.length,
      generatedCount: createdMatches.length,
      conflictsCount: conflicts.length,
      conflicts,
    });
  } catch (error) {
    console.error("[Tournament Brackets Generator API] Error:", error);
    return NextResponse.json(
      { success: false, error: "เกิดข้อผิดพลาดในการสร้างสายและตารางการแข่งขัน" },
      { status: 500 }
    );
  }
}

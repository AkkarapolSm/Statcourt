import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/serverAuth";

export const dynamic = "force-dynamic";

export interface AuditCheckItem {
  id: string;
  category: "SCORE_LEDGER" | "ROSTER" | "RULES_FOULS" | "PERIOD_CHRONOLOGY" | "OFFICIAL_CHAIN";
  titleTh: string;
  titleEn: string;
  status: "PASS" | "WARN" | "FAIL";
  detailsTh: string;
  detailsEn: string;
  evidence?: Record<string, any>;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Authorization: Only ADMIN or OFFICIAL can access pre-approval audit
    const auth = await requireRole(request, ["ADMIN", "OFFICIAL"]);
    if (!auth.authorized) return auth.response;

    const matchId = params.id;
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        tournament: {
          select: { id: true, name: true, category: true },
        },
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
        participants: {
          include: { athlete: true },
        },
        officialAssignments: {
          where: { status: "ACTIVE" },
          include: {
            user: {
              include: { officialProfile: true },
            },
          },
        },
        resultApprovals: {
          orderBy: { createdAt: "desc" },
          include: {
            approver: {
              select: { displayName: true, email: true, role: true },
            },
          },
        },
      },
    });

    if (!match) {
      return NextResponse.json({ success: false, error: "ไม่พบการแข่งขันในระบบ" }, { status: 404 });
    }

    // 2. Fetch all active match events
    const activeEvents = await prisma.matchEvent.findMany({
      where: { matchId, reversedAt: null },
      include: {
        athlete: true,
      },
      orderBy: { createdAt: "asc" },
    });

    const reversedEventsCount = await prisma.matchEvent.count({
      where: { matchId, reversedAt: { not: null } },
    });

    const checks: AuditCheckItem[] = [];

    // =========================================================================
    // PILLAR 1: SCORE & EVENT LEDGER INTEGRITY
    // =========================================================================
    let ledgerHomeScore = 0;
    let ledgerAwayScore = 0;

    for (const ev of activeEvents) {
      if (ev.teamId === match.homeTeamId) {
        ledgerHomeScore += ev.points || 0;
      } else if (ev.teamId === match.awayTeamId) {
        ledgerAwayScore += ev.points || 0;
      }
    }

    const homeScoreMatches = match.homeScore === ledgerHomeScore;
    const awayScoreMatches = match.awayScore === ledgerAwayScore;
    const scoreDiffHome = match.homeScore - ledgerHomeScore;
    const scoreDiffAway = match.awayScore - ledgerAwayScore;

    if (homeScoreMatches && awayScoreMatches) {
      checks.push({
        id: "SCORE_LEDGER_MATCH",
        category: "SCORE_LEDGER",
        titleTh: "ความสอดคล้องของคะแนนรวมเทียบ Play-by-Play Ledger",
        titleEn: "Authoritative Score vs Event Ledger Reconciliation",
        status: "PASS",
        detailsTh: `คะแนนใบบันทึกตรงกับเหตุการณ์ Play-by-Play 100% (${match.homeTeam.name}: ${match.homeScore} แต้ม, ${match.awayTeam.name}: ${match.awayScore} แต้ม)`,
        detailsEn: `Match scoreboard scores match event ledger sum perfectly (${match.homeScore} - ${match.awayScore}).`,
        evidence: {
          matchHomeScore: match.homeScore,
          ledgerHomeScore,
          matchAwayScore: match.awayScore,
          ledgerAwayScore,
          reversedEventsCount,
        },
      });
    } else {
      checks.push({
        id: "SCORE_LEDGER_MATCH",
        category: "SCORE_LEDGER",
        titleTh: "คะแนนรวมไม่ตรงกับผลรวมของเหตุการณ์ (Score Drift Detected)",
        titleEn: "Score Drift Detected Between Ledger & Scoreboard",
        status: "FAIL",
        detailsTh: `พบส่วนต่างคะแนน! ฝั่งเหย้าส่วนต่าง: ${scoreDiffHome > 0 ? `+${scoreDiffHome}` : scoreDiffHome}, ฝั่งเยือนส่วนต่าง: ${scoreDiffAway > 0 ? `+${scoreDiffAway}` : scoreDiffAway} แต้ม`,
        detailsEn: `Discrepancy found! Home diff: ${scoreDiffHome}, Away diff: ${scoreDiffAway}. System reconciliation is recommended.`,
        evidence: {
          matchHomeScore: match.homeScore,
          ledgerHomeScore,
          matchAwayScore: match.awayScore,
          ledgerAwayScore,
          scoreDiffHome,
          scoreDiffAway,
        },
      });
    }

    // =========================================================================
    // PILLAR 2: ROSTER INTEGRITY & INELIGIBLE ATHLETES
    // =========================================================================
    const homeRosterIds = new Set(match.homeTeam.roster.map((r) => r.athleteId));
    const awayRosterIds = new Set(match.awayTeam.roster.map((r) => r.athleteId));
    const participantAthleteIds = new Set(match.participants.map((p) => p.athleteId));

    const unregisteredScorers: Array<{ athleteId: string; name: string; team: string; points: number }> = [];

    for (const ev of activeEvents) {
      if (!ev.athleteId) continue;
      const isHomeTeam = ev.teamId === match.homeTeamId;
      const validRoster = isHomeTeam ? homeRosterIds : awayRosterIds;

      const isInRoster = validRoster.has(ev.athleteId);
      const isParticipant = participantAthleteIds.has(ev.athleteId);

      if (!isInRoster && !isParticipant) {
        if (!unregisteredScorers.some((u) => u.athleteId === ev.athleteId)) {
          unregisteredScorers.push({
            athleteId: ev.athleteId,
            name: ev.athlete ? `${ev.athlete.firstName} ${ev.athlete.lastName}` : `ID: ${ev.athleteId}`,
            team: isHomeTeam ? match.homeTeam.name : match.awayTeam.name,
            points: ev.points || 0,
          });
        }
      }
    }

    if (unregisteredScorers.length === 0) {
      checks.push({
        id: "ROSTER_VERIFICATION",
        category: "ROSTER",
        titleTh: "การตรวจสอบคุณสมบัติและรายชื่อนักกีฬาทางการ",
        titleEn: "Official Roster & Athlete Eligibility Check",
        status: "PASS",
        detailsTh: "นักกีฬาทุกคนที่ทำแต้มและมีสถิติในแมตช์นี้ มีรายชื่อใน Roster ทางการครบถ้วน 100%",
        detailsEn: "All participating athletes with logged events are verified members of official team rosters.",
      });
    } else {
      checks.push({
        id: "ROSTER_VERIFICATION",
        category: "ROSTER",
        titleTh: "พบนักกีฬาที่ไม่มีชื่อในบัญชีรายชื่อทางการ (Unregistered Athlete)",
        titleEn: "Unregistered Athletes Recorded in Match Events",
        status: "FAIL",
        detailsTh: `พบผู้เล่น ${unregisteredScorers.length} คน ที่ไม่มีในรายชื่อทางการแต่มีสถิติการเล่น: ${unregisteredScorers.map((u) => `${u.name} (${u.team})`).join(", ")}`,
        detailsEn: `Found ${unregisteredScorers.length} athletes with recorded events not on official roster: ${unregisteredScorers.map((u) => u.name).join(", ")}.`,
        evidence: { unregisteredScorers },
      });
    }

    // =========================================================================
    // PILLAR 3: FOULS & FIBA RULES ENFORCEMENT
    // =========================================================================
    const foulsPerAthlete: Record<string, { count: number; name: string; team: string }> = {};
    const foulDisqualificationViolations: Array<{ athleteId: string; name: string; fouls: number }> = [];

    for (const ev of activeEvents) {
      if (!ev.athleteId) continue;
      const isFoul = ["FOUL", "PERSONAL_FOUL", "TECHNICAL_FOUL", "UNSPORTSMANLIKE_FOUL"].includes(ev.eventType);
      if (isFoul) {
        if (!foulsPerAthlete[ev.athleteId]) {
          foulsPerAthlete[ev.athleteId] = {
            count: 0,
            name: ev.athlete ? `${ev.athlete.firstName} ${ev.athlete.lastName}` : ev.athleteId,
            team: ev.teamId === match.homeTeamId ? match.homeTeam.name : match.awayTeam.name,
          };
        }
        foulsPerAthlete[ev.athleteId].count += 1;
      }
    }

    for (const [athId, info] of Object.entries(foulsPerAthlete)) {
      if (info.count > 5) {
        foulDisqualificationViolations.push({
          athleteId: athId,
          name: info.name,
          fouls: info.count,
        });
      }
    }

    if (foulDisqualificationViolations.length === 0) {
      checks.push({
        id: "FIBA_FOUL_LIMIT",
        category: "RULES_FOULS",
        titleTh: "การควบคุมการฟาวล์และโทษตัดสิทธิ์ตามกติกา FIBA",
        titleEn: "FIBA 5-Foul Disqualification Enforcement",
        status: "PASS",
        detailsTh: "ไม่มีผู้เล่นที่มีจำนวนฟาวล์เกินเกณฑ์มาตรฐาน FIBA (สูงสุด 5 ฟาวล์)",
        detailsEn: "No athletes exceeded the official FIBA 5-personal-foul limit.",
      });
    } else {
      checks.push({
        id: "FIBA_FOUL_LIMIT",
        category: "RULES_FOULS",
        titleTh: "พบผู้เล่นฟาวล์เกินขีดจำกัดมาตรฐาน (Foul Out Breach)",
        titleEn: "Player Exceeded Maximum Foul Limit",
        status: "WARN",
        detailsTh: `พบผู้เล่น ${foulDisqualificationViolations.length} คนที่มีฟาวล์มากกว่า 5 ครั้ง: ${foulDisqualificationViolations.map((f) => `${f.name} (${f.fouls} ฟาวล์)`).join(", ")}`,
        detailsEn: `${foulDisqualificationViolations.length} athletes have more than 5 personal fouls recorded.`,
        evidence: { foulDisqualificationViolations },
      });
    }

    // Tie check (Basketball cannot end in a tie without Overtime)
    if (match.homeScore === match.awayScore && match.status === "COMPLETED") {
      checks.push({
        id: "TIE_GAME_REGULATION",
        category: "RULES_FOULS",
        titleTh: "คะแนนเสมอกันในการแข่งขันจบเวลาปกติ (Tie Game Warning)",
        titleEn: "Completed Match Has Tied Score Without Overtime",
        status: "WARN",
        detailsTh: `ผลการแข่งขันเสมอกัน ${match.homeScore} - ${match.awayScore} กติกาบาสเกตบอลสากลต้องมีช่วงต่อเวลาพิเศษ (Overtime)`,
        detailsEn: `Match ended tied (${match.homeScore}-${match.awayScore}). Basketball games require overtime periods to decide a winner.`,
      });
    }

    // =========================================================================
    // PILLAR 4: PERIOD & CHRONOLOGICAL COMPLETENESS
    // =========================================================================
    const quartersRecorded = new Set(activeEvents.map((e) => e.quarter));
    const hasAll4Quarters = [1, 2, 3, 4].every((q) => quartersRecorded.has(q));

    if (hasAll4Quarters) {
      checks.push({
        id: "PERIOD_COMPLETION",
        category: "PERIOD_CHRONOLOGY",
        titleTh: "ความครบถ้วนของควอเตอร์การแข่งขัน (Q1 - Q4)",
        titleEn: "Quarter Completeness Across All Periods",
        status: "PASS",
        detailsTh: `มีการบันทึกเหตุการณ์ครบทั้ง 4 ควอเตอร์ (รวม ${activeEvents.length} เหตุการณ์)`,
        detailsEn: `Match events recorded across all 4 regulation quarters (${activeEvents.length} total events).`,
        evidence: { quartersRecorded: Array.from(quartersRecorded), totalEvents: activeEvents.length },
      });
    } else {
      const missingQuarters = [1, 2, 3, 4].filter((q) => !quartersRecorded.has(q));
      checks.push({
        id: "PERIOD_COMPLETION",
        category: "PERIOD_CHRONOLOGY",
        titleTh: "ข้อมูลควอเตอร์ไม่ครบถ้วน (Missing Quarter Records)",
        titleEn: "Missing Event Records for Regulation Quarters",
        status: "WARN",
        detailsTh: `ไม่พบเหตุการณ์ในควอเตอร์: ${missingQuarters.map((q) => `Q${q}`).join(", ")}`,
        detailsEn: `No events recorded in quarters: ${missingQuarters.map((q) => `Q${q}`).join(", ")}.`,
        evidence: { missingQuarters },
      });
    }

    // =========================================================================
    // PILLAR 5: OFFICIAL ASSIGNMENT & AUDIT CHAIN
    // =========================================================================
    const activeAssignments = match.officialAssignments || [];
    const hasAssignedOfficial = activeAssignments.length > 0;
    const assignedOfficial = activeAssignments[0]?.user?.officialProfile?.fullName || null;
    const submitApproval = match.resultApprovals.find((a) => a.action === "SUBMIT");

    if (hasAssignedOfficial) {
      checks.push({
        id: "OFFICIAL_CHAIN_VERIFICATION",
        category: "OFFICIAL_CHAIN",
        titleTh: "การมอบหมายและตรวจสอบความรับผิดชอบของกรรมการโต๊ะ",
        titleEn: "Table Official Assignment & Chain of Custody",
        status: "PASS",
        detailsTh: `กรรมการโต๊ะผู้รับผิดชอบ: ${assignedOfficial} (มีประวัติยื่นส่งผล: ${submitApproval ? new Date(submitApproval.createdAt).toLocaleString("th-TH") : "ยังไม่ยื่น"})`,
        detailsEn: `Assigned Official: ${assignedOfficial}. Chain of custody verified.`,
        evidence: {
          assignedOfficial,
          submittedAt: submitApproval?.createdAt || null,
        },
      });
    } else {
      checks.push({
        id: "OFFICIAL_CHAIN_VERIFICATION",
        category: "OFFICIAL_CHAIN",
        titleTh: "ไม่พบการมอบหมายกรรมการโต๊ะอย่างเป็นทางการ",
        titleEn: "No Official Assigned to Match Record",
        status: "WARN",
        detailsTh: "แมตช์นี้ไม่มีการผูกกรรมการโต๊ะคะแนนประจำแมตช์ในระบบ แนะนำให้ระบุผู้รับผิดชอบก่อนรับรองผล",
        detailsEn: "No table official assigned to this match. Assigning an accredited official is recommended.",
      });
    }

    // Venue & Scheduling Check
    if (match.scheduledAt && match.venue) {
      checks.push({
        id: "SCHEDULE_METADATA",
        category: "OFFICIAL_CHAIN",
        titleTh: "ความสมบูรณ์ของวัน เวลา และสนามแข่งขัน",
        titleEn: "Match Schedule & Venue Information",
        status: "PASS",
        detailsTh: `สนาม: ${match.venue} (${match.courtName || "คอร์ทหลัก"}) • เวลา: ${new Date(match.scheduledAt).toLocaleString("th-TH")}`,
        detailsEn: `Venue: ${match.venue}, Scheduled: ${new Date(match.scheduledAt).toISOString()}`,
      });
    } else {
      checks.push({
        id: "SCHEDULE_METADATA",
        category: "OFFICIAL_CHAIN",
        titleTh: "ข้อมูลสนามหรือเวลาแข่งขันยังไม่ครบถ้วน",
        titleEn: "Incomplete Schedule or Venue Metadata",
        status: "WARN",
        detailsTh: "ไม่มีการระบุสถานที่แข่งขันหรือวันเวลาที่ชัดเจนในระบบ",
        detailsEn: "Missing venue or scheduled datetime.",
      });
    }

    // =========================================================================
    // OVERALL STATUS DETERMINATION
    // =========================================================================
    const hasFail = checks.some((c) => c.status === "FAIL");
    const hasWarn = checks.some((c) => c.status === "WARN");

    let overallStatus: "READY" | "WARNINGS_DETECTED" | "BLOCKED" = "READY";
    if (hasFail) {
      overallStatus = "BLOCKED";
    } else if (hasWarn) {
      overallStatus = "WARNINGS_DETECTED";
    }

    return NextResponse.json({
      success: true,
      matchId,
      match: {
        id: match.id,
        tournamentName: match.tournament?.name || "Official Tournament",
        homeTeam: { id: match.homeTeam.id, name: match.homeTeam.name, score: match.homeScore },
        awayTeam: { id: match.awayTeam.id, name: match.awayTeam.name, score: match.awayScore },
        status: match.status,
        resultStatus: match.resultStatus,
        scheduledAt: match.scheduledAt,
        venue: match.venue,
        courtName: match.courtName,
      },
      audit: {
        overallStatus,
        canApprove: !hasFail,
        scoreSummary: {
          matchHomeScore: match.homeScore,
          ledgerHomeScore,
          matchAwayScore: match.awayScore,
          ledgerAwayScore,
          isBalanced: homeScoreMatches && awayScoreMatches,
        },
        eventStats: {
          activeEvents: activeEvents.length,
          reversedEvents: reversedEventsCount,
        },
        passCount: checks.filter((c) => c.status === "PASS").length,
        warnCount: checks.filter((c) => c.status === "WARN").length,
        failCount: checks.filter((c) => c.status === "FAIL").length,
        checks,
      },
    });
  } catch (error) {
    console.error("[PRE-APPROVAL AUDIT API] Error:", error);
    return NextResponse.json(
      { success: false, error: "เกิดข้อผิดพลาดในการตรวจสอบความครบถ้วนของผลการแข่งขัน" },
      { status: 500 }
    );
  }
}

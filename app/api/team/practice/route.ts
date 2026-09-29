import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/serverAuth";
import { canManageTeam } from "@/lib/auth/resources";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get("teamId") || "team-bcc";
    if (!(await canManageTeam(request, teamId))) return NextResponse.json({ error: "ไม่มีสิทธิ์ดูการฝึกซ้อม" }, { status: 403 });

    const sessions = await prisma.practiceSession.findMany({
      where: { teamId },
      include: {
        attendances: {
          include: {
            athlete: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                jerseyNumber: true,
                primaryPosition: true,
              },
            },
          },
        },
      },
      orderBy: {
        sessionDate: "desc",
      },
    });

    if (sessions.length > 0) {
      const formatted = sessions.map((sess) => ({
        id: sess.id,
        title: sess.title,
        date: sess.sessionDate.toISOString().split("T")[0],
        timeDisplay: `${sess.durationMin} นาที`,
        sessionType: "TACTICAL",
        location: sess.location,
        coachInCharge: "Head Coach",
        roster: sess.attendances.map((att) => ({
          athleteId: att.athleteId,
          athleteName: `${att.athlete.firstName} ${att.athlete.lastName}`,
          jerseyNumber: att.athlete.jerseyNumber || 0,
          position: att.athlete.primaryPosition,
          status: att.status,
          checkInTime: att.status === "PRESENT" ? "16:15" : undefined,
          disciplineRating: 96.5,
          notes: att.notes || "",
        })),
      }));

      return NextResponse.json(
        {
          success: true,
          count: formatted.length,
          data: formatted,
          source: "PRISMA_SQLITE_PERSISTENT",
        },
        { headers: { "Cache-Control": "private, no-store" } }
      );
    }

    return NextResponse.json(
      {
        success: true,
        count: 0,
        data: [],
        source: "EMPTY_RECORD",
      },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  } catch (error) {
    console.error("[API PRACTICE GET] DB error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "ฐานข้อมูลขัดข้อง ไม่สามารถดึงข้อมูลตารางฝึกซ้อมได้ (Database Unavailable)",
      },
      { status: 503 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Require Coach or Admin authentication
    const auth = await requireRole(request, ["COACH", "ADMIN"]);
    if (!auth.authorized) {
      return auth.response!;
    }

    const body = await request.json();
    const { action } = body;

    // Action 1: Update attendance for a single player in a session
    if (action === "UPDATE_ATTENDANCE") {
      const { sessionId, athleteId, status, notes } = body;
      if (!sessionId || !athleteId || !status) {
        return NextResponse.json(
          { success: false, error: "sessionId, athleteId, status are required" },
          { status: 400 }
        );
      }
      const existingSession = await prisma.practiceSession.findUnique({ where: { id: sessionId }, select: { teamId: true } });
      if (!existingSession || !(await canManageTeam(request, existingSession.teamId))) {
        return NextResponse.json({ error: "ไม่มีสิทธิ์แก้ไขการฝึกซ้อม" }, { status: 403 });
      }

      const attendance = await prisma.playerAttendance.upsert({
        where: {
          sessionId_athleteId: {
            sessionId,
            athleteId,
          },
        },
        update: {
          status,
          notes: notes !== undefined ? notes : undefined,
        },
        create: {
          sessionId,
          athleteId,
          status,
          notes: notes || null,
        },
      });

      return NextResponse.json({
        success: true,
        data: attendance,
        message: "อัปเดตสถานะการเข้าซ้อมเรียบร้อยแล้ว",
        source: "PRISMA_SQLITE_PERSISTENT",
      });
    }

    // Action 2: Create a new practice session
    const { teamId = "team-bcc", title, sessionDate, durationMin = 120, location } = body;
    if (!(await canManageTeam(request, teamId))) return NextResponse.json({ error: "ไม่มีสิทธิ์แก้ไขการฝึกซ้อม" }, { status: 403 });
    if (!title || !sessionDate) {
      return NextResponse.json(
        { success: false, error: "กรุณาระบุหัวข้อการฝึกซ้อมและวันที่" },
        { status: 400 }
      );
    }

    const session = await prisma.practiceSession.create({
      data: {
        teamId,
        title,
        sessionDate: new Date(sessionDate),
        durationMin: Number(durationMin) || 120,
        location: location || "โรงยิมเนเซียมหลัก",
      },
    });

    // Populate roster from team
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: { roster: true },
    });

    if (team && team.roster.length > 0) {
      for (const r of team.roster) {
        await prisma.playerAttendance.create({
          data: {
            sessionId: session.id,
            athleteId: r.athleteId,
            status: "PRESENT",
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: session,
      message: "สร้างตารางการฝึกซ้อมสำเร็จ",
      source: "PRISMA_SQLITE_PERSISTENT",
    });
  } catch (error) {
    console.error("[API PRACTICE POST ERROR]:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการบันทึกการฝึกซ้อม",
      },
      { status: 500 }
    );
  }
}

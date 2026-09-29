import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUserSession } from "@/lib/auth/serverAuth";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUserSession(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "กรุณาเข้าสู่ระบบก่อนทำการสมัครทีม (Authentication Required)" },
        { status: 401 }
      );
    }

    const tournamentId = params.id;
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        registrations: true,
      },
    });

    if (!tournament) {
      return NextResponse.json(
        { success: false, error: "ไม่พบข้อมูลทัวร์นาเมนต์นี้ในระบบ" },
        { status: 404 }
      );
    }

    if (tournament.status === "COMPLETED") {
      return NextResponse.json(
        { success: false, error: "ทัวร์นาเมนต์นี้ปิดการรับสมัครและเสร็จสิ้นแล้ว" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const teamId = String(body.teamId || "").trim();
    const rosterIds: string[] = Array.isArray(body.rosterIds) ? body.rosterIds : [];
    const notes = String(body.notes || "").trim();

    if (!teamId) {
      return NextResponse.json(
        { success: false, error: "กรุณาระบุทีมที่ต้องการลงทะเบียนแข่งขัน" },
        { status: 400 }
      );
    }

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        roster: {
          include: {
            athlete: true,
          },
        },
        coach: true,
      },
    });

    if (!team) {
      return NextResponse.json(
        { success: false, error: "ไม่พบข้อมูลทีมที่เลือกในระบบ" },
        { status: 404 }
      );
    }

    // Check user permission: coach of team or admin
    const isAdmin = user.role === "ADMIN";
    const isCoachOfTeam = team.coach?.userId === user.id;
    const isTeamMember = await prisma.teamMembership.findFirst({
      where: {
        userId: user.id,
        teamId: team.id,
        status: "ACTIVE",
      },
    });

    if (!isAdmin && !isCoachOfTeam && !isTeamMember) {
      return NextResponse.json(
        { success: false, error: "คุณไม่มีสิทธิ์ในการลงทะเบียนแข่งขันแทนทีมนี้ (เฉพาะโค้ชหรือผู้จัดการทีม)" },
        { status: 403 }
      );
    }

    // Check existing registration
    const existingRegistration = await prisma.tournamentRegistration.findUnique({
      where: {
        tournamentId_teamId: {
          tournamentId,
          teamId,
        },
      },
    });

    if (existingRegistration && existingRegistration.isRosterLocked) {
      return NextResponse.json(
        { success: false, error: "รายชื่อทีมนี้ได้รับการตรวจสอบและล็อกรายชื่อแล้ว ไม่สามารถแก้ไขได้" },
        { status: 400 }
      );
    }

    // Default to full team roster if none specified
    const selectedRosterIds = rosterIds.length > 0 
      ? rosterIds 
      : team.roster.map((r) => r.athleteId);

    if (selectedRosterIds.length < 5) {
      return NextResponse.json(
        { success: false, error: "ต้องมีผู้เล่นอย่างน้อย 5 คนในการส่งรายชื่อเข้าร่วมแข่งขัน" },
        { status: 400 }
      );
    }

    const registration = await prisma.tournamentRegistration.upsert({
      where: {
        tournamentId_teamId: {
          tournamentId,
          teamId,
        },
      },
      update: {
        rosterJson: JSON.stringify(selectedRosterIds),
        notes: notes || undefined,
        status: "PENDING",
      },
      create: {
        tournamentId,
        teamId,
        status: "PENDING",
        rosterJson: JSON.stringify(selectedRosterIds),
        notes: notes || null,
      },
    });

    // Update registered teams count on tournament
    const totalRegistrations = await prisma.tournamentRegistration.count({
      where: { tournamentId },
    });

    await prisma.tournament.update({
      where: { id: tournamentId },
      data: { registeredTeams: totalRegistrations },
    });

    return NextResponse.json({
      success: true,
      message: `ส่งใบสมัครเข้าร่วมการแข่งขัน '${tournament.name}' เรียบร้อยแล้ว อยู่ระหว่างรอการตรวจสอบคุณสมบัติ`,
      data: registration,
    });
  } catch (error) {
    console.error("[TOURNAMENT REGISTER API] Error:", error);
    return NextResponse.json(
      { success: false, error: "ไม่สามารถประมวลผลการสมัครได้ กรุณาลองใหม่อีกครั้ง" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tournamentId = params.id;
    const registrations = await prisma.tournamentRegistration.findMany({
      where: { tournamentId },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            shortName: true,
            institution: true,
            logoUrl: true,
            primaryColor: true,
          },
        },
      },
      orderBy: { submittedAt: "asc" },
    });

    return NextResponse.json({
      success: true,
      count: registrations.length,
      data: registrations,
    });
  } catch (error) {
    console.error("[TOURNAMENT GET REGISTRATIONS] Error:", error);
    return NextResponse.json(
      { success: false, error: "ไม่สามารถดึงข้อมูลรายชื่อทีมที่สมัครได้" },
      { status: 500 }
    );
  }
}

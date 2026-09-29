import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/serverAuth";
import { canAccessAthlete, canManageTeam } from "@/lib/auth/resources";
import { getSessionUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const athleteId = searchParams.get("athleteId");
    const teamId = searchParams.get("teamId");
    const user = await getSessionUser(request);
    if (!user || user.accountStatus !== "ACTIVE") {
      return NextResponse.json(
        { success: false, error: "กรุณาเข้าสู่ระบบก่อนเข้าถึงข้อมูลการแพทย์" },
        { status: 401, headers: { "Cache-Control": "private, no-store" } }
      );
    }

    const isAdmin = user.role === "ADMIN";
    const isSelfAthlete = user.role === "ATHLETE" && athleteId && user.athleteProfile?.id === athleteId;
    const isCoachOfTeam = user.role === "COACH" && teamId && (await canManageTeam(request, teamId));
    const isCoachOfAthlete = user.role === "COACH" && athleteId && (await canAccessAthlete(request, athleteId, "read"));

    if (!isAdmin && !isSelfAthlete && !isCoachOfTeam && !isCoachOfAthlete) {
      return NextResponse.json(
        { success: false, error: "ไม่มีสิทธิ์ดูข้อมูลประวัติการบาดเจ็บ (Medical PII Restricted)" },
        { status: 403, headers: { "Cache-Control": "private, no-store" } }
      );
    }

    const where: any = {};
    if (athleteId) where.athleteId = athleteId;
    if (teamId) where.athlete = { teamRosters: { some: { teamId } } };

    const injuries = await prisma.injuryLog.findMany({
      where,
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
      orderBy: {
        occurredDate: "desc",
      },
    });

    if (injuries.length > 0) {
      const formatted = injuries.map((inj) => ({
        id: inj.id,
        athleteId: inj.athleteId,
        athleteName: `${inj.athlete.firstName} ${inj.athlete.lastName}`,
        jerseyNumber: inj.athlete.jerseyNumber || 0,
        injuryType: inj.injuryType,
        severity: inj.severity,
        occurredDate: inj.occurredDate.toISOString().split("T")[0],
        expectedReturnDate: inj.expectedReturn ? inj.expectedReturn.toISOString().split("T")[0] : undefined,
        status: inj.status,
        treatmentProtocol: inj.notes || "",
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
    console.error("[API INJURIES GET] DB error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "ฐานข้อมูลขัดข้อง ไม่สามารถดึงบันทึกอาการบาดเจ็บได้ (Database Unavailable)",
      },
      { status: 503 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Medical PII protection: Require Coach, Official, or Admin authentication
    const auth = await requireRole(request, ["COACH", "ADMIN"]);
    if (!auth.authorized) {
      return auth.response!;
    }

    const body = await request.json();
    const {
      athleteId,
      injuryType,
      severity = "MILD",
      occurredDate = new Date().toISOString(),
      expectedReturnDate,
      status = "ACTIVE",
      treatmentProtocol,
    } = body;

    if (!athleteId || !injuryType) {
      return NextResponse.json(
        { success: false, error: "กรุณาระบุนักกีฬาและประเภทอาการบาดเจ็บ" },
        { status: 400 }
      );
    }
    if (!(await canAccessAthlete(request, athleteId, "write"))) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์บันทึกอาการบาดเจ็บของนักกีฬาคนนี้" }, { status: 403 });
    }

    const injury = await prisma.injuryLog.create({
      data: {
        athleteId,
        injuryType,
        severity,
        occurredDate: new Date(occurredDate),
        expectedReturn: expectedReturnDate ? new Date(expectedReturnDate) : null,
        status,
        notes: treatmentProtocol || null,
      },
    });

    return NextResponse.json({
      success: true,
      data: injury,
      message: "บันทึกอาการบาดเจ็บของนักกีฬาสำเร็จ",
      source: "PRISMA_SQLITE_PERSISTENT",
    });
  } catch (error) {
    console.error("[API INJURIES POST ERROR]:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการบันทึกข้อมูลบาดเจ็บ",
      },
      { status: 500 }
    );
  }
}

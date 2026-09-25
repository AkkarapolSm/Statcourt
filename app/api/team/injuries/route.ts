import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/serverAuth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const athleteId = searchParams.get("athleteId");

    const where: any = {};
    if (athleteId) where.athleteId = athleteId;

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

      return NextResponse.json({
        success: true,
        count: formatted.length,
        data: formatted,
        source: "PRISMA_SQLITE_PERSISTENT",
      });
    }

    // Check seed data if DB is empty
    const { mockInjuryLogs } = await import("@/lib/db/phase3-data");
    const filtered = athleteId
      ? mockInjuryLogs.filter((m) => m.athleteId === athleteId)
      : mockInjuryLogs;

    return NextResponse.json({
      success: true,
      count: filtered.length,
      data: filtered,
      source: "FALLBACK_MOCK",
    });
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
    const auth = requireRole(request, ["COACH", "OFFICIAL", "ADMIN"]);
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

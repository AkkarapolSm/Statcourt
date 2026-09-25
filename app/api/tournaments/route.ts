import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/serverAuth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const region = searchParams.get("region");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const where: any = {};
    if (category && category !== "ALL") {
      where.category = category;
    }
    if (region && region !== "ALL") {
      where.region = region;
    }
    if (status && status !== "ALL") {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { location: { contains: search } },
        { province: { contains: search } },
        { organizer: { contains: search } },
      ];
    }

    const tournaments = await prisma.tournament.findMany({
      where,
      include: {
        matches: {
          select: {
            id: true,
            status: true,
            homeScore: true,
            awayScore: true,
            homeTeam: { select: { id: true, shortName: true, name: true } },
            awayTeam: { select: { id: true, shortName: true, name: true } },
          },
        },
      },
      orderBy: {
        startDate: "asc",
      },
    });

    if (tournaments.length > 0) {
      return NextResponse.json({
        success: true,
        count: tournaments.length,
        data: tournaments,
        source: "PRISMA_SQLITE_PERSISTENT",
      });
    }

    // Check seed data
    const { mockTournaments } = await import("@/lib/db/seed-data");
    return NextResponse.json({
      success: true,
      count: mockTournaments.length,
      data: mockTournaments,
      source: "FALLBACK_MOCK",
    });
  } catch (error) {
    console.error("[API TOURNAMENTS] Database error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "ฐานข้อมูลขัดข้อง ไม่สามารถดึงรายการแข่งขันได้ (Database Unavailable)",
      },
      { status: 503 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Require Coach, Official, or Admin authentication to create tournament
    const auth = requireRole(request, ["COACH", "OFFICIAL", "ADMIN"]);
    if (!auth.authorized) {
      return auth.response!;
    }

    const body = await request.json();
    const {
      name,
      organizer,
      category = "U18",
      region,
      province,
      venue,
      location,
      startDate,
      endDate,
      maxTeams = 16,
      entryFeeThb = 0,
      contactPerson,
      contactPhone,
      rulesPdfUrl,
    } = body;

    if (!name || !startDate || !endDate) {
      return NextResponse.json(
        { success: false, error: "ชื่อการแข่งขัน วันที่เริ่มต้น และวันที่สิ้นสุด เป็นข้อมูลที่จำเป็น" },
        { status: 400 }
      );
    }

    const tournament = await prisma.tournament.create({
      data: {
        name,
        organizer: organizer || "ฝ่ายจัดการแข่งขันอิสระ",
        category,
        region: region || "กรุงเทพฯ และปริมณฑล",
        province: province || "กรุงเทพมหานคร",
        venue: venue || location || "สนามกีฬากลาง",
        location: location || venue || "กรุงเทพมหานคร",
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: "OPEN",
        maxTeams: Number(maxTeams) || 16,
        registeredTeams: 0,
        entryFeeThb: Number(entryFeeThb) || 0,
        contactPerson,
        contactPhone,
        rulesPdfUrl,
      },
    });

    return NextResponse.json({
      success: true,
      data: tournament,
      message: "สร้างรายการแข่งขันในระบบสำเร็จ",
      source: "PRISMA_SQLITE_PERSISTENT",
    });
  } catch (error) {
    console.error("[API TOURNAMENTS POST ERROR]:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create tournament",
      },
      { status: 500 }
    );
  }
}

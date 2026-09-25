import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/serverAuth";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const athleteId = params.id;

    const athlete = await prisma.athleteProfile.findUnique({
      where: { id: athleteId },
      include: {
        seasonStats: true,
        academicRecords: {
          orderBy: [
            { schoolYear: "desc" },
            { semester: "desc" },
          ],
        },
        digitalPlayerPass: true,
        teamRosters: {
          include: {
            team: true,
          },
        },
        events: {
          include: {
            match: {
              include: {
                homeTeam: true,
                awayTeam: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (athlete) {
      return NextResponse.json({
        success: true,
        data: athlete,
        source: "PRISMA_SQLITE_PERSISTENT",
      });
    }

    // Check seed data if not found in Prisma DB for this exact athleteId
    const { mockAthleteProfiles, mockLeaderboardAthletes } = await import("@/lib/db/seed-data");
    const fallbackAthlete = mockAthleteProfiles[athleteId];
    if (fallbackAthlete) {
      const stats = mockLeaderboardAthletes.find((s) => s.athleteId === athleteId);
      return NextResponse.json({
        success: true,
        data: {
          ...fallbackAthlete,
          seasonStats: stats ? [stats] : [],
        },
        source: "FALLBACK_MOCK",
      });
    }

    return NextResponse.json(
      { success: false, error: `ไม่พบข้อมูลนักกีฬา '${athleteId}' ในระบบ (Athlete Not Found)` },
      { status: 404 }
    );
  } catch (error) {
    console.error(`[API ATHLETE DETAIL] DB error for ${params.id}:`, error);
    return NextResponse.json(
      {
        success: false,
        error: "ฐานข้อมูลขัดข้อง ไม่สามารถดึงข้อมูลโปรไฟล์นักกีฬาได้ (Database Unavailable)",
      },
      { status: 503 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const athleteId = params.id;

    // Verify role permissions (Athlete themselves, coach, official, or admin)
    const auth = requireRole(request, ["ATHLETE", "COACH", "OFFICIAL", "ADMIN"]);
    if (!auth.authorized) {
      return auth.response!;
    }

    const body = await request.json();

    const {
      heightCm,
      weightKg,
      wingspanCm,
      standingReachCm,
      primaryPosition,
      secondaryPosition,
      jerseyNumber,
      schoolOrClub,
      province,
      bio,
    } = body;

    // Validate height
    if (heightCm !== undefined && (typeof heightCm !== "number" || heightCm < 120 || heightCm > 240)) {
      return NextResponse.json(
        { success: false, error: "ส่วนสูงต้องอยู่ระหว่าง 120 - 240 เซนติเมตร" },
        { status: 400 }
      );
    }

    // Validate weight
    if (weightKg !== undefined && weightKg !== null && (typeof weightKg !== "number" || weightKg < 30 || weightKg > 200)) {
      return NextResponse.json(
        { success: false, error: "น้ำหนักต้องอยู่ระหว่าง 30 - 200 กิโลกรัม" },
        { status: 400 }
      );
    }

    // Validate wingspan
    if (wingspanCm !== undefined && wingspanCm !== null && (typeof wingspanCm !== "number" || wingspanCm < 120 || wingspanCm > 260)) {
      return NextResponse.json(
        { success: false, error: "ช่วงแขน (Wingspan) ต้องอยู่ระหว่าง 120 - 260 เซนติเมตร" },
        { status: 400 }
      );
    }

    // Validate standing reach
    if (standingReachCm !== undefined && standingReachCm !== null && (typeof standingReachCm !== "number" || standingReachCm < 140 || standingReachCm > 320)) {
      return NextResponse.json(
        { success: false, error: "ระยะเอื้อมยืนแตะ (Standing Reach) ต้องอยู่ระหว่าง 140 - 320 เซนติเมตร" },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (heightCm !== undefined) updateData.heightCm = heightCm;
    if (weightKg !== undefined) updateData.weightKg = weightKg;
    if (wingspanCm !== undefined) updateData.wingspanCm = wingspanCm;
    if (standingReachCm !== undefined) updateData.standingReachCm = standingReachCm;
    if (primaryPosition !== undefined) updateData.primaryPosition = primaryPosition;
    if (secondaryPosition !== undefined) updateData.secondaryPosition = secondaryPosition;
    if (jerseyNumber !== undefined) updateData.jerseyNumber = jerseyNumber;
    if (schoolOrClub !== undefined) updateData.schoolOrClub = schoolOrClub;
    if (province !== undefined) updateData.province = province;
    if (bio !== undefined) updateData.bio = bio;

    try {
      const updated = await prisma.athleteProfile.update({
        where: { id: athleteId },
        data: updateData,
        include: {
          seasonStats: true,
          teamRosters: {
            include: { team: true },
          },
        },
      });

      return NextResponse.json({
        success: true,
        data: updated,
        message: "อัปเดตข้อมูลสรีระและโปรไฟล์นักกีฬาสำเร็จ",
        source: "PRISMA_SQLITE_PERSISTENT",
      });
    } catch (dbErr) {
      console.warn(`[API ATHLETE PATCH] DB record not found or error, checking mock for ${athleteId}:`, dbErr);
      const { mockAthleteProfiles } = await import("@/lib/db/seed-data");
      const current = mockAthleteProfiles[athleteId];
      if (!current) {
        return NextResponse.json(
          { success: false, error: `ไม่พบข้อมูลนักกีฬา '${athleteId}' ในระบบ` },
          { status: 404 }
        );
      }
      
      const merged = {
        ...current,
        ...updateData,
        id: athleteId,
      };
      mockAthleteProfiles[athleteId] = merged;

      return NextResponse.json({
        success: true,
        data: merged,
        message: "อัปเดตข้อมูลสรีระและโปรไฟล์นักกีฬาสำเร็จ (In-Memory)",
        source: "FALLBACK_MOCK_UPDATED",
      });
    }
  } catch (error) {
    console.error("[API ATHLETE PATCH ERROR]:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์",
      },
      { status: 500 }
    );
  }
}


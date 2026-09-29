import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSessionUser } from "@/lib/auth/serverAuth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    const { searchParams } = new URL(request.url);
    const opportunityId = searchParams.get("opportunityId");
    const status = searchParams.get("status");
    const requestedAthleteId = searchParams.get("athleteId");

    // 1. Athlete Tracking Mode
    if (user?.role === "ATHLETE" || requestedAthleteId) {
      const targetAthleteId = requestedAthleteId || user?.athleteProfile?.id || "ath-01";
      const applications = await prisma.opportunityApplication.findMany({
        where: {
          athleteId: targetAthleteId,
        },
        include: {
          opportunity: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return NextResponse.json({
        success: true,
        mode: "ATHLETE_TRACKING",
        count: applications.length,
        data: applications,
      });
    }

    // 2. Recruiter / Coach / Admin Screening Mode
    const where: any = {};
    if (opportunityId && opportunityId !== "ALL") where.opportunityId = opportunityId;
    if (status && status !== "ALL") where.status = status;

    const applications = await prisma.opportunityApplication.findMany({
      where,
      include: {
        opportunity: true,
        athlete: {
          include: {
            seasonStats: {
              take: 1,
              orderBy: { season: "desc" },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      mode: "RECRUITER_SCREENING",
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    console.error("[APPLICATIONS GET ERROR]:", error);
    return NextResponse.json(
      { success: false, error: "ไม่สามารถดึงข้อมูลใบสมัครได้" },
      { status: 500 }
    );
  }
}

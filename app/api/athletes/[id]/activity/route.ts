import { NextRequest, NextResponse } from "next/server";
import { getAthleteActivityMetrics } from "@/lib/analytics/athlete-activity";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const athleteId = params.id;
    const metrics = await getAthleteActivityMetrics(athleteId);

    return NextResponse.json({
      success: true,
      athleteId,
      data: metrics,
      source: "PRISMA_SQLITE_PERSISTENT",
    });
  } catch (error) {
    console.error("[API ATHLETE ACTIVITY ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch athlete activity metrics",
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getAthleteStatsLineage } from "@/lib/stats/statsLineageService";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const athleteId = params.id;
    if (!athleteId) {
      return NextResponse.json(
        { success: false, error: "กรุณาระบุรหัสประจำตัวนักกีฬา (Athlete ID is required)" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const season = searchParams.get("season") || "2026";
    const statType = searchParams.get("statType") || "ALL";

    const lineage = await getAthleteStatsLineage(athleteId, { season, statType });

    if (!lineage) {
      return NextResponse.json(
        { success: false, error: `ไม่พบประวัติและที่มาสถิติของนักกีฬา '${athleteId}' ในระบบ` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      ...lineage,
    });
  } catch (error) {
    console.error("[Stats Lineage API] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "เกิดข้อผิดพลาดในการดึงข้อมูลประวัติและที่มาของสถิติ (Failed to load stats lineage)",
      },
      { status: 500 }
    );
  }
}

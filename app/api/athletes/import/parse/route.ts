import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/serverAuth";
import { requestOriginAllowed } from "@/lib/auth/session";
import {
  parseCsvContent,
  processAthleteImports,
} from "@/lib/import/deduplicationEngine";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!requestOriginAllowed(request)) {
    return NextResponse.json({ success: false, error: "Invalid origin" }, { status: 403 });
  }

  // Coaches, Admins, and Officials can import rosters
  const auth = await requireRole(request, ["ADMIN", "COACH", "OFFICIAL"]);
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json().catch(() => ({}));
    const { csvContent, teamId } = body;

    if (!csvContent || typeof csvContent !== "string" || csvContent.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "กรุณาระบุเนื้อหาไฟล์ CSV (CSV content is required)" },
        { status: 400 }
      );
    }

    // 1. Parse raw CSV lines into normalized objects
    const rawRows = parseCsvContent(csvContent);
    if (rawRows.length === 0) {
      return NextResponse.json(
        { success: false, error: "ไม่พบข้อมูลในไฟล์ CSV หรือหัวตารางไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    // 2. Fetch existing athletes from DB for deduplication matching
    const existingAthletes = await prisma.athleteProfile.findMany({
      include: {
        user: {
          select: {
            email: true,
            phoneNumber: true,
          },
        },
      },
    });

    // 3. Run Deduplication & Entity Resolution Algorithm
    const stagedItems = processAthleteImports(rawRows, existingAthletes);

    // 4. Calculate summary statistics
    const summary = {
      totalRows: stagedItems.length,
      newCount: stagedItems.filter((i) => i.status === "NEW").length,
      exactMatchCount: stagedItems.filter((i) => i.status === "EXACT_MATCH").length,
      potentialDuplicateCount: stagedItems.filter((i) => i.status === "POTENTIAL_DUPLICATE").length,
      invalidCount: stagedItems.filter((i) => i.status === "INVALID").length,
    };

    // If target team provided, fetch team name for context
    let targetTeamName: string | null = null;
    if (teamId) {
      const team = await prisma.team.findUnique({
        where: { id: teamId },
        select: { name: true },
      });
      targetTeamName = team?.name || null;
    }

    return NextResponse.json({
      success: true,
      summary,
      targetTeamId: teamId || null,
      targetTeamName,
      items: stagedItems,
    });
  } catch (error) {
    console.error("[Athlete Import Parse API] Error:", error);
    return NextResponse.json(
      { success: false, error: "เกิดข้อผิดพลาดในการวิเคราะห์ไฟล์ CSV" },
      { status: 500 }
    );
  }
}

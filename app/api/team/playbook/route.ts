import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/serverAuth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get("teamId") || "team-bcc";

    const plays = await prisma.playbookItem.findMany({
      where: { teamId },
      orderBy: { createdAt: "desc" },
    });

    if (plays.length > 0) {
      const parsed = plays.map((p) => {
        try {
          return JSON.parse(p.playJson);
        } catch {
          return {
            id: p.id,
            title: p.title,
            category: p.category,
          };
        }
      });

      return NextResponse.json({
        success: true,
        count: parsed.length,
        data: parsed,
        source: "PRISMA_SQLITE_PERSISTENT",
      });
    }

    // Check seed plays for the specified team
    const { mockPlaybookPlays } = await import("@/lib/db/phase3-data");
    return NextResponse.json({
      success: true,
      count: mockPlaybookPlays.length,
      data: mockPlaybookPlays,
      source: "FALLBACK_MOCK",
    });
  } catch (error) {
    console.error("[API PLAYBOOK GET] DB error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "ฐานข้อมูลขัดข้อง ไม่สามารถดึงแผนการเล่นได้ (Database Unavailable)",
      },
      { status: 503 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Require Coach or Admin to save tactical plays
    const auth = requireRole(request, ["COACH", "ADMIN"]);
    if (!auth.authorized) {
      return auth.response!;
    }

    const body = await request.json();
    const { teamId = "team-bcc", title, category = "OFFENSE", playJson } = body;

    if (!title) {
      return NextResponse.json(
        { success: false, error: "กรุณาระบุชื่อแผนการเล่น" },
        { status: 400 }
      );
    }

    const play = await prisma.playbookItem.create({
      data: {
        teamId,
        title,
        category,
        playJson: typeof playJson === "string" ? playJson : JSON.stringify(playJson || {}),
      },
    });

    return NextResponse.json({
      success: true,
      data: play,
      message: "บันทึกแผนการเล่นลงฐานข้อมูลสำเร็จ",
      source: "PRISMA_SQLITE_PERSISTENT",
    });
  } catch (error) {
    console.error("[API PLAYBOOK POST ERROR]:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการบันทึกแผน",
      },
      { status: 500 }
    );
  }
}

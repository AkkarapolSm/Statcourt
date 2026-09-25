import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireOfficial } from "@/lib/auth/serverAuth";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const matchId = params.id;

    const events = await prisma.matchEvent.findMany({
      where: { matchId },
      include: {
        athlete: true,
        official: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      count: events.length,
      data: events,
      source: "PRISMA_SQLITE_PERSISTENT",
    });
  } catch (error) {
    console.error(`[API GET MATCH EVENTS] DB query failed for ${params.id}:`, error);
    return NextResponse.json(
      {
        success: false,
        error: "ฐานข้อมูลขัดข้อง ไม่สามารถดึงข้อมูลเหตุการณ์การแข่งขันได้ (Database Unavailable)",
      },
      { status: 503 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const matchId = params.id;

    // 1. Require certified technical table official authentication
    const auth = requireOfficial(request, matchId);
    if (!auth.authorized) {
      return auth.response!;
    }

    const body = await request.json();
    const {
      clientEventId,
      idempotencyKey,
      athleteId,
      teamId,
      eventType,
      points = 0,
      quarter = 1,
      gameClockDisplay = "10:00",
      videoElapsedSec,
    } = body;

    const eventKey = clientEventId || idempotencyKey;

    if (!eventType) {
      return NextResponse.json(
        { success: false, error: "eventType is required" },
        { status: 400 }
      );
    }

    // 2. Check idempotency: If eventKey was provided, check if already recorded
    if (eventKey) {
      const existing = await prisma.matchEvent.findUnique({
        where: { id: eventKey },
        include: { athlete: true, official: true },
      });
      if (existing) {
        return NextResponse.json({
          success: true,
          data: existing,
          message: "Event already recorded (Idempotent response)",
          source: "PRISMA_SQLITE_PERSISTENT",
          isDuplicate: true,
        });
      }
    }

    // 3. Verify match exists
    const match = await prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      return NextResponse.json(
        { success: false, error: "Match not found" },
        { status: 404 }
      );
    }

    // 4. Resolve authenticated official profile
    const officialId = auth.official?.officialId || "off-01";
    let validOfficialId = officialId;
    const officialExists = await prisma.officialProfile.findUnique({
      where: { id: officialId },
    });
    if (!officialExists) {
      const defaultOfficial = await prisma.officialProfile.findFirst();
      if (defaultOfficial) {
        validOfficialId = defaultOfficial.id;
      }
    }

    // 5. Use atomic transaction for Event Creation + Score Update
    const pts = Number(points) || 0;
    const isHome = teamId ? teamId === match.homeTeamId : false;

    const [newEvent] = await prisma.$transaction(async (tx) => {
      const created = await tx.matchEvent.create({
        data: {
          ...(eventKey ? { id: eventKey } : {}),
          matchId,
          officialId: validOfficialId,
          athleteId: athleteId || null,
          teamId: teamId || null,
          eventType,
          points: pts,
          quarter: Number(quarter),
          gameClockDisplay,
          videoElapsedSec: videoElapsedSec ? Number(videoElapsedSec) : null,
          isVerified: true,
        },
        include: {
          athlete: true,
          official: true,
        },
      });

      if (pts > 0 && teamId) {
        await tx.match.update({
          where: { id: matchId },
          data: {
            homeScore: isHome ? match.homeScore + pts : match.homeScore,
            awayScore: !isHome ? match.awayScore + pts : match.awayScore,
          },
        });
      }

      return [created];
    });

    return NextResponse.json({
      success: true,
      data: newEvent,
      message: "Event recorded successfully by official scorekeeper",
      source: "PRISMA_SQLITE_PERSISTENT",
    });
  } catch (error) {
    console.error("[API CREATE MATCH EVENT ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to record event",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const matchId = params.id;

    // Require official authorization
    const auth = requireOfficial(request, matchId);
    if (!auth.authorized) {
      return auth.response!;
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json(
        { success: false, error: "eventId is required to reverse an event" },
        { status: 400 }
      );
    }

    // Find the event
    const event = await prisma.matchEvent.findUnique({
      where: { id: eventId },
    });

    if (!event || event.matchId !== matchId) {
      return NextResponse.json(
        { success: false, error: "Event not found or does not belong to this match" },
        { status: 404 }
      );
    }

    const match = await prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      return NextResponse.json(
        { success: false, error: "Match not found" },
        { status: 404 }
      );
    }

    const isHome = event.teamId === match.homeTeamId;
    const pts = event.points || 0;

    // Reverse inside transaction
    await prisma.$transaction(async (tx) => {
      await tx.matchEvent.delete({
        where: { id: eventId },
      });

      if (pts > 0 && event.teamId) {
        await tx.match.update({
          where: { id: matchId },
          data: {
            homeScore: isHome ? Math.max(0, match.homeScore - pts) : match.homeScore,
            awayScore: !isHome ? Math.max(0, match.awayScore - pts) : match.awayScore,
          },
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: `เหตุการณ์ ${eventId} ถูกย้อนกลับ (Reversed) สำเร็จ และปรับแต้มคะแนนในระบบเรียบร้อยแล้ว`,
      reversedEventId: eventId,
      deductedPoints: pts,
    });
  } catch (error) {
    console.error("[API DELETE MATCH EVENT ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to reverse event",
      },
      { status: 500 }
    );
  }
}

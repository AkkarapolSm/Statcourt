import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireOfficial } from "@/lib/auth/serverAuth";
import { requestOriginAllowed } from "@/lib/auth/session";
import {
  recordMatchEventCommand,
  reverseMatchEventCommand,
  ALLOWED_EVENT_POINTS,
} from "@/lib/live/matchCommandHandler";

export const dynamic = "force-dynamic";

const eventInclude = {
  athlete: { select: { id: true, firstName: true, lastName: true, jerseyNumber: true } },
  official: { select: { id: true, fullName: true, licenseNumber: true } },
} as const;

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const events = await prisma.matchEvent.findMany({
    where: { matchId: params.id },
    include: eventInclude,
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return NextResponse.json({ success: true, count: events.length, data: events });
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  if (!requestOriginAllowed(request)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const auth = await requireOfficial(request, params.id);
  if (!auth.authorized || !auth.official || !auth.userId) return auth.response;

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON ไม่ถูกต้อง (Malformed JSON)" }, { status: 400 });
  }

  const result = await recordMatchEventCommand({
    matchId: params.id,
    clientEventId: String(body.clientEventId || body.idempotencyKey || ""),
    officialId: auth.official.officialId,
    userId: auth.userId,
    teamId: String(body.teamId || ""),
    athleteId: String(body.athleteId || ""),
    eventType: String(body.eventType || ""),
    points: Number(body.points),
    quarter: Number(body.quarter),
    gameClockDisplay: String(body.gameClockDisplay || ""),
    videoElapsedSec: body.videoElapsedSec == null ? null : Number(body.videoElapsedSec),
  });

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: result.statusCode });
  }

  return NextResponse.json(
    { success: true, data: result.data, isDuplicate: result.isDuplicate },
    { status: result.statusCode }
  );
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  if (!requestOriginAllowed(request)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const auth = await requireOfficial(request, params.id);
  if (!auth.authorized || !auth.userId || !auth.official) return auth.response;

  const eventId = request.nextUrl.searchParams.get("eventId");
  if (!eventId) return NextResponse.json({ error: "กรุณาระบุเหตุการณ์ที่ต้องการย้อนกลับ" }, { status: 400 });

  const result = await reverseMatchEventCommand({
    matchId: params.id,
    eventId,
    officialId: auth.official.officialId,
    userId: auth.userId,
  });

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: result.statusCode });
  }

  return NextResponse.json({ success: true, reversedEventId: result.data?.reversedEventId });
}

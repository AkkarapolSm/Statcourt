import { NextRequest, NextResponse } from "next/server";
import {
  getLiveState,
  subscribeToLiveMatch,
  subscribeToMatchDeltas,
} from "@/lib/live/liveMatchBroker";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

// Active SSE connection counter to enforce connection capacity limits
const activeSseConnections = new Map<string, number>();
const MAX_CONNECTIONS_PER_MATCH = 500;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const matchId = params.id;

  // 1. Connection Capacity Protection
  const currentConns = activeSseConnections.get(matchId) || 0;
  if (currentConns >= MAX_CONNECTIONS_PER_MATCH) {
    return new NextResponse(
      JSON.stringify({ error: "การเชื่อมต่อเต็มขีดจำกัดชั่วคราว (Connection limit exceeded)" }),
      {
        status: 429,
        headers: { "Content-Type": "application/json", "Retry-After": "5" },
      }
    );
  }

  // 2. Validate Match Existence before opening long-lived stream
  try {
    const matchExists = await prisma.match.findUnique({
      where: { id: matchId },
      select: { id: true },
    });
    if (!matchExists && matchId !== "match-bcc-ds-01") {
      return new NextResponse(
        JSON.stringify({ error: "ไม่พบการแข่งขันในระบบ (Match not found)" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
  } catch {
    // If DB check fails, proceed if match-bcc-ds-01 or log error
  }

  activeSseConnections.set(matchId, currentConns + 1);
  const encoder = new TextEncoder();
  const lastEventId = request.headers.get("last-event-id");

  const stream = new ReadableStream({
    async start(controller) {
      // 1. Send initial authoritative snapshot with sequence ID
      try {
        const initialState = await getLiveState(matchId);
        controller.enqueue(
          encoder.encode(
            `id: ${initialState.sequence}\nevent: snapshot\ndata: ${JSON.stringify(initialState)}\n\n`
          )
        );
      } catch (err) {
        console.error("[SSE START ERROR]:", err);
      }

      // 2. Subscribe to lightweight incremental delta events
      const unsubscribeDelta = subscribeToMatchDeltas(matchId, (delta) => {
        try {
          controller.enqueue(
            encoder.encode(
              `id: ${delta.sequence}\nevent: delta\ndata: ${JSON.stringify(delta)}\n\n`
            )
          );
        } catch {
          // Stream might be closed by client
        }
      });

      // 3. Subscribe to full-state updates for backward compatibility
      const unsubscribeFull = subscribeToLiveMatch(matchId, (state) => {
        try {
          controller.enqueue(
            encoder.encode(
              `id: ${state.sequence}\nevent: update\ndata: ${JSON.stringify(state)}\n\n`
            )
          );
        } catch {
          // Stream might be closed by client
        }
      });

      // 4. Heartbeat keepalive ping every 15s to prevent intermediary proxy disconnects
      const pingInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`event: ping\ndata: {}\n\n`));
        } catch {
          clearInterval(pingInterval);
        }
      }, 15000);

      // 5. Clean up on client disconnect
      request.signal.addEventListener("abort", () => {
        clearInterval(pingInterval);
        unsubscribeDelta();
        unsubscribeFull();
        const active = activeSseConnections.get(matchId) || 1;
        if (active <= 1) {
          activeSseConnections.delete(matchId);
        } else {
          activeSseConnections.set(matchId, active - 1);
        }
        try {
          controller.close();
        } catch {
          // Ignore close errors
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

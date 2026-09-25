import { NextRequest } from "next/server";
import { getLiveState, subscribeToLiveMatch } from "@/lib/live/liveMatchBroker";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const matchId = params.id;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // 1. Send initial snapshot immediately upon connection
      try {
        const initialState = await getLiveState(matchId);
        controller.enqueue(
          encoder.encode(`event: snapshot\ndata: ${JSON.stringify(initialState)}\n\n`)
        );
      } catch (err) {
        console.error("[SSE START ERROR]:", err);
      }

      // 2. Subscribe to live broker updates from table official console
      const unsubscribe = subscribeToLiveMatch(matchId, (state) => {
        try {
          controller.enqueue(
            encoder.encode(`event: update\ndata: ${JSON.stringify(state)}\n\n`)
          );
        } catch {
          // Stream might already be closed by client
        }
      });

      // 3. Keepalive ping every 15s to prevent intermediate proxies from dropping connection
      const pingInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`event: ping\ndata: {}\n\n`));
        } catch {
          clearInterval(pingInterval);
        }
      }, 15000);

      // 4. Clean up on client disconnect
      request.signal.addEventListener("abort", () => {
        clearInterval(pingInterval);
        unsubscribe();
        try {
          controller.close();
        } catch {
          // Ignore close errors if already closed
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
    },
  });
}

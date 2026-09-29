import { MatchEvent } from "@/lib/types";

const DB_NAME = "StatCourtTH_Scorekeeper";
const STORE_NAME = "offline_events_queue";
const DB_VERSION = 1;
const MAX_LOCAL_QUEUE_ITEMS = 500;

export interface QueuedEvent {
  id: string;
  event: MatchEvent;
  synced: boolean;
  timestamp: number;
  retryCount?: number;
  lastError?: string;
}

// Singleton database connection cache
let cachedDbPromise: Promise<any> | null = null;

/**
 * Initializes and caches IndexedDB for offline courtside scorekeeping queue.
 */
async function getDb() {
  if (typeof window === "undefined" || !("indexedDB" in window)) {
    return null;
  }
  if (!cachedDbPromise) {
    const { openDB } = await import("idb");
    cachedDbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
          store.createIndex("synced", "synced", { unique: false });
          store.createIndex("timestamp", "timestamp", { unique: false });
        }
      },
    }).catch((err) => {
      cachedDbPromise = null;
      throw err;
    });
  }
  return cachedDbPromise;
}

/**
 * Enqueues a match event courtside into IndexedDB or capped localStorage.
 */
export async function enqueueScorekeeperEvent(event: MatchEvent): Promise<void> {
  const item: QueuedEvent = {
    id: event.id,
    event,
    synced: false,
    timestamp: Date.now(),
    retryCount: 0,
  };

  try {
    const db = await getDb();
    if (db) {
      await db.put(STORE_NAME, item);
      return;
    }
  } catch (err) {
    console.warn("IndexedDB unavailable, falling back to localStorage", err);
  }

  // Fallback to capped localStorage with overflow emergency preservation
  if (typeof window !== "undefined") {
    try {
      const existing: QueuedEvent[] = JSON.parse(
        localStorage.getItem("statcourt_offline_queue") || "[]"
      );
      if (existing.length >= MAX_LOCAL_QUEUE_ITEMS) {
        console.warn("[OFFLINE QUEUE] Queue reached maximum capacity. Preserving overflow in emergency backup.");
        // Back up before trimming so no events are lost silently
        const overflow = JSON.parse(localStorage.getItem("statcourt_offline_overflow_backup") || "[]");
        overflow.push(...existing.slice(0, 50));
        localStorage.setItem("statcourt_offline_overflow_backup", JSON.stringify(overflow.slice(-2000)));
      }
      const trimmed = existing.slice(-MAX_LOCAL_QUEUE_ITEMS + 1);
      trimmed.push(item);
      localStorage.setItem("statcourt_offline_queue", JSON.stringify(trimmed));
    } catch (e) {
      console.error("Local storage error:", e);
    }
  }
}

/**
 * Checks if offline queue is approaching capacity limit (> 400 items).
 */
export async function isQueueApproachingCapacity(): Promise<boolean> {
  const count = await getPendingOfflineCount();
  return count >= 400;
}

/**
 * Exports all pending offline events as formatted JSON for manual recovery.
 */
export async function exportOfflineEventsJson(matchId?: string): Promise<string> {
  const events = await getPendingOfflineEvents();
  const filtered = matchId ? events.filter((e) => e.event.matchId === matchId) : events;
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      matchId: matchId || "ALL_MATCHES",
      totalEvents: filtered.length,
      events: filtered.map((q) => q.event),
    },
    null,
    2
  );
}

/**
 * Removes successfully synced events from the offline queue.
 */
export async function markEventsSynced(eventIds: string[]): Promise<void> {
  const idSet = new Set(eventIds);
  try {
    const db = await getDb();
    if (db) {
      for (const id of eventIds) {
        await db.delete(STORE_NAME, id);
      }
      return;
    }
  } catch (err) {
    console.warn("IndexedDB sync cleanup failed", err);
  }

  if (typeof window !== "undefined") {
    try {
      const existing: QueuedEvent[] = JSON.parse(
        localStorage.getItem("statcourt_offline_queue") || "[]"
      );
      const remaining = existing.filter((item) => !idSet.has(item.id));
      localStorage.setItem("statcourt_offline_queue", JSON.stringify(remaining));
    } catch (e) {
      console.error("Failed to clean up localStorage synced events:", e);
    }
  }
}

/**
 * Removes an event from offline queue (for 60-second reversal).
 */
export async function dequeueScorekeeperEvent(eventId: string): Promise<void> {
  try {
    const db = await getDb();
    if (db) {
      await db.delete(STORE_NAME, eventId);
      return;
    }
  } catch (err) {
    console.warn("IndexedDB delete failed", err);
  }

  if (typeof window !== "undefined") {
    try {
      const existing: QueuedEvent[] = JSON.parse(
        localStorage.getItem("statcourt_offline_queue") || "[]"
      );
      const filtered = existing.filter((item) => item.id !== eventId);
      localStorage.setItem("statcourt_offline_queue", JSON.stringify(filtered));
    } catch (e) {
      console.error(e);
    }
  }
}

/**
 * Updates an event's retry status in the queue.
 */
export async function updateQueuedEventRetry(
  eventId: string,
  errorMsg: string
): Promise<void> {
  try {
    const db = await getDb();
    if (db) {
      const item: QueuedEvent | undefined = await db.get(STORE_NAME, eventId);
      if (item) {
        item.retryCount = (item.retryCount || 0) + 1;
        item.lastError = errorMsg;
        await db.put(STORE_NAME, item);
        return;
      }
    }
  } catch {
    // fallback
  }

  if (typeof window !== "undefined") {
    try {
      const existing: QueuedEvent[] = JSON.parse(
        localStorage.getItem("statcourt_offline_queue") || "[]"
      );
      const updated = existing.map((item) => {
        if (item.id === eventId) {
          return {
            ...item,
            retryCount: (item.retryCount || 0) + 1,
            lastError: errorMsg,
          };
        }
        return item;
      });
      localStorage.setItem("statcourt_offline_queue", JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  }
}

/**
 * Retrieves count of pending offline events.
 */
export async function getPendingOfflineCount(): Promise<number> {
  try {
    const db = await getDb();
    if (db) {
      const all: QueuedEvent[] = await db.getAll(STORE_NAME);
      return all.filter((i) => !i.synced && (i.retryCount || 0) < 5).length;
    }
  } catch {
    // fallback
  }

  if (typeof window !== "undefined") {
    try {
      const existing: QueuedEvent[] = JSON.parse(
        localStorage.getItem("statcourt_offline_queue") || "[]"
      );
      return existing.filter((i) => !i.synced && (i.retryCount || 0) < 5).length;
    } catch {
      return 0;
    }
  }
  return 0;
}

/**
 * Retrieves all pending unsynced offline events from IndexedDB or localStorage.
 */
export async function getPendingOfflineEvents(): Promise<QueuedEvent[]> {
  try {
    const db = await getDb();
    if (db) {
      const all: QueuedEvent[] = await db.getAll(STORE_NAME);
      return all.filter((i) => !i.synced && (i.retryCount || 0) < 5);
    }
  } catch {
    // fallback
  }

  if (typeof window !== "undefined") {
    try {
      const existing: QueuedEvent[] = JSON.parse(
        localStorage.getItem("statcourt_offline_queue") || "[]"
      );
      return existing.filter((i) => !i.synced && (i.retryCount || 0) < 5);
    } catch {
      return [];
    }
  }
  return [];
}

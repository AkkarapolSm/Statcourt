import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { prisma } from "../lib/db/prisma.ts";
import {
  recordMatchEventCommand,
  reverseMatchEventCommand,
  reconcileMatchScore,
} from "../lib/live/matchCommandHandler.ts";
import {
  getLiveState,
  evictLiveMatchState,
  subscribeToMatchDeltas,
} from "../lib/live/liveMatchBroker.ts";

const BASE_URL = "http://localhost:3000";

describe("Section 4: Scalability & Score Accuracy (Concurrency, Idempotency, Single Command Handler, SSE & DB Optimization)", () => {
  let officialCookie = "";
  const matchId = "match-bcc-ds-01";
  let officialUser = null;
  let bccHomeTeamId = "";
  let bccFirstAthleteId = "";

  it("0. Pre-requisite: Resolve database match, official credentials and establish session", async () => {
    // 1. Resolve match and roster
    const match = await prisma.match.findUniqueOrThrow({
      where: { id: matchId },
      include: {
        homeTeam: {
          include: { roster: true },
        },
      },
    });
    bccHomeTeamId = match.homeTeamId;
    bccFirstAthleteId = match.homeTeam.roster[0].athleteId;

    // 2. Establish official session
    const officialRes = await fetch(`${BASE_URL}/api/auth/dev-switch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "OFFICIAL", tier: "FREE" }),
    });
    assert.equal(officialRes.status, 200);
    officialCookie = officialRes.headers.get("set-cookie") || "";
    assert.ok(officialCookie.includes("statcourt_session="));

    officialUser = await prisma.user.findFirstOrThrow({
      where: { role: "OFFICIAL" },
      include: { officialProfile: true },
    });
  });

  // =========================================================================
  // Item 1 & 2: Single Command Handler & Atomic Score Synchronization
  // =========================================================================
  describe("4.1 Single Command Handler & Atomic Score Commit", () => {
    const testEventKey = `ev-test-scale-${Date.now()}`;

    it("Atomically records event, updates match score in DB and dispatches live broker state", async () => {
      const matchBefore = await prisma.match.findUniqueOrThrow({ where: { id: matchId } });
      const initialHomeScore = matchBefore.homeScore;

      const result = await recordMatchEventCommand({
        matchId,
        clientEventId: testEventKey,
        officialId: officialUser.officialProfile.id,
        userId: officialUser.id,
        teamId: bccHomeTeamId,
        athleteId: bccFirstAthleteId,
        eventType: "THREE_POINT_MADE",
        points: 3,
        quarter: 4,
        gameClockDisplay: "03:45",
      });

      assert.equal(result.success, true);
      assert.equal(result.statusCode, 201);
      assert.equal(result.data.id, testEventKey);
      assert.equal(result.data.points, 3);

      // Verify database score incremented atomically
      const matchAfter = await prisma.match.findUniqueOrThrow({ where: { id: matchId } });
      assert.equal(matchAfter.homeScore, initialHomeScore + 3, "Database score must increment by exactly 3");

      // Verify AuditLog entry was committed in same transaction
      const audit = await prisma.auditLog.findFirst({
        where: { targetId: testEventKey, action: "RECORD_EVENT" },
      });
      assert.ok(audit, "AuditLog must be created for the recorded event");

      // Verify Live Broker synchronized state
      const liveState = await getLiveState(matchId);
      assert.equal(liveState.homeTeam.score, matchAfter.homeScore);
      assert.equal(liveState.lastEvent?.id, testEventKey);
    });

    it("Enforces strict idempotency: identical retry returns existing event without double incrementing score", async () => {
      const matchBefore = await prisma.match.findUniqueOrThrow({ where: { id: matchId } });

      const duplicateResult = await recordMatchEventCommand({
        matchId,
        clientEventId: testEventKey, // Same key
        officialId: officialUser.officialProfile.id,
        userId: officialUser.id,
        teamId: bccHomeTeamId,
        athleteId: bccFirstAthleteId,
        eventType: "THREE_POINT_MADE",
        points: 3,
        quarter: 4,
        gameClockDisplay: "03:45",
      });

      assert.equal(duplicateResult.success, true);
      assert.equal(duplicateResult.isDuplicate, true, "Must flag as duplicate replay");
      assert.equal(duplicateResult.statusCode, 200);

      // Verify database score did NOT double increment
      const matchAfter = await prisma.match.findUniqueOrThrow({ where: { id: matchId } });
      assert.equal(matchAfter.homeScore, matchBefore.homeScore, "Score must not increment on duplicate replay");
    });

    it("Rejects conflicting payload with identical clientEventId with HTTP 409 Conflict", async () => {
      const conflictResult = await recordMatchEventCommand({
        matchId,
        clientEventId: testEventKey, // Same key but conflicting eventType
        officialId: officialUser.officialProfile.id,
        userId: officialUser.id,
        teamId: bccHomeTeamId,
        athleteId: bccFirstAthleteId,
        eventType: "TWO_POINT_MADE", // Conflicting!
        points: 2,
        quarter: 4,
        gameClockDisplay: "03:45",
      });

      assert.equal(conflictResult.success, false);
      assert.equal(conflictResult.statusCode, 409, "Must reject conflicting duplicate key with 409");
    });
  });

  // =========================================================================
  // Item 3: Reversal (Undo) Ledger Preservation
  // =========================================================================
  describe("4.2 Reversal (Undo) Ledger Preservation", () => {
    it("Reverses event without deleting row, decrements score atomically, and records audit trail", async () => {
      // 1. Record an event to reverse
      const revKey = `ev-to-reverse-${Date.now()}`;
      await recordMatchEventCommand({
        matchId,
        clientEventId: revKey,
        officialId: officialUser.officialProfile.id,
        userId: officialUser.id,
        teamId: bccHomeTeamId,
        athleteId: bccFirstAthleteId,
        eventType: "TWO_POINT_MADE",
        points: 2,
        quarter: 4,
        gameClockDisplay: "02:10",
      });

      const scoreBeforeRev = (await prisma.match.findUniqueOrThrow({ where: { id: matchId } })).homeScore;

      // 2. Reverse the event
      const revResult = await reverseMatchEventCommand({
        matchId,
        eventId: revKey,
        officialId: officialUser.officialProfile.id,
        userId: officialUser.id,
      });

      assert.equal(revResult.success, true);
      assert.equal(revResult.data?.reversedEventId, revKey);

      // 3. Verify event is still present in database with reversedAt timestamp
      const storedEvent = await prisma.matchEvent.findUniqueOrThrow({ where: { id: revKey } });
      assert.ok(storedEvent.reversedAt !== null, "reversedAt must be populated");
      assert.equal(storedEvent.isVerified, false, "isVerified must be false for reversed event");

      // 4. Verify score was decremented
      const scoreAfterRev = (await prisma.match.findUniqueOrThrow({ where: { id: matchId } })).homeScore;
      assert.equal(scoreAfterRev, scoreBeforeRev - 2, "Home score must decrement by 2 points");

      // 5. Verify REVERSE_EVENT audit log
      const audit = await prisma.auditLog.findFirst({
        where: { targetId: revKey, action: "REVERSE_EVENT" },
      });
      assert.ok(audit, "AuditLog must record REVERSE_EVENT");
    });
  });

  // =========================================================================
  // Item 4: Authoritative Score Reconciliation Engine
  // =========================================================================
  describe("4.3 Authoritative Score Reconciliation Engine", () => {
    it("Calculates authoritative ledger sum and corrects any drift accurately", async () => {
      const reconResult = await reconcileMatchScore(matchId);
      assert.equal(reconResult.matchId, matchId);
      assert.ok(reconResult.eventCount >= 0);

      // Verify database scores match reconciled result
      const match = await prisma.match.findUniqueOrThrow({ where: { id: matchId } });
      assert.equal(match.homeScore, reconResult.homeScore);
      assert.equal(match.awayScore, reconResult.awayScore);
    });
  });

  // =========================================================================
  // Item 5: Database Hydration & Broker Eviction Resilience
  // =========================================================================
  describe("4.4 Database Hydration & Broker Eviction Resilience", () => {
    it("Evicting in-memory state simulates cold restart and successfully re-hydrates from DB", async () => {
      // 1. Evict from memory
      evictLiveMatchState(matchId);

      // 2. Request state again; must hydrate accurately from SQLite DB
      const hydrated = await getLiveState(matchId);
      assert.equal(hydrated.matchId, matchId);
      const matchInDb = await prisma.match.findUniqueOrThrow({ where: { id: matchId } });
      assert.equal(hydrated.homeTeam.score, matchInDb.homeScore, "Hydrated home score must match DB");
      assert.equal(hydrated.awayTeam.score, matchInDb.awayScore, "Hydrated away score must match DB");
      assert.ok(hydrated.recentEvents.length > 0, "Hydrated state must include recent active events");
    });
  });

  // =========================================================================
  // Item 6: SSE Delta Broadcasting & Sequence Numbering
  // =========================================================================
  describe("4.5 SSE Incremental Delta Broadcasting", () => {
    it("Broadcasts lightweight incremental delta events to listeners", async () => {
      let receivedDelta = null;
      const unsubscribe = subscribeToMatchDeltas(matchId, (delta) => {
        receivedDelta = delta;
      });

      const deltaKey = `ev-delta-test-${Date.now()}`;
      await recordMatchEventCommand({
        matchId,
        clientEventId: deltaKey,
        officialId: officialUser.officialProfile.id,
        userId: officialUser.id,
        teamId: bccHomeTeamId,
        athleteId: bccFirstAthleteId,
        eventType: "FREE_THROW_MADE",
        points: 1,
        quarter: 4,
        gameClockDisplay: "01:05",
      });

      unsubscribe();

      assert.ok(receivedDelta, "Delta listener must receive dispatched event");
      assert.equal(receivedDelta.type, "SCORE_EVENT");
      assert.equal(receivedDelta.eventId, deltaKey);
      assert.equal(receivedDelta.points, 1);
      assert.ok(typeof receivedDelta.sequence === "number", "Delta must include sequential event ID");
    });
  });

  // =========================================================================
  // Item 7: Database Status Readiness Probe & Caching
  // =========================================================================
  describe("4.6 Database Readiness Probe & 60s Metrics Cache", () => {
    it("Provides lightweight readiness probe for Kubernetes / LB checks", async () => {
      const res = await fetch(`${BASE_URL}/api/db/status?mode=readiness`);
      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.status, "ready");
      assert.equal(json.isLive, true);
    });

    it("Caches high-cost 7-table count metrics with 60s TTL", async () => {
      const firstRes = await fetch(`${BASE_URL}/api/db/status`);
      assert.equal(firstRes.status, 200);
      const firstJson = await firstRes.json();
      assert.equal(firstJson.status, "connected");
      assert.ok(firstJson.counts.athletes >= 0);

      // Second request within TTL should be served from cache
      const secondRes = await fetch(`${BASE_URL}/api/db/status`);
      assert.equal(secondRes.status, 200);
      const secondJson = await secondRes.json();
      assert.equal(secondJson.cached, true, "Subsequent calls within 60s TTL must hit cache");
      assert.equal(secondRes.headers.get("x-cache"), "HIT");
    });
  });

  // =========================================================================
  // Item 8: Database-level Filtering & Pagination on Leaderboard
  // =========================================================================
  describe("4.7 Database-level Filtering & Pagination on Leaderboard", () => {
    it("Supports database pagination with 'limit' and 'page' parameters", async () => {
      const res = await fetch(`${BASE_URL}/api/leaderboard?limit=2&page=1`);
      assert.equal(res.status, 200);
      const json = await res.json();
      assert.ok(json.data.length <= 2, "Returned athlete count must respect limit=2");
      assert.ok(json.pagination, "Response must include pagination metadata");
      assert.equal(json.pagination.page, 1);
      assert.equal(json.pagination.limit, 2);
    });

    it("Applies database filtering by position and age category directly", async () => {
      const res = await fetch(`${BASE_URL}/api/leaderboard?position=POINT_GUARD`);
      assert.equal(res.status, 200);
      const json = await res.json();
      assert.ok(json.data.length > 0);
      for (const athlete of json.data) {
        assert.equal(athlete.position, "POINT_GUARD", "All returned records must match position filter");
      }
    });
  });
});

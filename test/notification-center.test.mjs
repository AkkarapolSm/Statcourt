import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { prisma } from "../lib/db/prisma.ts";

const BASE_URL = "http://localhost:3000";

describe("Feature 3.2: ศูนย์แจ้งเตือน (In-App Notification Center)", () => {
  let adminCookie = "";
  let coachCookie = "";
  let officialCookie = "";
  let officialUserId = "";

  const tournamentId = "tourn-toa-2026";
  const matchId = "match-notif-test";
  let targetNotificationId = "";

  it("1. Establish sessions for Admin, Coach, and Official", async () => {
    // 1.1 Admin Session
    const adminRes = await fetch(`${BASE_URL}/api/auth/dev-switch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "ADMIN", tier: "PRO" }),
    });
    assert.equal(adminRes.status, 200);
    adminCookie = adminRes.headers.get("set-cookie") || "";
    assert.ok(adminCookie.includes("statcourt_session="));

    // 1.2 Coach Session
    const coachRes = await fetch(`${BASE_URL}/api/auth/dev-switch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "COACH", tier: "FREE" }),
    });
    assert.equal(coachRes.status, 200);
    coachCookie = coachRes.headers.get("set-cookie") || "";
    assert.ok(coachCookie.includes("statcourt_session="));

    // 1.3 Official Session
    const officialRes = await fetch(`${BASE_URL}/api/auth/dev-switch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "OFFICIAL", tier: "FREE" }),
    });
    assert.equal(officialRes.status, 200);
    officialCookie = officialRes.headers.get("set-cookie") || "";
    assert.ok(officialCookie.includes("statcourt_session="));

    const officialUser = await prisma.user.findFirst({
      where: { role: "OFFICIAL", accountStatus: "ACTIVE" },
      select: { id: true },
    });
    assert.ok(officialUser);
    officialUserId = officialUser.id;

    // Query a base match to obtain valid tournamentId, homeTeamId, awayTeamId
    const baseMatch = await prisma.match.findFirstOrThrow({
      include: { homeTeam: true, awayTeam: true },
    });

    // Create or reset dedicated test match
    await prisma.match.upsert({
      where: { id: matchId },
      create: {
        id: matchId,
        tournamentId: baseMatch.tournamentId,
        homeTeamId: baseMatch.homeTeamId,
        awayTeamId: baseMatch.awayTeamId,
        scheduledAt: new Date(Date.now() + 24 * 3600 * 1000),
        venue: "อาคารกีฬานิมิบุตร",
        courtName: "คอร์ท 1",
        resultStatus: "DRAFT",
        status: "SCHEDULED",
        homeScore: 82,
        awayScore: 78,
      },
      update: {
        resultStatus: "DRAFT",
        homeScore: 82,
        awayScore: 78,
      },
    });
  });

  it("2. Protection: Rejects unauthenticated request to /api/notifications", async () => {
    const res = await fetch(`${BASE_URL}/api/notifications`);
    assert.equal(res.status, 401);
  });

  it("3. Event 1: Official Assignment triggers in-app notification", async () => {
    // Admin assigns official to match
    const assignRes = await fetch(`${BASE_URL}/api/admin/access`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: adminCookie,
        Origin: BASE_URL,
      },
      body: JSON.stringify({
        action: "ASSIGN_MATCH",
        userId: officialUserId,
        matchId,
      }),
    });
    assert.equal(assignRes.status, 200);

    // Official fetches notifications
    const notifRes = await fetch(`${BASE_URL}/api/notifications`, {
      headers: { Cookie: officialCookie },
    });
    assert.equal(notifRes.status, 200);
    const data = await notifRes.json();
    assert.equal(data.success, true);
    assert.ok(data.unreadCount >= 1);

    const assignmentNotif = data.notifications.find(
      (n) => n.type === "OFFICIAL_ASSIGNMENT"
    );
    assert.ok(assignmentNotif, "Must receive OFFICIAL_ASSIGNMENT notification");
    assert.ok(assignmentNotif.title.includes("มอบหมาย"));
    assert.equal(assignmentNotif.isRead, false);
    targetNotificationId = assignmentNotif.id;
  });

  it("4. Event 2: Schedule Change triggers in-app notification", async () => {
    const newScheduledAt = new Date(Date.now() + 48 * 3600 * 1000).toISOString();
    const schedRes = await fetch(`${BASE_URL}/api/matches/${matchId}/schedule`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: adminCookie,
        Origin: BASE_URL,
      },
      body: JSON.stringify({
        scheduledAt: newScheduledAt,
        venue: "อาคารกีฬานิมิบุตร",
        courtName: "คอร์ทหลัก",
      }),
    });
    assert.equal(schedRes.status, 200);

    // Check notification on official side
    const notifRes = await fetch(`${BASE_URL}/api/notifications`, {
      headers: { Cookie: officialCookie },
    });
    assert.equal(notifRes.status, 200);
    const data = await notifRes.json();
    const scheduleNotif = data.notifications.find(
      (n) => n.type === "SCHEDULE_CHANGE"
    );
    assert.ok(scheduleNotif, "Official must receive SCHEDULE_CHANGE notification");
    assert.ok(scheduleNotif.title.includes("กำหนดการ"));
  });

  it("5. Event 3: Tournament Registration status triggers in-app notification", async () => {
    // 5.1 Get authenticated coach user
    const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Cookie: coachCookie },
    });
    const { user: coachUser } = await meRes.json();

    const coachProfile = await prisma.coachProfile.findUnique({
      where: { userId: coachUser.id },
    });

    if (coachProfile) {
      await prisma.team.update({
        where: { id: "team-bcc" },
        data: { coachId: coachProfile.id },
      });
    }

    // Ensure registration for team-bcc in tourn-toa-2026 is PENDING
    const reg = await prisma.tournamentRegistration.upsert({
      where: { tournamentId_teamId: { tournamentId, teamId: "team-bcc" } },
      create: { tournamentId, teamId: "team-bcc", status: "PENDING" },
      update: { status: "PENDING" },
      include: { team: true },
    });
    assert.ok(reg);

    // Admin moderates registration
    const modRes = await fetch(`${BASE_URL}/api/admin/registrations`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: adminCookie,
        Origin: BASE_URL,
      },
      body: JSON.stringify({
        registrationId: reg.id,
        status: "APPROVED",
        isRosterLocked: false,
      }),
    });
    assert.equal(modRes.status, 200);

    // Coach fetches notifications
    const notifRes = await fetch(`${BASE_URL}/api/notifications`, {
      headers: { Cookie: coachCookie },
    });
    assert.equal(notifRes.status, 200);
    const data = await notifRes.json();
    const regNotif = data.notifications.find(
      (n) => n.type === "REGISTRATION_STATUS"
    );
    assert.ok(regNotif, "Coach must receive REGISTRATION_STATUS notification");
    assert.ok(regNotif.title.includes("ได้รับการรับรอง") || regNotif.title.includes("ใบสมัคร"));
  });

  it("6. Event 4: Match Certification triggers in-app notification", async () => {
    // Ensure match is in DRAFT status first
    await prisma.match.update({
      where: { id: matchId },
      data: { resultStatus: "DRAFT" },
    });

    // Official submits match (DRAFT -> PENDING_APPROVAL)
    const submitRes = await fetch(`${BASE_URL}/api/matches/${matchId}/result`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: officialCookie,
        Origin: BASE_URL,
      },
      body: JSON.stringify({ action: "SUBMIT" }),
    });
    assert.equal(submitRes.status, 200);

    // Admin approves result
    const approveRes = await fetch(`${BASE_URL}/api/matches/${matchId}/result`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: adminCookie,
        Origin: BASE_URL,
      },
      body: JSON.stringify({ action: "APPROVE" }),
    });
    assert.equal(approveRes.status, 200);

    // Official checks notifications
    const notifRes = await fetch(`${BASE_URL}/api/notifications`, {
      headers: { Cookie: officialCookie },
    });
    assert.equal(notifRes.status, 200);
    const data = await notifRes.json();
    const certNotif = data.notifications.find(
      (n) => n.type === "MATCH_CERTIFIED"
    );
    assert.ok(certNotif, "Must receive MATCH_CERTIFIED notification");
    assert.ok(certNotif.title.includes("รับรอง"));
  });

  it("7. Read State: Single mark as read and Mark all as read", async () => {
    assert.ok(targetNotificationId);

    // 7.1 Single mark as read
    const patchRes = await fetch(`${BASE_URL}/api/notifications`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: officialCookie,
        Origin: BASE_URL,
      },
      body: JSON.stringify({ notificationId: targetNotificationId }),
    });
    assert.equal(patchRes.status, 200);
    const patchData = await patchRes.json();
    assert.equal(patchData.success, true);
    assert.equal(patchData.notification.isRead, true);

    // 7.2 Mark all as read
    const markAllRes = await fetch(`${BASE_URL}/api/notifications`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: officialCookie,
        Origin: BASE_URL,
      },
      body: JSON.stringify({ markAllAsRead: true }),
    });
    assert.equal(markAllRes.status, 200);

    // Verify unreadCount is 0
    const verifyRes = await fetch(`${BASE_URL}/api/notifications?unreadOnly=true`, {
      headers: { Cookie: officialCookie },
    });
    assert.equal(verifyRes.status, 200);
    const verifyData = await verifyRes.json();
    assert.equal(verifyData.unreadCount, 0);
    assert.equal(verifyData.notifications.length, 0);
  });

  it("8. Cleanup: Delete single notification", async () => {
    const deleteRes = await fetch(
      `${BASE_URL}/api/notifications?id=${encodeURIComponent(targetNotificationId)}`,
      {
        method: "DELETE",
        headers: {
          Cookie: officialCookie,
          Origin: BASE_URL,
        },
      }
    );
    assert.equal(deleteRes.status, 200);
  });
});

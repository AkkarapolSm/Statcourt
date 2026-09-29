import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { prisma } from "../lib/db/prisma.ts";
import { verifyPassword } from "../lib/auth/credentials.ts";

function hashToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

const BASE_URL = "http://localhost:3000";

describe("Feature 3.5: การจัดการบัญชีให้ครบวงจร (Account Lifecycle & Security Management)", () => {
  let adminCookie = "";
  let coachCookie = "";
  let adminUser = null;
  let coachUser = null;

  it("1. Establish sessions for Admin and Coach test accounts", async () => {
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

    // Retrieve database records for users
    adminUser = await prisma.user.findFirstOrThrow({
      where: { role: "ADMIN", accountStatus: "ACTIVE" },
    });
    coachUser = await prisma.user.findFirstOrThrow({
      where: { role: "COACH", accountStatus: "ACTIVE" },
    });

    assert.ok(adminUser);
    assert.ok(coachUser);
  });

  // =========================================================================
  // 1. Email Verification Lifecycle
  // =========================================================================
  it("2. Email Verification Flow: request, validate, reject invalid token, and prevent reuse", async () => {
    // Reset coach emailVerifiedAt to null for clean testing
    await prisma.user.update({
      where: { id: coachUser.id },
      data: { emailVerifiedAt: null },
    });

    // 2.1 Check initial status
    const initialStatusRes = await fetch(`${BASE_URL}/api/auth/verify-email`, {
      headers: { Cookie: coachCookie },
    });
    assert.equal(initialStatusRes.status, 200);
    const initialStatus = await initialStatusRes.json();
    assert.equal(initialStatus.isVerified, false);
    assert.equal(initialStatus.emailVerifiedAt, null);

    // 2.2 Request verification token
    const requestRes = await fetch(`${BASE_URL}/api/auth/verify-email/request`, {
      method: "POST",
      headers: { Cookie: coachCookie },
    });
    assert.equal(requestRes.status, 200);
    const requestData = await requestRes.json();
    assert.equal(requestData.success, true);
    assert.ok(requestData.verificationToken);
    const validToken = requestData.verificationToken;

    // 2.3 Attempt confirmation with invalid/tampered token
    const invalidConfirmRes = await fetch(`${BASE_URL}/api/auth/verify-email/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: "tampered-invalid-token-12345" }),
    });
    assert.equal(invalidConfirmRes.status, 400);
    const invalidConfirmData = await invalidConfirmRes.json();
    assert.equal(invalidConfirmData.success, false);

    // 2.4 Confirm with valid token
    const validConfirmRes = await fetch(`${BASE_URL}/api/auth/verify-email/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: validToken }),
    });
    assert.equal(validConfirmRes.status, 200);
    const validConfirmData = await validConfirmRes.json();
    assert.equal(validConfirmData.success, true);

    // 2.5 Verify database reflects emailVerifiedAt
    const updatedUser = await prisma.user.findUnique({
      where: { id: coachUser.id },
      select: { emailVerifiedAt: true },
    });
    assert.ok(updatedUser?.emailVerifiedAt instanceof Date);

    // 2.6 Attempt to reuse the same token -> should fail
    const reusedConfirmRes = await fetch(`${BASE_URL}/api/auth/verify-email/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: validToken }),
    });
    assert.equal(reusedConfirmRes.status, 400);
    const reusedConfirmData = await reusedConfirmRes.json();
    assert.equal(reusedConfirmData.success, false);

    // 2.7 Verify GET status is now verified
    const finalStatusRes = await fetch(`${BASE_URL}/api/auth/verify-email`, {
      headers: { Cookie: coachCookie },
    });
    const finalStatus = await finalStatusRes.json();
    assert.equal(finalStatus.isVerified, true);
    assert.ok(finalStatus.emailVerifiedAt);
  });

  // =========================================================================
  // 2. Password Reset Lifecycle
  // =========================================================================
  it("3. Password Reset Flow: request token, enforce password length, hash with scrypt, and invalidate sessions", async () => {
    // Ensure coach user has active sessions before reset
    const preResetSessions = await prisma.userSession.findMany({
      where: { userId: coachUser.id, revokedAt: null },
    });
    assert.ok(preResetSessions.length >= 1);

    // 3.1 Request password reset for coach's email
    const resetReqRes = await fetch(`${BASE_URL}/api/auth/password-reset/request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: coachUser.email }),
    });
    assert.equal(resetReqRes.status, 200);
    const resetReqData = await resetReqRes.json();
    assert.equal(resetReqData.success, true);
    assert.ok(resetReqData.resetToken);
    const resetToken = resetReqData.resetToken;

    // 3.2 Confirm with weak password (< 12 characters) -> should fail
    const weakResetRes = await fetch(`${BASE_URL}/api/auth/password-reset/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: resetToken, newPassword: "Short1!" }),
    });
    assert.equal(weakResetRes.status, 400);
    const weakResetData = await weakResetRes.json();
    assert.equal(weakResetData.success, false);

    // 3.3 Confirm with strong password (>= 12 characters) -> should succeed
    const newStrongPass = "CoachStrongPass2026#Secure!";
    const strongResetRes = await fetch(`${BASE_URL}/api/auth/password-reset/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: resetToken, newPassword: newStrongPass }),
    });
    assert.equal(strongResetRes.status, 200);
    const strongResetData = await strongResetRes.json();
    assert.equal(strongResetData.success, true);

    // 3.4 Verify DB password hash was updated and validates with scrypt
    const refreshedCoach = await prisma.user.findUniqueOrThrow({
      where: { id: coachUser.id },
      select: { passwordHash: true },
    });
    assert.ok(refreshedCoach.passwordHash);
    const isPasswordCorrect = await verifyPassword(newStrongPass, refreshedCoach.passwordHash);
    assert.equal(isPasswordCorrect, true);

    // 3.5 Verify all prior sessions for this user were revoked
    const postResetSessions = await prisma.userSession.findMany({
      where: { userId: coachUser.id, revokedAt: null },
    });
    assert.equal(postResetSessions.length, 0);

    // 3.6 Re-attempting reset with already-consumed token should fail
    const replayedResetRes = await fetch(`${BASE_URL}/api/auth/password-reset/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: resetToken, newPassword: "AnotherPassword2026!" }),
    });
    assert.equal(replayedResetRes.status, 400);
  });

  // =========================================================================
  // 3. Authenticated Password Change
  // =========================================================================
  it("4. Authenticated Password Change: verifies current password and updates hash", async () => {
    // Re-establish fresh session for coach
    const freshCoachRes = await fetch(`${BASE_URL}/api/auth/dev-switch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "COACH", tier: "FREE" }),
    });
    coachCookie = freshCoachRes.headers.get("set-cookie") || "";

    const currentPass = "CoachStrongPass2026#Secure!";
    const nextPass = "NextUpdatedPass2026#RockSolid!";

    // 4.1 Fail with incorrect current password
    const wrongPassRes = await fetch(`${BASE_URL}/api/auth/password/change`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: coachCookie },
      body: JSON.stringify({
        currentPassword: "TotallyWrongPassword!",
        newPassword: nextPass,
      }),
    });
    assert.equal(wrongPassRes.status, 400);
    const wrongPassData = await wrongPassRes.json();
    assert.equal(wrongPassData.success, false);

    // 4.2 Fail with short new password (< 12 chars)
    const shortPassRes = await fetch(`${BASE_URL}/api/auth/password/change`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: coachCookie },
      body: JSON.stringify({
        currentPassword: currentPass,
        newPassword: "short",
      }),
    });
    assert.equal(shortPassRes.status, 400);

    // 4.3 Succeed with correct current password and valid new password
    const changePassRes = await fetch(`${BASE_URL}/api/auth/password/change`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: coachCookie },
      body: JSON.stringify({
        currentPassword: currentPass,
        newPassword: nextPass,
      }),
    });
    assert.equal(changePassRes.status, 200);
    const changePassData = await changePassRes.json();
    assert.equal(changePassData.success, true);

    // Verify hash matches nextPass
    const userInDb = await prisma.user.findUniqueOrThrow({
      where: { id: coachUser.id },
      select: { passwordHash: true },
    });
    assert.equal(await verifyPassword(nextPass, userInDb.passwordHash), true);
  });

  // =========================================================================
  // 4. Sessions & Multi-Device Management
  // =========================================================================
  it("5. Sessions & Multi-Device Management: list sessions, revoke single session, and revoke all others", async () => {
    const uniqueSalt = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Create two mock secondary sessions for the coach user
    const mockSession1 = await prisma.userSession.create({
      data: {
        userId: coachUser.id,
        tokenHash: hashToken(`mock-token-ipad-pro-${uniqueSalt}`),
        ipAddress: "192.168.1.55",
        userAgent: "iPad Safari (iOS 18.0)",
        expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000),
      },
    });

    const mockSession2 = await prisma.userSession.create({
      data: {
        userId: coachUser.id,
        tokenHash: hashToken(`mock-token-android-phone-${uniqueSalt}`),
        ipAddress: "172.16.0.42",
        userAgent: "Samsung Galaxy Chrome Mobile",
        expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000),
      },
    });

    // 5.1 Fetch sessions list via API
    const listRes = await fetch(`${BASE_URL}/api/auth/sessions`, {
      headers: { Cookie: coachCookie },
    });
    assert.equal(listRes.status, 200);
    const listData = await listRes.json();
    assert.equal(listData.success, true);
    assert.ok(Array.isArray(listData.sessions));
    assert.ok(listData.sessions.length >= 3); // current + 2 mock sessions

    const currentSession = listData.sessions.find((s) => s.isCurrent === true);
    assert.ok(currentSession, "Expected active session to have isCurrent=true");

    // 5.2 Revoke mockSession1 by ID
    const deleteRes = await fetch(`${BASE_URL}/api/auth/sessions?id=${mockSession1.id}`, {
      method: "DELETE",
      headers: { Cookie: coachCookie },
    });
    assert.equal(deleteRes.status, 200);
    const deleteData = await deleteRes.json();
    assert.equal(deleteData.success, true);
    assert.equal(deleteData.revokedSessionId, mockSession1.id);

    // Verify mockSession1 revoked in DB
    const checkMock1 = await prisma.userSession.findUnique({ where: { id: mockSession1.id } });
    assert.ok(checkMock1?.revokedAt !== null);

    // 5.3 Revoke all other sessions except current
    const revokeOthersRes = await fetch(`${BASE_URL}/api/auth/sessions/revoke-others`, {
      method: "POST",
      headers: { Cookie: coachCookie },
    });
    assert.equal(revokeOthersRes.status, 200);
    const revokeOthersData = await revokeOthersRes.json();
    assert.equal(revokeOthersData.success, true);
    assert.ok(revokeOthersData.revokedCount >= 1);

    // Verify mockSession2 is also revoked now
    const checkMock2 = await prisma.userSession.findUnique({ where: { id: mockSession2.id } });
    assert.ok(checkMock2?.revokedAt !== null);

    // Verify current session remains active
    const checkCurrent = await prisma.userSession.findUnique({ where: { id: currentSession.id } });
    assert.equal(checkCurrent?.revokedAt, null);
  });

  // =========================================================================
  // 5. Admin Step-Up Elevated Authentication
  // =========================================================================
  it("6. Admin Step-Up Elevated Authentication: protect sensitive operations with 15-minute elevation", async () => {
    // 6.1 Non-admin/coach attempts step-up elevation -> should be rejected 403
    const coachStepUpRes = await fetch(`${BASE_URL}/api/admin/step-up`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: coachCookie },
      body: JSON.stringify({ secretKeyOrPin: "StatCourt@Admin2026" }),
    });
    assert.equal(coachStepUpRes.status, 403);

    // 6.2 Admin attempts step-up with wrong secret key / PIN -> should be rejected 401
    const adminWrongPinRes = await fetch(`${BASE_URL}/api/admin/step-up`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: adminCookie },
      body: JSON.stringify({ secretKeyOrPin: "WrongIncorrectPIN!" }),
    });
    assert.equal(adminWrongPinRes.status, 401);
    const adminWrongPinData = await adminWrongPinRes.json();
    assert.equal(adminWrongPinData.success, false);

    // 6.3 Admin performs step-up elevation with valid key
    const adminStepUpRes = await fetch(`${BASE_URL}/api/admin/step-up`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: adminCookie },
      body: JSON.stringify({ secretKeyOrPin: "StatCourt@Admin2026" }),
    });
    assert.equal(adminStepUpRes.status, 200);
    const adminStepUpData = await adminStepUpRes.json();
    assert.equal(adminStepUpData.success, true);
    assert.ok(adminStepUpData.stepUpToken);
    assert.ok(adminStepUpData.expiresAt);
    const validStepUpToken = adminStepUpData.stepUpToken;

    // 6.4 Check elevation status with valid token header
    const verifyElevatedRes = await fetch(`${BASE_URL}/api/admin/step-up`, {
      headers: {
        Cookie: adminCookie,
        "x-admin-step-up-token": validStepUpToken,
      },
    });
    assert.equal(verifyElevatedRes.status, 200);
    const verifyElevatedData = await verifyElevatedRes.json();
    assert.equal(verifyElevatedData.success, true);
    assert.equal(verifyElevatedData.isElevated, true);

    // 6.5 Check elevation status with invalid/tampered token
    const verifyInvalidRes = await fetch(`${BASE_URL}/api/admin/step-up`, {
      headers: {
        Cookie: adminCookie,
        "x-admin-step-up-token": "tampered-admin-token-xyz",
      },
    });
    assert.equal(verifyInvalidRes.status, 200);
    const verifyInvalidData = await verifyInvalidRes.json();
    assert.equal(verifyInvalidData.isElevated, false);
  });
});

import test from "node:test";
import assert from "node:assert/strict";
import { requireRole, requireOfficial } from "../lib/auth/serverAuth.ts";
import { hashPassword, verifyPassword } from "../lib/auth/credentials.ts";

function request(headers = {}) {
  return { headers: { get: (key) => headers[key.toLowerCase()] || null }, cookies: { get: () => undefined } };
}

test("unsigned role, tier and old official token never grant access", async () => {
  const forged = request({ "x-user-role": "ADMIN", "x-user-tier": "PRO", "x-official-token": "legacy-token" });
  const admin = await requireRole(forged, ["ADMIN"]);
  const official = await requireOfficial(forged, "match-1");
  assert.equal(admin.authorized, false);
  assert.equal(admin.response.status, 401);
  assert.equal(official.authorized, false);
  assert.equal(official.response.status, 401);
});

test("password hashes are salted and wrong passwords fail", async () => {
  const first = await hashPassword("correct-horse-battery-staple");
  const second = await hashPassword("correct-horse-battery-staple");
  assert.notEqual(first, second);
  assert.equal(await verifyPassword("correct-horse-battery-staple", first), true);
  assert.equal(await verifyPassword("wrong-password-value", first), false);
});

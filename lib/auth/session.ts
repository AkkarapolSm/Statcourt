if (typeof window !== "undefined") {
  throw new Error("Server-only session module cannot be imported on the client side.");
}

import { createHash, randomBytes } from "node:crypto";
import type { NextRequest, NextResponse } from "next/server";
import { prisma } from "../db/prisma.ts";

export const SESSION_COOKIE = "statcourt_session";
const SESSION_SECONDS = 7 * 24 * 60 * 60;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(
  userId: string,
  response: NextResponse,
  metadata?: { ipAddress?: string | null; userAgent?: string | null }
): Promise<string> {
  const token = randomBytes(32).toString("base64url");
  await prisma.userSession.create({
    data: {
      userId,
      tokenHash: hashToken(token),
      ipAddress: metadata?.ipAddress || null,
      userAgent: metadata?.userAgent || null,
      expiresAt: new Date(Date.now() + SESSION_SECONDS * 1000),
    },
  });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: SESSION_SECONDS,
    path: "/",
  });
  return token;
}

export async function revokeSession(request: NextRequest, response: NextResponse): Promise<void> {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.userSession.updateMany({
      where: { tokenHash: hashToken(token), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
  response.cookies.set(SESSION_COOKIE, "", { maxAge: 0, path: "/" });
}

export async function getCurrentUserSession(request: NextRequest | any) {
  const token = request.cookies?.get?.(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await prisma.userSession.findUnique({
    where: { tokenHash: hashToken(token) },
    include: {
      user: {
        include: { athleteProfile: true, coachProfile: true, officialProfile: true },
      },
    },
  });
  if (!session || session.revokedAt || session.expiresAt <= new Date()) return null;
  if (session.user.accountStatus === "SUSPENDED") return null;
  return { session, user: session.user };
}

export async function getSessionUser(request: NextRequest | any) {
  const token = request.cookies?.get?.(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await prisma.userSession.findUnique({
    where: { tokenHash: hashToken(token) },
    include: {
      user: {
        include: { athleteProfile: true, coachProfile: true, officialProfile: true },
      },
    },
  });
  if (!session || session.revokedAt || session.expiresAt <= new Date()) return null;
  if (session.user.accountStatus === "SUSPENDED") return null;
  return session.user;
}

export function requestOriginAllowed(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  const site = request.headers.get("sec-fetch-site");
  if (site === "cross-site") return false;
  return !origin || origin === new URL(request.url).origin;
}

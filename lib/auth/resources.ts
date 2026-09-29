import { prisma } from "../db/prisma.ts";
import { getSessionUser } from "./session.ts";
import type { NextRequest } from "next/server";

export async function canManageTeam(request: NextRequest, teamId: string): Promise<boolean> {
  const user = await getSessionUser(request);
  if (!user || user.accountStatus !== "ACTIVE") return false;
  if (user.role === "ADMIN") return true;
  if (user.role !== "COACH" || !user.coachProfile?.isVerified) return false;
  const membership = await prisma.teamMembership.findUnique({
    where: { userId_teamId: { userId: user.id, teamId } },
  });
  return membership?.status === "ACTIVE";
}

export async function canAccessAthlete(request: NextRequest, athleteId: string, mode: "read" | "write"): Promise<boolean> {
  const user = await getSessionUser(request);
  if (!user || user.accountStatus !== "ACTIVE") return false;
  if (user.role === "ADMIN") return true;
  if (user.role === "ATHLETE") return user.athleteProfile?.id === athleteId;
  if (user.role === "OFFICIAL" && user.officialProfile?.approvalStatus === "APPROVED" && mode === "read") return true;
  if (user.role !== "COACH" || !user.coachProfile?.isVerified) return false;
  const roster = await prisma.rosterMember.findFirst({
    where: { athleteId, team: { memberships: { some: { userId: user.id, status: "ACTIVE" } } } },
    select: { id: true },
  });
  return Boolean(roster) && (mode === "read" || mode === "write");
}

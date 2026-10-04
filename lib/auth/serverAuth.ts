if (typeof window !== "undefined") {
  throw new Error("Server-only auth module cannot be imported on the client side.");
}

import type { NextRequest } from "next/server";
import { prisma } from "../db/prisma.ts";
import { getSessionUser } from "./session.ts";
import type { Role } from "../types";

export { getSessionUser, getSessionUser as getCurrentUserSession };

export interface AuthResult {
  authorized: boolean;
  userId?: string;
  role?: Role;
  official?: {
    officialId: string;
    licenseNumber: string;
    name: string;
    role: "OFFICIAL" | "ADMIN";
  };
  response?: Response;
}

function denied(status: 401 | 403): AuthResult {
  return {
    authorized: false,
    response: Response.json(
      { success: false, error: status === 401 ? "กรุณาเข้าสู่ระบบ" : "ไม่มีสิทธิ์ดำเนินการ" },
      { status }
    ),
  };
}

export async function requireRole(request: NextRequest | any, allowedRoles: Role[]): Promise<AuthResult> {
  const user = await getSessionUser(request);
  if (!user) return denied(401);
  if (user.accountStatus !== "ACTIVE" || !allowedRoles.includes(user.role as Role)) return denied(403);
  if (user.role === "COACH" && !user.coachProfile?.isVerified) return denied(403);
  if (user.role === "OFFICIAL" && user.officialProfile?.approvalStatus !== "APPROVED") return denied(403);
  return { authorized: true, userId: user.id, role: user.role as Role };
}

export async function requireOfficial(request: NextRequest | any, matchId?: string): Promise<AuthResult> {
  const auth = await requireRole(request, ["OFFICIAL", "ADMIN"]);
  if (!auth.authorized || !auth.userId) return auth;
  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    include: { officialProfile: true },
  });
  if (!user) return denied(403);

  if (user.role === "ADMIN") {
    return {
      ...auth,
      official: {
        officialId: "off-admin-super",
        licenseNumber: "FIBA-COMMISSIONER",
        name: user.fullName || "FIBA Technical Commissioner",
        role: "ADMIN",
      },
    };
  }

  if (!user.officialProfile) return denied(403);
  if (matchId) {
    let assignment = await prisma.matchOfficialAssignment.findUnique({
      where: { userId_matchId: { userId: user.id, matchId } },
    });
    if (!assignment && user.officialProfile.approvalStatus === "APPROVED") {
      try {
        assignment = await prisma.matchOfficialAssignment.create({
          data: {
            userId: user.id,
            matchId,
            role: "TABLE_OFFICIAL",
            status: "ACTIVE",
          },
        });
      } catch {
        // Ignored if match is fallback mock or concurrent creation
      }
    }
    if (assignment && assignment.status !== "ACTIVE") return denied(403);
  }
  return {
    ...auth,
    official: {
      officialId: user.officialProfile.id,
      licenseNumber: user.officialProfile.licenseNumber || "UNLISTED",
      name: user.officialProfile.fullName,
      role: "OFFICIAL",
    },
  };
}

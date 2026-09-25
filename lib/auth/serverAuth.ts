import type { NextRequest } from "next/server";
import { verifyOfficialToken, type OfficialTokenPayload } from "./officialToken.ts";
import type { Role } from "../types";

export interface AuthResult {
  authorized: boolean;
  official?: OfficialTokenPayload;
  role?: Role;
  response?: Response;
}

function jsonResponse(data: any, init?: { status?: number; headers?: HeadersInit }): Response {
  return Response.json(data, init);
}

/**
 * Extracts official token from Cookie, Authorization header, or x-official-token header
 */
export function getOfficialTokenFromRequest(req: NextRequest | any): string | null {
  const cookieToken = typeof req.cookies?.get === "function"
    ? req.cookies.get("statcourt_official_token")?.value
    : req.cookies?.["statcourt_official_token"];

  const authHeader = typeof req.headers?.get === "function"
    ? req.headers.get("authorization")
    : req.headers?.["authorization"];

  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.substring(7)
    : null;

  const customHeaderToken = typeof req.headers?.get === "function"
    ? req.headers.get("x-official-token")
    : req.headers?.["x-official-token"];

  return cookieToken || bearerToken || customHeaderToken || null;
}

/**
 * Verifies that the request comes from an authenticated Technical Table Official or Federation Admin
 */
export function requireOfficial(req: NextRequest | any, matchId?: string): AuthResult {
  const token = getOfficialTokenFromRequest(req);
  if (!token) {
    return {
      authorized: false,
      response: jsonResponse(
        {
          success: false,
          error: "Unauthorized: Technical table official credentials required",
          message: "ต้องใช้สิทธิ์เจ้าหน้าที่โต๊ะเทคนิคที่ได้รับการรับรองจากสหพันธ์ (BSAT / FIBA Certified)",
        },
        { status: 401 }
      ),
    };
  }

  const payload = verifyOfficialToken(token);
  if (!payload) {
    return {
      authorized: false,
      response: jsonResponse(
        {
          success: false,
          error: "Unauthorized: Session token has expired or is invalid",
          message: "Session การเข้าสู่ระบบของเจ้าหน้าที่หมดอายุหรือไม่ถูกต้อง กรุณายืนยันตัวตนใหม่",
        },
        { status: 401 }
      ),
    };
  }

  if (matchId && payload.matchId && payload.matchId !== matchId) {
    return {
      authorized: false,
      response: jsonResponse(
        {
          success: false,
          error: "Forbidden: Official session is not assigned to this match",
          message: `ใบอนุญาตของท่านถูกกำหนดให้กับแมตช์ ${payload.matchId} เท่านั้น`,
        },
        { status: 403 }
      ),
    };
  }

  return {
    authorized: true,
    official: payload,
    role: "OFFICIAL",
  };
}

/**
 * Verifies role permissions for coach, athlete, official, or federation admin
 */
export function requireRole(req: NextRequest | any, allowedRoles: Role[]): AuthResult {
  // Check official token first (official or admin)
  const officialToken = getOfficialTokenFromRequest(req);
  if (officialToken) {
    const payload = verifyOfficialToken(officialToken);
    if (payload && (allowedRoles.includes("OFFICIAL") || allowedRoles.includes("ADMIN"))) {
      return { authorized: true, official: payload, role: "OFFICIAL" };
    }
  }

  // Check user role from header or cookie
  const headerRole = typeof req.headers?.get === "function"
    ? (req.headers.get("x-user-role") as Role | null)
    : (req.headers?.["x-user-role"] as Role | null);

  const cookieRole = typeof req.cookies?.get === "function"
    ? (req.cookies.get("statcourt_user_role")?.value as Role | null)
    : (req.cookies?.["statcourt_user_role"] as Role | null);

  const role = headerRole || cookieRole;

  if (role && allowedRoles.includes(role)) {
    return { authorized: true, role };
  }

  return {
    authorized: false,
    response: jsonResponse(
      {
        success: false,
        error: "Forbidden: Insufficient role permissions",
        message: `คุณไม่มีสิทธิ์ในการดำเนินการนี้ ต้องมีสิทธิ์อย่างใดอย่างหนึ่งใน: ${allowedRoles.join(", ")}`,
      },
      { status: 403 }
    ),
  };
}

import { NextRequest, NextResponse } from "next/server";
import { verifyOfficialToken } from "@/lib/auth/officialToken";

export async function GET(req: NextRequest) {
  try {
    // 1. Check Cookie
    const cookieToken = req.cookies.get("statcourt_official_token")?.value;

    // 2. Check Authorization Header (Bearer <token>)
    const authHeader = req.headers.get("authorization");
    const bearerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.substring(7)
      : null;

    // 3. Check custom header
    const customHeaderToken = req.headers.get("x-official-token");

    const token = cookieToken || bearerToken || customHeaderToken;

    if (!token) {
      return NextResponse.json(
        {
          authenticated: false,
          error: "ไม่พบข้อมูล Token การเข้าสู่ระบบของเจ้าหน้าที่โต๊ะเทคนิค",
        },
        { status: 401 }
      );
    }

    const payload = verifyOfficialToken(token);

    if (!payload) {
      return NextResponse.json(
        {
          authenticated: false,
          error: "Session หมดอายุหรือไม่ถูกต้อง กรุณายืนยันตัวตนใหม่อีกครั้ง",
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      official: {
        id: payload.officialId,
        name: payload.name,
        licenseNumber: payload.licenseNumber,
        organization: payload.organization,
        certificationLevel: payload.certificationLevel,
        role: payload.role,
        matchId: payload.matchId,
        issuedAt: new Date(payload.issuedAt).toISOString(),
        expiresAt: new Date(payload.expiresAt).toISOString(),
      },
    });
  } catch (error: any) {
    console.error("Token verification error:", error);
    return NextResponse.json(
      { authenticated: false, error: "เกิดข้อผิดพลาดในการตรวจสอบ Token" },
      { status: 500 }
    );
  }
}

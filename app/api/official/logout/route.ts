import { NextRequest, NextResponse } from "next/server";
import { verifyOfficialToken, generateAuditSignature } from "@/lib/auth/officialToken";
import prisma from "@/lib/db/prisma";

export async function POST(req: NextRequest) {
  try {
    const cookieToken = req.cookies.get("statcourt_official_token")?.value;
    const authHeader = req.headers.get("authorization");
    const bearerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.substring(7)
      : null;
    const customHeader = req.headers.get("x-official-token");
    const token = cookieToken || bearerToken || customHeader;

    if (token) {
      const payload = verifyOfficialToken(token);
      if (payload && payload.matchId) {
        try {
          const timestamp = new Date().toISOString();
          const detailsJson = JSON.stringify({
            action: "TABLE_CONSOLE_LOGOUT",
            licenseNumber: payload.licenseNumber,
            name: payload.name,
          });

          const lastRecord = await prisma.matchDisputeAuditLog.findFirst({
            where: { matchId: payload.matchId },
            orderBy: { timestamp: "desc" },
            select: { digitalSignature: true },
          });

          const signature = generateAuditSignature({
            matchId: payload.matchId,
            operatorLicense: payload.licenseNumber,
            actionType: "TABLE_LOGOUT",
            quarter: 4,
            gameClockDisplay: "00:00",
            detailsJson,
            timestamp,
            previousSignature: lastRecord?.digitalSignature,
          });

          const matchExists = await prisma.match.findUnique({
            where: { id: payload.matchId },
            select: { id: true },
          });

          if (matchExists) {
            await prisma.matchDisputeAuditLog.create({
              data: {
                matchId: payload.matchId,
                operatorLicense: payload.licenseNumber,
                operatorName: payload.name,
                actionType: "TABLE_LOGOUT",
                quarter: 4,
                gameClockDisplay: "00:00",
                detailsJson,
                digitalSignature: signature,
                ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
                timestamp: new Date(timestamp),
              },
            });
          }
        } catch (dbErr) {
          console.warn("Could not log table logout:", dbErr);
        }
      }
    }

    const response = NextResponse.json({
      success: true,
      message: "ออกจากระบบโต๊ะเทคนิคเรียบร้อยแล้ว",
    });

    // Clear session cookie
    response.cookies.set("statcourt_official_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { success: false, error: "เกิดข้อผิดพลาดในการออกจากระบบ" },
      { status: 500 }
    );
  }
}

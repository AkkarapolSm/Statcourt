import { NextRequest, NextResponse } from "next/server";
import {
  authenticateOfficialCredentials,
  signOfficialToken,
  generateAuditSignature,
} from "@/lib/auth/officialToken";
import prisma from "@/lib/db/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { licenseNumber, pin, matchId } = body;

    if (!licenseNumber || !pin) {
      return NextResponse.json(
        {
          success: false,
          error: "กรุณาระบุเลขที่ใบอนุญาตกรรมการโต๊ะเทคนิค (License Number) และรหัส PIN",
        },
        { status: 400 }
      );
    }

    const official = authenticateOfficialCredentials(licenseNumber, pin);

    if (!official) {
      return NextResponse.json(
        {
          success: false,
          error: "รหัส PIN หรือเลขที่ใบอนุญาตไม่ถูกต้อง กรุณาตรวจสอบข้อมูลหรือติดต่อผู้ดูแลระบบสหพันธ์",
        },
        { status: 401 }
      );
    }

    // Generate signed HMAC-SHA256 session token valid for 8 hours
    const token = signOfficialToken(official, matchId || undefined, 8);
    const expiresAt = new Date(Date.now() + 8 * 3600 * 1000).toISOString();

    // Log login event to Match Audit Trail if matchId is provided
    if (matchId) {
      try {
        const timestamp = new Date().toISOString();
        const detailsJson = JSON.stringify({
          action: "TABLE_CONSOLE_LOGIN",
          officialId: official.officialId,
          name: official.name,
          licenseNumber: official.licenseNumber,
          certificationLevel: official.certificationLevel,
        });

        // Find last record for cryptographic hash chaining
        const lastRecord = await prisma.matchDisputeAuditLog.findFirst({
          where: { matchId },
          orderBy: { timestamp: "desc" },
          select: { digitalSignature: true },
        });

        const signature = generateAuditSignature({
          matchId,
          operatorLicense: official.licenseNumber,
          actionType: "TABLE_LOGIN",
          quarter: 1,
          gameClockDisplay: "10:00",
          detailsJson,
          timestamp,
          previousSignature: lastRecord?.digitalSignature,
        });

        // Ensure match exists or record if table match exists
        const matchExists = await prisma.match.findUnique({
          where: { id: matchId },
          select: { id: true },
        });

        if (matchExists) {
          await prisma.matchDisputeAuditLog.create({
            data: {
              matchId,
              operatorLicense: official.licenseNumber,
              operatorName: official.name,
              actionType: "TABLE_LOGIN",
              quarter: 1,
              gameClockDisplay: "10:00",
              detailsJson,
              digitalSignature: signature,
              ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
              timestamp: new Date(timestamp),
            },
          });
        }
      } catch (dbErr) {
        console.warn("Could not log table login to DB:", dbErr);
      }
    }

    const response = NextResponse.json({
      success: true,
      token,
      expiresAt,
      official: {
        id: official.officialId,
        name: official.name,
        licenseNumber: official.licenseNumber,
        organization: official.organization,
        certificationLevel: official.certificationLevel,
        role: official.role,
        approvedMatchId: matchId || null,
      },
    });

    // Set secure HTTP-only cookie
    response.cookies.set("statcourt_official_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 8 * 3600, // 8 hours
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Official authentication failed:", error);
    return NextResponse.json(
      { success: false, error: "เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์โต๊ะเทคนิค" },
      { status: 500 }
    );
  }
}

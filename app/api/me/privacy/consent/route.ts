import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUserSession } from "@/lib/auth/serverAuth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserSession(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "กรุณาเข้าสู่ระบบ (Authentication Required)" },
        { status: 401 }
      );
    }

    const consents = await prisma.dataPrivacyConsent.findMany({
      where: { userId: user.id },
      orderBy: { acceptedAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: consents,
    });
  } catch (error) {
    console.error("[PRIVACY CONSENT GET] Error:", error);
    return NextResponse.json(
      { success: false, error: "ไม่สามารถดึงข้อมูล Consent ได้" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserSession(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "กรุณาเข้าสู่ระบบก่อนทำการบันทึกความยินยอม" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const consentType = String(body.consentType || "").trim();
    const isAccepted = Boolean(body.isAccepted);
    const guardianName = body.guardianName ? String(body.guardianName).trim() : null;
    const guardianPhone = body.guardianPhone ? String(body.guardianPhone).trim() : null;

    const validConsentTypes = [
      "SCOUTING_DATABASE",
      "LIVE_STREAM_STATS",
      "PARENTAL_MINOR_CONSENT",
      "MARKETING_COMMUNICATIONS",
      "TCAS_QUOTA_TRANSFER",
    ];

    if (!validConsentTypes.includes(consentType)) {
      return NextResponse.json(
        { success: false, error: `ประเภทความยินยอม '${consentType}' ไม่ถูกต้องตามระบบ PDPA` },
        { status: 400 }
      );
    }

    const ipAddress = request.headers.get("x-forwarded-for") || request.ip || null;

    const consent = await prisma.dataPrivacyConsent.create({
      data: {
        userId: user.id,
        consentType,
        isAccepted,
        guardianName,
        guardianPhone,
        ipAddress,
      },
    });

    // Audit log for consent changes
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: isAccepted ? "CONSENT_GRANTED" : "CONSENT_REVOKED",
        targetEntity: "DataPrivacyConsent",
        targetId: consent.id,
        metadataJson: JSON.stringify({
          consentType,
          isAccepted,
          guardianName,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: `บันทึกความยินยอม '${consentType}' เรียบร้อยแล้ว`,
      data: consent,
    });
  } catch (error) {
    console.error("[PRIVACY CONSENT POST] Error:", error);
    return NextResponse.json(
      { success: false, error: "ไม่สามารถบันทึกความยินยอมได้" },
      { status: 500 }
    );
  }
}

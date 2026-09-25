import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/serverAuth";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const athleteId = params.id;

    const pass = await prisma.digitalPlayerPass.findUnique({
      where: { athleteId },
      include: {
        athlete: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            schoolOrClub: true,
            jerseyNumber: true,
            primaryPosition: true,
            heightCm: true,
            birthDate: true,
            province: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (pass) {
      return NextResponse.json({
        success: true,
        data: pass,
        source: "PRISMA_SQLITE_PERSISTENT",
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: `ไม่พบบัตรประจำตัวนักกีฬาดิจิทัลสำหรับรหัสนักกีฬา '${athleteId}'`,
      },
      { status: 404 }
    );
  } catch (error) {
    console.error(`[API DIGITAL PASS GET ERROR] for ${params.id}:`, error);
    return NextResponse.json(
      {
        success: false,
        error: "ฐานข้อมูลขัดข้อง ไม่สามารถดึงข้อมูลบัตรประจำตัวนักกีฬาได้ (Database Unavailable)",
      },
      { status: 503 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const athleteId = params.id;

    // Require Official or Federation Admin to issue or verify Digital Player Pass
    const auth = requireRole(request, ["OFFICIAL", "ADMIN"]);
    if (!auth.authorized) {
      return auth.response!;
    }

    const body = await request.json();
    const { idCardNumberHash, dateOfBirth, verifiedAge = 18, status = "ACTIVE" } = body;

    const qrPassCode = `STC-PASS-${athleteId.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

    const pass = await prisma.digitalPlayerPass.upsert({
      where: { athleteId },
      update: {
        idCardNumberHash: idCardNumberHash || `SHA256-${athleteId}-PASS`,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : new Date("2008-05-14T00:00:00Z"),
        verifiedAge: Number(verifiedAge) || 18,
        status,
      },
      create: {
        athleteId,
        idCardNumberHash: idCardNumberHash || `SHA256-${athleteId}-PASS`,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : new Date("2008-05-14T00:00:00Z"),
        verifiedAge: Number(verifiedAge) || 18,
        qrPassCode,
        status,
      },
    });

    return NextResponse.json({
      success: true,
      data: pass,
      message: "ออกบัตรประจำตัวนักกีฬาดิจิทัล (Digital Player Pass) สำเร็จ",
      source: "PRISMA_SQLITE_PERSISTENT",
    });
  } catch (error) {
    console.error("[API DIGITAL PASS POST ERROR]:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to issue digital player pass",
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/serverAuth";
import { canAccessAthlete } from "@/lib/auth/resources";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const athleteId = params.id;

    if (!(await canAccessAthlete(request, athleteId, "read"))) {
      return NextResponse.json(
        { success: false, error: "ไม่มีสิทธิ์ดูบัตรประจำตัวนักกีฬาดิจิทัลของผู้อื่น (Private Credential)" },
        { status: 403, headers: { "Cache-Control": "private, no-store" } }
      );
    }

    const pass = await prisma.digitalPlayerPass.findUnique({
      where: { athleteId },
      select: {
        athleteId: true, qrPassCode: true, status: true, verifiedAge: true,
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
      return NextResponse.json(
        {
          success: true,
          data: pass,
          source: "PRISMA_SQLITE_PERSISTENT",
        },
        { headers: { "Cache-Control": "private, no-store" } }
      );
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
    const auth = await requireRole(request, ["ADMIN"]);
    if (!auth.authorized) {
      return auth.response!;
    }

    const body = await request.json();
    const { idCardNumberHash, dateOfBirth, verifiedAge = 18, status = "ACTIVE" } = body;
    if (!/^[a-f0-9]{64}$/i.test(String(idCardNumberHash || "")) || !dateOfBirth || !Number.isInteger(Number(verifiedAge)) || !["ACTIVE", "SUSPENDED", "BANNED"].includes(status)) {
      return NextResponse.json({ error: "ข้อมูลยืนยันตัวตนไม่ครบหรือไม่ถูกต้อง" }, { status: 400 });
    }

    const qrPassCode = `STC-PASS-${athleteId.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

    const pass = await prisma.digitalPlayerPass.upsert({
      where: { athleteId },
      update: {
        idCardNumberHash,
        dateOfBirth: new Date(dateOfBirth),
        verifiedAge: Number(verifiedAge),
        status,
      },
      create: {
        athleteId,
        idCardNumberHash,
        dateOfBirth: new Date(dateOfBirth),
        verifiedAge: Number(verifiedAge),
        qrPassCode,
        status,
      },
    });

    return NextResponse.json({
      success: true,
      data: { athleteId: pass.athleteId, qrPassCode: pass.qrPassCode, status: pass.status, verifiedAge: pass.verifiedAge },
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

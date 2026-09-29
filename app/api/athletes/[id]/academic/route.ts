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
      return NextResponse.json({ error: "ไม่มีสิทธิ์ดูผลการเรียน" }, { status: 403 });
    }

    const records = await prisma.academicRecord.findMany({
      where: { athleteId },
      orderBy: [
        { schoolYear: "desc" },
        { semester: "desc" },
      ],
    });

    if (records.length > 0) {
      const gpax = (records.reduce((acc, curr) => acc + curr.gpa, 0) / records.length).toFixed(2);
      return NextResponse.json(
        {
          success: true,
          count: records.length,
          gpax: Number(gpax),
          data: records,
          source: "PRISMA_SQLITE_PERSISTENT",
        },
        { headers: { "Cache-Control": "private, no-store" } }
      );
    }

    return NextResponse.json(
      {
        success: true,
        count: 0,
        gpax: 0,
        data: [],
        source: "EMPTY_RECORD",
      },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  } catch (error) {
    console.error(`[API ACADEMIC GET] Failed for ${params.id}:`, error);
    return NextResponse.json(
      {
        success: false,
        error: "ฐานข้อมูลขัดข้อง ไม่สามารถดึงประวัติผลการเรียนได้ (Database Unavailable)",
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

    // Require Coach, Official, or Admin authentication
    const auth = await requireRole(request, ["ATHLETE", "COACH", "ADMIN"]);
    if (!auth.authorized) {
      return auth.response!;
    }
    if (!(await canAccessAthlete(request, athleteId, "write"))) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์บันทึกผลการเรียน" }, { status: 403 });
    }

    const body = await request.json();
    const { schoolYear, gradeLevel, semester, gpa, transcriptUrl } = body;

    if (!schoolYear || !gradeLevel || !semester || gpa === undefined) {
      return NextResponse.json(
        { success: false, error: "กรุณาระบุปีการศึกษา ชั้นเรียน ภาคเรียน และเกรดเฉลี่ย GPA" },
        { status: 400 }
      );
    }

    const numGpa = Number(gpa);
    if (isNaN(numGpa) || numGpa < 0 || numGpa > 4.0) {
      return NextResponse.json(
        { success: false, error: "เกรดเฉลี่ย GPA ต้องอยู่ระหว่าง 0.00 ถึง 4.00" },
        { status: 400 }
      );
    }

    // Academic verification status depends on official role
    const isVerified = auth.role === "ADMIN";

    const record = await prisma.academicRecord.create({
      data: {
        athleteId,
        schoolYear: Number(schoolYear),
        gradeLevel,
        semester: Number(semester),
        gpa: numGpa,
        transcriptUrl: transcriptUrl || null,
        isVerified,
      },
    });

    return NextResponse.json({
      success: true,
      data: record,
      message: isVerified
        ? "บันทึกผลการเรียนที่ผ่านการรับรอง (Verified) สำเร็จ"
        : "บันทึกผลการเรียนสำเร็จ (รอการตรวจสอบเอกสาร Transcript โดยเจ้าหน้าที่)",
      source: "PRISMA_SQLITE_PERSISTENT",
    });
  } catch (error) {
    console.error("[API ACADEMIC POST ERROR]:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการบันทึกผลการเรียน",
      },
      { status: 500 }
    );
  }
}

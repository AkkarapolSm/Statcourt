import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSessionUser } from "@/lib/auth/serverAuth";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { applicationId: string } }
) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "กรุณาเข้าสู่ระบบก่อนดำเนินการ (Authentication Required)" },
        { status: 401 }
      );
    }

    // Role check: Only COACH or ADMIN can screen candidates and schedule tryouts
    if (user.role !== "COACH" && user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "คุณไม่มีสิทธิ์ในการประเมินหรือคัดกรองใบสมัคร (Coach/Admin Only)" },
        { status: 403 }
      );
    }

    const { applicationId } = params;
    const body = await request.json();
    const { status, interviewDate, interviewVenue, interviewNotes, decisionNotes } = body;

    const validStatuses = [
      "PENDING",
      "SHORTLISTED",
      "INTERVIEW_SCHEDULED",
      "ACCEPTED",
      "REJECTED",
      "WITHDRAWN",
    ];

    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: `สถานะ '${status}' ไม่ถูกต้องตามระบบ` },
        { status: 400 }
      );
    }

    const existing = await prisma.opportunityApplication.findUnique({
      where: { id: applicationId },
      include: { opportunity: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "ไม่พบใบสมัครนี้ในระบบ" },
        { status: 404 }
      );
    }

    const updated = await prisma.opportunityApplication.update({
      where: { id: applicationId },
      data: {
        ...(status ? { status } : {}),
        ...(interviewDate !== undefined ? { interviewDate: interviewDate ? new Date(interviewDate) : null } : {}),
        ...(interviewVenue !== undefined ? { interviewVenue } : {}),
        ...(interviewNotes !== undefined ? { interviewNotes } : {}),
        ...(decisionNotes !== undefined ? { decisionNotes } : {}),
      },
    });

    // Audit log for recruitment action
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: `APPLICATION_${status || "UPDATED"}`,
        targetEntity: "OpportunityApplication",
        targetId: applicationId,
        metadataJson: JSON.stringify({
          previousStatus: existing.status,
          newStatus: status || existing.status,
          interviewDate,
          interviewVenue,
          decisionNotes,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: `อัปเดตสถานะใบสมัครเป็น [${status || existing.status}] สำเร็จ`,
    });
  } catch (error) {
    console.error("[APPLICATION PATCH ERROR]:", error);
    return NextResponse.json(
      { success: false, error: "เกิดข้อผิดพลาดในการอัปเดตใบสมัคร" },
      { status: 500 }
    );
  }
}

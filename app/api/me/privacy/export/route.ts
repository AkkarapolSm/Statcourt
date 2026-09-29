import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUserSession } from "@/lib/auth/serverAuth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const sessionUser = await getCurrentUserSession(request);
    if (!sessionUser) {
      return NextResponse.json(
        { success: false, error: "กรุณาเข้าสู่ระบบก่อนทำการดาวน์โหลดข้อมูลส่วนบุคคล (PDPA Export)" },
        { status: 401 }
      );
    }

    const userId = sessionUser.id;

    // Fetch user and all associated data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        displayName: true,
        phoneNumber: true,
        role: true,
        accountStatus: true,
        createdAt: true,
        updatedAt: true,
        athleteProfile: {
          include: {
            seasonStats: true,
            academicRecords: true,
            digitalPlayerPass: true,
            injuryLogs: true,
            attendances: true,
            teamRosters: {
              include: { team: { select: { id: true, name: true, institution: true } } },
            },
            events: {
              take: 50,
              orderBy: { createdAt: "desc" },
            },
          },
        },
        coachProfile: {
          include: {
            managedTeams: { select: { id: true, name: true, institution: true } },
          },
        },
        officialProfile: true,
        teamMemberships: {
          include: { team: { select: { id: true, name: true, institution: true } } },
        },
        privacyConsents: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "ไม่พบข้อมูลผู้ใช้" },
        { status: 404 }
      );
    }

    // Record audit log for data export (PDPA Article 30/Right of Access)
    await prisma.auditLog.create({
      data: {
        userId,
        action: "PDPA_DATA_EXPORTED",
        targetEntity: "User",
        targetId: userId,
        metadataJson: JSON.stringify({
          role: user.role,
          timestamp: new Date().toISOString(),
        }),
      },
    });

    const response = NextResponse.json({
      success: true,
      exportDate: new Date().toISOString(),
      regulations: "Thailand Personal Data Protection Act (PDPA B.E. 2562)",
      data: user,
    });

    response.headers.set("Cache-Control", "private, no-store, max-age=0");
    return response;
  } catch (error) {
    console.error("[PDPA EXPORT API] Error:", error);
    return NextResponse.json(
      { success: false, error: "ไม่สามารถส่งออกข้อมูลส่วนบุคคลได้" },
      { status: 500 }
    );
  }
}

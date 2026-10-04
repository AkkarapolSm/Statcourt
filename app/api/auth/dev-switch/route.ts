import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { createSession, revokeSession } from "@/lib/auth/session";
import { setUserSubscriptionTier } from "@/lib/auth/entitlements";
import type { Role, SubscriptionTier } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const targetRole = body.role as Role | "PUBLIC";
    const targetTier: SubscriptionTier = body.tier === "PRO" ? "PRO" : "FREE";

    const response = NextResponse.json({ success: true });

    // 1. If switching to PUBLIC (Guest Spectator)
    if (targetRole === "PUBLIC") {
      await revokeSession(request, response);
      return NextResponse.json({
        success: true,
        user: {
          id: "guest-visitor",
          name: "ผู้เข้าชมทั่วไป (Public Spectator)",
          email: "",
          role: "PUBLIC",
          approvalStatus: "PENDING",
          tier: targetTier,
        },
      }, {
        headers: response.headers,
      });
    }

    // 2. Resolve or create user corresponding to requested role
    let user: any = null;

    if (targetRole === "ADMIN") {
      user = await prisma.user.findFirst({
        where: { role: "ADMIN" },
        include: { coachProfile: true, officialProfile: true, athleteProfile: true },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            id: "usr-admin-01",
            email: "admin@statcourt.th",
            displayName: "ผู้ดูแลระบบสหพันธ์ (Federation Admin)",
            phoneNumber: "+66899990001",
            role: "ADMIN",
            accountStatus: "ACTIVE",
          },
          include: { coachProfile: true, officialProfile: true, athleteProfile: true },
        });
      }
    } else if (targetRole === "COACH") {
      user = await prisma.user.findFirst({
        where: { role: "COACH" },
        include: { coachProfile: true, officialProfile: true, athleteProfile: true },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            id: "usr-coach-bcc",
            email: "coach.bcc@statcourt.th",
            displayName: "โค้ชสมชาย ประเสริฐ (Coach BCC)",
            phoneNumber: "+66812345002",
            role: "COACH",
            accountStatus: "ACTIVE",
            coachProfile: {
              create: {
                id: "coach-bcc",
                fullName: "สมชาย ประเสริฐ",
                organization: "Bangkok Christian College Basketball Program",
                phoneNumber: "+66812345002",
                isVerified: true,
              },
            },
          },
          include: { coachProfile: true, officialProfile: true, athleteProfile: true },
        });
      }
    } else if (targetRole === "OFFICIAL") {
      user = await prisma.user.findFirst({
        where: { role: "OFFICIAL" },
        include: { coachProfile: true, officialProfile: true, athleteProfile: true },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            id: "usr-official-01",
            email: "official.table@statcourt.th",
            displayName: "กิตติศักดิ์ ชัยมงคล (FIBA Table Official)",
            phoneNumber: "+66812345001",
            role: "OFFICIAL",
            accountStatus: "ACTIVE",
            officialProfile: {
              create: {
                id: "off-01",
                fullName: "กิตติศักดิ์ ชัยมงคล",
                licensingBody: "FIBA Asia & Basketball Sport Association of Thailand (BSAT)",
                licenseNumber: "FIBA-TH-STAT-2024-089",
                approvalStatus: "APPROVED",
              },
            },
          },
          include: { coachProfile: true, officialProfile: true, athleteProfile: true },
        });
      }
    } else if (targetRole === "ATHLETE") {
      user = await prisma.user.findFirst({
        where: { role: "ATHLETE" },
        include: { coachProfile: true, officialProfile: true, athleteProfile: true },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            id: "usr-ath-1",
            email: "thanakorn.siriphan@statcourt.th",
            displayName: "ธนากร ศิริพันธ์ (#7 BCC)",
            role: "ATHLETE",
            accountStatus: "ACTIVE",
          },
          include: { coachProfile: true, officialProfile: true, athleteProfile: true },
        });
      }
    } else if (targetRole === "FAN") {
      user = await prisma.user.findFirst({
        where: { role: "FAN" },
        include: { coachProfile: true, officialProfile: true, athleteProfile: true },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            id: "usr-fan-01",
            email: "fan.supporter@statcourt.th",
            displayName: "อัครพล แฟนคลับ (Basketball Fan)",
            role: "FAN",
            accountStatus: "ACTIVE",
          },
          include: { coachProfile: true, officialProfile: true, athleteProfile: true },
        });
      }
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: `ไม่พบบทบาท '${targetRole}' ในระบบ` },
        { status: 400 }
      );
    }

    // 3. Issue genuine session cookie on server
    const switchResponse = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.displayName || user.email.split("@")[0],
        email: user.email,
        role: user.role,
        approvalStatus: user.officialProfile?.approvalStatus || "APPROVED",
        organization: user.coachProfile?.organization || user.officialProfile?.licensingBody,
        tier: targetTier,
        athleteId: user.athleteProfile?.id || (targetRole === "ATHLETE" ? "ath-1" : undefined),
      },
    });

    setUserSubscriptionTier(user.id, targetTier);
    await createSession(user.id, switchResponse);

    return switchResponse;
  } catch (error) {
    console.error("[DEV ROLE SWITCH ERROR]:", error);
    return NextResponse.json(
      { success: false, error: "เกิดข้อผิดพลาดในการสลับสิทธิ์" },
      { status: 500 }
    );
  }
}

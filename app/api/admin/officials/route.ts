import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/serverAuth";
import { requestOriginAllowed } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  const auth = await requireRole(request, ["ADMIN"]);
  if (!auth.authorized) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status")?.toUpperCase() || "ALL";
    const q = searchParams.get("q")?.trim().toLowerCase() || "";

    const whereClause: Record<string, unknown> = {};
    if (status !== "ALL") {
      whereClause.approvalStatus = status;
    }

    const [allOfficials, totalCount, pendingCount, approvedCount, rejectedCount] = await Promise.all([
      prisma.officialProfile.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              displayName: true,
              phoneNumber: true,
              accountStatus: true,
              createdAt: true,
            },
          },
        },
        orderBy: { user: { createdAt: "desc" } },
      }),
      prisma.officialProfile.count(),
      prisma.officialProfile.count({ where: { approvalStatus: "PENDING" } }),
      prisma.officialProfile.count({ where: { approvalStatus: "APPROVED" } }),
      prisma.officialProfile.count({ where: { approvalStatus: "REJECTED" } }),
    ]);

    const filteredOfficials = q
      ? allOfficials.filter(
          (item) =>
            item.fullName.toLowerCase().includes(q) ||
            item.licensingBody.toLowerCase().includes(q) ||
            (item.licenseNumber && item.licenseNumber.toLowerCase().includes(q)) ||
            (item.user.email && item.user.email.toLowerCase().includes(q)) ||
            (item.user.phoneNumber && item.user.phoneNumber.includes(q))
        )
      : allOfficials;

    return NextResponse.json(
      {
        officials: filteredOfficials,
        stats: {
          total: totalCount,
          pending: pendingCount,
          approved: approvedCount,
          rejected: rejectedCount,
        },
      },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  } catch (error) {
    console.error("[ADMIN OFFICIALS API] GET failed:", error);
    return NextResponse.json({ error: "ไม่สามารถดึงข้อมูลเจ้าหน้าที่ได้" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  if (!requestOriginAllowed(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  const auth = await requireRole(request, ["ADMIN"]);
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    const { officialId, approvalStatus, licenseNumber, reason } = body;

    if (!officialId || !["APPROVED", "REJECTED", "PENDING"].includes(approvalStatus)) {
      return NextResponse.json(
        { error: "ข้อมูลไม่ถูกต้อง (ต้องระบุ officialId และ approvalStatus: APPROVED / REJECTED / PENDING)" },
        { status: 400 }
      );
    }

    const official = await prisma.officialProfile.findUnique({
      where: { id: officialId },
      include: { user: true },
    });

    if (!official) {
      return NextResponse.json({ error: "ไม่พบข้อมูลเจ้าหน้าที่" }, { status: 404 });
    }

    const previousStatus = official.approvalStatus;

    const updatedOfficial = await prisma.$transaction(async (tx) => {
      // 1. Update official profile
      const updated = await tx.officialProfile.update({
        where: { id: officialId },
        data: {
          approvalStatus,
          licenseNumber: licenseNumber ? String(licenseNumber).trim() : official.licenseNumber,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              displayName: true,
              phoneNumber: true,
              accountStatus: true,
            },
          },
        },
      });

      // 2. If approved, activate user account
      if (approvalStatus === "APPROVED") {
        await tx.user.update({
          where: { id: official.userId },
          data: { accountStatus: "ACTIVE" },
        });
      } else if (approvalStatus === "REJECTED") {
        await tx.user.update({
          where: { id: official.userId },
          data: { accountStatus: "SUSPENDED" },
        });
      }

      // 3. Create Audit Log
      await tx.auditLog.create({
        data: {
          userId: auth.userId!,
          action: approvalStatus === "APPROVED" ? "APPROVE_OFFICIAL" : "REJECT_OFFICIAL",
          targetEntity: "OfficialProfile",
          targetId: officialId,
          metadataJson: JSON.stringify({
            previousStatus,
            newStatus: approvalStatus,
            licenseNumber: licenseNumber || official.licenseNumber,
            reason: reason || null,
            officialName: official.fullName,
            officialEmail: official.user.email,
          }),
        },
      });

      return updated;
    });

    return NextResponse.json({
      success: true,
      message:
        approvalStatus === "APPROVED"
          ? `อนุมัติและออกใบอนุญาตเจ้าหน้าที่ '${official.fullName}' เรียบร้อยแล้ว`
          : `ปฏิเสธคำขอเจ้าหน้าที่ '${official.fullName}' เรียบร้อยแล้ว`,
      official: updatedOfficial,
    });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "รูปแบบ JSON ไม่ถูกต้อง" }, { status: 400 });
    }
    console.error("[ADMIN OFFICIALS API] PATCH failed:", error);
    return NextResponse.json({ error: "ไม่สามารถอัปเดตสถานะเจ้าหน้าที่ได้" }, { status: 500 });
  }
}

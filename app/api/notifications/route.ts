import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUserSession } from "@/lib/auth/serverAuth";
import { requestOriginAllowed } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserSession(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "กรุณาเข้าสู่ระบบเพื่อดูการแจ้งเตือน" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get("unreadOnly") === "true";
    const type = searchParams.get("type");
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "20", 10), 1), 50);
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
    const skip = (page - 1) * limit;

    const whereClause: Record<string, unknown> = {
      userId: user.id,
    };

    if (unreadOnly) {
      whereClause.isRead = false;
    }

    if (type && type !== "ALL") {
      whereClause.type = type;
    }

    const [notifications, unreadCount, total] = await Promise.all([
      prisma.notification.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip,
      }),
      prisma.notification.count({
        where: {
          userId: user.id,
          isRead: false,
        },
      }),
      prisma.notification.count({
        where: whereClause,
      }),
    ]);

    return NextResponse.json(
      {
        success: true,
        notifications,
        unreadCount,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      {
        headers: {
          "Cache-Control": "private, no-cache, no-store, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("[Notifications API] GET error:", error);
    return NextResponse.json(
      { success: false, error: "ไม่สามารถดึงข้อมูลการแจ้งเตือนได้" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  if (!requestOriginAllowed(request)) {
    return NextResponse.json({ success: false, error: "Invalid origin" }, { status: 403 });
  }

  try {
    const user = await getCurrentUserSession(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "กรุณาเข้าสู่ระบบก่อนอัปเดตการแจ้งเตือน" },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { notificationId, markAllAsRead } = body;

    if (markAllAsRead) {
      await prisma.notification.updateMany({
        where: {
          userId: user.id,
          isRead: false,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: "ทำเครื่องหมายอ่านแล้วทั้งหมดเรียบร้อยแล้ว",
      });
    }

    if (notificationId && typeof notificationId === "string") {
      const existing = await prisma.notification.findFirst({
        where: { id: notificationId, userId: user.id },
      });

      if (!existing) {
        return NextResponse.json(
          { success: false, error: "ไม่พบการแจ้งเตือนนี้ หรือไม่มีสิทธิ์เข้าถึง" },
          { status: 404 }
        );
      }

      const updated = await prisma.notification.update({
        where: { id: notificationId },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        notification: updated,
      });
    }

    return NextResponse.json(
      { success: false, error: "ต้องระบุ notificationId หรือ markAllAsRead" },
      { status: 400 }
    );
  } catch (error) {
    console.error("[Notifications API] PATCH error:", error);
    return NextResponse.json(
      { success: false, error: "เกิดข้อผิดพลาดในการอัปเดตการแจ้งเตือน" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  if (!requestOriginAllowed(request)) {
    return NextResponse.json({ success: false, error: "Invalid origin" }, { status: 403 });
  }

  try {
    const user = await getCurrentUserSession(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "กรุณาเข้าสู่ระบบก่อนลบการแจ้งเตือน" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get("id");

    if (!notificationId) {
      return NextResponse.json(
        { success: false, error: "ต้องระบุรหัสการแจ้งเตือน (?id=...)" },
        { status: 400 }
      );
    }

    const existing = await prisma.notification.findFirst({
      where: { id: notificationId, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "ไม่พบการแจ้งเตือน หรือไม่มีสิทธิ์ลบ" },
        { status: 404 }
      );
    }

    await prisma.notification.delete({
      where: { id: notificationId },
    });

    return NextResponse.json({
      success: true,
      message: "ลบการแจ้งเตือนเรียบร้อยแล้ว",
    });
  } catch (error) {
    console.error("[Notifications API] DELETE error:", error);
    return NextResponse.json(
      { success: false, error: "เกิดข้อผิดพลาดในการลบการแจ้งเตือน" },
      { status: 500 }
    );
  }
}

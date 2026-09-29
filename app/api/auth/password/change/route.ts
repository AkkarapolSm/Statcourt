import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, requestOriginAllowed } from "@/lib/auth/session";
import { changeUserPassword } from "@/lib/auth/accountSecurity";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!requestOriginAllowed(request)) {
    return NextResponse.json({ success: false, error: "Invalid origin" }, { status: 403 });
  }

  const user = await getSessionUser(request);
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { currentPassword = "", newPassword = "" } = body;

    if (!newPassword || newPassword.length < 12) {
      return NextResponse.json(
        { success: false, error: "รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 12-128 ตัวอักษร" },
        { status: 400 }
      );
    }

    const result = await changeUserPassword(user.id, currentPassword, newPassword);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "เปลี่ยนรหัสผ่านสำเร็จเรียบร้อยแล้ว",
    });
  } catch (error) {
    console.error("[Password Change API] Error:", error);
    return NextResponse.json(
      { success: false, error: "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน" },
      { status: 500 }
    );
  }
}

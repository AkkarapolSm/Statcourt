import { NextRequest, NextResponse } from "next/server";
import { requestOriginAllowed } from "@/lib/auth/session";
import { confirmPasswordReset } from "@/lib/auth/accountSecurity";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!requestOriginAllowed(request)) {
    return NextResponse.json({ success: false, error: "Invalid origin" }, { status: 403 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { token, newPassword } = body;

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { success: false, error: "กรุณาระบุโทเค็นรีเซ็ตรหัสผ่าน (Reset token is required)" },
        { status: 400 }
      );
    }

    if (!newPassword || typeof newPassword !== "string" || newPassword.length < 12) {
      return NextResponse.json(
        { success: false, error: "รหัสผ่านต้องมีความยาวอย่างน้อย 12-128 ตัวอักษร" },
        { status: 400 }
      );
    }

    const result = await confirmPasswordReset(token, newPassword);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "ตั้งรหัสผ่านใหม่สำเร็จเรียบร้อยแล้ว ทุกอุปกรณ์เดิมถูกออกจากระบบเพื่อความปลอดภัย",
    });
  } catch (error) {
    console.error("[Password Reset Confirm API] Error:", error);
    return NextResponse.json(
      { success: false, error: "เกิดข้อผิดพลาดในการตั้งรหัสผ่านใหม่" },
      { status: 500 }
    );
  }
}

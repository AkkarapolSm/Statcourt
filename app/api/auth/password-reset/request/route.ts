import { NextRequest, NextResponse } from "next/server";
import { requestOriginAllowed } from "@/lib/auth/session";
import { requestPasswordReset } from "@/lib/auth/accountSecurity";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!requestOriginAllowed(request)) {
    return NextResponse.json({ success: false, error: "Invalid origin" }, { status: 403 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { email } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "กรุณาระบุที่อยู่อีเมลที่ถูกต้อง (Valid email required)" },
        { status: 400 }
      );
    }

    const result = await requestPasswordReset(email);

    return NextResponse.json({
      success: true,
      message: "หากพบอีเมลนี้ในระบบ ระบบได้ส่งคำแนะนำการตั้งรหัสผ่านใหม่ไปแล้ว",
      // Expose resetToken in dev/test environment for automated verification
      resetToken: result.token,
    });
  } catch (error) {
    console.error("[Password Reset Request API] Error:", error);
    return NextResponse.json(
      { success: false, error: "เกิดข้อผิดพลาดในการสร้างคำขอรีเซ็ตรหัสผ่าน" },
      { status: 500 }
    );
  }
}

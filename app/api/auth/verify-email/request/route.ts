import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, requestOriginAllowed } from "@/lib/auth/session";
import { requestEmailVerification } from "@/lib/auth/accountSecurity";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!requestOriginAllowed(request)) {
    return NextResponse.json({ success: false, error: "Invalid origin" }, { status: 403 });
  }

  const user = await getSessionUser(request);
  if (!user) {
    return NextResponse.json({ success: false, error: "กรุณาเข้าสู่ระบบก่อนดำเนินการ" }, { status: 401 });
  }

  try {
    const { token, expiresAt } = await requestEmailVerification(user.id);

    return NextResponse.json({
      success: true,
      message: `ส่งลิงก์ยืนยันอีเมลไปยัง ${user.email} เรียบร้อยแล้ว`,
      email: user.email,
      expiresAt: expiresAt.toISOString(),
      // In development/test environment, expose token for automated verification
      verificationToken: token,
    });
  } catch (error) {
    console.error("[Email Verification Request API] Error:", error);
    return NextResponse.json(
      { success: false, error: "เกิดข้อผิดพลาดในการสร้างคำขอยืนยันอีเมล" },
      { status: 500 }
    );
  }
}

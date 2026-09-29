import { NextRequest, NextResponse } from "next/server";
import { requestOriginAllowed } from "@/lib/auth/session";
import { confirmEmailVerification } from "@/lib/auth/accountSecurity";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!requestOriginAllowed(request)) {
    return NextResponse.json({ success: false, error: "Invalid origin" }, { status: 403 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { token } = body;

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { success: false, error: "กรุณาระบุโทเค็นยืนยันอีเมล (Token is required)" },
        { status: 400 }
      );
    }

    const result = await confirmEmailVerification(token);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `ยืนยันอีเมล ${result.email} สำเร็จเรียบร้อยแล้ว`,
      email: result.email,
    });
  } catch (error) {
    console.error("[Email Verification Confirm API] Error:", error);
    return NextResponse.json(
      { success: false, error: "เกิดข้อผิดพลาดในการยืนยันอีเมล" },
      { status: 500 }
    );
  }
}

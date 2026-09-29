import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, requestOriginAllowed } from "@/lib/auth/session";
import { createAdminStepUpToken, verifyAdminStepUpToken } from "@/lib/auth/accountSecurity";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!requestOriginAllowed(request)) {
    return NextResponse.json({ success: false, error: "Invalid origin" }, { status: 403 });
  }

  const user = await getSessionUser(request);
  if (!user || (user.role !== "ADMIN" && user.role !== "OFFICIAL")) {
    return NextResponse.json(
      { success: false, error: "สิทธิ์ไม่เพียงพอ สงวนสิทธิ์เฉพาะผู้ดูแลระบบและเจ้าหน้าที่" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { secretKeyOrPin } = body;

    if (!secretKeyOrPin || typeof secretKeyOrPin !== "string") {
      return NextResponse.json(
        { success: false, error: "กรุณาระบุรหัสผ่านหรือ PIN เพื่อยืนยันสิทธิ์ขั้นสูง" },
        { status: 400 }
      );
    }

    const result = await createAdminStepUpToken(user.id, secretKeyOrPin);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      message: "ยืนยันตัวตนขั้นสูงสำเร็จ มีผลบังคับใช้ 15 นาทีสำหรับปฏิบัติการสำคัญ",
      stepUpToken: result.stepUpToken,
      expiresAt: result.expiresAt?.toISOString(),
    });
  } catch (error) {
    console.error("[Admin Step-Up API] Error:", error);
    return NextResponse.json(
      { success: false, error: "เกิดข้อผิดพลาดในการยืนยันตัวตนขั้นสูง" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const user = await getSessionUser(request);
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const stepUpToken =
    request.headers.get("x-admin-step-up-token") ||
    new URL(request.url).searchParams.get("token") ||
    "";

  const isElevated = await verifyAdminStepUpToken(stepUpToken, user.id);

  return NextResponse.json({
    success: true,
    isElevated,
    role: user.role,
  });
}

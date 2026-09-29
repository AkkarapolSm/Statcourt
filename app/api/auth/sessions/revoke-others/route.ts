import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, requestOriginAllowed, SESSION_COOKIE } from "@/lib/auth/session";
import { revokeOtherSessions } from "@/lib/auth/accountSecurity";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!requestOriginAllowed(request)) {
    return NextResponse.json({ success: false, error: "Invalid origin" }, { status: 403 });
  }

  const user = await getSessionUser(request);
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const currentToken = request.cookies.get(SESSION_COOKIE)?.value;
  if (!currentToken) {
    return NextResponse.json({ success: false, error: "ไม่พบเซสชันปัจจุบัน" }, { status: 400 });
  }

  try {
    const revokedCount = await revokeOtherSessions(user.id, currentToken);

    return NextResponse.json({
      success: true,
      message: `ออกจากระบบอุปกรณ์อื่นทั้งหมดเรียบร้อยแล้ว (${revokedCount} เซสชัน)`,
      revokedCount,
    });
  } catch (error) {
    console.error("[Revoke Other Sessions API] Error:", error);
    return NextResponse.json(
      { success: false, error: "เกิดข้อผิดพลาดในการปิดเซสชันอุปกรณ์อื่น" },
      { status: 500 }
    );
  }
}

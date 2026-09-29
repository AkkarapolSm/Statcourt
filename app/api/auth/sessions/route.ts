import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, requestOriginAllowed, SESSION_COOKIE } from "@/lib/auth/session";
import { listUserSessions, revokeUserSessionById } from "@/lib/auth/accountSecurity";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const user = await getSessionUser(request);
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const currentToken = request.cookies.get(SESSION_COOKIE)?.value;
  const sessions = await listUserSessions(user.id, currentToken);

  return NextResponse.json({
    success: true,
    sessionsCount: sessions.length,
    sessions,
  });
}

export async function DELETE(request: NextRequest) {
  if (!requestOriginAllowed(request)) {
    return NextResponse.json({ success: false, error: "Invalid origin" }, { status: 403 });
  }

  const user = await getSessionUser(request);
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("id");

  if (!sessionId) {
    return NextResponse.json({ success: false, error: "กรุณาระบุ sessionId ที่ต้องการออกจากระบบ" }, { status: 400 });
  }

  const success = await revokeUserSessionById(user.id, sessionId);
  if (!success) {
    return NextResponse.json({ success: false, error: "ไม่พบเซสชันนี้ หรือถูกปิดไปแล้ว" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    message: "ออกจากระบบอุปกรณ์ดังกล่าวเรียบร้อยแล้ว",
    revokedSessionId: sessionId,
  });
}

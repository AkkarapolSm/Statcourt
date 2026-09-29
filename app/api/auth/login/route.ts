import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifyPassword } from "@/lib/auth/credentials";
import { createSession, requestOriginAllowed } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  if (!requestOriginAllowed(request)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  if (Number(request.headers.get("content-length") || 0) > 4096) {
    return NextResponse.json({ error: "Request too large" }, { status: 413 });
  }
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    if (!email || !password) return NextResponse.json({ error: "กรุณาระบุอีเมลและรหัสผ่าน" }, { status: 400 });
    const user = await prisma.user.findUnique({ where: { email }, select: {
      id: true, role: true, accountStatus: true, passwordHash: true,
    } });
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return NextResponse.json({ error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" }, { status: 401 });
    }
    if (user.accountStatus !== "ACTIVE") {
      return NextResponse.json({ error: "บัญชีนี้ยังไม่ได้รับอนุมัติหรือถูกระงับ" }, { status: 403 });
    }
    const response = NextResponse.json({ success: true, role: user.role });
    await createSession(user.id, response);
    return response;
  } catch (error) {
    if (error instanceof SyntaxError) return NextResponse.json({ error: "JSON ไม่ถูกต้อง" }, { status: 400 });
    console.error("Login failed", error);
    return NextResponse.json({ error: "เข้าสู่ระบบไม่สำเร็จ" }, { status: 500 });
  }
}

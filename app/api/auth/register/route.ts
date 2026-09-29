import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/credentials";
import { createSession, requestOriginAllowed } from "@/lib/auth/session";

const roles = new Set(["FAN", "ATHLETE", "COACH", "OFFICIAL"]);
const positions = new Set(["POINT_GUARD", "SHOOTING_GUARD", "SMALL_FORWARD", "POWER_FORWARD", "CENTER"]);

export async function POST(request: NextRequest) {
  if (!requestOriginAllowed(request)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  if (Number(request.headers.get("content-length") || 0) > 16_384) {
    return NextResponse.json({ error: "Request too large" }, { status: 413 });
  }
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    const name = String(body.fullName || "").trim();
    const password = String(body.password || "");
    const role = String(body.role || "");
    if (!roles.has(role) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || name.length < 2 || name.length > 120) {
      return NextResponse.json({ error: "ข้อมูลสมัครสมาชิกไม่ถูกต้อง" }, { status: 400 });
    }
    if (password.length < 12 || password.length > 128) {
      return NextResponse.json({ error: "รหัสผ่านต้องยาว 12–128 ตัวอักษร" }, { status: 400 });
    }
    const phoneNumber = String(body.phoneNumber || "").trim();
    if ((role === "COACH" || role === "OFFICIAL") && phoneNumber.length < 9) {
      return NextResponse.json({ error: "กรุณาระบุเบอร์โทรศัพท์สำหรับการตรวจสอบ" }, { status: 400 });
    }
    const names = name.split(/\s+/);
    const birthDate = new Date(body.birthDate || "");
    const position = String(body.position || "");
    if (role === "ATHLETE" && (!Number.isFinite(birthDate.getTime()) || !positions.has(position) || !body.schoolOrClub)) {
      return NextResponse.json({ error: "ข้อมูลนักกีฬาไม่ครบ" }, { status: 400 });
    }
    const heightCm = Number(body.heightCm);
    if (role === "ATHLETE" && (!Number.isFinite(heightCm) || heightCm < 100 || heightCm > 250)) {
      return NextResponse.json({ error: "ส่วนสูงไม่ถูกต้อง" }, { status: 400 });
    }
    const licenseNumber = String(body.licenseNumber || "").trim();
    if (role === "OFFICIAL" && !licenseNumber) {
      return NextResponse.json({ error: "กรุณาระบุเลขใบอนุญาต" }, { status: 400 });
    }
    const teamId = String(body.teamId || "").trim();
    if (role === "COACH" && teamId && !(await prisma.team.findUnique({ where: { id: teamId }, select: { id: true } }))) {
      return NextResponse.json({ error: "ไม่พบทีมที่เลือก" }, { status: 400 });
    }
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        displayName: name,
        passwordHash,
        role,
        phoneNumber: phoneNumber || null,
        accountStatus: role === "FAN" || role === "ATHLETE" ? "ACTIVE" : "PENDING",
        ...(role === "ATHLETE" ? {
          athleteProfile: { create: {
            firstName: names[0], lastName: names.slice(1).join(" ") || "-",
            birthDate, primaryPosition: position,
            heightCm, schoolOrClub: String(body.schoolOrClub).trim(),
            province: String(body.province || "ไม่ระบุ").trim(),
          } },
        } : {}),
        ...(role === "COACH" ? {
          coachProfile: { create: {
            fullName: name, organization: String(body.organization || "").trim() || "รอตรวจสอบ",
            phoneNumber, isVerified: false,
          } },
          ...(teamId ? { teamMemberships: { create: { teamId, role: "COACH", status: "PENDING" } } } : {}),
        } : {}),
        ...(role === "OFFICIAL" ? {
          officialProfile: { create: {
            fullName: name, licensingBody: String(body.organization || "").trim() || "รอตรวจสอบ",
            licenseNumber, approvalStatus: "PENDING",
          } },
        } : {}),
      },
      select: { id: true, role: true, accountStatus: true },
    });
    const response = NextResponse.json({ success: true, role: user.role, status: user.accountStatus }, { status: 201 });
    if (user.accountStatus === "ACTIVE") await createSession(user.id, response);
    return response;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "อีเมลหรือเบอร์โทรนี้ถูกใช้งานแล้ว" }, { status: 409 });
    }
    if (error instanceof SyntaxError) return NextResponse.json({ error: "JSON ไม่ถูกต้อง" }, { status: 400 });
    console.error("Registration failed", error);
    return NextResponse.json({ error: "สมัครสมาชิกไม่สำเร็จ" }, { status: 500 });
  }
}

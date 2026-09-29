import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    success: false,
    error: "ระบบ PIN ตัวอย่างถูกยกเลิก กรุณาเข้าสู่ระบบด้วยบัญชีเจ้าหน้าที่ที่ได้รับอนุมัติ",
  }, { status: 410 });
}

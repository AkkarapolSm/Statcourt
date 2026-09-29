import { NextRequest, NextResponse } from "next/server";
import { requestOriginAllowed, revokeSession } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  if (!requestOriginAllowed(request)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const response = NextResponse.json({ success: true });
  await revokeSession(request, response);
  return response;
}

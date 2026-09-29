import { NextRequest, NextResponse } from "next/server";
import { requireOfficial } from "@/lib/auth/serverAuth";

export async function GET(request: NextRequest) {
  const matchId = request.nextUrl.searchParams.get("matchId");
  if (!matchId) return NextResponse.json({ authenticated: false, error: "กรุณาระบุแมตช์" }, { status: 400 });
  const auth = await requireOfficial(request, matchId);
  if (!auth.authorized) return auth.response;
  return NextResponse.json({ authenticated: true, official: auth.official }, {
    headers: { "Cache-Control": "private, no-store" },
  });
}

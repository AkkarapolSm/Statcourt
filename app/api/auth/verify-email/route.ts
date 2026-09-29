import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const user = await getSessionUser(request);
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const freshUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      email: true,
      emailVerifiedAt: true,
    },
  });

  return NextResponse.json({
    success: true,
    email: freshUser?.email,
    isVerified: Boolean(freshUser?.emailVerifiedAt),
    emailVerifiedAt: freshUser?.emailVerifiedAt?.toISOString() || null,
  });
}

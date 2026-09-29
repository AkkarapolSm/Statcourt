import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { getServerSubscriptionTier } from "@/lib/auth/entitlements";

export async function GET(request: NextRequest) {
  const user = await getSessionUser(request);
  if (!user || user.accountStatus !== "ACTIVE") {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const tier = await getServerSubscriptionTier(request);

  return NextResponse.json({
    authenticated: true,
    user: {
      id: user.id,
      name: user.displayName || user.email,
      email: user.email,
      role: user.role,
      approvalStatus: user.officialProfile?.approvalStatus || "APPROVED",
      organization: user.coachProfile?.organization || user.officialProfile?.licensingBody,
      tier,
      athleteId: user.athleteProfile?.id,
    },
  }, { headers: { "Cache-Control": "private, no-store" } });
}

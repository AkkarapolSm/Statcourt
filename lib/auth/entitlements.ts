if (typeof window !== "undefined") {
  throw new Error("Server-only entitlements module cannot be imported on the client side.");
}

import type { NextRequest } from "next/server";
import { getSessionUser } from "./session";
import type { SubscriptionTier } from "../types";

/**
 * Server-side subscription entitlement registry.
 * Maps userId -> subscription details. In production, this synchronizes with
 * Stripe webhooks, PromptPay QR subscriptions, or a persistent database table.
 */
const userEntitlements = new Map<string, { tier: SubscriptionTier; updatedAt: number }>();

/**
 * Update a user's subscription entitlement on the server
 */
export function setUserSubscriptionTier(userId: string, tier: SubscriptionTier): void {
  userEntitlements.set(userId, { tier, updatedAt: Date.now() });
}

/**
 * Retrieve a user's current subscription entitlement on the server
 */
export function getUserSubscriptionTierById(userId: string): SubscriptionTier {
  const entitlement = userEntitlements.get(userId);
  return entitlement ? entitlement.tier : "FREE";
}

/**
 * Determine a user's subscription tier strictly from server-verified state.
 * Client-controlled headers (x-user-tier) and query parameters (?tier=PRO)
 * are COMPLETELY IGNORED.
 */
export async function getServerSubscriptionTier(request: NextRequest): Promise<SubscriptionTier> {
  const sessionUser = await getSessionUser(request);
  if (!sessionUser) return "FREE";

  // Admins and Coaches always hold PRO analytics, film, and scouting access
  if (sessionUser.role === "ADMIN" || sessionUser.role === "COACH") {
    return "PRO";
  }

  // Check server-side registered subscription
  const entitlement = userEntitlements.get(sessionUser.id);
  if (entitlement && entitlement.tier === "PRO") {
    return "PRO";
  }

  return "FREE";
}

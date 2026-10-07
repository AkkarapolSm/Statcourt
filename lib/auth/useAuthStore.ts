"use client";

import { create } from "zustand";
import type { Role, OfficialApprovalStatus, SubscriptionTier } from "../types";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role | "PUBLIC";
  approvalStatus: OfficialApprovalStatus;
  licenseNumber?: string;
  organization?: string;
  avatarUrl?: string;
  athleteId?: string;
  tcasReferenceCode?: string;
  tier: SubscriptionTier;
}

const guest: AuthUser = {
  id: "guest-visitor",
  name: "Public Spectator",
  email: "",
  role: "PUBLIC",
  approvalStatus: "PENDING",
  tier: "FREE",
};

const CACHE_KEY = "statcourt_cached_user";

function getCachedUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.role === "string") {
        return parsed as AuthUser;
      }
    }
  } catch {}
  return null;
}

function persistCachedUser(user: AuthUser | null) {
  if (typeof window === "undefined") return;
  try {
    if (user && user.role !== "PUBLIC") {
      localStorage.setItem(CACHE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CACHE_KEY);
    }
  } catch {}
}

const initialCached = getCachedUser();

interface AuthState {
  currentUser: AuthUser;
  loading: boolean;
  refreshSession: () => Promise<void>;
  switchRole: (role: Role | "PUBLIC", tier?: SubscriptionTier) => Promise<boolean>;
  loginAs: (role: Role | "PUBLIC") => void;
  setSubscriptionTier: (tier: SubscriptionTier) => void;
  toggleSubscriptionTier: () => void;
  verifyOfficialTablePin: (pin: string, licenseId: string) => boolean;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  currentUser: initialCached || guest,
  loading: !initialCached,
  refreshSession: async () => {
    try {
      const response = await fetch("/api/auth/me", { cache: "no-store" });
      if (!response.ok) {
        persistCachedUser(null);
        set({ currentUser: guest, loading: false });
        return;
      }
      const data = await response.json();
      if (data.authenticated && data.user) {
        const authedUser = data.user as AuthUser;
        persistCachedUser(authedUser);
        set({ currentUser: authedUser, loading: false });
      } else {
        persistCachedUser(null);
        set({ currentUser: guest, loading: false });
      }
    } catch {
      set({ loading: false });
    }
  },
  switchRole: async (role: Role | "PUBLIC", tier?: SubscriptionTier) => {
    try {
      const currentTier = tier || useAuthStore.getState().currentUser.tier || "FREE";
      const res = await fetch("/api/auth/dev-switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, tier: currentTier }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          const authedUser = data.user as AuthUser;
          persistCachedUser(authedUser);
          set({ currentUser: authedUser, loading: false });
          return true;
        }
      }
      return false;
    } catch (err) {
      console.error("Failed to switch role:", err);
      return false;
    }
  },
  loginAs: (role) => {
    void useAuthStore.getState().switchRole(role);
  },
  setSubscriptionTier: (tier: SubscriptionTier) => {
    const currentRole = useAuthStore.getState().currentUser.role;
    void useAuthStore.getState().switchRole(currentRole, tier);
  },
  toggleSubscriptionTier: () => {
    const current = useAuthStore.getState().currentUser;
    const nextTier: SubscriptionTier = current.tier === "PRO" ? "FREE" : "PRO";
    void useAuthStore.getState().switchRole(current.role, nextTier);
  },
  verifyOfficialTablePin: () => false,
  logout: () => {
    persistCachedUser(null);
    void fetch("/api/auth/logout", { method: "POST" }).finally(() =>
      set({ currentUser: guest })
    );
  },
}));

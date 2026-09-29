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
  tier: SubscriptionTier;
}

const guest: AuthUser = {
  id: "guest-visitor", name: "Public Spectator", email: "",
  role: "PUBLIC", approvalStatus: "PENDING", tier: "FREE",
};

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
  currentUser: guest,
  loading: true,
  refreshSession: async () => {
    try {
      const response = await fetch("/api/auth/me", { cache: "no-store" });
      if (!response.ok) {
        set({ currentUser: guest, loading: false });
        return;
      }
      const data = await response.json();
      set({ currentUser: data.user as AuthUser, loading: false });
    } catch {
      set({ currentUser: guest, loading: false });
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
          set({ currentUser: data.user as AuthUser, loading: false });
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
    void fetch("/api/auth/logout", { method: "POST" }).finally(() => set({ currentUser: guest }));
  },
}));

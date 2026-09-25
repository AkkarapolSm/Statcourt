import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Role, OfficialApprovalStatus, SubscriptionTier } from "../types";
import { authenticateOfficialCredentials } from "./officialToken";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role | "PUBLIC";
  approvalStatus: OfficialApprovalStatus;
  licenseNumber?: string;
  organization?: string;
  avatarUrl?: string;
  tier: SubscriptionTier;
}

interface AuthState {
  currentUser: AuthUser;
  loginAs: (role: Role | "PUBLIC") => void;
  setSubscriptionTier: (tier: SubscriptionTier) => void;
  toggleSubscriptionTier: () => void;
  verifyOfficialTablePin: (pin: string, licenseId: string) => boolean;
  logout: () => void;
}

// By default, a visitor on the public internet is "PUBLIC" with "FREE" tier
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
  currentUser: {
    id: "guest-visitor",
    name: "Public Spectator",
    email: "visitor@statcourt.th",
    role: "PUBLIC",
    approvalStatus: "PENDING",
    tier: "FREE",
  },

  loginAs: (role: Role | "PUBLIC") => {
    set((state) => {
      const currentTier = state.currentUser.tier;
      if (role === "OFFICIAL") {
        return {
          currentUser: {
            id: "off-somchai",
            name: "Somchai Srivichai",
            email: "official.somchai@bsat.or.th",
            role: "OFFICIAL",
            approvalStatus: "APPROVED",
            licenseNumber: "BSAT-TABLE-2026-088",
            organization: "Basketball Sport Association of Thailand",
            avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
            tier: "PRO",
          },
        };
      } else if (role === "COACH") {
        return {
          currentUser: {
            id: "coach-preecha",
            name: "Coach Preecha Wattanapan",
            email: "coach.preecha@debsirin.ac.th",
            role: "COACH",
            approvalStatus: "APPROVED",
            organization: "Debsirin School Basketball Team",
            avatarUrl: "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=400&q=80",
            tier: currentTier,
          },
        };
      } else if (role === "ATHLETE") {
        return {
          currentUser: {
            id: "ath-1",
            name: "Thanakorn Siriphan",
            email: "thanakorn.s@bcc.ac.th",
            role: "ATHLETE",
            approvalStatus: "APPROVED",
            organization: "Bangkok Christian College",
            avatarUrl: "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=400&q=80",
            tier: currentTier,
          },
        };
      } else if (role === "ADMIN") {
        return {
          currentUser: {
            id: "admin-bsat",
            name: "Tournament Director",
            email: "admin@statcourt.th",
            role: "ADMIN",
            approvalStatus: "APPROVED",
            organization: "StatCourtTH Federation Admin",
            avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80",
            tier: "PRO",
          },
        };
      } else if (role === "FAN") {
        return {
          currentUser: {
            id: "fan-somkiat",
            name: "นายสมเกียรติ รักบาส (Somkiat)",
            email: "somkiat.fan@gmail.com",
            role: "FAN",
            approvalStatus: "APPROVED",
            organization: "BCC Basketball Fan Club / Parent",
            avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80",
            tier: currentTier,
          },
        };
      } else {
        return {
          currentUser: {
            id: "guest-visitor",
            name: "Public Spectator",
            email: "visitor@statcourt.th",
            role: "PUBLIC",
            approvalStatus: "PENDING",
            tier: currentTier,
          },
        };
      }
    });
  },

  setSubscriptionTier: (tier: SubscriptionTier) => {
    set((state) => ({
      currentUser: {
        ...state.currentUser,
        tier,
      },
    }));
  },

  toggleSubscriptionTier: () => {
    set((state) => ({
      currentUser: {
        ...state.currentUser,
        tier: state.currentUser.tier === "PRO" ? "FREE" : "PRO",
      },
    }));
  },

  verifyOfficialTablePin: (pin: string, licenseId: string) => {
    const official = authenticateOfficialCredentials(licenseId, pin);
    if (official) {
      set({
        currentUser: {
          id: official.officialId,
          name: official.name,
          email: `${official.officialId}@bsat.or.th`,
          role: official.role === "ADMIN" ? "ADMIN" : "OFFICIAL",
          approvalStatus: official.isActive ? "APPROVED" : "PENDING",
          licenseNumber: official.licenseNumber,
          organization: official.organization,
          tier: "PRO",
        },
      });
      return true;
    }
    return false;
  },

  logout: () => {
    set({
      currentUser: {
        id: "guest-visitor",
        name: "Public Spectator",
        email: "visitor@statcourt.th",
        role: "PUBLIC",
        approvalStatus: "PENDING",
        tier: "FREE",
      },
    });
  },
}),
    {
      name: "statcourt_auth_store",
    }
  )
);


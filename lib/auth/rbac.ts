import type { Role, SubscriptionTier } from "../types";
import type { AuthUser } from "./useAuthStore";

export type ExtendedRole = Role | "PUBLIC";

export interface RoleBadgeMeta {
  role: ExtendedRole;
  labelTh: string;
  labelEn: string;
  shortLabel: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  icon: string;
  descriptionTh: string;
}

export const ROLE_METADATA: Record<ExtendedRole, RoleBadgeMeta> = {
  PUBLIC: {
    role: "PUBLIC",
    labelTh: "บุคคลทั่วไป / ผู้ชม",
    labelEn: "Public Spectator",
    shortLabel: "GUEST",
    badgeBg: "bg-slate-100",
    badgeText: "text-slate-700",
    badgeBorder: "border-slate-300",
    icon: "public",
    descriptionTh: "เข้าชมสถิติสด ตารางแข่ง ข่าวสาร และอันดับผู้เล่นทั่วไป",
  },
  ATHLETE: {
    role: "ATHLETE",
    labelTh: "นักกีฬาเยาวชน (TCAS)",
    labelEn: "Student Athlete",
    shortLabel: "ATHLETE",
    badgeBg: "bg-blue-50",
    badgeText: "text-blue-700",
    badgeBorder: "border-blue-200",
    icon: "sports_basketball",
    descriptionTh: "จัดการสรีระ Ape Index แฟ้มสะสมงาน TCAS Portfolio และบัตรนักกีฬา",
  },
  COACH: {
    role: "COACH",
    labelTh: "ผู้ฝึกสอน / แมวมอง",
    labelEn: "Coach & Scout",
    shortLabel: "COACH",
    badgeBg: "bg-emerald-50",
    badgeText: "text-emerald-700",
    badgeBorder: "border-emerald-200",
    icon: "assignment_ind",
    descriptionTh: "ค้นหาดาวรุ่งผ่าน Scout Engine จัดการแผนผู้เล่นและวิเคราะห์ Game Film",
  },
  OFFICIAL: {
    role: "OFFICIAL",
    labelTh: "เจ้าหน้าที่โต๊ะเทคนิค BSAT",
    labelEn: "Table Official (FIBA)",
    shortLabel: "OFFICIAL",
    badgeBg: "bg-red-50",
    badgeText: "text-red-700",
    badgeBorder: "border-red-200",
    icon: "verified_user",
    descriptionTh: "ควบคุมนาฬิกา บันทึกคะแนน/ฟาวล์ และเซ็นชื่อกำกับ Audit Trail การแข่งขัน",
  },
  FAN: {
    role: "FAN",
    labelTh: "สมาชิกทั่วไป / แฟนคลับ",
    labelEn: "General Member / Fan",
    shortLabel: "MEMBER",
    badgeBg: "bg-amber-50",
    badgeText: "text-amber-800",
    badgeBorder: "border-amber-200",
    icon: "favorite",
    descriptionTh: "ติดตามทีมโปรด นักกีฬาในดวงใจ รับการแจ้งเตือนผลสด และสิทธิพิเศษเข้าชม",
  },
  ADMIN: {
    role: "ADMIN",
    labelTh: "ผู้ดูแลระบบสหพันธ์",
    labelEn: "Federation Admin",
    shortLabel: "ADMIN",
    badgeBg: "bg-purple-50",
    badgeText: "text-purple-700",
    badgeBorder: "border-purple-200",
    icon: "admin_panel_settings",
    descriptionTh: "สร้างและบริหารทัวร์นาเมนต์ อนุมัติสิทธิ์ และดูแลความเรียบร้อยทั้งระบบ",
  },
};

/**
 * Returns visual badge metadata for a given role
 */
export function getRoleBadgeInfo(role: ExtendedRole): RoleBadgeMeta {
  return ROLE_METADATA[role] || ROLE_METADATA.PUBLIC;
}

/**
 * Check if the user has one of the allowed roles
 */
export function hasRole(user: AuthUser | null | undefined, allowedRoles: ExtendedRole[]): boolean {
  if (!user) return allowedRoles.includes("PUBLIC");
  return allowedRoles.includes(user.role);
}

/**
 * Check if the user has access to the full Scout Engine Hub
 * Only COACH, ADMIN, or PRO tier users can access deep scouting filters & contacts
 */
export function canAccessScoutHub(user: AuthUser | null | undefined): boolean {
  if (!user) return false;
  if (user.role === "ADMIN" || user.role === "COACH") return true;
  return user.tier === "PRO";
}

/**
 * Check if the user can edit an athlete's physical biometrics (Ape Index, Wingspan)
 * Allowed if:
 * 1. The user is an ATHLETE and is the owner of the profile (user.id === athleteId or athlete's userId)
 * 2. The user is an ADMIN
 */
export function canEditAthleteProfile(
  user: AuthUser | null | undefined,
  athleteId: string,
  athleteUserId?: string
): boolean {
  if (!user) return false;
  if (user.role === "ADMIN") return true;
  if (user.role === "ATHLETE") {
    return user.id === athleteId || (athleteUserId ? user.id === athleteUserId : false);
  }
  return false;
}

/**
 * Check if user can view private athlete analytics (Who Viewed My Profile, Academic GPAX Details)
 */
export function canViewAthletePrivateData(
  user: AuthUser | null | undefined,
  athleteId: string
): boolean {
  if (!user) return false;
  if (user.role === "ADMIN") return true;
  if (user.role === "ATHLETE" && user.id === athleteId) return true;
  if (user.role === "COACH") return true; // Coaches can view academic eligibility to recruit
  return false;
}

/**
 * Check if user can manage a team's lineup and roster
 * Allowed for COACH and ADMIN
 */
export function canManageTeamLineup(
  user: AuthUser | null | undefined,
  teamId?: string
): boolean {
  if (!user) return false;
  if (user.role === "ADMIN") return true;
  if (user.role === "COACH") return true;
  return false;
}

/**
 * Check if user can operate the Official Table Console
 * Restricted strictly to OFFICIAL and ADMIN
 */
export function canAccessOfficialConsole(user: AuthUser | null | undefined): boolean {
  if (!user) return false;
  return (
    (user.role === "OFFICIAL" || user.role === "ADMIN") &&
    user.approvalStatus === "APPROVED"
  );
}

/**
 * Check if user can create or manage official tournaments
 */
export function canCreateTournament(user: AuthUser | null | undefined): boolean {
  if (!user) return false;
  return user.role === "ADMIN" || user.role === "COACH";
}

/**
 * Returns default landing route based on user role
 */
export function getRoleDefaultRoute(role: ExtendedRole): string {
  switch (role) {
    case "ATHLETE":
      return "/athlete/ath-1";
    case "COACH":
      return "/scout";
    case "OFFICIAL":
      return "/official/console/match-bcc-ds-01";
    case "ADMIN":
      return "/solutions";
    case "FAN":
      return "/team";
    default:
      return "/";
  }
}

/**
 * Check if the user has access to a specific navigation item/href in the Navbar.
 * Used to conditionally hide or render links in navigation menus based on RBAC & subscription tier.
 */
export function canAccessNavItem(user: AuthUser | null | undefined, href: string): boolean {
  if (user?.role === "ADMIN") return true;
  if (href.startsWith("/official/console")) return canAccessOfficialConsole(user);
  if (href === "/scout" || href.startsWith("/scout/")) return canAccessScoutHub(user);
  if (href === "/solutions" || href.startsWith("/solutions/")) return canCreateTournament(user);
  return true;
}


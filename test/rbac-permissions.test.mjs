import test from "node:test";
import assert from "node:assert/strict";
import {
  ROLE_METADATA,
  getRoleBadgeInfo,
  hasRole,
  canAccessScoutHub,
  canEditAthleteProfile,
  isAthleteProfileOwner,
  canViewAthletePrivateData,
  canManageTeamLineup,
  canAccessOfficialConsole,
  canCreateTournament,
  getRoleDefaultRoute,
  canAccessNavItem,
} from "../lib/auth/rbac.ts";

test("ROLE_METADATA defines accurate visual tokens and labels for all 6 roles", () => {
  const roles = ["PUBLIC", "FAN", "ATHLETE", "COACH", "OFFICIAL", "ADMIN"];

  for (const r of roles) {
    const meta = getRoleBadgeInfo(r);
    assert.ok(meta, `Metadata for role ${r} must be defined`);
    assert.equal(meta.role, r);
    assert.ok(meta.labelTh.length > 0, "labelTh must be defined");
    assert.ok(meta.labelEn.length > 0, "labelEn must be defined");
    assert.ok(meta.badgeBg.startsWith("bg-"), "badgeBg class must exist");
    assert.ok(meta.badgeText.startsWith("text-"), "badgeText class must exist");
    assert.ok(meta.icon.length > 0, "icon must be defined");
  }

  // Fallback for unknown role
  const fallback = getRoleBadgeInfo("UNKNOWN");
  assert.equal(fallback.role, "PUBLIC");
});

test("hasRole correctly checks role permissions", () => {
  const athleteUser = { id: "ath-1", name: "Thanakorn", role: "ATHLETE", tier: "FREE", approvalStatus: "APPROVED" };
  const coachUser = { id: "coach-1", name: "Coach Preecha", role: "COACH", tier: "PRO", approvalStatus: "APPROVED" };

  assert.equal(hasRole(athleteUser, ["ATHLETE", "COACH"]), true);
  assert.equal(hasRole(athleteUser, ["COACH", "ADMIN"]), false);
  assert.equal(hasRole(coachUser, ["COACH"]), true);
  assert.equal(hasRole(null, ["PUBLIC"]), true);
  assert.equal(hasRole(null, ["COACH"]), false);
});

test("canAccessScoutHub enforces role-based and tier-based scouting access", () => {
  const coachFree = { id: "c-1", role: "COACH", tier: "FREE", approvalStatus: "APPROVED" };
  const adminFree = { id: "a-1", role: "ADMIN", tier: "FREE", approvalStatus: "APPROVED" };
  const athletePro = { id: "ath-1", role: "ATHLETE", tier: "PRO", approvalStatus: "APPROVED" };
  const athleteFree = { id: "ath-2", role: "ATHLETE", tier: "FREE", approvalStatus: "APPROVED" };
  const publicFree = { id: "guest", role: "PUBLIC", tier: "FREE", approvalStatus: "PENDING" };

  // Coaches and Admins always have access
  assert.equal(canAccessScoutHub(coachFree), true, "Coaches have scout hub access");
  assert.equal(canAccessScoutHub(adminFree), true, "Admins have scout hub access");

  // PRO tier users have access
  assert.equal(canAccessScoutHub(athletePro), true, "PRO tier users have scout hub access");

  // Free public and free athletes cannot access deep scouting hub
  assert.equal(canAccessScoutHub(athleteFree), false, "Free athletes cannot access deep scout hub");
  assert.equal(canAccessScoutHub(publicFree), false, "Public guests cannot access deep scout hub");
  assert.equal(canAccessScoutHub(null), false, "Unauthenticated cannot access scout hub");
});

test("canEditAthleteProfile allows only profile owner and federation admins", () => {
  const ownerAthlete = { id: "ath-1", role: "ATHLETE", tier: "FREE", approvalStatus: "APPROVED" };
  const otherAthlete = { id: "ath-2", role: "ATHLETE", tier: "FREE", approvalStatus: "APPROVED" };
  const adminUser = { id: "admin-1", role: "ADMIN", tier: "PRO", approvalStatus: "APPROVED" };
  const coachUser = { id: "coach-1", role: "COACH", tier: "PRO", approvalStatus: "APPROVED" };

  // Owner can edit their own profile
  assert.equal(canEditAthleteProfile(ownerAthlete, "ath-1"), true, "Athlete owner can edit");

  // Other athlete cannot edit someone else's profile
  assert.equal(canEditAthleteProfile(otherAthlete, "ath-1"), false, "Other athlete cannot edit");

  // Admin can edit any profile
  assert.equal(canEditAthleteProfile(adminUser, "ath-1"), true, "Admin can edit any athlete");

  // Coach cannot edit athlete physical stats directly
  assert.equal(canEditAthleteProfile(coachUser, "ath-1"), false, "Coach cannot edit athlete stats directly");
});

test("isAthleteProfileOwner restricts TCAS & Academic eligibility access to profile owner and admin", () => {
  const ownerAthlete = { id: "ath-1", role: "ATHLETE", tier: "FREE", approvalStatus: "APPROVED" };
  const otherAthlete = { id: "ath-2", role: "ATHLETE", tier: "FREE", approvalStatus: "APPROVED" };
  const coachUser = { id: "coach-1", role: "COACH", tier: "PRO", approvalStatus: "APPROVED" };
  const fanUser = { id: "fan-1", role: "FAN", tier: "FREE", approvalStatus: "APPROVED" };
  const publicUser = { id: "guest", role: "PUBLIC", tier: "FREE", approvalStatus: "PENDING" };
  const adminUser = { id: "admin-1", role: "ADMIN", tier: "PRO", approvalStatus: "APPROVED" };

  // Profile owner can access their own TCAS & Academic tabs
  assert.equal(isAthleteProfileOwner(ownerAthlete, "ath-1"), true, "Owner athlete has full access to their own TCAS & Academic tabs");

  // Other athlete cannot access someone else's TCAS & Academic tabs
  assert.equal(isAthleteProfileOwner(otherAthlete, "ath-1"), false, "Other athlete is blocked from viewing another athlete's TCAS & Academic tabs");

  // Coach cannot access athlete's private TCAS & Academic tabs directly on athlete profile
  assert.equal(isAthleteProfileOwner(coachUser, "ath-1"), false, "Coach is blocked from viewing athlete private TCAS & Academic tabs");

  // Fan and Public cannot access
  assert.equal(isAthleteProfileOwner(fanUser, "ath-1"), false, "Fan is blocked from viewing TCAS & Academic tabs");
  assert.equal(isAthleteProfileOwner(publicUser, "ath-1"), false, "Public guest is blocked from viewing TCAS & Academic tabs");

  // Admin can access
  assert.equal(isAthleteProfileOwner(adminUser, "ath-1"), true, "Admin can view any athlete profile");
});

test("canViewAthletePrivateData protects recruit analytics while allowing coach evaluation", () => {
  const ownerAthlete = { id: "ath-1", role: "ATHLETE", tier: "FREE", approvalStatus: "APPROVED" };
  const otherAthlete = { id: "ath-2", role: "ATHLETE", tier: "FREE", approvalStatus: "APPROVED" };
  const coachUser = { id: "coach-1", role: "COACH", tier: "PRO", approvalStatus: "APPROVED" };
  const publicUser = { id: "guest", role: "PUBLIC", tier: "FREE", approvalStatus: "PENDING" };

  // Owner can view private analytics
  assert.equal(canViewAthletePrivateData(ownerAthlete, "ath-1"), true);

  // Coach can view academic eligibility to recruit
  assert.equal(canViewAthletePrivateData(coachUser, "ath-1"), true);

  // Other athlete cannot view private analytics
  assert.equal(canViewAthletePrivateData(otherAthlete, "ath-1"), false);

  // Public visitor cannot view private analytics
  assert.equal(canViewAthletePrivateData(publicUser, "ath-1"), false);
});

test("canManageTeamLineup allows only coaches to edit attendance and rosters", () => {
  const coachUser = { id: "coach-1", role: "COACH", tier: "PRO", approvalStatus: "APPROVED" };
  const adminUser = { id: "admin-1", role: "ADMIN", tier: "PRO", approvalStatus: "APPROVED" };
  const athleteUser = { id: "ath-1", role: "ATHLETE", tier: "FREE", approvalStatus: "APPROVED" };
  const officialUser = { id: "off-1", role: "OFFICIAL", tier: "PRO", approvalStatus: "APPROVED" };

  assert.equal(canManageTeamLineup(coachUser), true, "Coach can manage lineup");
  assert.equal(canManageTeamLineup(adminUser), false, "Admin cannot manage lineup (Coach only)");
  assert.equal(canManageTeamLineup(athleteUser), false, "Athlete cannot manage lineup");
  assert.equal(canManageTeamLineup(officialUser), false, "Table official cannot manage lineup");
});

test("canAccessOfficialConsole protects scorekeeper table from non-official roles", () => {
  const approvedOfficial = { id: "off-1", role: "OFFICIAL", tier: "PRO", approvalStatus: "APPROVED" };
  const pendingOfficial = { id: "off-2", role: "OFFICIAL", tier: "FREE", approvalStatus: "PENDING" };
  const adminUser = { id: "admin-1", role: "ADMIN", tier: "PRO", approvalStatus: "APPROVED" };
  const coachUser = { id: "coach-1", role: "COACH", tier: "PRO", approvalStatus: "APPROVED" };
  const athleteUser = { id: "ath-1", role: "ATHLETE", tier: "FREE", approvalStatus: "APPROVED" };

  assert.equal(canAccessOfficialConsole(approvedOfficial), true, "Approved official can access console");
  assert.equal(canAccessOfficialConsole(pendingOfficial), false, "Pending official cannot access console");
  assert.equal(canAccessOfficialConsole(adminUser), true, "Admin can access console");
  assert.equal(canAccessOfficialConsole(coachUser), false, "Coach cannot access table console (no conflict)");
  assert.equal(canAccessOfficialConsole(athleteUser), false, "Athlete cannot access table console");
});

test("canCreateTournament and getRoleDefaultRoute map to appropriate landing pages", () => {
  const adminUser = { id: "admin-1", role: "ADMIN", tier: "PRO", approvalStatus: "APPROVED" };
  const coachUser = { id: "coach-1", role: "COACH", tier: "PRO", approvalStatus: "APPROVED" };
  const publicUser = { id: "guest", role: "PUBLIC", tier: "FREE", approvalStatus: "PENDING" };

  assert.equal(canCreateTournament(adminUser), true);
  assert.equal(canCreateTournament(coachUser), true);
  assert.equal(canCreateTournament(publicUser), false);

  assert.equal(getRoleDefaultRoute("ATHLETE"), "/athlete/ath-1");
  assert.equal(getRoleDefaultRoute("COACH"), "/team");
  assert.equal(getRoleDefaultRoute("OFFICIAL"), "/official/console/match-bcc-ds-01");
  assert.equal(getRoleDefaultRoute("ADMIN"), "/solutions");
  assert.equal(getRoleDefaultRoute("FAN"), "/tournaments");
  assert.equal(getRoleDefaultRoute("PUBLIC"), "/");
});

test("canAccessNavItem correctly filters navigation links based on user role and tier", () => {
  const guestUser = null;
  const publicUser = { id: "guest-1", role: "PUBLIC", tier: "FREE", approvalStatus: "PENDING" };
  const fanFree = { id: "fan-1", role: "FAN", tier: "FREE", approvalStatus: "APPROVED" };
  const athleteFree = { id: "ath-1", role: "ATHLETE", tier: "FREE", approvalStatus: "APPROVED" };
  const athletePro = { id: "ath-2", role: "ATHLETE", tier: "PRO", approvalStatus: "APPROVED" };
  const coachFree = { id: "c-1", role: "COACH", tier: "FREE", approvalStatus: "APPROVED" };
  const officialApproved = { id: "off-1", role: "OFFICIAL", tier: "FREE", approvalStatus: "APPROVED" };
  const officialPending = { id: "off-2", role: "OFFICIAL", tier: "FREE", approvalStatus: "PENDING" };
  const adminUser = { id: "adm-1", role: "ADMIN", tier: "FREE", approvalStatus: "APPROVED" };

  const publicRoutes = [
    "/",
    "/live",
    "/news",
    "/tournaments",
    "/leaderboard",
    "/matches/match-bcc-ds-01/film",
    "/athlete/ath-1",
    "/opportunities",
    "/academy",
    "/marketplace",
  ];

  // All public routes must be accessible to any user (even guest)
  for (const route of publicRoutes) {
    assert.equal(canAccessNavItem(guestUser, route), true, `Guest should access ${route}`);
    assert.equal(canAccessNavItem(publicUser, route), true, `Public should access ${route}`);
    assert.equal(canAccessNavItem(fanFree, route), true, `Fan should access ${route}`);
    assert.equal(canAccessNavItem(athleteFree, route), true, `Athlete should access ${route}`);
    assert.equal(canAccessNavItem(coachFree, route), true, `Coach should access ${route}`);
    assert.equal(canAccessNavItem(officialApproved, route), true, `Official should access ${route}`);
    assert.equal(canAccessNavItem(adminUser, route), true, `Admin should access ${route}`);
  }

  // Team Hub: ONLY Coach (Others including Admin cannot view or access it)
  assert.equal(canAccessNavItem(guestUser, "/team"), false);
  assert.equal(canAccessNavItem(publicUser, "/team"), false);
  assert.equal(canAccessNavItem(fanFree, "/team"), false);
  assert.equal(canAccessNavItem(athleteFree, "/team"), false);
  assert.equal(canAccessNavItem(athletePro, "/team"), false);
  assert.equal(canAccessNavItem(officialApproved, "/team"), false);
  assert.equal(canAccessNavItem(coachFree, "/team"), true);
  assert.equal(canAccessNavItem(adminUser, "/team"), false, "Admin cannot access Team Hub (Coach only)");

  // Official Table Console: ONLY approved official and admin
  assert.equal(canAccessNavItem(guestUser, "/official/console/match-bcc-ds-01"), false);
  assert.equal(canAccessNavItem(publicUser, "/official/console/match-bcc-ds-01"), false);
  assert.equal(canAccessNavItem(fanFree, "/official/console/match-bcc-ds-01"), false);
  assert.equal(canAccessNavItem(athleteFree, "/official/console/match-bcc-ds-01"), false);
  assert.equal(canAccessNavItem(athletePro, "/official/console/match-bcc-ds-01"), false);
  assert.equal(canAccessNavItem(coachFree, "/official/console/match-bcc-ds-01"), false);
  assert.equal(canAccessNavItem(officialPending, "/official/console/match-bcc-ds-01"), false);
  assert.equal(canAccessNavItem(officialApproved, "/official/console/match-bcc-ds-01"), true);
  assert.equal(canAccessNavItem(adminUser, "/official/console/match-bcc-ds-01"), true);

  // Scout Hub: Coach, Admin, or PRO tier
  assert.equal(canAccessNavItem(guestUser, "/scout"), false);
  assert.equal(canAccessNavItem(publicUser, "/scout"), false);
  assert.equal(canAccessNavItem(fanFree, "/scout"), false);
  assert.equal(canAccessNavItem(athleteFree, "/scout"), false);
  assert.equal(canAccessNavItem(athletePro, "/scout"), true);
  assert.equal(canAccessNavItem(coachFree, "/scout"), true);
  assert.equal(canAccessNavItem(officialApproved, "/scout"), false);
  assert.equal(canAccessNavItem(adminUser, "/scout"), true);

  // Solutions / B2B SaaS: Coach and Admin
  assert.equal(canAccessNavItem(guestUser, "/solutions"), false);
  assert.equal(canAccessNavItem(publicUser, "/solutions"), false);
  assert.equal(canAccessNavItem(fanFree, "/solutions"), false);
  assert.equal(canAccessNavItem(athleteFree, "/solutions"), false);
  assert.equal(canAccessNavItem(officialApproved, "/solutions"), false);
  assert.equal(canAccessNavItem(coachFree, "/solutions"), true);
  assert.equal(canAccessNavItem(adminUser, "/solutions"), true);
});

test("Public non-members are strictly restricted from member-only hubs", () => {
  const publicUser = { id: "guest", role: "PUBLIC", tier: "FREE", approvalStatus: "PENDING" };

  assert.equal(canAccessScoutHub(publicUser), false, "Public cannot access Scout Hub");
  assert.equal(canAccessOfficialConsole(publicUser), false, "Public cannot access Official Table Console");
  assert.equal(canManageTeamLineup(publicUser), false, "Public cannot access Team Hub / Lineup Operations");
  assert.equal(canCreateTournament(publicUser), false, "Public cannot create tournaments");
});


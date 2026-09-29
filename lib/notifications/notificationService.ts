import { prisma } from "@/lib/db/prisma";

export type NotificationType =
  | "SCHEDULE_CHANGE"
  | "OFFICIAL_ASSIGNMENT"
  | "MATCH_CERTIFIED"
  | "REGISTRATION_STATUS"
  | "SYSTEM";

export interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Creates a single in-app notification for a given user.
 */
export async function createNotification(params: CreateNotificationParams) {
  try {
    return await prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        link: params.link,
        metadataJson: params.metadata ? JSON.stringify(params.metadata) : null,
      },
    });
  } catch (error) {
    console.error("[NotificationService] createNotification error:", error);
    return null;
  }
}

/**
 * Creates notifications for multiple users in bulk.
 */
export async function notifyUsers(
  userIds: string[],
  params: Omit<CreateNotificationParams, "userId">
) {
  const uniqueUserIds = Array.from(new Set(userIds.filter(Boolean)));
  if (uniqueUserIds.length === 0) return [];

  try {
    const data = uniqueUserIds.map((userId) => ({
      userId,
      type: params.type,
      title: params.title,
      message: params.message,
      link: params.link,
      metadataJson: params.metadata ? JSON.stringify(params.metadata) : null,
    }));

    await prisma.notification.createMany({
      data,
    });

    return uniqueUserIds;
  } catch (error) {
    console.error("[NotificationService] notifyUsers error:", error);
    return [];
  }
}

/**
 * 1. Schedule Change Notification (แจ้งตารางเปลี่ยน)
 * Notifies head coaches, team managers, rostered athletes, and assigned officials.
 */
export async function notifyMatchScheduleChanged(
  matchId: string,
  details: {
    tournamentName?: string;
    homeTeamName: string;
    awayTeamName: string;
    oldScheduledAt?: Date | string | null;
    newScheduledAt: Date | string;
    venue?: string | null;
    courtName?: string | null;
  }
) {
  try {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        tournament: { select: { name: true } },
        homeTeam: {
          include: {
            coach: { select: { userId: true } },
            memberships: { where: { status: "ACTIVE" }, select: { userId: true } },
            roster: { include: { athlete: { select: { userId: true } } } },
          },
        },
        awayTeam: {
          include: {
            coach: { select: { userId: true } },
            memberships: { where: { status: "ACTIVE" }, select: { userId: true } },
            roster: { include: { athlete: { select: { userId: true } } } },
          },
        },
        officialAssignments: {
          where: { status: "ACTIVE" },
          select: { userId: true },
        },
      },
    });

    if (!match) return;

    const userIds = new Set<string>();

    // Home Team staff & athletes
    if (match.homeTeam.coach?.userId) userIds.add(match.homeTeam.coach.userId);
    match.homeTeam.memberships.forEach((m) => userIds.add(m.userId));
    match.homeTeam.roster.forEach((r) => {
      if (r.athlete.userId) userIds.add(r.athlete.userId);
    });

    // Away Team staff & athletes
    if (match.awayTeam.coach?.userId) userIds.add(match.awayTeam.coach.userId);
    match.awayTeam.memberships.forEach((m) => userIds.add(m.userId));
    match.awayTeam.roster.forEach((r) => {
      if (r.athlete.userId) userIds.add(r.athlete.userId);
    });

    // Assigned Officials
    match.officialAssignments.forEach((o) => userIds.add(o.userId));

    const tournName = details.tournamentName || match.tournament?.name || "การแข่งขันบาสเกตบอล";
    const dateFormatted = new Date(details.newScheduledAt).toLocaleString("th-TH", {
      dateStyle: "medium",
      timeStyle: "short",
    });
    const venueText = details.venue
      ? ` ณ สนาม ${details.venue}${details.courtName ? ` (${details.courtName})` : ""}`
      : "";

    await notifyUsers(Array.from(userIds), {
      type: "SCHEDULE_CHANGE",
      title: "แจ้งเปลี่ยนแปลงกำหนดการแข่งขัน",
      message: `แมตช์ ${details.homeTeamName} พบ ${details.awayTeamName} (${tournName}) ปรับเวลาแข่งขันใหม่เป็น ${dateFormatted}${venueText}`,
      link: `/matches/${matchId}`,
      metadata: {
        matchId,
        homeTeam: details.homeTeamName,
        awayTeam: details.awayTeamName,
        newScheduledAt: details.newScheduledAt,
        venue: details.venue,
      },
    });
  } catch (error) {
    console.error("[NotificationService] notifyMatchScheduleChanged error:", error);
  }
}

/**
 * 2. Official Assignment Notification (การมอบหมายเจ้าหน้าที่)
 * Notifies table official or referee when assigned by administration.
 */
export async function notifyOfficialAssigned(
  matchId: string,
  officialUserId: string,
  details: {
    tournamentName?: string;
    homeTeamName: string;
    awayTeamName: string;
    scheduledAt?: Date | string | null;
    venue?: string | null;
  }
) {
  try {
    const timeFormatted = details.scheduledAt
      ? ` วันที่ ${new Date(details.scheduledAt).toLocaleString("th-TH", {
          dateStyle: "medium",
          timeStyle: "short",
        })}`
      : "";
    const venueText = details.venue ? ` ณ ${details.venue}` : "";

    await createNotification({
      userId: officialUserId,
      type: "OFFICIAL_ASSIGNMENT",
      title: "มอบหมายเจ้าหน้าที่โต๊ะเทคนิค",
      message: `คุณได้รับมอบหมายให้ปฏิบัติหน้าที่โต๊ะเทคนิคในคู่ ${details.homeTeamName} พบ ${details.awayTeamName}${timeFormatted}${venueText}`,
      link: `/official/console/${matchId}`,
      metadata: {
        matchId,
        homeTeam: details.homeTeamName,
        awayTeam: details.awayTeamName,
        scheduledAt: details.scheduledAt,
      },
    });
  } catch (error) {
    console.error("[NotificationService] notifyOfficialAssigned error:", error);
  }
}

/**
 * 3. Match Certified Notification (ผลรับรองแล้ว / Reopened)
 * Notifies coaches, team members, and officials when match result is certified or reopened.
 */
export async function notifyMatchResultCertified(
  matchId: string,
  details: {
    tournamentName?: string;
    homeTeamName: string;
    awayTeamName: string;
    homeScore: number;
    awayScore: number;
    isApproved: boolean; // true = FINAL, false = REOPEN
    reason?: string;
  }
) {
  try {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        tournament: { select: { name: true } },
        homeTeam: {
          include: {
            coach: { select: { userId: true } },
            memberships: { where: { status: "ACTIVE" }, select: { userId: true } },
          },
        },
        awayTeam: {
          include: {
            coach: { select: { userId: true } },
            memberships: { where: { status: "ACTIVE" }, select: { userId: true } },
          },
        },
        officialAssignments: {
          where: { status: "ACTIVE" },
          select: { userId: true },
        },
      },
    });

    if (!match) return;

    const userIds = new Set<string>();
    if (match.homeTeam.coach?.userId) userIds.add(match.homeTeam.coach.userId);
    match.homeTeam.memberships.forEach((m) => userIds.add(m.userId));
    if (match.awayTeam.coach?.userId) userIds.add(match.awayTeam.coach.userId);
    match.awayTeam.memberships.forEach((m) => userIds.add(m.userId));
    match.officialAssignments.forEach((o) => userIds.add(o.userId));

    if (details.isApproved) {
      await notifyUsers(Array.from(userIds), {
        type: "MATCH_CERTIFIED",
        title: "ผลการแข่งขันได้รับการรับรองอย่างเป็นทางการ (FINAL)",
        message: `แมตช์ ${details.homeTeamName} ${details.homeScore} - ${details.awayScore} ${details.awayTeamName} ได้รับการรับรองผลอย่างเป็นทางการแล้ว พร้อมอัปเดตอันดับตารางคะแนน`,
        link: `/matches/${matchId}`,
        metadata: {
          matchId,
          homeTeam: details.homeTeamName,
          awayTeam: details.awayTeamName,
          homeScore: details.homeScore,
          awayScore: details.awayScore,
          status: "FINAL",
        },
      });
    } else {
      await notifyUsers(Array.from(userIds), {
        type: "MATCH_CERTIFIED",
        title: "เปิดคำร้องแก้ไขผลการแข่งขัน (Dispute / Reopen)",
        message: `แมตช์ ${details.homeTeamName} พบ ${details.awayTeamName} ถูกเปิดคำร้องแก้ไขผลการแข่งขัน โดยมีเหตุผล: ${details.reason || "ตรวจสอบข้อผิดพลาดทางเทคนิค"}`,
        link: `/matches/${matchId}`,
        metadata: {
          matchId,
          homeTeam: details.homeTeamName,
          awayTeam: details.awayTeamName,
          status: "DRAFT",
          reason: details.reason,
        },
      });
    }
  } catch (error) {
    console.error("[NotificationService] notifyMatchResultCertified error:", error);
  }
}

/**
 * 4. Team Registration Status Notification (สถานะใบสมัคร)
 * Notifies the team coach / managers about registration approval or rejection.
 */
export async function notifyRegistrationStatus(
  registrationId: string,
  details: {
    tournamentName: string;
    teamName: string;
    teamId: string;
    status: "APPROVED" | "REJECTED";
    reviewerNotes?: string | null;
  }
) {
  try {
    const team = await prisma.team.findUnique({
      where: { id: details.teamId },
      include: {
        coach: { select: { userId: true } },
        memberships: { where: { status: "ACTIVE" }, select: { userId: true } },
      },
    });

    if (!team) return;

    const userIds = new Set<string>();
    if (team.coach?.userId) userIds.add(team.coach.userId);
    team.memberships.forEach((m) => userIds.add(m.userId));

    if (details.status === "APPROVED") {
      await notifyUsers(Array.from(userIds), {
        type: "REGISTRATION_STATUS",
        title: "ใบสมัครเข้าร่วมทัวร์นาเมนต์ได้รับการรับรองแล้ว",
        message: `ทีม ${details.teamName} ได้รับการอนุมัติเข้าร่วมการแข่งขัน ${details.tournamentName} เรียบร้อยแล้ว รายชื่อนักกีฬาได้รับการรับรองเข้าสู่ระบบ`,
        link: `/tournaments`,
        metadata: {
          registrationId,
          teamId: details.teamId,
          status: "APPROVED",
        },
      });
    } else {
      await notifyUsers(Array.from(userIds), {
        type: "REGISTRATION_STATUS",
        title: "ใบสมัครเข้าร่วมทัวร์นาเมนต์ไม่ผ่านการอนุมัติ",
        message: `การสมัครของทีม ${details.teamName} สำหรับ ${details.tournamentName} ไม่ผ่านการอนุมัติ${details.reviewerNotes ? ` ข้อความจากคณะกรรมการ: ${details.reviewerNotes}` : ""}`,
        link: `/tournaments`,
        metadata: {
          registrationId,
          teamId: details.teamId,
          status: "REJECTED",
          reviewerNotes: details.reviewerNotes,
        },
      });
    }
  } catch (error) {
    console.error("[NotificationService] notifyRegistrationStatus error:", error);
  }
}

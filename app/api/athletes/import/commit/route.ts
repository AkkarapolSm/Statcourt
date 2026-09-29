import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/serverAuth";
import { requestOriginAllowed } from "@/lib/auth/session";
import type { ParsedAthleteData } from "@/lib/import/deduplicationEngine";

export const dynamic = "force-dynamic";

interface CommitItem {
  data: ParsedAthleteData;
  action: "CREATE_NEW" | "LINK_EXISTING" | "SKIP";
  existingAthleteId?: string;
}

export async function POST(request: NextRequest) {
  if (!requestOriginAllowed(request)) {
    return NextResponse.json({ success: false, error: "Invalid origin" }, { status: 403 });
  }

  const auth = await requireRole(request, ["ADMIN", "COACH", "OFFICIAL"]);
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json().catch(() => ({}));
    const { items, teamId } = body as { items?: CommitItem[]; teamId?: string };

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "ไม่พบรายการที่ต้องบันทึก (No items provided)" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      let createdCount = 0;
      let linkedCount = 0;
      let skippedCount = 0;
      const createdAthleteIds: string[] = [];

      for (let idx = 0; idx < items.length; idx++) {
        const item = items[idx];
        const { data, action, existingAthleteId } = item;

        if (action === "SKIP") {
          skippedCount++;
          continue;
        }

        if (action === "LINK_EXISTING" && existingAthleteId) {
          // Link to existing athlete
          const existing = await tx.athleteProfile.findUnique({
            where: { id: existingAthleteId },
          });

          if (existing) {
            // If teamId provided, add to team roster if not already enrolled
            if (teamId) {
              const jersey = data.jerseyNumber || existing.jerseyNumber || 0;
              await tx.rosterMember.upsert({
                where: {
                  teamId_athleteId: {
                    teamId,
                    athleteId: existing.id,
                  },
                },
                create: {
                  teamId,
                  athleteId: existing.id,
                  jerseyNumber: jersey,
                },
                update: {
                  jerseyNumber: jersey,
                },
              });
            }
            linkedCount++;
          } else {
            skippedCount++;
          }
        } else if (action === "CREATE_NEW") {
          // Generate a clean unique email if missing or duplicate
          let candidateEmail = data.email?.toLowerCase().trim();
          if (candidateEmail) {
            const emailInUse = await tx.user.findUnique({ where: { email: candidateEmail } });
            if (emailInUse) {
              candidateEmail = `ath_${Date.now()}_${idx}@statcourt.th`;
            }
          } else {
            candidateEmail = `ath_${Date.now()}_${idx}_${Math.floor(Math.random() * 1000)}@statcourt.th`;
          }

          let candidatePhone = data.phoneNumber || null;
          if (candidatePhone) {
            const phoneInUse = await tx.user.findFirst({ where: { phoneNumber: candidatePhone } });
            if (phoneInUse) {
              candidatePhone = null;
            }
          }

          // 1. Create User account
          const newUser = await tx.user.create({
            data: {
              email: candidateEmail,
              phoneNumber: candidatePhone,
              displayName: `${data.firstName} ${data.lastName}`,
              role: "ATHLETE",
              accountStatus: "ACTIVE",
            },
          });

          // 2. Create AthleteProfile
          const newProfile = await tx.athleteProfile.create({
            data: {
              userId: newUser.id,
              firstName: data.firstName,
              lastName: data.lastName,
              birthDate: new Date(data.birthDate),
              primaryPosition: data.primaryPosition,
              secondaryPosition: data.secondaryPosition,
              heightCm: Number(data.heightCm) || 175,
              weightKg: data.weightKg ? Number(data.weightKg) : null,
              jerseyNumber: data.jerseyNumber ? Number(data.jerseyNumber) : null,
              schoolOrClub: data.schoolOrClub,
              province: data.province,
              tcasReferenceCode: data.nationalId || null,
            },
          });

          createdAthleteIds.push(newProfile.id);

          // 3. Add to Team Roster if requested
          if (teamId) {
            await tx.rosterMember.create({
              data: {
                teamId,
                athleteId: newProfile.id,
                jerseyNumber: data.jerseyNumber || 0,
              },
            });
          }

          createdCount++;
        }
      }

      // Record in Audit Trail
      await tx.auditLog.create({
        data: {
          userId: auth.userId!,
          action: "ROSTER_IMPORT_COMMITTED",
          targetEntity: "AthleteProfile",
          targetId: teamId || "GLOBAL",
          metadataJson: JSON.stringify({
            totalItems: items.length,
            createdCount,
            linkedCount,
            skippedCount,
            teamId: teamId || null,
          }),
        },
      });

      return { createdCount, linkedCount, skippedCount, createdAthleteIds };
    });

    return NextResponse.json({
      success: true,
      message: `นำเข้าข้อมูลสำเร็จ: สร้างใหม่ ${result.createdCount} คน, เชื่อมโยงเดิม ${result.linkedCount} คน, ข้าม ${result.skippedCount} คน`,
      createdCount: result.createdCount,
      linkedCount: result.linkedCount,
      skippedCount: result.skippedCount,
      teamId: teamId || null,
    });
  } catch (error) {
    console.error("[Athlete Import Commit API] Error:", error);
    return NextResponse.json(
      { success: false, error: "เกิดข้อผิดพลาดในการบันทึกข้อมูลนักกีฬา" },
      { status: 500 }
    );
  }
}

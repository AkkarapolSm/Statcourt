import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get("q") || "").trim();
    const type = (searchParams.get("type") || "ALL").toUpperCase();

    if (!query) {
      return NextResponse.json({
        success: true,
        query: "",
        type,
        totalCount: 0,
        results: {
          athletes: [],
          teams: [],
          tournaments: [],
          matches: [],
        },
      });
    }

    const searchAthlete = type === "ALL" || type === "ATHLETES";
    const searchTeam = type === "ALL" || type === "TEAMS";
    const searchTournament = type === "ALL" || type === "TOURNAMENTS";
    const searchMatch = type === "ALL" || type === "MATCHES";

    const [athletes, teams, tournaments, matches] = await Promise.all([
      // 1. Athletes (honors privacy consent opt-out)
      searchAthlete
        ? prisma.athleteProfile.findMany({
            where: {
              AND: [
                {
                  OR: [
                    { firstName: { contains: query } },
                    { lastName: { contains: query } },
                    { schoolOrClub: { contains: query } },
                    { province: { contains: query } },
                    { primaryPosition: { contains: query } },
                  ],
                },
                {
                  user: {
                    privacyConsents: {
                      none: {
                        consentType: "SCOUTING_DATABASE",
                        isAccepted: false,
                      },
                    },
                  },
                },
              ],
            },
            include: {
              seasonStats: {
                take: 1,
                orderBy: { season: "desc" },
              },
            },
            take: 15,
          })
        : Promise.resolve([]),

      // 2. Teams
      searchTeam
        ? prisma.team.findMany({
            where: {
              OR: [
                { name: { contains: query } },
                { shortName: { contains: query } },
                { institution: { contains: query } },
              ],
            },
            include: {
              coach: true,
              _count: {
                select: { roster: true },
              },
            },
            take: 15,
          })
        : Promise.resolve([]),

      // 3. Tournaments
      searchTournament
        ? prisma.tournament.findMany({
            where: {
              OR: [
                { name: { contains: query } },
                { organizer: { contains: query } },
                { province: { contains: query } },
                { venue: { contains: query } },
                { location: { contains: query } },
              ],
            },
            take: 15,
          })
        : Promise.resolve([]),

      // 4. Matches
      searchMatch
        ? prisma.match.findMany({
            where: {
              OR: [
                { homeTeam: { name: { contains: query } } },
                { awayTeam: { name: { contains: query } } },
                { tournament: { name: { contains: query } } },
                { venue: { contains: query } },
              ],
            },
            include: {
              homeTeam: true,
              awayTeam: true,
              tournament: true,
            },
            take: 15,
            orderBy: {
              createdAt: "desc",
            },
          })
        : Promise.resolve([]),
    ]);

    const sanitizedAthletes = athletes.map((a) => {
      const { birthDate, tcasReferenceCode, userId, ...clean } = a;
      return clean;
    });

    const totalCount =
      sanitizedAthletes.length + teams.length + tournaments.length + matches.length;

    return NextResponse.json({
      success: true,
      query,
      type,
      totalCount,
      results: {
        athletes: sanitizedAthletes,
        teams,
        tournaments,
        matches,
      },
    });
  } catch (error) {
    console.error("[GLOBAL SEARCH API ERROR]:", error);
    return NextResponse.json(
      { success: false, error: "เกิดข้อผิดพลาดในการค้นหา" },
      { status: 500 }
    );
  }
}

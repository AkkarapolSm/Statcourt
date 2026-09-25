import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const level = searchParams.get("level");
    const funding = searchParams.get("funding");
    const region = searchParams.get("region");
    const search = searchParams.get("search");

    const where: any = {};
    if (level && level !== "ALL") where.level = level;
    if (funding && funding !== "ALL") where.funding = funding;
    if (region && region !== "ALL") where.region = region;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { institution: { contains: search } },
        { province: { contains: search } },
      ];
    }

    const opportunities = await prisma.opportunity.findMany({
      where,
      include: {
        applications: {
          select: {
            id: true,
            applicantName: true,
            applicantPosition: true,
            status: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        deadline: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      count: opportunities.length,
      data: opportunities,
      source: "PRISMA_SQLITE_PERSISTENT",
    });
  } catch (error) {
    console.warn("[API OPPORTUNITIES GET] DB query failed, falling back to mock:", error);
    try {
      const { mockOpportunities } = await import("@/lib/db/phase2-data");
      return NextResponse.json({
        success: true,
        count: mockOpportunities.length,
        data: mockOpportunities,
        source: "FALLBACK_MOCK",
      });
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : "Failed to fetch opportunities",
        },
        { status: 500 }
      );
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      opportunityId,
      athleteId,
      applicantName,
      applicantTcasCode,
      applicantGpax,
      applicantPosition,
      applicantPhone,
      applicantNotes,
    } = body;

    if (!opportunityId || !applicantName || !applicantPhone) {
      return NextResponse.json(
        { success: false, error: "กรุณากรอกชื่อ-นามสกุล เบอร์โทรศัพท์ และระบุโครงการที่สมัคร" },
        { status: 400 }
      );
    }

    // Check if opportunity exists
    const opp = await prisma.opportunity.findUnique({
      where: { id: opportunityId },
    });

    if (!opp) {
      return NextResponse.json(
        { success: false, error: "ไม่พบโครงการทุนหรือโควตานี้ในระบบ" },
        { status: 404 }
      );
    }

    const application = await prisma.opportunityApplication.create({
      data: {
        opportunityId,
        athleteId: athleteId || null,
        applicantName,
        applicantTcasCode: applicantTcasCode || "STC-QUOTA-PENDING",
        applicantGpax: String(applicantGpax || "2.50"),
        applicantPosition: applicantPosition || "Player",
        applicantPhone,
        applicantNotes: applicantNotes || null,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      success: true,
      data: application,
      message: "ส่งใบสมัครโควตานักกีฬาเข้าสู่ระบบเรียบร้อยแล้ว",
      source: "PRISMA_SQLITE_PERSISTENT",
    });
  } catch (error) {
    console.error("[API OPPORTUNITIES POST ERROR]:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการส่งใบสมัคร",
      },
      { status: 500 }
    );
  }
}

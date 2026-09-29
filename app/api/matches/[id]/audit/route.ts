import { NextRequest, NextResponse } from "next/server";
import { generateAuditSignature, verifyAuditSignature } from "@/lib/auth/officialToken";
import { requireOfficial } from "@/lib/auth/serverAuth";
import prisma from "@/lib/db/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const matchId = params.id;
    const auth = await requireOfficial(req, matchId);
    if (!auth.authorized) return auth.response!;

    // Fetch audit logs sorted by timestamp ascending
    const logs = await prisma.matchDisputeAuditLog.findMany({
      where: { matchId },
      orderBy: { timestamp: "asc" },
    });

    // Check cryptographic chain integrity
    let isIntegrityValid = true;
    let previousSignature: string | undefined = undefined;

    for (const log of logs) {
      const isValid = verifyAuditSignature(
        {
          matchId: log.matchId,
          operatorLicense: log.operatorLicense,
          actionType: log.actionType,
          quarter: log.quarter,
          gameClockDisplay: log.gameClockDisplay,
          detailsJson: log.detailsJson,
          timestamp: log.timestamp.toISOString(),
          digitalSignature: log.digitalSignature,
        },
        previousSignature
      );

      if (!isValid) {
        isIntegrityValid = false;
        break;
      }
      previousSignature = log.digitalSignature;
    }

    return NextResponse.json({
      success: true,
      matchId,
      totalRecords: logs.length,
      isIntegrityValid,
      verificationStandard: "FIBA / BSAT SHA-256 Anti-Tamper Chain",
      logs: logs.map((log) => ({
        id: log.id,
        actionType: log.actionType,
        operatorLicense: log.operatorLicense,
        operatorName: log.operatorName,
        quarter: log.quarter,
        gameClockDisplay: log.gameClockDisplay,
        details: (() => {
          try {
            return JSON.parse(log.detailsJson);
          } catch {
            return log.detailsJson;
          }
        })(),
        digitalSignature: log.digitalSignature,
        timestamp: log.timestamp.toISOString(),
      })),
    });
  } catch (error: any) {
    console.error("Failed to fetch match audit logs:", error);
    return NextResponse.json(
      { success: false, error: "ไม่สามารถดึงข้อมูลประวัติการตัดสิน (Audit Log) ได้" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const matchId = params.id;

    // 1. Verify Official Authorization Token
    const auth = await requireOfficial(req, matchId);
    if (!auth.authorized || !auth.official) {
      return auth.response!;
    }

    const operatorLicense = auth.official.licenseNumber;
    const operatorName = auth.official.name;

    const body = await req.json();
    const {
      actionType,
      quarter = 1,
      gameClockDisplay = "10:00",
      details = {},
    } = body;

    if (!actionType) {
      return NextResponse.json(
        { success: false, error: "กรุณาระบุประเภทการกระทำ (actionType)" },
        { status: 400 }
      );
    }

    // Get previous record's signature for chaining
    const lastRecord = await prisma.matchDisputeAuditLog.findFirst({
      where: { matchId },
      orderBy: { timestamp: "desc" },
      select: { digitalSignature: true },
    });

    const timestamp = new Date().toISOString();
    const detailsJson = typeof details === "string" ? details : JSON.stringify(details);

    const digitalSignature = generateAuditSignature({
      matchId,
      operatorLicense,
      actionType,
      quarter: Number(quarter) || 1,
      gameClockDisplay: gameClockDisplay || "10:00",
      detailsJson,
      timestamp,
      previousSignature: lastRecord?.digitalSignature,
    });

    // Audit records must refer to a real assigned match.
    const existingMatch = await prisma.match.findUnique({
      where: { id: matchId },
      select: { id: true },
    });

    if (!existingMatch) return NextResponse.json({ error: "ไม่พบการแข่งขัน" }, { status: 404 });

    const newLog = await prisma.matchDisputeAuditLog.create({
      data: {
        matchId,
        operatorLicense,
        operatorName,
        actionType,
        quarter: Number(quarter) || 1,
        gameClockDisplay,
        detailsJson,
        digitalSignature,
        ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
        timestamp: new Date(timestamp),
      },
    });

    return NextResponse.json({
      success: true,
      auditRecord: {
        id: newLog.id,
        actionType: newLog.actionType,
        operatorLicense: newLog.operatorLicense,
        operatorName: newLog.operatorName,
        quarter: newLog.quarter,
        gameClockDisplay: newLog.gameClockDisplay,
        digitalSignature: newLog.digitalSignature,
        timestamp: newLog.timestamp.toISOString(),
      },
    });
  } catch (error: any) {
    console.error("Failed to create audit log:", error);
    return NextResponse.json(
      { success: false, error: "เกิดข้อผิดพลาดในการบันทึก Audit Log" },
      { status: 500 }
    );
  }
}

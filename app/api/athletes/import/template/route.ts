import { NextResponse } from "next/server";
import { generateSampleCsvTemplate } from "@/lib/import/deduplicationEngine";

export const dynamic = "force-dynamic";

export async function GET() {
  const csvContent = generateSampleCsvTemplate();

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="statcourt_roster_template.csv"',
      "Cache-Control": "public, max-age=3600",
    },
  });
}

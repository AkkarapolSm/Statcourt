import type { Metadata } from "next";
import { mockAthleteProfiles } from "@/lib/db/seed-data";

interface AthleteLayoutProps {
  children: React.ReactNode;
  params: { id: string };
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const athlete = mockAthleteProfiles[params.id];

  if (!athlete) {
    return {
      title: "ไม่พบข้อมูลนักกีฬา (404 Not Found) | STATCOURT.TH",
      description: "ไม่พบข้อมูลโปรไฟล์นักกีฬาตามรหัสที่ระบุในระบบ StatCourt Thailand",
    };
  }

  const athleteName = `${athlete.firstName} ${athlete.lastName}`;
  const title = `${athleteName} #${athlete.jerseyNumber || 0} (${athlete.schoolOrClub}) | STATCOURT.TH`;
  const description = `Verified TCAS portfolio, FIBA advanced stats (EFF/TS%/eFG%), biometrics (${athlete.heightCm}cm / ${athlete.primaryPosition}), and video timestamps for ${athleteName}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
      siteName: "STATCOURT.TH",
      locale: "th_TH",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default function AthleteLayout({ children }: AthleteLayoutProps) {
  return <>{children}</>;
}

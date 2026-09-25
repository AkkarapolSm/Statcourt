import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Match Central & Game Film Archive | STATCOURT.TH",
  description:
    "ค้นหาและรับชมเทปการแข่งขันบาสเกตบอลย้อนหลังระดับ HD (Hudl-grade Game Film), สถิติผู้เล่นเชิงลึก, และคลิปวิดีโอรายจังหวะสำหรับการคัดตัวนักกีฬา",
  openGraph: {
    title: "Match Central & Game Film Archive | STATCOURT.TH",
    description:
      "ค้นหาและรับชมเทปการแข่งขันบาสเกตบอลย้อนหลังระดับ HD (Hudl-grade Game Film), สถิติผู้เล่นเชิงลึก, และคลิปวิดีโอรายจังหวะสำหรับการคัดตัวนักกีฬา",
    siteName: "STATCOURT.TH",
    locale: "th_TH",
  },
};

export default function MatchesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

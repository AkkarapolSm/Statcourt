import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thailand Basketball Leaderboard & Top 100 Rankings | STATCOURT.TH",
  description:
    "Official FIBA 40-minute standardized Efficiency ratings, True Shooting % (TS%), eFG%, and TCAS recruitment pipeline for Thailand high school basketball.",
  openGraph: {
    title: "Thailand Basketball Leaderboard & Top 100 Rankings | STATCOURT.TH",
    description:
      "Official FIBA 40-minute standardized Efficiency ratings, True Shooting % (TS%), eFG%, and TCAS recruitment pipeline for Thailand high school basketball.",
    type: "website",
    siteName: "STATCOURT.TH",
    locale: "th_TH",
  },
  twitter: {
    card: "summary_large_image",
    title: "Thailand Basketball Leaderboard & Top 100 Rankings | STATCOURT.TH",
    description: "Official FIBA 40-minute standardized Efficiency ratings and TCAS recruitment pipeline.",
  },
};

export default function LeaderboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

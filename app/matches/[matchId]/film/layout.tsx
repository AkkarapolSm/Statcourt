import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Game Film & Telestration Video Review | STATCOURT.TH",
  description:
    "Hudl-grade video event timestamping, Click-to-Clip shot playback, and tactical annotations for Thailand basketball tournament games.",
  openGraph: {
    title: "Game Film & Telestration Video Review | STATCOURT.TH",
    description:
      "Hudl-grade video event timestamping, Click-to-Clip shot playback, and tactical annotations for Thailand basketball tournament games.",
    type: "video.other",
    siteName: "STATCOURT.TH",
    locale: "th_TH",
  },
  twitter: {
    card: "summary_large_image",
    title: "Game Film & Telestration Video Review | STATCOURT.TH",
    description: "Click-to-Clip shot playback and tactical telestrations.",
  },
};

export default function GameFilmLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

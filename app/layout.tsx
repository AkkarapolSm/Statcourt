import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "STATCOURT.TH | Thailand Grassroots Basketball Analytics & Scouting",
  description:
    "Official verified tournament box scores, Hudl-grade video event timestamping, TCAS university athletic trading cards, and student-athlete peer gear exchange.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,400;0,500;0,600;0,700;0,800;1,700&family=Bebas+Neue&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-surface text-on-surface font-body-md text-body-md antialiased min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}

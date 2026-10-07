import type { Metadata } from "next";
import "./globals.css";
import "./sports-reference.css";
import SessionBootstrap from "@/components/auth/SessionBootstrap";
import QuickTestFloatingWidget from "@/components/auth/QuickTestFloatingWidget";

export const metadata: Metadata = {
  title: "STATCOURT.TH | ศูนย์กลางสถิติสดและวิดีโอบาสเกตบอลไทย มาตรฐาน FIBA",
  description:
    "แพลตฟอร์มสถิติสดระดับเสี้ยววินาที (FIBA LiveStats), วิดีโอเพลย์ต่อเพลย์, บัตรนักกีฬา Digital Player Pass และคลังข้อมูลแมวมองสำหรับโควตากีฬา TCAS",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,400;0,600;0,700;1,700&family=Noto+Sans+Thai:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,400,0..1,0&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-surface text-on-surface font-body-md text-body-md antialiased min-h-screen flex flex-col">
        <SessionBootstrap />
        {children}
        <QuickTestFloatingWidget />
      </body>
    </html>
  );
}

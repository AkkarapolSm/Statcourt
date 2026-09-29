import type { Metadata } from "next";
import "./globals.css";
import SessionBootstrap from "@/components/auth/SessionBootstrap";

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
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,400;0,500;0,600;0,700;0,800;1,700&family=Bebas+Neue&family=Noto+Sans+Thai:wght@300;400;500;600;700&family=Prompt:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-surface text-on-surface font-body-md text-body-md antialiased min-h-screen flex flex-col">
        <SessionBootstrap />
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: {
    default: "みんなの映画館｜今日観たい映画・ドラマが見つかる",
    template: "%s｜みんなの映画館",
  },
  description: "カップルで見たい映画、おうちデート映画、泣ける恋愛映画など、気分やシーンから映画・ドラマが探せるサイトです。どのVODで見れるかも一緒に紹介。",
  openGraph: {
    siteName: "みんなの映画館",
    locale: "ja_JP",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full">
      <body className="min-h-full flex flex-col bg-[var(--background)]">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

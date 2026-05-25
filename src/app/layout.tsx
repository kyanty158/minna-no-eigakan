import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const BASE_URL = "https://minna-no-eigakan.vercel.app";

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${BASE_URL}/#website`,
  name: "みんなの映画館",
  url: BASE_URL,
  description: "カップルで見たい映画、おうちデート映画、泣ける恋愛映画など、気分やシーンから映画・ドラマが探せるサイトです。",
  inLanguage: "ja-JP",
  publisher: {
    "@type": "Organization",
    name: "みんなの映画館",
    url: BASE_URL,
  },
};

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "みんなの映画館｜今日観たい映画・ドラマが見つかる",
    template: "%s｜みんなの映画館",
  },
  description: "カップルで見たい映画、おうちデート映画、泣ける恋愛映画など、気分やシーンから映画・ドラマが探せるサイトです。どのVODで見れるかも一緒に紹介。",
  openGraph: {
    siteName: "みんなの映画館",
    locale: "ja_JP",
    type: "website",
    url: BASE_URL,
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: BASE_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--background)]">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

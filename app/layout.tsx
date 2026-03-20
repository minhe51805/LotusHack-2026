import type { Metadata } from "next";
import { IBM_Plex_Mono, Open_Sans } from "next/font/google";
import type { ReactNode } from "react";

import { SiteShell } from "@/components/site-shell";
import { getSiteChrome } from "@/lib/source-site";

import "./globals.css";

const bodyFont = Open_Sans({
  variable: "--font-sans",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
});

const monoFont = IBM_Plex_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "Anh Ngữ Du Học ETEST",
    template: "%s | Anh Ngữ Du Học ETEST",
  },
  description:
    "Landing page Anh Ngữ Du Học ETEST được triển khai bằng Next.js và Tailwind CSS với dữ liệu nội dung import cục bộ.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const chrome = await getSiteChrome();

  return (
    <html lang="vi" className={`${bodyFont.variable} ${monoFont.variable} h-full antialiased`}>
      <head>
        {chrome.stylesheets.map((href) => (
          <link key={href} rel="stylesheet" href={href} />
        ))}
        {chrome.remoteStylesheets.map((href) => (
          <link key={href} rel="stylesheet" href={href} />
        ))}
      </head>
      <body className="min-h-full">
        <SiteShell chrome={chrome}>{children}</SiteShell>
      </body>
    </html>
  );
}

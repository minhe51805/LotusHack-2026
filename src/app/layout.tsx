import type { Metadata } from "next";
import {
  Be_Vietnam_Pro,
  IBM_Plex_Mono,
  Playfair_Display,
} from "next/font/google";

import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-be-vietnam-pro",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  weight: ["400", "500"],
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Lotus Counsel",
    template: "%s | Lotus Counsel",
  },
  description:
    "Nền tảng tư vấn du học dùng AI, dữ liệu trường học đã chuẩn hóa, và admin workspace cho đội tuyển sinh.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="vi"
      data-scroll-behavior="smooth"
      className={`${beVietnamPro.variable} ${playfairDisplay.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist_Mono, Noto_Sans_Arabic } from "next/font/google";

import { DirectionProvider } from "@/components/ui/direction";

import "./globals.css";

const fontSans = Noto_Sans_Arabic({
  subsets: ["arabic"],
  variable: "--font-sans",
  display: "swap",
});

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "اپ‌خور",
  description: "مرجع اپ‌ها و ابزارهای کاربردی",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body
        className={`${fontSans.variable} ${fontMono.variable} antialiased`}
      >
        <DirectionProvider direction="rtl">
          {children}
        </DirectionProvider>
      </body>
    </html>
  );
}
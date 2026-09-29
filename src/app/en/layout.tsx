import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: {
    default: "AppKhor",
    template: "%s | AppKhor",
  },
  description:
    "Discover useful apps and open-source tools with direct links to official sources.",
  openGraph: {
    locale: "en_US",
    siteName: "AppKhor",
  },
};

export default function EnglishLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return children;
}

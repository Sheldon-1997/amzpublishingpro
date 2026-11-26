import type { Metadata } from "next";
import { businessFacts } from "./business-data";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(businessFacts.websiteUrl),
  title: {
    default: `${businessFacts.name} | Publishing Services`,
    template: `%s | ${businessFacts.name}`,
  },
  description: businessFacts.description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    title: `${businessFacts.name} | Publishing Services`,
    description: businessFacts.description,
    siteName: businessFacts.name,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: businessFacts.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${businessFacts.name} | Publishing Services`,
    description: businessFacts.description,
    images: ["/og.png"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

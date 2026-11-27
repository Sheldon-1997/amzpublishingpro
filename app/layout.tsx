import type { Metadata } from "next";
import { businessFacts } from "./business-data";
import { SeasonEffects, SeasonRibbon } from "./SeasonLayer";
import { seasonBootstrapScript } from "./seasons";
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
    // data-season is set by the head script before paint, so the server and
    // client <html> attributes are allowed to differ.
    <html lang="en" suppressHydrationWarning>
      <head>
        <script id="season-bootstrap" dangerouslySetInnerHTML={{ __html: seasonBootstrapScript() }} />
      </head>
      <body>
        <div className="scroll-progress" aria-hidden="true" />
        <SeasonRibbon />
        {children}
        <SeasonEffects />
      </body>
    </html>
  );
}

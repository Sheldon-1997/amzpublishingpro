import type { Metadata } from "next";
import { AdConsent } from "./AdConsent";
import { businessFacts, metaDomainVerification } from "./business-data";
import { SeasonEffects } from "./SeasonLayer";
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
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // data-season is set by the head script before paint, so the server and
    // client <html> attributes are allowed to differ.
    <html lang="en" suppressHydrationWarning>
      <head>
        {metaDomainVerification ? <meta name="facebook-domain-verification" content={metaDomainVerification} /> : null}
        <script id="season-bootstrap" dangerouslySetInnerHTML={{ __html: seasonBootstrapScript() }} />
      </head>
      <body>
        <div className="scroll-progress" aria-hidden="true" />
        {children}
        <SeasonEffects />
        <AdConsent />
      </body>
    </html>
  );
}

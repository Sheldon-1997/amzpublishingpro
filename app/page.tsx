import type { Metadata } from "next";
import { PublishingSite } from "./PublishingSite";
import { businessFacts } from "./business-data";

const title = `Book Publishing Services | ${businessFacts.name}`;

export const metadata: Metadata = {
  title: "Book Publishing Services",
  description: businessFacts.description,
  openGraph: {
    type: "website",
    url: "/",
    title,
    description: businessFacts.description,
    siteName: businessFacts.name,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: businessFacts.name }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description: businessFacts.description,
    images: ["/og.png"],
  },
};

export default function Home() {
  return <PublishingSite />;
}

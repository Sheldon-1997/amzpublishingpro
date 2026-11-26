import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { businessFacts } from "../business-data";
import { ContentPage } from "../ContentPage";
import { getPageRecord, pageRecords } from "../site-data";

type RouteProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return pageRecords.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: RouteProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getPageRecord(decodeURIComponent(slug));

  if (!page) return {};

  const title = `${page.title} | ${businessFacts.name}`;

  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: page.canonical },
    openGraph: {
      type: "website",
      url: page.canonical,
      title,
      description: page.description,
      siteName: businessFacts.name,
      images: [{ url: "/og.png", width: 1200, height: 630, alt: businessFacts.name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: page.description,
      images: ["/og.png"],
    },
  };
}

export default async function ContentRoute({ params }: RouteProps) {
  const { slug } = await params;
  const page = getPageRecord(decodeURIComponent(slug));
  if (!page) notFound();
  return <ContentPage page={page} />;
}

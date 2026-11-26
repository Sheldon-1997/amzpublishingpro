import type { MetadataRoute } from "next";
import { businessFacts } from "./business-data";
import { pageRecords } from "./site-data";

const origin = businessFacts.websiteUrl.replace(/\/$/, "");

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-11-27T00:00:00.000Z");
  return [
    { url: `${origin}/`, lastModified, changeFrequency: "weekly", priority: 1 },
    ...pageRecords.map((page) => ({
      url: `${origin}${page.canonical}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: page.slug === "services" || page.slug === "portfolio" ? 0.8 : 0.7,
    })),
  ];
}

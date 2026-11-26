import type { MetadataRoute } from "next";
import { businessFacts } from "./business-data";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${businessFacts.websiteUrl}sitemap.xml`,
  };
}

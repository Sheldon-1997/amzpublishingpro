export const businessFacts = {
  name: "AMZ Publishing Pro",
  description:
    "AMZ Publishing Pro is an independent book publishing services provider offering editing, cover design, formatting, and publishing setup for authors.",
  websiteUrl: "https://amzpublishingpro.com/",
  domain: "amzpublishingpro.com",
  phone: {
    display: "909-293-9645",
    e164: "+19092939645",
    href: "tel:+19092939645",
  },
  email: "info@amzpublishingpro.com",
  address: {
    formatted: "800 Town & Country Blvd, Suite 500, Houston, TX 77024",
    streetAddress: "800 Town & Country Blvd, Suite 500",
    addressLocality: "Houston",
    addressRegion: "TX",
    postalCode: "77024",
    addressCountry: "US",
  },
  logoUrl: "https://amzpublishingpro.com/og.png",
  trustStatement:
    "Independent publishing services for authors. We never request publishing platform passwords, login credentials, or one-time codes.",
  independenceStatement:
    "AMZ Publishing Pro is an independent company. It is not affiliated with, endorsed by, or sponsored by Amazon, Kindle, KDP, or any other retailer or publishing platform.",
  credentialWarning:
    "We never request publishing platform passwords, login credentials, or one-time codes.",
} as const;

// Add a profile here only after the public page exists under this brand and
// links back to https://amzpublishingpro.com/.
export const socialProfileUrls: readonly string[] = [];

export function buildOrganizationStructuredData(
  profileUrls: readonly string[] = socialProfileUrls,
) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": businessFacts.websiteUrl + "#organization",
    name: businessFacts.name,
    url: businessFacts.websiteUrl,
    description: businessFacts.description,
    logo: businessFacts.logoUrl,
    telephone: businessFacts.phone.e164,
    email: businessFacts.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: businessFacts.address.streetAddress,
      addressLocality: businessFacts.address.addressLocality,
      addressRegion: businessFacts.address.addressRegion,
      postalCode: businessFacts.address.postalCode,
      addressCountry: businessFacts.address.addressCountry,
    },
    ...(profileUrls.length ? { sameAs: [...profileUrls] } : {}),
  };
}

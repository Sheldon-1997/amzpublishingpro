import assert from "node:assert/strict";
import test from "node:test";
import {
  businessFacts,
  buildOrganizationStructuredData,
  socialProfileUrls,
} from "../app/business-data.ts";

test("canonical business facts are exact", () => {
  assert.equal(businessFacts.name, "AMZ Publishing Pro");
  assert.equal(
    businessFacts.description,
    "AMZ Publishing Pro is an independent book publishing services provider offering editing, cover design, formatting, and publishing setup for authors.",
  );
  assert.deepEqual(businessFacts.phone, {
    display: "909-293-9645",
    e164: "+19092939645",
    href: "tel:+19092939645",
  });
  assert.equal(businessFacts.domain, "amzpublishingpro.com");
  assert.equal(businessFacts.websiteUrl, "https://amzpublishingpro.com/");
  assert.match(businessFacts.independenceStatement, /not affiliated with, endorsed by, or sponsored by/);
  assert.equal(businessFacts.email, "info@amzpublishingpro.com");
  assert.equal(
    businessFacts.address.formatted,
    "800 Town & Country Blvd, Suite 500, Houston, TX 77024",
  );
});

test("Organization sameAs contains only controlled public profiles", () => {
  assert.deepEqual(socialProfileUrls, []);
  assert.equal(new Set(socialProfileUrls).size, socialProfileUrls.length);
  for (const url of socialProfileUrls) {
    assert.match(
      url,
      /^https:\/\/(?:www\.)?(?:facebook\.com\/|linkedin\.com\/company\/)/,
    );
  }
  assert.ok(!("sameAs" in buildOrganizationStructuredData()));
  assert.deepEqual(
    buildOrganizationStructuredData(["https://www.linkedin.com/company/example/"]).sameAs,
    ["https://www.linkedin.com/company/example/"],
  );
});

test("Organization data omits sameAs for an empty profile list", () => {
  const organization = buildOrganizationStructuredData([]);
  assert.ok(!("sameAs" in organization));
});

test("Organization data is truthful and claims no unverified profiles", () => {
  const organization = buildOrganizationStructuredData();
  assert.equal(organization["@type"], "Organization");
  assert.equal(organization["@id"], "https://amzpublishingpro.com/#organization");
  assert.equal(organization.logo, "https://amzpublishingpro.com/og.png");
  assert.equal(organization.telephone, "+19092939645");
  assert.equal(organization.email, "info@amzpublishingpro.com");
  assert.ok(!("sameAs" in organization));
  assert.ok(!("legalName" in organization));
  assert.ok(!("taxID" in organization));
});

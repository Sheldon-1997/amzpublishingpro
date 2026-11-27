import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { socialProfileUrls } from "../app/business-data.ts";

let workerPromise;

async function getWorker() {
  workerPromise ??= import(new URL(`../dist/server/index.js?test=${Date.now()}`, import.meta.url))
    .then(({ default: worker }) => worker);
  return workerPromise;
}

async function render(pathname = "/") {
  return renderAbsolute(`http://localhost${pathname}`);
}

async function renderAbsolute(url, assetResponse, requestHeaders = {}) {
  const worker = await getWorker();
  return worker.fetch(
    new Request(url, { headers: { accept: "text/html", ...requestHeaders } }),
    {
      ASSETS: {
        fetch: async () => assetResponse ?? new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server renders the AMZ Publishing Pro identity and canonical domain", async () => {
  const response = await render("/");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<h1>From Manuscript to <span class="gradient-text">Published Book<\/span><\/h1>/);
  assert.match(html, /AMZ Publishing Pro/);
  assert.match(html, /amzpublishingpro\.com/);
  assert.match(html, /info@amzpublishingpro\.com/);
  assert.match(html, /909-293-9645/);
  assert.doesNotMatch(html, /\(877\) 436-9143/);
  assert.match(html, /3D cover concepts and full wraps/);
  assert.doesNotMatch(html, /Amazon book publishing, made clear\./);
  assert.doesNotMatch(html, /\d+ reference covers?/i);
  assert.doesNotMatch(html, /Amazon Kindle (?:Pro|Service)/i);
  assert.doesNotMatch(html, /amazonkindle(?:pro|service)\.(?:co|com)/i);
});

test("homepage presents one approved service description to people and search engines", async () => {
  const approvedDescription =
    "AMZ Publishing Pro is an independent book publishing services provider offering editing, cover design, formatting, and publishing setup for authors.";
  const response = await render("/");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.ok(
    html.includes(`<p class="hero-lede">${approvedDescription}</p>`),
    "the approved description must be visible in the homepage introduction",
  );
  assert.ok(
    html.includes(`<meta name="description" content="${approvedDescription}"/>`),
    "the homepage meta description must use the approved wording",
  );
  assert.ok(
    html.includes(`<meta property="og:description" content="${approvedDescription}"/>`),
    "the Open Graph description must use the approved wording",
  );
  assert.ok(
    html.includes(`<meta name="twitter:description" content="${approvedDescription}"/>`),
    "the X card description must use the approved wording",
  );

  const jsonLd = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
  assert.ok(jsonLd, "homepage should include business structured data");
  const business = JSON.parse(jsonLd);
  assert.equal(
    business.description,
    approvedDescription,
    "business structured data must use the approved wording",
  );
  assert.equal(business["@type"], "Organization");
  assert.equal(
    business["@id"],
    "https://amzpublishingpro.com/#organization",
  );
  assert.equal(
    business.logo,
    "https://amzpublishingpro.com/og.png",
  );
  assert.equal(business.email, "info@amzpublishingpro.com");
  assert.deepEqual(socialProfileUrls, []);
  assert.ok(!("sameAs" in business));
  assert.ok(!("legalName" in business));
});

test("every canonical page aligns document, Open Graph, and X card metadata", async () => {
  const routes = [
    "/",
    "/services",
    "/book-publishing",
    "/ghostwriting",
    "/editing",
    "/book-formatting",
    "/cover-design",
    "/author-brand-content",
    "/book-marketing",
    "/about",
    "/portfolio",
    "/genres",
    "/how-it-works",
    "/resources",
    "/contact",
    "/terms",
    "/privacy",
    "/ecommerce-store-setup",
    "/ecommerce-marketing",
    "/book-ad-campaigns",
    "/keyword-research",
  ];

  for (const route of routes) {
    const response = await render(route);
    assert.equal(response.status, 200, `${route} should return 200`);
    const html = await response.text();
    const content = (pattern, label) => {
      const value = html.match(pattern)?.[1];
      assert.ok(value, `${route} should render ${label}`);
      return value;
    };

    const documentTitle = content(/<title>([^<]+)<\/title>/, "a document title");
    const description = content(
      /<meta name="description" content="([^"]+)"\/?>/,
      "a meta description",
    );

    assert.equal(
      content(/<meta property="og:title" content="([^"]+)"\/?>/, "an Open Graph title"),
      documentTitle,
      `${route} Open Graph title should match its document title`,
    );
    assert.equal(
      content(/<meta property="og:description" content="([^"]+)"\/?>/, "an Open Graph description"),
      description,
      `${route} Open Graph description should match its meta description`,
    );
    assert.equal(
      content(/<meta property="og:image" content="([^"]+)"\/?>/, "an Open Graph image"),
      "https://amzpublishingpro.com/og.png",
      `${route} should preserve the approved Open Graph image`,
    );
    assert.equal(
      content(/<meta name="twitter:card" content="([^"]+)"\/?>/, "an X card type"),
      "summary_large_image",
      `${route} should preserve the large X card`,
    );
    assert.equal(
      content(/<meta name="twitter:title" content="([^"]+)"\/?>/, "an X card title"),
      documentTitle,
      `${route} X card title should match its document title`,
    );
    assert.equal(
      content(/<meta name="twitter:description" content="([^"]+)"\/?>/, "an X card description"),
      description,
      `${route} X card description should match its meta description`,
    );
    assert.equal(
      content(/<meta name="twitter:image" content="([^"]+)"\/?>/, "an X card image"),
      "https://amzpublishingpro.com/og.png",
      `${route} should preserve the approved X card image`,
    );
  }
});

test("shared footer displays the independent publishing services trust statement", async () => {
  const trustStatement =
    /Independent publishing services for authors\. We never request publishing platform passwords, login credentials, or one-time codes\./;
  const independenceStatement =
    /AMZ Publishing Pro is an independent company\. It is not affiliated with, endorsed by, or sponsored by Amazon, Kindle, KDP, or any other retailer or publishing platform\./;

  for (const route of ["/", "/services", "/contact", "/privacy", "/terms"]) {
    const response = await render(route);
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.match(html, trustStatement);
    assert.match(html, independenceStatement);
  }
});

test("project inquiry warns visitors never to share platform credentials", async () => {
  const warning = /We never request publishing platform passwords, login credentials, or one-time codes\./;

  for (const route of ["/", "/contact"]) {
    const response = await render(route);
    assert.equal(response.status, 200, `${route} should return 200`);
    assert.match(await response.text(), warning, `${route} should display the credential warning`);
  }
});

test("terms explain brand independence and author account control", async () => {
  const response = await render("/terms");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, />Brand Independence</);
  assert.match(
    html,
    /AMZ Publishing Pro provides editing, cover design, formatting, and publishing setup directly to authors\./,
  );
  assert.match(
    html,
    /It is not affiliated with, endorsed by, or sponsored by Amazon, Kindle, KDP, or any other retailer or publishing platform\./,
  );
  assert.match(
    html,
    /Authors retain control of their accounts, credentials, publishing records, and royalty access\./,
  );
});

test("services use canonical routes and publishing terminology", async () => {
  const response = await render("/");
  const html = await response.text();

  assert.match(html, /href="\/author-brand-content"/);
  assert.match(html, />Author Brand Content</);
  assert.match(html, />Retail Platform Brand Content</);
  assert.match(html, />eBook</);
  assert.doesNotMatch(html, /href="\/author-brand-a-plus"/);
  assert.doesNotMatch(html, />Author Brand &amp; A\+/);
  assert.doesNotMatch(html, /A\+ Brand Content|Kindle formatting|Kindle eBook preparation/);

  const source = await readFile(new URL("../app/site-data.ts", import.meta.url), "utf8");
  assert.doesNotMatch(source, /A\+ Brand Content|Kindle formatting|Kindle eBook preparation/);
});

test("canonical service routes render their self-referential canonicals", async () => {
  for (const route of ["/author-brand-content", "/book-ad-campaigns"]) {
    const response = await render(route);
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.ok(
      html.includes(
        'rel="canonical" href="https://amzpublishingpro.com' + route + '"',
      ),
    );
  }
});

test("homepage phone actions use one disclosed number everywhere", async () => {
  const response = await render("/");
  assert.equal(response.status, 200);

  const html = await response.text();
  const expectedPhoneHref = "tel:+19092939645";
  const phoneHrefs = [...html.matchAll(/href="(tel:[^"]+)"/g)].map((match) => match[1]);

  assert.ok(phoneHrefs.length >= 4, "homepage should expose every primary call action");
  assert.deepEqual(
    [...new Set(phoneHrefs)],
    [expectedPhoneHref],
    "every call action must dial the same number shown to visitors",
  );
  assert.match(
    html,
    /href="tel:\+19092939645"[^>]*>Call (?:<!-- -->)?909-293-9645<\/a>/,
  );
  const jsonLd = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
  assert.ok(jsonLd, "homepage should include business structured data");
  assert.equal(
    JSON.parse(jsonLd).telephone,
    "+19092939645",
    "structured data must use the same disclosed phone number",
  );
  assert.match(
    html,
    /href="mailto:info@amzpublishingpro\.com"[^>]*>Email Us<\/a>/,
  );
  assert.doesNotMatch(html, /href="(?:sms|smsto):/i);
  assert.doesNotMatch(html, /\+18774369143|\(877\) 436-9143/);

  const termsResponse = await render("/terms");
  assert.equal(termsResponse.status, 200);
  const termsHtml = await termsResponse.text();
  assert.match(termsHtml, /909-293-9645/);
  assert.doesNotMatch(termsHtml, /\(877\) 436-9143/);
});

test("contact and legal pages publish the current business address and advertising privacy status", async () => {
  const address = "800 Town &amp; Country Blvd, Suite 500, Houston, TX 77024";

  for (const route of ["/", "/contact", "/privacy", "/terms"]) {
    const response = await render(route);
    assert.equal(response.status, 200, `${route} should return 200`);
    assert.equal(response.headers.get("set-cookie"), null, `${route} should not set a tracking cookie`);

    const html = await response.text();
    assert.match(html, new RegExp(address), `${route} should display the current business address`);
    assert.doesNotMatch(html, /connect\.facebook\.net|\bfbq\s*\(|googletagmanager|\bgtag\s*\(/i);

    if (route === "/") {
      const jsonLd = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
      assert.ok(jsonLd, "homepage should include business structured data");
      const business = JSON.parse(jsonLd);
      assert.deepEqual(business.address, {
        "@type": "PostalAddress",
        streetAddress: "800 Town & Country Blvd, Suite 500",
        addressLocality: "Houston",
        addressRegion: "TX",
        postalCode: "77024",
        addressCountry: "US",
      });
    }

    if (route === "/privacy") {
      assert.match(html, /Effective November 27, 2026/);
      assert.match(html, />Advertising</);
      assert.match(html, /does not currently use the Meta Pixel, Conversions API, analytics cookies, or advertising cookies/);
      assert.match(html, /Any cookie set for that purpose is strictly necessary/);
      assert.doesNotMatch(html, /__cf_bm/);
    }
  }
});

test("genre links preserve the requested portfolio filter", async () => {
  for (const route of ["/", "/genres"]) {
    const response = await render(route);
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.match(html, /href="\/?\?genre=Romance#portfolio"/);
    assert.match(html, /href="\/?\?genre=Self%20Help%20%26%20Wellness#portfolio"/);
  }
});

test("rendered controls expose keyboard complete navigation and motion choices", async () => {
  const response = await render("/");
  assert.equal(response.status, 200);
  const html = await response.text();

  assert.match(html, /id="mobile-navigation"[^>]*role="dialog"[^>]*aria-modal="true"/);
  assert.match(html, /aria-label="Pause book animation"/);
  assert.match(html, /aria-label="Pause cover gallery"/);
  assert.match(html, /aria-label="Open A Quiet Street sample cover"/);
});

test("homepage hero is a 3D book stage with a still fallback", async () => {
  const response = await render("/");
  assert.equal(response.status, 200);
  const html = await response.text();

  assert.match(
    html,
    /id="hero-publishing-portal"[^>]*role="region"[^>]*data-cover-count="10"/,
  );
  assert.match(html, /data-visual="book-studio"/);
  assert.match(html, /id="hero-publishing-motion"/);
  assert.match(html, /aria-controls="hero-publishing-motion"/);
  assert.match(html, /<canvas class="hero-stage-canvas"[^>]*aria-hidden="true"/);
  // The server-rendered still book is what visitors see before WebGL starts,
  // with reduced motion, or when WebGL is unavailable.
  assert.match(html, /class="hero-poster"[^>]*aria-hidden="true"/);
  assert.match(html, /class="published-book-cover"[^>]*src="\/sample-covers\/[a-z-]+-\d{2}\.webp"/);
  assert.match(html, /class="hero-stage-caption"[^>]*>.*Sample cover/s);
  assert.match(
    html,
    /A hardcover sample book turns slowly in the light\. It then lies back and opens, its pages lift into the air and settle again, and it closes as the next sample book\. The sequence repeats across ten sample covers\./,
  );
  assert.doesNotMatch(html, /hero-publishing\/|publishing-cabinet|cabinet-/);
});

test("the 3D hero scene is loaded on demand and respects reduced motion", async () => {
  const [site, scene, css] = await Promise.all([
    readFile(new URL("../app/PublishingSite.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/hero-scene.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(site, /await import\("\.\/hero-scene"\)/, "three.js must stay out of the first paint");
  assert.doesNotMatch(site, /from "three"/);
  assert.match(site, /if \(!canvas \|\| reducedMotion\) return;/, "reduced motion keeps the still book");
  assert.match(scene, /shadowMap\.enabled = true/);
  assert.match(scene, /webglcontextlost/);
  assert.match(scene, /dispose\(\)/);
  assert.match(css, /\.hero-books\.is-live \.hero-stage-canvas \{ opacity: 1; \}/);
  assert.match(css, /\.hero-books\.is-live \.hero-poster \{[^}]*visibility: hidden/);
  assert.doesNotMatch(css, /cabinet/);
});

test("the supplied logo is used with a fixed gold PRO", async () => {
  const html = await (await render("/")).text();
  const logos = html.match(/<svg class="brand-logo"[^>]*aria-label="AMZ Publishing Pro"/g) ?? [];
  assert.equal(logos.length, 2, "header and footer both carry the logo");
  assert.match(html, /class="brand-logo-pro" fill="#E9C664"/);
  assert.equal((html.match(/fill="currentColor"/g) ?? []).length >= 4, true);
  assert.match(html, /rel="icon"[^>]*href="\/favicon\.svg"/);

  for (const file of ["logo-for-dark-background.svg", "logo-for-light-background.svg", "logo-for-dark-background.png", "logo-for-light-background.png"]) {
    const bytes = await readFile(new URL(`../public/brand/${file}`, import.meta.url));
    assert.ok(bytes.byteLength > 1000, `${file} is present`);
  }
});

test("no section labels its items with running numbers", async () => {
  const html = await (await render("/")).text();
  assert.doesNotMatch(html, />0[1-9]</);
  const site = await readFile(new URL("../app/PublishingSite.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(site, /padStart\(2/);
});

test("client covers are shown as front covers and kept apart from the samples", async () => {
  const { clientCovers } = await import("../app/client-covers.ts");
  const html = await (await render("/")).text();
  const section = html.match(/<section class="section client-covers-section"[\s\S]*?<\/section>/)?.[0] ?? "";

  assert.ok(section, "the client covers section renders");
  assert.match(section, /Client projects/);
  assert.doesNotMatch(section, /Sample concept|sample-covers\//, "client work is never mixed with sample concepts");
  assert.equal((section.match(/<figure class="client-cover"/g) ?? []).length, clientCovers.length);

  for (const cover of clientCovers) {
    const bytes = await readFile(new URL(`../public${cover.src}`, import.meta.url));
    assert.equal(bytes.subarray(0, 4).toString("latin1"), "RIFF", `${cover.slug} is a WebP file`);
    assert.ok(bytes.byteLength < 400_000, `${cover.slug} stays reasonably small`);
    assert.ok(section.includes(`src="${cover.src}"`));
    assert.ok(cover.title && cover.author);
  }
});

test("client reviews are only shown with a public source", async () => {
  const { clientReviews } = await import("../app/client-reviews.ts");
  const html = await (await render("/")).text();

  if (clientReviews.length === 0) {
    assert.doesNotMatch(html, /id="reviews"/, "an empty review list renders no section");
    return;
  }
  assert.match(html, /id="reviews"/);
  for (const review of clientReviews) {
    assert.match(review.sourceUrl, /^https:\/\//, "every review links to where it was posted");
    assert.ok(review.name.trim() && review.text.trim() && review.date.trim());
    assert.doesNotMatch(review.text, /\bFBA\b/, "reviews must be about this publishing service");
  }
});

test("navigation and cover service copy stay consistent", async () => {
  const response = await render("/");
  assert.equal(response.status, 200);
  const html = await response.text();
  const primaryNavigation = html.match(/<nav class="primary-nav"[\s\S]*?<\/nav>/)?.[0] ?? "";

  assert.match(primaryNavigation, /href="\/how-it-works"[^>]*>How It Works<\/a>/);
  assert.match(html, /Front covers, full wraps, 3D concepts, and 3D presentation views/);
  assert.doesNotMatch(html, /Front covers, full wraps, 2D concepts/);
});

test("www redirects to the canonical apex without dropping path or query", async () => {
  const response = await renderAbsolute("https://www.amzpublishingpro.com/contact?from=www");
  assert.equal(response.status, 308);
  assert.equal(
    response.headers.get("location"),
    "https://amzpublishingpro.com/contact?from=www",
  );
});

test("legacy service URLs permanently redirect directly to their final canonical URLs", async () => {
  const redirects = {
    "/author-brand-a-plus": "/author-brand-content",
    "/amazon-ad-campaign": "/book-ad-campaigns",
    "/amazon-ad-campaign.php": "/book-ad-campaigns",
    "/amazon-author.php": "/author-brand-content",
    "/brand-content.php": "/author-brand-content",
    "/about-us.php": "/about",
    "/ecommerce-store-setup.php": "/ecommerce-store-setup",
    "/ecommerce-marketing.php": "/ecommerce-marketing",
    "/amazon-plus-marketing.php": "/book-marketing",
    "/amazon-book-publishing.php": "/book-publishing",
    "/deep-keyword.php": "/keyword-research",
    "/contact-us.php": "/contact",
    "/terms.php": "/terms",
    "/privacy.php": "/privacy",
    "/index.php": "/book-publishing",
  };

  for (const [source, destination] of Object.entries(redirects)) {
    const response = await renderAbsolute(
      `https://amzpublishingpro.com${source}?source=legacy`,
    );
    assert.equal(response.status, 301, `${source} must permanently redirect`);
    assert.equal(
      response.headers.get("location"),
      `https://amzpublishingpro.com${destination}?source=legacy`,
    );
  }

  const wwwLegacyResponse = await renderAbsolute(
    "https://www.amzpublishingpro.com/amazon-ad-campaign.php?source=www",
  );
  assert.equal(wwwLegacyResponse.status, 301);
  assert.equal(
    wwwLegacyResponse.headers.get("location"),
    "https://amzpublishingpro.com/book-ad-campaigns?source=www",
  );
});

test("sitemap lists only canonical pages and omits redirect sources", async () => {
  const response = await render("/sitemap.xml");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /xml/i);

  const xml = await response.text();
  const sitemapPaths = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    ([, location]) => new URL(location).pathname,
  );
  const redirectSources = [
    "/author-brand-a-plus",
    "/amazon-ad-campaign",
    "/amazon-ad-campaign.php",
    "/amazon-author.php",
    "/brand-content.php",
    "/about-us.php",
    "/ecommerce-store-setup.php",
    "/ecommerce-marketing.php",
    "/amazon-plus-marketing.php",
    "/amazon-book-publishing.php",
    "/deep-keyword.php",
    "/contact-us.php",
    "/terms.php",
    "/privacy.php",
    "/index.php",
  ];
  const redirectDestinations = [
    "/author-brand-content",
    "/book-ad-campaigns",
    "/about",
    "/ecommerce-store-setup",
    "/ecommerce-marketing",
    "/book-marketing",
    "/book-publishing",
    "/keyword-research",
    "/contact",
    "/terms",
    "/privacy",
  ];

  assert.ok(sitemapPaths.includes("/"));
  for (const destination of redirectDestinations) {
    assert.ok(sitemapPaths.includes(destination), `${destination} must be canonical in the sitemap`);
  }
  for (const source of redirectSources) {
    assert.ok(!sitemapPaths.includes(source), `${source} must not appear in the sitemap`);
  }
  assert.match(xml, /<lastmod>2026-11-27T00:00:00\.000Z<\/lastmod>/);
  assert.match(xml, /<changefreq>weekly<\/changefreq>/);
  assert.match(xml, /<changefreq>monthly<\/changefreq>/);
});

test("HTML and public images receive useful cache policy", async () => {
  const htmlResponse = await render("/");
  assert.match(htmlResponse.headers.get("cache-control") ?? "", /s-maxage=300/);

  const imageResponse = await renderAbsolute(
    "https://amzpublishingpro.com/sample-covers/fiction-01.webp",
    new Response("image", { status: 200, headers: { "content-type": "image/webp" } }),
  );
  assert.equal(imageResponse.status, 200);
  assert.match(imageResponse.headers.get("cloudflare-cdn-cache-control") ?? "", /max-age=604800/);
  assert.ok(
    [...imageResponse.headers.keys()].filter((name) => name.toLowerCase() === "cache-control").length <= 1,
  );
});

test("personalized requests are never marked as publicly cacheable", async () => {
  const response = await renderAbsolute(
    "https://amzpublishingpro.com/",
    undefined,
    { cookie: "session=test" },
  );

  assert.equal(response.status, 200);
  assert.doesNotMatch(response.headers.get("cache-control") ?? "", /\bpublic\b/i);

  const wildcardVaryResponse = await renderAbsolute(
    "https://amzpublishingpro.com/sample-covers/fiction-01.webp",
    new Response("image", {
      status: 200,
      headers: { "content-type": "image/webp", vary: "*" },
    }),
  );
  assert.doesNotMatch(wildcardVaryResponse.headers.get("cache-control") ?? "", /\bpublic\b/i);
});

test("public canonical routes return successful HTML responses", async () => {
  const routes = [
    "/services",
    "/portfolio",
    "/genres",
    "/how-it-works",
    "/resources",
    "/about",
    "/contact",
    "/privacy",
    "/terms",
    "/book-publishing",
    "/cover-design",
  ];

  for (const route of routes) {
    const response = await render(route);
    assert.equal(response.status, 200, `${route} should return 200`);
    assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  }
});

test("every public route discloses the same phone number", async () => {
  const routes = [
    "/",
    "/services",
    "/portfolio",
    "/genres",
    "/how-it-works",
    "/resources",
    "/about",
    "/contact",
    "/privacy",
    "/terms",
    "/book-publishing",
    "/cover-design",
  ];

  for (const route of routes) {
    const response = await render(route);
    assert.equal(response.status, 200, `${route} should return 200`);
    const html = await response.text();
    const phoneHrefs = [...html.matchAll(/href="(tel:[^"]+)"/g)].map((match) => match[1]);

    assert.match(html, /909-293-9645/, `${route} should display the disclosed phone number`);
    assert.deepEqual(
      [...new Set(phoneHrefs)],
      ["tel:+19092939645"],
      `${route} should dial only the disclosed phone number`,
    );
    assert.doesNotMatch(html, /\+18774369143|\(877\) 436-9143/);
  }
});

test("brand preview is a compact AMZ Publishing Pro 1200 by 630 PNG", async () => {
  const png = await readFile(new URL("../public/og.png", import.meta.url));
  assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  assert.equal(png.readUInt32BE(16), 1200);
  assert.equal(png.readUInt32BE(20), 630);
  assert.ok(png.byteLength < 100_000, "social image should stay lightweight");

});

test("no page carries the previous brand or presents platform names as its own", async () => {
  const sitemap = await (await render("/sitemap.xml")).text();
  const routes = [...sitemap.matchAll(/<loc>https:\/\/amzpublishingpro\.com([^<]*)<\/loc>/g)].map((match) => match[1] || "/");
  assert.equal(routes.length, 21, "the sitemap lists the homepage and 20 content pages");
  for (const route of routes) {
    const response = await render(route);
    assert.equal(response.status, 200, `${route} should return 200`);
    const html = await response.text();
    assert.doesNotMatch(html, /Amazon Kindle (?:Service|Pro)|amazonkindle/i, `${route} must not carry the previous brand`);
    assert.doesNotMatch(html, /linkedin\.com\/company\/amazonkindleservice/i);
    let visible = html.replace(/<script[\s\S]*?<\/script>/g, "");
    const disclaimerCount = (visible.match(/not affiliated with, endorsed by, or sponsored by Amazon, Kindle, KDP/g) ?? []).length;
    assert.ok(disclaimerCount >= 1, `${route} must show the independence statement`);
    // The homepage has one section that describes publishing on Amazon KDP as a service.
    const kdpStart = visible.indexOf('<section class="kdp-section"');
    if (route === "/") {
      assert.ok(kdpStart > -1, "the homepage describes the Amazon KDP service");
      const kdpEnd = visible.indexOf("</section>", kdpStart);
      visible = visible.slice(0, kdpStart) + visible.slice(kdpEnd);
    } else {
      assert.equal(kdpStart, -1);
    }
    const platformMentions = visible.match(/Amazon|Kindle|KDP/g) ?? [];
    const footerNavMentions = (visible.match(/>KDP setup</g) ?? []).length;
    assert.equal(platformMentions.length - footerNavMentions, disclaimerCount * 3, `${route} names those platforms only in the KDP section and the independence statement`);
    assert.doesNotMatch(html, /<img[^>]*(?:src|alt)="[^"]*(?:amazon|kindle|kdp)[^"]*"/i, `${route} must not show a platform logo or screenshot`);
    assert.doesNotMatch(html, /We(?:'|&#x27;)re the Amazon|Amazon Book Publishing (?:Professionals|Company|Experts)|official Amazon|Amazon partner/i, `${route} must not present the business as Amazon`);
  }
});

test("cover samples are labelled as samples and never as client work", async () => {
  for (const route of ["/", "/portfolio"]) {
    const html = await (await render(route)).text();
    assert.match(html, /original sample cover concepts created for this website/);
    assert.match(html, /not client projects or published books/);
    assert.match(html, />Sample concept</);
    assert.doesNotMatch(html, /supplied by the client/i);
  }
});

test("source keeps reliable native navigation and deferred motion code", async () => {
  const [site, contentPage, css, data] = await Promise.all([
    readFile(new URL("../app/PublishingSite.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/ContentPage.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/site-data.ts", import.meta.url), "utf8"),
  ]);

  assert.doesNotMatch(site, /import Link from "next\/link"/);
  assert.doesNotMatch(contentPage, /import Link from "next\/link"/);
  assert.match(site, /import\("jquery"\)/);
  assert.doesNotMatch(site, /import \$ from "jquery"/);
  assert.match(site, /IntersectionObserver/);
  assert.match(site, /prefers-reduced-motion: reduce/);
  assert.match(site, /usePrefersReducedMotion/);
  assert.match(site, /Motion off/);
  assert.doesNotMatch(site, /\$slider\.scrollLeft\(0\)/);
  assert.match(site, /mobile-menu-backdrop/);
  assert.match(site, /prefetchEligibleSelector/);
  assert.doesNotMatch(css, /Georgia|Times New Roman/);
  assert.match(css, /--font-sans: system-ui/);
  assert.doesNotMatch(`${site}\n${contentPage}\n${data}`, /[—–]/);
  assert.doesNotMatch(`${site}\n${contentPage}\n${data}`, /info@amazonkindlepro\.co/i);
});

test("every page carries the seasonal layer without inventing a sale", async () => {
  for (const route of ["/", "/portfolio", "/privacy"]) {
    const html = await (await render(route)).text();
    const head = html.slice(0, html.indexOf("</head>"));
    assert.match(head, /<script id="season-bootstrap">/, `${route} sets the season before first paint`);
    assert.match(html, /<html lang="en"(?![^>]*data-season)/, "the server never bakes a season into the HTML");
    assert.equal((html.match(/class="season-message"/g) ?? []).length, 14, "one greeting per season is rendered");
    assert.match(html, /<canvas class="season-effects" aria-hidden="true">/);
    assert.match(html, /aria-label="Hide the seasonal greeting and effects"/);
    const ribbon = html.slice(html.indexOf('<aside class="season-ribbon"'), html.indexOf("</aside>"));
    assert.doesNotMatch(ribbon, /\bsale\b|discount|% ?off|\bdeal\b|coupon|limited time|\bfree\b/i, "greetings must not promise an offer that does not exist");
  }
});

test("the Amazon KDP section describes a service, states independence, and makes no unverified claims", async () => {
  const html = await (await render("/")).text();
  const start = html.indexOf('<section class="kdp-section"');
  const section = html.slice(start, html.indexOf("</section>", start));

  assert.match(section, /id="amazon-kdp"/);
  assert.match(section, /We help authors publish on <span class="gradient-text">Amazon KDP<\/span>/);
  assert.match(section, /Kindle Direct Publishing \(KDP\) is Amazon(?:'|&#x27;)s self-publishing platform/);
  assert.match(section, /in your own KDP account, so the book, the files, and the royalties stay with you/);
  assert.match(section, /is an independent company and is not affiliated with Amazon/);
  assert.equal((section.match(/class="kdp-step"/g) ?? []).length, 6);
  for (const step of ["Ghostwriting", "Developmental editing", "Copyediting and proofreading", "Cover design", "Formatting", "KDP setup and publishing"]) {
    assert.match(section, new RegExp(`<h3>${step}</h3>`));
  }
  assert.match(section, /class="kdp-stage" aria-hidden="true"/, "the floating books are decorative");
  assert.match(section, />Sample covers</);

  // No statistics or testimonials are published until they can be backed by records.
  assert.doesNotMatch(html, /\b\d[\d,]*\+\s*(?:<[^>]+>\s*)*(?:Books|Best|Clients|Team|Dedicated)/i);
  assert.doesNotMatch(html, /100%\s*(?:<[^>]+>\s*)*Client Satisfaction|best-?sellers?\b|testimonial/i);
});

test("the page ships the modern layer with reduced-motion fallbacks", async () => {
  const html = await (await render("/")).text();
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(html, /<div class="scroll-progress" aria-hidden="true"><\/div>/);
  assert.equal((html.match(/class="service-ribbon-group"/g) ?? []).length, 2);
  assert.match(html, /class="service-ribbon-group" aria-hidden="true"/, "the repeated marquee copy is hidden from assistive technology");
  assert.equal((html.match(/class="service-card" data-tilt=""/g) ?? []).length, 8);
  assert.match(html, /class="process-section" id="process" data-spotlight=""/);

  assert.match(css, /@supports \(animation-timeline: scroll\(\)\)/);
  assert.match(css, /\.portfolio-slider \.book-card \{ animation: coverflow linear both; animation-timeline: view\(inline\); \}/);
  const reduced = css.slice(css.lastIndexOf("@media (prefers-reduced-motion: reduce)"));
  assert.match(reduced, /\.service-ribbon-track \{[^}]*animation: none/);
  assert.match(reduced, /\.gradient-text, \.kdp-orbit, \.kdp-book \.book3d \{ animation: none; \}/);
  assert.match(reduced, /\[data-tilt\], \.service-card\[data-tilt\]:hover \{ transform: none/);
});

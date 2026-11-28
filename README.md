# AMZ Publishing Pro website

Source for https://amzpublishingpro.com/ — an independent book publishing
services website (editing, cover design, formatting, publishing setup).

This repository was rebranded on 27 November 2026 from an earlier site. The
layout, typography, page structure, and the manuscript-to-book hero animation
are unchanged. The brand, domain, contact email, legal pages, metadata,
structured data, sitemap, colour palette, and cover library were replaced.

## Status

| Item | State |
| --- | --- |
| Source rebrand | Done, 49 tests pass on a fresh build |
| GitHub repository | `Sheldon-1997/amzpublishingpro` (public) |
| Live site | Published with GitHub Pages at https://amzpublishingpro.com/ on 27 November 2026 |
| HTTPS | Certificate issued and "Enforce HTTPS" is on; `http` and `www` redirect to `https://amzpublishingpro.com` |
| DNS (GoDaddy) | Four apex A records to GitHub Pages, `www` CNAME to `sheldon-1997.github.io` |
| Inquiry form delivery | The form posts to FormSubmit, which emails `info@amzpublishingpro.com`. The inbox owner must click the one-time activation email. If delivery fails the form opens the visitor's email app instead. |
| `info@amzpublishingpro.com` mailbox | Set up by the owner on GoDaddy email (DKIM and email records are on the domain); delivery not tested from the site |
| Node build for a VPS | **Not done** (only needed for a server-side form or the legacy redirects) |

## Requirements

- Node.js `>=22.13.0`
- pnpm 10 or 11

## Commands

```bash
pnpm install --frozen-lockfile
pnpm dev          # local preview
pnpm test         # production build + 49 tests
pnpm lint
```

Keep `pnpm-lock.yaml` as committed. Do not upgrade the framework or
dependencies as part of unrelated work.

## Where things live

- `app/business-data.ts` — the single record of brand name, domain, email,
  phone, address, trust wording, and Organization structured data. Change the
  phone number or email here and nowhere else.
- `app/site-data.ts` — services and the 22 content pages (including Terms and
  Privacy).
- `app/PublishingSite.tsx` — homepage, header, footer, gallery, inquiry form,
  hero stage, client covers shelf, review deck.
- `app/hero-scene.ts` — the WebGL hero scene (three.js), loaded on demand.
- `app/BrandLogo.tsx`, `public/brand/` — the logo from the owner's logo pack.
- `app/client-covers.ts`, `public/client-covers/` — covers designed for clients.
- `app/client-reviews.ts` — sourced client reviews (empty until verified).
- `app/globals.css` — all styling.
- `app/cover-catalog.ts`, `app/hero-publishing-covers.ts` — sample cover data.
- `app/site-redirects.ts` — 15 permanent redirects for legacy paths.
- `worker/index.ts` — request entry: `www` to apex redirect, legacy redirects,
  cache headers.
- `public/sample-covers/` — 40 original sample covers (WebP, 640x960).
- `scripts/generate-sample-covers.mjs` — regenerates the sample covers.

## Seasonal themes

`app/seasons.ts` holds 14 United States occasions. A small script in the page
head reads today's date in US Central time and sets `data-season` on `<html>`
before the first paint, so the theme changes on its own with no rebuild.

| Season | Dates |
| --- | --- |
| New Year | 26 December to 2 January |
| Martin Luther King Jr. Day | third Monday of January (one line, no effects) |
| Valentine's Day | 8 to 14 February |
| Presidents' Day | Saturday to the third Monday of February (one line) |
| Memorial Day | Saturday to the last Monday of May (one line) |
| Juneteenth | 19 June (one line) |
| Independence Day | 1 to 4 July |
| Labor Day | Saturday to the first Monday of September (one line) |
| Halloween | 24 to 31 October |
| Veterans Day | 11 November (one line) |
| Thanksgiving | Monday to Thursday of Thanksgiving week |
| Black Friday | Friday to Sunday after Thanksgiving |
| Cyber Monday | the Monday after |
| Holiday season | the day after Cyber Monday to 25 December |

A season never replaces the brand colours: the header, dark sections, links
and buttons stay in the logo's navy, blue and gold all year (a test enforces
this). Festive seasons show a light greeting band under the header with their
own accent colour, add two soft tints behind the hero, and run a light canvas effect
(snow, leaves, confetti, hearts, or sparks). Days of remembrance show a single
line only. The visitor can close the ribbon, which also stops the effect for
that browser session. Effects never run for visitors who prefer reduced motion.

Preview any theme with `?season=<id>`, for example
`/?season=holiday-season`, or turn it off with `/?season=off`.

Greetings are not promotions. To announce a real offer, put its exact wording
in that season's `offer` field; a test fails if a default greeting mentions a
sale, discount, or deal.

## Hero animation

The hero is a WebGL scene (`app/hero-scene.ts`, three.js): a hardcover book
with real lighting, reflections and a cast shadow. It turns slowly, then lies
back and opens, its pages lift into a spiral and settle again, and it closes
as the next book. The camera leans toward the pointer on desktop. It cycles
through the client covers in `app/client-covers.ts` (the sample covers are a
fallback only if that list is empty).

- The server renders a still CSS book (`.hero-poster`). The scene replaces it
  only after the page has loaded, so three.js never delays the first paint.
- Visitors who ask for reduced motion, and browsers without WebGL, keep the
  still book.
- The scene stops rendering when it is off screen, the tab is hidden, or the
  visitor presses Pause.

## Header and contact

The header is a navy plate that hangs from the top edge and stays in view
while scrolling. Menu items turn into gold bookmark ribbons on hover. It
carries the phone number on every page (an icon button on phones). The hero's
pause control is not drawn but is still reachable by keyboard. The contact
section at the foot of the homepage shows the number large beside the inquiry
form. The form sends through FormSubmit (`inquiryEndpoint` in
`app/PublishingSite.tsx`) and falls back to the visitor's email app if that
request fails.

## Performance

- The 3D hero watches its own frame rate. On a slow device it first drops
  shadows and pixel density, then hands back to the still book, whose cover
  still changes every few seconds.
- Seasonal particles run only while the top of the page is on screen.
- Looping CSS animations pause while their section is off screen
  (`useOffscreenPause`).
- No `filter: drop-shadow` or canvas masks: both are repainted every frame.
- Small placements use the 360 pixel cover copies in
  `public/client-covers/thumb/`. Regenerate a thumbnail when a cover changes.

## Logo

The logo comes from the owner's logo pack. The header uses a wide lockup built
from the same letter shapes (large AMZ, a gold rule, PUBLISHING over PRO); the
footer uses the pack's stacked version. `BrandLogo` draws both inline: the
"AMZ PUBLISHING" letters use the current text colour so they follow the theme,
and "PRO" is always the brand gold (`#E9C664` on dark backgrounds). Do not
recolour "PRO". The pack's favicon and 1200x630 share image are in `public/`.

## Client covers and reviews

`app/client-covers.ts` lists covers designed for clients (11 at present). Only
the front panel is published, never the back-cover text, at the artwork's own
proportions (800 pixels wide). Add a cover only when its author has agreed to
it being shown. One entry puts a cover in four places: the 3D hero book, the
bookcase under "Client projects", the moving cover band above the FAQ, and
(for the three slugs named in `kdpShowcase`) beside the KDP copy.

`app/client-reviews.ts` feeds the homepage review deck and the `/reviews`
page. The reviews on file were sent to the business by email and supplied by
the owner; they are shown in the clients' own words, marked "Sent to us by
email", with no star rating because none was given. Add a review only if a
real client wrote it, keep the wording as written, and add `sourceUrl` when it
is posted publicly. Publish a client's name only with that client's consent.

## Amazon KDP section, statistics, and testimonials

The homepage has one section (`KdpSection` in `app/PublishingSite.tsx`) that
describes publishing on Amazon KDP as a service the business provides in the
author's own KDP account. It states that the company is independent and not
affiliated with Amazon. The site shows no Amazon logo, storefront screenshot,
or wording that presents the business as Amazon; tests enforce this.

The homepage figure bar shows the figures in `ownerFigures`
(`app/business-data.ts`). They were supplied and confirmed by the business
owner on 27 November 2026 and are the owner's own statements; the owner should
be able to back each one with records, especially before quoting them in
adverts. Change them only on the owner's instruction. Reviews follow the rules
under "Client covers and reviews" above.

Section items carry no running numbers ("01", "02"); a test enforces this.

## Modern layer

- Scroll progress bar, coverflow gallery, and section reveals use CSS
  scroll-driven animations where the browser supports them.
- Cards marked `data-tilt` lean toward the pointer; sections marked
  `data-spotlight` light up under it (`usePointerDepth`).
- The service ribbon is a marquee that pauses on hover.
- Everything has a reduced-motion fallback.

## Cover samples

The gallery and the hero animation use 40 original sample cover concepts drawn
by `scripts/generate-sample-covers.mjs`. Titles are invented and the author
line reads "AUTHOR NAME". They are labelled on the site as sample concepts and
are not presented as client work.

To show real client covers, add only covers the business produced and has the
author's permission to display, then update `app/cover-catalog.ts` and the
wording in `app/PublishingSite.tsx` and `app/site-data.ts`.

Regenerating the samples needs `sharp` available from the working directory
and the fonts named in the script installed on the machine:

```bash
node scripts/generate-sample-covers.mjs public/sample-covers manifest.json
```

The sha256 values in `app/cover-catalog.ts` must then be updated to match.

## Brand rules enforced by tests

- The previous brand and domain do not appear on any page.
- Amazon, Kindle, and KDP are named only inside the independence statement
  ("not affiliated with, endorsed by, or sponsored by ...") shown in the footer
  and in the Terms. They are never used as the site's own name.
- Organization structured data carries no `sameAs` until a public profile for
  this brand exists and links back to the site.
- Cover samples are labelled as samples on every page that shows them.

## Before running paid ads

- `/privacy` is the Privacy Policy to give Facebook, Instagram and search
  advertising. It covers inquiries, lead forms, sharing, retention, rights,
  and how to request deletion. Have it reviewed by a lawyer for the states
  and countries you advertise in.
- Meta Pixel: set `metaPixelId` in `app/business-data.ts`. That one value
  turns on the "Advertising choices" notice (`app/AdConsent.tsx`), loads the
  pixel only after Accept (never with a Global Privacy Control signal), counts
  a `Lead` when the inquiry form is delivered, and switches the Privacy Policy
  to its "pixel in use" wording. While it is empty none of this runs.
- Meta domain verification: put the code from Business settings > Domains in
  `metaDomainVerification`; it is published as a meta tag in every page.
- `/refund-and-cancellation` follows the owner's existing policy on his other
  publishing site: terms are set in each project agreement, no universal
  refund deadline is advertised.
- Search basics are in place: one canonical URL per page, `sitemap.xml`,
  `robots.txt`, Open Graph and X card tags, and Organization structured data.

## Hosting notes

### GitHub Pages (static copy)

```bash
pnpm build
node scripts/export-static.mjs site
```

This renders the homepage and the 20 content pages to `site/` together with
`sitemap.xml`, `robots.txt`, `404.html`, `CNAME`, and `.nojekyll`. The
workflow in `.github/workflows/pages.yml` runs the tests and publishes that
folder on every push to `main`. GitHub Pages must be enabled for the
repository with "GitHub Actions" as the source, and on a free GitHub plan the
repository has to be public.

Limits of the static copy: the 15 legacy path redirects in
`app/site-redirects.ts` are not served, and there is no server code, so the
inquiry form can only open the visitor's email app.

### Server build

`pnpm build` produces a Cloudflare Worker bundle (`dist/server/index.js`) plus
static client assets. It is not an ordinary Node HTTP server. Running it on
the GoDaddy VPS needs a tested Node entry or adapter, a dedicated non-root
user, a loopback port, and an Nginx or Apache reverse proxy with HTTPS for
this domain only. A server is also what direct inbox delivery for the inquiry
form requires.

`.openai/hosting.json` is read by the build config; its project id is empty.

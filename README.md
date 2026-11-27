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
| Source rebrand | Done, 38 tests pass on a fresh build |
| GitHub repository | `Sheldon-1997/amzpublishingpro` (public) |
| Live site | Published with GitHub Pages at http://amzpublishingpro.com/ on 27 November 2026 |
| HTTPS | Certificate requested by GitHub Pages; turn on "Enforce HTTPS" in Settings > Pages once it is issued |
| DNS (GoDaddy) | Four apex A records to GitHub Pages, `www` CNAME to `sheldon-1997.github.io` |
| Inquiry form server delivery | **Not done** (form opens the visitor's email app) |
| `info@amzpublishingpro.com` mailbox | **Does not exist yet** (no MX record on the domain) |
| Node build for a VPS | **Not done** (only needed for a server-side form or the legacy redirects) |

## Requirements

- Node.js `>=22.13.0`
- pnpm 10 or 11

## Commands

```bash
pnpm install --frozen-lockfile
pnpm dev          # local preview
pnpm test         # production build + 38 tests
pnpm lint
```

Keep `pnpm-lock.yaml` as committed. Do not upgrade the framework or
dependencies as part of unrelated work.

## Where things live

- `app/business-data.ts` — the single record of brand name, domain, email,
  phone, address, trust wording, and Organization structured data. Change the
  phone number or email here and nowhere else.
- `app/site-data.ts` — services and the 20 content pages (including Terms and
  Privacy).
- `app/PublishingSite.tsx` — homepage, header, footer, gallery, inquiry form,
  hero animation markup.
- `app/globals.css` — all styling, including the hero animation keyframes.
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

Festive seasons change the header, accent colours, hero tints, show a greeting
ribbon, and run a light canvas effect (snow, leaves, confetti, hearts, or
sparks). Days of remembrance show a single line only. The visitor can close
the ribbon, which also stops the effect and restores the normal colours for
that browser session. Effects never run for visitors who prefer reduced motion.

Preview any theme with `?season=<id>`, for example
`/?season=holiday-season`, or turn it off with `/?season=off`.

Greetings are not promotions. To announce a real offer, put its exact wording
in that season's `offer` field; a test fails if a default greeting mentions a
sale, discount, or deal.

## Hero animation

The finished book in the hero is a CSS 3D object (`.book3d`: cover, spine,
page block, back). It starts dim inside the FINISHED BOOK opening, comes
forward over the lip, grows, and turns to face the viewer. The whole scene
leans a few degrees toward the pointer on desktop. Gallery covers swing open
on hover, and sections rise into view on scroll in browsers that support
scroll-driven animations.

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

- The Privacy notice states that no Meta Pixel, Conversions API, analytics, or
  advertising cookies are in use. Update it, and add any consent choices the
  law requires, before adding a tracking tag.
- The inquiry form must deliver to a working inbox first.

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

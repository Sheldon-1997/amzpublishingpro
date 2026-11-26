// Writes a static copy of the built site for static hosts such as GitHub Pages.
//
// Usage: pnpm build && node scripts/export-static.mjs [output-dir]
//
// Every canonical page is rendered once through the built server entry and
// saved as <slug>.html, so /about is served without a trailing slash. Legacy
// path redirects from app/site-redirects.ts need a real server and are not
// part of the static copy.
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = resolve(process.argv[2] ?? join(projectRoot, "site"));
const clientDir = join(projectRoot, "dist", "client");
const serverEntry = join(projectRoot, "dist", "server", "index.js");

if (!existsSync(serverEntry)) {
  throw new Error("dist/server/index.js is missing. Run `pnpm build` first.");
}

const { default: worker } = await import(pathToFileURL(serverEntry).href);
const env = { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } };
const context = { waitUntil() {}, passThroughOnException() {} };

async function render(origin, pathname) {
  return worker.fetch(new Request(`${origin}${pathname}`, { headers: { accept: "text/html" } }), env, context);
}

// The sitemap is the list of canonical pages; it also tells us the origin.
const probe = await (await render("https://localhost", "/sitemap.xml")).text();
const locations = [...probe.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1]));
if (!locations.length) throw new Error("The sitemap returned no pages.");
const origin = locations[0].origin;
const domain = locations[0].hostname;

rmSync(outputDir, { recursive: true, force: true });
mkdirSync(outputDir, { recursive: true });

const skipped = new Set(["_headers", ".assetsignore", ".vite", "vinext-client-entry-manifest.json"]);
for (const entry of readdirSync(clientDir)) {
  if (skipped.has(entry)) continue;
  cpSync(join(clientDir, entry), join(outputDir, entry), { recursive: true });
}

const written = [];
for (const location of locations) {
  const pathname = location.pathname.replace(/\/$/, "") || "/";
  const response = await render(origin, pathname);
  if (response.status !== 200) throw new Error(`${pathname} returned ${response.status}`);
  const file = pathname === "/" ? "index.html" : `${pathname.slice(1)}.html`;
  writeFileSync(join(outputDir, file), await response.text());
  written.push(file);
}

for (const file of ["sitemap.xml", "robots.txt"]) {
  const response = await render(origin, `/${file}`);
  if (response.status !== 200) throw new Error(`/${file} returned ${response.status}`);
  writeFileSync(join(outputDir, file), await response.text());
  written.push(file);
}

const notFound = await render(origin, "/this-page-does-not-exist");
if (notFound.status !== 404) throw new Error(`The not-found page returned ${notFound.status}`);
writeFileSync(join(outputDir, "404.html"), await notFound.text());
written.push("404.html");

// GitHub Pages: serve folders that start with an underscore, and bind the domain.
writeFileSync(join(outputDir, ".nojekyll"), "");
writeFileSync(join(outputDir, "CNAME"), `${domain}\n`);

console.log(`Static site written to ${outputDir}`);
console.log(`${written.length} documents for ${domain}: ${written.join(", ")}`);

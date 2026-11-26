import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import test from "node:test";

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

const expectedGenres = [
  "Fiction",
  "Nonfiction",
  "Memoir & Biography",
  "Romance",
  "Mystery & Thriller",
  "Fantasy & Science Fiction",
  "Children's",
  "Self Help & Wellness",
  "Food & Lifestyle",
  "Sports & Business",
];

test("the sample cover catalog has four pinned original covers for every genre", async () => {
  const { catalogCovers, catalogGenres, coversByGenre } = await import("../app/cover-catalog.ts");

  assert.deepEqual(catalogGenres, expectedGenres);
  assert.equal(catalogCovers.length, 40);
  assert.equal(new Set(catalogCovers.map((cover) => cover.id)).size, catalogCovers.length);
  assert.equal(new Set(catalogCovers.map((cover) => cover.image)).size, catalogCovers.length);
  assert.equal(new Set(catalogCovers.map((cover) => cover.title)).size, catalogCovers.length);

  for (const genre of expectedGenres) {
    const covers = coversByGenre[genre];
    assert.equal(covers.length, 4, `${genre} must have four sample covers`);
    assert.ok(covers.every((cover) => cover.genre === genre));
  }

  for (const cover of catalogCovers) {
    assert.ok(cover.title.trim().length > 0);
    assert.equal(cover.width, 640);
    assert.equal(cover.height, 960);
    assert.match(cover.image, /^\/sample-covers\/[a-z0-9-]+\.webp$/);
    assert.ok(!("creator" in cover), "sample covers must not carry an author credit");

    const imagePath = join(projectRoot, "public", cover.image.replace(/^\//, ""));
    assert.ok(existsSync(imagePath), `${cover.image} must exist`);
    const digest = createHash("sha256").update(readFileSync(imagePath)).digest("hex").toUpperCase();
    assert.equal(digest, cover.sha256, `${cover.image} must match its pinned bytes`);
  }
});

test("the public folder ships only the sample covers listed in the catalog", async () => {
  const { catalogCovers } = await import("../app/cover-catalog.ts");
  const shipped = readdirSync(join(projectRoot, "public", "sample-covers")).sort();
  const listed = catalogCovers.map((cover) => cover.image.replace("/sample-covers/", "")).sort();
  assert.deepEqual(shipped, listed);

  for (const removed of ["books", "books-expanded", "hero-books", "book-visuals", "social"]) {
    assert.ok(!existsSync(join(projectRoot, "public", removed)), `public/${removed} must stay removed`);
  }
});

test("the hero manifest uses ten distinct catalog covers across ten distinct genres", async () => {
  const { catalogCovers, catalogGenres } = await import("../app/cover-catalog.ts");
  const { heroPublishingCovers } = await import("../app/hero-publishing-covers.ts");

  assert.equal(heroPublishingCovers.length, 10);
  assert.equal(new Set(heroPublishingCovers.map((cover) => cover.src)).size, 10);
  assert.deepEqual(
    heroPublishingCovers.map((cover) => cover.genre).sort(),
    [...catalogGenres].sort(),
  );

  for (const cover of heroPublishingCovers) {
    assert.equal(cover.manuscriptTitle, cover.title.toUpperCase());
    assert.ok(
      catalogCovers.some((entry) => (
        entry.image === cover.src
        && entry.title === cover.title
        && entry.genre === cover.genre
        && entry.width === cover.width
        && entry.height === cover.height
      )),
      `${cover.src} must match the cover catalog`,
    );
  }
});

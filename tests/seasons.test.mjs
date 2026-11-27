import assert from "node:assert/strict";
import test from "node:test";
import vm from "node:vm";

const { resolveSeason, seasonBootstrapScript, seasonById, seasonIds, seasons } = await import("../app/seasons.ts");

test("United States occasions resolve to the right season by calendar date", () => {
  const cases = [
    ["2026-11-22", null],
    ["2026-11-23", "thanksgiving"],
    ["2026-11-26", "thanksgiving"],
    ["2026-11-27", "black-friday"],
    ["2026-11-29", "black-friday"],
    ["2026-11-30", "cyber-monday"],
    ["2026-12-01", "holiday-season"],
    ["2026-12-25", "holiday-season"],
    ["2026-12-26", "new-year"],
    ["2027-01-01", "new-year"],
    ["2027-01-02", "new-year"],
    ["2027-01-03", null],
    ["2027-01-18", "mlk-day"],
    ["2027-01-19", null],
    ["2027-02-08", "valentines"],
    ["2027-02-14", "valentines"],
    ["2027-02-15", "presidents-day"],
    ["2027-03-10", null],
    ["2027-05-29", "memorial-day"],
    ["2027-05-31", "memorial-day"],
    ["2027-06-19", "juneteenth"],
    ["2027-07-01", "independence-day"],
    ["2027-07-04", "independence-day"],
    ["2027-07-05", null],
    ["2027-09-06", "labor-day"],
    ["2027-10-23", null],
    ["2027-10-31", "halloween"],
    ["2027-11-11", "veterans-day"],
    ["2027-11-25", "thanksgiving"],
    ["2027-11-26", "black-friday"],
    // Latest possible Thanksgiving: Cyber Monday falls in December.
    ["2024-11-28", "thanksgiving"],
    ["2024-12-01", "black-friday"],
    ["2024-12-02", "cyber-monday"],
    ["2024-12-03", "holiday-season"],
  ];
  for (const [iso, expected] of cases) {
    const [year, month, day] = iso.split("-").map(Number);
    assert.equal(resolveSeason(year, month, day), expected, iso);
  }
});

test("every season has a greeting, no default offer, and a known effect", () => {
  assert.equal(seasons.length, 14);
  assert.equal(new Set(seasonIds).size, 14);
  for (const season of seasons) {
    assert.ok(season.message.length > 10 && season.message.length < 110, `${season.id} greeting length`);
    assert.equal(season.offer, "", `${season.id} must not announce an offer until a real one is supplied`);
    assert.ok(["none", "snow", "leaves", "confetti", "hearts", "sparks"].includes(season.effect));
    if (season.tone === "quiet") assert.equal(season.effect, "none", `${season.id} is a quiet day with no effect`);
    else assert.ok(season.effectColors.length > 0, `${season.id} needs effect colours`);
    assert.equal(seasonById(season.id), season);
  }
  for (const quiet of ["mlk-day", "memorial-day", "juneteenth", "veterans-day"]) {
    assert.equal(seasonById(quiet).tone, "quiet", `${quiet} is observed quietly`);
  }
  assert.equal(seasonById("nope"), null);
});

function runBootstrap(search, { dismissed = null, now = "2026-07-20T18:00:00Z" } = {}) {
  const attributes = new Map();
  const RealDate = Date;
  class FixedDate extends RealDate {
    constructor(...args) { super(...(args.length ? args : [now])); }
    static now() { return new RealDate(now).getTime(); }
  }
  vm.runInNewContext(seasonBootstrapScript(), {
    document: { documentElement: { setAttribute: (name, value) => attributes.set(name, value) } },
    location: { search },
    sessionStorage: { getItem: () => dismissed },
    URLSearchParams,
    Intl,
    Date: FixedDate,
    parseInt,
    JSON,
    Math,
  });
  return attributes;
}

test("the head script applies the date, honours previews, and remembers a dismissal", () => {
  assert.equal(runBootstrap("").get("data-season"), undefined, "an ordinary day has no season");
  assert.equal(runBootstrap("", { now: "2026-11-27T18:00:00Z" }).get("data-season"), "black-friday");
  assert.equal(runBootstrap("", { now: "2026-12-24T18:00:00Z" }).get("data-season"), "holiday-season");
  // 03:00 UTC on 1 January is still 31 December in US Central time.
  assert.equal(runBootstrap("", { now: "2027-01-03T03:00:00Z" }).get("data-season"), "new-year");
  assert.equal(runBootstrap("", { now: "2027-01-03T07:00:00Z" }).get("data-season"), undefined);

  assert.equal(runBootstrap("?season=holiday-season").get("data-season"), "holiday-season");
  assert.equal(runBootstrap("?season=off", { now: "2026-11-27T18:00:00Z" }).get("data-season"), undefined);
  assert.equal(runBootstrap("?season=<script>", { now: "2026-11-27T18:00:00Z" }).get("data-season"), "black-friday", "unknown preview values are ignored");

  const dismissed = runBootstrap("", { now: "2026-11-27T18:00:00Z", dismissed: "black-friday" });
  assert.ok(dismissed.has("data-season-dismissed"));
  assert.ok(!runBootstrap("", { now: "2026-11-27T18:00:00Z", dismissed: "thanksgiving" }).has("data-season-dismissed"));
});

test("seasons never replace the brand palette", async () => {
  const { readFile } = await import("node:fs/promises");
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  const seasonal = [...css.matchAll(/html\[data-season[^\]]*\][^{]*\{([^}]*)\}/g)].map((match) => match[1]).join("\n");
  assert.ok(seasonal.includes("--season-ribbon-accent"));
  assert.doesNotMatch(seasonal, /--(header|teal|teal-mid|teal-deep|blue|cta-start|cta-end)\s*:/, "a season must not recolour the header, links or buttons");
  assert.doesNotMatch(seasonal, /#000\b|#0b0b0e/i, "no black theme");
});

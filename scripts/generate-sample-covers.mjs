// Generates the original sample cover concepts used by the portfolio and the
// hero animation. Every cover is drawn here from scratch: no third-party
// artwork, titles, or author names. Titles are invented for the samples.
//
// Usage (sharp must be resolvable from the working directory):
//   node scripts/generate-sample-covers.mjs <output-dir> [manifest.json]
//
// The script writes one WebP per cover and prints/writes a JSON manifest with
// id, genre, title, file name, width, height, and sha256.
import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join, resolve } from "node:path";

const require = createRequire(join(process.cwd(), "noop.js"));
const sharp = require("sharp");

const W = 640;
const H = 960;
const esc = (value) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function rng(seed) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function text(lines, { font, size, fill, x = W / 2, y, anchor = "middle", weight = 700, ls = 0, lh = 1.1, italic = false, upper = false, opacity = 1 }) {
  return lines.map((line, index) => (
    `<text x="${x}" y="${y + index * size * lh}" font-family="${font}" font-weight="${weight}" font-size="${size}" fill="${fill}" text-anchor="${anchor}" letter-spacing="${ls}"${italic ? ' font-style="italic"' : ""}${opacity < 1 ? ` opacity="${opacity}"` : ""}>${esc(upper ? line.toUpperCase() : line)}</text>`
  )).join("");
}

function author(fill, y = H - 64, opts = {}) {
  return text(["AUTHOR NAME"], { font: "Montserrat", size: 21, weight: 600, ls: 7, fill, y, ...opts });
}

function rect(fill) { return `<rect width="${W}" height="${H}" fill="${fill}"/>`; }
function grad(id, stops, x2 = 0, y2 = 1) {
  return `<defs><linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">${stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join("")}</linearGradient></defs><rect width="${W}" height="${H}" fill="url(#${id})"/>`;
}
function wave(y, amp, len, fill, phase = 0) {
  let d = `M0 ${H} L0 ${y}`;
  for (let x = 0; x <= W; x += 8) d += ` L${x} ${(y + Math.sin((x / len) * Math.PI * 2 + phase) * amp).toFixed(1)}`;
  return `<path d="${d} L${W} ${H} Z" fill="${fill}"/>`;
}
function stars(seed, count, fill, maxY = H * 0.6, maxR = 2.6) {
  const r = rng(seed);
  let out = "";
  for (let i = 0; i < count; i += 1) out += `<circle cx="${(r() * W).toFixed(1)}" cy="${(r() * maxY).toFixed(1)}" r="${(0.8 + r() * maxR).toFixed(1)}" fill="${fill}" opacity="${(0.45 + r() * 0.55).toFixed(2)}"/>`;
  return out;
}

const covers = [
  // ---------------------------------------------------------------- Fiction
  {
    id: "fiction-01", genre: "Fiction", title: "A Quiet Street",
    draw() {
      const r = rng(11);
      let houses = "";
      let x = -10;
      while (x < W) {
        const w = 70 + r() * 60; const h = 120 + r() * 110; const top = H - 150 - h;
        houses += `<rect x="${x}" y="${top}" width="${w}" height="${h + 160}" fill="#141b30"/>`;
        houses += `<path d="M${x - 6} ${top} L${x + w / 2} ${top - 46} L${x + w + 6} ${top} Z" fill="#141b30"/>`;
        for (let wy = top + 26; wy < top + h - 30; wy += 46) {
          for (let wx = x + 14; wx < x + w - 22; wx += 30) {
            if (r() > 0.42) houses += `<rect x="${wx}" y="${wy}" width="14" height="22" fill="#ffd27a" opacity="${(0.6 + r() * 0.4).toFixed(2)}"/>`;
          }
        }
        x += w + 4;
      }
      return grad("g", [[0, "#1c2542"], [0.55, "#51466e"], [0.8, "#d9825a"], [1, "#f0b27a"]])
        + stars(3, 40, "#fff7e0", 420)
        + `<circle cx="470" cy="330" r="46" fill="#fff3d1"/>`
        + houses
        + text(["A Quiet", "Street"], { font: "Cardo", size: 88, fill: "#fff3d1", y: 150, lh: 1.05 })
        + author("#f6dcb8", H - 46);
    },
  },
  {
    id: "fiction-02", genre: "Fiction", title: "The Salt Orchard",
    draw() {
      let trees = "";
      const colors = ["#7c8f5a", "#9aa86e", "#5f7347", "#b9c08a"];
      for (let row = 0; row < 4; row += 1) {
        for (let col = 0; col < 4; col += 1) {
          const cx = 116 + col * 136; const cy = 150 + row * 128;
          const special = row === 2 && col === 1;
          trees += `<rect x="${cx - 4}" y="${cy + 30}" width="8" height="38" fill="#6b4f3a"/>`;
          trees += `<circle cx="${cx}" cy="${cy}" r="46" fill="${special ? "#c9553a" : colors[(row * 3 + col) % colors.length]}"/>`;
        }
      }
      return rect("#f3ead9") + trees
        + `<rect x="60" y="668" width="520" height="3" fill="#2f3d2a"/>`
        + text(["The Salt", "Orchard"], { font: "Gelasio", size: 86, fill: "#2f3d2a", y: 762, lh: 1.04 })
        + author("#6b4f3a", H - 44);
    },
  },
  {
    id: "fiction-03", genre: "Fiction", title: "Paper Lanterns at Noon",
    draw() {
      const r = rng(31);
      let out = "";
      const palette = ["#ffd76a", "#fff1cf", "#f7a35c", "#ffe9a3"];
      for (let s = 0; s < 4; s += 1) {
        const y0 = 70 + s * 105; const sag = 34;
        let d = `M-10 ${y0}`;
        d += ` Q${W / 2} ${y0 + sag * 2} ${W + 10} ${y0}`;
        out += `<path d="${d}" fill="none" stroke="#6e1c14" stroke-width="3"/>`;
        for (let i = 0; i < 5; i += 1) {
          const t = (i + 0.5 + (s % 2) * 0.35) / 5.4;
          const x = t * W; const y = y0 + sag * 4 * t * (1 - t) * 1.0 + 8;
          const rad = 26 + r() * 12;
          out += `<line x1="${x}" y1="${y - 6}" x2="${x}" y2="${y + 8}" stroke="#6e1c14" stroke-width="3"/>`;
          out += `<ellipse cx="${x}" cy="${y + 8 + rad}" rx="${rad * 0.82}" ry="${rad}" fill="${palette[(i + s) % palette.length]}"/>`;
          out += `<rect x="${x - rad * 0.3}" y="${y + 4}" width="${rad * 0.6}" height="7" fill="#6e1c14"/>`;
        }
      }
      return rect("#c8412f") + out
        + text(["Paper", "Lanterns", "at Noon"], { font: "Poppins", size: 78, fill: "#fff1cf", y: 640, lh: 1.08, weight: 700 })
        + author("#ffd76a", H - 44);
    },
  },
  {
    id: "fiction-04", genre: "Fiction", title: "What the River Kept",
    draw() {
      let bands = "";
      const tones = ["#15566b", "#1f7187", "#3b93a6", "#74b9c4", "#b6dcdc"];
      tones.forEach((tone, i) => {
        let d = "";
        const off = 330 + i * 96;
        for (let y = 0; y <= H; y += 10) {
          const x = off - y * 0.34 + Math.sin(y / 95 + i * 0.7) * 46;
          d += `${y === 0 ? "M" : "L"}${x.toFixed(1)} ${y}`;
        }
        bands += `<path d="${d} L${W + 400} ${H} L${W + 400} 0 Z" fill="${tone}"/>`;
      });
      return rect("#0f3b4c") + bands
        + `<rect x="0" y="0" width="${W}" height="${H}" fill="#0f3b4c" opacity="0.18"/>`
        + text(["What", "the River", "Kept"], { font: "Lora", size: 84, fill: "#f4efe2", x: 54, y: 170, anchor: "start", italic: true, weight: 500, lh: 1.12 })
        + author("#0f3b4c", H - 50, { x: W - 54, anchor: "end" });
    },
  },
  // ------------------------------------------------------------- Nonfiction
  {
    id: "nonfiction-01", genre: "Nonfiction", title: "Common Ground",
    draw() {
      return rect("#f4f1ea")
        + `<g style="mix-blend-mode:multiply"><circle cx="240" cy="560" r="210" fill="#e0533d"/><circle cx="410" cy="560" r="210" fill="#2b4aa0" opacity="0.88"/></g>`
        + text(["Common", "Ground"], { font: "Archivo Black", size: 96, fill: "#15161a", x: 52, y: 170, anchor: "start", weight: 400, lh: 1.02 })
        + `<rect x="54" y="312" width="120" height="8" fill="#15161a"/>`
        + author("#15161a", H - 56, { x: 54, anchor: "start" });
    },
  },
  {
    id: "nonfiction-02", genre: "Nonfiction", title: "The Shape of Small Towns",
    draw() {
      const r = rng(52);
      let out = "";
      for (let row = 0; row < 5; row += 1) {
        for (let col = 0; col < 6; col += 1) {
          const x = 62 + col * 90; const y = 96 + row * 86;
          const kind = Math.floor(r() * 3);
          const lit = r() > 0.82;
          const stroke = lit ? "#f2b84b" : "#dfe7ee";
          if (kind === 0) out += `<path d="M${x} ${y + 50} V${y + 20} L${x + 25} ${y} L${x + 50} ${y + 20} V${y + 50} Z" fill="${lit ? "#f2b84b" : "none"}" stroke="${stroke}" stroke-width="3"/>`;
          else if (kind === 1) out += `<rect x="${x}" y="${y + 6}" width="50" height="44" fill="${lit ? "#f2b84b" : "none"}" stroke="${stroke}" stroke-width="3"/>`;
          else out += `<path d="M${x} ${y + 50} V${y + 14} H${x + 22} V${y} H${x + 50} V${y + 50} Z" fill="${lit ? "#f2b84b" : "none"}" stroke="${stroke}" stroke-width="3"/>`;
        }
      }
      return rect("#213547") + out
        + text(["The Shape", "of Small", "Towns"], { font: "Montserrat", size: 72, fill: "#ffffff", x: 60, y: 640, anchor: "start", weight: 800, lh: 1.1 })
        + author("#f2b84b", H - 50, { x: 60, anchor: "start" });
    },
  },
  {
    id: "nonfiction-03", genre: "Nonfiction", title: "Maps We Never Drew",
    draw() {
      let out = "";
      for (let i = 0; i < 13; i += 1) {
        const rad = 30 + i * 30;
        let d = "";
        for (let a = 0; a <= 360; a += 6) {
          const t = (a * Math.PI) / 180;
          const wobble = 1 + 0.12 * Math.sin(t * 3 + i * 0.35) + 0.07 * Math.cos(t * 5 - i * 0.5);
          const x = 400 + Math.cos(t) * rad * wobble * 1.05; const y = 330 + Math.sin(t) * rad * wobble * 0.86;
          d += `${a === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
        }
        out += `<path d="${d} Z" fill="none" stroke="#8a5a36" stroke-width="${i % 4 === 0 ? 3.2 : 1.6}" opacity="0.85"/>`;
      }
      return rect("#e9e2d0") + `<g>${out}</g>`
        + `<rect x="0" y="640" width="${W}" height="320" fill="#e9e2d0"/>`
        + `<rect x="56" y="664" width="528" height="3" fill="#3b2a1c"/>`
        + text(["Maps We", "Never Drew"], { font: "Bitter", size: 78, fill: "#3b2a1c", x: 56, y: 760, anchor: "start", weight: 700, lh: 1.08 })
        + author("#8a5a36", H - 44, { x: 56, anchor: "start" });
    },
  },
  {
    id: "nonfiction-04", genre: "Nonfiction", title: "Notes on Slow Weather",
    draw() {
      const r = rng(77);
      let out = "";
      for (let i = 0; i < 16; i += 1) {
        const y = 420 + i * 26; const w = 120 + r() * 400; const x = 60 + r() * (520 - w);
        out += `<rect x="${x.toFixed(0)}" y="${y}" width="${w.toFixed(0)}" height="12" rx="6" fill="${i % 5 === 2 ? "#e2725b" : "#41597a"}" opacity="${(0.55 + r() * 0.45).toFixed(2)}"/>`;
      }
      return rect("#dfe8ee") + out
        + text(["Notes", "on Slow", "Weather"], { font: "DM Sans", size: 86, fill: "#1d2b3a", x: 58, y: 150, anchor: "start", weight: 700, lh: 1.04, ls: -2 })
        + author("#41597a", H - 48, { x: 58, anchor: "start" });
    },
  },
  // ----------------------------------------------------- Memoir & Biography
  {
    id: "memoir-01", genre: "Memoir & Biography", title: "The Long Road Back",
    draw() {
      return grad("g", [[0, "#f6c98a"], [0.45, "#ee9a6b"], [0.62, "#c96a5a"]])
        + `<circle cx="320" cy="596" r="120" fill="#fff0c9"/>`
        + `<rect x="0" y="596" width="${W}" height="364" fill="#3a2b3a"/>`
        + `<path d="M0 596 Q160 560 320 596 T640 596 V640 H0 Z" fill="#4a3548"/>`
        + `<path d="M300 600 L340 600 L560 960 L80 960 Z" fill="#241a26"/>`
        + [0, 1, 2, 3, 4].map((i) => { const t = (i + 0.6) / 5; const y = 610 + t * t * 340; const w = 3 + t * 12; const h = 12 + t * 46; return `<rect x="${320 - w / 2}" y="${y}" width="${w}" height="${h}" fill="#f6c98a"/>`; }).join("")
        + text(["The Long", "Road Back"], { font: "Cardo", size: 84, fill: "#3a2b3a", y: 170, weight: 700, lh: 1.06 })
        + author("#3a2b3a", 330);
    },
  },
  {
    id: "memoir-02", genre: "Memoir & Biography", title: "Kitchen Table Years",
    draw() {
      let check = "";
      for (let i = 0; i < 9; i += 1) {
        check += `<rect x="${i * 80 - 20}" y="560" width="40" height="400" fill="#c44b3c" opacity="0.5"/>`;
        check += `<rect x="0" y="${560 + i * 80 - 20 + 20}" width="${W}" height="40" fill="#c44b3c" opacity="0.5"/>`;
      }
      return rect("#f0e4d0")
        + `<rect x="0" y="560" width="${W}" height="400" fill="#f7efe2"/>` + check
        + `<ellipse cx="320" cy="640" rx="150" ry="52" fill="#fbf7ef" stroke="#3d2f25" stroke-width="4"/>`
        + `<ellipse cx="320" cy="634" rx="98" ry="30" fill="none" stroke="#3d2f25" stroke-width="3"/>`
        + `<path d="M430 520 q22 -30 0 -60 q-22 -30 0 -60" fill="none" stroke="#b08a66" stroke-width="5" stroke-linecap="round"/>`
        + `<path d="M210 520 q22 -30 0 -60 q-22 -30 0 -60" fill="none" stroke="#b08a66" stroke-width="5" stroke-linecap="round" opacity="0.6"/>`
        + text(["Kitchen", "Table", "Years"], { font: "Gelasio", size: 88, fill: "#3d2f25", y: 138, weight: 700, lh: 1.03 })
        + `<rect x="170" y="806" width="300" height="60" fill="#f0e4d0"/>`
        + author("#3d2f25", 846);
    },
  },
  {
    id: "memoir-03", genre: "Memoir & Biography", title: "Forty Winters",
    draw() {
      let rings = "";
      for (let i = 1; i <= 40; i += 1) {
        const rad = i * 8.4;
        rings += `<ellipse cx="${330 + Math.sin(i / 5) * 6}" cy="${560 + Math.cos(i / 7) * 5}" rx="${rad * 1.04}" ry="${rad}" fill="none" stroke="#51677a" stroke-width="${i % 10 === 0 ? 3.4 : 1.3}" opacity="${i % 10 === 0 ? 1 : 0.7}"/>`;
      }
      return rect("#e8eef2") + rings
        + `<rect x="0" y="0" width="${W}" height="300" fill="#e8eef2"/>`
        + `<rect x="0" y="850" width="${W}" height="110" fill="#e8eef2"/>`
        + text(["Forty", "Winters"], { font: "Lora", size: 98, fill: "#22313f", y: 150, weight: 600, lh: 1.04 })
        + author("#51677a", H - 44);
    },
  },
  {
    id: "memoir-04", genre: "Memoir & Biography", title: "Her Name Was Marguerite",
    draw() {
      let petals = "";
      for (let i = 0; i < 16; i += 1) petals += `<ellipse cx="320" cy="280" rx="15" ry="64" fill="#f7f1e6" transform="rotate(${i * 22.5} 320 350)"/>`;
      return rect("#3c2a3f")
        + `<ellipse cx="320" cy="350" rx="206" ry="262" fill="none" stroke="#d1a85a" stroke-width="5"/>`
        + `<ellipse cx="320" cy="350" rx="190" ry="246" fill="none" stroke="#d1a85a" stroke-width="1.5"/>`
        + petals + `<circle cx="320" cy="350" r="30" fill="#e3b548"/>`
        + `<path d="M320 420 Q300 520 330 600" fill="none" stroke="#7fa06e" stroke-width="6" stroke-linecap="round"/>`
        + text(["Her Name Was", "Marguerite"], { font: "Crimson Text", size: 74, fill: "#f7f1e6", y: 730, italic: true, weight: 600, lh: 1.1 })
        + author("#d1a85a", H - 50);
    },
  },
  // ---------------------------------------------------------------- Romance
  {
    id: "romance-01", genre: "Romance", title: "Letters in June",
    draw() {
      const heart = (cx, cy, s, fill) => `<path transform="translate(${cx} ${cy}) scale(${s})" d="M0 10 C-22 -10 -12 -28 0 -14 C12 -28 22 -10 0 10 Z" fill="${fill}"/>`;
      return rect("#f7d9d0")
        + `<g transform="rotate(-6 320 560)"><rect x="120" y="440" width="400" height="260" rx="6" fill="#fffaf3" stroke="#b5554e" stroke-width="4"/>`
        + `<path d="M120 444 L320 590 L520 444" fill="none" stroke="#b5554e" stroke-width="4"/>`
        + `<path d="M120 700 L270 556 M520 700 L370 556" fill="none" stroke="#b5554e" stroke-width="2.5" opacity="0.6"/>`
        + heart(320, 596, 2.4, "#c8413f") + `</g>`
        + heart(120, 360, 1.1, "#e79a94") + heart(540, 400, 0.9, "#e79a94") + heart(500, 800, 1.3, "#e79a94") + heart(110, 790, 0.8, "#e79a94")
        + text(["Letters"], { font: "TeX Gyre Chorus", size: 150, fill: "#8f2f3a", y: 190, weight: 400 })
        + text(["in June"], { font: "Lora", size: 62, fill: "#8f2f3a", y: 280, weight: 500, italic: true })
        + author("#8f2f3a", H - 48);
    },
  },
  {
    id: "romance-02", genre: "Romance", title: "The Lighthouse Promise",
    draw() {
      return grad("g", [[0, "#3f4f8c"], [0.5, "#b8789a"], [0.78, "#f6b89a"]])
        + stars(8, 26, "#fff4dc", 300)
        + `<path d="M356 372 L640 250 L640 470 Z" fill="#fff4dc" opacity="0.28"/>`
        + `<path d="M300 372 L0 300 L0 430 Z" fill="#fff4dc" opacity="0.16"/>`
        + `<path d="M296 400 L360 400 L384 760 L272 760 Z" fill="#fbf3ea"/>`
        + `<path d="M287 520 L369 520 L376 610 L280 610 Z" fill="#c8413f"/>`
        + `<rect x="290" y="346" width="76" height="54" fill="#2a2f52"/><rect x="306" y="356" width="44" height="34" fill="#ffe08a"/>`
        + `<path d="M284 346 L328 306 L372 346 Z" fill="#2a2f52"/>`
        + wave(740, 12, 180, "#2f3f78") + wave(790, 14, 220, "#27345f", 1.4) + wave(850, 10, 160, "#1e2848", 2.6)
        + text(["The Lighthouse", "Promise"], { font: "Cardo", size: 70, fill: "#fff4dc", y: 130, weight: 700, lh: 1.1 })
        + author("#f6b89a", H - 44);
    },
  },
  {
    id: "romance-03", genre: "Romance", title: "Second Summer",
    draw() {
      return rect("#ffcf70")
        + `<circle cx="320" cy="500" r="190" fill="#f26a4f"/>`
        + `<circle cx="320" cy="500" r="232" fill="none" stroke="#f26a4f" stroke-width="5" stroke-dasharray="4 26" stroke-linecap="round"/>`
        + wave(590, 16, 210, "#19808a") + wave(660, 14, 170, "#136670", 1.2) + wave(730, 12, 240, "#0d4f58", 2.2)
        + text(["Second", "Summer"], { font: "Poppins", size: 96, fill: "#0d4f58", y: 136, weight: 700, lh: 1.02, ls: -2 })
        + author("#ffcf70", H - 60);
    },
  },
  {
    id: "romance-04", genre: "Romance", title: "Tea at Half Past Four",
    draw() {
      return rect("#d8e6dc")
        + `<ellipse cx="320" cy="668" rx="210" ry="34" fill="#f9f5ec" stroke="#34564a" stroke-width="4"/>`
        + `<path d="M190 500 H450 Q450 650 320 656 Q190 650 190 500 Z" fill="#f9f5ec" stroke="#34564a" stroke-width="4"/>`
        + `<path d="M450 526 Q520 530 510 580 Q500 624 436 610" fill="none" stroke="#34564a" stroke-width="12" stroke-linecap="round"/>`
        + `<ellipse cx="320" cy="500" rx="130" ry="20" fill="#b9793f" stroke="#34564a" stroke-width="4"/>`
        + `<path d="M270 440 q26 -34 0 -68 q-26 -34 0 -68 M330 450 q26 -34 0 -68 q-26 -34 0 -68 M390 440 q26 -34 0 -68 q-26 -34 0 -68" fill="none" stroke="#e58f8a" stroke-width="7" stroke-linecap="round" opacity="0.85"/>`
        + text(["Tea at", "Half Past Four"], { font: "Gelasio", size: 74, fill: "#34564a", y: 130, weight: 700, lh: 1.14 })
        + author("#34564a", H - 100);
    },
  },
  // ----------------------------------------------------- Mystery & Thriller
  {
    id: "mystery-01", genre: "Mystery & Thriller", title: "The Last Witness",
    draw() {
      return rect("#0e1114")
        + `<defs><radialGradient id="glow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ffd24a" stop-opacity="0.55"/><stop offset="1" stop-color="#ffd24a" stop-opacity="0"/></radialGradient></defs>`
        + `<circle cx="320" cy="420" r="300" fill="url(#glow)"/>`
        + `<circle cx="320" cy="360" r="82" fill="#ffd24a"/><path d="M276 392 L364 392 L398 600 L242 600 Z" fill="#ffd24a"/>`
        + `<path d="M300 440 L340 440 L352 600 L288 600 Z" fill="#0e1114" opacity="0.9"/><circle cx="320" cy="398" r="20" fill="#0e1114" opacity="0.9"/>`
        + text(["THE LAST", "WITNESS"], { font: "Anton", size: 112, fill: "#f4f1e8", y: 770, weight: 400, lh: 1.06, ls: 3 })
        + author("#ffd24a", 110);
    },
  },
  {
    id: "mystery-02", genre: "Mystery & Thriller", title: "Cold Harbor Line",
    draw() {
      const r = rng(21);
      let fog = "";
      for (let i = 0; i < 26; i += 1) {
        const y = 330 + i * 22; const w = 180 + r() * 420; const x = r() * (W - w + 120) - 60;
        fog += `<rect x="${x.toFixed(0)}" y="${y}" width="${w.toFixed(0)}" height="${(4 + r() * 6).toFixed(0)}" rx="4" fill="#9db4c2" opacity="${(0.12 + r() * 0.3).toFixed(2)}"/>`;
      }
      return rect("#1c2b36") + fog
        + `<path d="M250 610 H400 L380 640 H270 Z" fill="#0c151b"/><rect x="318" y="552" width="6" height="58" fill="#0c151b"/>`
        + `<circle cx="321" cy="546" r="9" fill="#ff5a47"/><circle cx="321" cy="546" r="26" fill="#ff5a47" opacity="0.25"/>`
        + text(["COLD", "HARBOR", "LINE"], { font: "Archivo Black", size: 84, fill: "#e8eff3", x: 56, y: 120, anchor: "start", weight: 400, lh: 1.0 })
        + author("#9db4c2", H - 52, { x: 56, anchor: "start" });
    },
  },
  {
    id: "mystery-03", genre: "Mystery & Thriller", title: "Nine Minutes Late",
    draw() {
      let ticks = "";
      for (let i = 0; i < 60; i += 1) {
        const a = (i * 6 * Math.PI) / 180; const major = i % 5 === 0;
        const r1 = major ? 176 : 188; const r2 = 200;
        ticks += `<line x1="${320 + Math.sin(a) * r1}" y1="${520 - Math.cos(a) * r1}" x2="${320 + Math.sin(a) * r2}" y2="${520 - Math.cos(a) * r2}" stroke="#111" stroke-width="${major ? 6 : 2}"/>`;
      }
      const a9 = (54 * Math.PI) / 180;
      return rect("#b3261e")
        + `<circle cx="320" cy="520" r="222" fill="#f5efe4"/>` + ticks
        + `<path d="M320 520 L320 320 A200 200 0 0 1 ${320 + Math.sin(a9) * 200} ${520 - Math.cos(a9) * 200} Z" fill="#b3261e" opacity="0.85"/>`
        + `<line x1="320" y1="520" x2="320" y2="340" stroke="#111" stroke-width="9" stroke-linecap="round"/>`
        + `<line x1="320" y1="520" x2="${320 + Math.sin(a9) * 178}" y2="${520 - Math.cos(a9) * 178}" stroke="#111" stroke-width="5" stroke-linecap="round"/>`
        + `<circle cx="320" cy="520" r="13" fill="#111"/>`
        + text(["NINE MINUTES"], { font: "Anton", size: 96, fill: "#f5efe4", y: 150, weight: 400, ls: 2 })
        + text(["LATE"], { font: "Anton", size: 150, fill: "#111111", y: 900, weight: 400, ls: 8 })
        + author("#f5efe4", 216);
    },
  },
  {
    id: "mystery-04", genre: "Mystery & Thriller", title: "The Glass Alibi",
    draw() {
      const r = rng(99);
      const tones = ["#1b3a57", "#2c5b80", "#3f7fa8", "#7fb3d1", "#c9e3f0", "#14293d"];
      let shards = "";
      const cx = 360; const cy = 420;
      for (let i = 0; i < 26; i += 1) {
        const a1 = (i / 26) * Math.PI * 2; const a2 = a1 + (0.14 + r() * 0.2);
        const r1 = 30 + r() * 80; const r2 = 320 + r() * 420;
        shards += `<path d="M${cx + Math.cos(a1) * r1} ${cy + Math.sin(a1) * r1} L${cx + Math.cos(a1) * r2} ${cy + Math.sin(a1) * r2} L${cx + Math.cos(a2) * r2 * 0.9} ${cy + Math.sin(a2) * r2 * 0.9} Z" fill="${tones[Math.floor(r() * tones.length)]}" opacity="${(0.55 + r() * 0.45).toFixed(2)}"/>`;
      }
      return rect("#0d1b2a") + shards
        + `<rect x="0" y="640" width="${W}" height="320" fill="#0d1b2a" opacity="0.92"/>`
        + text(["The Glass", "Alibi"], { font: "Montserrat", size: 86, fill: "#ffffff", x: 56, y: 760, anchor: "start", weight: 800, lh: 1.06 })
        + author("#7fb3d1", H - 46, { x: 56, anchor: "start" });
    },
  },
  // ----------------------------------------------- Fantasy & Science Fiction
  {
    id: "fantasy-01", genre: "Fantasy & Science Fiction", title: "The Dragon Road",
    draw() {
      const ridge = (base, amp, fill, seed) => {
        const r = rng(seed); let d = `M0 ${H} L0 ${base}`;
        for (let x = 0; x <= W; x += 40) d += ` L${x} ${(base - r() * amp).toFixed(0)}`;
        return `<path d="${d} L${W} ${H} Z" fill="${fill}"/>`;
      };
      return grad("g", [[0, "#170d2e"], [0.6, "#4a2463"], [1, "#b0506f"]])
        + stars(5, 70, "#f6e7c1", 520)
        + `<circle cx="486" cy="360" r="70" fill="#f6e7c1"/><circle cx="170" cy="400" r="26" fill="#e9b7a0"/>`
        + ridge(600, 150, "#3a1d52", 3) + ridge(690, 120, "#2a1440", 9) + ridge(790, 80, "#1a0c2b", 14)
        + `<path d="M560 960 C500 880 610 850 540 790 C500 750 570 720 524 690" fill="none" stroke="#e3b548" stroke-width="10" stroke-linecap="round" stroke-dasharray="2 22"/>`
        + text(["The Dragon", "Road"], { font: "Cardo", size: 90, fill: "#e3b548", y: 140, weight: 700, lh: 1.02 })
        + author("#f6e7c1", H - 40);
    },
  },
  {
    id: "fantasy-02", genre: "Fantasy & Science Fiction", title: "Ember & Orbit",
    draw() {
      const r = rng(44);
      let embers = "";
      for (let i = 0; i < 46; i += 1) embers += `<circle cx="${(r() * W).toFixed(0)}" cy="${(260 + r() * 520).toFixed(0)}" r="${(1.5 + r() * 5).toFixed(1)}" fill="${r() > 0.5 ? "#ff8a3d" : "#ffc46b"}" opacity="${(0.4 + r() * 0.6).toFixed(2)}"/>`;
      return rect("#0b1026") + stars(2, 60, "#ffffff", H, 1.6) + embers
        + `<ellipse cx="320" cy="520" rx="286" ry="70" fill="none" stroke="#ffc46b" stroke-width="5" transform="rotate(-18 320 520)"/>`
        + `<circle cx="320" cy="520" r="150" fill="#2f5fd0"/>`
        + `<path d="M185 470 A150 150 0 0 1 470 520 A220 120 0 0 0 185 470 Z" fill="#6f95f2" opacity="0.6"/>`
        + `<path d="M39 606 A286 70 -18 0 0 601 434" fill="none" stroke="#ffc46b" stroke-width="5" transform="rotate(0)" opacity="0"/>`
        + text(["EMBER", "& ORBIT"], { font: "Poppins", size: 92, fill: "#ffffff", y: 138, weight: 700, ls: 4, lh: 1.04 })
        + author("#ffc46b", H - 52);
    },
  },
  {
    id: "fantasy-03", genre: "Fantasy & Science Fiction", title: "The Clockwork Tide",
    draw() {
      const gear = (cx, cy, rad, teeth, fill) => {
        let d = "";
        for (let i = 0; i < teeth * 2; i += 1) {
          const a = (i / (teeth * 2)) * Math.PI * 2; const rr = i % 2 === 0 ? rad : rad * 0.84;
          const a2 = a + (Math.PI / teeth) * 0.5;
          d += `${i === 0 ? "M" : "L"}${(cx + Math.cos(a) * rr).toFixed(1)} ${(cy + Math.sin(a) * rr).toFixed(1)} L${(cx + Math.cos(a2) * rr).toFixed(1)} ${(cy + Math.sin(a2) * rr).toFixed(1)}`;
        }
        return `<path d="${d} Z" fill="${fill}"/><circle cx="${cx}" cy="${cy}" r="${rad * 0.52}" fill="#0e3a3f"/><circle cx="${cx}" cy="${cy}" r="${rad * 0.16}" fill="${fill}"/>`;
      };
      return rect("#0e3a3f")
        + gear(250, 420, 170, 14, "#c9973a") + gear(456, 300, 96, 10, "#e3c06a") + gear(470, 520, 70, 8, "#a8772a")
        + wave(600, 18, 200, "#17616a") + wave(670, 16, 160, "#124d55", 1.3) + wave(748, 14, 230, "#0c383e", 2.4)
        + text(["The Clockwork", "Tide"], { font: "Bitter", size: 70, fill: "#f3e7c9", y: 120, weight: 700, lh: 1.1 })
        + author("#e3c06a", H - 46);
    },
  },
  {
    id: "fantasy-04", genre: "Fantasy & Science Fiction", title: "Starfall Atlas",
    draw() {
      const r = rng(63);
      const pts = Array.from({ length: 11 }, () => [120 + r() * 400, 300 + r() * 380]);
      let lines = "";
      for (let i = 0; i < pts.length - 1; i += 1) lines += `<line x1="${pts[i][0].toFixed(0)}" y1="${pts[i][1].toFixed(0)}" x2="${pts[i + 1][0].toFixed(0)}" y2="${pts[i + 1][1].toFixed(0)}" stroke="#9fb6ff" stroke-width="1.6" opacity="0.8"/>`;
      const dots = pts.map(([x, y], i) => `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${i % 3 === 0 ? 7 : 4.5}" fill="#ffffff"/>`).join("");
      let meridians = "";
      for (let i = 1; i <= 4; i += 1) meridians += `<ellipse cx="320" cy="490" rx="${i * 62}" ry="250" fill="none" stroke="#3d4f8f" stroke-width="1.4"/>`;
      return rect("#101a3a") + stars(6, 80, "#dfe6ff", H, 1.8)
        + `<circle cx="320" cy="490" r="250" fill="none" stroke="#3d4f8f" stroke-width="2"/>` + meridians
        + `<line x1="70" y1="490" x2="570" y2="490" stroke="#3d4f8f" stroke-width="1.4"/>`
        + lines + dots
        + `<path d="M520 250 L420 330" stroke="#ffd98a" stroke-width="4" stroke-linecap="round"/><circle cx="420" cy="330" r="7" fill="#ffd98a"/>`
        + text(["STARFALL", "ATLAS"], { font: "Montserrat", size: 84, fill: "#ffffff", y: 136, weight: 300, ls: 10, lh: 1.1 })
        + author("#9fb6ff", H - 54);
    },
  },
  // -------------------------------------------------------------- Children's
  {
    id: "children-01", genre: "Children's", title: "The Dream Trail",
    draw() {
      return rect("#6fc3df")
        + `<circle cx="500" cy="330" r="62" fill="#fff3a8"/>`
        + [[110, 340, 48], [270, 420, 32], [560, 440, 30]].map(([x, y, s]) => `<g fill="#ffffff" opacity="0.92"><ellipse cx="${x}" cy="${y}" rx="${s * 1.5}" ry="${s * 0.62}"/><circle cx="${x - s * 0.5}" cy="${y - s * 0.3}" r="${s * 0.55}"/><circle cx="${x + s * 0.35}" cy="${y - s * 0.45}" r="${s * 0.7}"/></g>`).join("")
        + `<path d="M0 620 Q160 500 330 610 T640 560 V960 H0 Z" fill="#7ccf7a"/>`
        + `<path d="M0 720 Q200 610 400 720 T640 700 V960 H0 Z" fill="#4fb264"/>`
        + `<path d="M0 840 Q220 760 420 840 T640 820 V960 H0 Z" fill="#2f8f4e"/>`
        + `<path d="M120 960 C200 860 80 800 220 740 C340 690 300 640 420 600" fill="none" stroke="#fff7dc" stroke-width="12" stroke-linecap="round" stroke-dasharray="2 26"/>`
        + `<path d="M420 600 l0 -46 l34 12 l-34 12" fill="#f2553d" stroke="#f2553d" stroke-width="4" stroke-linejoin="round"/>`
        + text(["The Dream", "Trail"], { font: "Poppins", size: 92, fill: "#ffffff", y: 136, weight: 700, lh: 1.02 })
        + author("#eafff0", H - 40, { x: W - 50, anchor: "end" });
    },
  },
  {
    id: "children-02", genre: "Children's", title: "Pip and the Paper Moon",
    draw() {
      return rect("#2a2f6b") + stars(12, 46, "#fff3a8", 700, 3.4)
        + `<circle cx="330" cy="500" r="170" fill="#ffe27a"/><circle cx="398" cy="460" r="150" fill="#2a2f6b"/>`
        + `<g transform="translate(250 590)"><ellipse cx="0" cy="0" rx="36" ry="30" fill="#ff8a65"/><circle cx="26" cy="-26" r="20" fill="#ff8a65"/><path d="M44 -28 l20 6 l-20 8 Z" fill="#ffd54a"/><circle cx="30" cy="-30" r="4" fill="#1b1f4a"/><path d="M-30 -4 l-26 -12 l8 22 Z" fill="#e06b4a"/></g>`
        + `<line x1="330" y1="150" x2="330" y2="330" stroke="#fff3a8" stroke-width="2" stroke-dasharray="6 8" opacity="0"/>`
        + text(["Pip and the", "Paper Moon"], { font: "Poppins", size: 78, fill: "#ffffff", y: 140, weight: 700, lh: 1.08 })
        + author("#ffe27a", H - 56);
    },
  },
  {
    id: "children-03", genre: "Children's", title: "Ten Sleepy Owls",
    draw() {
      const body = ["#8d5a3b", "#6e4a7e", "#3f7d6e", "#c9553a", "#3b5a8d"];
      const owl = (x, y, i) => `<g transform="translate(${x} ${y})"><path d="M-44 -30 L-30 -58 L-12 -40 Z M44 -30 L30 -58 L12 -40 Z" fill="${body[i % 5]}"/><ellipse cx="0" cy="0" rx="48" ry="54" fill="${body[i % 5]}"/><ellipse cx="0" cy="18" rx="28" ry="30" fill="#fff4dc" opacity="0.9"/><circle cx="-18" cy="-14" r="15" fill="#fff4dc"/><circle cx="18" cy="-14" r="15" fill="#fff4dc"/><path d="M-27 -12 q9 8 18 0 M9 -12 q9 8 18 0" fill="none" stroke="#2b2118" stroke-width="3.5" stroke-linecap="round"/><path d="M-6 0 L6 0 L0 12 Z" fill="#f2a53d"/></g>`;
      let owls = "";
      const rows = [[110, 250, 390, 530], [180, 320, 460], [110, 250, 390]];
      let n = 0;
      rows.forEach((xs, row) => xs.forEach((x) => { owls += owl(x, 390 + row * 138, n); n += 1; }));
      return rect("#f6c453") + owls
        + text(["Ten Sleepy", "Owls"], { font: "Poppins", size: 92, fill: "#3b2a1c", y: 130, weight: 700, lh: 1.0 })
        + author("#3b2a1c", H - 46);
    },
  },
  {
    id: "children-04", genre: "Children's", title: "Where Do Puddles Go?",
    draw() {
      const r = rng(17);
      let drops = "";
      for (let i = 0; i < 22; i += 1) {
        const x = 40 + r() * 560; const y = 330 + r() * 300; const s = 0.7 + r() * 0.9;
        drops += `<path transform="translate(${x.toFixed(0)} ${y.toFixed(0)}) scale(${s.toFixed(2)})" d="M0 -22 C12 -4 16 6 0 16 C-16 6 -12 -4 0 -22 Z" fill="#3d8fc4" opacity="${(0.5 + r() * 0.5).toFixed(2)}"/>`;
      }
      return rect("#bfe3f0") + drops
        + `<ellipse cx="320" cy="770" rx="250" ry="46" fill="#5aa9d6"/><ellipse cx="320" cy="770" rx="170" ry="28" fill="none" stroke="#e8f6fc" stroke-width="4"/><ellipse cx="320" cy="770" rx="90" ry="14" fill="none" stroke="#e8f6fc" stroke-width="4"/>`
        + `<g transform="translate(410 640)"><path d="M0 0 h56 v80 h44 q20 0 20 24 v14 h-120 Z" fill="#ffcf3f"/><rect x="0" y="-6" width="56" height="14" rx="6" fill="#f2a53d"/></g>`
        + text(["Where Do", "Puddles Go?"], { font: "Poppins", size: 80, fill: "#1e4f73", y: 130, weight: 700, lh: 1.08 })
        + author("#1e4f73", H - 48);
    },
  },
  // ---------------------------------------------------- Self Help & Wellness
  {
    id: "wellness-01", genre: "Self Help & Wellness", title: "Small Beginnings",
    draw() {
      return rect("#f7f1e3")
        + `<path d="M320 700 V500" stroke="#3f7d4f" stroke-width="10" stroke-linecap="round"/>`
        + `<path d="M320 540 C230 540 196 470 196 420 C270 414 320 460 320 540 Z" fill="#5aa469"/>`
        + `<path d="M320 500 C410 500 452 420 452 360 C370 356 320 420 320 500 Z" fill="#3f7d4f"/>`
        + `<ellipse cx="320" cy="716" rx="150" ry="22" fill="#b98b5e"/><path d="M190 716 Q320 800 450 716 Z" fill="#8f6a45"/>`
        + text(["Small", "Beginnings"], { font: "DM Sans", size: 90, fill: "#24382b", y: 150, weight: 700, lh: 1.06, ls: -2 })
        + `<rect x="270" y="268" width="100" height="5" fill="#e2a03f"/>`
        + author("#3f7d4f", H - 56);
    },
  },
  {
    id: "wellness-02", genre: "Self Help & Wellness", title: "The Unhurried Hour",
    draw() {
      return rect("#e7d9c9")
        + `<path d="M200 330 H440 L340 520 L440 710 H200 L300 520 Z" fill="#fbf6ee" stroke="#5b4636" stroke-width="5" stroke-linejoin="round"/>`
        + `<path d="M232 354 H408 L330 500 H310 Z" fill="#d88f5d" opacity="0.5"/>`
        + `<path d="M262 690 Q320 600 378 690 Z" fill="#d88f5d"/><line x1="320" y1="520" x2="320" y2="640" stroke="#d88f5d" stroke-width="4" stroke-dasharray="3 9"/>`
        + `<rect x="184" y="312" width="272" height="20" rx="6" fill="#5b4636"/><rect x="184" y="708" width="272" height="20" rx="6" fill="#5b4636"/>`
        + text(["The Unhurried", "Hour"], { font: "Lora", size: 74, fill: "#3a2c22", y: 130, weight: 600, lh: 1.12 })
        + author("#5b4636", H - 60);
    },
  },
  {
    id: "wellness-03", genre: "Self Help & Wellness", title: "Breathe, Then Begin",
    draw() {
      let rings = "";
      for (let i = 9; i >= 1; i -= 1) rings += `<circle cx="320" cy="430" r="${i * 30}" fill="#2f8f8a" opacity="${(0.05 + (10 - i) * 0.035).toFixed(3)}"/>`;
      return grad("g", [[0, "#cfe8e5"], [1, "#f7f1e3"]]) + rings
        + `<circle cx="320" cy="430" r="26" fill="#ffffff"/>`
        + text(["Breathe,"], { font: "Montserrat", size: 84, fill: "#1e4b49", y: 770, weight: 300, ls: 2 })
        + text(["THEN BEGIN"], { font: "Montserrat", size: 44, fill: "#1e4b49", y: 836, weight: 700, ls: 12 })
        + author("#2f8f8a", 96);
    },
  },
  {
    id: "wellness-04", genre: "Self Help & Wellness", title: "Quiet Wins",
    draw() {
      let steps = "";
      const tones = ["#4f7a62", "#6d9a7f", "#8fb89d", "#b6d4bf", "#dcebdd"];
      tones.forEach((tone, i) => { steps += `<rect x="${60 + i * 104}" y="${720 - i * 84}" width="${W}" height="${H}" fill="${tone}"/>`; });
      return rect("#2f4a3c") + steps
        + `<circle cx="536" cy="330" r="16" fill="#f2c14e"/>`
        + text(["Quiet", "Wins"], { font: "Archivo Black", size: 128, fill: "#f4f1e6", x: 56, y: 190, anchor: "start", weight: 400, lh: 0.98 })
        + author("#2f4a3c", H - 50, { x: W - 56, anchor: "end" });
    },
  },
  // --------------------------------------------------------- Food & Lifestyle
  {
    id: "food-01", genre: "Food & Lifestyle", title: "At the Table",
    draw() {
      return rect("#e9dcc3")
        + `<circle cx="320" cy="540" r="190" fill="#fbf7ee" stroke="#3b3027" stroke-width="4"/><circle cx="320" cy="540" r="132" fill="none" stroke="#3b3027" stroke-width="2.5"/>`
        + `<circle cx="290" cy="520" r="38" fill="#c9553a"/><circle cx="352" cy="566" r="30" fill="#7c9a54"/><circle cx="350" cy="500" r="18" fill="#e3b548"/>`
        + `<g stroke="#3b3027" stroke-width="7" stroke-linecap="round" fill="none"><path d="M78 400 V690 M58 400 V470 Q58 500 78 500 Q98 500 98 470 V400"/><path d="M562 690 V400 Q600 440 590 540 H562"/></g>`
        + text(["At the", "Table"], { font: "Gelasio", size: 104, fill: "#3b3027", y: 150, weight: 700, lh: 1.0 })
        + author("#7a5c3e", H - 62);
    },
  },
  {
    id: "food-02", genre: "Food & Lifestyle", title: "Sunday Bread",
    draw() {
      return rect("#c98b4a")
        + `<ellipse cx="320" cy="640" rx="250" ry="34" fill="#8a5a2b" opacity="0.5"/>`
        + `<path d="M90 610 C90 420 200 360 320 360 C440 360 550 420 550 610 Q550 640 520 640 H120 Q90 640 90 610 Z" fill="#e9b872" stroke="#6b4420" stroke-width="5"/>`
        + `<g fill="none" stroke="#fff3da" stroke-width="12" stroke-linecap="round"><path d="M200 420 Q240 470 210 540"/><path d="M290 396 Q334 460 300 548"/><path d="M384 400 Q430 470 396 548"/><path d="M468 440 Q500 490 480 540"/></g>`
        + text(["SUNDAY", "BREAD"], { font: "Bitter", size: 108, fill: "#fff3da", y: 150, weight: 800, lh: 1.02, ls: 2 })
        + author("#4a2e14", H - 150)
        + `<rect x="60" y="${H - 96}" width="520" height="4" fill="#fff3da"/>`;
    },
  },
  {
    id: "food-03", genre: "Food & Lifestyle", title: "A Year of Soups",
    draw() {
      const soups = ["#e2603c", "#f0a23b", "#e9d36c", "#8fb35a", "#4f9a73", "#d94f57", "#f3c9a0", "#b55a8a", "#f08a4b", "#6aa6a0", "#c9a14a", "#a8442f"];
      let bowls = "";
      soups.forEach((color, i) => {
        const x = 130 + (i % 3) * 190; const y = 330 + Math.floor(i / 3) * 140;
        bowls += `<circle cx="${x}" cy="${y}" r="62" fill="#f7f2e4"/><circle cx="${x}" cy="${y}" r="48" fill="${color}"/><circle cx="${x - 14}" cy="${y - 12}" r="6" fill="#ffffff" opacity="0.5"/>`;
      });
      return rect("#2e5d4b") + bowls
        + text(["A Year of", "Soups"], { font: "Poppins", size: 88, fill: "#f7f2e4", y: 120, weight: 700, lh: 1.04 })
        + author("#e9d36c", H - 40);
    },
  },
  {
    id: "food-04", genre: "Food & Lifestyle", title: "The Small Garden Kitchen",
    draw() {
      const sprig = (x, y, rot, color, n = 6) => {
        let leaves = `<path d="M0 0 V-${n * 30 + 20}" stroke="${color}" stroke-width="4" stroke-linecap="round"/>`;
        for (let i = 0; i < n; i += 1) {
          const ly = -20 - i * 30;
          leaves += `<ellipse cx="-16" cy="${ly}" rx="17" ry="8" fill="${color}" transform="rotate(-28 -16 ${ly})"/><ellipse cx="16" cy="${ly - 12}" rx="17" ry="8" fill="${color}" transform="rotate(28 16 ${ly - 12})"/>`;
        }
        return `<g transform="translate(${x} ${y}) rotate(${rot})">${leaves}</g>`;
      };
      return rect("#f3f0e0")
        + sprig(120, 640, -14, "#5f8a4f") + sprig(230, 660, 6, "#7da765", 5) + sprig(330, 650, -4, "#3f6b3a", 7) + sprig(430, 660, 10, "#8db36f", 5) + sprig(530, 640, 18, "#5f8a4f")
        + `<path d="M60 650 H580 L548 730 Q540 750 516 750 H124 Q100 750 92 730 Z" fill="#c8704a"/><rect x="48" y="632" width="544" height="26" rx="8" fill="#a8552f"/>`
        + text(["The Small", "Garden Kitchen"], { font: "Lora", size: 70, fill: "#2f4a2b", y: 120, weight: 600, lh: 1.14 })
        + author("#a8552f", H - 60);
    },
  },
  // -------------------------------------------------------- Sports & Business
  {
    id: "business-01", genre: "Sports & Business", title: "The Winning Shape",
    draw() {
      const pts = [[320, 360], [220, 480], [420, 480], [140, 610], [320, 610], [500, 610]];
      const links = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 4], [2, 5], [1, 2], [3, 4], [4, 5]];
      return rect("#0f5132")
        + `<g fill="none" stroke="#ffffff" stroke-width="4" opacity="0.5"><rect x="40" y="290" width="560" height="430"/><line x1="40" y1="505" x2="600" y2="505"/><circle cx="320" cy="505" r="74"/><rect x="200" y="290" width="240" height="70"/><rect x="200" y="650" width="240" height="70"/></g>`
        + links.map(([a, b]) => `<line x1="${pts[a][0]}" y1="${pts[a][1]}" x2="${pts[b][0]}" y2="${pts[b][1]}" stroke="#f2c14e" stroke-width="4"/>`).join("")
        + pts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="17" fill="#f2c14e" stroke="#0f5132" stroke-width="4"/>`).join("")
        + text(["THE WINNING", "SHAPE"], { font: "Anton", size: 98, fill: "#ffffff", y: 130, weight: 400, ls: 2, lh: 1.08 })
        + author("#f2c14e", H - 110);
    },
  },
  {
    id: "business-02", genre: "Sports & Business", title: "Built to Pivot",
    draw() {
      return rect("#f2f2ee")
        + `<path d="M110 820 V560 Q110 440 230 440 H420 V360 L560 490 L420 620 V540 H250 Q210 540 210 580 V820 Z" fill="#e2562f"/>`
        + `<circle cx="160" cy="820" r="0" fill="#1b2a4a"/>`
        + `<rect x="60" y="820" width="520" height="8" fill="#1b2a4a"/>`
        + text(["BUILT", "TO PIVOT"], { font: "Archivo Black", size: 96, fill: "#1b2a4a", x: 56, y: 150, anchor: "start", weight: 400, lh: 1.02 })
        + author("#1b2a4a", H - 60, { x: 56, anchor: "start" });
    },
  },
  {
    id: "business-03", genre: "Sports & Business", title: "Second Half",
    draw() {
      return rect("#f4f1ea")
        + `<rect x="0" y="480" width="${W}" height="480" fill="#14213d"/>`
        + `<circle cx="320" cy="480" r="150" fill="none" stroke="#e85d3a" stroke-width="10"/>`
        + `<circle cx="320" cy="480" r="16" fill="#e85d3a"/>`
        + `<rect x="0" y="475" width="${W}" height="10" fill="#e85d3a"/>`
        + text(["SECOND"], { font: "Anton", size: 150, fill: "#14213d", y: 250, weight: 400, ls: 4 })
        + text(["HALF"], { font: "Anton", size: 190, fill: "#f4f1ea", y: 840, weight: 400, ls: 8 })
        + author("#e85d3a", H - 44);
    },
  },
  {
    id: "business-04", genre: "Sports & Business", title: "The Long Game Plan",
    draw() {
      let grid = "";
      for (let i = 0; i <= 6; i += 1) grid += `<line x1="60" y1="${330 + i * 60}" x2="580" y2="${330 + i * 60}" stroke="#34497a" stroke-width="1.5"/>`;
      for (let i = 0; i <= 8; i += 1) grid += `<line x1="${60 + i * 65}" y1="330" x2="${60 + i * 65}" y2="690" stroke="#34497a" stroke-width="1.5"/>`;
      const pts = [[60, 650], [125, 620], [190, 640], [255, 570], [320, 590], [385, 500], [450, 520], [515, 410], [580, 360]];
      const d = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x} ${y}`).join(" ");
      return rect("#1b2a4a") + grid
        + `<path d="${d} L580 690 L60 690 Z" fill="#e3b548" opacity="0.16"/>`
        + `<path d="${d}" fill="none" stroke="#e3b548" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"/>`
        + pts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="#1b2a4a" stroke="#e3b548" stroke-width="4"/>`).join("")
        + text(["The Long", "Game Plan"], { font: "Montserrat", size: 82, fill: "#ffffff", x: 58, y: 140, anchor: "start", weight: 800, lh: 1.1 })
        + author("#e3b548", H - 60, { x: 58, anchor: "start" });
    },
  },
];

const outputDir = resolve(process.argv[2] ?? "public/sample-covers");
const manifestPath = process.argv[3] ? resolve(process.argv[3]) : null;
mkdirSync(outputDir, { recursive: true });

const manifest = [];
for (const cover of covers) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${cover.draw()}</svg>`;
  const file = `${cover.id}.webp`;
  const buffer = await sharp(Buffer.from(svg), { density: 96 }).webp({ quality: 90, effort: 6 }).toBuffer();
  writeFileSync(join(outputDir, file), buffer);
  manifest.push({
    id: cover.id,
    genre: cover.genre,
    title: cover.title,
    file,
    width: W,
    height: H,
    sha256: createHash("sha256").update(buffer).digest("hex").toUpperCase(),
  });
}

const json = JSON.stringify(manifest, null, 2);
if (manifestPath) writeFileSync(manifestPath, `${json}\n`);
else process.stdout.write(`${json}\n`);

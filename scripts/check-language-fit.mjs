/**
 * Loads every built page in every language at 360 / 768 / 1280 and flags text
 * that overflows its box or overlaps another text element.
 *
 * Usage: node scripts/check-language-fit.mjs [baseUrl]
 * Exit 0 when clean; exit 1 when issues remain. Writes JSON report to
 * /opt/cursor/artifacts/language-fit-report.json when that dir exists.
 */
import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const BASE = process.env.BASE_URL || process.argv[2] || "http://127.0.0.1:4318";
const widths = [360, 768, 1280];
const langs = ["en", "ru", "uk"];
const outPath = "/opt/cursor/artifacts/language-fit-report.json";

function collectPages() {
  const outDir = path.join(root, "out");
  const pages = new Set();
  for (const lang of langs) {
    const dir = path.join(outDir, lang);
    if (!fs.existsSync(dir)) continue;
    const walk = (d, prefix) => {
      for (const name of fs.readdirSync(d, { withFileTypes: true })) {
        if (name.isDirectory()) walk(path.join(d, name.name), `${prefix}${name.name}/`);
        else if (name.name === "index.html") pages.add(`/${lang}/${prefix}`);
      }
    };
    walk(dir, "");
  }
  return [...pages].sort();
}

async function auditPage(page) {
  return page.evaluate(() => {
    const issues = [];
    const textNodes = [];
    const candidates = document.querySelectorAll(
      "h1,h2,h3,h4,h5,h6,p,a,button,label,span,li,td,th,dt,dd,[role='button'],.vyaz-title,.eyebrow,.font-button",
    );

    const visible = (el) => {
      const st = getComputedStyle(el);
      if (st.display === "none" || st.visibility === "hidden" || Number(st.opacity) === 0) return false;
      if (st.clip === "rect(0px, 0px, 0px, 0px)" || st.clipPath === "inset(50%)") return false;
      const r = el.getBoundingClientRect();
      return r.width > 1 && r.height > 1 && r.bottom > 0 && r.top < innerHeight + 200;
    };
    const isSrOnly = (el) =>
      el.classList.contains("sr-only") ||
      !!el.closest(".sr-only") ||
      (getComputedStyle(el).position === "absolute" && el.className && String(el.className).includes("sr-only"));

    for (const el of candidates) {
      if (!visible(el) || isSrOnly(el)) continue;
      if (el.closest("[aria-hidden='true']") || el.closest("[inert]")) continue;
      const text = (el.textContent || "").replace(/\s+/g, " ").trim();
      if (!text || text.length < 2) continue;
      // Prefer leaf text nodes: skip pure wrappers that contain other candidates
      if ([...el.children].some((c) => candidatesHas(c)) && !["A", "BUTTON", "LABEL"].includes(el.tagName) && !el.classList.contains("vyaz-title")) {
        continue;
      }
      const sw = el.scrollWidth;
      const sh = el.scrollHeight;
      const cw = el.clientWidth;
      const ch = el.clientHeight;
      const st = getComputedStyle(el);
      // Font-metric / sub-pixel slack for self-hosted display faces
      const overflowX = sw > cw + 3;
      const overflowY = sh > ch + 3;
      if ((overflowX || overflowY) && (st.overflowX === "auto" || st.overflowX === "scroll" || st.overflowY === "auto" || st.overflowY === "scroll")) {
        continue;
      }
      if (overflowX || overflowY) {
        issues.push({
          kind: overflowX && overflowY ? "overflow-xy" : overflowX ? "overflow-x" : "overflow-y",
          text: text.slice(0, 80),
          tag: el.tagName.toLowerCase(),
          className: String(el.className || "").slice(0, 80),
          sw,
          cw,
          sh,
          ch,
        });
      }
      // Overlap candidates: only direct text-bearing leaves
      if (["H1", "H2", "H3", "H4", "P", "A", "BUTTON", "LABEL", "SPAN"].includes(el.tagName)) {
        const r = el.getBoundingClientRect();
        textNodes.push({ el, text: text.slice(0, 60), r: { top: r.top, bottom: r.bottom, left: r.left, right: r.right } });
      }
    }

    function candidatesHas(node) {
      return node.matches?.("h1,h2,h3,h4,h5,h6,p,a,button,label,span,li,td,th,dt,dd,[role='button'],.vyaz-title,.eyebrow,.font-button");
    }

    const overlaps = [];
    for (let i = 0; i < textNodes.length; i++) {
      for (let j = i + 1; j < textNodes.length; j++) {
        const a = textNodes[i];
        const b = textNodes[j];
        if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
        if (a.el.parentElement && a.el.parentElement === b.el.parentElement && a.el.parentElement.closest("a,button,[role='button'],label")) continue;
        const shared = a.el.closest("a,button,[role='button'],label");
        if (shared && shared === b.el.closest("a,button,[role='button'],label")) continue;
        const ox = Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left);
        const oy = Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top);
        // Require meaningful overlap (not adjacent padding collisions)
        if (ox > 8 && oy > 8) {
          const aFixed = getComputedStyle(a.el).position === "fixed" || !!a.el.closest("header");
          const bFixed = getComputedStyle(b.el).position === "fixed" || !!b.el.closest("header");
          // Header over page content is expected stacking, not a text collision
          if (aFixed !== bFixed) continue;
          overlaps.push({ kind: "overlap", a: a.text, b: b.text, ox: Math.round(ox), oy: Math.round(oy) });
        }
      }
    }
    issues.push(...overlaps.slice(0, 15));
    return issues;
  });
}

const pages = collectPages();
if (!pages.length) {
  console.error("No pages found under out/. Build the site first.");
  process.exit(2);
}

const browser = await chromium.launch();
const report = [];
let flags = 0;

for (const width of widths) {
  const context = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  for (const p of pages) {
    try {
      await page.goto(BASE + p, { waitUntil: "networkidle", timeout: 45000 });
      await page.waitForTimeout(80);
      const issues = await auditPage(page);
      if (issues.length) {
        flags += issues.length;
        report.push({ width, path: p, count: issues.length, issues: issues.slice(0, 12) });
      }
    } catch (err) {
      flags += 1;
      report.push({ width, path: p, count: 1, issues: [{ kind: "nav-error", text: String(err.message || err).slice(0, 120) }] });
    }
  }
  await context.close();
}
await browser.close();

const summary = {
  pages: pages.length,
  viewports: widths.length,
  checks: pages.length * widths.length,
  flaggedChecks: report.length,
  issueCount: flags,
  report,
};

console.log(JSON.stringify({ pages: summary.pages, checks: summary.checks, flaggedChecks: summary.flaggedChecks, issueCount: summary.issueCount, sample: report.slice(0, 8) }, null, 2));
try {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(summary, null, 2));
} catch {
  /* artifacts dir may be unavailable locally */
}
process.exit(flags ? 1 : 0);

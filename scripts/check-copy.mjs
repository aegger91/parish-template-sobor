// House style checks for content and components: no em dashes, no cross glyphs (use the SVG component), no QR codes.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const repo = new URL("..", import.meta.url).pathname;
const targets = ["content", "src", "README.md"];
const rules = [
  { re: /\u2014/, why: "em dash (use a comma, colon or period)" },
  { re: /[\u2626\u271D\u271E\u271F\u2020\u2629]/, why: "cross glyph (use <OrthodoxCross />)" },
  { re: /\bQR\b|qr-?code/i, why: "QR code" },
  { re: /lorem ipsum/i, why: "placeholder Latin" },
];

const files = [];
const walk = (p) => {
  const s = statSync(p);
  if (s.isDirectory()) for (const f of readdirSync(p)) walk(join(p, f));
  else if (/\.(json|tsx?|css|md)$/.test(p)) files.push(p);
};
for (const t of targets) {
  try {
    walk(join(repo, t));
  } catch {
    /* optional target */
  }
}

let problems = 0;
for (const f of files) {
  readFileSync(f, "utf8")
    .split("\n")
    .forEach((line, i) => {
      for (const r of rules)
        if (r.re.test(line)) {
          problems++;
          console.error(`${relative(repo, f)}:${i + 1}: ${r.why}`);
        }
    });
}
if (problems) {
  console.error(`\n${problems} copy problem(s).`);
  process.exit(1);
}
console.log(`Copy OK: ${files.length} files checked.`);

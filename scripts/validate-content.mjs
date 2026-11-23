// Validates every file in content/ against its JSON Schema, then checks ids, references and translations.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const root = new URL("../content/", import.meta.url).pathname;
const schemaDir = join(root, "schema");
const read = (p) => JSON.parse(readFileSync(p, "utf8"));

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
for (const f of readdirSync(schemaDir)) ajv.addSchema(read(join(schemaDir, f)));

const errors = [];
const warn = [];
const data = {};

for (const f of readdirSync(root).filter((f) => f.endsWith(".json"))) {
  const name = f.replace(/\.json$/, "");
  const doc = read(join(root, f));
  data[name] = doc;
  const validate = ajv.getSchema(`${name}.schema.json`);
  if (!validate) {
    errors.push(`${f}: no schema found (expected schema/${name}.schema.json)`);
    continue;
  }
  if (!validate(doc)) for (const e of validate.errors) errors.push(`${f}${e.instancePath || "/"}: ${e.message}`);
}

const site = data.site;
const langs = site.languages.map((l) => l.code);
if (!langs.includes(site.defaultLanguage)) errors.push(`site.json: defaultLanguage "${site.defaultLanguage}" is not in languages`);

const unique = (file, list, label = "id") => {
  const seen = new Set();
  for (const x of list) {
    if (seen.has(x[label])) errors.push(`${file}: duplicate ${label} "${x[label]}"`);
    seen.add(x[label]);
  }
  return seen;
};

// Every translatable field should have the default language; other languages fall back.
const walkText = (file, node, path) => {
  if (!node || typeof node !== "object") return;
  const keys = Object.keys(node);
  const looksLikeText = keys.length && keys.every((k) => /^[a-z]{2,3}(-[A-Za-z0-9]+)?$/.test(k)) && keys.every((k) => typeof node[k] === "string");
  if (looksLikeText) {
    if (!(site.defaultLanguage in node)) errors.push(`${file}${path}: missing default language "${site.defaultLanguage}"`);
    for (const l of langs) if (!(l in node)) warn.push(`${file}${path}: no "${l}" text, falls back to ${site.defaultLanguage}`);
    return;
  }
  for (const [k, v] of Object.entries(node)) walkText(file, v, `${path}/${k}`);
};
for (const [name, doc] of Object.entries(data)) if (name !== "image-sources") walkText(`${name}.json`, doc, "");

const pageIds = new Set();
const walkPages = (nodes) => {
  for (const p of nodes) {
    if (pageIds.has(p.id)) errors.push(`pages.json: duplicate page id "${p.id}"`);
    pageIds.add(p.id);
    unique(`pages.json (${p.id} sections)`, p.sections);
    if (p.children) walkPages(p.children);
  }
};
walkPages(data.pages.pages);
for (const id of ["home", "schedule", "contact", "donate", "credits"]) if (!pageIds.has(id)) errors.push(`pages.json: page "${id}" is required by the header, hero and footer`);

const newsCats = unique("news.json categories", data.news.categories);
unique("news.json", data.news.items);
unique("news.json", data.news.items, "slug");
for (const n of data.news.items) if (!newsCats.has(n.category)) errors.push(`news.json: "${n.id}" uses unknown category "${n.category}"`);

const albums = unique("gallery.json albums", data.gallery.albums);
unique("gallery.json", data.gallery.items);
for (const g of data.gallery.items) if (!albums.has(g.album)) errors.push(`gallery.json: "${g.id}" uses unknown album "${g.album}"`);

const storeCats = unique("store.json categories", data.store.categories);
unique("store.json", data.store.products);
unique("store.json", data.store.products, "slug");
for (const p of data.store.products) {
  if (!storeCats.has(p.category)) errors.push(`store.json: "${p.id}" uses unknown category "${p.category}"`);
  unique(`store.json (${p.id} variants)`, p.variants);
}

const evCats = unique("connect.json eventCategories", data.connect.eventCategories);
const needCats = unique("connect.json needCategories", data.connect.needCategories);
unique("connect.json", [...data.connect.events, ...data.connect.needs]);
for (const e of data.connect.events) if (!evCats.has(e.category)) errors.push(`connect.json: event "${e.id}" uses unknown category "${e.category}"`);
for (const e of data.connect.needs) if (!needCats.has(e.category)) errors.push(`connect.json: need "${e.id}" uses unknown category "${e.category}"`);
for (const e of [...data.connect.events, ...data.connect.needs]) if (e.signups > e.capacity) errors.push(`connect.json: "${e.id}" has more signups than capacity`);

unique("schedule.json", [...data.schedule.recurring, ...data.schedule.dated]);
unique("feasts.json", [...data.feasts.fixed, ...data.feasts.movable]);
for (const f of data.feasts.fixed) if (f.month == null || f.day == null) errors.push(`feasts.json: fixed feast "${f.id}" needs month and day`);
for (const f of data.feasts.movable) if (f.paschaOffset == null) errors.push(`feasts.json: movable feast "${f.id}" needs paschaOffset`);
unique("clergy.json", data.clergy.clergy);
unique("history.json", data.history.events);
unique("sermons.json", data.sermons.sermons);
unique("parish-services.json", data["parish-services"].services);
for (const s of data["parish-services"].services) if (s.action === "link" && !s.href) errors.push(`parish-services.json: "${s.id}" has action link but no href`);
unique("zapiski.json commemorations", data.zapiski.commemorations);
unique("zapiski.json prefixes", data.zapiski.prefixes);
unique("zapiski.json candles", data.zapiski.candles);

for (const w of warn) console.warn(`warn  ${w}`);
if (errors.length) {
  for (const e of errors) console.error(`error ${e}`);
  console.error(`\n${errors.length} content error(s).`);
  process.exit(1);
}
console.log(`Content OK: ${Object.keys(data).length} files, ${langs.length} languages (${langs.join(", ")}).`);

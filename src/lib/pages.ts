import { news, pagesFile, site, store } from "./content";
import type { NewsItem, PageNode, Product } from "./types";

export type ResolvedPage = PageNode & { path: string; parentPath: string | null; depth: number };

function isActive(p: PageNode): boolean {
  return p.enabled && (!p.requiresModule || site.modules[p.requiresModule]);
}

function walk(nodes: PageNode[], parentPath: string | null, depth: number, out: ResolvedPage[]) {
  for (const p of nodes) {
    if (!isActive(p)) continue;
    const path = [parentPath, p.slug].filter(Boolean).join("/");
    out.push({ ...p, path, parentPath, depth });
    if (p.children) walk(p.children, path, depth + 1, out);
  }
}

const allPages: ResolvedPage[] = [];
walk(pagesFile.pages, null, 0, allPages);

export function getPages(): ResolvedPage[] {
  return allPages;
}

export function pageById(id: string): ResolvedPage | undefined {
  return allPages.find((p) => p.id === id);
}

export function pageByPath(path: string): ResolvedPage | undefined {
  return allPages.find((p) => p.path === path);
}

export function childrenOf(page: ResolvedPage): ResolvedPage[] {
  return allPages.filter((p) => p.parentPath === page.path && p.depth === page.depth + 1);
}

export function breadcrumbs(page: ResolvedPage): ResolvedPage[] {
  const trail: ResolvedPage[] = [];
  let cur: ResolvedPage | undefined = page;
  while (cur) {
    trail.unshift(cur);
    cur = cur.parentPath !== null ? pageByPath(cur.parentPath) : undefined;
  }
  const home = pageById("home");
  if (home && page.id !== "home") trail.unshift(home);
  return trail;
}

export type NavItem = { id: string; title: PageNode["title"]; overviewTitle: PageNode["title"]; path: string; children: NavItem[] };

/** Navigation tree straight from pages.json: active pages with showInNav, nested to any depth. */
export function navTree(): NavItem[] {
  const build = (nodes: PageNode[], parentPath: string | null): NavItem[] =>
    nodes
      .filter((p) => isActive(p) && p.showInNav)
      .map((p) => {
        const path = [parentPath, p.slug].filter(Boolean).join("/");
        return { id: p.id, title: p.title, overviewTitle: p.navTitle ?? p.title, path, children: build(p.children ?? [], path) };
      });
  return build(pagesFile.pages, null);
}

export type CollectionRoute =
  | { kind: "news"; page: ResolvedPage; item: NewsItem; path: string }
  | { kind: "product"; page: ResolvedPage; item: Product; path: string };

export function collectionRoutes(): CollectionRoute[] {
  const out: CollectionRoute[] = [];
  for (const page of allPages) {
    if (page.collection === "news") for (const item of news.items) out.push({ kind: "news", page, item, path: `${page.path}/${item.slug}` });
    if (page.collection === "products") for (const item of store.products) out.push({ kind: "product", page, item, path: `${page.path}/${item.slug}` });
  }
  return out;
}

export function collectionPagePath(kind: "news" | "products"): string | undefined {
  return allPages.find((p) => p.collection === kind)?.path;
}

/** Build a language-prefixed href. Accepts page paths ("store/cart") or config hrefs ("/contact/#directions"). */
export function href(lang: string, path: string): string {
  if (/^(https?:|mailto:|tel:|#)/.test(path)) return path;
  const [rawPath, hash] = path.split("#");
  const clean = rawPath.replace(/^\/+|\/+$/g, "");
  return `/${lang}/${clean ? clean + "/" : ""}${hash ? "#" + hash : ""}`;
}

export function hrefById(lang: string, id: string, hash?: string): string {
  const p = pageById(id);
  return href(lang, (p?.path ?? "") + (hash ? `#${hash}` : ""));
}

export function withBase(src: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
  return src.startsWith("/") ? base + src : src;
}

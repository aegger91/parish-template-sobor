import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageBanner } from "@/components/layout/PageBanner";
import { SectionRenderer } from "@/components/sections/SectionRenderer";
import { NewsArticle } from "@/components/sections/NewsArticle";
import { ProductDetail } from "@/components/store/ProductDetail";
import { breadcrumbs, collectionRoutes, getPages, pageByPath } from "@/lib/pages";
import { languages, tr } from "@/lib/i18n";
import { site } from "@/lib/content";

export const dynamicParams = false;

export function generateStaticParams() {
  const paths = [...getPages().map((p) => p.path), ...collectionRoutes().map((c) => c.path)];
  return paths.map((p) => ({ slug: p ? p.split("/") : [] }));
}

function resolve(slug: string[] | undefined) {
  const path = (slug ?? []).filter(Boolean).join("/");
  const page = pageByPath(path);
  if (page) return { kind: "page" as const, page };
  const item = collectionRoutes().find((c) => c.path === path);
  return item ? { kind: "item" as const, item } : null;
}

export async function generateMetadata({ params }: PageProps<"/[lang]/[[...slug]]">): Promise<Metadata> {
  const { lang, slug } = await params;
  const r = resolve(slug);
  if (!r) return {};
  const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const path = r.kind === "page" ? r.page.path : r.item.path;
  const alternates = { languages: Object.fromEntries(languages.map((l) => [l.locale, `${base}/${l.code}/${path ? path + "/" : ""}`])) };
  if (r.kind === "page") {
    return {
      title: r.page.id === "home" ? { absolute: tr(site.name, lang) } : tr(r.page.title, lang),
      description: tr(r.page.description, lang) || tr(site.tagline, lang),
      alternates,
    };
  }
  const name = r.item.kind === "news" ? r.item.item.title : r.item.item.name;
  return { title: tr(name, lang), alternates };
}

export default async function Page({ params }: PageProps<"/[lang]/[[...slug]]">) {
  const { lang, slug } = await params;
  const r = resolve(slug);
  if (!r) notFound();

  if (r.kind === "item") {
    const crumbs = [...breadcrumbs(r.item.page)];
    return r.item.kind === "news" ? (
      <NewsArticle lang={lang} item={r.item.item} parent={r.item.page} crumbs={crumbs} />
    ) : (
      <ProductDetail lang={lang} product={r.item.item} parent={r.item.page} crumbs={crumbs} />
    );
  }

  const { page } = r;
  return (
    <>
      {page.id !== "home" ? <PageBanner lang={lang} page={page} crumbs={breadcrumbs(page)} /> : null}
      {page.sections
        .filter((s) => s.enabled)
        .map((s) => (
          <SectionRenderer key={s.id} lang={lang} section={s} page={page} />
        ))}
    </>
  );
}

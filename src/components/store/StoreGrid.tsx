"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Store } from "lucide-react";
import type { SectionProps } from "@/components/sections/SectionRenderer";
import { SectionHeader, SectionShell } from "@/components/sections/SectionShell";
import { FilterChips } from "@/components/sections/FilterChips";
import { ProductImage } from "./ProductImage";
import { store } from "@/lib/content";
import { formatMoney, t, tr } from "@/lib/i18n";
import { collectionPagePath, href } from "@/lib/pages";
import type { Product } from "@/lib/types";

export const productHref = (lang: string, p: Product) => href(lang, `${collectionPagePath("products")}/${p.slug}`);

export function stockLabel(stock: number, lang: string) {
  if (stock <= 0) return { text: t("store.outOfStock", lang), tone: "text-kinovar" };
  if (stock <= 3) return { text: t("store.lowStock", lang, { n: stock }), tone: "text-gold-700" };
  return { text: t("store.inStock", lang), tone: "text-green-700" };
}

export function StoreGrid({ lang, section }: SectionProps) {
  const [cat, setCat] = useState("all");
  useEffect(() => {
    const c = new URLSearchParams(window.location.search).get("category");
    if (c && store.categories.some((x) => x.id === c)) setCat(c);
  }, []);
  const items = store.products.filter((p) => cat === "all" || p.category === cat);

  return (
    <SectionShell id={section.id}>
      <SectionHeader title={tr(section.title, lang)} intro={tr(section.intro, lang)} />
      <div className="container-sobor">
        <FilterChips
          label={t("store.filter", lang)}
          value={cat}
          onChange={setCat}
          options={[{ id: "all", label: t("all", lang) }, ...store.categories.map((c) => ({ id: c.id, label: tr(c.name, lang) }))]}
        />
        {items.length === 0 ? (
          <p className="mt-10 flex flex-col items-center gap-2 text-ink-muted">
            <Store className="size-8" aria-hidden /> {t("store.empty", lang)}
          </p>
        ) : (
          <ul className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
            {items.map((p) => {
              const min = Math.min(...p.variants.map((v) => v.price));
              const multi = new Set(p.variants.map((v) => v.price)).size > 1;
              const stock = p.variants.reduce((s, v) => s + v.stock, 0);
              const cat = store.categories.find((c) => c.id === p.category);
              const s = stockLabel(stock, lang);
              return (
                <li key={p.id}>
                  <Link href={productHref(lang, p)} className="group flex h-full flex-col overflow-hidden rounded-lg border border-cream-300 bg-cream-50 shadow-sm transition hover:-translate-y-0.5 hover:border-gold-500 hover:shadow-md">
                    <ProductImage image={p.images[0]} lang={lang} className="aspect-square" />
                    <span className="flex flex-1 flex-col p-3 sm:p-4">
                      <span className="eyebrow text-[0.7rem] text-gold-700 sm:text-[0.75rem]">{tr(cat?.name, lang)}</span>
                      <span className="mt-1 font-heading text-[1rem] leading-normal text-green-800 sm:text-[1.1rem]">{tr(p.name, lang)}</span>
                      <span className="mt-auto flex flex-wrap items-baseline justify-between gap-x-2 pt-2">
                        <span className="font-heading text-ink">{multi ? t("store.from", lang, { price: formatMoney(min, lang) }) : formatMoney(min, lang)}</span>
                        <span className={`text-[0.78rem] ${s.tone}`}>{s.text}</span>
                      </span>
                      {p.pickupOnly ? <span className="mt-1 text-[0.75rem] text-ink-muted">{t("store.pickupOnly", lang)}</span> : null}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </SectionShell>
  );
}

"use client";

import { useState } from "react";
import type { SectionProps } from "./SectionRenderer";
import { SectionHeader, SectionShell } from "./SectionShell";
import { FilterChips } from "./FilterChips";
import { NewsCard, sortedNews } from "./NewsCard";
import { news } from "@/lib/content";
import { t, tr } from "@/lib/i18n";

export function NewsList({ lang, section }: SectionProps) {
  const [cat, setCat] = useState("all");
  const items = sortedNews().filter((n) => cat === "all" || n.category === cat);
  return (
    <SectionShell id={section.id}>
      <SectionHeader title={tr(section.title, lang)} intro={tr(section.intro, lang)} />
      <div className="container-sobor">
        <FilterChips
          label={t("news.filter", lang)}
          value={cat}
          onChange={setCat}
          options={[{ id: "all", label: t("all", lang) }, ...news.categories.map((c) => ({ id: c.id, label: tr(c.name, lang) }))]}
        />
        {items.length ? (
          <ul className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((n) => (
              <li key={n.id}>
                <NewsCard item={n} lang={lang} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-10 text-center text-ink-muted">{t("news.empty", lang)}</p>
        )}
      </div>
    </SectionShell>
  );
}

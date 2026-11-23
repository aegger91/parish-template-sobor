import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Pictogram } from "@/components/sacred/Pictograms";
import { news } from "@/lib/content";
import { formatIsoDate, t, tr } from "@/lib/i18n";
import { collectionPagePath, href, withBase } from "@/lib/pages";
import type { NewsItem } from "@/lib/types";

export function newsHref(lang: string, item: NewsItem) {
  return href(lang, `${collectionPagePath("news")}/${item.slug}`);
}

export function NewsCard({ item, lang }: { item: NewsItem; lang: string }) {
  const cat = news.categories.find((c) => c.id === item.category);
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-cream-300 bg-cream-50 shadow-sm transition hover:-translate-y-0.5 hover:border-gold-500 hover:shadow-md">
      <Link href={newsHref(lang, item)} className="relative block aspect-[16/10] overflow-hidden bg-green-800" tabIndex={-1} aria-hidden>
        {item.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={withBase(item.image)} alt="" loading="lazy" className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
        ) : (
          <span className="flex size-full items-center justify-center text-gold-400/80">
            <Pictogram name="bells" size={64} strokeWidth={1.2} />
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.85rem]">
          {cat ? <span className="eyebrow rounded-full bg-gold-200/60 px-2.5 py-0.5 text-gold-700">{tr(cat.name, lang)}</span> : null}
          <time dateTime={item.date} className="text-ink-muted">{formatIsoDate(item.date, lang)}</time>
        </p>
        <h3 className="mt-3 text-[1.25rem] leading-snug text-green-800">
          <Link href={newsHref(lang, item)} className="hover:underline hover:decoration-gold-500 hover:underline-offset-4">
            {tr(item.title, lang)}
          </Link>
        </h3>
        <p className="mt-2 text-[0.97rem] text-ink-muted">{tr(item.excerpt, lang)}</p>
        <Link href={newsHref(lang, item)} className="mt-auto inline-flex items-center gap-1.5 pt-4 font-button text-gold-700 hover:text-green-800">
          {t("readMore", lang)} <ArrowRight className="size-4 rtl:rotate-180" aria-hidden />
        </Link>
      </div>
    </article>
  );
}

export const sortedNews = () => [...news.items].sort((a, b) => b.date.localeCompare(a.date));

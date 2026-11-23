import { ArrowLeft } from "lucide-react";
import { PageBanner } from "@/components/layout/PageBanner";
import { OrnamentBand } from "@/components/sacred/Ornaments";
import { Paragraphs } from "./SectionShell";
import { ButtonLink } from "./StaticSections";
import { news } from "@/lib/content";
import { formatIsoDate, t, tr } from "@/lib/i18n";
import { href, withBase, type ResolvedPage } from "@/lib/pages";
import type { NewsItem } from "@/lib/types";

export function NewsArticle({ lang, item, parent, crumbs }: { lang: string; item: NewsItem; parent: ResolvedPage; crumbs: ResolvedPage[] }) {
  const cat = news.categories.find((c) => c.id === item.category);
  return (
    <>
      <PageBanner lang={lang} page={parent} crumbs={crumbs} title={item.title} description={{ en: "" }} />
      <article className="container-sobor py-12 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <p className="flex flex-wrap items-center justify-center gap-3 text-[0.92rem]">
            {cat ? <span className="eyebrow rounded-full bg-gold-200/60 px-3 py-0.5 text-gold-700">{tr(cat.name, lang)}</span> : null}
            <time dateTime={item.date} className="text-ink-muted">{formatIsoDate(item.date, lang)}</time>
          </p>
          {item.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={withBase(item.image.replace("-sm.jpg", ".jpg"))} alt="" className="mt-8 aspect-[16/9] w-full rounded-lg border-4 border-cream-50 object-cover shadow ring-1 ring-gold-500/40" />
          ) : null}
          <p className="mt-8 font-heading text-[1.25rem] leading-relaxed text-green-800">{tr(item.excerpt, lang)}</p>
          <OrnamentBand className="my-6 text-gold-500/50" height={8} />
          <Paragraphs text={tr(item.body, lang)} className="text-[1.08rem]" />
          <div className="mt-10">
            <ButtonLink href={href(lang, parent.path)} variant="outline">
              <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden /> {t("news.back", lang)}
            </ButtonLink>
          </div>
        </div>
      </article>
    </>
  );
}

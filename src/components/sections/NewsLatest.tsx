import type { SectionProps } from "./SectionRenderer";
import { SectionHeader, SectionShell } from "./SectionShell";
import { NewsCard, sortedNews } from "./NewsCard";
import { ButtonLink } from "./StaticSections";
import { t, tr } from "@/lib/i18n";
import { hrefById } from "@/lib/pages";

export function NewsLatest({ lang, section }: SectionProps) {
  const limit = Number(section.props?.limit ?? 3);
  const items = sortedNews().slice(0, limit);
  if (!items.length) return null;
  return (
    <SectionShell id={section.id}>
      <SectionHeader title={tr(section.title, lang)} intro={tr(section.intro, lang)} />
      <ul className="container-sobor grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((n) => (
          <li key={n.id}>
            <NewsCard item={n} lang={lang} />
          </li>
        ))}
      </ul>
      <div className="mt-8 flex justify-center">
        <ButtonLink href={hrefById(lang, "news")} variant="outline">
          {t("viewAll", lang)}
        </ButtonLink>
      </div>
    </SectionShell>
  );
}

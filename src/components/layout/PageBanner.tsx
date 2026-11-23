import Link from "next/link";
import { ChevronRight } from "lucide-react";
import {
  BannerRibbon,
  KokoshnikDivider,
  bannerRibbonHeight,
  bannerRibbonPad,
} from "@/components/sacred/Ornaments";
import { t, tr } from "@/lib/i18n";
import { href, type ResolvedPage } from "@/lib/pages";
import type { L } from "@/lib/types";
import { cn } from "@/lib/utils";

export function PageBanner({
  lang,
  page,
  crumbs,
  title,
  description,
}: {
  lang: string;
  page: ResolvedPage;
  crumbs: ResolvedPage[];
  title?: L;
  description?: L;
}) {
  const heading = tr(title ?? page.title, lang);
  const desc = tr(description ?? page.description, lang);
  const trail = title ? crumbs : crumbs.slice(0, -1);
  return (
    <section
      className={cn(
        "relative bg-green-900 pt-[calc(var(--header-h)+3.25rem)] text-cream-50 lg:pt-[calc(var(--header-h)+4.5rem)]",
        bannerRibbonPad,
      )}
    >
      <div
        aria-hidden
        className="absolute inset-0 z-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, var(--sobor-gold-400) 1px, transparent 0), radial-gradient(circle at 50% 120%, var(--sobor-gold-500), transparent 60%)",
          backgroundSize: "22px 22px, 100% 100%",
        }}
      />
      <div className="container-sobor relative z-10 text-center">
        {trail.length ? (
          <nav aria-label={t("nav.breadcrumb", lang)} className="mb-4 flex justify-center">
            <ol className="flex flex-wrap items-center justify-center gap-x-1 gap-y-1 text-[0.85rem] text-cream-100/80">
              {trail.map((c, i) => (
                <li key={c.id} className="flex items-center gap-1">
                  {i > 0 ? <ChevronRight className="size-3.5 text-gold-500 rtl:rotate-180" aria-hidden /> : null}
                  <Link href={href(lang, c.path)} className="hover:text-gold-200">
                    {c.id === "home" ? t("nav.home", lang) : tr(c.title, lang)}
                  </Link>
                </li>
              ))}
            </ol>
          </nav>
        ) : null}
        <h1 className="vyaz-title mx-auto max-w-4xl text-[length:var(--text-h1)] text-cream-50 [text-shadow:0_2px_12px_rgba(0,0,0,0.3)]">
          {heading}
        </h1>
        <KokoshnikDivider className="mt-4" />
        {desc ? <p className="mx-auto mt-3 max-w-2xl text-[1.05rem] text-cream-100/90">{desc}</p> : null}
      </div>
      <BannerRibbon className={bannerRibbonHeight} />
    </section>
  );
}

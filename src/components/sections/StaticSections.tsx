import Link from "next/link";
import { ArrowRight, Clock, ExternalLink, Mail, MapPin, Navigation, Phone } from "lucide-react";
import type { SectionProps } from "./SectionRenderer";
import { Paragraphs, SectionHeader, SectionShell } from "./SectionShell";
import { CrossWithInscription, OrthodoxCross } from "@/components/sacred/OrthodoxCross";
import { IllustrationTile, KokoshnikDivider, OrnamentBand } from "@/components/sacred/Ornaments";
import { Pictogram, SwingingBell, type PictogramName } from "@/components/sacred/Pictograms";
import { imageSources, site } from "@/lib/content";
import { t, tr } from "@/lib/i18n";
import { childrenOf, href, hrefById, pageById, withBase } from "@/lib/pages";
import type { L } from "@/lib/types";
import { cn } from "@/lib/utils";

const pageIcons: Record<string, PictogramName> = {
  clergy: "gospel", history: "church", gallery: "icon-frame", news: "bells", schedule: "calendar-feast",
  "request-a-service": "censer", zapiski: "slip", events: "bells", volunteer: "candle", cart: "tapers",
};

export function ButtonLink({ href: to, children, variant = "primary", className }: { href: string; children: React.ReactNode; variant?: "primary" | "outline" | "gold" | "ghost-light"; className?: string }) {
  return (
    <Link
      href={to}
      className={cn(
        "bell-hover inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 py-2 text-center font-button text-[1rem] transition-colors",
        variant === "primary" && "bg-green-800 text-cream-50 hover:bg-green-700",
        variant === "outline" && "border border-green-800/40 text-green-800 hover:border-gold-500 hover:bg-cream-50",
        variant === "gold" && "bg-gold-400 text-green-950 hover:bg-gold-200",
        variant === "ghost-light" && "border border-cream-50/50 text-cream-50 hover:border-gold-400 hover:text-gold-200",
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function Welcome({ lang, section }: SectionProps) {
  const row: PictogramName[] = ["church", "candle", "censer", "gospel", "chalice", "bells"];
  return (
    <SectionShell id={section.id}>
      <div className="container-sobor grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <p className="eyebrow text-gold-700">{tr(site.jurisdiction, lang)}</p>
          <h2 className="vyaz-title mt-2 text-[length:var(--text-h2)] text-green-800">{tr(section.title, lang)}</h2>
          <KokoshnikDivider className="mt-3 justify-start" />
          <Paragraphs text={tr(section.intro, lang)} className="mt-5 text-[1.08rem]" />
          <div className="mt-6 flex flex-wrap gap-3">
            <ButtonLink href={hrefById(lang, "our-parish")}>
              {tr(pageTitle("our-parish"), lang)} <ArrowRight className="size-4 rtl:rotate-180" aria-hidden />
            </ButtonLink>
            <ButtonLink href={hrefById(lang, "clergy")} variant="outline">
              {tr(pageTitle("clergy"), lang)}
            </ButtonLink>
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-sm">
          <div className="relative overflow-hidden rounded-t-[999px] border-2 border-gold-500 bg-green-800 px-8 pb-8 pt-14 text-gold-400 shadow-[0_24px_48px_-24px_rgba(16,48,31,0.7)]">
            <div className="absolute inset-2 rounded-t-[999px] border border-gold-500/40" aria-hidden />
            <div className="relative flex justify-center">
              <CrossWithInscription size={210} title="IC XC NIKA" />
            </div>
            <OrnamentBand className="relative mt-4 text-gold-500/60" height={10} />
            <ul className="relative mt-5 flex justify-center gap-3 text-gold-200" aria-hidden>
              {row.map((n) => (
                <li key={n}>
                  <Pictogram name={n} size={30} strokeWidth={1.5} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

function pageTitle(id: string): L {
  return pageById(id)?.title ?? { en: id };
}

export function RichText({ lang, section }: SectionProps) {
  const body = (section.props?.body as L | undefined) ?? undefined;
  return (
    <SectionShell id={section.id}>
      <SectionHeader title={tr(section.title, lang)} intro={tr(section.intro, lang)} sticky={section.stickyHeader} />
      <div className={cn("container-sobor", section.stickyHeader && "mt-8")}>
        <div className="mx-auto max-w-3xl rounded-lg border border-cream-300 bg-cream-50 p-6 text-[1.06rem] shadow-sm sm:p-10">
          <Paragraphs text={tr(body, lang)} />
        </div>
      </div>
    </SectionShell>
  );
}

export function SubpageCards({ lang, section, page }: SectionProps) {
  const kids = childrenOf(page).filter((c) => c.showInNav);
  if (!kids.length) return null;
  return (
    <SectionShell id={section.id}>
      <SectionHeader title={tr(section.title, lang)} intro={tr(section.intro, lang)} />
      <ul className="container-sobor grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {kids.map((k) => (
          <li key={k.id}>
            <Link
              href={href(lang, k.path)}
              className="bell-hover group flex h-full flex-col gap-4 rounded-lg border border-cream-300 bg-cream-50 p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-gold-500 hover:shadow-md"
            >
              <span className="flex size-16 items-center justify-center rounded-full bg-green-800 text-gold-400 ring-4 ring-gold-200/50">
                <Pictogram name={(k.icon as PictogramName) ?? pageIcons[k.id] ?? "church"} size={38} />
              </span>
              <span className="vyaz-title text-2xl text-green-800">{tr(k.title, lang)}</span>
              <span className="text-ink-muted">{tr(k.description, lang)}</span>
              <span className="mt-auto inline-flex items-center gap-2 font-button text-gold-700">
                {t("subpages.open", lang)} <ArrowRight className="size-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" aria-hidden />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}

export function ParishLife({ lang, section }: SectionProps) {
  const cards = [
    site.modules.zapiski && { id: "zapiski", icon: "slip" as const, title: t("parishLife.zapiski", lang), text: t("parishLife.zapiskiText", lang) },
    site.modules.requestService && { id: "request-a-service", icon: "censer" as const, title: t("parishLife.request", lang), text: t("parishLife.requestText", lang) },
    site.modules.getInvolved && { id: "get-involved", icon: "bells" as const, title: t("parishLife.involved", lang), text: t("parishLife.involvedText", lang) },
    site.modules.store && { id: "store", icon: "tapers" as const, title: t("parishLife.store", lang), text: t("parishLife.storeText", lang) },
  ].filter(Boolean) as { id: string; icon: PictogramName; title: string; text: string }[];
  if (!cards.length) return null;
  return (
    <SectionShell id={section.id} tone="paper">
      <SectionHeader title={tr(section.title, lang)} intro={tr(section.intro, lang)} />
      <ul className="container-sobor grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <li key={c.id}>
            <Link href={hrefById(lang, c.id)} className="bell-hover group flex h-full flex-col overflow-hidden rounded-lg border border-cream-300 bg-cream-50 shadow-sm transition hover:-translate-y-0.5 hover:border-gold-500 hover:shadow-md">
              <IllustrationTile name={c.icon} tone="green" className="aspect-[16/10]" />
              <span className="flex flex-1 flex-col gap-2 p-5">
                <span className="vyaz-title text-[1.4rem] text-green-800">{c.title}</span>
                <span className="text-[0.98rem] text-ink-muted">{c.text}</span>
                <span className="mt-auto inline-flex items-center gap-2 pt-2 font-button text-gold-700">
                  <SwingingBell /> {t("subpages.open", lang)}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}

export function DonateBand({ lang, section }: SectionProps) {
  const donate = hrefById(lang, "donate");
  return (
    <section id={section.id} className="relative overflow-hidden bg-green-800 py-16 text-cream-50">
      <OrnamentBand className="absolute inset-x-0 top-0 text-gold-500/50" height={10} />
      <div className="container-sobor relative grid items-center gap-8 md:grid-cols-[auto_1fr_auto]">
        <div className="hidden text-gold-400 md:block">
          <Pictogram name="candle" size={96} strokeWidth={1.2} />
        </div>
        <div>
          <h2 className="vyaz-title text-[length:var(--text-h2)] text-gold-200">{tr(section.title, lang) || t("donateBand.title", lang)}</h2>
          <p className="mt-2 max-w-2xl text-cream-100/90">{tr(section.intro, lang) || t("donateBand.text", lang)}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href={donate} variant="gold">
            <SwingingBell /> {t("donate.oneTime", lang)}
          </ButtonLink>
          <ButtonLink href={`${donate}?frequency=monthly`} variant="ghost-light">
            {t("donate.monthly", lang)}
          </ButtonLink>
        </div>
      </div>
      <OrnamentBand className="absolute inset-x-0 bottom-0 text-gold-500/50" height={10} />
    </section>
  );
}

export function MapPlaceholder({ lang, className }: { lang: string; className?: string }) {
  if (site.contact.mapEmbedUrl) {
    return <iframe title={t("visit.openMaps", lang)} src={site.contact.mapEmbedUrl} className={cn("h-full min-h-72 w-full rounded-lg border-0", className)} loading="lazy" />;
  }
  return (
    <figure className={cn("relative overflow-hidden rounded-lg border border-cream-300 bg-cream-50", className)}>
      <svg viewBox="0 0 400 280" className="h-full w-full" role="img" aria-label={t("visit.mapPlaceholder", lang)} preserveAspectRatio="xMidYMid slice">
        <rect width="400" height="280" fill="var(--sobor-cream-100)" />
        <path d="M0 210c60-20 120-10 180 10s140 30 220 0v70H0z" fill="#cfe0dc" />
        <rect x="236" y="34" width="120" height="86" rx="10" fill="var(--sobor-green-100)" />
        <g stroke="var(--sobor-cream-300)" strokeWidth="14" fill="none" strokeLinecap="round">
          <path d="M-10 140H410M150 -10V290M300 -10L260 290" />
        </g>
        <g stroke="var(--sobor-cream-200)" strokeWidth="6" fill="none" strokeLinecap="round">
          <path d="M-10 70H410M60 -10V290M220 140V-10M-10 190H160" />
        </g>
        <g color="var(--sobor-green-800)">
          <path d="M176 128s18-18 18-33a18 18 0 0 0-36 0c0 15 18 33 18 33z" fill="var(--sobor-green-800)" />
          <g color="var(--sobor-gold-400)">
            <OrthodoxCross x={170.6} y={81} width={10.8} height={18} />
          </g>
        </g>
      </svg>
      <figcaption className="absolute inset-x-3 bottom-3 rounded bg-cream-50/90 px-3 py-2 text-[0.8rem] text-ink-muted shadow-sm">{t("visit.mapPlaceholder", lang)}</figcaption>
    </figure>
  );
}

export function addressLines() {
  const a = site.contact.address;
  return [a.line1, a.line2, `${a.city}, ${a.region} ${a.postalCode}`].filter(Boolean) as string[];
}

export function mapsUrl() {
  if (site.contact.directionsUrl) return site.contact.directionsUrl;
  const a = site.contact.address;
  return `https://www.openstreetmap.org/search?query=${encodeURIComponent(`${a.line1}, ${a.city}, ${a.region} ${a.postalCode}`)}`;
}

export function Visit({ lang, section }: SectionProps) {
  return (
    <SectionShell id={section.id}>
      <SectionHeader title={tr(section.title, lang)} intro={tr(section.intro, lang)} />
      <div className="container-sobor grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <MapPlaceholder lang={lang} className="aspect-[4/3] lg:aspect-auto" />
        <div className="space-y-6">
          <div className="rounded-lg border border-cream-300 bg-cream-50 p-6">
            <h3 className="flex items-center gap-2 text-xl text-green-800">
              <MapPin className="size-5 text-gold-600" aria-hidden /> {t("visit.address", lang)}
            </h3>
            <address className="mt-2 not-italic">{addressLines().map((l) => <span key={l} className="block">{l}</span>)}</address>
            <div className="mt-4 flex flex-wrap gap-3">
              <ButtonLink href={hrefById(lang, "contact", "directions")}>
                <Navigation className="size-4" aria-hidden /> {t("visit.directions", lang)}
              </ButtonLink>
              <a href={mapsUrl()} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-green-800/40 px-5 font-button text-green-800 hover:border-gold-500">
                {t("visit.openMaps", lang)} <ExternalLink className="size-4" aria-hidden />
              </a>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-cream-300 bg-cream-50 p-5">
              <h3 className="text-lg text-green-800">{t("visit.parking", lang)}</h3>
              <p className="mt-1 text-[0.95rem] text-ink-muted">{tr(site.contact.parking, lang)}</p>
            </div>
            <div className="rounded-lg border border-cream-300 bg-cream-50 p-5">
              <h3 className="flex items-center gap-2 text-lg text-green-800">
                <Clock className="size-4 text-gold-600" aria-hidden /> {t("visit.office", lang)}
              </h3>
              <p className="mt-1 text-[0.95rem] text-ink-muted">{tr(site.contact.officeHours, lang)}</p>
              <p className="mt-2 space-y-1 text-[0.95rem]">
                <a className="flex items-center gap-2 text-green-800 hover:underline" href={`tel:${site.contact.phone.replace(/\D/g, "")}`}>
                  <Phone className="size-4" aria-hidden /> {site.contact.phone}
                </a>
                <a className="flex items-center gap-2 break-all text-green-800 hover:underline" href={`mailto:${site.contact.email}`}>
                  <Mail className="size-4 shrink-0" aria-hidden /> {site.contact.email}
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

export function Credits({ lang, section }: SectionProps) {
  return (
    <SectionShell id={section.id}>
      <div className="container-sobor">
        <p className="mx-auto mb-8 max-w-2xl text-center text-ink-muted">{t("credits.intro", lang)}</p>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {imageSources.sources.map((s) => (
            <li key={s.id} className="overflow-hidden rounded-lg border border-cream-300 bg-cream-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={withBase(s.file.replace(".jpg", "-sm.jpg"))} alt="" className="aspect-[4/3] w-full object-cover" loading="lazy" />
              <dl className="space-y-1 p-4 text-[0.9rem]">
                <dt className="font-heading text-green-800">{s.title.replace("File:", "")}</dt>
                <dd><span className="text-ink-muted">{t("credits.author", lang)}:</span> {s.author}</dd>
                <dd><span className="text-ink-muted">{t("credits.license", lang)}:</span> {s.license}</dd>
                <dd>
                  <a className="text-green-700 underline underline-offset-4" href={s.source} target="_blank" rel="noopener noreferrer">
                    {t("credits.source", lang)}: Wikimedia Commons
                  </a>
                </dd>
              </dl>
            </li>
          ))}
        </ul>
      </div>
    </SectionShell>
  );
}

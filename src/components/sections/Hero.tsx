"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { ArrowRight, MapPin, Navigation, Phone, Radio } from "lucide-react";
import type { SectionProps } from "./SectionRenderer";
import { DomeSkyline, skylineHeight, KokoshnikDivider, OrnamentBand } from "@/components/sacred/Ornaments";
import { Pictogram, SwingingBell } from "@/components/sacred/Pictograms";
import { site } from "@/lib/content";
import { formatTime, t, tr } from "@/lib/i18n";
import { href, hrefById, withBase } from "@/lib/pages";
import { isLiveNow, nextServices, primaryFeast, weekdayDedication, type ParishNow } from "@/lib/calendar";
import { oldStyleLabel, relativeDay } from "@/lib/format";
import { useParishNow, usePrefersReducedMotion } from "@/lib/hooks";
import { cn } from "@/lib/utils";

export function LiveBadge({ lang, className, asLink = true }: { lang: string; className?: string; asLink?: boolean }) {
  const cls = cn("inline-flex items-center gap-2 rounded-full bg-kinovar px-3.5 py-1.5 font-button text-[0.9rem] text-cream-50 shadow-lg ring-1 ring-cream-50/30", asLink && "hover:bg-[#b8322a]", className);
  const body = (
    <>
      <span className="live-dot size-2 rounded-full bg-cream-50" aria-hidden />
      {t("hero.liveNow", lang)}
      {asLink ? <span className="hidden sm:inline">· {t("hero.watch", lang)}</span> : null}
    </>
  );
  if (!asLink) return <span className={cls}>{body}</span>;
  return (
    <Link href={hrefById(lang, "livestream")} className={cls}>
      {body}
    </Link>
  );
}

function rankLabel(rank: string, lang: string) {
  return t(`feast.${rank}` as "feast.great", lang);
}

function StripSkeleton() {
  return (
    <div className="space-y-2" aria-hidden>
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-5 animate-pulse rounded bg-cream-50/10" style={{ width: `${85 - i * 12}%` }} />
      ))}
    </div>
  );
}

function NextServices({ lang, now }: { lang: string; now: ParishNow | null }) {
  const list = now ? nextServices(now, 3) : [];
  return (
    <div className="min-w-0">
      <h2 className="eyebrow flex items-center gap-2 text-gold-400">
        <Pictogram name="church" size={20} /> {t("hero.nextServices", lang)}
      </h2>
      <div className="mt-3" aria-live="polite" aria-busy={!now}>
        {!now ? (
          <StripSkeleton />
        ) : (
          <ol className="space-y-2.5">
            {list.map((s) => (
              <li key={s.id} className="flex items-baseline gap-3">
                <span className="w-[5.5rem] shrink-0 text-[0.85rem] text-cream-100/75 sm:w-24">{relativeDay(s.day, now.day, lang)}</span>
                <span className="w-16 shrink-0 font-heading tabular-nums text-gold-200">{formatTime(s.time, lang)}</span>
                <span className="min-w-0 text-cream-50">
                  {tr(s.title, lang)}
                  {s.streamed ? <Radio className="ms-1.5 inline size-3.5 text-gold-400" aria-label={t("streamed", lang)} /> : null}
                </span>
              </li>
            ))}
          </ol>
        )}
      </div>
      <Link href={hrefById(lang, "schedule")} className="mt-3 inline-flex items-center gap-1.5 font-button text-[0.92rem] text-gold-200 hover:text-gold-400">
        {t("hero.fullSchedule", lang)} <ArrowRight className="size-3.5 rtl:rotate-180" aria-hidden />
      </Link>
    </div>
  );
}

function TodayFeast({ lang, now }: { lang: string; now: ParishNow | null }) {
  const feast = now ? primaryFeast(now.day) : undefined;
  const tomorrow = now ? primaryFeast(now.day + 1) : undefined;
  const os = now ? oldStyleLabel(now.day, lang) : null;
  return (
    <div className="min-w-0">
      <h2 className="eyebrow flex items-center gap-2 text-gold-400">
        <Pictogram name="calendar-feast" size={20} /> {t("hero.todayFeast", lang)}
      </h2>
      <div className="mt-3" aria-live="polite" aria-busy={!now}>
        {!now ? (
          <StripSkeleton />
        ) : (
          <>
            {feast ? (
              <p className={cn("eyebrow mb-1", feast.rank === "minor" ? "text-cream-100/70" : "text-[#e9a49b]")}>{rankLabel(feast.rank, lang)}</p>
            ) : null}
            <p className="font-heading text-[1.2rem] leading-snug text-cream-50">{tr(feast ? feast.name : weekdayDedication(now.day), lang)}</p>
            {feast ? <p className="mt-1 text-[0.88rem] text-cream-100/75">{tr(weekdayDedication(now.day), lang)}</p> : null}
            {tomorrow && tomorrow.rank !== "minor" ? (
              <p className="mt-1 text-[0.88rem] text-gold-200">
                {t("schedule.eveOf", lang)}: {tr(tomorrow.name, lang)}
              </p>
            ) : null}
            {os ? <p className="mt-2 text-[0.85rem] text-cream-100/70">{os}</p> : null}
          </>
        )}
      </div>
    </div>
  );
}

function FindUs({ lang }: { lang: string }) {
  const a = site.contact.address;
  return (
    <div className="min-w-0">
      <h2 className="eyebrow flex items-center gap-2 text-gold-400">
        <MapPin className="size-4" aria-hidden /> {t("hero.directions", lang)}
      </h2>
      <address className="mt-3 not-italic text-cream-50">
        {a.line1}
        <br />
        {a.city}, {a.region} {a.postalCode}
      </address>
      <a href={`tel:${site.contact.phone.replace(/\D/g, "")}`} className="mt-1.5 inline-flex items-center gap-1.5 text-[0.92rem] text-cream-100/85 hover:text-gold-200">
        <Phone className="size-3.5" aria-hidden /> {site.contact.phone}
      </a>
      <div>
        <Link
          href={hrefById(lang, "contact", "directions")}
          className="bell-hover mt-3 inline-flex min-h-10 items-center gap-2 rounded-full border border-gold-500/60 px-4 font-button text-[0.95rem] text-gold-200 hover:bg-green-800"
        >
          <Navigation className="size-4" aria-hidden /> {t("hero.getDirections", lang)}
        </Link>
      </div>
    </div>
  );
}

export function Hero({ lang, section }: SectionProps) {
  const now = useParishNow();
  const live = isLiveNow(now);
  const reduced = usePrefersReducedMotion();
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduced) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      if (bgRef.current && y < window.innerHeight * 1.5) bgRef.current.style.transform = `translate3d(0, ${y * 0.28}px, 0) scale(1.06)`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [reduced]);

  const hero = site.hero;
  return (
    <section id={section.id} className="relative isolate overflow-hidden bg-green-950 text-cream-50">
      <div className="relative flex min-h-[min(88svh,780px)] flex-col">
        <div ref={bgRef} className="absolute inset-x-0 -top-[6%] h-[112%] origin-top will-change-transform" style={{ transform: "scale(1.06)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={withBase(hero.image)} alt={tr(hero.imageAlt, lang)} className="size-full object-cover object-[50%_40%]" fetchPriority="high" />
        </div>
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,rgba(11,33,24,0.25),rgba(11,33,24,0.75)_75%)]" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-green-950/75 via-green-950/10 to-green-950/30" />

        <div className="container-sobor relative z-10 flex flex-1 flex-col items-center justify-center pb-36 pt-[calc(var(--header-h)+3.5rem)] text-center sm:pb-44">
          {live ? <LiveBadge lang={lang} className="mb-5" /> : null}
          <p className="eyebrow text-gold-200 [text-shadow:0_1px_6px_rgba(0,0,0,0.6)]">{tr(site.jurisdiction, lang)}</p>
          <h1 className="vyaz-title mt-3 max-w-5xl text-[length:var(--text-display)] text-cream-50 [text-shadow:0_2px_18px_rgba(0,0,0,0.55),0_0_2px_rgba(0,0,0,0.4)]">
            {tr(hero.title, lang)}
          </h1>
          <KokoshnikDivider className="mt-4 text-gold-400" />
          <p className="mt-4 max-w-2xl text-[1.08rem] text-cream-50 [text-shadow:0_1px_8px_rgba(0,0,0,0.7)] sm:text-[1.18rem]">{tr(hero.subtitle, lang)}</p>
          <div className="mt-7 flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:items-center">
            {hero.ctas.map((c) => (
              <Link
                key={c.id}
                href={href(lang, c.href)}
                className={cn(
                  "bell-hover inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 font-button text-[1.05rem] transition-colors",
                  c.variant === "primary" ? "bg-gold-400 text-green-950 hover:bg-gold-200" : "border border-cream-50/60 bg-green-950/30 text-cream-50 backdrop-blur-sm hover:border-gold-400 hover:text-gold-200",
                )}
              >
                {c.variant === "primary" ? <SwingingBell /> : null}
                {tr(c.label, lang)}
              </Link>
            ))}
          </div>
          {hero.showCommemorationShortcut && site.modules.zapiski ? (
            <Link href={hrefById(lang, "zapiski")} className="mt-5 inline-flex items-center gap-2 rounded px-2 py-1 text-[0.95rem] text-cream-100 underline decoration-gold-500/70 underline-offset-4 [text-shadow:0_1px_6px_rgba(0,0,0,0.7)] hover:text-gold-200">
              <Pictogram name="slip" size={20} className="text-gold-400" />
              {t("hero.commemoration", lang)}
            </Link>
          ) : null}
        </div>
        <DomeSkyline className={`pointer-events-none absolute inset-x-0 bottom-0 z-[5] w-full text-green-900 ${skylineHeight}`} />
      </div>

      <div className="relative z-10 bg-green-900">
        <div className="container-sobor">
          <div className="grid gap-8 border-t border-gold-500/30 py-8 md:grid-cols-2 md:gap-10 lg:grid-cols-[1.35fr_1fr_0.9fr] lg:divide-x lg:divide-gold-500/25 lg:rtl:divide-x-reverse [&>*]:lg:px-8 [&>*:first-child]:lg:ps-0 [&>*:last-child]:lg:pe-0">
            <NextServices lang={lang} now={now} />
            <TodayFeast lang={lang} now={now} />
            <FindUs lang={lang} />
          </div>
        </div>
        <OrnamentBand className="text-gold-500/60" height={10} />
      </div>
    </section>
  );
}

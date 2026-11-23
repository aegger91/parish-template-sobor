"use client";

import Link from "next/link";
import { ArrowRight, ExternalLink, Radio } from "lucide-react";
import type { SectionProps } from "./SectionRenderer";
import { SectionShell } from "./SectionShell";
import { LiveBadge } from "./Hero";
import { DomeSkyline } from "@/components/sacred/Ornaments";
import { CrossWithInscription } from "@/components/sacred/OrthodoxCross";
import { ServiceRowButton } from "@/components/schedule/OccurrenceDetail";
import { isLiveNow, nextServices, serviceInProgress, type ParishNow } from "@/lib/calendar";
import { site } from "@/lib/content";
import { relativeDay } from "@/lib/format";
import { useParishNow } from "@/lib/hooks";
import { formatTime, t, tr } from "@/lib/i18n";
import { hrefById } from "@/lib/pages";
import { cn } from "@/lib/utils";

function Player({ lang, live, className }: { lang: string; live: boolean; className?: string }) {
  if (site.livestream.embedUrl) {
    return (
      <div className={cn("aspect-video overflow-hidden rounded-lg bg-black", className)}>
        <iframe src={site.livestream.embedUrl} title={t("live.title", lang)} className="size-full" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
      </div>
    );
  }
  return (
    <div className={cn("relative flex aspect-video flex-col items-center justify-center overflow-hidden rounded-lg border border-gold-500/40 bg-green-950 p-6 text-center text-cream-100", className)}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(201,162,76,0.18),transparent_65%)]" aria-hidden />
      {live ? <LiveBadge lang={lang} asLink={false} className="absolute start-3 top-3" /> : null}
      <CrossWithInscription size={88} className="relative text-gold-400" />
      <p className="relative mt-4 max-w-md text-[0.92rem] text-cream-100/80">{t("live.placeholder", lang)}</p>
      <DomeSkyline className="absolute inset-x-0 bottom-0 h-10 w-full text-green-900" />
    </div>
  );
}

function StreamStatus({ lang, now }: { lang: string; now: ParishNow | null }) {
  const live = isLiveNow(now);
  const current = now ? serviceInProgress(now) : undefined;
  const upcoming = now ? nextServices(now, 3, { streamedOnly: true }) : [];
  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-lg border border-cream-300 bg-cream-50 p-5">
        {live ? (
          <p className="flex items-center gap-2 font-heading text-[1.2rem] text-kinovar">
            <span className="live-dot size-2.5 rounded-full bg-kinovar" aria-hidden /> {t("hero.liveNow", lang)}
          </p>
        ) : (
          <p className="font-heading text-[1.2rem] text-green-800">{now ? t("live.offline", lang) : t("loading", lang)}</p>
        )}
        {current ? <p className="mt-1 text-ink-muted">{tr(current.title, lang)}</p> : null}
        <p className="mt-2 text-[0.9rem] text-ink-muted">{tr(site.livestream.provider, lang)}</p>
        {site.livestream.watchUrl ? (
          <a href={site.livestream.watchUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-2 font-button text-green-800 underline underline-offset-4">
            {t("hero.watch", lang)} <ExternalLink className="size-4" aria-hidden />
          </a>
        ) : null}
      </div>
      <div className="rounded-lg border border-cream-300 bg-cream-50 p-5">
        <h3 className="eyebrow text-gold-700">{t("live.next", lang)}</h3>
        <ul className="mt-3 space-y-2.5" aria-busy={!now}>
          {!now
            ? [0, 1, 2].map((i) => <li key={i} className="h-5 animate-pulse rounded bg-cream-200" />)
            : upcoming.map((s) => (
                <li key={s.id}>
                  <ServiceRowButton lang={lang} occurrence={s} className="flex gap-3 rounded-md px-1 py-0.5 hover:bg-cream-200/80">
                    <span className="w-24 shrink-0 text-[0.88rem] text-ink-muted">{relativeDay(s.day, now.day, lang)}</span>
                    <span className="w-14 shrink-0 tabular-nums text-green-700">{formatTime(s.time, lang)}</span>
                    <span className="min-w-0">{tr(s.title, lang)}</span>
                  </ServiceRowButton>
                </li>
              ))}
        </ul>
      </div>
    </div>
  );
}

export function Livestream({ lang, section }: SectionProps) {
  const now = useParishNow();
  const live = isLiveNow(now);
  return (
    <SectionShell id={section.id}>
      <div className="container-sobor grid gap-6 lg:grid-cols-[1.7fr_1fr]">
        <div>
          {section.title ? <h2 className="vyaz-title mb-4 text-[length:var(--text-h2)] text-green-800">{tr(section.title, lang)}</h2> : null}
          <Player lang={lang} live={live} />
          {section.intro ? <p className="mt-4 text-ink-muted">{tr(section.intro, lang)}</p> : null}
        </div>
        <StreamStatus lang={lang} now={now} />
      </div>
    </SectionShell>
  );
}

export function LivestreamTeaser({ lang, section }: SectionProps) {
  const now = useParishNow();
  const live = isLiveNow(now);
  const next = now ? nextServices(now, 1, { streamedOnly: true })[0] : undefined;
  return (
    <section id={section.id} className="bg-green-900 py-14 text-cream-50 sm:py-18">
      <div className="container-sobor grid items-center gap-8 md:grid-cols-[1fr_1.1fr]">
        <div>
          <p className="eyebrow flex items-center gap-2 text-gold-400">
            <Radio className="size-4" aria-hidden /> {t("live.title", lang)}
          </p>
          <h2 className="vyaz-title mt-2 text-[length:var(--text-h2)] text-gold-200">{tr(section.title, lang)}</h2>
          <p className="mt-3 max-w-xl text-cream-100/90">{tr(section.intro, lang) || t("live.teaserText", lang)}</p>
          <p className="mt-4 text-[0.95rem] text-cream-100/85" aria-live="polite">
            {live ? (
              <span className="font-heading text-[#f0b0a6]">{t("hero.liveNow", lang)}</span>
            ) : next && now ? (
              <>
                {t("live.next", lang)}: <span className="text-gold-200">{relativeDay(next.day, now.day, lang)}, {formatTime(next.time, lang)}</span> · {tr(next.title, lang)}
              </>
            ) : null}
          </p>
          <Link href={hrefById(lang, "livestream")} className="bell-hover mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-gold-400 px-5 font-button text-green-950 hover:bg-gold-200">
            {t("live.openPage", lang)} <ArrowRight className="size-4 rtl:rotate-180" aria-hidden />
          </Link>
        </div>
        <Link href={hrefById(lang, "livestream")} aria-label={t("live.openPage", lang)} className="block rounded-lg ring-gold-400 transition hover:ring-2">
          <Player lang={lang} live={live} className="[&_p]:hidden sm:[&_p]:block" />
        </Link>
      </div>
    </section>
  );
}

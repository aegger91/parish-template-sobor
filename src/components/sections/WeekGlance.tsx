"use client";

import Link from "next/link";
import { ArrowRight, Radio } from "lucide-react";
import type { SectionProps } from "./SectionRenderer";
import { SectionHeader, SectionShell } from "./SectionShell";
import { ServiceRowButton } from "@/components/schedule/OccurrenceDetail";
import { primaryFeast, servicesOn } from "@/lib/calendar";
import { formatDay } from "@/lib/format";
import { useParishNow } from "@/lib/hooks";
import { formatTime, t, tr } from "@/lib/i18n";
import { hrefById } from "@/lib/pages";
import { cn } from "@/lib/utils";

export function WeekGlance({ lang, section }: SectionProps) {
  const now = useParishNow();
  const days = now ? Array.from({ length: 7 }, (_, i) => now.day + i) : [];
  return (
    <SectionShell id={section.id} className="pt-0 sm:pt-0">
      <SectionHeader
        title={tr(section.title, lang)}
        intro={tr(section.intro, lang)}
        sticky={section.stickyHeader}
        actions={
          <Link href={hrefById(lang, "schedule")} className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-green-800/30 px-4 font-button text-[0.95rem] text-green-800 hover:border-gold-500">
            {t("hero.fullSchedule", lang)} <ArrowRight className="size-4 rtl:rotate-180" aria-hidden />
          </Link>
        }
      />
      <div className="container-sobor mt-8">
        {!now ? (
          <div className="grid gap-3 md:grid-cols-7" aria-busy="true" aria-label={t("loading", lang)}>
            {Array.from({ length: 7 }, (_, i) => (
              <div key={i} className="h-40 animate-pulse rounded-lg bg-cream-200" />
            ))}
          </div>
        ) : (
          <ol className="grid gap-3 md:grid-cols-7">
            {days.map((d) => {
              const feast = primaryFeast(d);
              const services = servicesOn(d);
              const isToday = d === now.day;
              const big = feast && feast.rank !== "minor";
              return (
                <li
                  key={d}
                  className={cn(
                    "flex min-w-0 flex-col rounded-lg border bg-cream-50 p-3.5 md:min-h-44",
                    isToday ? "border-gold-500 ring-2 ring-gold-400/40" : "border-cream-300",
                    big && "bg-[linear-gradient(180deg,var(--sobor-kinovar-soft),var(--sobor-cream-50)_60%)]",
                  )}
                >
                  <p className="flex items-baseline justify-between gap-2 md:block">
                    <span className={cn("font-heading text-[1.05rem]", big ? "text-kinovar" : "text-green-800")}>
                      {formatDay(d, lang, { weekday: "long" })}
                    </span>
                    <span className="text-[0.85rem] text-ink-muted md:block">
                      {isToday ? `${t("today", lang)} · ` : ""}
                      {formatDay(d, lang, { day: "numeric", month: "short" })}
                    </span>
                  </p>
                  {feast ? (
                    <p className={cn("mt-1.5 text-[0.85rem] leading-normal", big ? "font-heading text-kinovar" : "text-gold-700")}>{tr(feast.name, lang)}</p>
                  ) : null}
                  <ul className="mt-2 space-y-2 text-[0.9rem] leading-normal">
                    {services.map((s) => (
                      <li key={s.id}>
                        <ServiceRowButton lang={lang} occurrence={s} className="flex gap-2 rounded-md px-1 py-0.5 hover:bg-cream-200/80 md:block">
                          <span className="block shrink-0 font-heading tabular-nums text-green-700 md:text-[0.82rem]">{formatTime(s.time, lang)}</span>
                          <span className="min-w-0 hyphens-auto">
                            {tr(s.title, lang)}
                            {s.streamed ? <Radio className="ms-1 inline size-3 text-gold-600" aria-label={t("streamed", lang)} /> : null}
                          </span>
                        </ServiceRowButton>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </SectionShell>
  );
}

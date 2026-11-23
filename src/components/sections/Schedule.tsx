"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, List, Radio } from "lucide-react";
import type { SectionProps } from "./SectionRenderer";
import { SectionHeader, SectionShell } from "./SectionShell";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { OrthodoxCross } from "@/components/sacred/OrthodoxCross";
import { civil, dayNum, primaryFeast, servicesOn, startOfWeek, churchDate, type DayNum } from "@/lib/calendar";
import { site } from "@/lib/content";
import { formatDay, oldStyleLabel } from "@/lib/format";
import { useParishNow } from "@/lib/hooks";
import { formatTime, localeOf, t, tr } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type View = "week" | "month";

function osShort(n: DayNum, lang: string) {
  if (site.calendar !== "julian") return null;
  const cd = churchDate(n);
  return new Intl.DateTimeFormat(localeOf(lang), { timeZone: "UTC", day: "numeric", month: "short" }).format(new Date(Date.UTC(2001, cd.m - 1, cd.d)));
}

function DayBlock({ n, today, lang, compact }: { n: DayNum; today: DayNum; lang: string; compact?: boolean }) {
  const feast = primaryFeast(n);
  const big = feast && feast.rank !== "minor";
  const services = servicesOn(n);
  const isToday = n === today;
  return (
    <div
      className={cn(
        "flex h-full min-w-0 flex-col rounded-lg border bg-cream-50 p-3",
        isToday ? "border-gold-500 ring-2 ring-gold-400/40" : "border-cream-300",
        big && "border-kinovar/40 bg-[linear-gradient(180deg,var(--sobor-kinovar-soft),var(--sobor-cream-50)_55%)]",
        n < today && "opacity-70",
      )}
    >
      <div className="flex items-baseline justify-between gap-2">
        <p className={cn("font-heading", big ? "text-kinovar" : "text-green-800")}>
          {formatDay(n, lang, compact ? { weekday: "short", day: "numeric" } : { weekday: "long", day: "numeric", month: "long" })}
        </p>
        {isToday ? <span className="rounded-full bg-gold-400 px-2 text-[0.75rem] font-button text-green-950">{t("today", lang)}</span> : null}
      </div>
      {site.calendar === "julian" ? <p className="text-[0.78rem] text-ink-muted">{oldStyleLabel(n, lang)}</p> : null}
      {feast ? (
        <p className={cn("mt-1.5 flex items-start gap-1.5 text-[0.88rem] leading-snug", big ? "font-heading text-kinovar" : "text-gold-700")}>
          {big ? <OrthodoxCross size={14} className="mt-0.5 shrink-0" /> : null}
          <span>{tr(feast.name, lang)}</span>
        </p>
      ) : null}
      {services.length ? (
        <ul className="mt-2 space-y-1.5 text-[0.92rem]">
          {services.map((s) => (
            <li key={s.id} className="flex gap-2">
              <span className="w-14 shrink-0 tabular-nums text-green-700">{formatTime(s.time, lang)}</span>
              <span className="min-w-0">
                {tr(s.title, lang)}
                {s.streamed ? <Radio className="ms-1 inline size-3.5 text-gold-600" aria-label={t("streamed", lang)} /> : null}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-[0.85rem] italic text-ink-muted">{t("schedule.noServices", lang)}</p>
      )}
    </div>
  );
}

function MonthCell({ n, inMonth, today, lang }: { n: DayNum; inMonth: boolean; today: DayNum; lang: string }) {
  const feast = primaryFeast(n);
  const big = feast && feast.rank !== "minor";
  const services = servicesOn(n);
  const isToday = n === today;
  const os = osShort(n, lang);
  return (
    <div
      className={cn(
        "flex min-h-32 min-w-0 flex-col gap-1 border-b border-e border-cream-300 p-2 text-[0.8rem]",
        !inMonth && "bg-cream-100/60 text-ink-muted/70",
        inMonth && "bg-cream-50",
        big && inMonth && "bg-kinovar-soft",
      )}
    >
      <div className="flex items-baseline justify-between gap-1">
        <span className={cn("flex size-7 items-center justify-center rounded-full font-heading text-[0.95rem]", isToday && "bg-gold-400 text-green-950", big && !isToday && "text-kinovar")}>
          {civil(n).d}
        </span>
        {os ? <span className="text-[0.7rem] text-ink-muted">{os}</span> : null}
      </div>
      {feast ? <p className={cn("line-clamp-2 leading-tight", big ? "font-heading text-kinovar" : "text-gold-700")}>{tr(feast.name, lang)}</p> : null}
      <ul className="space-y-0.5">
        {services.map((s) => (
          <li key={s.id} className="flex gap-1 leading-tight">
            <span className="shrink-0 tabular-nums text-green-700">{formatTime(s.time, lang)}</span>
            <span className="line-clamp-1 min-w-0">{tr(s.title, lang)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Schedule({ lang, section }: SectionProps) {
  const now = useParishNow();
  const [view, setView] = useState<View>("week");
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const v = new URLSearchParams(window.location.search).get("view");
    if (v === "month" || v === "week") setView(v);
  }, []);

  const changeView = (v: View) => {
    setView(v);
    setOffset(0);
    const url = new URL(window.location.href);
    url.searchParams.set("view", v);
    window.history.replaceState(null, "", url);
  };

  const weekdays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => new Intl.DateTimeFormat(localeOf(lang), { weekday: "short", timeZone: "UTC" }).format(new Date(Date.UTC(2024, 0, 7 + ((i + site.weekStartsOn) % 7))))),
    [lang],
  );

  const range = useMemo(() => {
    if (!now) return null;
    if (view === "week") {
      const start = startOfWeek(now.day) + offset * 7;
      const days = Array.from({ length: 7 }, (_, i) => start + i);
      return { days, label: "" };
    }
    const c = civil(now.day);
    const m0 = new Date(Date.UTC(c.y, c.m - 1 + offset, 1));
    const first = dayNum(m0.getUTCFullYear(), m0.getUTCMonth() + 1, 1);
    const nextMonth = new Date(Date.UTC(m0.getUTCFullYear(), m0.getUTCMonth() + 1, 1));
    const last = dayNum(nextMonth.getUTCFullYear(), nextMonth.getUTCMonth() + 1, 1) - 1;
    const gridStart = startOfWeek(first);
    const gridEnd = startOfWeek(last) + 6;
    const days = Array.from({ length: gridEnd - gridStart + 1 }, (_, i) => gridStart + i);
    const label = new Intl.DateTimeFormat(localeOf(lang), { month: "long", year: "numeric", timeZone: "UTC" }).format(m0);
    return { days, label, first, last };
  }, [now, view, offset, lang]);

  const weekLabel =
    range && view === "week"
      ? `${formatDay(range.days[0], lang, { day: "numeric", month: "short" })} · ${formatDay(range.days[6], lang, { day: "numeric", month: "short", year: "numeric" })}`
      : range?.label;

  const navBtn = "inline-flex size-10 items-center justify-center rounded-full border border-green-800/25 text-green-800 hover:border-gold-500 hover:bg-cream-50";

  return (
    <SectionShell id={section.id} className="pt-0 sm:pt-0">
      <SectionHeader
        title={tr(section.title, lang)}
        sticky={section.stickyHeader}
        actions={
          <ToggleGroup
            type="single"
            value={view}
            onValueChange={(v) => v && changeView(v as View)}
            aria-label={t("schedule.view", lang)}
            className="rounded-full border border-green-800/25 bg-cream-50 p-1"
          >
            <ToggleGroupItem value="week" className="h-9 rounded-full px-4 font-button data-[state=on]:bg-green-800 data-[state=on]:text-cream-50">
              <List className="size-4" aria-hidden /> {t("schedule.weekly", lang)}
            </ToggleGroupItem>
            <ToggleGroupItem value="month" className="h-9 rounded-full px-4 font-button data-[state=on]:bg-green-800 data-[state=on]:text-cream-50">
              <CalendarDays className="size-4" aria-hidden /> {t("schedule.monthly", lang)}
            </ToggleGroupItem>
          </ToggleGroup>
        }
      />
      <div className="container-sobor mt-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button type="button" className={navBtn} onClick={() => setOffset((o) => o - 1)} aria-label={t(view === "week" ? "schedule.prevWeek" : "schedule.prevMonth", lang)}>
              <ChevronLeft className="size-5 rtl:rotate-180" aria-hidden />
            </button>
            <button type="button" className={navBtn} onClick={() => setOffset((o) => o + 1)} aria-label={t(view === "week" ? "schedule.nextWeek" : "schedule.nextMonth", lang)}>
              <ChevronRight className="size-5 rtl:rotate-180" aria-hidden />
            </button>
            <button type="button" onClick={() => setOffset(0)} disabled={offset === 0} className="h-10 rounded-full px-4 font-button text-green-800 hover:bg-cream-50 disabled:opacity-40">
              {t("schedule.today", lang)}
            </button>
          </div>
          <p className="font-heading text-[1.25rem] text-green-800 first-letter:uppercase" aria-live="polite">
            {weekLabel ?? t("loading", lang)}
          </p>
        </div>

        {!now || !range ? (
          <div className="grid gap-3 md:grid-cols-7" aria-busy="true">
            {Array.from({ length: 7 }, (_, i) => (
              <div key={i} className="h-48 animate-pulse rounded-lg bg-cream-200" />
            ))}
          </div>
        ) : view === "week" ? (
          <ol className="grid gap-3 md:grid-cols-2 lg:grid-cols-7">
            {range.days.map((d) => (
              <li key={d} className="min-w-0">
                <DayBlock n={d} today={now.day} lang={lang} />
              </li>
            ))}
          </ol>
        ) : (
          <>
            <div className="hidden overflow-hidden rounded-lg border-s border-t border-cream-300 md:block">
              <div className="grid grid-cols-7 bg-green-800 text-cream-50">
                {weekdays.map((w) => (
                  <div key={w} className="border-e border-green-700 px-2 py-2 text-center font-button text-[0.9rem]">{w}</div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {range.days.map((d) => (
                  <MonthCell key={d} n={d} today={now.day} lang={lang} inMonth={"first" in range && d >= range.first! && d <= range.last!} />
                ))}
              </div>
            </div>
            <ol className="space-y-3 md:hidden">
              {range.days
                .filter((d) => "first" in range && d >= range.first! && d <= range.last!)
                .filter((d) => servicesOn(d).length || primaryFeast(d))
                .map((d) => (
                  <li key={d}>
                    <DayBlock n={d} today={now.day} lang={lang} />
                  </li>
                ))}
            </ol>
          </>
        )}

        <div className="mt-6 flex flex-col gap-3 rounded-lg border border-cream-300 bg-cream-50 p-4 text-[0.9rem] text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <p>{t(`schedule.calendarNote.${site.calendar}` as "schedule.calendarNote.julian", lang)}</p>
          <ul className="flex shrink-0 flex-wrap gap-4">
            <li className="flex items-center gap-1.5">
              <span className="size-3.5 rounded-sm border border-kinovar/40 bg-kinovar-soft" aria-hidden /> {t("schedule.legendGreat", lang)}
            </li>
            <li className="flex items-center gap-1.5">
              <Radio className="size-4 text-gold-600" aria-hidden /> {t("schedule.legendStream", lang)}
            </li>
          </ul>
        </div>
      </div>
    </SectionShell>
  );
}

"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, CalendarDays, Check, ChevronLeft, ChevronRight, Clock, ExternalLink, List, MapPin, Plus, User } from "lucide-react";
import type { SectionProps } from "@/components/sections/SectionRenderer";
import { SectionHeader, SectionShell } from "@/components/sections/SectionShell";
import { FilterChips } from "@/components/sections/FilterChips";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { OrthodoxCross } from "@/components/sacred/OrthodoxCross";
import { EventDetailButton } from "./EventDetail";
import { SignupDialog } from "./SignupDialog";
import { civil, demoShiftDays, fromIso, shiftIso, startOfWeek, dayNum, type DayNum } from "@/lib/calendar";
import { connect, site } from "@/lib/content";
import { useParishNow } from "@/lib/hooks";
import { connectDeepLink } from "@/lib/integrations/orthodoxconnect";
import { formatIsoDate, formatTime, localeOf, t, tr } from "@/lib/i18n";
import { hrefById } from "@/lib/pages";
import type { ConnectItem } from "@/lib/types";
import { cn } from "@/lib/utils";

type Kind = "event" | "need";

function useConnectItems(kind: Kind) {
  const now = useParishNow();
  const shift = demoShiftDays(now);
  const items = useMemo(() => {
    if (!now) return null;
    const src = kind === "event" ? connect.events : connect.needs;
    return src
      .map((i) => ({ ...i, date: shiftIso(i.date, shift) }))
      .filter((i) => fromIso(i.date) >= now.day)
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  }, [now, shift, kind]);
  return { now, items };
}

export function ConnectBadge({ lang, className }: { lang: string; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border border-green-700/30 bg-green-100/70 px-2.5 py-0.5 text-[0.78rem] text-green-800", className)}>
      <OrthodoxCross size={11} className="text-gold-600" /> {t("connect.badge", lang)}
    </span>
  );
}

function timeRange(i: ConnectItem, lang: string) {
  return i.endTime ? `${formatTime(i.time, lang)} – ${formatTime(i.endTime, lang)}` : formatTime(i.time, lang);
}

function Capacity({ item, joined, kind, lang }: { item: ConnectItem; joined: number; kind: Kind; lang: string }) {
  const filled = Math.min(item.capacity, item.signups + joined);
  const left = item.capacity - filled;
  return (
    <div>
      <div className="h-2 overflow-hidden rounded-full bg-cream-200" aria-hidden>
        <div className={cn("h-full rounded-full", left === 0 ? "bg-kinovar" : "bg-gold-500")} style={{ width: `${(filled / item.capacity) * 100}%` }} />
      </div>
      <p className="mt-1.5 flex flex-wrap justify-between gap-x-3 text-[0.85rem] text-ink-muted">
        <span>{kind === "event" ? t("events.going", lang, { n: filled, cap: item.capacity }) : t("needs.slots", lang, { n: filled, cap: item.capacity })}</span>
        <span className={left === 0 ? "text-kinovar" : "text-green-700"}>{left === 0 ? t("events.full", lang) : t("events.spotsLeft", lang, { n: left })}</span>
      </p>
    </div>
  );
}

function ItemCard({ item, kind, lang, compact }: { item: ConnectItem; kind: Kind; lang: string; compact?: boolean }) {
  const [mine, setMine] = useState<number | null>(null);
  const joined = mine ?? 0;
  const cats = kind === "event" ? connect.eventCategories : connect.needCategories;
  const cat = cats.find((c) => c.id === item.category);
  const d = civil(fromIso(item.date));
  const full = item.signups + joined >= item.capacity;
  const month = new Intl.DateTimeFormat(localeOf(lang), { month: "short", timeZone: "UTC" }).format(new Date(Date.UTC(d.y, d.m - 1, 1)));
  return (
    <article className="flex h-full flex-col rounded-lg border border-cream-300 bg-cream-50 p-5 shadow-sm">
      <EventDetailButton lang={lang} item={item} className="rounded-md hover:bg-cream-100/80">
        <div className="flex gap-4">
          <div className="flex w-16 shrink-0 flex-col items-center overflow-hidden rounded-md border border-gold-500/50 text-center" aria-hidden>
            <span className="w-full bg-green-800 py-0.5 text-[0.75rem] uppercase text-gold-200">{month}</span>
            <span className="py-1 font-display text-[1.7rem] leading-none text-green-800">{d.d}</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {cat ? <span className="eyebrow text-gold-700">{tr(cat.name, lang)}</span> : null}
              <ConnectBadge lang={lang} />
            </div>
            <h3 className="mt-1.5 text-[1.15rem] leading-normal text-green-800">{tr(item.title, lang)}</h3>
          </div>
        </div>
        <ul className="mt-3 space-y-1 text-[0.92rem] text-ink-muted">
          <li className="flex items-center gap-2">
            <Clock className="size-4 shrink-0 text-gold-600" aria-hidden />
            <span>
              <time dateTime={item.date}>{formatIsoDate(item.date, lang, { weekday: "long", day: "numeric", month: "long" })}</time>, {timeRange(item, lang)}
            </span>
          </li>
          <li className="flex items-center gap-2">
            <MapPin className="size-4 shrink-0 text-gold-600" aria-hidden /> {tr(item.location, lang)}
          </li>
          {!compact ? (
            <li className="flex items-center gap-2">
              <User className="size-4 shrink-0 text-gold-600" aria-hidden /> {t("events.organizer", lang)}: {tr(item.organizer, lang)}
            </li>
          ) : null}
        </ul>
        {!compact ? <p className="mt-3 text-[0.95rem] text-ink">{tr(item.description, lang)}</p> : null}
      </EventDetailButton>
      <div className="mt-auto space-y-3 pt-4">
        <Capacity item={item} joined={joined} kind={kind} lang={lang} />
        {mine !== null ? (
          <p className="flex min-h-10 items-center gap-2 font-button text-green-700">
            <Check className="size-4" aria-hidden /> {t("events.youreIn", lang)}
          </p>
        ) : (
          <SignupDialog
            lang={lang}
            item={item}
            kind={kind}
            waitlist={full}
            onDone={(n) => setMine(n)}
            trigger={
              <button type="button" className={cn("bell-hover inline-flex min-h-10 items-center gap-2 rounded-full px-4 font-button", full ? "border border-green-800/30 text-green-800 hover:border-gold-500" : "bg-green-800 text-cream-50 hover:bg-green-700")}>
                {full ? t("events.waitlist", lang) : kind === "event" ? t("events.rsvp", lang) : t("needs.signup", lang)}
              </button>
            }
          />
        )}
      </div>
    </article>
  );
}

function CreateButton({ kind, lang }: { kind: Kind; lang: string }) {
  if (!site.orthodoxConnect.enabled) return null;
  return (
    <a
      href={connectDeepLink(kind === "event" ? "events/new" : "needs/new")}
      target="_blank"
      rel="noopener noreferrer"
      title={t("connect.handoff", lang)}
      className="bell-hover inline-flex min-h-10 items-center gap-2 rounded-full bg-gold-400 px-4 font-button text-green-950 hover:bg-gold-200"
    >
      <Plus className="size-4" aria-hidden /> {kind === "event" ? t("events.create", lang) : t("needs.post", lang)}
      <ExternalLink className="size-3.5 opacity-70" aria-hidden />
    </a>
  );
}

function Skeleton() {
  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3" aria-busy="true">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-72 animate-pulse rounded-lg bg-cream-200" />
      ))}
    </div>
  );
}

function MonthCalendar({ items, now, lang, selected, onSelect }: { items: ConnectItem[]; now: DayNum; lang: string; selected: DayNum | null; onSelect: (d: DayNum) => void }) {
  const [offset, setOffset] = useState(0);
  const c = civil(now);
  const m0 = new Date(Date.UTC(c.y, c.m - 1 + offset, 1));
  const first = dayNum(m0.getUTCFullYear(), m0.getUTCMonth() + 1, 1);
  const n1 = new Date(Date.UTC(m0.getUTCFullYear(), m0.getUTCMonth() + 1, 1));
  const last = dayNum(n1.getUTCFullYear(), n1.getUTCMonth() + 1, 1) - 1;
  const start = startOfWeek(first);
  const days = Array.from({ length: startOfWeek(last) + 7 - start }, (_, i) => start + i);
  const byDay = new Map<number, ConnectItem[]>();
  items.forEach((i) => {
    const k = fromIso(i.date);
    byDay.set(k, [...(byDay.get(k) ?? []), i]);
  });
  const wd = Array.from({ length: 7 }, (_, i) => new Intl.DateTimeFormat(localeOf(lang), { weekday: "narrow", timeZone: "UTC" }).format(new Date(Date.UTC(2024, 0, 7 + ((i + site.weekStartsOn) % 7)))));
  const label = new Intl.DateTimeFormat(localeOf(lang), { month: "long", year: "numeric", timeZone: "UTC" }).format(m0);
  return (
    <div className="rounded-lg border border-cream-300 bg-cream-50 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <button type="button" onClick={() => setOffset((o) => o - 1)} disabled={offset <= 0} className="h-9 rounded-full px-3 font-button text-green-800 hover:bg-cream-200 disabled:opacity-35" aria-label={t("schedule.prevMonth", lang)}>
          <ChevronLeft className="size-5 rtl:rotate-180" aria-hidden />
        </button>
        <p className="font-heading text-[1.1rem] text-green-800 first-letter:uppercase">{label}</p>
        <button type="button" onClick={() => setOffset((o) => o + 1)} className="h-9 rounded-full px-3 font-button text-green-800 hover:bg-cream-200" aria-label={t("schedule.nextMonth", lang)}>
          <ChevronRight className="size-5 rtl:rotate-180" aria-hidden />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[0.8rem] text-ink-muted" aria-hidden>
        {wd.map((w, i) => (
          <span key={i}>{w}</span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {days.map((d) => {
          const has = byDay.get(d);
          const inMonth = d >= first && d <= last;
          return (
            <button
              key={d}
              type="button"
              disabled={!has}
              onClick={() => onSelect(d)}
              aria-pressed={selected === d}
              aria-label={has ? `${civil(d).d}: ${has.map((h) => tr(h.title, lang)).join(", ")}` : undefined}
              className={cn(
                "relative flex aspect-square flex-col items-center justify-center rounded-md text-[0.92rem]",
                !inMonth && "opacity-35",
                d === now && "ring-2 ring-gold-400",
                has ? "bg-green-100 font-heading text-green-800 hover:bg-green-200" : "text-ink-muted",
                selected === d && "bg-green-800 text-gold-200 hover:bg-green-800",
              )}
            >
              {civil(d).d}
              {has ? <span className={cn("absolute bottom-1 size-1.5 rounded-full", selected === d ? "bg-gold-300" : "bg-gold-600")} aria-hidden /> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function Events({ lang, section }: SectionProps) {
  const { now, items } = useConnectItems("event");
  const [cat, setCat] = useState("all");
  const [view, setView] = useState<"list" | "calendar">("list");
  const [selected, setSelected] = useState<DayNum | null>(null);
  const filtered = (items ?? []).filter((i) => cat === "all" || i.category === cat);
  const shown = view === "calendar" && selected !== null ? filtered.filter((i) => fromIso(i.date) === selected) : filtered;

  return (
    <SectionShell id={section.id} className="pt-0 sm:pt-0">
      <SectionHeader
        title={tr(section.title, lang)}
        sticky={section.stickyHeader}
        actions={
          <>
            <ToggleGroup type="single" value={view} onValueChange={(v) => v && setView(v as "list" | "calendar")} aria-label={t("events.view", lang)} className="rounded-full border border-green-800/25 bg-cream-50 p-1">
              <ToggleGroupItem value="list" className="h-8 rounded-full px-3 font-button data-[state=on]:bg-green-800 data-[state=on]:text-cream-50">
                <List className="size-4" aria-hidden /> {t("events.list", lang)}
              </ToggleGroupItem>
              <ToggleGroupItem value="calendar" className="h-8 rounded-full px-3 font-button data-[state=on]:bg-green-800 data-[state=on]:text-cream-50">
                <CalendarDays className="size-4" aria-hidden /> {t("events.calendar", lang)}
              </ToggleGroupItem>
            </ToggleGroup>
            <CreateButton kind="event" lang={lang} />
          </>
        }
      />
      <div className="container-sobor mt-6">
        <p className="mb-5 max-w-3xl text-ink-muted">{tr(section.intro, lang) || t("connect.signInText", lang)}</p>
        <FilterChips
          className="justify-start"
          label={t("store.filter", lang)}
          value={cat}
          onChange={setCat}
          options={[{ id: "all", label: t("all", lang) }, ...connect.eventCategories.map((c) => ({ id: c.id, label: tr(c.name, lang) }))]}
        />
        <div className="mt-6">
          {!items || !now ? (
            <Skeleton />
          ) : (
            <div className={cn(view === "calendar" && "grid gap-6 lg:grid-cols-[22rem_1fr]")}>
              {view === "calendar" ? (
                <div>
                  <MonthCalendar items={filtered} now={now.day} lang={lang} selected={selected} onSelect={(d) => setSelected(selected === d ? null : d)} />
                  {selected !== null ? (
                    <button type="button" onClick={() => setSelected(null)} className="mt-2 font-button text-[0.92rem] text-green-800 underline underline-offset-4">
                      {t("all", lang)}
                    </button>
                  ) : null}
                </div>
              ) : null}
              {shown.length ? (
                <ul className={cn("grid gap-5 md:grid-cols-2", view === "list" && "lg:grid-cols-3")}>
                  {shown.map((i) => (
                    <li key={i.id}>
                      <ItemCard item={i} kind="event" lang={lang} />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="py-10 text-center text-ink-muted">{t("events.empty", lang)}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </SectionShell>
  );
}

export function Needs({ lang, section }: SectionProps) {
  const { now, items } = useConnectItems("need");
  const [cat, setCat] = useState("all");
  const filtered = (items ?? []).filter((i) => cat === "all" || i.category === cat);
  return (
    <SectionShell id={section.id} className="pt-0 sm:pt-0">
      <SectionHeader title={tr(section.title, lang)} sticky={section.stickyHeader} actions={<CreateButton kind="need" lang={lang} />} />
      <div className="container-sobor mt-6">
        <p className="mb-5 max-w-3xl text-ink-muted">{tr(section.intro, lang) || t("connect.signInText", lang)}</p>
        <FilterChips
          className="justify-start"
          label={t("store.filter", lang)}
          value={cat}
          onChange={setCat}
          options={[{ id: "all", label: t("all", lang) }, ...connect.needCategories.map((c) => ({ id: c.id, label: tr(c.name, lang) }))]}
        />
        <div className="mt-6">
          {!items || !now ? (
            <Skeleton />
          ) : filtered.length ? (
            <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((i) => (
                <li key={i.id}>
                  <ItemCard item={i} kind="need" lang={lang} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-10 text-center text-ink-muted">{t("needs.empty", lang)}</p>
          )}
        </div>
      </div>
    </SectionShell>
  );
}

function Preview({ lang, section, kind }: SectionProps & { kind: Kind }) {
  const { now, items } = useConnectItems(kind);
  const limit = Number(section.props?.limit ?? 3);
  const pageId = kind === "event" ? "events" : "volunteer";
  return (
    <SectionShell id={section.id} tone={kind === "event" ? "paper" : "plain"}>
      <SectionHeader title={tr(section.title, lang)} intro={tr(section.intro, lang)} />
      <div className="container-sobor">
        {!items || !now ? (
          <Skeleton />
        ) : items.length ? (
          <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {items.slice(0, limit).map((i) => (
              <li key={i.id}>
                <ItemCard item={i} kind={kind} lang={lang} compact />
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-6 text-center text-ink-muted">{t(kind === "event" ? "events.empty" : "needs.empty", lang)}</p>
        )}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href={hrefById(lang, pageId)} className="bell-hover inline-flex min-h-11 items-center gap-2 rounded-full border border-green-800/40 px-5 font-button text-green-800 hover:border-gold-500">
            {t("viewAll", lang)} <ArrowRight className="size-4 rtl:rotate-180" aria-hidden />
          </Link>
          <CreateButton kind={kind} lang={lang} />
        </div>
      </div>
    </SectionShell>
  );
}

export function EventsPreview(props: SectionProps) {
  return <Preview {...props} kind="event" />;
}

export function NeedsPreview(props: SectionProps) {
  return <Preview {...props} kind="need" />;
}

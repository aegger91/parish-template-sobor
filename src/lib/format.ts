import { churchDate, type DayNum } from "./calendar";
import { site } from "./content";
import { localeOf, t } from "./i18n";

export function formatDay(n: DayNum, lang: string, opts: Intl.DateTimeFormatOptions = { weekday: "long", day: "numeric", month: "long" }) {
  return new Intl.DateTimeFormat(localeOf(lang), { timeZone: "UTC", ...opts }).format(new Date(n * 86400000));
}

const cap = (s: string) => s.charAt(0).toLocaleUpperCase() + s.slice(1);

/** "Today", "Tomorrow", or a short weekday and date. */
export function relativeDay(n: DayNum, today: DayNum, lang: string) {
  if (n === today) return t("today", lang);
  if (n === today + 1) return cap(new Intl.RelativeTimeFormat(localeOf(lang), { numeric: "auto" }).format(1, "day"));
  return cap(formatDay(n, lang, { weekday: "short", day: "numeric", month: "short" }));
}

/** Old Style date label for Julian-calendar parishes, otherwise null. */
export function oldStyleLabel(n: DayNum, lang: string): string | null {
  if (site.calendar !== "julian") return null;
  const cd = churchDate(n);
  const date = new Intl.DateTimeFormat(localeOf(lang), { timeZone: "UTC", day: "numeric", month: "long" }).format(new Date(Date.UTC(2001, cd.m - 1, cd.d)));
  return t("oldStyle", lang, { date });
}

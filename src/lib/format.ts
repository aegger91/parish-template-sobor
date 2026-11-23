import { churchDate, isOldCalendar, type DayNum } from "./calendar";
import { localeOf, t } from "./i18n";

export function formatDay(n: DayNum, lang: string, opts: Intl.DateTimeFormatOptions = { weekday: "long", day: "numeric", month: "long" }) {
  return new Intl.DateTimeFormat(localeOf(lang), { timeZone: "UTC", ...opts }).format(new Date(n * 86400000));
}

function formatMonthDay(y: number, m: number, d: number, lang: string) {
  return new Intl.DateTimeFormat(localeOf(lang), { timeZone: "UTC", day: "numeric", month: "short" }).format(new Date(Date.UTC(y, m - 1, d)));
}

/** Julian (Old Style) month-day for a civil day, e.g. "Nov 10". */
export function formatOldStyleDay(n: DayNum, lang: string) {
  const cd = churchDate(n);
  return formatMonthDay(2001, cd.m, cd.d, lang);
}

/**
 * Civil date, and when the parish keeps the old calendar, the matching O.S. date:
 * e.g. "Nov 23 (Nov 10 O.S.)".
 */
export function formatChurchDate(n: DayNum, lang: string) {
  const civil = formatDay(n, lang, { day: "numeric", month: "short" });
  if (!isOldCalendar()) return civil;
  return t("date.civilWithOs", lang, { civil, os: formatOldStyleDay(n, lang) });
}

const cap = (s: string) => s.charAt(0).toLocaleUpperCase() + s.slice(1);

/** "Today", "Tomorrow", or a short weekday and date. */
export function relativeDay(n: DayNum, today: DayNum, lang: string) {
  if (n === today) return t("today", lang);
  if (n === today + 1) return cap(new Intl.RelativeTimeFormat(localeOf(lang), { numeric: "auto" }).format(1, "day"));
  return cap(formatDay(n, lang, { weekday: "short", day: "numeric", month: "short" }));
}

/** Short Old Style tag under a civil date, e.g. "Nov 10 O.S.", or null on the new calendar. */
export function oldStyleLabel(n: DayNum, lang: string): string | null {
  if (!isOldCalendar()) return null;
  return t("oldStyle", lang, { date: formatOldStyleDay(n, lang) });
}

import { feasts, schedule, site } from "./content";
import type { CalendarStyle, Feast, FeastRank, L, ServiceKind } from "./types";

/** Days since 1970-01-01 (UTC). All calendar math works on these integers. */
export type DayNum = number;

const UNIX_EPOCH_JDN = 2440588;

export function dayNum(y: number, m: number, d: number): DayNum {
  return Math.floor(Date.UTC(y, m - 1, d) / 86400000);
}

export function fromIso(iso: string): DayNum {
  const [y, m, d] = iso.split("-").map(Number);
  return dayNum(y, m, d);
}

export function civil(n: DayNum) {
  const dt = new Date(n * 86400000);
  return { y: dt.getUTCFullYear(), m: dt.getUTCMonth() + 1, d: dt.getUTCDate(), weekday: dt.getUTCDay() };
}

export function toIso(n: DayNum): string {
  const { y, m, d } = civil(n);
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function julianToDayNum(y: number, m: number, d: number): DayNum {
  const a = Math.floor((14 - m) / 12);
  const yy = y + 4800 - a;
  const mm = m + 12 * a - 3;
  const jdn = d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) - 32083;
  return jdn - UNIX_EPOCH_JDN;
}

function dayNumToJulian(n: DayNum) {
  const c = n + UNIX_EPOCH_JDN + 32082;
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);
  return {
    d: e - Math.floor((153 * m + 2) / 5) + 1,
    m: m + 3 - 12 * Math.floor(m / 10),
    y: d - 4800 + Math.floor(m / 10),
  };
}

/** Orthodox Pascha (Julian paschalion), returned as a civil (Gregorian) day. */
function orthodoxPascha(year: number): DayNum {
  const a = year % 4, b = year % 7, c = year % 19;
  const d = (19 * c + 15) % 30;
  const e = (2 * a + 4 * b - d + 34) % 7;
  const month = Math.floor((d + e + 114) / 31);
  const day = ((d + e + 114) % 31) + 1;
  return julianToDayNum(year, month, day);
}

/** True when the parish keeps the Julian (Old Style) calendar for fixed feasts. */
export function isOldCalendar(style: CalendarStyle = site.calendarStyle) {
  return style === "old";
}

/** Pascha always follows the Orthodox paschalion for both old and new styles. */
export function paschaFor(year: number, style: CalendarStyle = site.calendarStyle): DayNum {
  void style;
  return orthodoxPascha(year);
}

/**
 * Date used for fixed feasts:
 * - old → Julian (Old Style) month/day
 * - new → Revised Julian, which matches civil (Gregorian) dates for fixed feasts
 */
export function churchDate(n: DayNum, style: CalendarStyle = site.calendarStyle) {
  if (isOldCalendar(style)) return dayNumToJulian(n);
  const c = civil(n);
  return { y: c.y, m: c.m, d: c.d };
}

const rankOrder: Record<FeastRank, number> = { pascha: 0, great: 1, major: 2, minor: 3 };

export function feastsOn(n: DayNum, style: CalendarStyle = site.calendarStyle): Feast[] {
  const cd = churchDate(n, style);
  const offset = n - paschaFor(civil(n).y, style);
  const list = [
    ...feasts.movable.filter((f) => f.paschaOffset === offset),
    ...feasts.fixed.filter((f) => f.month === cd.m && f.day === cd.d),
  ];
  return list.sort((a, b) => rankOrder[a.rank] - rankOrder[b.rank]);
}

export function primaryFeast(n: DayNum): Feast | undefined {
  return feastsOn(n)[0];
}

export function weekdayDedication(n: DayNum): L {
  return feasts.weekdays[civil(n).weekday];
}

export type Occurrence = {
  id: string;
  day: DayNum;
  time: string;
  startMinutes: number;
  durationMinutes: number;
  kind: ServiceKind;
  title: L;
  streamed: boolean;
  feast?: Feast;
};

function minutesOf(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function servicesOn(n: DayNum): Occurrence[] {
  const out: Occurrence[] = [];
  const suppressed = new Set<ServiceKind>();
  const rule = (f: Feast) => (f.useServiceRule === false ? undefined : schedule.feastRules.find((r) => r.rank === f.rank));

  const today = primaryFeast(n);
  const tomorrow = primaryFeast(n + 1);
  const dayRule = today && rule(today)?.day;
  const eveRule = tomorrow && rule(tomorrow)?.eve;

  if (eveRule && tomorrow) {
    eveRule.suppress.forEach((k) => suppressed.add(k));
    out.push({ id: `eve-${tomorrow.id}-${n}`, day: n, time: eveRule.time, startMinutes: minutesOf(eveRule.time), durationMinutes: eveRule.durationMinutes, kind: eveRule.kind, title: eveRule.title, streamed: eveRule.streamed, feast: tomorrow });
  }
  if (dayRule && today) {
    dayRule.suppress.forEach((k) => suppressed.add(k));
    out.push({ id: `day-${today.id}-${n}`, day: n, time: dayRule.time, startMinutes: minutesOf(dayRule.time), durationMinutes: dayRule.durationMinutes, kind: dayRule.kind, title: dayRule.title, streamed: dayRule.streamed, feast: today });
  }

  const wd = civil(n).weekday;
  for (const r of schedule.recurring) {
    if (r.weekday !== wd || suppressed.has(r.kind)) continue;
    out.push({ id: `${r.id}-${n}`, day: n, time: r.time, startMinutes: minutesOf(r.time), durationMinutes: r.durationMinutes, kind: r.kind, title: r.title, streamed: r.streamed });
  }
  const iso = toIso(n);
  for (const s of schedule.dated) {
    if (s.date !== iso) continue;
    out.push({ id: `${s.id}-${n}`, day: n, time: s.time, startMinutes: minutesOf(s.time), durationMinutes: s.durationMinutes, kind: s.kind, title: s.title, streamed: s.streamed });
  }
  return out.sort((a, b) => a.startMinutes - b.startMinutes);
}

/** Short note for an occurrence: feast name, or a recurring/dated note if present. */
export function occurrenceNote(s: Occurrence): L | undefined {
  if (s.feast) return s.feast.name;
  const baseId = s.id.replace(/-\d+$/, "");
  const recurring = schedule.recurring.find((r) => r.id === baseId);
  if (recurring?.note) return recurring.note;
  const dated = schedule.dated.find((d) => d.id === baseId);
  return dated?.note;
}

export type ParishNow = { day: DayNum; minutes: number };

/** Current wall-clock date and time at the parish, regardless of the visitor's time zone. */
export function parishNow(date = new Date()): ParishNow {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: site.timeZone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(date);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  return { day: dayNum(get("year"), get("month"), get("day")), minutes: get("hour") * 60 + get("minute") };
}

export function nextServices(now: ParishNow, count: number, opts?: { streamedOnly?: boolean }): Occurrence[] {
  const out: Occurrence[] = [];
  for (let n = now.day; n < now.day + 60 && out.length < count; n++) {
    for (const s of servicesOn(n)) {
      if (opts?.streamedOnly && !s.streamed) continue;
      if (n === now.day && s.startMinutes + s.durationMinutes <= now.minutes) continue;
      out.push(s);
      if (out.length >= count) break;
    }
  }
  return out;
}

export function serviceInProgress(now: ParishNow): Occurrence | undefined {
  return servicesOn(now.day).find((s) => s.streamed && s.startMinutes <= now.minutes && now.minutes < s.startMinutes + s.durationMinutes);
}

export function isLiveNow(now: ParishNow | null): boolean {
  if (!site.modules.livestream) return false;
  if (site.livestream.status === "live") return true;
  if (site.livestream.status === "offline" || !now) return false;
  return Boolean(serviceInProgress(now));
}

export function startOfWeek(n: DayNum): DayNum {
  const wd = civil(n).weekday;
  return n - ((wd - site.weekStartsOn + 7) % 7);
}

/** Demo content dates move forward in whole weeks so the sample never looks out of date. */
export function demoShiftDays(now: ParishNow | null): number {
  if (!site.demo.shiftDates || !now) return 0;
  const anchor = fromIso(site.demo.anchorDate);
  const weeks = Math.floor((now.day - anchor) / 7);
  return weeks > 0 ? weeks * 7 : 0;
}

export function shiftIso(iso: string, days: number): string {
  return days ? toIso(fromIso(iso) + days) : iso;
}

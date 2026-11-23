import { site } from "./content";
import { occurrenceNote, toIso, type Occurrence } from "./calendar";
import { tr } from "./i18n";
import type { ConnectItem, L } from "./types";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/** Build a floating (local parish wall-clock) ICS date-time: YYYYMMDDTHHMMSS */
export function icsLocalStamp(isoDay: string, hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return `${isoDay.replace(/-/g, "")}T${pad(h)}${pad(m)}00`;
}

function endTime(start: string, durationMinutes: number) {
  const [h, m] = start.split(":").map(Number);
  const total = h * 60 + m + durationMinutes;
  return `${pad(Math.floor(total / 60) % 24)}:${pad(total % 60)}`;
}

function parishAddress() {
  const a = site.contact.address;
  return `${a.line1}, ${a.city}, ${a.region} ${a.postalCode}, ${a.country}`;
}

export function mapsUrl() {
  if (site.contact.directionsUrl) return site.contact.directionsUrl;
  return `https://www.openstreetmap.org/search?query=${encodeURIComponent(parishAddress())}`;
}

export function mapsSearchUrl(query: string) {
  return `https://www.openstreetmap.org/search?query=${encodeURIComponent(query)}`;
}

/** Directions for a Connect item: parish map when held at the cathedral, otherwise OSM search. */
export function connectItemMapsUrl(item: ConnectItem, lang: string) {
  const loc = tr(item.location, lang).trim();
  if (!loc) return mapsUrl();
  if (/cathedral|parish|church|собор|храм|церкв|параф/i.test(loc)) return mapsUrl();
  return mapsSearchUrl(loc);
}

export function placeLabel(lang: string): string {
  return tr(site.shortName as L, lang);
}

export function parishAddressLabel(lang: string) {
  return `${placeLabel(lang)}, ${parishAddress()}`;
}

function icsEscape(s: string) {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

export function downloadIcs(filename: string, body: string) {
  const blob = new Blob([body], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".ics") ? filename : `${filename}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

export function occurrenceIcs(s: Occurrence, lang: string) {
  const day = toIso(s.day);
  const start = icsLocalStamp(day, s.time);
  const end = icsLocalStamp(day, endTime(s.time, s.durationMinutes));
  const title = tr(s.title, lang);
  const place = parishAddress();
  const noteField = occurrenceNote(s);
  const note = noteField ? tr(noteField, lang) : "";
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Sobor Parish Template//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${s.id}@${site.id}`,
    `DTSTAMP:${start}Z`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${icsEscape(title)}`,
    `LOCATION:${icsEscape(place)}`,
    note ? `DESCRIPTION:${icsEscape(note)}` : null,
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");
}

export function googleCalendarUrl(opts: {
  title: string;
  dayIso: string;
  time: string;
  durationMinutes: number;
  place: string;
  details?: string;
}) {
  const start = icsLocalStamp(opts.dayIso, opts.time);
  const end = icsLocalStamp(opts.dayIso, endTime(opts.time, opts.durationMinutes));
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: opts.title,
    dates: `${start}/${end}`,
    details: opts.details ?? "",
    location: opts.place,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function connectItemDurationMinutes(item: ConnectItem) {
  if (!item.endTime) return 60;
  const [sh, sm] = item.time.split(":").map(Number);
  const [eh, em] = item.endTime.split(":").map(Number);
  const mins = eh * 60 + em - (sh * 60 + sm);
  return mins > 0 ? mins : 60;
}

export function connectItemIcs(item: ConnectItem, lang: string) {
  const start = icsLocalStamp(item.date, item.time);
  const end = icsLocalStamp(item.date, item.endTime ?? endTime(item.time, 60));
  const title = tr(item.title, lang);
  const place = tr(item.location, lang);
  const details = tr(item.description, lang);
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Sobor Parish Template//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${item.id}@${site.id}`,
    `DTSTAMP:${start}Z`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${icsEscape(title)}`,
    `LOCATION:${icsEscape(place)}`,
    details ? `DESCRIPTION:${icsEscape(details)}` : null,
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");
}

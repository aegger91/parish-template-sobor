import uiJson from "@content/ui.json";
import { site } from "./content";
import type { L, LanguageConfig } from "./types";

export const languages: LanguageConfig[] = site.languages;
export const defaultLang = site.defaultLanguage;

export function getLanguage(code: string): LanguageConfig {
  return languages.find((l) => l.code === code) ?? languages[0];
}

export function isLanguage(code: string): boolean {
  return languages.some((l) => l.code === code);
}

/** Resolve a translatable field: requested language, then the default language, then any value. */
export function tr(field: L | string | undefined | null, lang: string): string {
  if (!field) return "";
  if (typeof field === "string") return field;
  return field[lang] ?? field[defaultLang] ?? Object.values(field)[0] ?? "";
}

const ui = uiJson as unknown as Record<string, L>;
export type UiKey = Exclude<keyof typeof uiJson, "$schema">;

/** UI string lookup with {placeholder} substitution. */
export function t(key: UiKey, lang: string, vars?: Record<string, string | number>): string {
  let s = tr(ui[key], lang) || String(key);
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
  return s;
}

export function localeOf(lang: string): string {
  return getLanguage(lang).locale;
}

export function formatMoney(amount: number, lang: string, opts?: { whole?: boolean }): string {
  const whole = opts?.whole ?? Number.isInteger(amount);
  return new Intl.NumberFormat(localeOf(lang), {
    style: "currency",
    currency: site.currency,
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: whole ? 0 : 2,
  }).format(amount);
}

/** Format an ISO date (YYYY-MM-DD) as a calendar date without any time zone shift. */
export function formatIsoDate(iso: string, lang: string, opts: Intl.DateTimeFormatOptions = { dateStyle: "long" }): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat(localeOf(lang), { timeZone: "UTC", ...opts }).format(new Date(Date.UTC(y, m - 1, d)));
}

/** Format a wall-clock time "HH:MM" in the reader's language. */
export function formatTime(hhmm: string, lang: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  return new Intl.DateTimeFormat(localeOf(lang), { timeZone: "UTC", hour: "numeric", minute: "2-digit" }).format(
    new Date(Date.UTC(2000, 0, 1, h, m)),
  );
}

/** Plural helper using Intl.PluralRules; forms keyed by plural category with "other" fallback. */
export function plural(n: number, lang: string, forms: Partial<Record<Intl.LDMLPluralRule, string>>): string {
  const cat = new Intl.PluralRules(localeOf(lang)).select(n);
  return (forms[cat] ?? forms.other ?? "").replaceAll("{n}", String(n));
}

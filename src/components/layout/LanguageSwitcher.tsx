"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check, ChevronDown, Languages } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { languages, t } from "@/lib/i18n";
import { cn } from "@/lib/utils";

function useSwitchHref(lang: string) {
  const pathname = usePathname() || `/${lang}/`;
  return (code: string) => {
    const rest = pathname.replace(new RegExp(`^/${lang}(?=/|$)`), "");
    return `/${code}${rest || "/"}`;
  };
}

const remember = (code: string) => {
  try {
    localStorage.setItem("sobor-lang", code);
  } catch {}
};

/**
 * Adapts to the number of configured languages:
 * one language renders nothing, two or three render inline buttons, four or more render a menu.
 */
export function LanguageSwitcher({ lang, onDark = true, variant = "auto" }: { lang: string; onDark?: boolean; variant?: "auto" | "list" }) {
  const toHref = useSwitchHref(lang);
  if (languages.length < 2) return null;

  if (variant === "list") {
    return (
      <nav aria-label={t("nav.language", lang)} className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {languages.map((l) => (
          <Link
            key={l.code}
            href={toHref(l.code)}
            lang={l.code}
            hrefLang={l.code}
            onClick={() => remember(l.code)}
            aria-current={l.code === lang ? "true" : undefined}
            className={cn(
              "flex min-h-11 items-center justify-center rounded border px-3 py-2 text-center font-button text-base",
              l.code === lang ? "border-gold-500 bg-gold-200/60 text-green-900" : "border-cream-300 text-green-800 hover:border-gold-500",
            )}
          >
            {l.label}
          </Link>
        ))}
      </nav>
    );
  }

  if (languages.length <= 3) {
    return (
      <nav aria-label={t("nav.language", lang)} className={cn("flex items-center overflow-visible rounded-full p-0.5", onDark ? "bg-green-950/40 ring-1 ring-gold-500/40" : "bg-cream-200 ring-1 ring-cream-300")}>
        {languages.map((l) => (
          <Link
            key={l.code}
            href={toHref(l.code)}
            lang={l.code}
            hrefLang={l.code}
            title={l.label}
            onClick={() => remember(l.code)}
            aria-current={l.code === lang ? "true" : undefined}
            className={cn(
              "lang-pill flex h-10 min-w-10 items-center justify-center rounded-full px-2.5 tracking-wide transition-colors",
              l.code === lang
                ? "bg-gold-400 text-green-950"
                : onDark
                  ? "text-cream-100 hover:text-gold-200"
                  : "text-green-800 hover:text-gold-700",
            )}
          >
            <span aria-hidden className="lang-pill-label">
              {l.shortLabel}
            </span>
            <span className="sr-only">{l.label}</span>
          </Link>
        ))}
      </nav>
    );
  }

  const current = languages.find((l) => l.code === lang);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={t("nav.language", lang)}
        className={cn("flex h-9 items-center gap-1.5 rounded-full px-3 font-button text-sm", onDark ? "text-cream-100 ring-1 ring-gold-500/40" : "text-green-800 ring-1 ring-cream-300")}
      >
        <Languages className="size-4" aria-hidden />
        {current?.shortLabel}
        <ChevronDown className="size-3.5" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-auto min-w-44 border border-gold-500/40 bg-cream-50">
        {languages.map((l) => (
          <DropdownMenuItem key={l.code} asChild>
            <Link href={toHref(l.code)} lang={l.code} hrefLang={l.code} onClick={() => remember(l.code)} className="font-button">
              {l.code === lang ? <Check className="size-4" aria-hidden /> : <span className="size-4" />}
              {l.label}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

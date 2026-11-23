"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ChevronDown, Mail, Menu, Phone, ShoppingBag } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "@/components/brand/Logo";
import { OrthodoxCross } from "@/components/sacred/OrthodoxCross";
import { SwingingBell } from "@/components/sacred/Pictograms";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { site } from "@/lib/content";
import { getLanguage, t, tr } from "@/lib/i18n";
import { href, hrefById, type NavItem } from "@/lib/pages";
import { cartCount, useCart } from "@/lib/cart";
import { useParishNow } from "@/lib/hooks";
import { churchDate, primaryFeast, weekdayDedication } from "@/lib/calendar";
import { cn } from "@/lib/utils";

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

function itemLabel(item: NavItem, lang: string) {
  return tr(item.title, lang);
}

function isActive(pathname: string, lang: string, item: NavItem): boolean {
  const target = href(lang, item.path);
  if (!item.path) return pathname === target || pathname === `/${lang}`;
  return pathname.startsWith(target);
}

function TodayLine({ lang }: { lang: string }) {
  const now = useParishNow();
  if (!now) return <span className="opacity-0">.</span>;
  const feast = primaryFeast(now.day);
  const label = feast ? tr(feast.name, lang) : tr(weekdayDedication(now.day), lang);
  const os = site.calendar === "julian" ? churchDate(now.day) : null;
  return (
    <span className="flex min-w-0 items-center gap-2">
      <OrthodoxCross size={14} className="shrink-0 text-gold-400" />
      <span className="truncate">
        {feast ? <span className="text-gold-200">{t("today", lang)}: </span> : null}
        {label}
        {os ? <span className="text-cream-100/70"> · {t("oldStyle", lang, { date: `${os.d}.${String(os.m).padStart(2, "0")}` })}</span> : null}
      </span>
    </span>
  );
}

function DropdownGroup({ item, lang, pathname }: { item: NavItem; lang: string; pathname: string }) {
  const active = isActive(pathname, lang, item);
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        className={cn(
          "group flex h-10 items-center gap-1 whitespace-nowrap rounded px-3 font-button text-[0.98rem] text-cream-50 outline-none transition-colors hover:text-gold-200 data-[state=open]:text-gold-200",
          active && "text-gold-200",
        )}
      >
        {itemLabel(item, lang)}
        <ChevronDown className="size-3.5 transition-transform group-data-[state=open]:rotate-180" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" sideOffset={10} className="w-auto min-w-60 rounded-md border border-gold-500/40 bg-cream-50 p-1.5 shadow-xl">
        <NavMenuItems item={item} lang={lang} pathname={pathname} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function NavMenuItems({ item, lang, pathname }: { item: NavItem; lang: string; pathname: string }) {
  const overview = (
    <DropdownMenuItem asChild>
      <Link href={href(lang, item.path)} className="font-button text-[0.98rem] text-green-900">
        {tr(navTitleFor(item), lang)}
      </Link>
    </DropdownMenuItem>
  );
  return (
    <>
      {overview}
      <DropdownMenuSeparator className="bg-gold-500/30" />
      {item.children.map((c) =>
        c.children.length ? (
          <div key={c.id}>
            <DropdownMenuLabel className="eyebrow text-gold-700">{tr(c.title, lang)}</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href={href(lang, c.path)} className="ps-4 font-button text-green-900">{tr(navTitleFor(c), lang)}</Link>
            </DropdownMenuItem>
            {c.children.map((g) => (
              <DropdownMenuItem key={g.id} asChild>
                <Link href={href(lang, g.path)} className="ps-4 font-button text-green-900">{tr(g.title, lang)}</Link>
              </DropdownMenuItem>
            ))}
          </div>
        ) : (
          <DropdownMenuItem key={c.id} asChild>
            <Link
              href={href(lang, c.path)}
              aria-current={pathname === href(lang, c.path) ? "page" : undefined}
              className="font-button text-[0.98rem] text-green-900 aria-[current=page]:bg-gold-200/50"
            >
              {tr(c.title, lang)}
            </Link>
          </DropdownMenuItem>
        ),
      )}
    </>
  );
}

function navTitleFor(item: NavItem) {
  return item.overviewTitle;
}

/** Shows as many top-level items as fit; the rest move into a More menu. Works for any label length. */
function PriorityNav({ items, lang, pathname }: { items: NavItem[]; lang: string; pathname: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState<number | null>(null);

  const compute = useCallback(() => {
    const wrap = wrapRef.current, measure = measureRef.current;
    if (!wrap || !measure) return;
    const widths = Array.from(measure.children).map((c) => (c as HTMLElement).offsetWidth);
    const moreW = widths.pop() ?? 80;
    const avail = wrap.clientWidth;
    let used = 0, count = 0;
    for (let i = 0; i < widths.length; i++) {
      const needsMore = i < widths.length - 1;
      if (used + widths[i] + (needsMore ? moreW : 0) <= avail || (!needsMore && used + widths[i] <= avail)) {
        used += widths[i];
        count++;
      } else break;
    }
    setVisible(count);
  }, []);

  useIsoLayoutEffect(() => {
    compute();
    const ro = new ResizeObserver(compute);
    if (wrapRef.current) ro.observe(wrapRef.current);
    document.fonts?.ready.then(compute).catch(() => {});
    return () => ro.disconnect();
  }, [compute, lang]);

  const shown = visible === null ? items : items.slice(0, visible);
  const overflow = visible === null ? [] : items.slice(visible);
  const linkCls = "flex h-10 items-center whitespace-nowrap rounded px-3 font-button text-[0.98rem] text-cream-50 transition-colors hover:text-gold-200 aria-[current=page]:text-gold-200";

  return (
    <div ref={wrapRef} className="relative hidden min-w-0 flex-1 justify-center lg:flex" aria-label={t("nav.main", lang)} role="navigation">
      <div ref={measureRef} aria-hidden className="invisible pointer-events-none absolute start-0 top-0 flex" inert>
        {items.map((i) => (
          <span key={i.id} className={cn(linkCls, "gap-1")}>
            {itemLabel(i, lang)}
            {i.children.length ? <ChevronDown className="size-3.5" /> : null}
          </span>
        ))}
        <span className={cn(linkCls, "gap-1")}>
          {t("nav.more", lang)}
          <ChevronDown className="size-3.5" />
        </span>
      </div>
      <ul className={cn("flex min-w-0 items-center", visible === null && "overflow-hidden")}>
        {shown.map((item) => (
          <li key={item.id}>
            {item.children.length ? (
              <DropdownGroup item={item} lang={lang} pathname={pathname} />
            ) : (
              <Link href={href(lang, item.path)} aria-current={isActive(pathname, lang, item) ? "page" : undefined} className={linkCls}>
                {itemLabel(item, lang)}
              </Link>
            )}
          </li>
        ))}
        {overflow.length ? (
          <li>
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger className={cn(linkCls, "group gap-1 outline-none data-[state=open]:text-gold-200")}>
                {t("nav.more", lang)}
                <ChevronDown className="size-3.5 transition-transform group-data-[state=open]:rotate-180" aria-hidden />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={10} className="max-h-[70vh] w-auto min-w-64 rounded-md border border-gold-500/40 bg-cream-50 p-1.5 shadow-xl">
                {overflow.map((item, idx) => (
                  <div key={item.id}>
                    {idx > 0 ? <DropdownMenuSeparator className="bg-gold-500/30" /> : null}
                    {item.children.length ? (
                      <>
                        <DropdownMenuLabel className="eyebrow text-gold-700">{itemLabel(item, lang)}</DropdownMenuLabel>
                        <NavMenuItems item={item} lang={lang} pathname={pathname} />
                      </>
                    ) : (
                      <DropdownMenuItem asChild>
                        <Link href={href(lang, item.path)} className="font-button text-[0.98rem] text-green-900">{itemLabel(item, lang)}</Link>
                      </DropdownMenuItem>
                    )}
                  </div>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </li>
        ) : null}
      </ul>
    </div>
  );
}

function CartButton({ lang, onDark }: { lang: string; onDark: boolean }) {
  const lines = useCart();
  const n = cartCount(lines);
  return (
    <Link
      href={hrefById(lang, "cart")}
      aria-label={t("nav.cartCount", lang, { n })}
      className={cn("bell-hover relative flex size-10 items-center justify-center rounded-full transition-colors", onDark ? "text-cream-50 hover:bg-green-700/60" : "text-green-800 hover:bg-cream-200")}
    >
      <ShoppingBag className="size-5" aria-hidden />
      {n > 0 ? (
        <span className="absolute -end-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold-400 px-1 text-[0.7rem] font-bold text-green-950">{n}</span>
      ) : null}
    </Link>
  );
}

function DonateButton({ lang, className }: { lang: string; className?: string }) {
  return (
    <Link
      href={hrefById(lang, "donate")}
      className={cn(
        "bell-hover inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-full bg-gold-400 px-4 font-button text-[0.98rem] text-green-950 shadow-[inset_0_-2px_0_rgba(0,0,0,0.15)] transition-colors hover:bg-gold-200",
        className,
      )}
    >
      <SwingingBell size={16} />
      {t("donate", lang)}
    </Link>
  );
}

function MobileDrawer({ lang, nav, pathname }: { lang: string; nav: NavItem[]; pathname: string }) {
  const [open, setOpen] = useState(false);
  const dir = getLanguage(lang).dir;
  useEffect(() => setOpen(false), [pathname]);
  const singles = nav.filter((n) => !n.children.length);
  const groups = nav.filter((n) => n.children.length);
  const linkCls = "flex min-h-11 items-center rounded px-3 font-button text-[1.05rem] text-green-900 hover:bg-cream-200 aria-[current=page]:bg-gold-200/60";
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label={t("nav.openMenu", lang)}
        className="flex size-10 items-center justify-center rounded-full text-cream-50 ring-1 ring-gold-500/40 hover:bg-green-700/60 lg:hidden"
      >
        <Menu className="size-5" aria-hidden />
      </SheetTrigger>
      <SheetContent side={dir === "rtl" ? "left" : "right"} className="w-[88vw] max-w-sm gap-0 overflow-y-auto border-gold-500/40 bg-cream-50 p-0">
        <SheetHeader className="border-b border-gold-500/30 bg-green-800 p-4 text-start">
          <SheetTitle className="sr-only">{t("nav.main", lang)}</SheetTitle>
          <SheetDescription className="sr-only">{tr(site.name, lang)}</SheetDescription>
          <Logo lang={lang} condensed />
        </SheetHeader>
        <div className="flex flex-col gap-5 p-4">
          <DonateButton lang={lang} className="h-12 w-full justify-center text-lg" />
          <nav aria-label={t("nav.main", lang)} className="flex flex-col gap-4">
            <ul>
              {singles.slice(0, 1).map((item) => (
                <li key={item.id}>
                  <Link href={href(lang, item.path)} aria-current={pathname === href(lang, item.path) ? "page" : undefined} className={linkCls}>
                    {itemLabel(item, lang)}
                  </Link>
                </li>
              ))}
            </ul>
            {groups.map((g) => (
              <section key={g.id} aria-labelledby={`drawer-${g.id}`}>
                <h2 id={`drawer-${g.id}`} className="eyebrow mb-1 flex items-center gap-2 px-3 text-gold-700">
                  <OrthodoxCross size={12} />
                  {itemLabel(g, lang)}
                </h2>
                <ul className="border-s border-gold-500/30 ms-3">
                  <li>
                    <Link href={href(lang, g.path)} aria-current={pathname === href(lang, g.path) ? "page" : undefined} className={linkCls}>
                      {tr(navTitleFor(g), lang)}
                    </Link>
                  </li>
                  {g.children.map((c) => (
                    <li key={c.id}>
                      <Link href={href(lang, c.path)} aria-current={pathname === href(lang, c.path) ? "page" : undefined} className={linkCls}>
                        {tr(c.title, lang)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
            <ul>
              {singles.slice(1).map((item) => (
                <li key={item.id}>
                  <Link href={href(lang, item.path)} aria-current={pathname === href(lang, item.path) ? "page" : undefined} className={linkCls}>
                    {itemLabel(item, lang)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <p className="eyebrow mb-2 text-gold-700">{t("nav.language", lang)}</p>
            <LanguageSwitcher lang={lang} variant="list" onDark={false} />
          </div>
          <div className="space-y-2 border-t border-cream-300 pt-4 text-[0.95rem]">
            <a href={`tel:${site.contact.phone.replace(/\D/g, "")}`} className="flex items-center gap-2 text-green-800">
              <Phone className="size-4" aria-hidden /> {site.contact.phone}
            </a>
            <a href={`mailto:${site.contact.email}`} className="flex items-center gap-2 break-all text-green-800">
              <Mail className="size-4" aria-hidden /> {site.contact.email}
            </a>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function SiteHeader({ lang, nav }: { lang: string; nav: NavItem[] }) {
  const pathname = usePathname() || `/${lang}/`;
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty("--header-current", scrolled ? "var(--header-h-condensed)" : "var(--header-h)");
  }, [scrolled]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-[background-color,box-shadow] duration-300",
        scrolled ? "bg-green-900/97 shadow-[0_6px_24px_-12px_rgba(0,0,0,0.6)] backdrop-blur" : "bg-gradient-to-b from-green-950/85 via-green-950/45 to-transparent",
      )}
    >
      <div className={cn("hidden overflow-hidden border-b border-gold-500/20 text-[0.8rem] text-cream-100 transition-[max-height,opacity] duration-300 lg:block", scrolled ? "max-h-0 opacity-0" : "max-h-10 opacity-100")}>
        <div className="container-sobor flex h-9 items-center justify-between gap-6">
          <TodayLine lang={lang} />
          <div className="flex shrink-0 items-center gap-5">
            <a href={`tel:${site.contact.phone.replace(/\D/g, "")}`} className="flex items-center gap-1.5 hover:text-gold-200">
              <Phone className="size-3.5" aria-hidden /> {site.contact.phone}
            </a>
            <a href={`mailto:${site.contact.email}`} className="hidden items-center gap-1.5 hover:text-gold-200 xl:flex">
              <Mail className="size-3.5" aria-hidden /> {site.contact.email}
            </a>
          </div>
        </div>
      </div>
      <div className="container-sobor flex items-center gap-3 transition-[height] duration-300" style={{ height: scrolled ? "var(--header-h-condensed)" : "var(--header-h)" }}>
        <Link href={href(lang, "")} className="min-w-0 shrink rounded focus-visible:outline-gold-400 lg:max-w-[19rem] xl:max-w-none" aria-label={tr(site.name, lang)}>
          <Logo lang={lang} condensed={scrolled} />
        </Link>
        <PriorityNav items={nav} lang={lang} pathname={pathname} />
        <div className="ms-auto flex shrink-0 items-center gap-1.5 sm:gap-2 lg:ms-0">
          <div className="hidden sm:block">
            <LanguageSwitcher lang={lang} />
          </div>
          {site.modules.store ? <CartButton lang={lang} onDark /> : null}
          <DonateButton lang={lang} className="h-9 px-3 text-[0.9rem] sm:h-10 sm:px-4 sm:text-[0.98rem]" />
          <MobileDrawer lang={lang} nav={nav} pathname={pathname} />
        </div>
      </div>
      <div className={cn("h-px bg-gradient-to-r from-transparent via-gold-500/70 to-transparent transition-opacity", scrolled ? "opacity-100" : "opacity-0")} />
    </header>
  );
}

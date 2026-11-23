import Link from "next/link";
import { ExternalLink, Mail, MapPin, Phone } from "lucide-react";
import { SealMark } from "@/components/brand/Logo";
import { DomeSkyline, skylineHeight, OrnamentBand } from "@/components/sacred/Ornaments";
import { OrthodoxCross } from "@/components/sacred/OrthodoxCross";
import { SwingingBell } from "@/components/sacred/Pictograms";
import { Newsletter } from "./Newsletter";
import { schedule, site } from "@/lib/content";
import { formatTime, localeOf, t, tr } from "@/lib/i18n";
import { href, hrefById, navTree } from "@/lib/pages";

export function weekdayName(wd: number, lang: string, style: "long" | "short" = "long") {
  return new Intl.DateTimeFormat(localeOf(lang), { weekday: style, timeZone: "UTC" }).format(new Date(Date.UTC(2024, 0, 7 + wd)));
}

export function SiteFooter({ lang }: { lang: string }) {
  const a = site.contact.address;
  const showNewsletter = site.orthodoxConnect.enabled && site.orthodoxConnect.newsletter.enabled;
  const order = Array.from({ length: 7 }, (_, i) => (i + site.weekStartsOn) % 7);
  const byDay = order
    .map((wd) => ({ wd, items: schedule.recurring.filter((r) => r.weekday === wd).sort((x, y) => x.time.localeCompare(y.time)) }))
    .filter((d) => d.items.length);

  return (
    <footer className="relative mt-16 text-cream-100">
      <DomeSkyline className={`pointer-events-none relative block w-full text-green-900 ${skylineHeight}`} />
      <div className="bg-green-900">
        <OrnamentBand className="text-gold-500/60" height={10} />
        {showNewsletter ? (
          <div className="border-b border-gold-500/20">
            <div className="container-sobor grid gap-5 py-10 md:grid-cols-[1fr_minmax(0,28rem)] md:items-center">
              <div>
                <h2 className="vyaz-title text-2xl text-gold-200 sm:text-3xl">{t("footer.newsletterTitle", lang)}</h2>
                <p className="mt-2 max-w-xl text-cream-100/85">{t("footer.newsletterText", lang)}</p>
              </div>
              <Newsletter lang={lang} />
            </div>
          </div>
        ) : null}
        <div className="container-sobor grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_0.8fr_0.9fr]">
          <div className="min-w-0">
            <div className="flex items-center gap-4">
              <SealMark lang={lang} size={84} />
              <p className="vyaz-title text-xl text-cream-50">{tr(site.name, lang)}</p>
            </div>
            <address className="mt-5 space-y-2 not-italic">
              <p className="flex gap-2">
                <MapPin className="mt-1 size-4 shrink-0 text-gold-400" aria-hidden />
                <span>
                  {a.line1}
                  <br />
                  {a.city}, {a.region} {a.postalCode}
                </span>
              </p>
              <p>
                <a className="flex items-center gap-2 hover:text-gold-200" href={`tel:${site.contact.phone.replace(/\D/g, "")}`}>
                  <Phone className="size-4 text-gold-400" aria-hidden /> {site.contact.phone}
                </a>
              </p>
              <p>
                <a className="flex items-center gap-2 break-all hover:text-gold-200" href={`mailto:${site.contact.email}`}>
                  <Mail className="size-4 shrink-0 text-gold-400" aria-hidden /> {site.contact.email}
                </a>
              </p>
              <p className="text-[0.92rem] text-cream-100/75">{tr(site.contact.officeHours, lang)}</p>
            </address>
          </div>
          <div className="min-w-0">
            <h2 className="eyebrow mb-3 text-gold-400">{t("footer.services", lang)}</h2>
            <dl className="space-y-2.5">
              {byDay.map((d) => (
                <div key={d.wd}>
                  <dt className="font-heading text-cream-50">{weekdayName(d.wd, lang)}</dt>
                  {d.items.map((s) => (
                    <dd key={s.id} className="text-[0.93rem] text-cream-100/85">
                      <span className="tabular-nums text-gold-200">{formatTime(s.time, lang)}</span> {tr(s.title, lang)}
                    </dd>
                  ))}
                </div>
              ))}
            </dl>
            <Link href={hrefById(lang, "schedule")} className="mt-3 inline-block text-[0.92rem] text-gold-200 underline underline-offset-4 hover:text-gold-400">
              {t("hero.fullSchedule", lang)}
            </Link>
          </div>
          <nav aria-label={t("footer.explore", lang)} className="min-w-0">
            <h2 className="eyebrow mb-3 text-gold-400">{t("footer.explore", lang)}</h2>
            <ul className="space-y-1.5">
              {navTree().map((n) => (
                <li key={n.id}>
                  <Link href={href(lang, n.path)} className="font-button hover:text-gold-200">{tr(n.title, lang)}</Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="min-w-0">
            <h2 className="eyebrow mb-3 text-gold-400">{t("footer.follow", lang)}</h2>
            <ul className="flex flex-wrap gap-2">
              {site.socials.map((s) => (
                <li key={s.id}>
                  <a href={s.url} rel="noopener noreferrer" target="_blank" className="inline-flex items-center gap-1.5 rounded-full border border-gold-500/40 px-3 py-1.5 text-[0.9rem] hover:border-gold-400 hover:text-gold-200">
                    {s.label} <ExternalLink className="size-3.5" aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
            <Link href={hrefById(lang, "donate")} className="bell-hover mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-gold-400 px-5 font-button text-green-950 hover:bg-gold-200">
              <SwingingBell /> {t("donate", lang)}
            </Link>
          </div>
        </div>
        <div className="border-t border-gold-500/20">
          <div className="container-sobor flex flex-col gap-2 py-5 text-[0.85rem] text-cream-100/70 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-start gap-2">
              <OrthodoxCross size={14} className="mt-0.5 shrink-0 text-gold-500" />
              <span>{tr(site.sampleNotice, lang)}</span>
            </p>
            <Link href={hrefById(lang, "credits")} className="shrink-0 underline underline-offset-4 hover:text-gold-200">
              {t("footer.credits", lang)}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

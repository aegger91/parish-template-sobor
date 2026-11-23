import "@fontsource/ponomar";
import "@fontsource/monomakh";
import "@fontsource/pt-serif/400.css";
import "./globals.css";
import type { Metadata } from "next";
import { SealMark } from "@/components/brand/Logo";
import { DomeSkyline } from "@/components/sacred/Ornaments";
import { site } from "@/lib/content";
import { defaultLang, languages, t, tr } from "@/lib/i18n";
import { hrefById } from "@/lib/pages";

export const metadata: Metadata = { title: `404 | ${tr(site.shortName, defaultLang)}` };

/** Static 404.html: one block per language so it reads correctly whatever language the visitor came from. */
export default function GlobalNotFound() {
  const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
  return (
    <html lang={defaultLang}>
      <body className="min-h-dvh bg-cream-100 antialiased">
        <div className="relative overflow-hidden bg-green-900 pb-20 pt-16 text-center text-cream-50">
          <div className="flex justify-center">
            <SealMark lang={defaultLang} size={110} />
          </div>
          <p className="vyaz-title mt-6 text-6xl text-gold-400">404</p>
          <DomeSkyline className="absolute inset-x-0 bottom-0 h-16 w-full text-cream-100" />
        </div>
        <main className="container-sobor grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-3">
          {languages.map((l) => (
            <section key={l.code} lang={l.code} dir={l.dir} className="rounded-lg border border-cream-300 bg-cream-50 p-6">
              <h1 className="text-2xl text-green-800">{t("notFound.title", l.code)}</h1>
              <p className="mt-2 text-ink-muted">{t("notFound.text", l.code)}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <a className="font-button text-green-700 underline underline-offset-4" href={`${base}/${l.code}/`}>
                  {t("nav.home", l.code)}
                </a>
                <a className="font-button text-green-700 underline underline-offset-4" href={base + hrefById(l.code, "schedule")}>
                  {t("hero.fullSchedule", l.code)}
                </a>
              </div>
            </section>
          ))}
        </main>
      </body>
    </html>
  );
}

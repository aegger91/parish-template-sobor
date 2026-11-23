import "@fontsource/ponomar";
import "@fontsource/monomakh";
import "@fontsource/pt-serif/400.css";
import "@fontsource/pt-serif/400-italic.css";
import "@fontsource/pt-serif/700.css";
import "../globals.css";
import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Toaster } from "@/components/ui/sonner";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { getLanguage, isLanguage, languages, t, tr } from "@/lib/i18n";
import { navTree } from "@/lib/pages";
import { site } from "@/lib/content";

export const dynamicParams = false;

export function generateStaticParams() {
  return languages.map((l) => ({ lang: l.code }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  return {
    title: { default: tr(site.name, lang), template: `%s | ${tr(site.shortName, lang)}` },
    description: tr(site.tagline, lang),
    icons: { icon: `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/favicon.svg` },
  };
}

export const viewport: Viewport = { themeColor: "#173d2c", width: "device-width", initialScale: 1 };

export default async function LangLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLanguage(lang)) notFound();
  const language = getLanguage(lang);
  return (
    <html lang={language.locale.split("-")[0]} dir={language.dir} className="scroll-smooth">
      <body className="flex min-h-dvh flex-col antialiased">
        <a
          href="#main"
          className="sr-only z-[100] rounded bg-gold-400 px-4 py-2 text-green-950 focus:not-sr-only focus:fixed focus:start-3 focus:top-3"
        >
          {t("skip", lang)}
        </a>
        <SiteHeader lang={lang} nav={navTree()} />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter lang={lang} />
        <Toaster position="bottom-center" />
      </body>
    </html>
  );
}

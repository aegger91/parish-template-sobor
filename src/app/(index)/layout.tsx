import "@fontsource/monomakh";
import "@fontsource/pt-serif/400.css";
import "../globals.css";
import type { Metadata } from "next";
import { site } from "@/lib/content";
import { defaultLang, getLanguage, tr } from "@/lib/i18n";

export const metadata: Metadata = {
  title: tr(site.name, defaultLang),
  description: tr(site.tagline, defaultLang),
  icons: { icon: `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/favicon.svg` },
};

export default function IndexLayout({ children }: { children: React.ReactNode }) {
  const lang = getLanguage(defaultLang);
  return (
    <html lang={lang.locale.split("-")[0]} dir={lang.dir}>
      <body className="min-h-dvh bg-green-900 antialiased">{children}</body>
    </html>
  );
}

"use client";

import { Mail } from "lucide-react";
import type { SectionProps } from "./SectionRenderer";
import { Paragraphs, SectionHeader, SectionShell } from "./SectionShell";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { OrthodoxCross } from "@/components/sacred/OrthodoxCross";
import { clergy } from "@/lib/content";
import { t, tr } from "@/lib/i18n";
import { withBase } from "@/lib/pages";
import type { Clergy } from "@/lib/types";

function Medallion({ person, lang, size = "lg" }: { person: Clergy; lang: string; size?: "lg" | "sm" }) {
  const dim = size === "lg" ? "size-36" : "size-20";
  if (person.photo) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={withBase(person.photo)} alt={tr(person.name, lang)} className={`${dim} rounded-full object-cover ring-4 ring-gold-400`} />;
  }
  return (
    <span className={`relative flex ${dim} shrink-0 items-center justify-center rounded-full bg-green-800 text-gold-200 ring-4 ring-gold-400 ring-offset-4 ring-offset-cream-50`} aria-hidden>
      <span className="absolute inset-2 rounded-full border border-gold-500/50" />
      <OrthodoxCross className={size === "lg" ? "absolute top-4 h-6 text-gold-400" : "absolute top-2 h-3.5 text-gold-400"} />
      <span className={size === "lg" ? "mt-5 font-display text-4xl" : "mt-3 font-display text-xl"}>{person.initials}</span>
    </span>
  );
}

export function ClergyGrid({ lang, section }: SectionProps) {
  return (
    <SectionShell id={section.id}>
      <SectionHeader title={tr(section.title, lang)} intro={tr(section.intro, lang)} />
      <ul className="container-sobor grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {clergy.map((p) => (
          <li key={p.id} className="flex flex-col items-center rounded-t-[160px] rounded-b-lg border border-cream-300 bg-cream-50 px-5 pb-6 pt-8 text-center shadow-sm">
            <Medallion person={p} lang={lang} />
            <h3 className="mt-6 text-[1.3rem] leading-normal text-green-800">{tr(p.name, lang)}</h3>
            <p className="eyebrow mt-1.5 text-gold-700">{tr(p.role, lang)}</p>
            <p className="mt-3 text-[0.97rem] text-ink-muted">{tr(p.shortBio, lang)}</p>
            <div className="mt-auto pt-5">
            <Dialog>
              <DialogTrigger className="bell-hover inline-flex min-h-10 items-center rounded-full border border-green-800/30 px-4 font-button text-green-800 hover:border-gold-500">
                {t("clergy.readBio", lang)}
              </DialogTrigger>
              <DialogContent closeLabel={t("close", lang)} className="bg-cream-50 p-6 sm:max-w-xl">
                <DialogHeader className="flex-row items-center gap-4 text-start">
                  <Medallion person={p} lang={lang} size="sm" />
                  <div>
                    <DialogTitle className="text-2xl text-green-800">{tr(p.name, lang)}</DialogTitle>
                    <DialogDescription className="eyebrow mt-1 text-gold-700">{tr(p.role, lang)}</DialogDescription>
                  </div>
                </DialogHeader>
                <Paragraphs text={tr(p.bio, lang)} />
                {p.email ? (
                  <a href={`mailto:${p.email}`} className="inline-flex items-center gap-2 font-button text-green-800 underline underline-offset-4">
                    <Mail className="size-4" aria-hidden /> {t("clergy.write", lang, { name: tr(p.name, lang) })}
                  </a>
                ) : null}
              </DialogContent>
            </Dialog>
            </div>
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
import type { SectionProps } from "./SectionRenderer";
import { SectionHeader, SectionShell } from "./SectionShell";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { FilterChips } from "./FilterChips";
import { gallery } from "@/lib/content";
import { t, tr } from "@/lib/i18n";
import { withBase } from "@/lib/pages";

export function Gallery({ lang, section }: SectionProps) {
  const [album, setAlbum] = useState("all");
  const [open, setOpen] = useState<number | null>(null);
  const items = useMemo(() => (album === "all" ? gallery.items : gallery.items.filter((i) => i.album === album)), [album]);
  const current = open !== null ? items[open] : null;

  const step = useCallback((d: number) => setOpen((o) => (o === null ? o : (o + d + items.length) % items.length)), [items.length]);

  useEffect(() => {
    if (open === null) return;
    const rtl = document.dir === "rtl";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(rtl ? -1 : 1);
      if (e.key === "ArrowLeft") step(rtl ? 1 : -1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, step]);

  return (
    <SectionShell id={section.id}>
      <SectionHeader title={tr(section.title, lang)} intro={tr(section.intro, lang)} />
      <div className="container-sobor">
        <FilterChips
          label={t("gallery.filter", lang)}
          value={album}
          onChange={setAlbum}
          options={[{ id: "all", label: t("all", lang) }, ...gallery.albums.map((a) => ({ id: a.id, label: tr(a.name, lang) }))]}
        />
        {items.length === 0 ? (
          <p className="mt-10 flex flex-col items-center gap-3 text-ink-muted">
            <ImageOff className="size-8" aria-hidden /> {t("gallery.empty", lang)}
          </p>
        ) : (
          <ul className="mt-8 columns-1 gap-4 sm:columns-2 lg:columns-3">
            {items.map((it, i) => (
              <li key={it.id} className="mb-4 break-inside-avoid">
                <button
                  type="button"
                  onClick={() => setOpen(i)}
                  className="group relative block w-full overflow-hidden rounded-lg border-4 border-cream-50 bg-cream-200 shadow-sm ring-1 ring-gold-500/40 focus-visible:outline-3 focus-visible:outline-gold-500"
                  aria-label={t("gallery.open", lang, { caption: tr(it.caption, lang) })}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={withBase(it.thumb)} alt="" width={it.width} height={it.height} loading="lazy" className="h-auto w-full transition-transform duration-500 group-hover:scale-[1.03]" />
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-green-950/85 to-transparent p-3 pt-10 text-start text-[0.88rem] text-cream-50 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-visible:opacity-100">
                    {tr(it.caption, lang)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <Dialog open={current !== null} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent closeLabel={t("close", lang)} className="w-[min(96vw,1100px)] max-w-none gap-3 border border-gold-500/40 bg-green-950 p-3 text-cream-50 sm:max-w-none sm:p-4 [&_[data-slot=dialog-close]]:bg-cream-50/90 [&_[data-slot=dialog-close]]:text-green-950">
          {current ? (
            <>
              <div className="relative flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={withBase(current.src)} alt={tr(current.caption, lang)} className="max-h-[72svh] w-auto max-w-full rounded object-contain" />
                <button type="button" onClick={() => step(-1)} aria-label={t("previous", lang)} className="absolute start-2 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-green-950/70 text-cream-50 ring-1 ring-gold-500/50 hover:bg-green-900">
                  <ChevronLeft className="size-6 rtl:rotate-180" aria-hidden />
                </button>
                <button type="button" onClick={() => step(1)} aria-label={t("next", lang)} className="absolute end-2 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-green-950/70 text-cream-50 ring-1 ring-gold-500/50 hover:bg-green-900">
                  <ChevronRight className="size-6 rtl:rotate-180" aria-hidden />
                </button>
              </div>
              <div className="flex flex-col gap-1 px-1 sm:flex-row sm:items-baseline sm:justify-between">
                <DialogTitle className="text-[1.05rem] font-normal text-cream-50">{tr(current.caption, lang)}</DialogTitle>
                <p className="shrink-0 text-[0.85rem] text-gold-200">{t("gallery.of", lang, { n: (open ?? 0) + 1, total: items.length })}</p>
              </div>
              <DialogDescription className="px-1 text-[0.8rem] text-cream-100/70">{current.credit}</DialogDescription>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </SectionShell>
  );
}

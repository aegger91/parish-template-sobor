"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { SectionProps } from "./SectionRenderer";
import { SectionHeader, SectionShell } from "./SectionShell";
import { Pictogram } from "@/components/sacred/Pictograms";
import { historyEvents } from "@/lib/content";
import { t, tr } from "@/lib/i18n";
import { withBase } from "@/lib/pages";
import { cn } from "@/lib/utils";

export function Timeline({ lang, section }: SectionProps) {
  const scroller = useRef<HTMLOListElement>(null);
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);

  const onScroll = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const pos = Math.abs(el.scrollLeft);
    setProgress(max > 0 ? pos / max : 0);
    const items = Array.from(el.children) as HTMLElement[];
    const box = el.getBoundingClientRect();
    let best = 0;
    let bestDist = Infinity;
    items.forEach((it, i) => {
      const r = it.getBoundingClientRect();
      const d = Math.abs(r.left - box.left - 16);
      const dr = Math.abs(box.right - r.right - 16);
      const dist = document.dir === "rtl" ? dr : d;
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    });
    setActive(pos >= max - 2 ? items.length - 1 : best);
  }, []);

  useEffect(() => {
    onScroll();
  }, [onScroll]);

  const goTo = (i: number) => {
    const el = scroller.current;
    const item = el?.children[Math.max(0, Math.min(historyEvents.length - 1, i))] as HTMLElement | undefined;
    item?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
  };

  const arrow = "inline-flex size-10 items-center justify-center rounded-full border border-green-800/25 bg-cream-50 text-green-800 hover:border-gold-500 disabled:opacity-35";

  return (
    <SectionShell id={section.id} className="pt-0 sm:pt-0">
      <SectionHeader
        title={tr(section.title, lang)}
        sticky={section.stickyHeader}
        actions={
          <div className="flex gap-2">
            <button type="button" className={arrow} onClick={() => goTo(active - 1)} disabled={active === 0} aria-label={t("previous", lang)}>
              <ChevronLeft className="size-5 rtl:rotate-180" aria-hidden />
            </button>
            <button type="button" className={arrow} onClick={() => goTo(active + 1)} disabled={active >= historyEvents.length - 1} aria-label={t("next", lang)}>
              <ChevronRight className="size-5 rtl:rotate-180" aria-hidden />
            </button>
          </div>
        }
      />
      <div className="container-sobor mt-6">
        {section.intro ? <p className="mb-4 max-w-3xl text-ink-muted">{tr(section.intro, lang)}</p> : null}
        <nav aria-label={t("timeline.jump", lang)} className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1 pb-2">
          {historyEvents.map((e, i) => (
            <button
              key={e.id}
              type="button"
              onClick={() => goTo(i)}
              aria-current={i === active ? "step" : undefined}
              className={cn(
                "shrink-0 rounded-full px-3 py-1 font-heading text-[0.95rem] tabular-nums transition-colors",
                i === active ? "bg-green-800 text-gold-200" : "text-green-800 hover:bg-cream-200",
              )}
            >
              {e.year}
            </button>
          ))}
        </nav>
        <div className="relative mt-2 h-1 rounded-full bg-cream-300" aria-hidden>
          <div className="absolute inset-y-0 start-0 rounded-full bg-gold-500 transition-[width]" style={{ width: `${Math.max(6, progress * 100)}%` }} />
        </div>
      </div>
      <ol
        ref={scroller}
        onScroll={onScroll}
        tabIndex={0}
        aria-label={tr(section.title, lang)}
        className="scroll-x-hidden-bar mt-6 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-[max(1rem,calc((100vw-var(--container-max))/2+1rem))] pb-6 focus-visible:outline-2 focus-visible:outline-gold-500"
      >
        {historyEvents.map((e, i) => (
          <li key={e.id} className="relative w-[82vw] max-w-[22rem] shrink-0 snap-start pt-10 sm:w-[22rem]">
            <div className="absolute inset-x-0 top-4 h-px bg-gold-500/60" aria-hidden />
            <span
              className={cn(
                "absolute start-0 top-0 flex h-8 items-center gap-1.5 rounded-full border px-3 font-display text-[1.05rem]",
                i === active ? "border-gold-500 bg-green-800 text-gold-200" : "border-gold-500/60 bg-cream-50 text-green-800",
              )}
            >
              <Pictogram name="church" size={14} /> {e.year}
            </span>
            <article className="h-full overflow-hidden rounded-lg border border-cream-300 bg-cream-50 shadow-sm">
              {e.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={withBase(e.image)} alt="" className="aspect-[16/9] w-full object-cover sepia-[0.25]" loading="lazy" />
              ) : (
                <div className="flex aspect-[16/9] items-center justify-center bg-green-800 text-gold-400/80" aria-hidden>
                  <Pictogram name={i % 2 ? "bells" : "church"} size={64} strokeWidth={1.2} />
                </div>
              )}
              <div className="p-5">
                <h3 className="text-[1.2rem] leading-snug text-green-800">{tr(e.title, lang)}</h3>
                <p className="mt-2 text-[0.97rem] text-ink-muted">{tr(e.body, lang)}</p>
              </div>
            </article>
          </li>
        ))}
      </ol>
      <p className="container-sobor text-[0.85rem] text-ink-muted">{t("timeline.hint", lang)}</p>
    </SectionShell>
  );
}

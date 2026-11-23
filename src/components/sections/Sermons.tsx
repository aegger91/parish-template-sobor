"use client";

import { useMemo, useState } from "react";
import { BookOpen, FileText, Headphones, Play, Search, Video } from "lucide-react";
import type { SectionProps } from "./SectionRenderer";
import { Paragraphs, SectionHeader, SectionShell } from "./SectionShell";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { FilterChips } from "./FilterChips";
import { sermons } from "@/lib/content";
import { formatIsoDate, t, tr } from "@/lib/i18n";
import type { Sermon } from "@/lib/types";
import { cn } from "@/lib/utils";

const typeIcon = { audio: Headphones, video: Video, text: FileText };

export function Sermons({ lang, section }: SectionProps) {
  const [type, setType] = useState("all");
  const [q, setQ] = useState("");
  const [playing, setPlaying] = useState<string | null>(null);
  const [reading, setReading] = useState<Sermon | null>(null);

  const list = useMemo(() => {
    const needle = q.trim().toLocaleLowerCase();
    return [...sermons]
      .sort((a, b) => b.date.localeCompare(a.date))
      .filter((s) => type === "all" || s.type === type)
      .filter((s) => !needle || [s.title, s.preacher, s.scripture, s.summary].some((f) => tr(f, lang).toLocaleLowerCase().includes(needle)));
  }, [q, type, lang]);

  return (
    <SectionShell id={section.id} className="pt-0 sm:pt-0">
      <SectionHeader
        title={tr(section.title, lang)}
        sticky={section.stickyHeader}
        actions={
          <label className="relative block w-full min-w-0 sm:w-64">
            <span className="sr-only">{t("sermons.search", lang)}</span>
            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" aria-hidden />
            <Input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("sermons.search", lang)} className="h-10 rounded-full border-green-800/25 bg-cream-50 ps-9" />
          </label>
        }
      />
      <div className="container-sobor mt-6">
        {section.intro ? <p className="mb-5 max-w-3xl text-ink-muted">{tr(section.intro, lang)}</p> : null}
        <FilterChips
          className="justify-start"
          label={t("sermons.filter", lang)}
          value={type}
          onChange={setType}
          options={[
            { id: "all", label: t("all", lang) },
            { id: "audio", label: t("sermons.audio", lang) },
            { id: "video", label: t("sermons.video", lang) },
            { id: "text", label: t("sermons.text", lang) },
          ]}
        />
        {list.length === 0 ? (
          <p className="mt-10 text-center text-ink-muted">{t("sermons.empty", lang)}</p>
        ) : (
          <ul className="mt-6 grid gap-4 lg:grid-cols-2">
            {list.map((s) => {
              const Icon = typeIcon[s.type];
              const isPlaying = playing === s.id;
              return (
                <li key={s.id} className={cn("rounded-lg border bg-cream-50 p-5 shadow-sm", isPlaying ? "border-gold-500" : "border-cream-300")}>
                  <div className="flex gap-4">
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-green-800 text-gold-300">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap gap-x-3 text-[0.85rem] text-ink-muted">
                        <time dateTime={s.date}>{formatIsoDate(s.date, lang)}</time>
                        <span>{t(`sermons.${s.type}` as "sermons.audio", lang)}</span>
                        {s.durationMinutes ? <span>{t("sermons.minutes", lang, { n: s.durationMinutes })}</span> : null}
                      </p>
                      <h3 className="mt-1 text-[1.2rem] leading-normal text-green-800">{tr(s.title, lang)}</h3>
                      <p className="mt-0.5 text-[0.92rem] text-gold-700">
                        {tr(s.preacher, lang)} · <BookOpen className="inline size-3.5" aria-hidden /> {tr(s.scripture, lang)}
                      </p>
                      <p className="mt-2 text-[0.95rem] text-ink-muted">{tr(s.summary, lang)}</p>
                      <div className="mt-3">
                        {s.type === "text" ? (
                          <button type="button" onClick={() => setReading(s)} className="bell-hover inline-flex min-h-10 items-center gap-2 rounded-full border border-green-800/30 px-4 font-button text-green-800 hover:border-gold-500">
                            <FileText className="size-4" aria-hidden /> {t("sermons.read", lang)}
                          </button>
                        ) : (
                          <button type="button" onClick={() => setPlaying(isPlaying ? null : s.id)} aria-expanded={isPlaying} className="bell-hover inline-flex min-h-10 items-center gap-2 rounded-full bg-green-800 px-4 font-button text-cream-50 hover:bg-green-700">
                            <Play className="size-4" aria-hidden /> {t(s.type === "video" ? "sermons.watch" : "sermons.play", lang)}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  {isPlaying ? (
                    <div className="mt-4 rounded-md border border-gold-500/40 bg-green-950 p-4 text-cream-100">
                      <p className="eyebrow text-gold-300">{t("sermons.nowPlaying", lang)}</p>
                      {s.mediaUrl ? (
                        s.type === "audio" ? (
                          <audio controls src={s.mediaUrl} className="mt-2 w-full" />
                        ) : (
                          <div className="mt-2 aspect-video">
                            <iframe src={s.mediaUrl} title={tr(s.title, lang)} className="size-full rounded" allowFullScreen />
                          </div>
                        )
                      ) : (
                        <p className="mt-2 text-[0.9rem] text-cream-100/80">{t("sermons.noMedia", lang)}</p>
                      )}
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <Dialog open={!!reading} onOpenChange={(o) => !o && setReading(null)}>
        <DialogContent closeLabel={t("close", lang)} className="bg-cream-50 p-6 sm:max-w-2xl">
          {reading ? (
            <>
              <DialogHeader className="text-start">
                <DialogTitle className="pe-8 text-2xl text-green-800">{tr(reading.title, lang)}</DialogTitle>
                <DialogDescription className="text-gold-700">
                  {tr(reading.preacher, lang)} · {tr(reading.scripture, lang)}
                </DialogDescription>
              </DialogHeader>
              <Paragraphs text={tr(reading.text ?? reading.summary, lang)} />
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </SectionShell>
  );
}

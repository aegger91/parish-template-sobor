"use client";

import { useState, type ReactElement, type ReactNode } from "react";
import { CalendarPlus, ExternalLink, MapPin, Radio } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  downloadIcs,
  googleCalendarUrl,
  mapsUrl,
  occurrenceIcs,
  parishAddressLabel,
} from "@/lib/calendar-links";
import { occurrenceNote, toIso, type Occurrence } from "@/lib/calendar";
import { formatDay } from "@/lib/format";
import { formatTime, t, tr } from "@/lib/i18n";
import { hrefById } from "@/lib/pages";
import { cn } from "@/lib/utils";

export function OccurrenceDetail({
  lang,
  occurrence,
  open,
  onOpenChange,
  trigger,
}: {
  lang: string;
  occurrence: Occurrence;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactElement;
}) {
  const title = tr(occurrence.title, lang);
  const note = occurrenceNote(occurrence);
  const noteText = note ? tr(note, lang) : "";
  const place = parishAddressLabel(lang);
  const dayIso = toIso(occurrence.day);
  const dateLabel = formatDay(occurrence.day, lang, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const timeLabel = formatTime(occurrence.time, lang);

  const addIcs = () => {
    downloadIcs(`${occurrence.id}.ics`, occurrenceIcs(occurrence, lang));
  };

  const gcal = googleCalendarUrl({
    title,
    dayIso,
    time: occurrence.time,
    durationMinutes: occurrence.durationMinutes,
    place,
    details: noteText,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent closeLabel={t("close", lang)} className="bg-cream-50 p-6 sm:max-w-md" aria-describedby={undefined}>
        <DialogHeader className="text-start">
          <DialogTitle className="pe-8 text-[1.35rem] text-green-800">{title}</DialogTitle>
          <DialogDescription className="sr-only">{t("schedule.detailTitle", lang)}</DialogDescription>
        </DialogHeader>
        <dl className="space-y-3 text-[0.95rem]">
          <div>
            <dt className="eyebrow text-gold-700">{t("schedule.date", lang)}</dt>
            <dd className="mt-0.5 text-ink">{dateLabel}</dd>
          </div>
          <div>
            <dt className="eyebrow text-gold-700">{t("schedule.time", lang)}</dt>
            <dd className="mt-0.5 tabular-nums text-ink">{timeLabel}</dd>
          </div>
          <div>
            <dt className="eyebrow text-gold-700">{t("schedule.place", lang)}</dt>
            <dd className="mt-0.5 text-ink">{place}</dd>
          </div>
          {noteText ? (
            <div>
              <dt className="eyebrow text-gold-700">{t("schedule.note", lang)}</dt>
              <dd className="mt-0.5 text-ink-muted">{noteText}</dd>
            </div>
          ) : null}
        </dl>
        <div className="flex flex-col gap-2 pt-1">
          <button
            type="button"
            onClick={addIcs}
            className="bell-hover inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-green-800 px-4 font-button text-cream-50 hover:bg-green-700"
          >
            <CalendarPlus className="size-4" aria-hidden />
            {t("schedule.addToCalendar", lang)}
          </button>
          <a
            href={gcal}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-green-800/30 px-4 font-button text-green-800 hover:border-gold-500"
          >
            <ExternalLink className="size-4" aria-hidden />
            {t("schedule.googleCalendar", lang)}
          </a>
          <a
            href={mapsUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-green-800/30 px-4 font-button text-green-800 hover:border-gold-500"
          >
            <MapPin className="size-4" aria-hidden />
            {t("schedule.getDirections", lang)}
          </a>
          {occurrence.streamed ? (
            <a
              href={hrefById(lang, "livestream")}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-gold-500/50 px-4 font-button text-gold-700 hover:border-gold-500 hover:bg-gold-200/30"
            >
              <Radio className="size-4" aria-hidden />
              {t("schedule.watchLive", lang)}
            </a>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Wraps row content as a button that opens the occurrence detail dialog. */
export function ServiceRowButton({
  lang,
  occurrence,
  className,
  children,
}: {
  lang: string;
  occurrence: Occurrence;
  className?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={cn(
          "w-full rounded text-start outline-none transition-colors focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2",
          className,
        )}
      >
        {children}
      </button>
      <OccurrenceDetail lang={lang} occurrence={occurrence} open={open} onOpenChange={setOpen} />
    </>
  );
}

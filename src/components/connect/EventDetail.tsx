"use client";

import { useState, type ReactElement, type ReactNode } from "react";
import { CalendarPlus, ExternalLink, MapPin } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  connectItemDurationMinutes,
  connectItemIcs,
  connectItemMapsUrl,
  downloadIcs,
  googleCalendarUrl,
} from "@/lib/calendar-links";
import { formatIsoDate, formatTime, t, tr } from "@/lib/i18n";
import type { ConnectItem } from "@/lib/types";
import { cn } from "@/lib/utils";

export function EventDetail({
  lang,
  item,
  open,
  onOpenChange,
  trigger,
}: {
  lang: string;
  item: ConnectItem;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactElement;
}) {
  const title = tr(item.title, lang);
  const place = tr(item.location, lang);
  const note = tr(item.description, lang);
  const dateLabel = formatIsoDate(item.date, lang, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const timeLabel = item.endTime
    ? `${formatTime(item.time, lang)} – ${formatTime(item.endTime, lang)}`
    : formatTime(item.time, lang);
  const duration = connectItemDurationMinutes(item);

  const addIcs = () => {
    downloadIcs(`${item.id}.ics`, connectItemIcs(item, lang));
  };

  const gcal = googleCalendarUrl({
    title,
    dayIso: item.date,
    time: item.time,
    durationMinutes: duration,
    place,
    details: note,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent closeLabel={t("close", lang)} className="bg-cream-50 p-6 sm:max-w-md">
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
          {note ? (
            <div>
              <dt className="eyebrow text-gold-700">{t("schedule.note", lang)}</dt>
              <dd className="mt-0.5 text-ink-muted">{note}</dd>
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
            href={connectItemMapsUrl(item, lang)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-green-800/30 px-4 font-button text-green-800 hover:border-gold-500"
          >
            <MapPin className="size-4" aria-hidden />
            {t("schedule.getDirections", lang)}
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Makes a Connect card title/body open the event detail dialog. */
export function EventDetailButton({
  lang,
  item,
  className,
  children,
}: {
  lang: string;
  item: ConnectItem;
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
      <EventDetail lang={lang} item={item} open={open} onOpenChange={setOpen} />
    </>
  );
}

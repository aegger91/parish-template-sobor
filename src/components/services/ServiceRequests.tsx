"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Clock, Loader2 } from "lucide-react";
import type { SectionProps } from "@/components/sections/SectionRenderer";
import { SectionHeader, SectionShell } from "@/components/sections/SectionShell";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, inputClass } from "@/components/forms/Field";
import { IllustrationTile } from "@/components/sacred/Ornaments";
import { SwingingBell, type PictogramName } from "@/components/sacred/Pictograms";
import { parishServices } from "@/lib/content";
import { isEmail, isFullPhone, maskPhone } from "@/lib/hooks";
import { submitServiceRequest } from "@/lib/integrations/forms";
import { formatMoney, t, tr } from "@/lib/i18n";
import { href } from "@/lib/pages";
import type { ParishServiceItem } from "@/lib/types";

function PriceTag({ item, lang }: { item: ParishServiceItem; lang: string }) {
  if (item.price.kind === "free") return <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-[0.85rem] text-green-800">{t("services.free", lang)}</span>;
  return (
    <span className="rounded-full bg-gold-200/60 px-2.5 py-0.5 text-[0.85rem] text-gold-700">
      {item.price.suggested ? t("services.suggested", lang, { amount: formatMoney(item.price.suggested, lang, { whole: true }) }) : t("services.donation", lang)}
    </span>
  );
}

function RequestForm({ item, lang }: { item: ParishServiceItem; lang: string }) {
  const [v, setV] = useState({ name: "", phone: "", email: "", date: "", time: "", notes: "" });
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const id = (k: string) => `${item.id}-${k}`;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = {
      name: v.name.trim() ? undefined : t("form.errName", lang),
      phone: isFullPhone(v.phone) ? undefined : t("form.errPhone", lang),
      email: isEmail(v.email) ? undefined : t("form.errEmail", lang),
    };
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) return;
    setState("sending");
    const res = await submitServiceRequest({ serviceId: item.id, routeTo: item.routeTo, name: v.name, phone: v.phone, email: v.email, preferredDate: v.date, preferredTime: v.time, notes: v.notes });
    setState(res.ok ? "done" : "error");
  };

  if (state === "done") {
    return (
      <p className="flex items-start gap-2 rounded-md bg-green-100 p-4 text-green-800" role="status">
        <Check className="mt-1 size-4 shrink-0" aria-hidden /> {t("services.sent", lang)}
      </p>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
      <Field id={id("name")} label={t("form.name", lang)} error={errors.name} className="sm:col-span-2">
        <Input id={id("name")} value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} autoComplete="name" aria-invalid={!!errors.name} className={inputClass} />
      </Field>
      <Field id={id("phone")} label={t("form.phone", lang)} error={errors.phone} hint={t("form.phoneHint", lang)}>
        <Input
          id={id("phone")}
          type="tel"
          inputMode="numeric"
          dir="ltr"
          placeholder="(000)-000-0000"
          value={v.phone}
          onChange={(e) => setV({ ...v, phone: maskPhone(e.target.value) })}
          autoComplete="tel-national"
          aria-invalid={!!errors.phone}
          className={inputClass}
        />
      </Field>
      <Field id={id("email")} label={t("form.email", lang)} error={errors.email}>
        <Input id={id("email")} type="email" dir="ltr" value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} autoComplete="email" aria-invalid={!!errors.email} className={inputClass} />
      </Field>
      <Field id={id("date")} label={t("form.preferredDate", lang)} optionalLabel={t("optional", lang)}>
        <Input id={id("date")} type="date" value={v.date} onChange={(e) => setV({ ...v, date: e.target.value })} className={inputClass} />
      </Field>
      <Field id={id("time")} label={t("form.preferredTime", lang)} optionalLabel={t("optional", lang)}>
        <Input id={id("time")} type="time" value={v.time} onChange={(e) => setV({ ...v, time: e.target.value })} className={inputClass} />
      </Field>
      <Field id={id("notes")} label={t("form.notes", lang)} optionalLabel={t("optional", lang)} className="sm:col-span-2">
        <Textarea id={id("notes")} rows={3} value={v.notes} onChange={(e) => setV({ ...v, notes: e.target.value })} className="bg-white text-base" />
      </Field>
      <div className="space-y-2 sm:col-span-2">
        <p className="text-[0.88rem] text-green-700">{t(`services.routesTo.${item.routeTo}` as "services.routesTo.priest", lang)}</p>
        {state === "error" ? <p className="text-kinovar" role="alert">{t("error.generic", lang)}</p> : null}
        <button type="submit" disabled={state === "sending"} className="bell-hover inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-green-800 px-6 font-button text-cream-50 hover:bg-green-700 disabled:opacity-70 sm:w-auto">
          {state === "sending" ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <SwingingBell />}
          {state === "sending" ? t("sending", lang) : t("send", lang)}
        </button>
        <p className="text-[0.8rem] text-ink-muted">{t("sampleHandlerNote", lang)}</p>
      </div>
    </form>
  );
}

export function ServiceRequests({ lang, section }: SectionProps) {
  return (
    <SectionShell id={section.id}>
      <SectionHeader title={tr(section.title, lang)} intro={tr(section.intro, lang)} />
      <ul className="container-sobor grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {parishServices.map((s) => (
          <li key={s.id}>
            <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-cream-300 bg-cream-50 shadow-sm transition hover:-translate-y-0.5 hover:border-gold-500 hover:shadow-md">
              <IllustrationTile name={s.illustration as PictogramName} className="aspect-[4/3]" label={tr(s.title, lang)} />
              <div className="flex flex-1 flex-col p-5">
                <h3 className="vyaz-title text-[1.35rem] text-green-800">{tr(s.title, lang)}</h3>
                {s.subtitle ? <p className="text-[0.88rem] text-gold-700">{tr(s.subtitle, lang)}</p> : null}
                <p className="mt-2 text-[0.95rem] text-ink-muted">{tr(s.description, lang)}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-[0.85rem]">
                  <PriceTag item={s} lang={lang} />
                  <span className="inline-flex items-center gap-1 text-ink-muted">
                    <Clock className="size-3.5" aria-hidden />
                    <span className="sr-only">{t("services.duration", lang)}:</span> {tr(s.duration, lang)}
                  </span>
                </div>
                <div className="mt-auto pt-4">
                  {s.action === "link" && s.href ? (
                    <Link href={href(lang, s.href)} className="bell-hover inline-flex min-h-10 items-center gap-2 rounded-full bg-green-800 px-4 font-button text-cream-50 hover:bg-green-700">
                      <SwingingBell /> {t("services.openZapiski", lang)}
                    </Link>
                  ) : (
                    <Dialog>
                      <DialogTrigger className="bell-hover inline-flex min-h-10 items-center gap-2 rounded-full bg-green-800 px-4 font-button text-cream-50 hover:bg-green-700">
                        <SwingingBell /> {t("services.request", lang)}
                      </DialogTrigger>
                      <DialogContent closeLabel={t("close", lang)} className="bg-cream-50 p-6 sm:max-w-lg">
                        <DialogHeader className="text-start">
                          <DialogTitle className="pe-8 text-[1.45rem] text-green-800">{t("services.formTitle", lang, { service: tr(s.title, lang) })}</DialogTitle>
                          <DialogDescription className="flex flex-wrap items-center gap-2">
                            <PriceTag item={s} lang={lang} /> <span className="text-ink-muted">{tr(s.duration, lang)}</span>
                          </DialogDescription>
                        </DialogHeader>
                        <RequestForm item={s} lang={lang} />
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}

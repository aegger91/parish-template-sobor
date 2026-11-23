"use client";

import { useState } from "react";
import { Bus, Car, Check, Clock, ExternalLink, Footprints, Loader2, Mail, MapPin, Phone } from "lucide-react";
import type { SectionProps } from "./SectionRenderer";
import { SectionShell } from "./SectionShell";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, inputClass } from "@/components/forms/Field";
import { SwingingBell } from "@/components/sacred/Pictograms";
import { MapPlaceholder, addressLines, mapsUrl } from "./StaticSections";
import { site } from "@/lib/content";
import { isEmail, isFullPhone, maskPhone } from "@/lib/hooks";
import { submitContactMessage } from "@/lib/integrations/forms";
import { t, tr } from "@/lib/i18n";

const dirIcons = [Car, Bus, Footprints];

export function Contact({ lang, section }: SectionProps) {
  const [v, setV] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = {
      name: v.name.trim() ? undefined : t("form.errName", lang),
      email: isEmail(v.email) ? undefined : t("form.errEmail", lang),
      phone: !v.phone || isFullPhone(v.phone) ? undefined : t("form.errPhone", lang),
      message: v.message.trim().length >= 5 ? undefined : t("form.errMessage", lang),
    };
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) return;
    setState("sending");
    const res = await submitContactMessage({ ...v, phone: v.phone || undefined });
    setState(res.ok ? "done" : "error");
  };

  return (
    <SectionShell id={section.id}>
      <div className="container-sobor grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div className="rounded-lg border border-gold-500/40 bg-cream-50 p-5 shadow-sm sm:p-8">
          <h2 className="vyaz-title text-[1.8rem] text-green-800">{tr(section.title, lang) || t("contact.title", lang)}</h2>
          {section.intro ? <p className="mt-2 text-ink-muted">{tr(section.intro, lang)}</p> : null}
          {state === "done" ? (
            <p className="mt-6 flex items-start gap-2 rounded-md bg-green-100 p-4 text-green-800" role="status">
              <Check className="mt-1 size-4 shrink-0" aria-hidden /> {t("contact.sent", lang)}
            </p>
          ) : (
            <form onSubmit={submit} noValidate className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field id="c-name" label={t("form.name", lang)} error={errors.name} className="sm:col-span-2">
                <Input id="c-name" value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} autoComplete="name" aria-invalid={!!errors.name} className={inputClass} />
              </Field>
              <Field id="c-email" label={t("form.email", lang)} error={errors.email}>
                <Input id="c-email" type="email" dir="ltr" value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} autoComplete="email" aria-invalid={!!errors.email} className={inputClass} />
              </Field>
              <Field id="c-phone" label={t("form.phone", lang)} optionalLabel={t("optional", lang)} error={errors.phone} hint={t("form.phoneHint", lang)}>
                <Input id="c-phone" type="tel" dir="ltr" inputMode="numeric" placeholder="(000)-000-0000" value={v.phone} onChange={(e) => setV({ ...v, phone: maskPhone(e.target.value) })} autoComplete="tel-national" aria-invalid={!!errors.phone} className={inputClass} />
              </Field>
              <Field id="c-subject" label={t("form.subject", lang)} optionalLabel={t("optional", lang)} className="sm:col-span-2">
                <Input id="c-subject" value={v.subject} onChange={(e) => setV({ ...v, subject: e.target.value })} className={inputClass} />
              </Field>
              <Field id="c-message" label={t("form.message", lang)} error={errors.message} className="sm:col-span-2">
                <Textarea id="c-message" rows={5} value={v.message} onChange={(e) => setV({ ...v, message: e.target.value })} aria-invalid={!!errors.message} className="bg-white text-base" />
              </Field>
              <div className="space-y-2 sm:col-span-2">
                {state === "error" ? <p className="text-kinovar" role="alert">{t("error.generic", lang)}</p> : null}
                <button type="submit" disabled={state === "sending"} className="bell-hover inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-green-800 px-6 font-button text-cream-50 hover:bg-green-700 disabled:opacity-70 sm:w-auto">
                  {state === "sending" ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <SwingingBell />}
                  {state === "sending" ? t("sending", lang) : t("send", lang)}
                </button>
                <p className="text-[0.8rem] text-ink-muted">{t("sampleHandlerNote", lang)}</p>
              </div>
            </form>
          )}
        </div>

        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <div className="rounded-lg border border-cream-300 bg-cream-50 p-5">
              <h3 className="flex items-center gap-2 text-lg text-green-800">
                <MapPin className="size-5 text-gold-600" aria-hidden /> {t("visit.address", lang)}
              </h3>
              <address className="mt-1.5 not-italic">{addressLines().map((l) => <span key={l} className="block">{l}</span>)}</address>
              <a href={mapsUrl()} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1.5 font-button text-[0.95rem] text-green-800 underline underline-offset-4">
                {t("visit.openMaps", lang)} <ExternalLink className="size-3.5" aria-hidden />
              </a>
            </div>
            <div className="rounded-lg border border-cream-300 bg-cream-50 p-5">
              <h3 className="flex items-center gap-2 text-lg text-green-800">
                <Clock className="size-5 text-gold-600" aria-hidden /> {t("visit.office", lang)}
              </h3>
              <p className="mt-1.5 text-[0.95rem]">{tr(site.contact.officeHours, lang)}</p>
              <a className="mt-2 flex items-center gap-2 text-green-800 hover:underline" href={`tel:${site.contact.phone.replace(/\D/g, "")}`}>
                <Phone className="size-4" aria-hidden /> {site.contact.phone}
              </a>
              <a className="flex items-center gap-2 break-all text-green-800 hover:underline" href={`mailto:${site.contact.email}`}>
                <Mail className="size-4 shrink-0" aria-hidden /> {site.contact.email}
              </a>
            </div>
          </div>
          <MapPlaceholder lang={lang} className="aspect-[4/3]" />
        </div>
      </div>

      <div id="directions" className="container-sobor mt-12 scroll-mt-[calc(var(--header-h-condensed)+1rem)]">
        <h2 className="vyaz-title text-center text-[length:var(--text-h2)] text-green-800">{t("visit.directions", lang)}</h2>
        <ul className="mt-6 grid gap-4 md:grid-cols-3">
          {site.contact.directions.map((d, i) => {
            const Icon = dirIcons[i % dirIcons.length];
            return (
              <li key={d.id} className="rounded-lg border border-cream-300 bg-cream-50 p-5">
                <h3 className="flex items-center gap-2 text-lg text-green-800">
                  <Icon className="size-5 text-gold-600" aria-hidden /> {tr(d.title, lang)}
                </h3>
                <p className="mt-1.5 text-[0.95rem] text-ink-muted">{tr(d.body, lang)}</p>
              </li>
            );
          })}
        </ul>
        <div className="mt-4 rounded-lg border border-gold-500/40 bg-gold-200/25 p-5">
          <h3 className="flex items-center gap-2 text-lg text-green-800">
            <Car className="size-5 text-gold-600" aria-hidden /> {t("visit.parking", lang)}
          </h3>
          <p className="mt-1.5 text-[0.95rem]">{tr(site.contact.parking, lang)}</p>
        </div>
      </div>
    </SectionShell>
  );
}

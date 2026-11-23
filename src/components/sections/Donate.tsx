"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, Lock } from "lucide-react";
import type { SectionProps } from "./SectionRenderer";
import { SectionShell } from "./SectionShell";
import { Input } from "@/components/ui/input";
import { Field, inputClass } from "@/components/forms/Field";
import { OrnamentBand } from "@/components/sacred/Ornaments";
import { CrossWithInscription, OrthodoxCross } from "@/components/sacred/OrthodoxCross";
import { Pictogram, SwingingBell } from "@/components/sacred/Pictograms";
import { site } from "@/lib/content";
import { isEmail } from "@/lib/hooks";
import { submitPayment } from "@/lib/integrations/payments";
import { formatMoney, t, tr } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type Freq = "once" | "monthly";

export function Donate({ lang, section }: SectionProps) {
  const cfg = site.donations;
  const [freq, setFreq] = useState<Freq>("once");
  const [preset, setPreset] = useState<number | null>(null);
  const [other, setOther] = useState("");
  const [fund, setFund] = useState(cfg.funds[0]?.id ?? "");
  const [dedication, setDedication] = useState("");
  const [payer, setPayer] = useState({ name: "", email: "" });
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [reference, setReference] = useState("");

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("frequency") === "monthly") {
      setFreq("monthly");
    }
  }, []);

  const amounts = freq === "once" ? cfg.oneTimeAmounts : cfg.monthlyAmounts;
  const amount = preset ?? Math.max(0, Number(other) || 0);

  const switchFreq = (f: Freq) => {
    setFreq(f);
    const list = f === "once" ? cfg.oneTimeAmounts : cfg.monthlyAmounts;
    if (preset !== null && !list.includes(preset)) {
      setPreset(null);
      setOther("");
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = {
      amount: amount > 0 ? undefined : t("donate.errAmount", lang),
      name: payer.name.trim() ? undefined : t("form.errName", lang),
      email: isEmail(payer.email) ? undefined : t("form.errEmail", lang),
    };
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) return;
    setState("sending");
    const res = await submitPayment({
      purpose: "donation",
      currency: site.currency,
      amount,
      recurring: freq === "monthly" ? "monthly" : undefined,
      payer,
      lines: [{ id: fund, label: `Donation: ${fund}`, quantity: 1, unitAmount: amount }],
      metadata: dedication ? { dedication } : undefined,
    });
    if (res.ok) {
      setReference(res.reference);
      setState("done");
    } else setState("error");
  };

  const giveLabel = freq === "monthly" ? t("donate.giveMonthly", lang, { amount: formatMoney(amount, lang) }) : t("donate.give", lang, { amount: formatMoney(amount, lang) });

  return (
    <SectionShell id={section.id}>
      <div className="container-sobor grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <div className="rounded-lg border border-gold-500/50 bg-cream-50 p-5 shadow-sm sm:p-8">
          {state === "done" ? (
            <div className="py-8 text-center" role="status">
              <OrthodoxCross size={44} className="mx-auto text-gold-600" />
              <p className="mt-4 font-heading text-[1.4rem] text-green-800">{t("donate.done", lang)}</p>
              <p className="mt-2 text-ink-muted">{t("checkout.reference", lang, { ref: reference })}</p>
              <p className="mt-1 text-[0.82rem] text-ink-muted">{t("sampleHandlerNote", lang)}</p>
              <button type="button" onClick={() => setState("idle")} className="mt-6 inline-flex min-h-11 items-center rounded-full border border-green-800/40 px-5 font-button text-green-800">
                {t("back", lang)}
              </button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="space-y-6">
              <div>
                <p className="mb-2 font-heading text-[1.05rem] text-green-800" id="freq-label">{t("donate.frequency", lang)}</p>
                <div role="radiogroup" aria-labelledby="freq-label" className="grid grid-cols-2 rounded-full border border-green-800/25 bg-white p-1">
                  {(["once", "monthly"] as Freq[]).map((f) => (
                    <button
                      key={f}
                      type="button"
                      role="radio"
                      aria-checked={freq === f}
                      onClick={() => switchFreq(f)}
                      className={cn("min-h-11 rounded-full font-button transition-colors", freq === f ? "bg-green-800 text-gold-200" : "text-green-800 hover:bg-cream-100")}
                    >
                      {f === "once" ? t("donate.oneTime", lang) : t("donate.monthly", lang)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 font-heading text-[1.05rem] text-green-800" id="amt-label">{t("donate.amount", lang)}</p>
                <div role="radiogroup" aria-labelledby="amt-label" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {amounts.map((a) => (
                    <button
                      key={a}
                      type="button"
                      role="radio"
                      aria-checked={preset === a}
                      onClick={() => {
                        setPreset(a);
                        setOther("");
                      }}
                      className={cn(
                        "bell-hover flex min-h-14 flex-col items-center justify-center rounded-md border-2 font-heading text-[1.25rem] transition-colors",
                        preset === a ? "border-gold-500 bg-green-800 text-gold-200" : "border-cream-300 bg-white text-green-800 hover:border-gold-500",
                      )}
                    >
                      {formatMoney(a, lang, { whole: true })}
                      {freq === "monthly" ? <span className="text-[0.72rem] font-normal opacity-80">{t("donate.perMonth", lang)}</span> : null}
                    </button>
                  ))}
                </div>
                <Field id="don-other" label={t("donate.other", lang)} error={errors.amount} className="mt-3">
                  <Input
                    id="don-other"
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step={1}
                    value={other}
                    onFocus={() => setPreset(null)}
                    onChange={(e) => {
                      setPreset(null);
                      setOther(e.target.value);
                    }}
                    placeholder={formatMoney(0, lang, { whole: true })}
                    className={inputClass}
                  />
                </Field>
              </div>

              <Field id="don-fund" label={t("donate.fund", lang)}>
                <select id="don-fund" value={fund} onChange={(e) => setFund(e.target.value)} className="h-11 w-full rounded-md border border-cream-300 bg-white px-3 text-base outline-none focus-visible:border-gold-500 focus-visible:ring-3 focus-visible:ring-gold-400/40">
                  {cfg.funds.map((f) => (
                    <option key={f.id} value={f.id}>
                      {tr(f.label, lang)}
                    </option>
                  ))}
                </select>
              </Field>

              <Field id="don-ded" label={t("donate.dedication", lang)} optionalLabel={t("optional", lang)}>
                <Input id="don-ded" value={dedication} onChange={(e) => setDedication(e.target.value)} className={inputClass} />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="don-name" label={t("form.name", lang)} error={errors.name}>
                  <Input id="don-name" value={payer.name} onChange={(e) => setPayer({ ...payer, name: e.target.value })} autoComplete="name" className={inputClass} />
                </Field>
                <Field id="don-email" label={t("form.email", lang)} error={errors.email}>
                  <Input id="don-email" type="email" dir="ltr" value={payer.email} onChange={(e) => setPayer({ ...payer, email: e.target.value })} autoComplete="email" className={inputClass} />
                </Field>
              </div>

              <div className="flex items-start gap-3 rounded-md border border-dashed border-gold-500/60 bg-white/70 p-4 text-[0.9rem] text-ink-muted">
                <Lock className="mt-0.5 size-5 shrink-0 text-gold-600" aria-hidden />
                <p>{t("checkout.paymentPlaceholder", lang)}</p>
              </div>

              {state === "error" ? <p className="text-kinovar" role="alert">{t("error.generic", lang)}</p> : null}
              <button type="submit" disabled={state === "sending"} className="bell-hover inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-gold-400 px-6 font-button text-[1.1rem] text-green-950 hover:bg-gold-200 disabled:opacity-70">
                {state === "sending" ? <Loader2 className="size-5 animate-spin" aria-hidden /> : amount > 0 ? <SwingingBell size={18} /> : <Check className="size-5" aria-hidden />}
                {state === "sending" ? t("sending", lang) : giveLabel}
              </button>
              <p className="text-center text-[0.8rem] text-ink-muted">{t("sampleHandlerNote", lang)}</p>
            </form>
          )}
        </div>

        <aside className="relative overflow-hidden rounded-lg bg-green-800 p-6 text-cream-50 sm:p-8">
          <OrnamentBand className="absolute inset-x-0 top-0 text-gold-500/50" height={8} />
          <div className="flex justify-center text-gold-400">
            <CrossWithInscription size={120} />
          </div>
          <h2 className="vyaz-title mt-5 text-center text-[1.9rem] text-gold-200">{tr(section.title, lang) || t("donateBand.title", lang)}</h2>
          <p className="mt-3 text-center text-cream-100/90">{tr(section.intro, lang) || t("donateBand.text", lang)}</p>
          <ul className="mt-6 space-y-3">
            {cfg.funds.map((f, i) => (
              <li key={f.id} className="flex items-center gap-3 border-b border-gold-500/20 pb-3 last:border-0">
                <Pictogram name={(["church", "bells", "candle", "psalter", "gospel"] as const)[i % 5]} size={26} className="shrink-0 text-gold-400" />
                <span>{tr(f.label, lang)}</span>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </SectionShell>
  );
}

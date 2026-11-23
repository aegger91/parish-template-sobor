"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import { toast } from "sonner";
import { Check, Info, Loader2, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import type { SectionProps } from "@/components/sections/SectionRenderer";
import { SectionHeader, SectionShell } from "@/components/sections/SectionShell";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Field, inputClass } from "@/components/forms/Field";
import { OrthodoxCross } from "@/components/sacred/OrthodoxCross";
import { Pictogram } from "@/components/sacred/Pictograms";
import { cart, slipAmount, uid, type Slip } from "@/lib/cart";
import { site, zapiski } from "@/lib/content";
import { isEmail } from "@/lib/hooks";
import { submitPayment } from "@/lib/integrations/payments";
import { formatMoney, t, tr } from "@/lib/i18n";
import { hrefById } from "@/lib/pages";
import { cn } from "@/lib/utils";

type NoteType = Slip["type"];

const newName = (id = uid()) => ({ id, prefixId: "", name: "" });
/** Pass a stable prefix for the first render so server and client markup match. */
const newSlip = (type: NoteType = "health", stable?: string): Slip => ({
  id: stable ? `${stable}s` : uid(),
  type,
  commemorationId: zapiski.commemorations.find((c) => c.appliesTo.includes(type))?.id ?? "",
  names: [0, 1, 2].map((i) => newName(stable ? `${stable}n${i}` : undefined)),
  candleId: null,
  candleQty: 1,
  offering: 0,
});

const selectClass =
  "h-11 w-full min-w-0 rounded-md border border-cream-300 bg-white px-2.5 text-base text-ink outline-none focus-visible:border-gold-500 focus-visible:ring-3 focus-visible:ring-gold-400/40";

function SlipCard({
  slip,
  index,
  lang,
  onChange,
  onRemove,
  canRemove,
  error,
}: {
  slip: Slip;
  index: number;
  lang: string;
  onChange: (s: Slip) => void;
  onRemove: () => void;
  canRemove: boolean;
  error?: string;
}) {
  const health = slip.type === "health";
  const type = zapiski.noteTypes.find((n) => n.id === slip.type)!;
  const prefixes = zapiski.prefixes.filter((p) => p.appliesTo.includes(slip.type));
  const commemorations = zapiski.commemorations.filter((c) => c.appliesTo.includes(slip.type));
  const selected = commemorations.find((c) => c.id === slip.commemorationId);
  const suggested = selected?.suggestedDonation ?? 0;
  const offeringChips = Array.from(new Set([0, suggested].filter((n) => n >= 0)));
  const [otherOffering, setOtherOffering] = useState("");
  /** False only after the user picks a suggested chip; start unselected like Donate. */
  const [offeringCustom, setOfferingCustom] = useState(true);
  const full = slip.names.length >= zapiski.maxNames;

  const setType = (t: NoteType) => {
    const keep = zapiski.commemorations.find((c) => c.id === slip.commemorationId)?.appliesTo.includes(t);
    const allowed = new Set(zapiski.prefixes.filter((p) => p.appliesTo.includes(t)).map((p) => p.id));
    onChange({
      ...slip,
      type: t,
      commemorationId: keep ? slip.commemorationId : (zapiski.commemorations.find((c) => c.appliesTo.includes(t))?.id ?? ""),
      names: slip.names.map((n) => (allowed.has(n.prefixId) ? n : { ...n, prefixId: "" })),
      offering: 0,
    });
    setOtherOffering("");
    setOfferingCustom(true);
  };

  const setName = (id: string, patch: Partial<Slip["names"][number]>) => onChange({ ...slip, names: slip.names.map((n) => (n.id === id ? { ...n, ...patch } : n)) });

  const setOfferingPreset = (amount: number) => {
    setOtherOffering("");
    setOfferingCustom(false);
    onChange({ ...slip, offering: amount });
  };

  return (
    <fieldset className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      <legend className="sr-only">{t("zapiski.slipN", lang, { n: index + 1 })}</legend>

      <div
        className={cn(
          "relative rounded-sm bg-[#fffdf7] px-4 pb-5 pt-4 shadow-[0_10px_24px_-16px_rgba(16,48,31,0.55)] sm:px-6",
          health ? "border-[3px] border-double border-kinovar/80" : "border-[5px]",
        )}
        style={health ? undefined : { borderColor: "var(--sobor-black)" }}
      >
        <div className="flex flex-col items-center text-center">
          <OrthodoxCross size={34} className={health ? "text-kinovar" : "text-[color:var(--sobor-black)]"} title={tr(type.slipHeading, lang)} />
          <p className={cn("vyaz-title mt-1 text-[1.6rem]", health ? "text-kinovar" : "text-[color:var(--sobor-black)]")}>{tr(type.slipHeading, lang)}</p>
          <p className="text-[0.78rem] text-ink-muted">{t("zapiski.slipN", lang, { n: index + 1 })}</p>
        </div>
        <ol className="mt-3 space-y-2">
          {slip.names.map((n, i) => (
            <li key={n.id} className="flex items-start gap-2 border-b border-dotted border-ink/25 pb-2">
              <span className="w-5 shrink-0 pt-2.5 text-end font-heading text-[0.9rem] text-ink-muted">{i + 1}</span>
              <div className="grid min-w-0 flex-1 gap-1.5 sm:grid-cols-[8.5rem_minmax(0,1fr)]">
                <label className="sr-only" htmlFor={`${n.id}-p`}>{t("zapiski.prefix", lang)}</label>
                <select id={`${n.id}-p`} value={n.prefixId} onChange={(e) => setName(n.id, { prefixId: e.target.value })} className={cn(selectClass, "h-10 text-[0.92rem] sm:order-none")}>
                  <option value="">{t("zapiski.prefix", lang)}: {t("zapiski.noPrefix", lang)}</option>
                  {prefixes.map((p) => (
                    <option key={p.id} value={p.id}>
                      {tr(p.label, lang)}
                    </option>
                  ))}
                </select>
                <label className="sr-only" htmlFor={`${n.id}-n`}>{t("zapiski.nameLabel", lang, { n: i + 1 })}</label>
                <Input
                  id={`${n.id}-n`}
                  value={n.name}
                  onChange={(e) => setName(n.id, { name: e.target.value.replace(/\s{2,}/g, " ") })}
                  placeholder={t("zapiski.namePlaceholder", lang)}
                  autoComplete="off"
                  maxLength={40}
                  className="h-10 border-cream-300 bg-white font-heading text-[1.05rem] focus-visible:border-gold-500"
                />
              </div>
              <button
                type="button"
                onClick={() => onChange({ ...slip, names: slip.names.filter((x) => x.id !== n.id) })}
                disabled={slip.names.length <= 1}
                className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full text-ink-muted hover:bg-cream-200 hover:text-kinovar disabled:opacity-30"
                aria-label={t("zapiski.removeName", lang, { n: i + 1 })}
              >
                <X className="size-4" aria-hidden />
              </button>
            </li>
          ))}
        </ol>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => onChange({ ...slip, names: [...slip.names, newName()] })}
            disabled={full}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-green-800/30 px-3.5 font-button text-[0.95rem] text-green-800 hover:border-gold-500 disabled:opacity-40"
          >
            <Plus className="size-4" aria-hidden /> {t("zapiski.addName", lang)}
          </button>
          <span className="text-[0.8rem] text-ink-muted">
            {slip.names.length} / {zapiski.maxNames}
          </span>
        </div>
        {full ? <p className="mt-2 text-[0.82rem] text-ink-muted">{t("zapiski.maxNames", lang, { n: zapiski.maxNames })}</p> : null}
        {error ? (
          <p className="mt-2 text-[0.88rem] text-kinovar" role="alert">
            {error}
          </p>
        ) : null}
      </div>

      <div className="space-y-5">
        <div role="radiogroup" aria-label={t("zapiski.type", lang)} className="grid grid-cols-2 gap-2">
          {zapiski.noteTypes.map((nt) => (
            <button
              key={nt.id}
              type="button"
              role="radio"
              aria-checked={slip.type === nt.id}
              onClick={() => setType(nt.id)}
              className={cn(
                "flex min-h-12 items-center justify-center gap-2 rounded-md border-2 px-3 font-button transition-colors",
                slip.type === nt.id
                  ? nt.id === "health"
                    ? "border-kinovar bg-kinovar-soft text-kinovar"
                    : "border-[color:var(--sobor-black)] bg-[color:var(--sobor-black)] text-cream-50"
                  : "border-cream-300 bg-cream-50 text-ink hover:border-gold-500",
              )}
            >
              <OrthodoxCross size={14} /> {tr(nt.label, lang)}
            </button>
          ))}
        </div>

        <div>
          <p className="mb-2 font-heading text-[1.05rem] text-green-800">{t("zapiski.commemoration", lang)}</p>
          <div role="radiogroup" aria-label={t("zapiski.commemoration", lang)} className="space-y-2">
            {commemorations.map((c) => (
              <label
                key={c.id}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-md border bg-cream-50 p-3 transition-colors",
                  slip.commemorationId === c.id ? "border-gold-500 ring-2 ring-gold-400/40" : "border-cream-300 hover:border-gold-500/70",
                )}
              >
                <input
                  type="radio"
                  name={`comm-${slip.id}`}
                  value={c.id}
                  checked={slip.commemorationId === c.id}
                  onChange={() => onChange({ ...slip, commemorationId: c.id })}
                  className="mt-1.5 size-4 shrink-0 accent-[var(--sobor-green-800)]"
                />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <span className="font-heading text-ink">{tr(c.label, lang)}</span>
                    {c.suggestedDonation > 0 ? (
                      <span className="text-[0.82rem] text-ink-muted">
                        {t("zapiski.suggested", lang)} {formatMoney(c.suggestedDonation, lang, { whole: true })}
                      </span>
                    ) : null}
                  </span>
                  {c.description ? <span className="block text-[0.86rem] text-ink-muted">{tr(c.description, lang)}</span> : null}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 font-heading text-[1.05rem] text-green-800" id={`${slip.id}-offering-label`}>
            {t("zapiski.suggested", lang)}
          </p>
          <div role="radiogroup" aria-labelledby={`${slip.id}-offering-label`} className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {offeringChips.map((a) => (
              <button
                key={a}
                type="button"
                role="radio"
                aria-checked={!offeringCustom && slip.offering === a}
                onClick={() => setOfferingPreset(a)}
                className={cn(
                  "bell-hover flex min-h-12 items-center justify-center rounded-md border-2 font-heading text-[1.1rem] transition-colors",
                  !offeringCustom && slip.offering === a
                    ? "border-gold-500 bg-green-800 text-gold-200"
                    : "border-cream-300 bg-white text-green-800 hover:border-gold-500",
                )}
              >
                {formatMoney(a, lang, { whole: true })}
              </button>
            ))}
          </div>
          <Field id={`${slip.id}-offering-other`} label={t("donate.other", lang)} optionalLabel={t("optional", lang)} className="mt-3">
            <Input
              id={`${slip.id}-offering-other`}
              type="number"
              inputMode="decimal"
              min={0}
              step={1}
              value={otherOffering}
              onFocus={() => setOfferingCustom(true)}
              onChange={(e) => {
                const v = e.target.value;
                setOfferingCustom(true);
                setOtherOffering(v);
                onChange({ ...slip, offering: Math.max(0, Number(v) || 0) });
              }}
              placeholder={formatMoney(0, lang, { whole: true })}
              className={inputClass}
            />
          </Field>
        </div>

        <div className="rounded-md border border-cream-300 bg-cream-50 p-3">
          <p className="flex items-center gap-2 font-heading text-[1.05rem] text-green-800">
            <Pictogram name="candle" size={22} className="text-gold-600" /> {t("zapiski.candle", lang)}
            <span className="text-[0.85rem] font-normal text-ink-muted">({t("optional", lang)})</span>
          </p>
          <div className="mt-2 grid grid-cols-[minmax(0,1fr)_5.5rem] gap-2">
            <label className="sr-only" htmlFor={`${slip.id}-candle`}>{t("zapiski.candle", lang)}</label>
            <select id={`${slip.id}-candle`} value={slip.candleId ?? ""} onChange={(e) => onChange({ ...slip, candleId: e.target.value || null })} className={selectClass}>
              <option value="">{t("zapiski.noCandle", lang)}</option>
              {zapiski.candles.map((c) => (
                <option key={c.id} value={c.id}>
                  {tr(c.label, lang)}, {formatMoney(c.price, lang, { whole: true })}
                </option>
              ))}
            </select>
            <label className="sr-only" htmlFor={`${slip.id}-qty`}>{t("zapiski.candleQty", lang)}</label>
            <Input
              id={`${slip.id}-qty`}
              type="number"
              min={1}
              max={20}
              disabled={!slip.candleId}
              value={slip.candleQty}
              onChange={(e) => onChange({ ...slip, candleQty: Math.max(1, Math.min(20, Number(e.target.value) || 1)) })}
              className={cn(inputClass, "disabled:opacity-50")}
              title={t("zapiski.candleQty", lang)}
            />
          </div>
        </div>

        {canRemove ? (
          <button type="button" onClick={onRemove} className="inline-flex min-h-10 items-center gap-1.5 font-button text-[0.95rem] text-kinovar hover:underline">
            <Trash2 className="size-4" aria-hidden /> {t("zapiski.removeSlip", lang)}
          </button>
        ) : null}
      </div>
    </fieldset>
  );
}

export function Zapiski({ lang, section }: SectionProps) {
  const stableId = useId().replace(/[^a-zA-Z0-9]/g, "");
  const [slips, setSlips] = useState<Slip[]>(() => [newSlip("health", stableId)]);
  const [gift, setGift] = useState("");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<{ slips: Record<string, string>; consent?: string }>({ slips: {} });
  const [step, setStep] = useState<"edit" | "pay" | "sending" | "done">("edit");
  const [payer, setPayer] = useState({ name: "", email: "" });
  const [payErr, setPayErr] = useState<{ name?: string; email?: string; general?: string }>({});
  const [reference, setReference] = useState("");

  const giftAmount = Math.max(0, Number(gift) || 0);
  const total = useMemo(() => slips.reduce((s, x) => s + slipAmount(x), 0) + giftAmount, [slips, giftAmount]);

  const cleaned = () => slips.map((s) => ({ ...s, names: s.names.filter((n) => n.name.trim()).map((n) => ({ ...n, name: n.name.trim() })) }));

  const validate = () => {
    const slipErrs: Record<string, string> = {};
    cleaned().forEach((s) => {
      if (!s.names.length) slipErrs[s.id] = t("zapiski.needName", lang);
    });
    const next = { slips: slipErrs, consent: consent ? undefined : t("zapiski.consentRequired", lang) };
    setErrors(next);
    return !Object.keys(slipErrs).length && consent;
  };

  const reset = () => {
    setSlips([newSlip("health")]);
    setGift("");
    setConsent(false);
    setErrors({ slips: {} });
  };

  const addToCart = () => {
    if (!validate()) return;
    cart.addSlips(cleaned(), giftAmount);
    reset();
    toast.success(t("zapiski.added", lang), {
      action: { label: t("store.viewCart", lang), onClick: () => (window.location.href = hrefById(lang, "cart")) },
    });
  };

  const pay = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = { name: payer.name.trim() ? undefined : t("form.errName", lang), email: isEmail(payer.email) ? undefined : t("form.errEmail", lang) };
    setPayErr(errs);
    if (errs.name || errs.email) return;
    setStep("sending");
    const list = cleaned();
    const res = await submitPayment({
      purpose: "commemoration",
      currency: site.currency,
      amount: total,
      payer,
      lines: [
        ...list.map((s, i) => ({ id: s.id, label: `${t("zapiski.slipN", lang, { n: i + 1 })} ${s.type} ${s.commemorationId}`, quantity: 1, unitAmount: slipAmount(s) })),
        ...(giftAmount ? [{ id: "gift", label: "donation", quantity: 1, unitAmount: giftAmount }] : []),
      ],
      metadata: { slips: JSON.stringify(list.map((s) => ({ type: s.type, commemoration: s.commemorationId, names: s.names.map((n) => [n.prefixId, n.name]) }))) },
    });
    if (res.ok) {
      setReference(res.reference);
      setStep("done");
      reset();
    } else {
      setPayErr({ general: t("error.generic", lang) });
      setStep("pay");
    }
  };

  return (
    <SectionShell id={section.id}>
      <SectionHeader title={tr(section.title, lang)} intro={tr(section.intro, lang) || t("zapiski.intro", lang)} />
      <div className="container-sobor">
        <div className="mx-auto mb-8 flex max-w-4xl gap-3 rounded-lg border border-gold-500/40 bg-gold-200/25 p-4 text-[0.95rem]">
          <Info className="mt-0.5 size-5 shrink-0 text-gold-700" aria-hidden />
          <p>{t("zapiski.hint", lang)}</p>
        </div>

        {step === "done" ? (
          <div className="mx-auto max-w-xl rounded-lg border border-gold-500/50 bg-cream-50 p-8 text-center" role="status">
            <OrthodoxCross size={40} className="mx-auto text-gold-600" />
            <p className="mt-4 font-heading text-[1.3rem] text-green-800">{t("zapiski.submitted", lang)}</p>
            <p className="mt-2 text-ink-muted">{t("checkout.reference", lang, { ref: reference })}</p>
            <p className="mt-1 text-[0.82rem] text-ink-muted">{t("sampleHandlerNote", lang)}</p>
            <button type="button" onClick={() => setStep("edit")} className="mt-6 inline-flex min-h-11 items-center rounded-full border border-green-800/40 px-5 font-button text-green-800 hover:border-gold-500">
              {t("zapiski.addSlip", lang)}
            </button>
          </div>
        ) : (
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_22rem]">
            <div className="space-y-10">
              {slips.map((s, i) => (
                <SlipCard
                  key={s.id}
                  slip={s}
                  index={i}
                  lang={lang}
                  canRemove={slips.length > 1}
                  error={errors.slips[s.id]}
                  onChange={(next) => setSlips((all) => all.map((x) => (x.id === s.id ? next : x)))}
                  onRemove={() => setSlips((all) => all.filter((x) => x.id !== s.id))}
                />
              ))}
              <div className="flex flex-wrap gap-3 border-t border-dashed border-gold-500/40 pt-6">
                <button type="button" onClick={() => setSlips((all) => [...all, newSlip("health")])} className="bell-hover inline-flex min-h-11 items-center gap-2 rounded-full border border-kinovar/50 bg-cream-50 px-4 font-button text-kinovar hover:bg-kinovar-soft">
                  <Plus className="size-4" aria-hidden /> {t("zapiski.addSlip", lang)}: {tr(zapiski.noteTypes[0].label, lang)}
                </button>
                <button type="button" onClick={() => setSlips((all) => [...all, newSlip("repose")])} className="bell-hover inline-flex min-h-11 items-center gap-2 rounded-full border border-ink/50 bg-cream-50 px-4 font-button text-ink hover:bg-cream-200">
                  <Plus className="size-4" aria-hidden /> {t("zapiski.addSlip", lang)}: {tr(zapiski.noteTypes[1].label, lang)}
                </button>
              </div>
            </div>

            <aside className="xl:sticky xl:top-[calc(var(--header-h-condensed)+1rem)] xl:self-start">
              <div className="rounded-lg border border-gold-500/50 bg-cream-50 p-5 shadow-sm">
                <h3 className="vyaz-title text-[1.5rem] text-green-800">{t("zapiski.summary", lang)}</h3>
                <ul className="mt-3 space-y-2 text-[0.93rem]">
                  {slips.map((s, i) => {
                    const c = zapiski.commemorations.find((x) => x.id === s.commemorationId);
                    const candle = zapiski.candles.find((x) => x.id === s.candleId);
                    return (
                      <li key={s.id} className="border-b border-cream-300 pb-2">
                        <p className="flex justify-between gap-3">
                          <span className="flex min-w-0 items-center gap-1.5">
                            <OrthodoxCross size={11} className={s.type === "health" ? "shrink-0 text-kinovar" : "shrink-0 text-[color:var(--sobor-black)]"} />
                            <span className="truncate">
                              {t("zapiski.slipN", lang, { n: i + 1 })}: {tr(c?.label, lang)}
                            </span>
                          </span>
                          <span className="shrink-0 tabular-nums">{formatMoney(s.offering || 0, lang)}</span>
                        </p>
                        {candle ? (
                          <p className="flex justify-between gap-3 text-ink-muted">
                            <span>
                              {t("zapiski.candleLine", lang)}: {tr(candle.label, lang)} × {s.candleQty}
                            </span>
                            <span className="shrink-0 tabular-nums">{formatMoney(candle.price * s.candleQty, lang)}</span>
                          </p>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
                <Field id="zap-gift" label={t("zapiski.freeDonation", lang)} hint={t("zapiski.freeDonationHint", lang)} optionalLabel={t("optional", lang)} className="mt-4">
                  <Input id="zap-gift" type="number" inputMode="decimal" min={0} step={1} value={gift} onChange={(e) => setGift(e.target.value)} placeholder="0" className={inputClass} />
                </Field>
                <p className="mt-4 flex items-baseline justify-between border-t border-gold-500/40 pt-3 font-heading text-[1.2rem] text-green-800">
                  <span>{t("zapiski.total", lang)}</span>
                  <span className="tabular-nums">{formatMoney(total, lang)}</span>
                </p>
                <label className="mt-4 flex items-start gap-2.5 text-[0.86rem]">
                  <Checkbox checked={consent} onCheckedChange={(v) => setConsent(v === true)} className="mt-0.5 border-green-800/40" aria-invalid={!!errors.consent} />
                  <span>{t("zapiski.consent", lang, { days: zapiski.retentionDays })}</span>
                </label>
                {errors.consent ? <p className="mt-1 text-[0.85rem] text-kinovar" role="alert">{errors.consent}</p> : null}
                {Object.keys(errors.slips).length ? <p className="mt-1 text-[0.85rem] text-kinovar" role="alert">{t("zapiski.needName", lang)}</p> : null}

                {step === "edit" ? (
                  <div className="mt-4 grid gap-2">
                    {site.modules.store ? (
                      <button type="button" onClick={addToCart} className="bell-hover inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-green-800/40 bg-cream-50 px-4 font-button text-green-800 hover:border-gold-500">
                        <ShoppingBag className="size-4" aria-hidden /> {t("zapiski.addToCart", lang)}
                      </button>
                    ) : null}
                    <button type="button" onClick={() => validate() && setStep("pay")} className="bell-hover inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-green-800 px-4 font-button text-cream-50 hover:bg-green-700">
                      <Pictogram name="candle" size={18} className="text-gold-300" /> {t("zapiski.donateSubmit", lang)}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={pay} noValidate className="mt-4 space-y-3 rounded-md border border-cream-300 bg-white/60 p-3">
                    <p className="font-heading text-green-800">{t("zapiski.payTitle", lang)}</p>
                    <Field id="zap-name" label={t("form.name", lang)} error={payErr.name}>
                      <Input id="zap-name" value={payer.name} onChange={(e) => setPayer({ ...payer, name: e.target.value })} autoComplete="name" className={inputClass} />
                    </Field>
                    <Field id="zap-email" label={t("form.email", lang)} error={payErr.email}>
                      <Input id="zap-email" type="email" dir="ltr" value={payer.email} onChange={(e) => setPayer({ ...payer, email: e.target.value })} autoComplete="email" className={inputClass} />
                    </Field>
                    <p className="rounded border border-dashed border-gold-500/60 bg-cream-50 p-2.5 text-[0.82rem] text-ink-muted">{t("checkout.paymentPlaceholder", lang)}</p>
                    {payErr.general ? <p className="text-kinovar" role="alert">{payErr.general}</p> : null}
                    <button type="submit" disabled={step === "sending"} className="bell-hover inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-green-800 px-4 font-button text-cream-50 hover:bg-green-700 disabled:opacity-70">
                      {step === "sending" ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Check className="size-4" aria-hidden />}
                      {step === "sending" ? t("sending", lang) : `${t("zapiski.donateSubmit", lang)} · ${formatMoney(total, lang)}`}
                    </button>
                    <button type="button" onClick={() => setStep("edit")} className="w-full text-center font-button text-[0.9rem] text-green-800 underline underline-offset-4">
                      {t("back", lang)}
                    </button>
                  </form>
                )}
                <p className="mt-3 text-center text-[0.78rem] text-ink-muted">{t("sampleHandlerNote", lang)}</p>
                {site.modules.store ? (
                  <p className="mt-1 text-center text-[0.82rem]">
                    <Link href={hrefById(lang, "cart")} className="text-green-800 underline underline-offset-4">
                      {t("store.viewCart", lang)}
                    </Link>
                  </p>
                ) : null}
              </div>
            </aside>
          </div>
        )}
      </div>
    </SectionShell>
  );
}

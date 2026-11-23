"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Loader2, Lock, Store, Truck } from "lucide-react";
import type { SectionProps } from "@/components/sections/SectionRenderer";
import { SectionShell } from "@/components/sections/SectionShell";
import { Input } from "@/components/ui/input";
import { Field, inputClass } from "@/components/forms/Field";
import { OrthodoxCross } from "@/components/sacred/OrthodoxCross";
import { useMounted } from "./Cart";
import { cart, findVariant, hasPhysicalItems, lineAmount, lineLabel, useCart } from "@/lib/cart";
import { site, store } from "@/lib/content";
import { isEmail, isFullPhone, maskPhone } from "@/lib/hooks";
import { submitPayment } from "@/lib/integrations/payments";
import { formatMoney, t, tr } from "@/lib/i18n";
import { hrefById } from "@/lib/pages";
import { cn } from "@/lib/utils";

export function Checkout({ lang, section }: SectionProps) {
  const lines = useCart();
  const mounted = useMounted();
  const [v, setV] = useState({ name: "", email: "", phone: "", address1: "", city: "", region: "", postal: "" });
  const [method, setMethod] = useState<"ship" | "pickup">("ship");
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [reference, setReference] = useState("");

  const physical = hasPhysicalItems(lines);
  const forcedPickup = lines.some((l) => l.kind === "product" && findVariant(l.productId, l.variantId).product?.pickupOnly);
  const fulfil = forcedPickup ? "pickup" : method;
  const goods = lines.reduce((s, l) => s + (l.kind === "product" ? lineAmount(l) : 0), 0);
  const subtotal = lines.reduce((s, l) => s + lineAmount(l), 0);
  const shipping = physical && fulfil === "ship" && goods < store.shipping.freeOver ? store.shipping.flatRate : 0;
  const total = subtotal + shipping;
  const hasSlips = lines.some((l) => l.kind === "zapiska");

  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement>) => setV({ ...v, [k]: k === "phone" ? maskPhone(e.target.value) : e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const needAddress = physical && fulfil === "ship";
    const errs: Record<string, string | undefined> = {
      name: v.name.trim() ? undefined : t("form.errName", lang),
      email: isEmail(v.email) ? undefined : t("form.errEmail", lang),
      phone: !v.phone || isFullPhone(v.phone) ? undefined : t("form.errPhone", lang),
      address1: needAddress && !v.address1.trim() ? t("required", lang) : undefined,
      city: needAddress && !v.city.trim() ? t("required", lang) : undefined,
      region: needAddress && !v.region.trim() ? t("required", lang) : undefined,
      postal: needAddress && !v.postal.trim() ? t("required", lang) : undefined,
    };
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) return;
    setState("sending");
    const res = await submitPayment({
      purpose: "store-order",
      currency: site.currency,
      amount: total,
      payer: { name: v.name, email: v.email, phone: v.phone || undefined },
      lines: [
        ...lines.map((l) => ({ id: l.id, label: lineLabel(l, "en"), quantity: l.kind === "product" ? l.qty : 1, unitAmount: l.kind === "product" ? (findVariant(l.productId, l.variantId).variant?.price ?? 0) : lineAmount(l) })),
        ...(shipping ? [{ id: "shipping", label: "Shipping", quantity: 1, unitAmount: shipping }] : []),
      ],
      fulfillment: physical ? { method: fulfil, address: fulfil === "ship" ? { line1: v.address1, city: v.city, region: v.region, postalCode: v.postal } : undefined } : undefined,
    });
    if (res.ok) {
      setReference(res.reference);
      setState("done");
      cart.clear();
    } else setState("error");
  };

  if (!mounted) {
    return (
      <SectionShell id={section.id}>
        <div className="container-sobor h-64 max-w-5xl animate-pulse rounded-lg bg-cream-200" aria-busy="true" />
      </SectionShell>
    );
  }

  if (state === "done") {
    return (
      <SectionShell id={section.id}>
        <div className="container-sobor max-w-xl">
          <div className="rounded-lg border border-gold-500/50 bg-cream-50 p-8 text-center" role="status">
            <OrthodoxCross size={40} className="mx-auto text-gold-600" />
            <p className="mt-4 font-heading text-[1.35rem] text-green-800">{t("checkout.done", lang)}</p>
            <p className="mt-2 text-ink-muted">{t("checkout.reference", lang, { ref: reference })}</p>
            <p className="mt-1 text-[0.82rem] text-ink-muted">{t("sampleHandlerNote", lang)}</p>
            <Link href={hrefById(lang, "home")} className="mt-6 inline-flex min-h-11 items-center rounded-full bg-green-800 px-5 font-button text-cream-50">
              {t("nav.home", lang)}
            </Link>
          </div>
        </div>
      </SectionShell>
    );
  }

  if (!lines.length) {
    return (
      <SectionShell id={section.id}>
        <div className="container-sobor max-w-xl text-center">
          <p className="font-heading text-[1.25rem] text-green-800">{t("cart.empty", lang)}</p>
          <Link href={hrefById(lang, "store")} className="mt-5 inline-flex min-h-11 items-center rounded-full bg-green-800 px-5 font-button text-cream-50">
            {t("cart.continue", lang)}
          </Link>
        </div>
      </SectionShell>
    );
  }

  const radio = (value: "ship" | "pickup", icon: React.ReactNode, label: string, disabled?: boolean) => (
    <label
      className={cn(
        "flex min-h-14 cursor-pointer items-center gap-3 rounded-md border bg-white p-3 has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-gold-400/50",
        fulfil === value ? "border-gold-500 ring-2 ring-gold-400/40" : "border-cream-300",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <input type="radio" name="fulfillment" value={value} checked={fulfil === value} disabled={disabled} onChange={() => setMethod(value)} className="size-4 accent-[var(--sobor-green-800)]" />
      {icon}
      <span className="font-heading">{label}</span>
    </label>
  );

  return (
    <SectionShell id={section.id}>
      <form onSubmit={submit} noValidate className="container-sobor grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-8">
          <fieldset className="rounded-lg border border-cream-300 bg-cream-50 p-5">
            <legend className="px-1 font-heading text-[1.2rem] text-green-800">{t("checkout.contact", lang)}</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="co-name" label={t("form.name", lang)} error={errors.name} className="sm:col-span-2">
                <Input id="co-name" value={v.name} onChange={set("name")} autoComplete="name" aria-invalid={!!errors.name} className={inputClass} />
              </Field>
              <Field id="co-email" label={t("form.email", lang)} error={errors.email}>
                <Input id="co-email" type="email" dir="ltr" value={v.email} onChange={set("email")} autoComplete="email" aria-invalid={!!errors.email} className={inputClass} />
              </Field>
              <Field id="co-phone" label={t("form.phone", lang)} optionalLabel={t("optional", lang)} error={errors.phone} hint={t("form.phoneHint", lang)}>
                <Input id="co-phone" type="tel" dir="ltr" inputMode="numeric" placeholder="(000)-000-0000" value={v.phone} onChange={set("phone")} autoComplete="tel-national" aria-invalid={!!errors.phone} className={inputClass} />
              </Field>
            </div>
          </fieldset>

          {physical ? (
            <fieldset className="rounded-lg border border-cream-300 bg-cream-50 p-5">
              <legend className="px-1 font-heading text-[1.2rem] text-green-800">{t("checkout.fulfillment", lang)}</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {radio("ship", <Truck className="size-5 text-gold-600" aria-hidden />, t("checkout.ship", lang), forcedPickup)}
                {radio("pickup", <Store className="size-5 text-gold-600" aria-hidden />, t("checkout.pickup", lang))}
              </div>
              {forcedPickup ? <p className="mt-3 text-[0.9rem] text-gold-700">{t("checkout.pickupForced", lang)}</p> : null}
              {fulfil === "pickup" ? (
                <p className="mt-3 text-[0.92rem] text-ink-muted">{tr(store.shipping.pickupNote, lang)}</p>
              ) : (
                <div className="mt-4 grid gap-4 sm:grid-cols-6">
                  <Field id="co-a1" label={t("checkout.address1", lang)} error={errors.address1} className="sm:col-span-6">
                    <Input id="co-a1" value={v.address1} onChange={set("address1")} autoComplete="address-line1" className={inputClass} />
                  </Field>
                  <Field id="co-city" label={t("checkout.city", lang)} error={errors.city} className="sm:col-span-3">
                    <Input id="co-city" value={v.city} onChange={set("city")} autoComplete="address-level2" className={inputClass} />
                  </Field>
                  <Field id="co-region" label={t("checkout.region", lang)} error={errors.region} className="sm:col-span-1">
                    <Input id="co-region" value={v.region} onChange={set("region")} autoComplete="address-level1" className={inputClass} />
                  </Field>
                  <Field id="co-postal" label={t("checkout.postal", lang)} error={errors.postal} className="sm:col-span-2">
                    <Input id="co-postal" value={v.postal} onChange={set("postal")} autoComplete="postal-code" className={inputClass} />
                  </Field>
                  <p className="text-[0.85rem] text-ink-muted sm:col-span-6">{t("checkout.freeOver", lang, { amount: formatMoney(store.shipping.freeOver, lang, { whole: true }) })}</p>
                </div>
              )}
            </fieldset>
          ) : null}

          <fieldset className="rounded-lg border border-cream-300 bg-cream-50 p-5">
            <legend className="px-1 font-heading text-[1.2rem] text-green-800">{t("checkout.payment", lang)}</legend>
            <div className="flex items-start gap-3 rounded-md border border-dashed border-gold-500/60 bg-white/70 p-4 text-[0.92rem] text-ink-muted">
              <Lock className="mt-0.5 size-5 shrink-0 text-gold-600" aria-hidden />
              <p>{t("checkout.paymentPlaceholder", lang)}</p>
            </div>
          </fieldset>
        </div>

        <aside className="h-fit rounded-lg border border-gold-500/50 bg-cream-50 p-5 lg:sticky lg:top-[calc(var(--header-h-condensed)+1rem)]">
          <h2 className="vyaz-title text-[1.45rem] text-green-800">{t("checkout.summary", lang)}</h2>
          <ul className="mt-3 space-y-2 text-[0.92rem]">
            {lines.map((l) => (
              <li key={l.id} className="flex justify-between gap-3 border-b border-cream-300 pb-2">
                <span className="min-w-0">
                  {lineLabel(l, lang)}
                  {l.kind === "product" ? <span className="text-ink-muted"> × {l.qty}</span> : null}
                </span>
                <span className="shrink-0 tabular-nums">{formatMoney(lineAmount(l), lang)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-3 space-y-1.5 text-[0.95rem]">
            <div className="flex justify-between">
              <dt>{t("cart.subtotal", lang)}</dt>
              <dd className="tabular-nums">{formatMoney(subtotal, lang)}</dd>
            </div>
            {physical ? (
              <div className="flex justify-between">
                <dt>{t("checkout.shipping", lang)}</dt>
                <dd className="tabular-nums">{shipping ? formatMoney(shipping, lang) : t("checkout.free", lang)}</dd>
              </div>
            ) : null}
            <div className="flex justify-between border-t border-gold-500/40 pt-2 font-heading text-[1.2rem] text-green-800">
              <dt>{t("checkout.total", lang)}</dt>
              <dd className="tabular-nums">{formatMoney(total, lang)}</dd>
            </div>
          </dl>
          {hasSlips ? <p className="mt-3 text-[0.85rem] text-ink-muted">{t("checkout.commemorationNote", lang)}</p> : null}
          {state === "error" ? <p className="mt-3 text-kinovar" role="alert">{t("error.generic", lang)}</p> : null}
          <button type="submit" disabled={state === "sending"} className="bell-hover mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-green-800 px-5 font-button text-[1.05rem] text-cream-50 hover:bg-green-700 disabled:opacity-70">
            {state === "sending" ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Check className="size-4" aria-hidden />}
            {state === "sending" ? t("sending", lang) : `${t("checkout.place", lang)} · ${formatMoney(total, lang)}`}
          </button>
          <p className="mt-3 text-center text-[0.78rem] text-ink-muted">{t("sampleHandlerNote", lang)}</p>
        </aside>
      </form>
    </SectionShell>
  );
}

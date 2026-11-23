"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import type { SectionProps } from "@/components/sections/SectionRenderer";
import { SectionShell } from "@/components/sections/SectionShell";
import { OrthodoxCross } from "@/components/sacred/OrthodoxCross";
import { Pictogram } from "@/components/sacred/Pictograms";
import { ProductImage } from "./ProductImage";
import { cart, findVariant, lineAmount, lineLabel, useCart, type CartLine } from "@/lib/cart";
import { zapiski } from "@/lib/content";
import { formatMoney, t, tr } from "@/lib/i18n";
import { hrefById } from "@/lib/pages";

export function useMounted() {
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  return m;
}

export function slipNames(line: Extract<CartLine, { kind: "zapiska" }>, lang: string) {
  return line.slip.names
    .map((n) => {
      const p = zapiski.prefixes.find((x) => x.id === n.prefixId);
      return p ? `${tr(p.slipText, lang)} ${n.name}` : n.name;
    })
    .join(", ");
}

export function LineThumb({ line, lang }: { line: CartLine; lang: string }) {
  if (line.kind === "product") {
    const { product } = findVariant(line.productId, line.variantId);
    return <ProductImage image={product?.images[0]} lang={lang} className="size-20 shrink-0 rounded-md sm:size-24" />;
  }
  if (line.kind === "zapiska") {
    const health = line.slip.type === "health";
    return (
      <span
        className="flex size-20 shrink-0 flex-col items-center justify-center rounded-sm bg-[#fffdf7] sm:size-24"
        style={{ border: health ? "3px double var(--sobor-kinovar)" : "4px solid var(--sobor-black)" }}
        aria-hidden
      >
        <OrthodoxCross size={26} className={health ? "text-kinovar" : "text-[color:var(--sobor-black)]"} />
      </span>
    );
  }
  return (
    <span className="flex size-20 shrink-0 items-center justify-center rounded-md bg-green-800 text-gold-400 sm:size-24" aria-hidden>
      <Pictogram name="candle" size={40} />
    </span>
  );
}

export function Cart({ lang, section }: SectionProps) {
  const lines = useCart();
  const mounted = useMounted();
  const subtotal = lines.reduce((s, l) => s + lineAmount(l), 0);

  if (!mounted) {
    return (
      <SectionShell id={section.id}>
        <div className="container-sobor max-w-4xl space-y-3" aria-busy="true">
          {[0, 1].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-lg bg-cream-200" />
          ))}
        </div>
      </SectionShell>
    );
  }

  if (!lines.length) {
    return (
      <SectionShell id={section.id}>
        <div className="container-sobor flex max-w-xl flex-col items-center text-center">
          <span className="flex size-20 items-center justify-center rounded-full bg-green-800 text-gold-400">
            <ShoppingBag className="size-9" aria-hidden />
          </span>
          <p className="mt-5 font-heading text-[1.3rem] text-green-800">{t("cart.empty", lang)}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href={hrefById(lang, "store")} className="bell-hover inline-flex min-h-11 items-center rounded-full bg-green-800 px-5 font-button text-cream-50 hover:bg-green-700">
              {t("cart.continue", lang)}
            </Link>
            <Link href={hrefById(lang, "zapiski")} className="bell-hover inline-flex min-h-11 items-center rounded-full border border-green-800/40 px-5 font-button text-green-800 hover:border-gold-500">
              {t("hero.commemoration", lang)}
            </Link>
          </div>
        </div>
      </SectionShell>
    );
  }

  return (
    <SectionShell id={section.id}>
      <div className="container-sobor grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <ul className="space-y-3">
          {lines.map((l) => (
            <li key={l.id} className="flex gap-4 rounded-lg border border-cream-300 bg-cream-50 p-3 sm:p-4">
              <LineThumb line={l} lang={lang} />
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <p className="min-w-0 font-heading text-[1.05rem] leading-normal text-green-800">{lineLabel(l, lang)}</p>
                  <p className="shrink-0 font-heading tabular-nums">{formatMoney(lineAmount(l), lang)}</p>
                </div>
                {l.kind === "zapiska" ? (
                  <p className="mt-1 text-[0.88rem] text-ink-muted">
                    {t("cart.names", lang, { n: l.slip.names.length })}: {slipNames(l, lang)}
                  </p>
                ) : null}
                {l.kind === "product" ? (
                  <p className="mt-0.5 text-[0.85rem] text-ink-muted">{formatMoney(findVariant(l.productId, l.variantId).variant?.price ?? 0, lang)} × {l.qty}</p>
                ) : null}
                <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2">
                  {l.kind === "product" ? (
                    <div className="flex items-center rounded-full border border-green-800/25 bg-white" role="group" aria-label={t("store.quantity", lang)}>
                      <button type="button" onClick={() => cart.setQty(l.id, l.qty - 1)} disabled={l.qty <= 1} className="flex size-9 items-center justify-center text-green-800 disabled:opacity-30" aria-label={t("cart.decrease", lang)}>
                        <Minus className="size-4" aria-hidden />
                      </button>
                      <span className="w-7 text-center tabular-nums">{l.qty}</span>
                      <button
                        type="button"
                        onClick={() => cart.setQty(l.id, l.qty + 1)}
                        disabled={l.qty >= (findVariant(l.productId, l.variantId).variant?.stock ?? 0)}
                        className="flex size-9 items-center justify-center text-green-800 disabled:opacity-30"
                        aria-label={t("cart.increase", lang)}
                      >
                        <Plus className="size-4" aria-hidden />
                      </button>
                    </div>
                  ) : (
                    <span />
                  )}
                  <button type="button" onClick={() => cart.remove(l.id)} className="inline-flex min-h-9 items-center gap-1.5 text-[0.9rem] text-kinovar hover:underline">
                    <Trash2 className="size-4" aria-hidden /> {t("cart.remove", lang)}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <aside className="h-fit rounded-lg border border-gold-500/50 bg-cream-50 p-5 lg:sticky lg:top-[calc(var(--header-h-condensed)+1rem)]">
          <p className="flex items-baseline justify-between font-heading text-[1.2rem] text-green-800">
            <span>{t("cart.subtotal", lang)}</span>
            <span className="tabular-nums">{formatMoney(subtotal, lang)}</span>
          </p>
          <Link href={hrefById(lang, "checkout")} className="bell-hover mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-green-800 px-5 font-button text-cream-50 hover:bg-green-700">
            {t("cart.checkout", lang)} <ArrowRight className="size-4 rtl:rotate-180" aria-hidden />
          </Link>
          <Link href={hrefById(lang, "store")} className="mt-3 block text-center font-button text-[0.95rem] text-green-800 underline underline-offset-4">
            {t("cart.continue", lang)}
          </Link>
        </aside>
      </div>
    </SectionShell>
  );
}

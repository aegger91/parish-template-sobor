"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Minus, Plus, ShoppingBag, Store, Truck } from "lucide-react";
import { stockLabel } from "./StoreGrid";
import { cart } from "@/lib/cart";
import { formatMoney, t, tr } from "@/lib/i18n";
import { hrefById } from "@/lib/pages";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ProductBuyBox({ lang, product }: { lang: string; product: Product }) {
  const first = product.variants.find((v) => v.stock > 0) ?? product.variants[0];
  const [variantId, setVariantId] = useState(first.id);
  const [qty, setQty] = useState(1);
  const variant = product.variants.find((v) => v.id === variantId) ?? first;
  const s = stockLabel(variant.stock, lang);
  const out = variant.stock <= 0;

  const add = () => {
    cart.addProduct(product.id, variant.id, qty);
    toast.success(t("store.added", lang), {
      description: `${tr(product.name, lang)} (${tr(variant.label, lang)}) × ${qty}`,
      action: { label: t("store.viewCart", lang), onClick: () => (window.location.href = hrefById(lang, "cart")) },
    });
  };

  return (
    <div className="mt-6 rounded-lg border border-gold-500/40 bg-cream-50 p-5">
      <p className="font-heading text-[1.8rem] text-green-800">{formatMoney(variant.price, lang)}</p>
      <p className={cn("text-[0.92rem]", s.tone)} aria-live="polite">
        {s.text}
      </p>
      {product.variants.length > 1 ? (
        <fieldset className="mt-4">
          <legend className="mb-2 text-[0.95rem] text-ink">{t("store.option", lang)}</legend>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v) => (
              <label
                key={v.id}
                className={cn(
                  "flex min-h-10 cursor-pointer items-center rounded-full border px-4 font-button text-[0.95rem] transition-colors has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-gold-400/50",
                  v.id === variantId ? "border-green-800 bg-green-800 text-gold-200" : "border-green-800/25 bg-white text-green-800 hover:border-gold-500",
                  v.stock <= 0 && "opacity-60 line-through decoration-1",
                )}
              >
                <input
                  type="radio"
                  name={`variant-${product.id}`}
                  value={v.id}
                  checked={v.id === variantId}
                  onChange={() => {
                    setVariantId(v.id);
                    setQty(1);
                  }}
                  className="sr-only"
                />
                {tr(v.label, lang)}
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <div className="flex items-center rounded-full border border-green-800/25 bg-white" role="group" aria-label={t("store.quantity", lang)}>
          <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1 || out} className="flex size-11 items-center justify-center rounded-full text-green-800 disabled:opacity-30" aria-label={t("cart.decrease", lang)}>
            <Minus className="size-4" aria-hidden />
          </button>
          <span className="w-8 text-center font-heading tabular-nums" aria-live="polite">
            {qty}
          </span>
          <button type="button" onClick={() => setQty((q) => Math.min(variant.stock, q + 1))} disabled={qty >= variant.stock || out} className="flex size-11 items-center justify-center rounded-full text-green-800 disabled:opacity-30" aria-label={t("cart.increase", lang)}>
            <Plus className="size-4" aria-hidden />
          </button>
        </div>
        <button type="button" onClick={add} disabled={out} className="bell-hover inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-green-800 px-6 font-button text-cream-50 hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none">
          <ShoppingBag className="size-4" aria-hidden /> {out ? t("store.outOfStock", lang) : t("store.addToCart", lang)}
        </button>
      </div>
      <p className="mt-4 flex items-center gap-2 text-[0.9rem] text-ink-muted">
        {product.pickupOnly ? <Store className="size-4 text-gold-600" aria-hidden /> : <Truck className="size-4 text-gold-600" aria-hidden />}
        {product.pickupOnly ? t("store.pickupOnly", lang) : t("store.pickupAvailable", lang)}
      </p>
      <p className="mt-1 text-[0.85rem] text-ink-muted">{t("store.blessed", lang)}</p>
      <div className="mt-4 flex flex-wrap gap-4 border-t border-cream-300 pt-4 text-[0.92rem]">
        <Link href={hrefById(lang, "store")} className="inline-flex items-center gap-1.5 font-button text-green-800 hover:underline">
          <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden /> {t("store.backToStore", lang)}
        </Link>
        <Link href={hrefById(lang, "cart")} className="font-button text-green-800 hover:underline">
          {t("store.viewCart", lang)}
        </Link>
      </div>
    </div>
  );
}

"use client";

import { useSyncExternalStore } from "react";
import { store, zapiski } from "./content";
import { t, tr } from "./i18n";

export type SlipName = { id: string; prefixId: string; name: string };

export type Slip = {
  id: string;
  type: "health" | "repose";
  commemorationId: string;
  names: SlipName[];
  candleId: string | null;
  candleQty: number;
  /** Optional gift for this slip; not auto-filled from suggestedDonation. */
  offering: number;
};

export type CartLine =
  | { kind: "product"; id: string; productId: string; variantId: string; qty: number }
  | { kind: "zapiska"; id: string; slip: Slip }
  | { kind: "gift"; id: string; amount: number };

const KEY = "sobor-cart-v1";
let lines: CartLine[] = [];
let loaded = false;
const listeners = new Set<() => void>();
const EMPTY: CartLine[] = [];

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    lines = JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    lines = [];
  }
}

function commit(next: CartLine[]) {
  lines = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(lines));
  } catch {
    /* storage may be unavailable in private mode */
  }
  listeners.forEach((l) => l());
}

export function useCart(): CartLine[] {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      const onStorage = (e: StorageEvent) => {
        if (e.key === KEY) {
          loaded = false;
          load();
          cb();
        }
      };
      window.addEventListener("storage", onStorage);
      return () => {
        listeners.delete(cb);
        window.removeEventListener("storage", onStorage);
      };
    },
    () => {
      load();
      return lines;
    },
    () => EMPTY,
  );
}

export const uid = () => Math.random().toString(36).slice(2, 10);

export const cart = {
  addProduct(productId: string, variantId: string, qty: number) {
    load();
    const existing = lines.find((l) => l.kind === "product" && l.variantId === variantId);
    if (existing && existing.kind === "product") {
      commit(lines.map((l) => (l === existing ? { ...existing, qty: existing.qty + qty } : l)));
    } else {
      commit([...lines, { kind: "product", id: uid(), productId, variantId, qty }]);
    }
  },
  addSlips(slips: Slip[], gift: number) {
    load();
    const next: CartLine[] = [...lines, ...slips.map((slip) => ({ kind: "zapiska" as const, id: uid(), slip }))];
    if (gift > 0) next.push({ kind: "gift", id: uid(), amount: gift });
    commit(next);
  },
  setQty(id: string, qty: number) {
    load();
    commit(lines.map((l) => (l.id === id && l.kind === "product" ? { ...l, qty: Math.max(1, qty) } : l)));
  },
  remove(id: string) {
    load();
    commit(lines.filter((l) => l.id !== id));
  },
  clear() {
    commit([]);
  },
};

export function findVariant(productId: string, variantId: string) {
  const product = store.products.find((p) => p.id === productId);
  const variant = product?.variants.find((v) => v.id === variantId);
  return { product, variant };
}

export function slipAmount(slip: Slip): number {
  const candle = zapiski.candles.find((x) => x.id === slip.candleId);
  return Math.max(0, slip.offering || 0) + (candle ? candle.price * slip.candleQty : 0);
}

export function lineAmount(line: CartLine): number {
  if (line.kind === "product") return (findVariant(line.productId, line.variantId).variant?.price ?? 0) * line.qty;
  if (line.kind === "zapiska") return slipAmount(line.slip);
  return line.amount;
}

export function lineLabel(line: CartLine, lang: string): string {
  if (line.kind === "product") {
    const { product, variant } = findVariant(line.productId, line.variantId);
    return `${tr(product?.name, lang)} (${tr(variant?.label, lang)})`;
  }
  if (line.kind === "zapiska") {
    const type = zapiski.noteTypes.find((n) => n.id === line.slip.type);
    const c = zapiski.commemorations.find((x) => x.id === line.slip.commemorationId);
    return `${t("zapiski.slip", lang)}: ${tr(type?.label, lang)}, ${tr(c?.label, lang)}`;
  }
  return t("zapiski.freeDonation", lang);
}

export function hasPhysicalItems(cartLines: CartLine[]) {
  return cartLines.some((l) => l.kind === "product");
}

export function cartCount(cartLines: CartLine[]) {
  return cartLines.reduce((n, l) => n + (l.kind === "product" ? l.qty : 1), 0);
}

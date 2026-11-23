"use client";

import { useEffect, useState } from "react";
import { parishNow, type ParishNow } from "./calendar";

/** Parish wall-clock time, refreshed every minute. Null until mounted so static HTML never shows a stale day. */
export function useParishNow(): ParishNow | null {
  const [now, setNow] = useState<ParishNow | null>(null);
  useEffect(() => {
    const tick = () => setNow(parishNow());
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, []);
  return now;
}

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

/** Formats input as (000)-000-0000 while typing. */
export function maskPhone(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 10);
  if (d.length === 0) return "";
  if (d.length <= 3) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 3)})-${d.slice(3)}`;
  return `(${d.slice(0, 3)})-${d.slice(3, 6)}-${d.slice(6)}`;
}

export const isFullPhone = (v: string) => /^\(\d{3}\)-\d{3}-\d{4}$/.test(v);
export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

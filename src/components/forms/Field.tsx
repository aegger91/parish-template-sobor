"use client";

import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function Field({
  id,
  label,
  error,
  hint,
  optionalLabel,
  children,
  className,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  optionalLabel?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0 space-y-1.5", className)}>
      <Label htmlFor={id} className="text-[0.95rem] text-ink">
        {label}
        {optionalLabel ? <span className="font-normal text-ink-muted"> ({optionalLabel})</span> : null}
      </Label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-[0.85rem] text-kinovar" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-[0.82rem] text-ink-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export const inputClass = "h-11 bg-white text-base border-cream-300 focus-visible:border-gold-500";

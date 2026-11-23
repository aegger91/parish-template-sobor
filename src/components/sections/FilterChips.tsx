"use client";

import { cn } from "@/lib/utils";

export function FilterChips({
  label,
  value,
  onChange,
  options,
  className,
}: {
  label: string;
  value: string;
  onChange: (id: string) => void;
  options: { id: string; label: string }[];
  className?: string;
}) {
  return (
    <div role="group" aria-label={label} className={cn("flex flex-wrap justify-center gap-2", className)}>
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          aria-pressed={value === o.id}
          onClick={() => onChange(o.id)}
          className={cn(
            "min-h-10 rounded-full border px-4 font-button text-[0.95rem] transition-colors",
            value === o.id ? "border-green-800 bg-green-800 text-gold-200" : "border-green-800/25 bg-cream-50 text-green-800 hover:border-gold-500",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

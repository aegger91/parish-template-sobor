import type { ReactNode } from "react";
import { KokoshnikDivider } from "@/components/sacred/Ornaments";
import { OrthodoxCross } from "@/components/sacred/OrthodoxCross";
import { cn } from "@/lib/utils";

export function SectionHeader({
  title,
  intro,
  sticky,
  actions,
  className,
}: {
  title?: string;
  intro?: string;
  sticky?: boolean;
  actions?: ReactNode;
  className?: string;
}) {
  if (!title) return null;
  if (sticky) {
    return (
      <>
        <div className="section-sticky-header border-y border-gold-500/30 bg-cream-100/95 shadow-[0_8px_16px_-14px_rgba(16,48,31,0.5)] backdrop-blur supports-[backdrop-filter]:bg-cream-100/85">
          <div className="container-sobor flex min-h-14 flex-wrap items-center justify-between gap-x-4 gap-y-2 py-2.5">
            <h2 className="vyaz-title flex min-w-0 items-center gap-2.5 text-[1.45rem] text-green-800 sm:text-[1.75rem]">
              <OrthodoxCross size={22} className="shrink-0 text-gold-500" />
              <span className="min-w-0">{title}</span>
            </h2>
            {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
          </div>
        </div>
        {intro ? <p className="container-sobor mt-5 max-w-3xl text-ink-muted">{intro}</p> : null}
      </>
    );
  }
  return (
    <div className={cn("container-sobor mb-10 text-center", className)}>
      <h2 className="vyaz-title text-[length:var(--text-h2)] text-green-800">{title}</h2>
      <KokoshnikDivider className="mt-3" />
      {intro ? <p className="mx-auto mt-4 max-w-2xl text-[1.05rem] text-ink-muted">{intro}</p> : null}
      {actions ? <div className="mt-5 flex flex-wrap justify-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function SectionShell({
  id,
  children,
  className,
  tone = "plain",
}: {
  id: string;
  children: ReactNode;
  className?: string;
  tone?: "plain" | "paper" | "green";
}) {
  return (
    <section
      id={id}
      className={cn(
        "relative py-14 sm:py-20",
        tone === "paper" && "paper border-y border-cream-300",
        tone === "green" && "bg-green-800 text-cream-50",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function Paragraphs({ text, className }: { text: string; className?: string }) {
  return (
    <div className={cn("prose-sobor", className)}>
      {text.split(/\n\n+/).map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  );
}

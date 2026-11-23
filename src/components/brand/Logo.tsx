import { useId } from "react";
import { site } from "@/lib/content";
import { tr } from "@/lib/i18n";
import { withBase } from "@/lib/pages";
import { cn } from "@/lib/utils";
import { OrthodoxCross } from "@/components/sacred/OrthodoxCross";

/** Circular seal: eight-pointed cross in the center, parish name around the ring. */
export function SealMark({ lang, size = 56, className }: { lang: string; size?: number; className?: string }) {
  const id = useId().replace(/:/g, "");
  const text = tr(site.logo.ringText ?? site.name, lang);
  const r = 36.6;
  const circumference = 2 * Math.PI * r;
  const fontSize = Math.min(9, Math.max(5.2, (circumference * 0.86) / (text.length * 0.56)));
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className} role="img" aria-label={tr(site.name, lang)}>
      <defs>
        <path id={`ring-${id}`} d={`M50 ${50 + r}A${r} ${r} 0 1 1 ${50 - 0.01} ${50 + r}`} />
      </defs>
      <circle cx="50" cy="50" r="48.5" fill="var(--sobor-green-800)" stroke="var(--sobor-gold-500)" strokeWidth="1.6" />
      <circle cx="50" cy="50" r="45.2" fill="none" stroke="var(--sobor-gold-400)" strokeWidth="0.6" strokeDasharray="0.8 1.6" />
      <circle cx="50" cy="50" r="30.4" fill="var(--sobor-cream-100)" stroke="var(--sobor-gold-500)" strokeWidth="1.4" />
      <circle cx="50" cy="50" r="27.6" fill="none" stroke="var(--sobor-gold-500)" strokeWidth="0.5" />
      <text fontFamily="var(--font-role-heading)" fontSize={fontSize} fill="var(--sobor-gold-200)" letterSpacing="0.4">
        <textPath href={`#ring-${id}`} startOffset="50%" textAnchor="middle">
          {text}
        </textPath>
      </text>
      <path d="M50 92.4l1.8 1.8-1.8 1.8-1.8-1.8z" fill="var(--sobor-gold-400)" />
      <g color="var(--sobor-green-800)">
        <OrthodoxCross x={39.2} y={32} width={21.6} height={36} />
      </g>
    </svg>
  );
}

/** Kiot (icon case) shaped mark with the cross inside. */
export function KiotMark({ size = 56, className, label }: { size?: number; className?: string; label: string }) {
  return (
    <svg viewBox="0 0 80 100" width={(size * 80) / 100} height={size} className={className} role="img" aria-label={label}>
      <path d="M6 96V34C6 18 22 8 40 3c18 5 34 15 34 31v62z" fill="var(--sobor-green-800)" stroke="var(--sobor-gold-500)" strokeWidth="2.5" />
      <path d="M14 88V36c0-11 12-19 26-23 14 4 26 12 26 23v52z" fill="var(--sobor-cream-100)" stroke="var(--sobor-gold-500)" strokeWidth="1.2" />
      <g color="var(--sobor-green-800)">
        <OrthodoxCross x={27} y={26} width={26} height={44} />
      </g>
      <path d="M2 96h76" stroke="var(--sobor-gold-500)" strokeWidth="3" />
    </svg>
  );
}

type LogoProps = { lang: string; condensed?: boolean; onDark?: boolean; className?: string; showText?: boolean };

export function Logo({ lang, condensed, onDark = true, className, showText = true }: LogoProps) {
  const style = site.logo.style;
  const name = tr(site.shortName, lang);
  const size = condensed ? 44 : 58;
  const text = showText ? (
    <span className="hidden min-w-0 flex-col leading-normal sm:flex">
      <span
        className={cn(
          "vyaz-title max-w-[11rem] md:max-w-[14rem] xl:max-w-[18rem]",
          condensed ? "text-[1rem] md:text-[1.15rem]" : "text-[1.05rem] md:text-[1.3rem]",
          onDark ? "text-cream-50" : "text-green-800",
        )}
      >
        {name}
      </span>
      <span className={cn("mt-1 text-[0.72rem] tracking-wide", condensed && "hidden xl:inline", onDark ? "text-gold-200/90" : "text-ink-muted")}>
        {tr(site.jurisdiction, lang)}
      </span>
    </span>
  ) : null;

  if (style === "wordmark") {
    return (
      <span className={cn("flex min-w-0 items-center gap-2", className)}>
        <OrthodoxCross size={condensed ? 22 : 28} className={onDark ? "text-gold-400" : "text-gold-600"} />
        {text ?? (
          <span className={cn("vyaz-title sm:hidden", condensed ? "text-[1rem]" : "text-[1.05rem]", onDark ? "text-cream-50" : "text-green-800")}>{name}</span>
        )}
      </span>
    );
  }

  const mark =
    style === "kiot" ? (
      <KiotMark size={size} label={tr(site.name, lang)} />
    ) : style === "square" && site.logo.image ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={withBase(site.logo.image)} alt={tr(site.logo.imageAlt, lang)} width={size} height={size} className="rounded-[4px] object-cover" style={{ width: size, height: size }} />
    ) : (
      <SealMark lang={lang} size={size} className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]" />
    );

  return (
    <span className={cn("flex min-w-0 items-center gap-2 sm:gap-3", className)}>
      <span className="shrink-0">{mark}</span>
      {text}
    </span>
  );
}

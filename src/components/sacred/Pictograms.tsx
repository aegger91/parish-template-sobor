import type { ReactNode } from "react";
import { OrthodoxCross } from "./OrthodoxCross";

/**
 * Orthodox line pictograms on a 48 x 48 grid. Stroke uses currentColor;
 * flames and small accents use the gold token. Any cross drawn here is the shared OrthodoxCross.
 */
export type PictogramName =
  | "church" | "chalice" | "censer" | "candle" | "prayer-rope" | "gospel" | "icon-frame" | "bells"
  | "font" | "chrism" | "analoy" | "crowns" | "unction" | "blessing" | "kanun" | "slip" | "moleben"
  | "lampada" | "tapers" | "book" | "psalter" | "charcoal" | "neck-cross" | "wall-cross" | "towel" | "kiot"
  | "calendar-feast" | "map-pin";

const flame = (cx: number, top: number, s = 1) => (
  <path
    d={`M${cx} ${top}c${2 * s} ${2.6 * s} ${2.2 * s} ${4.6 * s} 0 ${6 * s}c${-2.2 * s} ${-1.4 * s} ${-2 * s} ${-3.4 * s} 0 ${-6 * s}z`}
    fill="var(--sobor-gold-500)"
    stroke="none"
  />
);

const glyphs: Record<PictogramName, ReactNode> = {
  church: (
    <>
      <path d="M8 44h32M12 44V26h24v18M21 44v-6a3 3 0 0 1 6 0v6M19 26v-7h10v7" />
      <path d="M19 19c-2-4 2-7 5-10 3 3 7 6 5 10z" />
      <path d="M12.5 26c-1-2.5 1-4 2.5-5.5 1.5 1.5 3.5 3 2.5 5.5M30.5 26c-1-2.5 1-4 2.5-5.5 1.5 1.5 3.5 3 2.5 5.5" />
      <OrthodoxCross x={21.6} y={0.6} width={4.8} height={8} />
      <OrthodoxCross x={13.8} y={15.4} width={2.4} height={4.8} />
      <OrthodoxCross x={31.8} y={15.4} width={2.4} height={4.8} />
    </>
  ),
  chalice: (
    <>
      <path d="M14 8h20c0 10-4 15-10 15S14 18 14 8zM24 23v14M16 41c2-5 14-5 16 0z" />
      <circle cx="24" cy="29" r="2" />
      <OrthodoxCross x={22.2} y={10} width={3.6} height={6} />
    </>
  ),
  censer: (
    <>
      <path d="M18 6h12M19 6l-3 18M29 6l3 18M24 6v6.5" />
      <path d="M16 24c0-6 16-6 16 0zM15 24h18c0 6-4 10-9 10s-9-4-9-10zM20 34l-2 4h12l-2-4" />
      <OrthodoxCross x={22.8} y={12.4} width={2.4} height={4.4} />
      <path d="M37 19c3-3-1-5 2-9M11 21c-3-3 1-5-2-9" strokeDasharray="2 2" />
    </>
  ),
  candle: (
    <>
      <rect x="22" y="16" width="4" height="25" rx="1" />
      <path d="M24 14v2M16 42h16" />
      {flame(24, 6.5, 1.25)}
    </>
  ),
  "prayer-rope": (
    <>
      {Array.from({ length: 16 }, (_, i) => {
        const a = (i / 16) * Math.PI * 2 - Math.PI / 2;
        return <circle key={i} cx={24 + Math.cos(a) * 11} cy={19 + Math.sin(a) * 11} r="1.9" />;
      })}
      <path d="M24 30v5M24 37.5v1.5M21 39h6l1.5 7h-9z" />
      <circle cx="24" cy="36.2" r="1.3" />
    </>
  ),
  gospel: (
    <>
      <rect x="11" y="6" width="26" height="36" rx="2" />
      <circle cx="24" cy="24" r="7.5" />
      <OrthodoxCross x={21.6} y={18} width={4.8} height={12} />
      <circle cx="15.5" cy="10.5" r="1.8" />
      <circle cx="32.5" cy="10.5" r="1.8" />
      <circle cx="15.5" cy="37.5" r="1.8" />
      <circle cx="32.5" cy="37.5" r="1.8" />
      <path d="M37 13h2M37 35h2" />
    </>
  ),
  "icon-frame": (
    <>
      <path d="M12 42V16c0-6 6-10 12-12 6 2 12 6 12 12v26zM16 38V18c0-5 4-8 8-9 4 1 8 4 8 9v20zM9 42h30" />
      <circle cx="24" cy="21" r="5" />
      <path d="M20 38c0-6 1.5-9 4-9s4 3 4 9" />
    </>
  ),
  bells: (
    <>
      <path d="M5 6h38M18 6v4M34 6v8" />
      <path d="M18 10c-5 0-6 6-6 12 0 4-2 6-3 8h18c-1-2-3-4-3-8 0-6-1-12-6-12z" />
      <circle cx="18" cy="32.5" r="1.7" />
      <path d="M34 14c-3.5 0-4 4-4 8 0 3-1.5 4-2 5.5h12c-.5-1.5-2-2.5-2-5.5 0-4-.5-8-4-8z" />
      <circle cx="34" cy="29.6" r="1.3" />
    </>
  ),
  font: (
    <>
      <path d="M10 20h28c0 8-6 12-14 12s-14-4-14-12zM20 32l-2 10h12l-2-10" />
      <path d="M14 23c3-2 6 2 10 0s7-2 10 0" />
      <path d="M15 20v-7M24 20v-9M33 20v-7" />
      {flame(15, 7.4, 0.8)}
      {flame(24, 5.4, 0.8)}
      {flame(33, 7.4, 0.8)}
    </>
  ),
  chrism: (
    <>
      <path d="M18 18c-4 4-4 16 0 22h12c4-6 4-18 0-22zM20 18v-5h8v5M19 13h10M22 13c0-3.5 4-3.5 4 0" />
      <OrthodoxCross x={22.2} y={23} width={3.6} height={8} />
      <path d="M34 14l7-8M40.5 5.5l1.5 1.5" />
    </>
  ),
  analoy: (
    <>
      <path d="M9 25l30-7v3L9 28zM13 28l2 16M35 21l-2 23M11 44h26" />
      <path d="M13 23.2l12-2.8v-4.2l-12 2.8z" />
      <OrthodoxCross x={28} y={4} width={7.2} height={14} />
    </>
  ),
  crowns: (
    <>
      <path d="M7 30h16v4H7zM7 30c0-7 3-10 8-10s8 3 8 10M11 30c0-4 1.5-6.5 4-6.5s4 2.5 4 6.5" />
      <path d="M25 30h16v4H25zM25 30c0-7 3-10 8-10s8 3 8 10M29 30c0-4 1.5-6.5 4-6.5s4 2.5 4 6.5" />
      <OrthodoxCross x={13.2} y={12} width={3.6} height={7.6} />
      <OrthodoxCross x={31.2} y={12} width={3.6} height={7.6} />
      <path d="M10 38h28" />
    </>
  ),
  unction: (
    <>
      <path d="M7 30h34c0 6-7 10-17 10S7 36 7 30zM21 30v-5c0-3 6-3 6 0v5" />
      <path d="M11 30V20M15.5 30V18M20 26V17M24 22V13M28 26V17M32.5 30V18M37 30V20" />
      {flame(11, 15.4, 0.7)}
      {flame(15.5, 13.4, 0.7)}
      {flame(20, 12.4, 0.7)}
      {flame(24, 8.4, 0.7)}
      {flame(28, 12.4, 0.7)}
      {flame(32.5, 13.4, 0.7)}
      {flame(37, 15.4, 0.7)}
    </>
  ),
  blessing: (
    <>
      <path d="M6 44V27l12-10 12 10v17zM15 44v-8h6v8M4 44h28" />
      <path d="M37 43l4-17" />
      <ellipse cx="41.6" cy="22" rx="2.6" ry="4.2" />
      <path d="M36 19.5v2M33 23v2M38 14v2M44 15v2" strokeDasharray="1 2" />
    </>
  ),
  kanun: (
    <>
      <path d="M5 32h38v3H5zM9 35v9M39 35v9" />
      <path d="M9 32v-6M13 32v-7M17 32v-5M31 32v-5M35 32v-7M39 32v-6" />
      {flame(9, 21.4, 0.7)}
      {flame(13, 20.4, 0.7)}
      {flame(17, 22.4, 0.7)}
      {flame(31, 22.4, 0.7)}
      {flame(35, 20.4, 0.7)}
      {flame(39, 21.4, 0.7)}
      <OrthodoxCross x={19.4} y={4} width={9.2} height={28} />
    </>
  ),
  slip: (
    <>
      <path d="M12 4h24v40H12z" />
      <OrthodoxCross x={21.3} y={7} width={5.4} height={9} />
      <path d="M16 22h16M16 27h16M16 32h16M16 37h10" />
    </>
  ),
  moleben: (
    <>
      <rect x="9" y="7" width="20" height="26" rx="1" />
      <rect x="12" y="10" width="14" height="20" />
      <circle cx="19" cy="17" r="4" />
      <path d="M8 33h22l-4 11H12zM38 44V24M34 44h8" />
      {flame(38, 15.8, 1)}
    </>
  ),
  lampada: (
    <>
      <path d="M24 2v6M16 8h16M17 8l-1 14M31 8l1 14" />
      <path d="M14 22h20c0 7-4 11-10 11s-10-4-10-11zM20 33l4 6 4-6M24 39v4" />
      {flame(24, 15, 0.9)}
    </>
  ),
  tapers: (
    <>
      <path d="M16 44V18M24 44V13M32 44V18M12 40c4 2 20 2 24 0" />
      {flame(16, 10.5, 1)}
      {flame(24, 5.5, 1)}
      {flame(32, 10.5, 1)}
    </>
  ),
  book: (
    <>
      <path d="M10 8h24a4 4 0 0 1 4 4v30H14a4 4 0 0 1-4-4z" />
      <path d="M14 42a4 4 0 0 1 0-8h24" />
      <OrthodoxCross x={21} y={12} width={8.4} height={16} />
    </>
  ),
  psalter: (
    <>
      <path d="M10 8h24a4 4 0 0 1 4 4v30H14a4 4 0 0 1-4-4z" />
      <path d="M14 42a4 4 0 0 1 0-8h24M15 13h18M15 29h18" />
      <path d="M24 16l5 5-5 5-5-5z" />
    </>
  ),
  charcoal: (
    <>
      <path d="M14 12h20v26H14z" />
      <ellipse cx="24" cy="12" rx="10" ry="3" />
      <path d="M14 20h20M14 28h20" />
    </>
  ),
  "neck-cross": (
    <>
      <path d="M12 4c0 8 5 12 12 12s12-4 12-12" strokeDasharray="1.5 2" />
      <circle cx="24" cy="17.5" r="1.6" />
      <OrthodoxCross x={17.4} y={19} width={13.2} height={24} />
    </>
  ),
  "wall-cross": (
    <>
      <OrthodoxCross x={12} y={3} width={24} height={40} />
    </>
  ),
  towel: (
    <>
      <path d="M8 6h32v36H8z" />
      <path d="M8 32h32M8 38h32" />
      {[12, 18, 24, 30, 36].map((x) => (
        <path key={x} d={`M${x} 32l3 3-3 3-3-3z`} fill="var(--sobor-kinovar)" stroke="none" />
      ))}
      <path d="M10 42v3M14 42v3M18 42v3M22 42v3M26 42v3M30 42v3M34 42v3M38 42v3" />
    </>
  ),
  kiot: (
    <>
      <path d="M10 36V14c0-5 6-9 14-11 8 2 14 6 14 11v22zM14 32V16c0-3 4-7 10-8 6 1 10 5 10 8v16zM6 36h36l-3 6H9z" />
      <circle cx="24" cy="19" r="4.5" />
      <path d="M24 38v4" />
    </>
  ),
  "calendar-feast": (
    <>
      <rect x="7" y="10" width="34" height="32" rx="2" />
      <path d="M7 18h34M15 6v8M33 6v8" />
      <OrthodoxCross x={20.4} y={21} width={7.2} height={18} />
    </>
  ),
  "map-pin": (
    <>
      <path d="M24 44s13-13 13-24a13 13 0 0 0-26 0c0 11 13 24 13 24z" />
      <OrthodoxCross x={21.3} y={11} width={5.4} height={11} />
    </>
  ),
};

export function Pictogram({
  name,
  size = 40,
  className,
  strokeWidth = 1.6,
  title,
}: {
  name: PictogramName;
  size?: number;
  className?: string;
  strokeWidth?: number;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {glyphs[name]}
    </svg>
  );
}

/** A small bell that swings inside any `.bell-hover` parent. */
export function SwingingBell({ className, size = 16 }: { className?: string; size?: number }) {
  return (
    <span className={`bell-swing ${className ?? ""}`} aria-hidden>
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v2M12 4c-4 0-5 4-5 8 0 3-1.5 4.5-2.5 6h15c-1-1.5-2.5-3-2.5-6 0-4-1-8-5-8z" />
        <circle cx="12" cy="20.5" r="1.4" />
      </svg>
    </span>
  );
}

import { useId } from "react";
import { OrthodoxCross } from "./OrthodoxCross";
import { Pictogram, type PictogramName } from "./Pictograms";
import { cn } from "@/lib/utils";

/** Old Russian lattice border: a chain of diamonds with dots, drawn as a repeating pattern. */
export function OrnamentBand({ className, height = 14 }: { className?: string; height?: number }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg className={cn("block w-full", className)} height={height} aria-hidden preserveAspectRatio="none">
      <defs>
        <pattern id={`ob-${id}`} width={28} height={14} patternUnits="userSpaceOnUse">
          <path d="M0 7L7 1.5 14 7 21 12.5 28 7M0 7L7 12.5 14 7 21 1.5 28 7" fill="none" stroke="currentColor" strokeWidth="1.1" />
          <path d="M7 5l2 2-2 2-2-2zM21 5l2 2-2 2-2-2z" fill="currentColor" />
          <circle cx="14" cy="7" r="0.9" fill="currentColor" />
          <circle cx="0" cy="7" r="0.9" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#ob-${id})`} />
    </svg>
  );
}

/** Ogee (kokoshnik) arch divider with a small cross, flanked by fine rules. */
export function KokoshnikDivider({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center gap-3 text-gold-500", className)} aria-hidden>
      <span className="h-px w-10 bg-current opacity-60 sm:w-16" />
      <svg viewBox="0 0 60 26" width="60" height="26" fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M4 24c10 0 12-8 18-12 4-3 6-6 8-10 2 4 4 7 8 10 6 4 8 12 18 12" />
        <path d="M14 24c6 0 8-5 11-7 2-1.5 4-3.5 5-6 1 2.5 3 4.5 5 6 3 2 5 7 11 7" opacity="0.6" />
        <OrthodoxCross x={27.6} y={10} width={4.8} height={9} />
      </svg>
      <span className="h-px w-10 bg-current opacity-60 sm:w-16" />
    </div>
  );
}

export const skylineHeight = "h-[clamp(56px,11vw,160px)]";

/** Inner-page banner ribbon height and matching bottom padding. */
export const bannerRibbonHeight = "h-[clamp(36px,6vw,52px)]";
export const bannerRibbonPad = "pb-[calc(clamp(36px,6vw,52px)+1.25rem)]";

/**
 * Elegant ribbon edge for inner-page banners: cream band, gold double rule,
 * and a centered three-bar Orthodox cross. No buildings.
 */
export function BannerRibbon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1440 52"
      preserveAspectRatio="none"
      className={cn("pointer-events-none absolute inset-x-0 bottom-0 z-0 block w-full text-cream-100", className)}
      aria-hidden
    >
      <path fill="currentColor" d="M0 20c160 8 320 14 480 12s320-10 480-8 320 10 480 6v22H0z" />
      <g fill="none" stroke="var(--sobor-gold-500)" strokeLinecap="round">
        <path d="M48 28h648" strokeWidth="1.4" opacity="0.85" />
        <path d="M48 32h648" strokeWidth="0.9" opacity="0.45" />
        <path d="M744 28h648" strokeWidth="1.4" opacity="0.85" />
        <path d="M744 32h648" strokeWidth="0.9" opacity="0.45" />
      </g>
      <g fill="var(--sobor-gold-400)">
        <OrthodoxCross x={708} y={8} width={24} height={36} />
      </g>
    </svg>
  );
}

/** Classic onion dome: bulge a little wider than the drum, tapering to a point. */
function onionPath(cx: number, by: number, drumW: number, h: number) {
  const bulge = drumW * 1.12;
  const L = (t: number) => cx - bulge * t;
  const R = (t: number) => cx + bulge * t;
  return (
    `M${cx - drumW / 2} ${by}` +
    `C${L(0.55)} ${by - h * 0.18} ${L(0.58)} ${by - h * 0.42} ${L(0.28)} ${by - h * 0.62}` +
    `C${L(0.12)} ${by - h * 0.74} ${L(0.05)} ${by - h * 0.88} ${cx} ${by - h}` +
    `C${R(0.05)} ${by - h * 0.88} ${R(0.12)} ${by - h * 0.74} ${R(0.28)} ${by - h * 0.62}` +
    `C${R(0.58)} ${by - h * 0.42} ${R(0.55)} ${by - h * 0.18} ${cx + drumW / 2} ${by}Z`
  );
}

type Dome = { cx: number; by: number; drumW: number; drumH: number; domeH: number };

function DomeGroup({ d }: { d: Dome }) {
  const crossH = Math.max(10, d.domeH * 0.55);
  const crossW = (crossH * 24) / 40;
  return (
    <g>
      <rect x={d.cx - d.drumW / 2} y={d.by} width={d.drumW} height={d.drumH} rx={1} />
      <path d={onionPath(d.cx, d.by, d.drumW, d.domeH)} />
      <OrthodoxCross x={d.cx - crossW / 2} y={d.by - d.domeH - crossH + 1.5} width={crossW} height={crossH} />
    </g>
  );
}

/**
 * Silhouette skyline of a five-domed cathedral, a tented bell tower and small churches.
 * Size it with skylineHeight so the crosses are never cropped.
 * Domes sit on visible drums that meet the building bodies; nothing is clipped at the sides.
 */
export function DomeSkyline({ className }: { className?: string }) {
  const ground = 172;
  const roof = 110;
  const cathedral: Dome[] = [
    { cx: 720, by: roof - 20, drumW: 26, drumH: 20, domeH: 30 },
    { cx: 674, by: roof - 14, drumW: 18, drumH: 14, domeH: 22 },
    { cx: 766, by: roof - 14, drumW: 18, drumH: 14, domeH: 22 },
    { cx: 640, by: roof - 10, drumW: 14, drumH: 10, domeH: 16 },
    { cx: 800, by: roof - 10, drumW: 14, drumH: 10, domeH: 16 },
  ];
  const small: Dome[] = [
    { cx: 320, by: 118, drumW: 15, drumH: 12, domeH: 18 },
    { cx: 1145, by: 114, drumW: 16, drumH: 12, domeH: 19 },
    { cx: 1205, by: 128, drumW: 11, drumH: 8, domeH: 13 },
    { cx: 175, by: 132, drumW: 11, drumH: 8, domeH: 13 },
    { cx: 1288, by: 130, drumW: 12, drumH: 9, domeH: 14 },
  ];
  return (
    <svg
      viewBox="0 0 1440 186"
      preserveAspectRatio="xMidYMax meet"
      className={className}
      aria-hidden
      fill="currentColor"
    >
      <path d={`M0 ${ground}H1440V156c-200 4-400 6-720 4S200 154 0 156Z`} />
      <path d={`M618 ${ground}V${roof}h204V${ground}z`} />
      {cathedral.map((d) => (
        <DomeGroup key={d.cx} d={d} />
      ))}
      <path d={`M962 ${ground}V104h36V${ground}z`} />
      <path d="M956 104h48v-5H956z" />
      <path d="M970 99l10-28 10 28z" />
      <rect x="974" y="112" width="11" height="14" rx="5.5" opacity="0.3" />
      <DomeGroup d={{ cx: 980, by: 68, drumW: 7, drumH: 3, domeH: 8 }} />
      <path d={`M298 ${ground}v-42h44v42zM1126 ${ground}v-46h44v46zM1188 ${ground}v-34h34v34zM158 ${ground}v-30h34v30zM1270 ${ground}v-32h36v32z`} />
      {small.map((d) => (
        <DomeGroup key={d.cx} d={d} />
      ))}
      <path d={`M430 ${ground}c0-26 8-40 15-40s15 14 15 40zM462 ${ground}c0-18 6-28 11-28s11 10 11 28zM1038 ${ground}c0-22 7-34 13-34s13 12 13 34zM230 ${ground}c0-16 5-26 10-26s10 10 10 26z`} opacity="0.85" />
    </svg>
  );
}

/** A framed placeholder illustration tile used by the store and the service cards. */
export function IllustrationTile({
  name,
  className,
  tone = "cream",
  label,
}: {
  name: PictogramName;
  className?: string;
  tone?: "cream" | "green";
  label?: string;
}) {
  const green = tone === "green";
  return (
    <div
      role={label ? "img" : undefined}
      aria-label={label}
      className={cn(
        "relative flex items-center justify-center overflow-hidden",
        green ? "bg-green-800 text-gold-400" : "paper text-green-800",
        className,
      )}
    >
      <div className={cn("absolute inset-2 rounded-[3px] border", green ? "border-gold-500/50" : "border-gold-500/45")} />
      <div className={cn("absolute inset-3.5 rounded-[2px] border border-dashed", green ? "border-gold-500/25" : "border-gold-500/25")} />
      {[["start-2 top-2"], ["end-2 top-2"], ["start-2 bottom-2"], ["end-2 bottom-2"]].map(([pos]) => (
        <span key={pos} className={cn("absolute size-2 rotate-45 bg-gold-500/70", pos)} style={{ margin: -3 }} />
      ))}
      <div
        className={cn(
          "relative flex aspect-square w-[46%] max-w-40 items-center justify-center rounded-full",
          green ? "bg-green-900/70 ring-1 ring-gold-500/40" : "bg-cream-100 ring-1 ring-gold-500/40",
        )}
      >
        <Pictogram name={name} className="h-[66%] w-[66%]" strokeWidth={1.3} />
      </div>
    </div>
  );
}

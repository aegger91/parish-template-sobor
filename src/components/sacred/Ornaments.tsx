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
export const bannerRibbonHeight = "h-[clamp(36px,6vw,56px)]";
export const bannerRibbonPad = "pb-[calc(clamp(36px,6vw,56px)+1.25rem)]";

/**
 * Soft single full-width wave. Crest sits in the upper half of the viewBox so the
 * fill always covers below the gold ribbon (no cream sliver between stroke and fill).
 */
const WAVE_CREST = "M0 22 C300 4, 540 4, 720 28 C900 52, 1140 52, 1440 20";
const WAVE_FILL = `${WAVE_CREST} L1440 64 L0 64 Z`;

export const footerWaveHeight = "h-[clamp(32px,5vw,52px)]";

/**
 * Full-width soft wave from the page background into the dark green footer.
 * Gold ribbon rides just inside the green fill; no buildings or crosses.
 */
export function FooterWave({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1440 64"
      preserveAspectRatio="none"
      className={cn("pointer-events-none block w-full text-green-900", className)}
      aria-hidden
    >
      <path fill="currentColor" d={WAVE_FILL} />
      {/* Stroke inset 1.5 units into the fill so antialias never opens a cream seam */}
      <path
        d={WAVE_CREST}
        fill="none"
        stroke="var(--sobor-gold-500)"
        strokeWidth="2"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        transform="translate(0 1.5)"
      />
    </svg>
  );
}

/**
 * Inner-page banner edge: cream wave into the page, continuous gold ribbon on the crest.
 * No centered cross or broken rule.
 */
export function BannerRibbon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1440 64"
      preserveAspectRatio="none"
      className={cn("pointer-events-none absolute inset-x-0 bottom-0 z-0 block w-full text-cream-100", className)}
      aria-hidden
    >
      <path fill="currentColor" d={WAVE_FILL} />
      <path
        d={WAVE_CREST}
        fill="none"
        stroke="var(--sobor-gold-500)"
        strokeWidth="1.75"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        transform="translate(0 1.5)"
        opacity="0.95"
      />
      <path
        d={WAVE_CREST}
        fill="none"
        stroke="var(--sobor-gold-400)"
        strokeWidth="0.8"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        transform="translate(0 4)"
        opacity="0.4"
      />
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
 * Silhouette skyline of churches and bell towers in one continuous row.
 * No trees, bushes, or mound blobs: only squared building masses and onion domes.
 * viewBox bottom equals ground so the fill sits flush on the ornament band below.
 */
export function DomeSkyline({ className }: { className?: string }) {
  const ground = 186;
  const roof = 118;
  // Domes sit on drums that meet each building's roof line (by + drumH === roof top).
  const cathedral: Dome[] = [
    { cx: 720, by: roof - 20, drumW: 26, drumH: 20, domeH: 30 },
    { cx: 674, by: roof - 14, drumW: 18, drumH: 14, domeH: 22 },
    { cx: 766, by: roof - 14, drumW: 18, drumH: 14, domeH: 22 },
    { cx: 640, by: roof - 10, drumW: 14, drumH: 10, domeH: 16 },
    { cx: 800, by: roof - 10, drumW: 14, drumH: 10, domeH: 16 },
  ];
  const churches: { body: string; dome: Dome }[] = [
    { body: `M148 ${ground}V156h40V${ground}z`, dome: { cx: 168, by: 148, drumW: 12, drumH: 8, domeH: 14 } },
    { body: `M286 ${ground}V144h52V${ground}z`, dome: { cx: 312, by: 132, drumW: 16, drumH: 12, domeH: 18 } },
    { body: `M1118 ${ground}V140h52V${ground}z`, dome: { cx: 1144, by: 128, drumW: 16, drumH: 12, domeH: 19 } },
    { body: `M1180 ${ground}V152h36V${ground}z`, dome: { cx: 1198, by: 144, drumW: 12, drumH: 8, domeH: 13 } },
    { body: `M1262 ${ground}V150h40V${ground}z`, dome: { cx: 1282, by: 141, drumW: 13, drumH: 9, domeH: 14 } },
  ];
  return (
    <svg
      viewBox="0 0 1440 186"
      preserveAspectRatio="xMidYMax slice"
      className={className}
      aria-hidden
      fill="currentColor"
    >
      {/* Flat continuous plinth: no curved mounds; bottom edge = viewBox ground */}
      <rect x="0" y={ground - 20} width="1440" height="20" />
      {/* Mid-height linking wall between side churches and the cathedral */}
      <path d={`M188 ${ground}V162H298V${ground}zM340 ${ground}V162H618V${ground}zM822 ${ground}V162H958V${ground}zM1002 ${ground}V162H1118V${ground}z`} />
      <path d={`M618 ${ground}V${roof}h204V${ground}z`} />
      {cathedral.map((d) => (
        <DomeGroup key={d.cx} d={d} />
      ))}
      {/* Tented bell tower: squared mass and sharp tent roof only */}
      <path d={`M958 ${ground}V112h44V${ground}z`} />
      <path d="M952 112h56v-4H952z" />
      <path d="M968 108l12-28 12 28z" />
      <rect x="974" y="122" width="10" height="14" />
      <DomeGroup d={{ cx: 980, by: 76, drumW: 7, drumH: 4, domeH: 8 }} />
      {churches.map((c) => (
        <g key={c.dome.cx}>
          <path d={c.body} />
          <DomeGroup d={c.dome} />
        </g>
      ))}
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

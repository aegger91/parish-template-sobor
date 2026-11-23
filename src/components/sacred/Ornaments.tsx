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

export const skylineHeight = "h-[clamp(52px,12.9vw,186px)]";

/** Inner-page banner skyline: shorter than the home hero, scales with the viewport. */
export const bannerSkylineHeight = "h-[clamp(48px,9vw,112px)]";
/** Bottom padding that keeps banner title, divider and subtitle fully above the skyline. */
export const bannerSkylinePad = "pb-[calc(clamp(48px,9vw,112px)+2.25rem)]";

function onion(cx: number, by: number, w: number, h: number) {
  const L = (fx: number) => cx - w * fx, R = (fx: number) => cx + w * fx;
  return (
    `M${L(0.5)} ${by}` +
    `C${L(0.64)} ${by - h * 0.26} ${L(0.62)} ${by - h * 0.56} ${L(0.24)} ${by - h * 0.76}` +
    `C${L(0.08)} ${by - h * 0.85} ${L(0.03)} ${by - h * 0.93} ${cx} ${by - h}` +
    `C${R(0.03)} ${by - h * 0.93} ${R(0.08)} ${by - h * 0.85} ${R(0.24)} ${by - h * 0.76}` +
    `C${R(0.62)} ${by - h * 0.56} ${R(0.64)} ${by - h * 0.26} ${R(0.5)} ${by}Z`
  );
}

type Dome = { cx: number; by: number; w: number; h: number; drum: number };

function DomeGroup({ d }: { d: Dome }) {
  const crossH = d.h * 0.62;
  const crossW = (crossH * 24) / 40;
  return (
    <g>
      <rect x={d.cx - d.w * 0.4} y={d.by} width={d.w * 0.8} height={d.drum} />
      <path d={onion(d.cx, d.by, d.w, d.h)} />
      <OrthodoxCross x={d.cx - crossW / 2} y={d.by - d.h - crossH + 1} width={crossW} height={crossH} />
    </g>
  );
}

/**
 * Silhouette skyline of a five-domed cathedral, a tented bell tower and small churches.
 * Size it with skylineHeight so the crosses are never cropped.
 */
export function DomeSkyline({ className }: { className?: string }) {
  const ground = 160;
  const cathedral: Dome[] = [
    { cx: 720, by: 62, w: 46, h: 46, drum: 30 },
    { cx: 664, by: 84, w: 30, h: 30, drum: 18 },
    { cx: 776, by: 84, w: 30, h: 30, drum: 18 },
    { cx: 630, by: 98, w: 22, h: 22, drum: 12 },
    { cx: 810, by: 98, w: 22, h: 22, drum: 12 },
  ];
  const small: Dome[] = [
    { cx: 300, by: 104, w: 24, h: 25, drum: 14 },
    { cx: 1180, by: 100, w: 26, h: 27, drum: 14 },
    { cx: 1240, by: 116, w: 16, h: 16, drum: 8 },
    { cx: 92, by: 122, w: 16, h: 17, drum: 8 },
    { cx: 1390, by: 120, w: 18, h: 18, drum: 8 },
  ];
  return (
    <svg viewBox="0 -26 1440 186" preserveAspectRatio="xMidYMax slice" className={className} aria-hidden fill="currentColor">
      <path d={`M0 ${ground}V136c120-6 220-14 340-12s240 10 360 8 300-14 420-12 220 8 320 6v34z`} />
      {/* cathedral body with zakomary (rounded gables) */}
      <path d="M600 160V112c0-8 10-10 15-10h210c5 0 15 2 15 10v48zM612 112c0-12 18-16 24-16s24 4 24 16M662 106c0-12 24-18 34-18 10 0 24 6 24 18M720 106c0-12 14-18 24-18 10 0 34 6 34 18M780 112c0-12 18-16 24-16s24 4 24 16" />
      {cathedral.map((d) => <DomeGroup key={d.cx + "-" + d.by} d={d} />)}
      {/* tented bell tower */}
      <path d="M968 160V86h36v74zM962 86h48l-6-8h-36zM972 78l14-44 14 44z" />
      <rect x="980" y="96" width="12" height="18" rx="6" fill="var(--sobor-green-950)" opacity="0.35" />
      <DomeGroup d={{ cx: 986, by: 32, w: 10, h: 11, drum: 3 }} />
      {/* small churches */}
      <path d="M276 160v-42h48v42zM1154 160v-46h52v46zM1228 160v-34h24v34zM80 160v-30h24v30zM1378 160v-30h24v30z" />
      {small.map((d) => <DomeGroup key={d.cx} d={d} />)}
      {/* trees */}
      <path d="M430 160c0-30 10-46 18-46s18 16 18 46zM470 160c0-22 8-34 14-34s14 12 14 34zM1060 160c0-26 9-40 16-40s16 14 16 40zM190 160c0-20 7-32 13-32s13 12 13 32z" opacity="0.9" />
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

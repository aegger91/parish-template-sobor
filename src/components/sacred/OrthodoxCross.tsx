import type { SVGProps } from "react";

/**
 * The single eight-pointed (Slavic) cross used everywhere on the site.
 * Geometry: short top bar (title), long main bar, slanted footrest whose
 * LEFT end as seen by the viewer is HIGHER. Never mirror or rotate this shape.
 * viewBox is 24 x 40.
 */
const CROSS_PATH =
  // upright
  "M10.8 0.8h2.4v38.4h-2.4z" +
  // top bar (title board), short
  "M7.6 5.4h8.8v2.2H7.6z" +
  // main bar
  "M2.4 11.2h19.2v2.7H2.4z" +
  // footrest: left end higher (y smaller), right end lower
  "M5.6 27.2L18.4 31.4V33.8L5.6 29.6Z";

type CrossProps = Omit<SVGProps<SVGSVGElement>, "viewBox"> & {
  title?: string;
  /** Height in px when used standalone; width follows the 24:40 ratio. */
  size?: number;
};

export function OrthodoxCross({ title, size, className, x, y, width, height, ...rest }: CrossProps) {
  const nested = x !== undefined || y !== undefined;
  const h = height ?? size ?? 40;
  const w = width ?? (typeof h === "number" ? (h * 24) / 40 : undefined);
  return (
    <svg
      viewBox="0 0 24 40"
      x={x}
      y={y}
      width={w}
      height={h}
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      preserveAspectRatio="xMidYMid meet"
      {...(nested ? {} : { xmlns: "http://www.w3.org/2000/svg" })}
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      <path d={CROSS_PATH} fill="currentColor" stroke="none" />
    </svg>
  );
}

/** The cross with the IC XC / NI KA inscription in its traditional places around the bars. */
export function CrossWithInscription({ className, size = 160, title }: { className?: string; size?: number; title?: string }) {
  return (
    <svg viewBox="0 0 80 100" width={(size * 80) / 100} height={size} className={className} role="img" aria-label={title ?? "IC XC NIKA"}>
      <OrthodoxCross x={20} y={6} width={40} height={66.6} />
      <g fontFamily="var(--font-role-heading)" fontSize="9" textAnchor="middle" fill="currentColor">
        {/* IC XC above the main bar, each with a titlo */}
        <text x="15" y="22">IC</text>
        <text x="65" y="22">XC</text>
        <path d="M10 13.5h10M60 13.5h10" stroke="currentColor" strokeWidth="1" />
        {/* NI KA below the main bar */}
        <text x="15" y="40">NI</text>
        <text x="65" y="40">KA</text>
      </g>
    </svg>
  );
}

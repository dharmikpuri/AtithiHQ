import { useId } from "react";
import { cn } from "@/lib/cn";

/**
 * A hillside homestay at dusk: an A-frame cottage with its
 * door lit, a smaller cottage, pines and rolling hills. Pure SVG, so it costs nothing
 * on slow connections and stays sharp at any size.
 */
const TONES = {
  light: {
    sun: "var(--color-surface)",
    sunRing: "var(--color-brand-100)",
    farHill: "var(--color-brand-100)",
    midHill: "var(--color-brand-200)",
    ground: "var(--color-surface)",
    groundLine: "var(--color-line-strong)",
    pineFar: "var(--color-brand-300)",
    pineNear: "var(--color-brand-400)",
    roof: "var(--color-brand-600)",
    gable: "var(--color-brand-700)",
    smallRoof: "var(--color-brand-400)",
    smallWall: "var(--color-surface)",
    smallWallLine: "var(--color-brand-200)",
    glow: "var(--color-accent-200)",
    door: "var(--color-accent-400)",
    path: "var(--color-brand-100)",
    bird: "var(--color-brand-300)",
  },
  dark: {
    sun: "rgb(255 255 255 / 0.14)",
    sunRing: "rgb(255 255 255 / 0.06)",
    farHill: "rgb(255 255 255 / 0.05)",
    midHill: "rgb(255 255 255 / 0.09)",
    ground: "rgb(255 255 255 / 0.06)",
    groundLine: "rgb(255 255 255 / 0.16)",
    pineFar: "rgb(255 255 255 / 0.14)",
    pineNear: "rgb(255 255 255 / 0.22)",
    roof: "var(--color-surface)",
    gable: "var(--color-brand-200)",
    smallRoof: "rgb(255 255 255 / 0.5)",
    smallWall: "rgb(255 255 255 / 0.16)",
    smallWallLine: "rgb(255 255 255 / 0.22)",
    glow: "var(--color-accent-200)",
    door: "var(--color-accent-400)",
    path: "rgb(255 255 255 / 0.1)",
    bird: "rgb(255 255 255 / 0.4)",
  },
};

function Pine({ x, base, height, fill }: { x: number; base: number; height: number; fill: string }) {
  const w = height * 0.42;
  return (
    <g fill={fill}>
      <path d={`M${x} ${base - height} L${x + w} ${base - height * 0.38} H${x - w} Z`} />
      <path d={`M${x} ${base - height * 0.72} L${x + w * 1.2} ${base} H${x - w * 1.2} Z`} />
    </g>
  );
}

export function HomestayScene({ className, tone = "light" }: { className?: string; tone?: keyof typeof TONES }) {
  const c = TONES[tone];
  // Unique ids so several scenes can share a page.
  const id = useId().replace(/:/g, "");
  const fadeX = `${id}-fade-x`;
  const fadeY = `${id}-fade-y`;
  return (
    <svg viewBox="0 0 320 150" fill="none" aria-hidden className={cn("h-auto w-full", className)}>
      {/* The landscape fades out at the sides and bottom, so the scene blends into any background. */}
      <defs>
        <linearGradient id={`${fadeX}-g`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#000" />
          <stop offset="0.14" stopColor="#fff" />
          <stop offset="0.86" stopColor="#fff" />
          <stop offset="1" stopColor="#000" />
        </linearGradient>
        <linearGradient id={`${fadeY}-g`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0.82" stopColor="#fff" />
          <stop offset="1" stopColor="#000" />
        </linearGradient>
        <mask id={fadeX} maskUnits="userSpaceOnUse" x="0" y="0" width="320" height="150">
          <rect width="320" height="150" fill={`url(#${fadeX}-g)`} />
        </mask>
        <mask id={fadeY} maskUnits="userSpaceOnUse" x="0" y="0" width="320" height="150">
          <rect width="320" height="150" fill={`url(#${fadeY}-g)`} />
        </mask>
      </defs>
      {/* Sky */}
      <circle cx="252" cy="40" r="22" fill={c.sunRing} />
      <circle cx="252" cy="40" r="13" fill={c.sun} />
      <path
        d="M82 40q4-4.5 8 0q4-4.5 8 0M104 30q3-3.5 6 0q3-3.5 6 0"
        stroke={c.bird}
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      <g mask={`url(#${fadeY})`}>
        <g mask={`url(#${fadeX})`}>
          {/* Hills */}
          <path d="M0 104c40-26 74-34 112-24s70 14 104-2 70-30 104-16v66H0Z" fill={c.farHill} />
          <path d="M0 118c46-16 90-20 134-12s88 10 122 0 46-12 64-8v52H0Z" fill={c.midHill} />

          {/* Pines behind the cottages */}
          <Pine x={44} base={128} height={34} fill={c.pineFar} />
          <Pine x={262} base={128} height={30} fill={c.pineFar} />
          <Pine x={238} base={128} height={44} fill={c.pineNear} />

          {/* Ground */}
          <path d="M0 128c70-4 250-4 320 0v22H0Z" fill={c.ground} />
          <path d="M8 128c90-3.5 214-3.5 304 0" stroke={c.groundLine} strokeWidth="1.5" strokeLinecap="round" />
        </g>

        {/* Small cottage */}
        <rect
          x="80"
          y="101"
          width="40"
          height="27"
          rx="1.5"
          fill={c.smallWall}
          stroke={c.smallWallLine}
          strokeWidth="1.5"
        />
        <path d="M74 103 100 83l26 20" fill={c.smallRoof} />
        <rect x="88" y="109" width="9" height="9" rx="1.5" fill={c.glow} />
        <rect x="104" y="111" width="8" height="17" rx="1" fill={c.smallWallLine} />

        {/* A-frame cottage */}
        <path d="M128 128 172 46l44 82Z" fill={c.roof} />
        <path d="M144 128 172 76l28 52Z" fill={c.gable} />
        <circle cx="172" cy="96" r="5.5" fill={c.glow} />
        <path d="M164 128v-11a8 8 0 0 1 16 0v11Z" fill={c.door} />
        {/* Light spilling onto the path */}
        <path d="M172 129c-3 7-10 13-22 21h20c5-7 7-14 6-21Z" fill={c.path} />

        <Pine x={292} base={130} height={26} fill={c.pineNear} />
      </g>
    </svg>
  );
}

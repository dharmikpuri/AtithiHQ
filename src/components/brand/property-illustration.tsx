import type { ReactNode } from "react";
import type { PropertyType } from "@/domain/property-types";
import { cn } from "@/lib/cn";

/**
 * One small illustration per kind of property, in the brand's style: navy roofs, light walls,
 * a terracotta door. Drawn on a 64-unit grid with simple shapes so they read from 32px up.
 * Used wherever the property appears: the sidebar card, Settings, registration and the guest link.
 */
const ART: Record<PropertyType, ReactNode> = {
  // A family home: gable roof, chimney, door and two windows.
  homestay: (
    <>
      <circle cx="50" cy="15" r="4.5" className="fill-warning-500/70" />
      <rect x="40" y="18" width="4.5" height="9" rx="1" className="fill-brand-700" />
      <rect x="18" y="31" width="28" height="21" className="fill-brand-200" />
      <path
        d="M13 33 32 16l19 17Z"
        strokeLinejoin="round"
        strokeWidth="2.5"
        className="fill-brand-600 stroke-brand-600"
      />
      <rect x="21" y="36" width="6" height="6" rx="1.2" className="fill-surface" />
      <rect x="37" y="36" width="6" height="6" rx="1.2" className="fill-surface" />
      <path d="M28 52v-8.5a4 4 0 0 1 8 0V52Z" className="fill-accent-400" />
      <circle cx="11" cy="49" r="3.5" className="fill-success-500" />
    </>
  ),
  // A two-storey villa with flat roofs, wide glass and a pool.
  villa: (
    <>
      <rect x="10" y="34" width="34" height="18" className="fill-brand-200" />
      <rect x="16" y="23" width="24" height="11" className="fill-brand-100" />
      <rect x="14" y="20.5" width="28" height="3.5" rx="1.2" className="fill-brand-600" />
      <rect x="8" y="31.5" width="38" height="3.5" rx="1.2" className="fill-brand-600" />
      <rect x="20" y="26" width="16" height="5" rx="1" className="fill-surface" />
      <rect x="14" y="39" width="10" height="6" rx="1" className="fill-surface" />
      <rect x="29" y="41" width="7" height="11" rx="1" className="fill-accent-400" />
      <rect x="44" y="45" width="14" height="7" rx="2" className="fill-sea-100" />
      <path
        d="M46.5 48.5q1.5-1.4 3 0t3 0 3 0"
        fill="none"
        strokeWidth="1.2"
        strokeLinecap="round"
        className="stroke-sea-700"
      />
      <path
        d="M53 45c-.5-6 .5-11 1.5-15"
        fill="none"
        strokeWidth="1.8"
        strokeLinecap="round"
        className="stroke-brand-700"
      />
      <path
        d="M54.5 30c-3-2.5-6.5-2-8 0 2.5-.5 5 0 8 0Zm0 0c2-3 5.5-3.5 7.5-1.5-2.5 0-5 .5-7.5 1.5Zm0 0c-1-3.5.5-6.5 3-7.5-1.5 2-2.5 4.5-3 7.5Z"
        className="fill-success-500"
      />
    </>
  ),
  // A narrow three-storey guest house with an awning and a hanging sign.
  guest_house: (
    <>
      <rect x="18" y="15" width="26" height="37" className="fill-brand-200" />
      <rect x="16" y="12" width="30" height="4.5" rx="1.2" className="fill-brand-600" />
      <rect x="22" y="20" width="6" height="6.5" rx="1.2" className="fill-surface" />
      <rect x="34" y="20" width="6" height="6.5" rx="1.2" className="fill-surface" />
      <rect x="22" y="30" width="6" height="6.5" rx="1.2" className="fill-surface" />
      <rect x="34" y="30" width="6" height="6.5" rx="1.2" className="fill-surface" />
      <path d="M17 40h28l-2.5 5h-23Z" className="fill-accent-400" />
      <rect x="27" y="45" width="8" height="7" className="fill-brand-600" />
      <path d="M44 31h7" fill="none" strokeWidth="1.5" strokeLinecap="round" className="stroke-brand-700" />
      <rect x="46" y="33" width="9" height="7" rx="1.5" className="fill-warning-500" />
      <path d="M47.5 33v-2M53.5 33v-2" fill="none" strokeWidth="1" className="stroke-brand-700" />
    </>
  ),
  // An A-frame cottage among trees, with a fence: farm and nature stays.
  cottage: (
    <>
      <circle cx="13" cy="15" r="4" className="fill-warning-500/70" />
      <path
        d="M11 52 27 21l16 31Z"
        strokeLinejoin="round"
        strokeWidth="2"
        className="fill-brand-600 stroke-brand-600"
      />
      <path d="M17.5 52 27 33.5 36.5 52Z" className="fill-brand-200" />
      <path d="M24 52v-6a3 3 0 0 1 6 0v6Z" className="fill-accent-400" />
      <rect x="50.5" y="41" width="2.5" height="11" rx="1" className="fill-brand-700" />
      <circle cx="51.75" cy="36" r="7" className="fill-success-500" />
      <path
        d="M44 47h15M44 50.5h15M45.5 45v7M50 45v7M57.5 45v7"
        fill="none"
        strokeWidth="1.3"
        strokeLinecap="round"
        className="stroke-brand-400"
      />
    </>
  ),
  // A bunk bed with a ladder: beds and dorms.
  hostel: (
    <>
      <rect x="13" y="14" width="3.5" height="38" rx="1.2" className="fill-brand-600" />
      <rect x="47.5" y="14" width="3.5" height="38" rx="1.2" className="fill-brand-600" />
      <rect x="16.5" y="25" width="31" height="3" className="fill-brand-600" />
      <rect x="16.5" y="44" width="31" height="3" className="fill-brand-600" />
      <rect x="16.5" y="19.5" width="31" height="5.5" rx="1.5" className="fill-brand-200" />
      <rect x="16.5" y="38.5" width="31" height="5.5" rx="1.5" className="fill-brand-200" />
      <rect x="18.5" y="16.5" width="9" height="4" rx="2" className="fill-surface" />
      <rect x="18.5" y="35.5" width="9" height="4" rx="2" className="fill-surface" />
      <path d="M33 19.5h14.5v5.5H33Z" className="fill-accent-400" />
      <path d="M33 38.5h14.5V44H33Z" className="fill-accent-300" />
      <path
        d="M53 18v34M57 18v34M53 24h4M53 31h4M53 38h4M53 45h4"
        fill="none"
        strokeWidth="1.4"
        strokeLinecap="round"
        className="stroke-brand-400"
      />
    </>
  ),
};

/**
 * The illustration for a property type. `framed` sets it on a soft rounded tile; turn it off
 * when the surrounding surface already provides one. Decorative: pair it with the property's name.
 */
export function PropertyIllustration({
  type,
  framed = true,
  className,
}: {
  type: PropertyType;
  framed?: boolean;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden className={cn("size-12 shrink-0", className)}>
      {framed && <rect width="64" height="64" rx="16" className="fill-brand-50" />}
      <rect x="6" y="52" width="52" height="2.5" rx="1.25" className="fill-brand-200" />
      {ART[type]}
    </svg>
  );
}

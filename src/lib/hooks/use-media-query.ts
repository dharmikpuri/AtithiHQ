"use client";

import { useSyncExternalStore } from "react";

/** Breakpoints matching Tailwind's defaults. */
const BREAKPOINTS = {
  md: "(min-width: 768px)",
  lg: "(min-width: 1024px)",
} as const;

/**
 * Subscribes to a CSS media query. Renders as `false` on the server,
 * matching the mobile-first layout.
 */
function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** Tablet and up get centred dialogs; phones get bottom sheets. */
export function useIsDesktopLayout() {
  return useMediaQuery(BREAKPOINTS.md);
}

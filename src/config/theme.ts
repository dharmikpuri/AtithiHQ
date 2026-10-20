/**
 * Brand colours for places CSS can't reach: the browser theme colour, the web app
 * manifest, generated icons and the social sharing image.
 * These mirror tokens in `src/app/globals.css`. Change both together.
 * Every hex value used outside CSS lives in this file.
 *
 * Keep this file free of imports: `scripts/brand-assets.mjs` loads it directly with Node.
 */
export const themeColors = {
  /** --color-canvas */
  canvas: "#f6f7f9",
  /** --color-surface */
  surface: "#ffffff",
  /** --color-ink */
  ink: "#1a1d24",
  /** --color-brand-100 */
  brand100: "#e1e8f2",
  /** --color-brand-200 */
  brand200: "#c3d0e5",
  /** --color-brand-500 */
  brand500: "#46659e",
  /** --color-brand-600 — the primary brand colour */
  brand: "#304e85",
  /** --color-brand-700 */
  brand700: "#273f6d",
  /** --color-brand-800 */
  brand800: "#1f3256",
  /** --color-brand-950 */
  brand950: "#0f1a2d",
  /** --color-accent-400 — the guest in the logo */
  accent400: "#e07f55",
  /** --color-accent-500 */
  accent500: "#cc6238",
  /** --color-success-50 */
  success50: "#edf7f1",
  /** --color-success-100 */
  success100: "#d5eedf",
  /** --color-success-700 */
  success700: "#176b45",
} as const;

/** Colour sets for the logo mark (tile, the roof, the guest) in generated assets. */
export const markColors = {
  /** Navy tile — the default on light backgrounds. */
  brand: { tile: themeColors.brand, roof: themeColors.surface, guest: themeColors.accent400 },
  /** White tile — for navy and dark backgrounds. */
  inverted: { tile: themeColors.surface, roof: themeColors.brand, guest: themeColors.accent500 },
} as const;

/**
 * The AtithiHQ mark: a lowercase "a" drawn as a home with a guest inside.
 * - The stroke is a soft pointed roof that runs down into the stem of the "a".
 * - The terracotta circle is the bowl of the "a", and the guest at home underneath the roof.
 *
 * This is the single source of the mark's geometry (its colours live in `config/theme.ts`). The React logo
 * (`logo.tsx`) and the generated favicon, home-screen icons and social image
 * (`npm run brand`) all read from here. Design notes: /design/logo-concepts-v4.html (option 2, "Gable").
 *
 * Keep this file free of imports: `scripts/brand-assets.mjs` loads it directly with Node.
 */

/** Drawn on a 48 × 48 grid. */
export const MARK_GRID = 48;

/** Corner radius of the tile at 48 units (25%). */
export const MARK_TILE_RADIUS = 12;

export const MARK_PATHS = {
  /**
   * The roof and the stem of the "a", drawn in the foreground colour. It is the outline of a 6.6-unit
   * stroke with round ends (M14.4 20.2 24 10.6l9.6 9.6v17.6), kept as a fill so it renders the same everywhere.
   */
  roof: "M12.066 17.866 21.666 8.266a3.3 3.3 0 0 1 4.668 0l9.6 9.6a3.3 3.3 0 0 1 .966 2.334V37.8a3.3 3.3 0 0 1-6.6 0V21.568L24 15.268l-7.266 7.266a3.3 3.3 0 0 1-4.668-4.668Z",
  /** The guest: the bowl of the "a". Drawn in the guest colour. */
  guest: "M14.2 31a7.2 7.2 0 1 0 14.4 0 7.2 7.2 0 1 0-14.4 0Z",
} as const;

export interface MarkColors {
  tile: string;
  roof: string;
  guest: string;
}

/**
 * The mark as an SVG string.
 * `padding` (in grid units) shrinks the artwork inside the tile, e.g. for maskable icons
 * whose edges get cropped by the operating system.
 */
export function markSvg({
  colors,
  size = MARK_GRID,
  radius = MARK_TILE_RADIUS,
  padding = 0,
}: {
  colors: MarkColors;
  size?: number;
  radius?: number;
  padding?: number;
}): string {
  const scale = (MARK_GRID - padding * 2) / MARK_GRID;
  const art =
    `<path fill="${colors.roof}" d="${MARK_PATHS.roof}"/>` + `<path fill="${colors.guest}" d="${MARK_PATHS.guest}"/>`;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${MARK_GRID} ${MARK_GRID}">` +
    `<rect width="${MARK_GRID}" height="${MARK_GRID}" rx="${radius}" fill="${colors.tile}"/>` +
    (padding ? `<g transform="translate(${padding} ${padding}) scale(${scale})">${art}</g>` : art) +
    `</svg>`
  );
}

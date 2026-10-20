import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { MARK_GRID, MARK_PATHS, MARK_TILE_RADIUS } from "@/components/brand/mark";
import { site } from "@/config/site";
import { markColors, themeColors } from "@/config/theme";
import { getCopy } from "@/content";

/**
 * The card shown when the site is shared on WhatsApp, LinkedIn, X and in search previews.
 * Built from the logo geometry, brand colours and home page copy, and rendered once at build time.
 */
export const alt = getCopy().home.meta.ogAlt;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const font = (weight: number) =>
  readFile(join(process.cwd(), `node_modules/@fontsource/inter/files/inter-latin-${weight}-normal.woff`));

function Mark({ size: px }: { size: number }) {
  const colors = markColors.inverted;
  return (
    <svg width={px} height={px} viewBox={`0 0 ${MARK_GRID} ${MARK_GRID}`}>
      <rect width={MARK_GRID} height={MARK_GRID} rx={MARK_TILE_RADIUS} fill={colors.tile} />
      <path d={MARK_PATHS.roof} fill={colors.roof} />
      <path d={MARK_PATHS.guest} fill={colors.guest} />
    </svg>
  );
}

function Check() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="11" fill={themeColors.success100} />
      <path
        d="m7.5 12.2 3 3 6-6.4"
        fill="none"
        stroke={themeColors.success700}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default async function OpenGraphImage() {
  const { common, home } = getCopy();
  const visual = home.heroVisual;
  const host = new URL(site.url).host;
  const [regular, semibold, bold] = await Promise.all([font(400), font(600), font(700)]);

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        padding: "64px 72px",
        fontFamily: "Inter",
        color: "white",
        backgroundColor: themeColors.brand950,
        backgroundImage: `radial-gradient(circle at 88% 8%, ${themeColors.brand500} 0%, ${themeColors.brand800} 38%, ${themeColors.brand950} 78%)`,
      }}
    >
      {/* Left: brand and message */}
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 640 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Mark size={56} />
          <div style={{ display: "flex", fontSize: 34, fontWeight: 700, letterSpacing: "-0.025em" }}>
            {site.name.slice(0, -2)}
            <span style={{ color: themeColors.brand200 }}>{site.name.slice(-2)}</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ display: "flex", fontSize: 66, fontWeight: 700, lineHeight: 1.04, letterSpacing: "-0.035em" }}>
            {common.tagline}
          </div>
          <div style={{ display: "flex", fontSize: 27, lineHeight: 1.4, color: "rgba(255,255,255,0.74)" }}>
            {home.meta.ogSubtitle}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 22, fontWeight: 600 }}>
          <div
            style={{
              display: "flex",
              padding: "8px 18px",
              borderRadius: 999,
              backgroundColor: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.18)",
            }}
          >
            {home.hero.eyebrow}
          </div>
          <div style={{ display: "flex", color: "rgba(255,255,255,0.6)", fontWeight: 400 }}>{host}</div>
        </div>
      </div>

      {/* Right: a guest list filling itself */}
      <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "flex-end" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: 372,
            padding: 28,
            gap: 18,
            borderRadius: 28,
            backgroundColor: themeColors.surface,
            color: themeColors.ink,
            boxShadow: "0 30px 60px -20px rgba(0,0,0,0.5)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", fontSize: 24, fontWeight: 600 }}>{visual.cardTitle}</div>
            <div
              style={{
                display: "flex",
                fontSize: 17,
                fontWeight: 600,
                color: themeColors.success700,
                backgroundColor: themeColors.success50,
                padding: "5px 12px",
                borderRadius: 999,
              }}
            >
              {visual.allIn}
            </div>
          </div>
          {visual.guests.map((name) => (
            <div key={name} style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div
                style={{
                  display: "flex",
                  width: 44,
                  height: 44,
                  borderRadius: 999,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: themeColors.brand100,
                  color: themeColors.brand700,
                  fontSize: 17,
                  fontWeight: 600,
                }}
              >
                {name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")}
              </div>
              <div style={{ display: "flex", flex: 1, fontSize: 21 }}>{name}</div>
              <Check />
            </div>
          ))}
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: "Inter", data: regular, weight: 400, style: "normal" },
        { name: "Inter", data: semibold, weight: 600, style: "normal" },
        { name: "Inter", data: bold, weight: 700, style: "normal" },
      ],
    },
  );
}

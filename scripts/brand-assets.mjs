#!/usr/bin/env node
/**
 * Generates the favicon and home-screen icons from the logo geometry.
 *
 *   npm run brand
 *
 * Source of truth: src/components/brand/mark.ts (shape) and src/config/theme.ts (colours).
 * Output (commit these files, don't edit them by hand):
 *   src/app/icon.svg           favicon for modern browsers
 *   src/app/favicon.ico        favicon for older browsers and crawlers (16/32/48 px)
 *   src/app/apple-icon.png     iPhone / iPad home screen (180 px, full-bleed — iOS rounds it)
 *   public/icons/icon-192.png  Android / installed web app
 *   public/icons/icon-512.png
 *   public/icons/maskable-512.png  Android adaptive icon (art kept inside the safe zone)
 *
 * The social sharing image is generated in code: src/app/opengraph-image.tsx.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { chromium } from "playwright";
import { markSvg } from "../src/components/brand/mark.ts";
import { markColors } from "../src/config/theme.ts";

const browser = await chromium.launch();
const page = await browser.newPage();

/** Rasterises an SVG string to a PNG buffer at `size` × `size`. */
async function png(svg, size) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(
    `<html><body style="margin:0;background:transparent">${svg.replace(/width="\d+" height="\d+"/, `width="${size}" height="${size}"`)}</body></html>`,
  );
  return page.locator("svg").screenshot({ omitBackground: true });
}

/** Packs PNG images into a .ico container (PNG-in-ICO is supported by every current browser). */
function ico(images) {
  const header = Buffer.alloc(6 + images.length * 16);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach(({ size, data }, i) => {
    const entry = 6 + i * 16;
    header.writeUInt8(size >= 256 ? 0 : size, entry);
    header.writeUInt8(size >= 256 ? 0 : size, entry + 1);
    header.writeUInt8(0, entry + 2);
    header.writeUInt8(0, entry + 3);
    header.writeUInt16LE(1, entry + 4);
    header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(data.length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += data.length;
  });
  return Buffer.concat([header, ...images.map((image) => image.data)]);
}

function write(path, data) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, data);
  console.log("wrote", path);
}

const colors = markColors.brand;
const rounded = markSvg({ colors });
const square = markSvg({ colors, radius: 0 });
const maskable = markSvg({ colors, radius: 0, padding: 6 });

write("src/app/icon.svg", `${rounded}\n`);
const favicons = [];
for (const size of [16, 32, 48]) favicons.push({ size, data: await png(rounded, size) });
write("src/app/favicon.ico", ico(favicons));
write("src/app/apple-icon.png", await png(square, 180));
write("public/icons/icon-192.png", await png(rounded, 192));
write("public/icons/icon-512.png", await png(rounded, 512));
write("public/icons/maskable-512.png", await png(maskable, 512));

await browser.close();
console.log(`Brand colours: tile ${colors.tile}, guest ${colors.guest}`);

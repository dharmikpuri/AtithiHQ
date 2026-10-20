#!/usr/bin/env node
/**
 * Visual QA helper: captures a route at phone, tablet and desktop sizes.
 *
 *   node scripts/screenshots.mjs --route /bookings --name bookings --auth demo
 *   node scripts/screenshots.mjs --route /login --viewports mobile,desktop --full
 *   node scripts/screenshots.mjs --route /bookings/new --steps "click:text=Airbnb;;wait:300"
 *
 * Full-page captures (--full) emulate "reduced motion", so scroll-reveal sections are
 * shown as they look once scrolled into view. Pass --motion to keep animations on.
 *
 * Steps (separated by ";;"):
 *   click:<selector>  fill:<selector>=><value>  type:<selector>=><value>  press:<key>  wait:<ms>
 *   scroll:<px>       goto:<path>               hover:<selector>
 *   shot:<suffix>     (take an extra screenshot mid-flow)
 *
 * Output goes to .screenshots/<name>-<viewport>[-suffix].png
 * Browser console errors are printed so runtime problems surface.
 */
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright";

const VIEWPORTS = {
  mobile: { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  small: { width: 360, height: 740, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  tablet: { width: 820, height: 1180, deviceScaleFactor: 1, isMobile: true, hasTouch: true },
  desktop: { width: 1440, height: 900, deviceScaleFactor: 1 },
  wide: { width: 1920, height: 1080, deviceScaleFactor: 1 },
};

const SESSIONS = {
  demo: "+919352169357",
  new: "+919000000001",
};

function parseArgs(argv) {
  const args = {
    route: "/",
    name: "",
    viewports: "mobile,tablet,desktop",
    auth: "none",
    full: false,
    steps: "",
    wait: 700,
    base: process.env.APP_URL ?? "http://localhost:3100",
  };
  for (let i = 0; i < argv.length; i++) {
    const key = argv[i].replace(/^--/, "");
    if (key === "full") args.full = true;
    else if (key === "motion") args.motion = true;
    else args[key] = argv[++i];
  }
  args.name ||= args.route.replace(/^\//, "").replace(/\//g, "_") || "home";
  return args;
}

async function runStep(page, step, shoot) {
  const [action, ...rest] = step.split(":");
  const arg = rest.join(":");
  switch (action) {
    case "click":
      await page.locator(arg).first().click();
      break;
    case "hover":
      await page.locator(arg).first().hover();
      break;
    case "fill": {
      const [selector, ...value] = arg.split("=>");
      await page.locator(selector).first().fill(value.join("=>"));
      break;
    }
    case "type": {
      const [selector, ...value] = arg.split("=>");
      await page.locator(selector).first().pressSequentially(value.join("=>"), { delay: 20 });
      break;
    }
    case "press":
      await page.keyboard.press(arg);
      break;
    case "wait":
      await page.waitForTimeout(Number(arg));
      break;
    case "scroll":
      await page.mouse.wheel(0, Number(arg));
      await page.waitForTimeout(250);
      break;
    case "goto":
      await page.goto(new URL(arg, page.url()).toString(), { waitUntil: "networkidle" });
      break;
    case "shot":
      await shoot(arg);
      break;
    default:
      throw new Error(`Unknown step: ${step}`);
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const outDir = join(process.cwd(), ".screenshots");
  mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch();

  for (const viewportName of args.viewports.split(",")) {
    const viewport = VIEWPORTS[viewportName];
    if (!viewport) throw new Error(`Unknown viewport ${viewportName}`);
    const context = await browser.newContext({
      ...viewport,
      viewport: { width: viewport.width, height: viewport.height },
      locale: "en-IN",
      reducedMotion: args.full && !args.motion ? "reduce" : "no-preference",
    });
    if (SESSIONS[args.auth]) {
      await context.addCookies([
        { name: "atithi_session", value: encodeURIComponent(SESSIONS[args.auth]), url: args.base },
      ]);
    }
    const page = await context.newPage();
    page.on("console", (message) => {
      if (message.type() === "error") console.log(`[${viewportName}] console error: ${message.text()}`);
    });
    page.on("pageerror", (error) => console.log(`[${viewportName}] page error: ${error.message}`));

    const shoot = async (suffix = "") => {
      const file = join(outDir, `${args.name}-${viewportName}${suffix ? `-${suffix}` : ""}.png`);
      await page.screenshot({ path: file, fullPage: args.full });
      console.log(file);
    };

    await page.goto(new URL(args.route, args.base).toString(), { waitUntil: "networkidle" });
    await page.waitForTimeout(Number(args.wait));
    for (const step of args.steps
      .split(";;")
      .map((s) => s.trim())
      .filter(Boolean)) {
      await runStep(page, step, shoot);
    }
    await page.waitForTimeout(300);
    await shoot();
    await context.close();
  }
  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

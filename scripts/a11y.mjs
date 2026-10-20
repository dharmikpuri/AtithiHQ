#!/usr/bin/env node
/**
 * Accessibility audit (axe-core, WCAG 2.1 AA) of the main screens on a phone viewport.
 *
 *   node scripts/a11y.mjs                      # default route list
 *   node scripts/a11y.mjs /bookings /guests    # specific routes
 *
 * Exits non-zero when serious or critical violations are found.
 */
import AxeBuilder from "@axe-core/playwright";
import { chromium } from "playwright";

const BASE = process.env.APP_URL ?? "http://localhost:3100";
const DEMO_SESSION = encodeURIComponent("+919352169357");
/** A verified number with no registration yet: shows the registration form. */
const NEW_OWNER_SESSION = encodeURIComponent("+919000000001");
const SESSIONS = { demo: DEMO_SESSION, new: NEW_OWNER_SESSION };

const PUBLIC_PATHS = ["/", "/login", "/register", "/terms", "/privacy-policy"];
const PUBLIC = (path) => PUBLIC_PATHS.includes(path) || path.startsWith("/g/") || path.startsWith("/r/");
/** `false` (signed out), `"demo"` (registered owner) or `"new"` (verified, not registered). */
const authFor = (path) => (PUBLIC(path) ? false : path === "/setup" ? "new" : "demo");

const DEFAULT_ROUTES = [
  { path: "/", auth: false },
  // The home page is public; signed-in owners see account links of their own.
  { path: "/", auth: "demo" },
  { path: "/", auth: "new" },
  { path: "/login", auth: false },
  { path: "/register", auth: false },
  { path: "/setup", auth: "new" },
  { path: "/terms", auth: false },
  { path: "/bookings", auth: "demo" },
  { path: "/bookings?view=upcoming", auth: "demo" },
  { path: "/bookings/new", auth: "demo" },
  { path: "/bookings/bk_emma", auth: "demo" },
  { path: "/guests", auth: "demo" },
  { path: "/guests/g_emma", auth: "demo" },
  { path: "/payments", auth: "demo" },
  { path: "/settings", auth: "demo" },
  { path: "/g/q7k2mxa4pr", auth: false },
  // Shared receipt links (demo tokens from the seed): a valid one and an expired one.
  { path: "/r/rcpdemo7k2m", auth: false },
  { path: "/r/rcpold9x3q", auth: false },
];

const routes = process.argv.slice(2).length
  ? process.argv.slice(2).map((path) => ({ path, auth: authFor(path) }))
  : DEFAULT_ROUTES;

const browser = await chromium.launch();
let serious = 0;

for (const route of routes) {
  // Reduced motion: entrance animations would otherwise be audited mid-fade.
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: "reduce",
  });
  if (route.auth) await context.addCookies([{ name: "atithi_session", value: SESSIONS[route.auth], url: BASE }]);
  const page = await context.newPage();
  await page.goto(new URL(route.path, BASE).toString(), { waitUntil: "networkidle" });
  await page.waitForTimeout(800);

  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    // The Next.js dev indicator is not part of the product.
    .exclude("nextjs-portal")
    .analyze();

  const issues = results.violations;
  const who = route.path === "/" && route.auth ? ` (signed in: ${route.auth})` : "";
  console.log(`\n${route.path}${who} — ${issues.length ? `${issues.length} issue(s)` : "no issues"}`);
  for (const issue of issues) {
    if (issue.impact === "serious" || issue.impact === "critical") serious += 1;
    console.log(`  [${issue.impact}] ${issue.id}: ${issue.help}`);
    for (const node of issue.nodes.slice(0, 4)) {
      console.log(`      ${node.target.join(" ")}  ${node.failureSummary?.split("\n")[1]?.trim() ?? ""}`);
    }
  }
  await context.close();
}

await browser.close();
if (serious) {
  console.log(`\n${serious} serious/critical issue type(s) found.`);
  process.exit(1);
}

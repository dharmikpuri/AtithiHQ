import { routes } from "@/config/routes";
import { absoluteUrl, site } from "@/config/site";
import { getCopy } from "@/content";
import { HOME_SECTIONS } from "@/lib/seo/structured-data";

/**
 * /llms.txt — a plain-language summary of the product for AI assistants (llmstxt.org).
 * Built from the home page copy at build time, so it always matches the site.
 */
export const dynamic = "force-static";

export function GET() {
  const { home, common } = getCopy();
  const page = (anchor: string) => `${absoluteUrl(routes.home)}#${anchor}`;
  const lines = [
    `# ${site.name}`,
    "",
    `> ${home.hero.lede}`,
    "",
    `${common.tagline} ${site.name} is made by ${site.company} for homestay owners and small guest houses in India.`,
    "",
    `## How it works (${page(HOME_SECTIONS.howItWorks)})`,
    "",
    ...home.how.steps.map((step, index) => `${index + 1}. **${step.title}.** ${step.body}`),
    "",
    "## Features",
    "",
    ...home.features.items.map((item) => `- **${item.title}:** ${item.body}`),
    "",
    `## Privacy (${page(HOME_SECTIONS.privacy)})`,
    "",
    ...home.privacy.points.map((point) => `- **${point.title}:** ${point.body}`),
    "",
    `## Frequently asked questions (${page(HOME_SECTIONS.faq)})`,
    "",
    ...home.faq.items.flatMap((item) => [`### ${item.question}`, "", item.answer, ""]),
    "## Links",
    "",
    `- [Home page](${absoluteUrl(routes.home)})`,
    `- [Sign in](${absoluteUrl(routes.login)})`,
    "",
  ];
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}

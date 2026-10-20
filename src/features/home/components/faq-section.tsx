import { ArrowRight, ChevronDown } from "lucide-react";
import { LogoMark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { getCopy } from "@/content";
import { HOME_SECTIONS } from "@/lib/seo/structured-data";
import { AccountLink } from "./account-link";
import { Container, Section, SectionHeader } from "./section";

const HEADING_ID = "faq-title";
const PANEL_HEADING_ID = "faq-panel-title";

/**
 * Native <details> disclosure: works without JavaScript, is keyboard-accessible, and keeps
 * every answer in the page for search engines and AI assistants. The same questions are
 * published as FAQPage structured data. Beside them, the way to get started.
 */
export function FaqSection() {
  const f = getCopy().home.faq;
  return (
    <Section id={HOME_SECTIONS.faq} labelledBy={HEADING_ID} tone="tint">
      <Container>
        <SectionHeader id={HEADING_ID} eyebrow={f.eyebrow} title={f.title} />
        <div className="mt-14 grid grid-cols-1 items-start gap-6 lg:grid-cols-[1.4fr_1fr] lg:gap-8">
          <div className="flex flex-col gap-3">
            {f.items.map((item, index) => (
              <details
                key={item.question}
                className="group rounded-2xl border border-brand-100 bg-surface shadow-card transition-shadow open:shadow-raised"
                open={index === 0}
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-2xl px-5 py-4.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-brand-500 sm:px-6 [&::-webkit-details-marker]:hidden">
                  <h3 className="text-headline text-ink">{item.question}</h3>
                  <ChevronDown
                    className="size-5 shrink-0 text-ink-2 transition-transform duration-200 group-open:rotate-180"
                    aria-hidden
                  />
                </summary>
                <p className="-mt-1 px-5 pb-5 text-callout text-pretty text-ink-2 sm:px-6">{item.answer}</p>
              </details>
            ))}
          </div>
          <GetStartedPanel />
        </div>
      </Container>
    </Section>
  );
}

function GetStartedPanel() {
  const p = getCopy().home.faq.panel;
  return (
    <aside
      aria-labelledby={PANEL_HEADING_ID}
      className="relative overflow-hidden rounded-4xl bg-brand-200/60 p-7 sm:p-9 lg:sticky lg:top-28"
    >
      <LogoMark className="size-12" />
      <h3 id={PANEL_HEADING_ID} className="mt-5 text-title-1 text-brand-950">
        {p.title}
      </h3>
      <p className="mt-2 text-callout text-ink-2">{p.body}</p>
      <ol className="mt-6 flex flex-col gap-3">
        {p.steps.map((step, index) => (
          <li key={step} className="flex items-center gap-3 rounded-2xl bg-surface px-4 py-3 shadow-card">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-600 text-footnote font-semibold text-white tabular">
              {index + 1}
            </span>
            <span className="text-callout font-medium text-ink">{step}</span>
          </li>
        ))}
      </ol>
      <Button asChild size="lg" fullWidth className="mt-7">
        <AccountLink intent="start" arrow>
          {p.cta}
          <ArrowRight />
        </AccountLink>
      </Button>
    </aside>
  );
}

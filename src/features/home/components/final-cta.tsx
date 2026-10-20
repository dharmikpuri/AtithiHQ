import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCopy } from "@/content";
import { HOME_SECTIONS } from "@/lib/seo/structured-data";
import { AccountLink } from "./account-link";
import { Container } from "./section";

const HEADING_ID = "cta-title";

/** Full-width navy band that closes the page. */
export function FinalCta() {
  const c = getCopy().home.finalCta;
  return (
    <section aria-labelledby={HEADING_ID} className="relative overflow-hidden bg-brand-950 py-24 text-center sm:py-28">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(60%_80%_at_50%_0%,var(--color-brand-700),transparent)]"
      />
      {/* Two faint rooflines, as in the hero */}
      <svg
        aria-hidden
        viewBox="0 0 1440 600"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 size-full text-white/8"
      >
        <path d="M-120 700 720 140l840 560" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M-120 840 720 280l840 560" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </svg>

      <Container className="relative flex max-w-3xl flex-col items-center gap-5">
        <h2 id={HEADING_ID} className="text-title-1 text-balance text-white sm:text-large-title lg:text-display-lg">
          {c.title}
        </h2>
        <p className="text-body text-white/75 sm:text-lead">{c.body}</p>
        <div className="mt-4 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
          <Button asChild size="xl" variant="inverse" fullWidth className="sm:w-auto">
            <AccountLink intent="start" arrow>
              {c.cta}
              <ArrowRight />
            </AccountLink>
          </Button>
          <Button
            asChild
            size="xl"
            variant="ghost"
            fullWidth
            className="text-white hover:bg-white/10 hover:text-white active:bg-white/15 sm:w-auto"
          >
            <a href={`#${HOME_SECTIONS.howItWorks}`}>{c.secondary}</a>
          </Button>
        </div>
      </Container>
    </section>
  );
}

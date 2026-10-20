import {
  ArrowRight,
  CircleHelp,
  House,
  IdCard,
  IndianRupee,
  MessageCircle,
  MountainSnow,
  PlayCircle,
  Smartphone,
  TreePine,
  Waves,
} from "lucide-react";
import type { CSSProperties } from "react";
import { duotone } from "@/components/ui/icon-tile";
import { Button } from "@/components/ui/button";
import { getCopy } from "@/content";
import { cn } from "@/lib/cn";
import { HOME_SECTIONS } from "@/lib/seo/structured-data";
import { AccountLink } from "./account-link";
import { HeroVisual } from "./hero-visual";
import { Container } from "./section";

const delay = (seconds: number): CSSProperties => ({ animationDelay: `${seconds}s` });

/** Kinds of stay in the proof pill: hills, sea, forest, town. */
const PROOF = [
  { icon: MountainSnow, tone: "bg-brand-50 text-brand-600" },
  { icon: Waves, tone: "bg-sea-100 text-sea-700" },
  { icon: TreePine, tone: "bg-success-50 text-success-700" },
  { icon: House, tone: "bg-accent-50 text-accent-600" },
];

export function Hero() {
  const h = getCopy().home.hero;
  const links = [
    { href: `#${HOME_SECTIONS.howItWorks}`, label: h.links.link, icon: MessageCircle },
    { href: `#${HOME_SECTIONS.guests}`, label: h.links.form, icon: Smartphone },
    { href: `#${HOME_SECTIONS.features}`, label: h.links.payments, icon: IndianRupee },
    { href: `#${HOME_SECTIONS.privacy}`, label: h.links.privacy, icon: IdCard },
    { href: `#${HOME_SECTIONS.faq}`, label: h.links.faq, icon: CircleHelp },
  ];

  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden bg-surface">
      <HeroBackdrop />

      <Container className="relative flex flex-col items-center pt-14 pb-20 text-center sm:pt-20 lg:pt-24 lg:pb-28">
        <h1 id="hero-title" className="animate-enter text-display text-balance text-ink sm:text-display-lg">
          {h.title.map((line) => (
            <span key={line.lead} className="block">
              {line.lead}
              {line.accent && (
                <>
                  {" "}
                  <span className="text-brand-600">{line.accent}</span>
                </>
              )}
            </span>
          ))}
        </h1>

        <p
          className="mt-8 inline-flex animate-enter items-center gap-3 rounded-full border border-line bg-surface py-1.5 pr-4 pl-1.5 text-left shadow-raised"
          style={delay(0.1)}
        >
          <span className="flex shrink-0 -space-x-2">
            {PROOF.map(({ icon: Icon, tone }, index) => (
              <span
                key={index}
                className={cn("flex size-8 items-center justify-center rounded-full ring-2 ring-surface", tone)}
              >
                <Icon className="size-4" aria-hidden {...duotone} />
              </span>
            ))}
          </span>
          <span className="text-footnote font-medium text-ink-2">{h.proof}</span>
        </p>

        <p className="mt-7 max-w-2xl animate-enter text-body text-pretty text-ink-2 sm:text-lead" style={delay(0.18)}>
          {h.lede}
        </p>

        <div
          className="mt-9 flex w-full animate-enter flex-col-reverse gap-3 sm:w-auto sm:flex-row"
          style={delay(0.26)}
        >
          <Button asChild size="xl" variant="secondary">
            <a href={`#${HOME_SECTIONS.howItWorks}`}>
              <PlayCircle className="text-brand-600" {...duotone} />
              {h.secondaryCta}
            </a>
          </Button>
          <Button asChild size="xl">
            <AccountLink intent="start" arrow>
              {h.primaryCta}
              <ArrowRight />
            </AccountLink>
          </Button>
        </div>

        <nav aria-label={h.links.label} className="mt-10 animate-enter" style={delay(0.34)}>
          <ul className="flex flex-wrap justify-center gap-x-7 gap-y-3">
            {links.map(({ href, label, icon: Icon }) => (
              <li key={href + label}>
                <a
                  href={href}
                  className="inline-flex items-center gap-2 rounded-lg text-callout font-medium text-ink-2 transition-colors hover:text-brand-700"
                >
                  <Icon className="size-5 text-brand-600" aria-hidden {...duotone} />
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <HeroVisual />
      </Container>
    </section>
  );
}

/** A soft tint and two oversized rooflines, echoing the logo's roof. */
function HeroBackdrop() {
  return (
    <>
      <div aria-hidden className="absolute inset-0 bg-linear-to-b from-brand-50 via-surface to-surface" />
      <svg
        aria-hidden
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMin slice"
        className="absolute inset-x-0 top-0 h-240 w-full text-brand-100"
      >
        <path d="M-120 1000 720 420l840 580" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M-120 1140 720 560l840 580" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
      </svg>
    </>
  );
}

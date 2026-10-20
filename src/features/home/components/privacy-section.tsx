import { EyeOff, IdCard, KeyRound, Lock, MessageCircleOff, ShieldCheck, Timer, type LucideIcon } from "lucide-react";
import { duotone, IconTile } from "@/components/ui/icon-tile";
import { getCopy } from "@/content";
import { HOME_SECTIONS } from "@/lib/seo/structured-data";
import { AccentHeading, Container, Eyebrow, FeatureRow, OffsetCard, Section } from "./section";

const HEADING_ID = "privacy-title";
const POINT_ICONS: LucideIcon[] = [EyeOff, Timer, KeyRound, MessageCircleOff];

export function PrivacySection() {
  const p = getCopy().home.privacy;
  return (
    <Section id={HOME_SECTIONS.privacy} labelledBy={HEADING_ID}>
      <Container>
        <FeatureRow reverse visual={<IdCardVisual />}>
          <Eyebrow>{p.eyebrow}</Eyebrow>
          <AccentHeading id={HEADING_ID} lead={p.heading.lead} accent={p.heading.accent} />
          <p className="text-body text-pretty text-ink-2 sm:text-lead">{p.lede}</p>
          <ul className="mt-4 grid grid-cols-1 gap-x-8 gap-y-7 sm:grid-cols-2">
            {p.points.map((point, index) => (
              <li key={point.title} className="flex flex-col gap-2">
                <IconTile icon={POINT_ICONS[index]} />
                <h3 className="mt-1 text-headline text-ink">{point.title}</h3>
                <p className="text-callout text-ink-3">{point.body}</p>
              </li>
            ))}
          </ul>
        </FeatureRow>
      </Container>
    </Section>
  );
}

/** A masked ID with its deletion countdown: what the owner keeps, and for how long. */
function IdCardVisual() {
  const c = getCopy().home.privacy.card;
  return (
    <OffsetCard>
      <div className="relative mx-auto max-w-sm py-4">
        {/* Shield with a slow pulse: "protected" */}
        <div className="absolute -top-2 -right-2 z-10 flex size-16 items-center justify-center">
          <span className="absolute inset-0 animate-pulse-ring rounded-full bg-success-500/40" />
          <span className="relative flex size-14 items-center justify-center rounded-full bg-success-600 text-white shadow-raised ring-4 ring-surface">
            <ShieldCheck className="size-7" />
          </span>
        </div>

        <div className="relative -rotate-2 overflow-hidden rounded-3xl border border-line bg-surface p-5 text-ink shadow-glow">
          {/* A scan line passing over the card: the number is masked as it is read */}
          <span className="pointer-events-none absolute inset-x-0 top-0 h-10 animate-scan bg-linear-to-b from-transparent via-success-500/15 to-transparent [--scan-distance:16rem]">
            <span className="absolute inset-x-0 top-1/2 h-px bg-success-500/50" />
          </span>
          <div className="flex items-center gap-3">
            <IconTile icon={IdCard} size="lg" />
            <div>
              <p className="text-footnote font-semibold tracking-widest text-ink-3 uppercase">{c.type}</p>
              <p className="text-title-3 tracking-wider text-ink tabular">{c.number}</p>
            </div>
          </div>

          {/* Blurred photo placeholder */}
          <div className="mt-5 flex gap-3 rounded-2xl bg-subtle p-3">
            <span className="size-14 shrink-0 rounded-xl bg-linear-to-br from-brand-100 to-brand-200 blur-[2px]" />
            <span className="flex flex-1 flex-col justify-center gap-2">
              <span className="h-2 w-4/5 rounded-full bg-ink/10 blur-[1px]" />
              <span className="h-2 w-3/5 rounded-full bg-ink/10 blur-[1px]" />
              <span className="h-2 w-2/5 rounded-full bg-ink/10 blur-[1px]" />
            </span>
          </div>

          <ul className="mt-5 flex flex-col gap-2.5 text-subhead">
            <li className="flex items-center gap-2 text-success-700">
              <EyeOff className="size-4" {...duotone} />
              {c.masked}
            </li>
            <li className="flex items-center gap-2 text-ink-2">
              <Timer className="size-4 text-accent-600" {...duotone} />
              {c.deletes}
            </li>
            <li className="flex items-center gap-2 text-ink-2">
              <Lock className="size-4 text-brand-600" {...duotone} />
              {getCopy().home.guests.preview.privacy}
            </li>
          </ul>
        </div>
      </div>
    </OffsetCard>
  );
}

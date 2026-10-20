import { ArrowRight, House, Lock, MapPin, ShieldCheck, UsersRound, type LucideIcon } from "lucide-react";
import { HomestayScene } from "@/components/brand/homestay-scene";
import { IconTile } from "@/components/ui/icon-tile";
import { getCopy } from "@/content";
import { HOME_SECTIONS } from "@/lib/seo/structured-data";
import { PhoneFrame } from "./phone-frame";
import { AccentHeading, Container, Eyebrow, Section } from "./section";

const HEADING_ID = "guests-title";
const POINT_ICONS: LucideIcon[] = [House, UsersRound, ShieldCheck];

/** What the guest sees when they open the link — a faithful miniature of the real welcome screen. */
export function GuestPreview() {
  const g = getCopy().home.guests;
  const p = g.preview;

  return (
    <Section id={HOME_SECTIONS.guests} labelledBy={HEADING_ID} tone="tint" className="overflow-hidden">
      <Container className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2 lg:gap-20">
        <div className="flex flex-col items-start gap-5">
          <Eyebrow>{g.eyebrow}</Eyebrow>
          <AccentHeading id={HEADING_ID} lead={g.heading.lead} accent={g.heading.accent} />
          <p className="text-body text-pretty text-ink-2 sm:text-lead">{g.lede}</p>
          <ul className="mt-4 flex flex-col gap-6">
            {g.points.map((point, index) => {
              const Icon = POINT_ICONS[index];
              return (
                <li key={point.title} className="flex reveal gap-4">
                  <IconTile icon={Icon} size="lg" />
                  <div className="flex flex-col gap-0.5">
                    <h3 className="text-headline text-ink">{point.title}</h3>
                    <p className="text-callout text-ink-2">{point.body}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="relative mx-auto w-full max-w-lg reveal">
          {/* Navy block offset behind a soft panel, the same frame as the other showcases */}
          <div
            aria-hidden
            className="absolute inset-0 translate-x-3 translate-y-3 rounded-4xl bg-brand-900 sm:translate-x-5 sm:translate-y-5"
          />
          <div
            aria-hidden
            className="absolute inset-0 rounded-4xl border border-brand-900 bg-linear-to-b from-brand-100 to-surface"
          />
          <PhoneFrame label={g.previewLabel} className="relative mx-auto my-8 w-full max-w-[19rem] sm:my-10">
            <div className="flex flex-col items-center gap-2 bg-linear-to-b from-brand-50 to-surface px-5 pt-10 pb-1 text-center">
              <HomestayScene className="w-44" />
              <p className="text-headline text-ink">{p.property}</p>
              <p className="-mt-1.5 flex items-center gap-1 text-caption text-ink-3">
                <MapPin className="size-3" />
                {p.location}
              </p>
              <p className="-mt-1.5 text-caption text-ink-3">{p.host}</p>
            </div>
            <div className="flex flex-col gap-3 px-5 pt-3 pb-5">
              <p className="text-title-3 text-ink">{p.greeting}</p>
              <p className="text-caption text-ink-2">{p.body}</p>
              <dl className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-subtle text-caption">
                <div className="flex items-baseline justify-between gap-2 px-3 py-2">
                  <dt className="text-ink-3">{p.checkIn}</dt>
                  <dd className="text-right">
                    <span className="font-semibold text-ink">{p.checkInValue}</span>
                    <span className="block text-micro text-ink-3">{p.checkInTime}</span>
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-2 px-3 py-2">
                  <dt className="text-ink-3">{p.checkOut}</dt>
                  <dd className="text-right">
                    <span className="font-semibold text-ink">{p.checkOutValue}</span>
                    <span className="block text-micro text-ink-3">{p.checkOutTime}</span>
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-2 px-3 py-2">
                  <dt className="text-ink-3">{p.guests}</dt>
                  <dd className="font-semibold text-ink">{p.guestsValue}</dd>
                </div>
              </dl>
            </div>
            <div className="flex flex-col gap-2 border-t border-line px-5 pt-3 pb-5">
              <span className="relative flex h-10 items-center justify-center gap-1.5 overflow-hidden rounded-xl bg-brand-600 text-footnote font-semibold text-white">
                {/* A soft shine now and then, inviting the tap */}
                <span className="absolute inset-y-0 left-0 w-1/3 animate-shine bg-linear-to-r from-transparent via-white/30 to-transparent" />
                {p.start}
                <ArrowRight className="size-3.5" />
              </span>
              <p className="flex items-center justify-center gap-1 text-micro text-ink-3">
                <Lock className="size-3" />
                {p.privacy}
              </p>
            </div>
          </PhoneFrame>
        </div>
      </Container>
    </Section>
  );
}

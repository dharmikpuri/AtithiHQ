import { DoorOpen } from "lucide-react";
import Image from "next/image";
import Marquee from "react-fast-marquee";
import { IconTile } from "@/components/ui/icon-tile";
import { getCopy } from "@/content";
import { Container } from "./section";

const SOURCES_HEADING_ID = "sources-title";
const GLANCE_HEADING_ID = "glance-title";

/**
 * Booking platforms owners in India use, in brand colour. Files in /public/logos: full wordmarks
 * from Wikimedia Commons (MakeMyTrip, Agoda, Goibibo) and brand marks from Simple Icons (the rest),
 * shown next to the platform's name.
 */
const PLATFORMS: {
  name: string;
  src: string;
  /** Width ÷ height, for full wordmarks (shown without the name beside them). */
  wordmark?: number;
  /** Size override for logos that need more room. */
  imageClass?: string;
}[] = [
  { name: "Airbnb", src: "/logos/airbnb.svg" },
  { name: "Booking.com", src: "/logos/booking-com.svg" },
  { name: "MakeMyTrip", src: "/logos/makemytrip.svg", wordmark: 1558 / 496 },
  { name: "Agoda", src: "/logos/agoda.svg", wordmark: 140 / 72, imageClass: "h-9 w-auto" },
  { name: "Goibibo", src: "/logos/goibibo.svg", wordmark: 450 / 136.4 },
  { name: "Expedia", src: "/logos/expedia.svg" },
  { name: "Tripadvisor", src: "/logos/tripadvisor.svg" },
  // The OYO mark is its wordmark, so it stands alone.
  { name: "OYO", src: "/logos/oyo.svg", wordmark: 1, imageClass: "size-12" },
];

/** Logo height on the strip, in px. */
const LOGO_HEIGHT = 30;

/** Where bookings come from: platform logos running past on a tinted band. */
export function SourcesBand() {
  const s = getCopy().home.sources;
  return (
    <section aria-labelledby={SOURCES_HEADING_ID} className="border-y border-brand-100 bg-brand-50 py-14 sm:py-16">
      <Container className="flex flex-col items-center gap-2 text-center">
        <h2 id={SOURCES_HEADING_ID} className="text-title-2 text-balance text-brand-950 sm:text-title-1">
          {s.title}
        </h2>
        <p className="text-callout text-ink-2">{s.note}</p>
        <p className="sr-only">{[...PLATFORMS.map((platform) => platform.name), s.direct].join(", ")}</p>
      </Container>

      <div aria-hidden className="mt-10 mask-[linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
        <Marquee speed={36} pauseOnHover autoFill>
          {PLATFORMS.map((platform) => (
            <span
              key={platform.name}
              className="mx-2 flex h-18 items-center gap-2.5 rounded-2xl border border-brand-100 bg-surface px-7 shadow-card"
            >
              <Image
                src={platform.src}
                alt=""
                height={LOGO_HEIGHT}
                width={Math.round(LOGO_HEIGHT * (platform.wordmark ?? 1))}
                className={platform.imageClass ?? (platform.wordmark ? "h-7.5 w-auto" : "size-7")}
              />
              {!platform.wordmark && (
                <span className="text-title-3 tracking-tight whitespace-nowrap text-ink">{platform.name}</span>
              )}
            </span>
          ))}
          <span className="mx-2 flex h-18 items-center gap-2.5 rounded-2xl border border-brand-100 bg-surface px-7 shadow-card">
            <IconTile icon={DoorOpen} size="sm" />
            <span className="text-title-3 tracking-tight whitespace-nowrap text-ink">{s.direct}</span>
          </span>
        </Marquee>
      </div>
    </section>
  );
}

/** A few honest numbers about how the product works. */
export function GlanceBand() {
  const g = getCopy().home.glance;
  return (
    <section aria-labelledby={GLANCE_HEADING_ID} className="bg-brand-50 py-16 sm:py-20">
      <Container className="flex flex-col items-center gap-10">
        <h2 id={GLANCE_HEADING_ID} className="text-title-2 text-ink">
          {g.title}
        </h2>
        <dl className="grid w-full grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
          {g.items.map((item) => (
            <div key={item.value} className="flex flex-col-reverse items-center justify-end gap-2 text-center">
              <dt className="max-w-48 text-callout text-pretty text-ink-2 sm:text-body">{item.label}</dt>
              <dd className="text-display text-brand-950 tabular sm:text-display-lg">{item.value}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}

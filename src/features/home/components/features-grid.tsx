import {
  CalendarDays,
  CircleCheck,
  IdCard,
  IndianRupee,
  PencilLine,
  Smartphone,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import type { CSSProperties } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { surfaceStyles } from "@/components/ui/card";
import { IconTile } from "@/components/ui/icon-tile";
import { getCopy } from "@/content";
import { cn } from "@/lib/cn";
import { HOME_SECTIONS } from "@/lib/seo/structured-data";
import { Container, Section, SectionHeader } from "./section";
import { Replay, StoryLoop } from "./story-loop";

const HEADING_ID = "features-title";

/** Staggers a CSS entrance animation. */
const delay = (seconds: number): CSSProperties => ({ animationDelay: `${seconds}s` });

/** Icons in the same order as `home.features.items`. */
const FEATURE_ICONS: LucideIcon[] = [CalendarDays, IndianRupee, UsersRound, IdCard, PencilLine, Smartphone];

/**
 * The first three benefits get a large card with a miniature of the screen that delivers
 * them; the rest sit underneath as compact cards.
 */
export function FeaturesGrid() {
  const f = getCopy().home.features;
  const scenes = [<GlanceScene key="glance" />, <PaymentsScene key="payments" />, <GuestScene key="guest" />];
  const featured = f.items.slice(0, scenes.length);
  const more = f.items.slice(scenes.length);

  return (
    <Section id={HOME_SECTIONS.features} labelledBy={HEADING_ID}>
      <Container>
        <SectionHeader id={HEADING_ID} eyebrow={f.eyebrow} title={f.title} />

        <ul className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3 lg:gap-6">
          {featured.map((item, index) => (
            <li
              key={item.title}
              className="flex reveal flex-col overflow-hidden rounded-4xl border border-brand-100 bg-linear-to-b from-brand-50/70 to-surface"
            >
              <div className="flex flex-col items-center gap-3 px-6 pt-7 text-center">
                <IconTile icon={FEATURE_ICONS[index]} size="lg" />
                <h3 className="text-title-3 text-ink">{item.title}</h3>
                <p className="text-callout text-pretty text-ink-3">{item.body}</p>
              </div>
              <div aria-hidden inert className="mt-auto px-5 pt-7 pb-5">
                <StoryLoop className="rounded-3xl bg-brand-100 p-3">{scenes[index]}</StoryLoop>
              </div>
            </li>
          ))}
        </ul>

        <ul className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-3 lg:mt-6 lg:gap-6">
          {more.map((item, index) => (
            <li
              key={item.title}
              className={cn(
                surfaceStyles({ radius: "xl" }),
                "flex reveal flex-col gap-3 p-6 transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-raised",
              )}
            >
              <div className="flex items-center gap-3">
                <IconTile icon={FEATURE_ICONS[scenes.length + index]} />
                <h3 className="text-headline text-ink">{item.title}</h3>
              </div>
              <p className="text-callout text-ink-3">{item.body}</p>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}

/* ── Miniatures ─────────────────────────────────────────────────────────────── */

function GlanceScene() {
  const s = getCopy().home.features.scene;
  const rows = [
    { label: s.arriving, count: 2, dot: "bg-brand-500" },
    { label: s.staying, count: 1, dot: "bg-success-500" },
    { label: s.leaving, count: 1, dot: "bg-warning-500" },
  ];
  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-2 gap-1 rounded-xl bg-surface/70 p-1">
        <span className="rounded-lg bg-surface py-1.5 text-center text-caption font-semibold text-ink shadow-card">
          {s.today}
        </span>
        <span className="py-1.5 text-center text-caption font-medium text-ink-3">{s.upcoming}</span>
      </div>
      <Replay className="flex flex-col gap-2">
        {rows.map((row, index) => (
          <div
            key={row.label}
            className="flex animate-enter items-center gap-2.5 rounded-xl bg-surface px-3 py-2.5 shadow-card"
            style={delay(0.3 + index * 0.35)}
          >
            <span className={cn("size-2 rounded-full", row.dot)} />
            <span className="flex-1 text-footnote font-medium text-ink-2">{row.label}</span>
            <span
              className="animate-tick rounded-full bg-canvas px-2 text-caption font-semibold text-ink-2 tabular"
              style={delay(0.7 + index * 0.35)}
            >
              {row.count}
            </span>
          </div>
        ))}
      </Replay>
    </div>
  );
}

function PaymentsScene() {
  const s = getCopy().home.features.scene;
  return (
    <div className="flex flex-col gap-2">
      <div className="rounded-xl bg-surface p-3 shadow-card">
        <div className="flex items-baseline justify-between">
          <span className="text-caption text-ink-3">{s.total}</span>
          <span className="text-headline text-ink tabular">{s.totalValue}</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink/7">
          <Replay className="h-full w-7/12">
            <div className="h-full origin-left animate-fill rounded-full bg-success-500" style={delay(0.3)} />
          </Replay>
        </div>
        <div className="mt-2 flex justify-between text-caption">
          <span className="text-success-700">
            {s.received} {s.receivedValue}
          </span>
          <span className="font-semibold text-accent-700">
            {s.due} {s.dueValue}
          </span>
        </div>
      </div>
      {[
        { method: s.upi, value: s.upiValue },
        { method: s.cash, value: s.cashValue },
      ].map((entry, index) => (
        <Replay key={entry.method}>
          <div
            className="flex animate-enter items-center gap-2.5 rounded-xl bg-surface px-3 py-2 shadow-card"
            style={delay(0.5 + index * 0.45)}
          >
            <span className="flex size-6 items-center justify-center rounded-full bg-success-100 text-success-700">
              <IndianRupee className="size-3.5" />
            </span>
            <span className="flex-1 text-footnote font-medium text-ink-2">{entry.method}</span>
            <span className="text-footnote font-semibold text-ink tabular">{entry.value}</span>
          </div>
        </Replay>
      ))}
    </div>
  );
}

function GuestScene() {
  const t = getCopy();
  const s = t.home.features.scene;
  const name = t.home.heroVisual.guests[0];
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3 rounded-xl bg-surface p-3 shadow-card">
        <Avatar name={name} size="md" />
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-subhead font-semibold text-ink">{name}</p>
          <p className="text-caption text-ink-3 tabular">+91 98••• •••10</p>
        </div>
      </div>
      <div className="flex flex-col gap-2 rounded-xl bg-surface p-3 shadow-card">
        <Replay className="self-start">
          <span className="block animate-tick" style={delay(1.6)}>
            <Badge tone="brand" size="sm">
              <CircleCheck />
              {s.returning}
            </Badge>
          </span>
        </Replay>
        <p className="text-caption text-ink-3">{s.lastStay}</p>
        <div className="flex items-center gap-1.5 pt-1">
          {[0, 1, 2].map((visit) => (
            <span key={visit} className="flex flex-1 items-center gap-1.5">
              <Replay className="flex">
                <span
                  className={cn("size-2.5 animate-tick rounded-full", visit === 2 ? "bg-brand-600" : "bg-brand-300")}
                  style={delay(0.3 + visit * 0.5)}
                />
              </Replay>
              {visit < 2 && (
                <span className="h-0.5 flex-1 overflow-hidden rounded-full bg-brand-100">
                  <Replay className="h-full">
                    <span
                      className="block h-full origin-left animate-fill bg-brand-300"
                      style={{ ...delay(0.4 + visit * 0.5), animationDuration: "0.5s" }}
                    />
                  </Replay>
                </span>
              )}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

import {
  CalendarDays,
  CheckCheck,
  CircleCheck,
  Globe,
  History,
  IdCard,
  Inbox,
  IndianRupee,
  MessageCircle,
  Minus,
  Phone,
  PhoneCall,
  Plus,
  Smartphone,
  UserRoundCheck,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { LogoMark } from "@/components/brand/logo";
import { WhatsAppIcon } from "@/components/brand/whatsapp-icon";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { surfaceStyles } from "@/components/ui/card";
import { duotone, IconTile } from "@/components/ui/icon-tile";
import { getCopy } from "@/content";
import { DateTile } from "@/features/bookings/components/date-tile";
import { cn } from "@/lib/cn";
import { HOME_SECTIONS } from "@/lib/seo/structured-data";
import {
  AccentHeading,
  Container,
  Eyebrow,
  FeatureRow,
  OffsetCard,
  PointGrid,
  Section,
  SectionHeader,
} from "./section";
import { Replay, StoryLoop } from "./story-loop";

const HEADING_ID = "how-title";

/** Staggers a CSS entrance animation. */
const delay = (seconds: number): CSSProperties => ({ animationDelay: `${seconds}s` });

/** Sample stay shown in the step illustrations. */
const SAMPLE_CHECK_IN = "2026-10-03";

/** Icons for each step's points, in the same order as the copy. */
const POINT_ICONS: LucideIcon[][] = [
  [Inbox, CalendarDays, IndianRupee, PhoneCall],
  [MessageCircle, UsersRound, Smartphone, Globe],
  [UserRoundCheck, Phone, IdCard, History],
];

export function HowItWorks() {
  const how = getCopy().home.how;
  const scenes = [<BookingScene key="booking" />, <LinkScene key="link" />, <ArrivedScene key="arrived" />];

  return (
    <Section id={HOME_SECTIONS.howItWorks} labelledBy={HEADING_ID}>
      <Container>
        <SectionHeader id={HEADING_ID} eyebrow={how.eyebrow} title={how.title} lede={how.lede} />
        <ol className="mt-16 flex flex-col gap-24 sm:mt-20 lg:gap-32">
          {how.steps.map((step, index) => (
            <li key={step.title}>
              <FeatureRow
                reverse={index % 2 === 1}
                visual={
                  <OffsetCard>
                    <StoryLoop>{scenes[index]}</StoryLoop>
                  </OffsetCard>
                }
              >
                <Eyebrow>{how.stepLabel(index + 1)}</Eyebrow>
                <AccentHeading as="h3" lead={step.heading.lead} accent={step.heading.accent} />
                <p className="text-body text-pretty text-ink-2 sm:text-lead">{step.body}</p>
                <PointGrid className="mt-3" points={step.points} icons={POINT_ICONS[index]} />
              </FeatureRow>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}

/* ── Diagram parts ──────────────────────────────────────────────────────────── */

/** A small labelled tag that starts a flow, like a step's trigger. */
function FlowChip({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg border border-brand-300 bg-surface px-2.5 py-1 text-caption font-semibold text-brand-700 shadow-card">
      <Icon className="size-3.5" {...duotone} />
      {children}
    </span>
  );
}

/** Dashed connector between two parts of a flow: the dashes flow downwards, the end dot pulses. */
function Connector({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative block h-7 w-0.5 animate-dash-flow bg-[linear-gradient(to_bottom,var(--color-brand-300)_50%,transparent_0)] bg-size-[2px_8px]",
        className,
      )}
    >
      <span className="absolute -bottom-1 -left-0.75 size-2">
        <span className="absolute inset-0 animate-pulse-ring rounded-full bg-brand-400" />
        <span className="absolute inset-0 rounded-full bg-brand-400" />
      </span>
    </span>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-caption font-medium text-ink-3">{label}</span>
      <div className="flex h-9 items-center rounded-lg border border-line-strong bg-surface px-2.5 text-footnote text-ink">
        {children}
      </div>
    </div>
  );
}

/* ── Step scenes ────────────────────────────────────────────────────────────── */

function BookingScene() {
  const t = getCopy();
  const v = t.home.heroVisual;
  const s = t.home.how.scene;
  return (
    <div className="flex flex-col items-start">
      <FlowChip icon={Plus}>{s.newBooking}</FlowChip>
      <Connector className="ml-6" />
      <div className={cn(surfaceStyles({ elevation: "raised" }), "w-full border-2 border-brand-500 p-4")}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label={s.guestName}>
              <Replay>
                <span className="block animate-type" style={delay(0.3)}>
                  {v.chatName}
                </span>
              </Replay>
            </Field>
          </div>
          <Field label={s.dates}>
            <Replay>
              <span className="block animate-type" style={delay(1.1)}>
                {s.datesValue}
              </span>
            </Replay>
          </Field>
          <div className="flex flex-col gap-1">
            <span className="text-caption font-medium text-ink-3">{s.guests}</span>
            <span className="flex h-9 items-center justify-between rounded-lg border border-line-strong bg-surface px-1.5">
              <span className="flex size-6 items-center justify-center rounded-md bg-canvas text-ink-2">
                <Minus className="size-3.5" />
              </span>
              <Replay>
                <span className="block animate-tick text-footnote font-semibold text-ink tabular" style={delay(1.8)}>
                  4
                </span>
              </Replay>
              <span className="flex size-6 items-center justify-center rounded-md bg-brand-600 text-white">
                <Plus className="size-3.5" />
              </span>
            </span>
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <span className="text-caption font-medium text-ink-3">{s.source}</span>
            <span className="flex flex-wrap gap-1.5">
              {(["airbnb", "booking_com", "makemytrip", "direct"] as const).map((source) => (
                <span
                  key={source}
                  className="relative rounded-full border border-line-strong bg-surface px-2.5 py-1 text-caption font-medium text-ink-2"
                >
                  {t.common.sources[source]}
                  {source === "airbnb" && (
                    <Replay className="absolute -inset-px">
                      <span
                        className="flex size-full animate-tick items-center justify-center rounded-full bg-brand-600 text-white"
                        style={delay(2.2)}
                      >
                        {t.common.sources[source]}
                      </span>
                    </Replay>
                  )}
                </span>
              ))}
            </span>
          </div>
        </div>
      </div>
      <Connector className="mr-10 ml-auto" />
      <Replay className="ml-auto w-full max-w-sm">
        <div
          className={cn(
            surfaceStyles({ elevation: "raised" }),
            "flex w-full animate-enter items-center gap-3 border-success-100 p-3",
          )}
          style={delay(2.7)}
        >
          <DateTile date={SAMPLE_CHECK_IN} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-subhead font-semibold text-ink">{v.chatName}</p>
            <p className="text-caption text-ink-3">
              {t.common.count.nights(3)} · {t.common.count.guests(4)}
            </p>
          </div>
          <Badge tone="success" size="sm" className="hidden sm:inline-flex">
            <CircleCheck />
            {s.saved}
          </Badge>
          <CircleCheck className="size-6 shrink-0 text-success-600 sm:hidden" {...duotone} />
        </div>
      </Replay>
    </div>
  );
}

function LinkScene() {
  const t = getCopy();
  const v = t.home.heroVisual;
  const s = t.home.how.scene;
  return (
    <div className="flex flex-col items-start">
      <span className="inline-flex items-center gap-1.5 rounded-lg border border-success-100 bg-success-50 px-2.5 py-1 text-caption font-semibold text-success-700 shadow-card">
        <WhatsAppIcon className="size-3.5" />
        {s.guestLink}
      </span>
      <Connector className="ml-6" />
      <Replay className="w-full max-w-sm">
        <div
          className="w-full animate-enter rounded-2xl rounded-bl-md border border-success-100 bg-success-50 p-1.5 shadow-raised"
          style={delay(0.3)}
        >
          <div className="flex items-center gap-2 rounded-xl bg-surface p-2">
            <LogoMark className="size-9" />
            <div className="min-w-0 leading-tight">
              <p className="truncate text-footnote font-semibold text-ink">{v.chatLinkTitle}</p>
              <p className="truncate text-caption text-brand-600">{v.chatLink}</p>
            </div>
          </div>
          <p className="px-1.5 pt-2 text-footnote text-ink">{v.chatMessage}</p>
          <p className="flex items-center justify-end gap-1 px-1.5 text-micro text-ink-2">
            {v.chatTime}
            <CheckCheck className="size-3.5 text-brand-500" />
          </p>
        </div>
      </Replay>
      <Connector className="mr-[30%] ml-auto" />
      <Replay className="mr-[12%] ml-auto">
        <div
          className="flex animate-tick items-center gap-2.5 rounded-2xl border-2 border-success-500 bg-success-50 px-3.5 py-2.5 shadow-raised"
          style={delay(1.4)}
        >
          <span className="relative flex">
            <span className="absolute inset-0 animate-pulse-ring rounded-lg bg-success-500/40" />
            <IconTile icon={Smartphone} tone="success" size="sm" className="relative" />
          </span>
          <div className="leading-tight">
            <p className="text-footnote font-semibold text-success-700">{s.opened}</p>
            <p className="text-caption text-ink-3">{s.openedTime}</p>
          </div>
        </div>
      </Replay>

      {/* One link, the whole group */}
      <div className="mt-5 w-full">
        <div className="mx-[12.5%] h-4 border-x-2 border-t-2 border-dashed border-brand-300" />
        <ul className="grid grid-cols-4 gap-2">
          {v.guests.map((name, index) => (
            <li key={name}>
              <Replay>
                <div
                  className="flex animate-tick flex-col items-center gap-1.5 rounded-xl border border-line bg-surface px-1 py-2.5 text-center shadow-card"
                  style={delay(2 + index * 0.25)}
                >
                  <Avatar name={name} size="sm" className="size-8 text-micro" />
                  <span className="w-full truncate text-caption text-ink-2">{name.split(" ")[0]}</span>
                </div>
              </Replay>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ArrivedScene() {
  const t = getCopy();
  const v = t.home.heroVisual;
  const s = t.home.how.scene;
  const phones = ["+91 98••• •••10", "+91 99••• •••42", "+91 97••• •••08", "+91 98••• •••76"];
  return (
    <div className="flex flex-col items-start">
      <FlowChip icon={Smartphone}>{s.filled}</FlowChip>
      <Connector className="ml-6" />
      <div className={cn(surfaceStyles({ elevation: "raised" }), "w-full border-2 border-brand-500 p-4")}>
        <div className="flex items-center justify-between gap-2">
          <p className="text-subhead font-semibold text-ink">{v.cardTitle}</p>
          <Replay>
            <span className="block animate-tick" style={delay(2.4)}>
              <Badge tone="success" size="sm">
                <CircleCheck />
                {v.allIn}
              </Badge>
            </span>
          </Replay>
        </div>
        <ul className="mt-3 divide-y divide-line">
          {v.guests.map((name, index) => (
            <li key={name} className="flex items-center gap-2.5 py-2">
              <Avatar name={name} size="sm" className="size-8 text-micro" />
              <div className="min-w-0 flex-1 leading-tight">
                <p className="truncate text-footnote font-semibold text-ink">{name}</p>
                <Replay>
                  <p className="animate-type text-caption text-ink-3 tabular" style={delay(0.3 + index * 0.45)}>
                    {phones[index]}
                  </p>
                </Replay>
              </div>
              <Replay className="flex">
                <CircleCheck
                  className="size-4.5 animate-tick text-success-600"
                  style={delay(0.9 + index * 0.45)}
                  {...duotone}
                />
              </Replay>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex w-full justify-around">
        <Connector />
        <Connector />
      </div>
      <Replay className="grid w-full grid-cols-2 gap-3">
        <div
          className={cn(surfaceStyles({ elevation: "raised" }), "flex animate-enter items-center gap-2.5 p-3")}
          style={delay(2.8)}
        >
          <IconTile icon={IdCard} size="sm" />
          <span className="min-w-0 truncate text-footnote font-semibold text-ink tabular">{s.idMasked}</span>
        </div>
        <div
          className={cn(surfaceStyles({ elevation: "raised" }), "flex animate-enter items-center gap-2.5 p-3")}
          style={delay(3.05)}
        >
          <IconTile icon={History} size="sm" tone="accent" />
          <span className="min-w-0 truncate text-footnote font-semibold text-ink">{s.returning}</span>
        </div>
      </Replay>
    </div>
  );
}

import {
  CalendarDays,
  CheckCheck,
  CircleCheck,
  ClipboardList,
  IndianRupee,
  Lock,
  LogIn,
  Plus,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { CSSProperties } from "react";
import { Logo, LogoMark } from "@/components/brand/logo";
import { WhatsAppIcon } from "@/components/brand/whatsapp-icon";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { surfaceStyles } from "@/components/ui/card";
import { duotone, IconTile } from "@/components/ui/icon-tile";
import { getCopy } from "@/content";
import { DateTile } from "@/features/bookings/components/date-tile";
import { DETAILS_ICON, DETAILS_TONE } from "@/features/bookings/status";
import { cn } from "@/lib/cn";
import { formatINR } from "@/lib/money";
import { Replay, StoryLoop } from "./story-loop";

/** Staggers a CSS entrance animation. */
const delay = (seconds: number): CSSProperties => ({ animationDelay: `${seconds}s` });

/** Booking table columns on the preview: guest, guest details, source, payment. */
const ROW_COLUMNS =
  "md:grid md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,0.7fr)] md:items-center md:gap-4";

/**
 * The hero illustration: the AtithiHQ bookings screen in a browser window, with the
 * owner's WhatsApp link and the guest list filling itself floating over it. CSS animations,
 * replayed on a loop by <StoryLoop>; the window stays put while the story around it repeats.
 */
export function HeroVisual() {
  const t = getCopy();
  const v = t.home.heroVisual;
  const o = t.bookings.overview;
  const tiles: { value: string; label: string; icon: LucideIcon; money?: boolean }[] = [
    { value: "2", label: o.arrivingToday, icon: LogIn },
    { value: "4", label: o.awaitingDetails, icon: ClipboardList },
    { value: formatINR(72000), label: o.outstanding, icon: IndianRupee, money: true },
    { value: "34", label: o.guestsThisYear, icon: Users },
  ];

  return (
    <StoryLoop className="relative mt-14 w-full max-w-6xl sm:mt-16">
      {/* Soft brand glow behind the window */}
      <div aria-hidden className="absolute inset-x-[8%] -top-8 bottom-0 rounded-full bg-brand-200/50 blur-3xl" />

      <figure
        role="img"
        aria-label={v.label}
        className="relative animate-enter rounded-4xl bg-linear-to-b from-brand-200 to-brand-100/40 p-2 shadow-glow ring-1 ring-brand-200 sm:p-3"
        style={delay(0.35)}
      >
        <div inert aria-hidden className="overflow-hidden rounded-3xl bg-canvas text-left ring-1 ring-line">
          {/* Browser bar */}
          <div className="flex items-center gap-3 border-b border-line bg-surface px-4 py-2.5">
            <span className="flex gap-1.5">
              <span className="size-2.5 rounded-full bg-line-strong" />
              <span className="size-2.5 rounded-full bg-line-strong" />
              <span className="size-2.5 rounded-full bg-line-strong" />
            </span>
            <span className="mx-auto flex items-center gap-1.5 rounded-full bg-canvas px-3 py-1 text-caption text-ink-3">
              <Lock className="size-3" />
              {v.windowUrl}
            </span>
            <span className="w-10" />
          </div>

          <div className="flex">
            <MockSidebar />

            <div className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-title-2 text-ink">{v.greeting}</p>
                  <p className="text-subhead text-ink-3">{v.property}</p>
                </div>
                <span className="hidden h-10 items-center gap-2 rounded-xl bg-brand-600 px-4 text-subhead font-semibold text-white shadow-sm sm:inline-flex">
                  <Plus className="size-4" />
                  {t.common.nav.newBooking}
                </span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
                {tiles.map((tile) => (
                  <div key={tile.label} className={cn(surfaceStyles(), "flex flex-col gap-1 px-3.5 py-3")}>
                    <span className="flex items-center justify-between gap-2">
                      <span
                        className={cn(
                          "text-title-3 tabular sm:text-title-2",
                          tile.money ? "text-accent-700" : "text-ink",
                        )}
                      >
                        {tile.value}
                      </span>
                      <IconTile icon={tile.icon} size="sm" tone={tile.money ? "accent" : "brand"} />
                    </span>
                    <span className="truncate text-footnote font-medium text-ink-3">{tile.label}</span>
                  </div>
                ))}
              </div>

              <div className={cn(surfaceStyles(), "mt-5 overflow-hidden")}>
                <div
                  className={cn("hidden bg-subtle py-2.5 pr-5 pl-22 text-footnote font-medium text-ink-3", ROW_COLUMNS)}
                >
                  <span>{t.bookings.list.columns.guest}</span>
                  <span>{t.bookings.list.columns.details}</span>
                  <span>{t.bookings.list.columns.source}</span>
                  <span className="text-right">{t.bookings.list.columns.payment}</span>
                </div>
                <ul className="divide-y divide-line">
                  {v.bookings.map((booking, index) => (
                    <MockRow key={booking.name} booking={booking} animated={index === 1} />
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </figure>

      <SentLinkCard />
      <GuestListCard />

      {/* Payment chip */}
      <div className="absolute -top-5 right-[6%] hidden animate-float sm:block" style={delay(-5)}>
        <Replay>
          <p
            aria-hidden
            className="flex animate-enter items-center gap-2 rounded-full border border-line bg-surface py-1.5 pr-3.5 pl-1.5 shadow-raised"
            style={delay(3.6)}
          >
            <span className="flex size-6 items-center justify-center rounded-full bg-success-100 text-success-700">
              <IndianRupee className="size-3.5" />
            </span>
            <span className="text-caption font-semibold text-ink">{v.paidValue}</span>
          </p>
        </Replay>
      </div>
    </StoryLoop>
  );
}

function MockSidebar() {
  const t = getCopy();
  const items: { label: string; icon: LucideIcon; active?: boolean }[] = [
    { label: t.common.nav.bookings, icon: CalendarDays, active: true },
    { label: t.common.nav.guests, icon: Users },
    { label: t.common.nav.payments, icon: IndianRupee },
    { label: t.common.nav.settings, icon: Settings },
  ];
  return (
    <div className="hidden w-52 shrink-0 flex-col gap-5 border-r border-line bg-surface p-4 md:flex">
      <Logo size="sm" />
      <ul className="flex flex-col gap-1">
        {items.map(({ label, icon: Icon, active }) => (
          <li
            key={label}
            className={cn(
              "flex h-10 items-center gap-2.5 rounded-xl px-3 text-subhead",
              active ? "bg-brand-50 font-semibold text-brand-700" : "font-medium text-ink-2",
            )}
          >
            <Icon className="size-4.5" {...(active ? duotone : {})} />
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}

type SampleBooking = ReturnType<typeof getCopy>["home"]["heroVisual"]["bookings"][number];

/** One booking row. `animated`: its guest details turn from "waiting" to "all in" as the story plays. */
function MockRow({ booking, animated }: { booking: SampleBooking; animated: boolean }) {
  const t = getCopy();
  const detailsLabel = {
    complete: t.bookings.details.complete,
    waiting: t.bookings.details.waiting,
    not_sent: t.bookings.details.notSent,
  };
  const due = booking.payment !== t.bookings.payment.paid;
  const state = booking.details;
  const DetailsIcon = DETAILS_ICON[state];
  const CompleteIcon = DETAILS_ICON.complete;

  return (
    <li className="flex items-center gap-3.5 px-3.5 py-3 md:gap-5 md:px-5">
      <DateTile date={booking.checkIn} />
      <div className={cn("flex min-w-0 flex-1 flex-col gap-1.5", ROW_COLUMNS)}>
        <div className="flex min-w-0 items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-callout font-semibold text-ink">{booking.name}</p>
            <p className="truncate text-footnote text-ink-3">
              {booking.dates} · {t.common.count.guests(booking.guests)}
            </p>
          </div>
          <span
            className={cn(
              "text-footnote font-semibold whitespace-nowrap md:hidden",
              due ? "text-accent-700" : "text-success-600",
            )}
          >
            {booking.payment}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 md:contents">
          <span className="relative flex">
            {animated ? (
              <Replay className="relative flex">
                <span className="flex animate-[fade-out_300ms_ease-in_2.5s_both]">
                  <Badge tone={DETAILS_TONE[state]} size="sm">
                    <DetailsIcon />
                    {detailsLabel[state]}
                  </Badge>
                </span>
                <span className="absolute inset-y-0 left-0 flex animate-tick" style={delay(2.7)}>
                  <Badge tone="success" size="sm">
                    <CompleteIcon />
                    {detailsLabel.complete}
                  </Badge>
                </span>
              </Replay>
            ) : (
              <Badge tone={DETAILS_TONE[state]} size="sm">
                <DetailsIcon />
                {detailsLabel[state]}
              </Badge>
            )}
          </span>
          <span className="flex">
            <Badge tone="outline" size="sm">
              {t.common.sources[booking.source]}
            </Badge>
          </span>
          <span
            className={cn(
              "hidden text-right text-subhead font-semibold whitespace-nowrap md:block",
              due ? "text-accent-700" : "text-success-600",
            )}
          >
            {booking.payment}
          </span>
        </div>
      </div>
    </li>
  );
}

/** The owner's WhatsApp message with the guest link, floating at the left edge. */
function SentLinkCard() {
  const v = getCopy().home.heroVisual;
  return (
    <div className="absolute top-[54%] -left-6 hidden w-72 animate-float lg:block xl:-left-14" style={delay(-2)}>
      <Replay>
        <div
          aria-hidden
          className={cn(surfaceStyles({ elevation: "glow", radius: "xl" }), "animate-enter p-3 text-left")}
          style={delay(0.9)}
        >
          <div className="flex items-center gap-2 px-1 pb-2.5">
            <WhatsAppIcon className="size-4 text-success-600" />
            <span className="text-footnote font-semibold text-ink">{v.chatName}</span>
            <span className="ml-auto text-micro text-ink-3">{v.chatTime}</span>
          </div>
          <div className="rounded-2xl rounded-br-md border border-success-100 bg-success-50 p-1.5">
            <div className="flex items-center gap-2 rounded-xl bg-surface p-1.5">
              <LogoMark className="size-8" />
              <div className="min-w-0 leading-tight">
                <p className="truncate text-caption font-semibold text-ink">{v.chatLinkTitle}</p>
                <p className="truncate text-caption text-brand-600">{v.chatLink}</p>
              </div>
            </div>
            <p className="px-1 pt-1.5 text-caption text-ink">{v.chatMessage}</p>
            <p className="flex items-center justify-end gap-1 px-1 text-micro text-ink-2">
              {v.chatTime}
              <CheckCheck className="size-3.5 text-brand-500" />
            </p>
          </div>
        </div>
      </Replay>
    </div>
  );
}

/** The booking's guest list filling itself, floating at the right edge. */
function GuestListCard() {
  const v = getCopy().home.heroVisual;
  const total = v.guests.length;
  return (
    <div className="absolute -right-4 -bottom-10 hidden w-64 animate-float sm:block xl:-right-12" style={delay(-4)}>
      <div
        aria-hidden
        className={cn(surfaceStyles({ elevation: "glow", radius: "xl" }), "animate-enter p-4 text-left")}
        style={delay(0.6)}
      >
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-title-2 text-success-600 tabular">{v.statValue}</p>
          <Replay className="shrink-0">
            <span className="block animate-tick" style={delay(3.1)}>
              <CircleCheck className="size-6 text-success-600" {...duotone} />
            </span>
          </Replay>
        </div>
        <p className="text-footnote text-ink-3">{v.statLabel}</p>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-ink/7">
          <Replay className="h-full">
            <div
              className="h-full origin-left animate-fill rounded-full bg-success-500"
              style={{ ...delay(1.2), "--fill-from": 1 / total } as CSSProperties}
            />
          </Replay>
        </div>
        <ul className="mt-3 flex flex-col gap-2">
          {v.guests.map((name, index) => (
            <li key={name} className="flex items-center gap-2">
              <Avatar name={name} size="sm" className="size-7 text-micro" />
              <span className="min-w-0 flex-1 truncate text-caption text-ink-2">{name}</span>
              <Replay className="flex shrink-0">
                <CircleCheck
                  className="size-4 animate-tick text-success-600"
                  style={delay(index === 0 ? 1 : 1.4 + index * 0.5)}
                />
              </Replay>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

"use client";

import { ChevronRight, CircleCheck, Clock3, Copy, Eye, Link2, UserPlus } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { WhatsAppIcon } from "@/components/brand/whatsapp-icon";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PhoneReveal } from "@/components/ui/phone-reveal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { IconButton } from "@/components/ui/icon-button";
import { Notice } from "@/components/ui/notice";
import { routes } from "@/config/routes";
import { useCopy } from "@/content";
import { addedGuestCount, detailsState, isCancelled, isLinkUsable } from "@/domain/booking-rules";
import type { BookingGuestDetails, BookingRecord } from "@/domain/read-models";
import type { IdRequirement } from "@/domain/types";
import { cn } from "@/lib/cn";
import { formatDayMonth, formatRelativeDay, todayISO } from "@/lib/dates";
import { DetailsBadge } from "../components/status-badges";
import { useMarkLinkShared, useUpdateBooking } from "../queries";
import { bookingToInput } from "../booking-form/booking-form-schema";
import { copyText } from "@/lib/clipboard";
import { guestLinkLabel, guestLinkUrl } from "../share";

interface GuestsCardProps {
  booking: BookingRecord;
  idRequirement: IdRequirement;
  onOpenEntry: (entry: BookingGuestDetails | null) => void;
  onShare: () => void;
}

/** Who is staying, whose details are in, and the one link that collects the rest. */
export function GuestsCard({ booking, idRequirement, onOpenEntry, onShare }: GuestsCardProps) {
  const t = useCopy();
  const g = t.bookings.guests;
  const added = addedGuestCount(booking);
  const state = detailsState(booking);
  const cancelled = isCancelled(booking);
  const linkUsable = isLinkUsable(booking, todayISO());

  const entries = [...booking.guests].sort((a, b) => (a.role === b.role ? 0 : a.role === "lead" ? -1 : 1));
  const emptySlots = Math.max(0, booking.guestCount - entries.length);

  return (
    <Card>
      {/* One form covers everyone, so the header shows where that form stands, not a per-person count. */}
      <div className="flex items-center justify-between gap-3 px-4 pt-4 sm:px-5 sm:pt-5">
        <h2 className="text-headline text-ink">{g.title}</h2>
        {!cancelled && <DetailsBadge booking={booking} />}
      </div>

      <ul className="mt-3 divide-y divide-line border-t border-line">
        {entries.map((entry) => (
          <GuestRow
            key={entry.guestId}
            entry={entry}
            idRequirement={idRequirement}
            onClick={() => onOpenEntry(entry)}
          />
        ))}
        {Array.from({ length: emptySlots }, (_, index) => (
          <li key={`slot-${index}`}>
            <button
              type="button"
              disabled={cancelled}
              onClick={() => onOpenEntry(null)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-subtle active:bg-canvas disabled:pointer-events-none sm:px-5"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-line-strong text-ink-4">
                <UserPlus className="size-5" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-body font-medium text-ink-2">
                  {g.emptySlot(entries.length + index + 1)}
                </span>
                <span className="block text-subhead text-ink-3">{g.emptySlotHint}</span>
              </span>
              {!cancelled && <span className="text-callout font-semibold text-brand-600">{t.common.actions.add}</span>}
            </button>
          </li>
        ))}
      </ul>

      {!cancelled && added > booking.guestCount && (
        <div className="border-t border-line px-4 py-3 sm:px-5">
          <ExtraGuestsNotice booking={booking} added={added} />
        </div>
      )}

      {!cancelled && (
        <div className="flex flex-col gap-3 border-t border-line px-4 py-4 sm:px-5">
          <LinkRow booking={booking} usable={linkUsable} />
          {state === "complete" ? (
            <div className="flex items-center gap-3 rounded-xl border border-success-100 bg-success-50 py-1.5 pr-1.5 pl-3.5">
              <CircleCheck className="size-5 shrink-0 text-success-600" aria-hidden />
              <p className="min-w-0 flex-1 text-subhead font-semibold text-success-700">{g.allIn}</p>
              <Button variant="ghost" size="sm" leadingIcon={<UserPlus />} onClick={() => onOpenEntry(null)}>
                {t.common.actions.add}
              </Button>
            </div>
          ) : (
            <>
              <div className={cn("grid grid-cols-1 gap-2", linkUsable && "min-[400px]:grid-cols-2")}>
                <Button variant="secondary" size="lg" leadingIcon={<UserPlus />} onClick={() => onOpenEntry(null)}>
                  {g.addManually}
                </Button>
                {linkUsable && (
                  <Button
                    variant="accent"
                    size="lg"
                    leadingIcon={<WhatsAppIcon className="size-5" />}
                    onClick={onShare}
                  >
                    {booking.link.status === "not_sent" ? g.sendLink : g.sendReminder}
                  </Button>
                )}
              </div>
              {linkUsable && <p className="text-footnote leading-5 text-ink-3">{g.honestNote}</p>}
            </>
          )}
        </div>
      )}
    </Card>
  );
}

function GuestRow({
  entry,
  idRequirement,
  onClick,
}: {
  entry: BookingGuestDetails;
  idRequirement: IdRequirement;
  onClick: () => void;
}) {
  const t = useCopy();
  const g = t.bookings.guests;
  const pending = entry.status === "pending";
  const addedBy = entry.addedBy === "guest" ? g.addedByGuest : g.addedByYou;
  const idText =
    idRequirement === "off"
      ? null
      : entry.document
        ? g.idAdded(t.common.idTypes[entry.document.type], entry.document.last4)
        : g.noId;

  return (
    // The name button stretches over the whole row, so tapping anywhere opens the guest;
    // the phone controls sit above it and stay separately tappable.
    <li className="relative flex items-center gap-3 px-4 py-3 transition-colors hover:bg-subtle active:bg-canvas sm:px-5">
      <Avatar
        name={entry.guest.name}
        className={cn(pending && "border border-dashed border-line-strong bg-surface text-ink-3")}
      />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={onClick}
            className="truncate text-left text-body font-medium text-ink outline-none after:absolute after:inset-0 focus-visible:after:ring-2 focus-visible:after:ring-brand-500 focus-visible:after:ring-inset"
          >
            {entry.guest.name}
          </button>
          {entry.role === "lead" && (
            <Badge tone="brand" size="sm">
              {g.lead}
            </Badge>
          )}
        </span>
        {entry.guest.phone && <PhoneReveal phone={entry.guest.phone} className="text-subhead text-ink-3" />}
        <span className="text-footnote leading-5 text-ink-3">
          {pending ? g.pendingLead : [idText, addedBy].filter(Boolean).join(" · ")}
        </span>
      </span>
      {pending ? (
        <Clock3 className="size-5 shrink-0 text-warning-600" aria-label={g.waiting} />
      ) : (
        <CircleCheck className="size-5 shrink-0 text-success-500" aria-label={g.done} />
      )}
      <ChevronRight className="size-5 shrink-0 text-ink-4" aria-hidden />
    </li>
  );
}

function LinkRow({ booking, usable }: { booking: BookingRecord; usable: boolean }) {
  const t = useCopy();
  const l = t.bookings.link;
  const markShared = useMarkLinkShared(booking.id);
  const relative = (value: string | null) => (value ? formatRelativeDay(value, t.common.relative) : "");

  const status = !usable
    ? l.expired
    : booking.link.status === "submitted"
      ? l.statusSubmitted(relative(booking.link.submittedAt))
      : booking.link.status === "opened"
        ? l.statusOpened(relative(booking.link.openedAt))
        : booking.link.status === "sent"
          ? l.statusSent(relative(booking.link.sentAt))
          : l.statusNotSent;

  async function copyLink() {
    if (await copyText(guestLinkUrl(booking.link.token))) {
      toast.success(l.copied);
      markShared.mutate();
    }
  }

  return (
    <div className="flex items-center gap-3 rounded-xl bg-subtle px-3 py-2.5">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface text-ink-3 shadow-card">
        <Link2 className="size-4.5" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-subhead font-semibold text-ink">{status}</p>
        <p className="text-footnote leading-5 text-ink-3" title={guestLinkLabel(booking.link.token)}>
          {usable ? l.validUntil(formatDayMonth(booking.link.expiresOn)) : guestLinkLabel(booking.link.token)}
        </p>
      </div>
      {usable && (
        <div className="flex shrink-0 items-center">
          <IconButton aria-label={l.copy} size="sm" onClick={copyLink}>
            <Copy />
          </IconButton>
          <IconButton aria-label={l.previewHint} size="sm" asChild>
            <Link href={routes.guestForm(booking.link.token, { preview: true, from: routes.booking(booking.id) })}>
              <Eye />
            </Link>
          </IconButton>
        </div>
      )}
    </div>
  );
}

function ExtraGuestsNotice({ booking, added }: { booking: BookingRecord; added: number }) {
  const t = useCopy();
  const update = useUpdateBooking(booking.id);
  return (
    <Notice
      tone="warning"
      action={
        <Button
          variant="secondary"
          size="sm"
          loading={update.isPending}
          onClick={() => update.mutate({ ...bookingToInput(booking), guestCount: added })}
        >
          {t.bookings.guests.updateCount}
        </Button>
      }
    >
      {t.bookings.guests.extraGuests(added, booking.guestCount)}
    </Notice>
  );
}

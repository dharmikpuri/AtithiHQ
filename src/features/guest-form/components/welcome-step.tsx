"use client";

import { ArrowRight, CircleCheck, Lock, MapPin } from "lucide-react";
import { PropertyIllustration } from "@/components/brand/property-illustration";
import { Button } from "@/components/ui/button";
import { useCopy } from "@/content";
import type { GuestLinkView } from "@/domain/read-models";
import { formatTimeOfDay, formatWeekdayDate } from "@/lib/dates";
import { firstNameOf } from "@/features/bookings/share";
import { GuestShell } from "./guest-shell";

export function WelcomeStep({
  view,
  preview,
  onStart,
}: {
  view: GuestLinkView;
  preview: boolean;
  onStart: () => void;
}) {
  const t = useCopy();
  const w = t.guestForm.welcome;
  const { property, stay } = view;
  const alreadySubmitted = view.submittedGuests.length > 0;

  return (
    <GuestShell
      bare
      preview={preview}
      footer={
        <div className="flex flex-col gap-3">
          <Button size="xl" fullWidth onClick={onStart} trailingIcon={<ArrowRight />}>
            {alreadySubmitted ? w.review : w.start}
          </Button>
          <p className="text-center text-footnote leading-5 text-ink-3">
            <Lock className="mr-1 inline size-3.5 -translate-y-px" aria-hidden />
            {w.privacy(t.guestForm.retention(property.documentRetentionDays))}
          </p>
        </div>
      }
    >
      <div className="-mx-5 -mt-6 mb-6 flex flex-col items-center gap-4 rounded-b-4xl bg-linear-to-b from-brand-50 to-surface px-6 pt-[calc(env(safe-area-inset-top)+2rem)] pb-2 text-center sm:-mx-7 md:rounded-t-[28px]">
        <PropertyIllustration type={property.type} framed={false} className="size-32" />
        <div className="flex flex-col gap-1">
          <p className="text-title-2 leading-7 text-ink">{property.name}</p>
          <p className="text-subhead font-medium text-brand-700">{t.common.propertyTypes[property.type].label}</p>
          <p className="flex items-center justify-center gap-1 text-callout text-ink-3">
            <MapPin className="size-4" aria-hidden />
            {property.location}
          </p>
          {property.hostName && <p className="text-subhead text-ink-3">{t.guestForm.hostedBy(property.hostName)}</p>}
        </div>
      </div>

      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <h1 className="text-title-1 text-ink">{w.greeting(firstNameOf(view.lead.name))}</h1>
          <p className="text-body text-ink-2">{w.body}</p>
        </div>

        {alreadySubmitted && (
          <div className="flex items-start gap-3 rounded-2xl border border-success-100 bg-success-50 px-4 py-3">
            <CircleCheck className="mt-0.5 size-5 shrink-0 text-success-600" aria-hidden />
            <div className="text-subhead leading-5 text-success-700">
              <p className="font-semibold">{w.alreadyTitle}</p>
              <p>{w.alreadyBody(view.submittedGuests.length)}</p>
            </div>
          </div>
        )}

        <dl className="grid grid-cols-1 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-subtle">
          <StayRow
            label={w.checkIn}
            value={formatWeekdayDate(stay.checkIn)}
            sub={w.from(formatTimeOfDay(property.checkInTime))}
          />
          <StayRow
            label={w.checkOut}
            value={formatWeekdayDate(stay.checkOut)}
            sub={w.by(formatTimeOfDay(property.checkOutTime))}
          />
          <StayRow label={w.guests} value={String(stay.guestCount)} />
          {stay.booked && (
            <StayRow
              label={w.roomsBooked}
              value={stay.booked.kind === "whole" ? w.wholeBooked : String(stay.booked.count)}
            />
          )}
        </dl>

        <p className="text-callout leading-6 text-ink-3">{w.why}</p>
      </div>
    </GuestShell>
  );
}

function StayRow({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 px-4 py-3">
      <dt className="text-callout text-ink-3">{label}</dt>
      <dd className="text-right">
        <span className="text-body font-semibold text-ink">{value}</span>
        {sub && <span className="ml-1.5 text-subhead text-ink-3">{sub}</span>}
      </dd>
    </div>
  );
}

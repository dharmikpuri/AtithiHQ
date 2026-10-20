"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, type ReactNode } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { StickyFooter, StickyFooterSpacer } from "@/components/layout/sticky-footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChoiceChips } from "@/components/ui/choice-chips";
import { Field } from "@/components/ui/field";
import { MoneyInput } from "@/components/ui/money-input";
import { Notice } from "@/components/ui/notice";
import { Stepper } from "@/components/ui/stepper";
import { useCopy } from "@/content";
import { availabilityFor, checkRoomRequest, roomRequestOf, toInventoryBooking } from "@/domain/availability";
import { findOverlaps, leadNameOf } from "@/domain/booking-rules";
import { BOOKING_SOURCES, GUEST_COUNT, PAYMENT_METHODS, PLATFORM_SOURCES } from "@/domain/constants";
import { inventoryOf, usesRoomInventory } from "@/domain/inventory";
import { useCurrentSession } from "@/features/auth/queries";
import { cn } from "@/lib/cn";
import { daysBetween, formatStayRange } from "@/lib/dates";
import { useUnsavedChangesWarning } from "@/lib/hooks/use-unsaved-changes";
import { formatINR } from "@/lib/money";
import { useBookings } from "../queries";
import { bookingFormSchema, roomsBookedOf, type BookingFormValues } from "./booking-form-schema";
import { DateRangeField } from "./date-range-field";
import { LeadGuestFields } from "./lead-guest-fields";
import { RoomsField } from "./rooms-field";

const FORM_ID = "booking-form";

interface BookingFormProps {
  mode: "create" | "edit";
  defaultValues: BookingFormValues;
  /** Edit mode: the booking being edited (excluded from overlap checks). */
  bookingId?: string;
  /** Edit mode: guest count can't drop below the guests already added. */
  minGuestCount?: number;
  /** Edit mode: money already recorded on the booking, so "Due" stays honest. */
  paidSoFar?: number;
  submitting: boolean;
  onSubmit: (values: BookingFormValues) => void;
  /** Lets the screen know about unsaved changes (for the close button). */
  onDirtyChange?: (dirty: boolean) => void;
}

export function BookingForm({
  mode,
  defaultValues,
  bookingId,
  minGuestCount = 1,
  paidSoFar = 0,
  submitting,
  onSubmit,
  onDirtyChange,
}: BookingFormProps) {
  const t = useCopy();
  const f = t.bookings.form;
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues,
    mode: "onTouched",
  });
  const { errors, isDirty } = form.formState;
  useUnsavedChangesWarning(isDirty && !submitting);
  useEffect(() => onDirtyChange?.(isDirty), [isDirty, onDirtyChange]);

  const values = useWatch({ control: form.control }) as BookingFormValues;
  const { data: bookings = [] } = useBookings();

  const inventory = inventoryOf(useCurrentSession().property);
  const roomBased = usesRoomInventory(inventory.mode);
  const hasDates = Boolean(values.checkIn && values.checkOut && values.checkOut > values.checkIn);

  // Whole-property-only: keep the overlap warning. Room-based: show what's free, recalculated
  // whenever the dates change, and stop at what's left.
  const overlaps =
    !roomBased && hasDates
      ? findOverlaps(bookings, { checkIn: values.checkIn!, checkOut: values.checkOut! }, bookingId)
      : [];
  const availability =
    roomBased && hasDates
      ? availabilityFor({
          inventory,
          bookings: bookings.map(toInventoryBooking),
          checkIn: values.checkIn!,
          checkOut: values.checkOut!,
          excludeBookingId: bookingId,
        })
      : null;
  const roomProblem = availability
    ? checkRoomRequest(inventory, availability, roomRequestOf(roomsBookedOf(values, inventory)))
    : null;
  const roomsLabelOf = (current: BookingFormValues) => {
    const rooms = roomsBookedOf(current, inventory);
    return rooms === null ? t.bookings.rooms.whole : t.bookings.rooms.count(rooms);
  };
  const received = mode === "create" ? (values.receivedAmount ?? 0) : paidSoFar;
  const due = values.totalAmount !== null ? Math.max(0, values.totalAmount - received) : null;

  const submit = form.handleSubmit((data) => {
    if (data.guestCount < minGuestCount) {
      form.setError("guestCount", { message: f.guestCountBelowAdded(minGuestCount) });
      return;
    }
    // The rooms must fit the dates (the message is already on screen).
    if (roomProblem) {
      document.getElementById("booking-rooms")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    onSubmit(data);
  });

  const submitLabel = mode === "create" ? f.createSubmit : f.saveSubmit;

  return (
    <>
      <form
        id={FORM_ID}
        onSubmit={submit}
        noValidate
        className="lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start lg:gap-8"
      >
        <div className="flex flex-col gap-4 sm:gap-5">
          <FormSection title={f.stay}>
            <Field label={f.dates} error={errors.checkIn?.message} id="booking-dates">
              <DateRangeField
                checkIn={values.checkIn}
                checkOut={values.checkOut}
                invalid={Boolean(errors.checkIn)}
                describedBy={errors.checkIn ? "booking-dates-error" : undefined}
                onChange={(range) => {
                  form.setValue("checkIn", range.checkIn, { shouldDirty: true });
                  form.setValue("checkOut", range.checkOut, { shouldDirty: true, shouldValidate: true });
                }}
              />
            </Field>
            {overlaps.length > 0 && (
              <Notice tone="warning">{f.overlap(overlaps.map((booking) => leadNameOf(booking)).join(", "))}</Notice>
            )}

            {roomBased && (
              <div id="booking-rooms" className="flex flex-col gap-3 rounded-2xl border border-line p-4">
                <p className="text-headline text-ink">{f.roomsTitle}</p>
                <RoomsField
                  inventory={inventory}
                  availability={availability}
                  bookWhole={values.bookWhole}
                  rooms={values.rooms}
                  onBookWholeChange={(whole) => form.setValue("bookWhole", whole, { shouldDirty: true })}
                  onRoomsChange={(rooms) => form.setValue("rooms", rooms, { shouldDirty: true })}
                  problem={roomProblem}
                />
              </div>
            )}

            <Field label={f.guests} inline error={errors.guestCount?.message}>
              <Controller
                control={form.control}
                name="guestCount"
                render={({ field }) => (
                  <Stepper
                    value={field.value}
                    onChange={field.onChange}
                    min={GUEST_COUNT.min}
                    max={GUEST_COUNT.max}
                    unitLabel={f.guestsUnit}
                  />
                )}
              />
            </Field>

            <Field label={f.source} error={errors.source?.message}>
              <Controller
                control={form.control}
                name="source"
                render={({ field }) => (
                  <ChoiceChips
                    value={field.value}
                    onChange={(source) => {
                      field.onChange(source);
                      // Platform bookings are usually paid through the platform.
                      if (!form.getFieldState("receivedMethod").isDirty) {
                        form.setValue("receivedMethod", PLATFORM_SOURCES.has(source) ? "platform" : "upi");
                      }
                    }}
                    options={BOOKING_SOURCES.map((source) => ({ value: source, label: t.common.sources[source] }))}
                  />
                )}
              />
            </Field>
          </FormSection>

          <FormSection title={f.guest}>
            <LeadGuestFields form={form} editing={mode === "edit"} />
          </FormSection>

          <FormSection title={f.money} description={mode === "create" ? f.moneyOptional : f.totalEditHint}>
            <div className={cn("grid grid-cols-1 gap-4", mode === "create" && "sm:grid-cols-2")}>
              <Field label={f.total} error={errors.totalAmount?.message}>
                <Controller
                  control={form.control}
                  name="totalAmount"
                  render={({ field }) => (
                    <MoneyInput value={field.value} onChange={field.onChange} onBlur={field.onBlur} />
                  )}
                />
              </Field>
              {mode === "create" && (
                <Field label={f.received} error={errors.receivedAmount?.message}>
                  <Controller
                    control={form.control}
                    name="receivedAmount"
                    render={({ field }) => (
                      <MoneyInput
                        value={field.value}
                        onChange={(value) => {
                          field.onChange(value);
                          void form.trigger("receivedAmount");
                        }}
                        onBlur={field.onBlur}
                      />
                    )}
                  />
                </Field>
              )}
            </div>

            {mode === "create" && received > 0 && (
              <Field label={f.receivedMethod}>
                <Controller
                  control={form.control}
                  name="receivedMethod"
                  render={({ field }) => (
                    <ChoiceChips
                      value={field.value}
                      onChange={field.onChange}
                      options={PAYMENT_METHODS.map((method) => ({
                        value: method,
                        label: t.common.paymentMethods[method],
                      }))}
                    />
                  )}
                />
              </Field>
            )}

            {due !== null && (
              <div className="flex items-center justify-between rounded-xl bg-subtle px-4 py-3">
                <span className="text-callout font-medium text-ink-2">{f.due}</span>
                <span className={cn("text-headline tabular", due > 0 ? "text-accent-700" : "text-success-600")}>
                  {due > 0 ? formatINR(due) : t.bookings.payment.paidInFull}
                </span>
              </div>
            )}
          </FormSection>
          <StickyFooterSpacer />
        </div>

        <aside className="sticky top-24 hidden flex-col gap-4 lg:flex">
          <SummaryCard values={values} received={received} roomsLabel={roomBased ? roomsLabelOf(values) : null} />
          <Button type="submit" size="xl" fullWidth loading={submitting}>
            {submitLabel}
          </Button>
        </aside>
      </form>

      <StickyFooter>
        <Button type="submit" form={FORM_ID} size="xl" fullWidth loading={submitting}>
          {submitLabel}
        </Button>
      </StickyFooter>
    </>
  );
}

function FormSection({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <Card className="flex flex-col gap-5 p-4 sm:p-6">
      <div className="flex flex-col gap-0.5">
        <h2 className="text-headline text-ink">{title}</h2>
        {description && <p className="text-subhead text-ink-3">{description}</p>}
      </div>
      {children}
    </Card>
  );
}

/** Desktop only: the booking as it will be saved, updating while you type. */
function SummaryCard({
  values,
  received,
  roomsLabel,
}: {
  values: BookingFormValues;
  received: number;
  /** "3 rooms" or "Entire property"; `null` for whole-property-only properties. */
  roomsLabel: string | null;
}) {
  const t = useCopy();
  const f = t.bookings.form;
  const hasDates = values.checkIn && values.checkOut;

  const rows: [string, string][] = [];
  if (hasDates) {
    rows.push([f.dates, formatStayRange(values.checkIn!, values.checkOut!)]);
    rows.push([f.summaryNights, String(daysBetween(values.checkIn!, values.checkOut!))]);
  }
  rows.push([t.bookings.detail.stayFacts.guests, String(values.guestCount)]);
  if (roomsLabel) rows.push([t.bookings.rooms.label, roomsLabel]);
  if (values.source) rows.push([t.bookings.detail.stayFacts.source, t.common.sources[values.source]]);
  if (values.totalAmount !== null) rows.push([f.total, formatINR(values.totalAmount)]);
  if (received) rows.push([f.received, formatINR(received)]);

  const due = values.totalAmount !== null ? Math.max(0, values.totalAmount - received) : null;

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-line bg-subtle px-5 py-4">
        <p className="text-footnote font-semibold tracking-wider text-ink-3 uppercase">{f.summary}</p>
        <p className={cn("mt-1 truncate text-headline", values.leadName ? "text-ink" : "text-ink-3")}>
          {values.leadName || f.summaryNoName}
        </p>
      </div>
      {!hasDates && !values.leadName ? (
        <p className="px-5 py-4 text-subhead text-ink-3">{f.summaryEmpty}</p>
      ) : (
        <dl className="divide-y divide-line px-5">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5 text-callout">
              <dt className="text-ink-3">{label}</dt>
              <dd className="font-medium text-ink tabular">{value}</dd>
            </div>
          ))}
          {due !== null && (
            <div className="flex items-center justify-between gap-4 py-3">
              <dt className="font-medium text-ink-2">{f.due}</dt>
              <dd className={cn("text-headline tabular", due > 0 ? "text-accent-700" : "text-success-600")}>
                {due > 0 ? formatINR(due) : t.bookings.payment.paidInFull}
              </dd>
            </div>
          )}
        </dl>
      )}
    </Card>
  );
}

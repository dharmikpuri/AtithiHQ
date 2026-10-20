"use client";

import { History, X } from "lucide-react";
import { Controller, useWatch, type UseFormReturn } from "react-hook-form";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { surfaceStyles } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { useCopy } from "@/content";
import type { GuestSummary } from "@/domain/read-models";
import { useGuests } from "@/features/guests/queries";
import { cn } from "@/lib/cn";
import { formatMonthYear } from "@/lib/dates";
import { digitsOnly } from "@/lib/phone";
import type { BookingFormValues } from "./booking-form-schema";

function matchGuests(guests: GuestSummary[], name: string, phone: string): GuestSummary[] {
  const query = name.trim().toLowerCase();
  const phoneDigits = digitsOnly(phone).slice(-10);
  if (query.length < 2 && phoneDigits.length < 6) return [];
  return guests
    .filter(({ guest }) => {
      const byPhone = phoneDigits.length >= 6 && guest.phone && digitsOnly(guest.phone).includes(phoneDigits);
      const byName =
        query.length >= 2 &&
        guest.name
          .toLowerCase()
          .split(/\s+/)
          .some((part) => part.startsWith(query) || guest.name.toLowerCase().startsWith(query));
      return byPhone || byName;
    })
    .sort((a, b) => (b.lastStay?.checkIn ?? "").localeCompare(a.lastStay?.checkIn ?? ""))
    .slice(0, 3);
}

/**
 * Name and phone of the person who booked.
 * Recognises returning guests as the owner types — "this family came last Diwali".
 */
export function LeadGuestFields({
  form,
  editing = false,
}: {
  form: UseFormReturn<BookingFormValues>;
  editing?: boolean;
}) {
  const t = useCopy();
  const f = t.bookings.form;
  const { data: guests = [] } = useGuests();
  const [leadName, leadPhone, existingGuestId] = useWatch({
    control: form.control,
    name: ["leadName", "leadPhone", "existingGuestId"],
  });
  const { errors } = form.formState;

  const selected = existingGuestId ? guests.find((item) => item.guest.id === existingGuestId) : undefined;
  // When editing, the booking’s own guest isn’t "returning" — only someone picked here is.
  const showReturning = !editing || existingGuestId !== form.formState.defaultValues?.existingGuestId;
  const suggestions = existingGuestId ? [] : matchGuests(guests, leadName, leadPhone);

  function pickGuest(summary: GuestSummary) {
    form.setValue("leadName", summary.guest.name, { shouldDirty: true, shouldValidate: true });
    form.setValue("leadPhone", summary.guest.phone ?? "", { shouldDirty: true, shouldValidate: true });
    form.setValue("existingGuestId", summary.guest.id, { shouldDirty: true });
  }

  return (
    <div className="flex flex-col gap-4">
      <Field label={f.leadName} error={errors.leadName?.message}>
        <Input
          autoComplete="off"
          autoCapitalize="words"
          enterKeyHint="next"
          placeholder={f.leadNamePlaceholder}
          {...form.register("leadName", {
            onChange: (event) => {
              // Editing the name means it may no longer be the returning guest.
              if (selected && event.target.value.trim() !== selected.guest.name) {
                form.setValue("existingGuestId", null, { shouldDirty: true });
              }
            },
          })}
        />
      </Field>

      {showReturning && selected?.lastStay && (
        <div className="flex items-center gap-3 rounded-xl border border-success-100 bg-success-50 px-3.5 py-2.5">
          <History className="size-5 shrink-0 text-success-600" aria-hidden />
          <p className="min-w-0 flex-1 text-subhead font-medium text-success-700">
            {f.returningPicked(formatMonthYear(selected.lastStay.checkIn))}
          </p>
          <Button
            variant="ghost"
            size="sm"
            leadingIcon={<X />}
            onClick={() => form.setValue("existingGuestId", null, { shouldDirty: true })}
          >
            {f.returningClear}
          </Button>
        </div>
      )}

      {suggestions.length > 0 && (
        <div
          className={cn(surfaceStyles({ radius: "md", elevation: "none" }), "overflow-hidden")}
          role="region"
          aria-label={f.returningTitle}
        >
          <p className="border-b border-line bg-subtle px-3.5 py-2 text-footnote font-semibold text-ink-3">
            {f.returningTitle}
          </p>
          <ul className="divide-y divide-line">
            {suggestions.map((summary) => (
              <li key={summary.guest.id} className="flex items-center gap-3 px-3.5 py-2.5">
                <Avatar name={summary.guest.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-callout font-medium text-ink">{summary.guest.name}</p>
                  <p className="truncate text-footnote text-ink-3">
                    {t.common.count.stays(summary.stayCount)}
                    {summary.lastStay && ` · ${formatMonthYear(summary.lastStay.checkIn)}`}
                  </p>
                </div>
                <Button variant="soft" size="sm" onClick={() => pickGuest(summary)}>
                  {f.returningUse}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Field label={f.leadPhone} hint={f.leadPhoneHint} error={errors.leadPhone?.message} optional>
        <Controller
          control={form.control}
          name="leadPhone"
          render={({ field }) => <PhoneInput value={field.value} onChange={field.onChange} onBlur={field.onBlur} />}
        />
      </Field>
    </div>
  );
}

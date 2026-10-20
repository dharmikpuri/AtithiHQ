"use client";

import { X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Page, ScreenHeader, ScreenTitle } from "@/components/layout/page";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { IconButton } from "@/components/ui/icon-button";
import { Skeleton } from "@/components/ui/skeleton";
import { routes } from "@/config/routes";
import { useCopy } from "@/content";
import { addedGuestCount, paidAmount } from "@/domain/booking-rules";
import { inventoryOf } from "@/domain/inventory";
import { useCurrentSession } from "@/features/auth/queries";
import { useGuests } from "@/features/guests/queries";
import { isApiError } from "@/lib/api";
import { useBooking, useCreateBooking, useUpdateBooking } from "../queries";
import { BookingForm } from "./booking-form";
import {
  bookingToFormValues,
  emptyBookingForm,
  toBookingInput,
  toCreateBookingInput,
  type BookingFormValues,
} from "./booking-form-schema";

/** Close button that asks before throwing away typed details. */
function useGuardedClose(href: string) {
  const router = useRouter();
  const [dirty, setDirty] = useState(false);
  const [confirming, setConfirming] = useState(false);
  return {
    setDirty,
    requestClose: () => (dirty ? setConfirming(true) : router.push(href)),
    confirmProps: {
      open: confirming,
      onOpenChange: setConfirming,
      onConfirm: () => {
        setConfirming(false);
        router.push(href);
      },
    },
  };
}

function FormFrame({
  title,
  onClose,
  children,
  confirmProps,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  confirmProps: ReturnType<typeof useGuardedClose>["confirmProps"];
}) {
  const t = useCopy();
  return (
    <>
      <ScreenHeader
        title={title}
        width="wide"
        leading={
          <IconButton aria-label={t.common.actions.close} onClick={onClose} className="-ml-2">
            <X />
          </IconButton>
        }
      />
      <Page width="wide" className="pt-2 pb-8">
        <ScreenTitle title={title} />
        {children}
      </Page>
      <ConfirmDialog
        {...confirmProps}
        title={t.common.discard.title}
        description={t.common.discard.body}
        confirmLabel={t.common.actions.discard}
        cancelLabel={t.common.actions.keepEditing}
        tone="danger"
      />
    </>
  );
}

function FormSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-hidden>
      {["h-56", "h-44", "h-40"].map((height) => (
        <Skeleton key={height} className={`w-full rounded-2xl ${height}`} />
      ))}
    </div>
  );
}

export function NewBookingScreen() {
  const t = useCopy();
  const router = useRouter();
  const create = useCreateBooking();
  const guard = useGuardedClose(routes.bookings);
  const inventory = inventoryOf(useCurrentSession().property);

  // "New booking for this guest" from a guest profile pre-fills the person.
  const guestId = useSearchParams().get("guest");
  const guests = useGuests();
  const prefill = guestId ? guests.data?.find((item) => item.guest.id === guestId) : undefined;
  const waitingForPrefill = Boolean(guestId) && guests.isPending;

  const defaultValues: BookingFormValues = prefill
    ? {
        ...emptyBookingForm,
        leadName: prefill.guest.name,
        leadPhone: prefill.guest.phone ?? "",
        existingGuestId: prefill.guest.id,
      }
    : emptyBookingForm;

  function submit(values: BookingFormValues) {
    create.mutate(toCreateBookingInput(values, inventory), {
      onSuccess: (booking) => {
        guard.setDirty(false);
        router.replace(routes.booking(booking.id, { created: true }));
      },
      onError: (error) =>
        toast.error(isApiError(error, "unavailable") ? t.bookings.form.unavailableSaved : t.common.states.errorBody),
    });
  }

  return (
    <FormFrame title={t.bookings.form.newTitle} onClose={guard.requestClose} confirmProps={guard.confirmProps}>
      {waitingForPrefill ? (
        <FormSkeleton />
      ) : (
        <BookingForm
          key={prefill?.guest.id ?? "new"}
          mode="create"
          defaultValues={defaultValues}
          submitting={create.isPending || create.isSuccess}
          onSubmit={submit}
          onDirtyChange={guard.setDirty}
        />
      )}
    </FormFrame>
  );
}

export function EditBookingScreen({ bookingId }: { bookingId: string }) {
  const t = useCopy();
  const router = useRouter();
  const { data: booking, isPending, isError, error, refetch, isPlaceholderData } = useBooking(bookingId);
  const update = useUpdateBooking(bookingId);
  const guard = useGuardedClose(routes.booking(bookingId));
  const inventory = inventoryOf(useCurrentSession().property);

  function submit(values: BookingFormValues) {
    update.mutate(toBookingInput(values, inventory), {
      onSuccess: () => {
        guard.setDirty(false);
        toast.success(t.bookings.form.saved);
        router.replace(routes.booking(bookingId));
      },
      onError: (error) =>
        toast.error(isApiError(error, "unavailable") ? t.bookings.form.unavailableSaved : t.common.states.errorBody),
    });
  }

  return (
    <FormFrame title={t.bookings.form.editTitle} onClose={guard.requestClose} confirmProps={guard.confirmProps}>
      {isPending || isPlaceholderData ? (
        <FormSkeleton />
      ) : isError ? (
        isApiError(error, "not_found") ? (
          <EmptyState title={t.common.states.notFoundTitle} description={t.bookings.detail.notFound} />
        ) : (
          <ErrorState onRetry={() => refetch()} />
        )
      ) : (
        <BookingForm
          mode="edit"
          bookingId={booking.id}
          defaultValues={bookingToFormValues(booking)}
          minGuestCount={addedGuestCount(booking)}
          paidSoFar={paidAmount(booking)}
          submitting={update.isPending}
          onSubmit={submit}
          onDirtyChange={guard.setDirty}
        />
      )}
    </FormFrame>
  );
}

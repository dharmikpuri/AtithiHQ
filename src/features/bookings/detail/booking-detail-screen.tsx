"use client";

import { Ban, MoreHorizontal, Pencil, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Page, ScreenHeader } from "@/components/layout/page";
import { ActionMenu, type ActionMenuItem } from "@/components/ui/action-menu";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { IconButton } from "@/components/ui/icon-button";
import { Notice } from "@/components/ui/notice";
import { Skeleton } from "@/components/ui/skeleton";
import { routes } from "@/config/routes";
import { useCopy } from "@/content";
import { isCancelled, leadNameOf } from "@/domain/booking-rules";
import type { BookingGuestDetails, BookingRecord } from "@/domain/read-models";
import type { Payment } from "@/domain/types";
import { useCurrentSession } from "@/features/auth/queries";
import { ReceiptCard } from "@/features/invoices/components/receipt-card";
import { isApiError } from "@/lib/api";
import { formatFullDate } from "@/lib/dates";
import { useBooking, useCancelBooking, useRestoreBooking } from "../queries";
import { shareKindFor, type ShareKind } from "../share";
import { BookingHero } from "./booking-hero";
import { GuestEntrySheet } from "./guest-entry-sheet";
import { GuestsCard } from "./guests-card";
import { PaymentCard } from "./payment-card";
import { PaymentSheet, TotalAmountSheet } from "./payment-sheets";
import { ShareLinkSheet } from "./share-link-sheet";

type Overlay =
  | { kind: "share"; shareKind: ShareKind; justCreated: boolean }
  | { kind: "guest"; entry: BookingGuestDetails | null }
  | { kind: "payment"; payment: Payment | null }
  | { kind: "total" }
  | { kind: "cancel" };

export function BookingDetailScreen({ bookingId }: { bookingId: string }) {
  const t = useCopy();
  const d = t.bookings.detail;
  const { data: booking, isPending, isError, error, refetch } = useBooking(bookingId);

  return (
    <>
      <ScreenHeader
        width="fluid"
        title={booking ? leadNameOf(booking) : d.title}
        backHref={routes.bookings}
        backLabel={d.back}
        revealTitleOnScroll
        actions={booking && <BookingActions booking={booking} />}
      />
      <Page width="fluid" className="pt-1 pb-10 md:pt-2">
        {isPending ? (
          <DetailSkeleton />
        ) : isError ? (
          isApiError(error, "not_found") ? (
            <EmptyState
              title={t.common.states.notFoundTitle}
              description={d.notFound}
              action={
                <Button asChild variant="secondary">
                  <Link href={routes.bookings}>{d.back}</Link>
                </Button>
              }
            />
          ) : (
            <ErrorState onRetry={() => refetch()} />
          )
        ) : (
          <BookingDetail booking={booking} />
        )}
      </Page>
    </>
  );
}

function BookingDetail({ booking }: { booking: BookingRecord }) {
  const t = useCopy();
  const d = t.bookings.detail;
  const router = useRouter();
  const searchParams = useSearchParams();
  const { property } = useCurrentSession();
  const restore = useRestoreBooking(booking.id);

  // Straight after creating a booking, offer to send the link.
  const justCreated = searchParams.get("created") === "1";

  // One overlay at a time. `open` is kept separate so sheets can animate out,
  // and `key` gives each opening a fresh form.
  const [overlay, setOverlay] = useState<Overlay | null>(() =>
    justCreated ? { kind: "share", shareKind: "invite", justCreated: true } : null,
  );
  const [open, setOpen] = useState(justCreated);
  const [key, setKey] = useState(0);
  const show = (next: Overlay) => {
    setOverlay(next);
    setKey((value) => value + 1);
    setOpen(true);
  };
  const sheetProps = { open, onOpenChange: setOpen };

  // Drop `?created=1` so a refresh or back navigation doesn't reopen the sheet.
  useEffect(() => {
    if (justCreated) router.replace(routes.booking(booking.id), { scroll: false });
  }, [justCreated, booking.id, router]);

  const cancelled = isCancelled(booking);

  return (
    <div className="flex flex-col gap-6">
      {cancelled && (
        <Notice
          tone="neutral"
          icon={Ban}
          title={d.cancelledBanner(booking.cancelledAt ? formatFullDate(booking.cancelledAt.slice(0, 10)) : "")}
          action={
            <Button
              variant="secondary"
              size="sm"
              leadingIcon={<RotateCcw />}
              loading={restore.isPending}
              onClick={() => restore.mutate(undefined, restoreCallbacks(t))}
            >
              {d.restore}
            </Button>
          }
        >
          {d.cancelledBody}
        </Notice>
      )}

      <BookingHero booking={booking} property={property} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-start lg:gap-6">
        <GuestsCard
          booking={booking}
          idRequirement={property.idRequirement}
          onOpenEntry={(entry) => show({ kind: "guest", entry })}
          onShare={() => show({ kind: "share", shareKind: shareKindFor(booking), justCreated: false })}
        />
        <div className="flex flex-col gap-4 lg:gap-6">
          <PaymentCard
            booking={booking}
            onRecord={() => show({ kind: "payment", payment: null })}
            onEditPayment={(payment) => show({ kind: "payment", payment })}
            onEditTotal={() => show({ kind: "total" })}
          />
          <ReceiptCard booking={booking} />
        </div>
      </div>

      {overlay?.kind === "share" && (
        <ShareLinkSheet
          key={key}
          booking={booking}
          kind={overlay.shareKind}
          justCreated={overlay.justCreated}
          {...sheetProps}
        />
      )}
      {overlay?.kind === "guest" && (
        <GuestEntrySheet key={key} booking={booking} entry={overlay.entry} {...sheetProps} />
      )}
      {overlay?.kind === "payment" && (
        <PaymentSheet key={key} booking={booking} payment={overlay.payment} {...sheetProps} />
      )}
      {overlay?.kind === "total" && <TotalAmountSheet key={key} booking={booking} {...sheetProps} />}
    </div>
  );
}

/** Edit and cancel. A visible Edit button on larger screens; everything in one menu on phones. */
function BookingActions({ booking }: { booking: BookingRecord }) {
  const t = useCopy();
  const d = t.bookings.detail;
  const router = useRouter();
  const cancel = useCancelBooking(booking.id);
  const restore = useRestoreBooking(booking.id);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const cancelled = isCancelled(booking);

  const items: ActionMenuItem[] = [
    { label: d.edit, icon: Pencil, onSelect: () => router.push(routes.editBooking(booking.id)) },
    cancelled
      ? {
          label: d.restore,
          icon: RotateCcw,
          onSelect: () => restore.mutate(undefined, restoreCallbacks(t)),
        }
      : { label: d.cancel, icon: Ban, tone: "danger", onSelect: () => setConfirmCancel(true) },
  ];

  return (
    <>
      <Button asChild variant="secondary" className="hidden sm:inline-flex">
        <Link href={routes.editBooking(booking.id)}>
          <Pencil aria-hidden />
          {d.edit}
        </Link>
      </Button>
      <ActionMenu
        title={d.menu}
        items={items}
        trigger={
          <IconButton aria-label={d.menu} variant="ghost">
            <MoreHorizontal />
          </IconButton>
        }
      />
      <ConfirmDialog
        open={confirmCancel}
        onOpenChange={setConfirmCancel}
        title={d.cancelConfirm.title}
        description={d.cancelConfirm.body}
        confirmLabel={d.cancelConfirm.confirm}
        cancelLabel={d.cancelConfirm.keep}
        tone="danger"
        loading={cancel.isPending}
        onConfirm={() =>
          cancel.mutate(undefined, {
            onSuccess: () => {
              setConfirmCancel(false);
              toast.success(d.cancelled);
            },
            onError: () => toast.error(t.common.states.errorBody),
          })
        }
      />
    </>
  );
}

function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-hidden>
      <div className="flex flex-col gap-3">
        <Skeleton className="h-7 w-32 rounded-full" />
        <Skeleton className="h-9 w-56" />
      </div>
      <Skeleton className="h-36 w-full rounded-2xl md:h-20" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-80 rounded-2xl" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    </div>
  );
}

/** Restoring confirms, or explains why the rooms aren't free any more. */
function restoreCallbacks(t: ReturnType<typeof useCopy>) {
  return {
    onSuccess: () => toast.success(t.bookings.detail.restored),
    onError: (error: unknown) =>
      toast.error(isApiError(error, "unavailable") ? t.bookings.detail.restoreUnavailable : t.common.states.errorBody),
  };
}

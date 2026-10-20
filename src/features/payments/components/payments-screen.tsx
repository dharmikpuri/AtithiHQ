"use client";

import { CircleCheck } from "lucide-react";
import { useState } from "react";
import { Page, PageTitle } from "@/components/layout/page";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { ExportButton, type ExportPeriod } from "@/components/ui/export-button";
import { FilterButton, FilterChips, NoFilterResults } from "@/components/ui/filters";
import { useCopy } from "@/content";
import { groupOutstanding } from "@/domain/booking-collections";
import { latestInvoicesByBooking } from "@/domain/invoice";
import type { BookingRecord } from "@/domain/read-models";
import { PaymentSheet } from "@/features/bookings/detail/payment-sheets";
import { useBookings } from "@/features/bookings/queries";
import { useInvoices } from "@/features/invoices/queries";
import { todayISO } from "@/lib/dates";
import type { ExportFormat } from "@/lib/export/table";
import { inRange, type FilterState } from "@/lib/filters";
import { useUrlFilters } from "@/lib/hooks/use-url-filters";
import { matchesPaymentFilters, paymentFilterFields, receivedPayments } from "../payment-filters";
import { NoAmountGroup, OutstandingGroup, OutstandingListSkeleton, totalDue } from "./outstanding-list";
import { PaymentsSummary, PaymentsSummarySkeleton } from "./payments-summary";

/** Who owes what, without opening every booking. */
export function PaymentsScreen() {
  const t = useCopy();
  const { data: bookings, isPending, isError, refetch } = useBookings();

  return (
    <Page width="fluid" className="pb-8">
      <PageTitle title={t.payments.title} subtitle={t.payments.subtitle} />
      {isPending ? (
        <div className="flex flex-col gap-7">
          <PaymentsSummarySkeleton />
          <OutstandingListSkeleton />
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (
        <PaymentsContent bookings={bookings} />
      )}
    </Page>
  );
}

function PaymentsContent({ bookings }: { bookings: BookingRecord[] }) {
  const t = useCopy();
  const today = todayISO();
  const fields = paymentFilterFields(t);
  const filters = useUrlFilters(fields);
  const filtering = filters.activeCount > 0;
  const matching = (state: FilterState) => bookings.filter((booking) => matchesPaymentFilters(booking, state, today));
  const filtered = matching(filters.values);
  const groups = groupOutstanding(filtered, today);

  const { data: invoices } = useInvoices();
  const receiptNumbers = new Map(
    [...latestInvoicesByBooking(invoices ?? [])].map(([bookingId, invoice]) => [
      bookingId,
      { number: invoice.number, shared: invoice.lastLink !== null },
    ]),
  );

  /**
   * On screen: the pending list as shown, plus payments received on those bookings.
   * A period: pending bookings checking in within it, and payments received within it.
   */
  const exportData = (period: ExportPeriod) => {
    if (period.kind === "view") return { pending: groups, received: receivedPayments(filtered, filters.values) };
    const range = { from: period.from, to: period.to };
    const others = { ...filters.values, checkin: undefined };
    return {
      pending: groupOutstanding(matching({ ...others, checkin: range }), today),
      received: receivedPayments(matching(others), filters.values).filter((row) =>
        inRange(row.payment.receivedOn, range),
      ),
    };
  };

  const exportFile = async (format: ExportFormat, period: ExportPeriod) => {
    const { pending, received } = exportData(period);
    const [{ exportTables }, { paymentsExportTables }] = await Promise.all([
      import("@/lib/export"),
      import("../export"),
    ]);
    // CSV holds the first sheet (pending payments, as on screen); Excel adds received payments.
    return exportTables({
      area: t.payments.export.fileName,
      tables: paymentsExportTables(t, pending, received),
      format,
      today,
    });
  };

  // The booking being paid for, as it was when the sheet opened, so nothing
  // shifts while the sheet animates out. `key` gives each opening a fresh form.
  const [recording, setRecording] = useState<BookingRecord | null>(null);
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState(0);
  const record = (booking: BookingRecord) => {
    setRecording(booking);
    setKey((value) => value + 1);
    setOpen(true);
  };

  return (
    <div className="flex flex-col gap-7 lg:gap-8">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-end gap-2">
          <FilterButton
            fields={fields}
            values={filters.values}
            onApply={filters.apply}
            countFor={(draft) => groupOutstanding(matching(draft), today).count}
          />
          <ExportButton
            what={t.payments.export.what}
            describe={(period) => {
              const { pending, received } = exportData(period);
              return pending.count || received.length
                ? t.payments.export.summary(pending.count, received.length)
                : null;
            }}
            onExport={exportFile}
          />
        </div>
        <FilterChips fields={fields} values={filters.values} onApply={filters.apply} />
      </div>

      {groups.count === 0 && filtering ? (
        <Card>
          <NoFilterResults onClear={() => filters.apply({})} />
        </Card>
      ) : groups.count === 0 ? (
        <AllSettled />
      ) : (
        <>
          <PaymentsSummary
            total={groups.total}
            count={groups.count}
            overdue={totalDue(groups.overdue)}
            overdueCount={groups.overdue.length}
          />
          <OutstandingGroup
            kind="overdue"
            bookings={groups.overdue}
            today={today}
            receiptNumbers={receiptNumbers}
            onRecord={record}
          />
          <OutstandingGroup
            kind="current"
            bookings={groups.current}
            today={today}
            receiptNumbers={receiptNumbers}
            onRecord={record}
          />
          <OutstandingGroup
            kind="upcoming"
            bookings={groups.upcoming}
            today={today}
            receiptNumbers={receiptNumbers}
            onRecord={record}
          />
        </>
      )}

      <NoAmountGroup bookings={groups.noAmount} />

      {recording && (
        <PaymentSheet key={key} booking={recording} payment={null} open={open} onOpenChange={setOpen} showGuest />
      )}
    </div>
  );
}

function AllSettled() {
  const copy = useCopy().payments.empty;
  return (
    <Card>
      <EmptyState
        illustration={
          <span className="flex size-14 items-center justify-center rounded-2xl bg-success-50 text-success-600">
            <CircleCheck className="size-7" aria-hidden />
          </span>
        }
        title={copy.title}
        description={copy.body}
      />
    </Card>
  );
}

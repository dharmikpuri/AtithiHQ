"use client";

import { ChevronRight, IndianRupee, Pencil, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Notice } from "@/components/ui/notice";
import { ProgressBar } from "@/components/ui/progress-bar";
import { useCopy } from "@/content";
import { dueAmount, isCancelled, overpaidAmount, paidAmount, paidRatio, paymentState } from "@/domain/booking-rules";
import type { BookingRecord } from "@/domain/read-models";
import type { Payment } from "@/domain/types";
import { cn } from "@/lib/cn";
import { formatDayMonth } from "@/lib/dates";
import { formatINR } from "@/lib/money";
import { paymentPresentation } from "../status";

interface PaymentCardProps {
  booking: BookingRecord;
  onRecord: () => void;
  onEditPayment: (payment: Payment) => void;
  onEditTotal: () => void;
}

/** Total, received, due — the money question answered in seconds. */
export function PaymentCard({ booking, onRecord, onEditPayment, onEditTotal }: PaymentCardProps) {
  const t = useCopy();
  const p = t.bookings.payments;
  const state = paymentState(booking);
  const presentation = paymentPresentation(t, booking);
  const cancelled = isCancelled(booking);
  const due = dueAmount(booking);
  const paid = paidAmount(booking);

  return (
    <Card>
      <div className="flex items-center justify-between gap-3 px-4 pt-4 sm:px-5 sm:pt-5">
        <h2 className="text-headline text-ink">{p.title}</h2>
        {state !== "no_amount" && !cancelled && (
          <Badge tone={presentation.tone}>{t.bookings.payment.states[state]}</Badge>
        )}
      </div>

      {booking.totalAmount === null ? (
        <div className="flex flex-col items-start gap-3 px-4 py-4 sm:px-5">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-accent-50 text-accent-600">
              <IndianRupee className="size-5" aria-hidden />
            </span>
            <div>
              <p className="text-callout font-semibold text-ink">{p.noTotal}</p>
              <p className="text-subhead text-ink-3">{p.noTotalBody}</p>
            </div>
          </div>
          {!cancelled && (
            <Button variant="soft" leadingIcon={<Plus />} onClick={onEditTotal}>
              {p.addTotal}
            </Button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3 px-4 pt-4 sm:px-5">
          <dl className="flex flex-col gap-2 text-callout">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-ink-3">{p.total}</dt>
              <dd className="flex items-center gap-1 font-medium text-ink tabular">
                {formatINR(booking.totalAmount)}
                {!cancelled && (
                  <button
                    type="button"
                    onClick={onEditTotal}
                    aria-label={p.editTotal}
                    className="-mr-2 flex size-8 items-center justify-center rounded-full text-ink-3 hover:bg-ink/5 hover:text-ink"
                  >
                    <Pencil className="size-4" />
                  </button>
                )}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-ink-3">{p.received}</dt>
              <dd className="font-medium text-ink tabular">{formatINR(paid)}</dd>
            </div>
          </dl>
          <ProgressBar value={paidRatio(booking)} tone={due === 0 ? "success" : "accent"} label={p.progressLabel} />
          <div className="flex items-baseline justify-between gap-3 border-t border-line pt-3">
            <span className="text-body font-medium text-ink-2">{p.due}</span>
            <span
              className={cn(
                "text-title-2 tabular",
                cancelled ? "text-ink-3" : due ? "text-accent-700" : "text-success-600",
              )}
            >
              {formatINR(due ?? 0)}
            </span>
          </div>
          {state === "overpaid" && <Notice tone="warning">{p.overpaidNote(formatINR(overpaidAmount(booking)))}</Notice>}
        </div>
      )}

      <div className="mt-4 border-t border-line">
        <p className="px-4 pt-3 pb-1 text-subhead font-semibold text-ink-2 sm:px-5">{p.history}</p>
        {booking.payments.length === 0 ? (
          <p className="px-4 pb-3 text-subhead text-ink-3 sm:px-5">{p.noPayments}</p>
        ) : (
          <ul className="divide-y divide-line">
            {booking.payments.map((payment) => (
              <li key={payment.id}>
                <button
                  type="button"
                  onClick={() => onEditPayment(payment)}
                  disabled={cancelled}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-subtle active:bg-canvas disabled:pointer-events-none sm:px-5"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-callout font-medium text-ink">
                      {t.common.paymentMethods[payment.method]}
                    </span>
                    <span className="block truncate text-footnote text-ink-3">
                      {formatDayMonth(payment.receivedOn)}
                      {payment.note && ` · ${payment.note}`}
                    </span>
                  </span>
                  <span className="text-callout font-semibold text-ink tabular">{formatINR(payment.amount)}</span>
                  {!cancelled && <ChevronRight className="size-5 shrink-0 text-ink-4" aria-hidden />}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {!cancelled && (
        <div className="border-t border-line px-4 py-4 sm:px-5">
          <Button variant={due ? "primary" : "secondary"} size="lg" fullWidth leadingIcon={<Plus />} onClick={onRecord}>
            {p.record}
          </Button>
        </div>
      )}
    </Card>
  );
}

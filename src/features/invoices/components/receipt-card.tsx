"use client";

import { FileText, PencilLine, Plus } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DocumentModal } from "@/components/ui/document-modal";
import { Notice } from "@/components/ui/notice";
import { Skeleton } from "@/components/ui/skeleton";
import { useCopy } from "@/content";
import { isCancelled } from "@/domain/booking-rules";
import { invoiceBlocker, isReceiptLinkExpired, isStale, latestInvoiceOf } from "@/domain/invoice";
import type { BookingRecord } from "@/domain/read-models";
import { useCurrentSession } from "@/features/auth/queries";
import { formatDateTime, formatFullDate } from "@/lib/dates";
import { useInvoices, useInvoicesRefreshing } from "../queries";
import { CreateReceiptSheet } from "./create-receipt-sheet";
import { DownloadPdfButton } from "./download-pdf-button";
import { InvoiceDocument, moneyFormatterFor } from "./invoice-document";
import { SendReceiptButton } from "./send-receipt-button";

/** The booking's receipt or tax invoice: create it, read it, and see when it needs updating. */
export function ReceiptCard({ booking }: { booking: BookingRecord }) {
  const t = useCopy();
  const c = t.invoices.card;
  const share = t.invoices.share;
  const { property } = useCurrentSession();
  const { data: invoices, isPending, isError } = useInvoices();
  const refreshing = useInvoicesRefreshing();
  const [creating, setCreating] = useState(false);
  const [createKey, setCreateKey] = useState(0);
  const [previewing, setPreviewing] = useState(false);

  const cancelled = isCancelled(booking);
  const invoice = invoices && latestInvoiceOf(invoices, booking.id);
  const blocker = invoiceBlocker(booking);

  // A cancelled booking with no document has nothing to show, and can't get one.
  if (cancelled && !isPending && !invoice) return null;

  const openCreate = () => {
    setCreateKey((value) => value + 1);
    setCreating(true);
  };
  const title = invoice ? t.invoices.kinds[invoice.kind].title : property.gst ? c.titleGst : c.title;

  return (
    <Card>
      <div className="flex items-center justify-between gap-3 px-4 pt-4 sm:px-5 sm:pt-5">
        <h2 className="min-w-0 truncate text-headline text-ink">{title}</h2>
        {invoice && cancelled && <Badge tone="danger">{c.cancelled}</Badge>}
        {invoice && !cancelled && invoice.version > 1 && (
          <Badge tone="brand">{t.invoices.document.revised(invoice.version)}</Badge>
        )}
      </div>

      {isPending ? (
        <div className="flex flex-col gap-2 p-4 sm:p-5" aria-hidden>
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>
      ) : isError ? (
        <p className="p-4 text-subhead text-ink-3 sm:p-5">{c.loadError}</p>
      ) : invoice ? (
        <div className="flex flex-col gap-4 p-4 sm:p-5">
          <dl className="flex flex-col gap-2 text-callout">
            <Row label={c.number} value={invoice.number} />
            <Row label={c.issuedOn} value={formatFullDate(invoice.issuedOn)} />
            <Row label={c.total} value={moneyFormatterFor(invoice.kind)(invoice.snapshot.total)} />
          </dl>

          {invoice.revision && (
            <p className="text-subhead break-words text-ink-3">
              {c.revisedLine(
                formatFullDate(invoice.issuedOn),
                invoice.revision.note ?? t.invoices.revisionReasons[invoice.revision.reason],
              )}
            </p>
          )}

          {cancelled ? (
            <Notice tone="neutral">{c.cancelledBody}</Notice>
          ) : (
            !refreshing &&
            isStale(invoice, booking) && (
              <Notice
                tone="warning"
                title={c.staleTitle}
                action={
                  <Button variant="secondary" size="sm" onClick={openCreate}>
                    {c.issueUpdated}
                  </Button>
                }
              >
                {c.staleBody}
              </Notice>
            )
          )}

          {invoice.lastLink && (
            <p className="text-subhead text-ink-3">
              {isReceiptLinkExpired(invoice.lastLink.expiresAt)
                ? share.lastExpired(formatDateTime(invoice.lastLink.expiresAt))
                : share.shared(formatDateTime(invoice.lastLink.createdAt), formatDateTime(invoice.lastLink.expiresAt))}
            </p>
          )}

          <div className="flex flex-col gap-2">
            {!cancelled && <SendReceiptButton invoice={invoice} fullWidth />}
            <Button
              variant="secondary"
              size="lg"
              fullWidth
              leadingIcon={<FileText />}
              onClick={() => setPreviewing(true)}
            >
              {c.preview}
            </Button>
            {!cancelled && !refreshing && (
              <Button variant="ghost" size="md" fullWidth leadingIcon={<PencilLine />} onClick={openCreate}>
                {c.correct[invoice.kind]}
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-start gap-3 p-4 sm:p-5">
          <p className="text-subhead text-ink-3">{property.gst ? c.emptyGst : c.empty}</p>
          <Button
            variant="soft"
            size="lg"
            fullWidth
            leadingIcon={<Plus />}
            disabled={blocker !== null}
            onClick={openCreate}
          >
            {property.gst ? c.createGst : c.create}
          </Button>
          {blocker === "no_total" && <p className="text-subhead text-ink-3">{c.noTotal}</p>}
        </div>
      )}

      {/* Stays mounted after the first opening so the sheet can animate out; `key` gives each opening fresh choices. */}
      {createKey > 0 && (
        <CreateReceiptSheet
          key={createKey}
          booking={booking}
          previous={invoice}
          open={creating}
          onOpenChange={setCreating}
        />
      )}
      {invoice && (
        <DocumentModal
          open={previewing}
          onOpenChange={setPreviewing}
          title={t.invoices.kinds[invoice.kind].title}
          footer={
            // Equal columns from `sm`: buttons don't shrink, so two full-width ones in a flex row overflow.
            <div className="grid gap-2 sm:auto-cols-fr sm:grid-flow-col">
              {!cancelled && <SendReceiptButton invoice={invoice} fullWidth />}
              <DownloadPdfButton document={invoice} cancelled={cancelled} fullWidth />
            </div>
          }
        >
          <InvoiceDocument document={invoice} cancelled={cancelled} />
        </DocumentModal>
      )}
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-baseline justify-between gap-3">
      <dt className="shrink-0 text-ink-3">{label}</dt>
      <dd className="min-w-0 text-right font-medium break-words text-ink tabular">{value}</dd>
    </div>
  );
}

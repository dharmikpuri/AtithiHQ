"use client";

import { useEffect, useId, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ChoiceChips } from "@/components/ui/choice-chips";
import { DocumentModal } from "@/components/ui/document-modal";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Notice } from "@/components/ui/notice";
import { RadioCards } from "@/components/ui/radio-cards";
import { Sheet } from "@/components/ui/sheet";
import { useCopy } from "@/content";
import { GST_RATES, type GstRate } from "@/domain/gst";
import {
  documentTotals,
  gstBreakdown,
  invoiceSnapshotOf,
  isStale,
  paiseToRupees,
  revisionGstOf,
  seriesOf,
  type GstMode,
  type InvoiceChoice,
  type InvoiceKind,
} from "@/domain/invoice";
import type { BookingRecord } from "@/domain/read-models";
import { REVISION_NOTE_MAX } from "@/domain/constants";
import type { Invoice, InvoiceRevision, InvoiceSnapshot, RevisionReasonCode } from "@/domain/types";
import { useCurrentSession } from "@/features/auth/queries";
import { formatINR, formatINRPaise } from "@/lib/money";
import { useIssueInvoice } from "../queries";
import { InvoiceDocument, moneyFormatterFor } from "./invoice-document";

type GstKind = "tax_invoice" | "payment_receipt";

const RATE_OPTIONS = GST_RATES.map((rate) => ({ value: String(rate), rate }));

/** Reasons that only make sense for a GST registered property. */
const GST_REASONS: readonly RevisionReasonCode[] = ["wrong_gst_rate", "wrong_gst_treatment", "wrong_document_type"];
const REASONS: readonly RevisionReasonCode[] = [
  "booking_changed",
  "wrong_gst_rate",
  "wrong_gst_treatment",
  "wrong_document_type",
  "other",
];

/**
 * Create a receipt or tax invoice for a booking, or an updated version of the one it has.
 * The numbers on screen come from the same functions as the document, so what you see is what is issued.
 * Mount with a fresh `key` per open.
 */
export function CreateReceiptSheet({
  booking,
  previous,
  open,
  onOpenChange,
}: {
  booking: BookingRecord;
  /** The document being replaced, when this issues an updated version. */
  previous?: Invoice;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useCopy();
  const c = t.invoices.sheet;
  const { owner, property } = useCurrentSession();
  const issue = useIssueInvoice();
  const checkboxId = useId();
  const gst = property.gst;
  const total = booking.totalAmount ?? 0;

  const [kind, setKind] = useState<GstKind>(previous?.kind === "payment_receipt" ? "payment_receipt" : "tax_invoice");
  // A first document has no default: the owner has to say whether the total already includes GST.
  // An updated one carries the previous treatment over (see `revisionGstOf`).
  const revision = revisionGstOf(previous, booking);
  const [mode, setMode] = useState<GstMode | null>(revision.mode);
  const [rate, setRate] = useState<GstRate>(previous?.snapshot.gst?.breakdown.rate ?? gst?.rate ?? GST_RATES[0]);
  const [updateTotal, setUpdateTotal] = useState(true);
  // Adding GST on top of a total that the last invoice already raised by its GST charges it twice.
  const doubleGst = revision.previousRaisedTotal && mode === "added" ? gstBreakdown(total, rate, "added") : null;
  // On a phone the warning can land behind the sticky buttons: bring it into view when it appears.
  const warningRef = useRef<HTMLDivElement>(null);
  const warned = doubleGst !== null;
  useEffect(() => {
    if (warned) warningRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [warned]);
  const [previewing, setPreviewing] = useState(false);

  // Replacing a document needs a reason for the owner's records. If the booking changed, that is the likely one.
  const [reason, setReason] = useState<RevisionReasonCode | null>(
    previous && isStale(previous, booking) ? "booking_changed" : null,
  );
  const [reasonNote, setReasonNote] = useState("");
  const reasonOptions = REASONS.filter((code) => gst || !GST_REASONS.includes(code)).map((code) => ({
    value: code,
    label: t.invoices.revisionReasons[code],
  }));
  const revisionInput: InvoiceRevision | null =
    reason && (reason !== "other" || reasonNote.trim())
      ? { reason, note: reason === "other" ? reasonNote.trim() : null }
      : null;
  const reasonMissing = previous !== undefined && revisionInput === null;

  const choice: InvoiceChoice | null = !gst
    ? { kind: "receipt" }
    : kind === "payment_receipt"
      ? { kind }
      : mode
        ? { kind, gstMode: mode, rate, updateBookingTotal: updateTotal }
        : null;
  const snapshot = choice ? invoiceSnapshotOf({ property, owner, booking, choice }) : null;
  const issueKind = choice?.kind ?? kind;
  // A revision keeps its number only within the same series; the other series starts at version 1.
  const nextVersion = previous && seriesOf(previous.kind) === seriesOf(issueKind) ? previous.version + 1 : 1;

  function submit() {
    if (!choice) return;
    const extras =
      choice.kind === "tax_invoice"
        ? { gstMode: choice.gstMode, rate: choice.rate, updateBookingTotal: choice.updateBookingTotal }
        : {};
    if (previous && !revisionInput) return;
    issue.mutate(
      { bookingId: booking.id, kind: choice.kind, ...extras, ...(revisionInput && { revision: revisionInput }) },
      {
        onSuccess: (invoice) => {
          toast.success(c.issued(invoice.number));
          onOpenChange(false);
        },
        onError: () => toast.error(t.common.states.errorBody),
      },
    );
  }

  return (
    <>
      <Sheet
        open={open}
        onOpenChange={onOpenChange}
        dismissible={!issue.isPending}
        size="lg"
        title={previous ? c.updateTitle : gst ? c.titleGst : c.title}
        description={previous ? c.updateDescription : c.description}
        footer={
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <Button
              variant="secondary"
              size="xl"
              className="sm:flex-1"
              disabled={!snapshot || issue.isPending}
              onClick={() => setPreviewing(true)}
            >
              {c.preview}
            </Button>
            <Button
              size="xl"
              className="sm:flex-1"
              disabled={!snapshot || reasonMissing}
              loading={issue.isPending}
              onClick={submit}
            >
              {previous ? c.issueRevision : t.invoices.kinds[issueKind].issue}
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-5">
          {previous && (
            <>
              <Notice tone="neutral">{c.revisionNotice}</Notice>
              <Field label={c.reasonLabel}>
                <ChoiceChips value={reason} onChange={setReason} options={reasonOptions} />
              </Field>
              {reason === "other" && (
                <Field label={c.reasonOtherLabel} hint={c.reasonOtherHint}>
                  <Input
                    value={reasonNote}
                    onChange={(event) => setReasonNote(event.target.value)}
                    placeholder={c.reasonOtherPlaceholder}
                    maxLength={REVISION_NOTE_MAX}
                  />
                </Field>
              )}
            </>
          )}

          {!gst && <p className="text-callout text-ink-2">{c.plainIntro}</p>}

          {gst && (
            <>
              <Field label={c.kindLabel}>
                <RadioCards
                  value={kind}
                  onChange={setKind}
                  options={[
                    { value: "tax_invoice", label: c.taxInvoice.label, description: c.taxInvoice.description },
                    {
                      value: "payment_receipt",
                      label: c.paymentReceipt.label,
                      description: c.paymentReceipt.description,
                    },
                  ]}
                />
              </Field>

              {kind === "payment_receipt" && <Notice tone="warning">{c.paymentReceiptWarning}</Notice>}

              {kind === "tax_invoice" && (
                <>
                  <Field label={c.modeLabel}>
                    <RadioCards
                      value={mode}
                      onChange={setMode}
                      options={[
                        {
                          value: "included",
                          label: c.included.label,
                          description: c.included.description(formatINR(total)),
                        },
                        { value: "added", label: c.added.label, description: c.added.description(formatINR(total)) },
                      ]}
                    />
                  </Field>

                  {revision.totalHasGst && mode === "included" && (
                    <Notice tone="neutral">{c.carriedIncluded(formatINR(total))}</Notice>
                  )}
                  {doubleGst && (
                    <div ref={warningRef} className="scroll-mb-4">
                      <Notice tone="warning" role="alert">
                        {c.doubleGst(formatINRPaise(doubleGst.gst), formatINRPaise(doubleGst.total))}
                      </Notice>
                    </div>
                  )}

                  <Field label={c.rateLabel}>
                    <ChoiceChips
                      value={String(rate)}
                      onChange={(value) => setRate(Number(value) as GstRate)}
                      options={RATE_OPTIONS.map((option) => ({
                        value: option.value,
                        label: c.rateOption(option.rate),
                      }))}
                    />
                  </Field>

                  {mode === "added" && (
                    <Checkbox
                      id={checkboxId}
                      checked={updateTotal}
                      onCheckedChange={(checked) => setUpdateTotal(checked === true)}
                      label={c.updateTotal(formatINR(paiseToRupees(gstBreakdown(total, rate, "added").total)))}
                    />
                  )}
                </>
              )}
            </>
          )}

          {previous && nextVersion === 1 && <Notice tone="neutral">{c.newSeriesNotice}</Notice>}

          {snapshot && <AmountSummary snapshot={snapshot} kind={issueKind} />}
        </div>
      </Sheet>

      {snapshot && (
        <DocumentModal open={previewing} onOpenChange={setPreviewing} title={t.invoices.kinds[issueKind].title}>
          <InvoiceDocument
            document={{
              kind: issueKind,
              version: nextVersion,
              snapshot,
              number: null,
              issuedOn: null,
            }}
          />
        </DocumentModal>
      )}
    </>
  );
}

/** The live figures: what the document will total, what was received and what is left. */
function AmountSummary({ snapshot, kind }: { snapshot: InvoiceSnapshot; kind: InvoiceKind }) {
  const d = useCopy().invoices.document;
  const money = moneyFormatterFor(kind);
  const totals = documentTotals(snapshot.total, snapshot.payments);
  const rows: { label: string; value: string; strong?: boolean }[] = [
    ...(snapshot.gst
      ? [
          { label: d.taxable, value: money(snapshot.gst.breakdown.taxable) },
          { label: d.gst(snapshot.gst.breakdown.rate), value: money(snapshot.gst.breakdown.gst) },
        ]
      : []),
    { label: d.total, value: money(snapshot.total), strong: true },
    { label: d.received, value: money(totals.received) },
    { label: d.balanceDue, value: totals.paidInFull ? d.paidInFull : money(totals.balanceDue) },
  ];

  return (
    <dl className="flex flex-col gap-2 rounded-xl border border-line bg-subtle p-4 text-callout" aria-live="polite">
      {rows.map((row) => (
        <div key={row.label} className="flex min-w-0 items-baseline justify-between gap-3">
          <dt className={row.strong ? "min-w-0 font-semibold break-words text-ink" : "min-w-0 break-words text-ink-2"}>
            {row.label}
          </dt>
          <dd
            className={row.strong ? "shrink-0 font-semibold text-ink tabular" : "shrink-0 font-medium text-ink tabular"}
          >
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

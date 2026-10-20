import type { ReactNode } from "react";
import { PropertyIllustration } from "@/components/brand/property-illustration";
import { Badge } from "@/components/ui/badge";
import { useCopy } from "@/content";
import { documentTotals, type InvoiceKind } from "@/domain/invoice";
import { formatAddressLines } from "@/domain/profiles";
import type { Invoice, ISODate, Paise } from "@/domain/types";
import { cn } from "@/lib/cn";
import { formatFullDate } from "@/lib/dates";
import { formatINR, formatINRPaise } from "@/lib/money";
import { formatPhone, maskPhone } from "@/lib/phone";

/** What the paper needs. A draft has no number or issue date yet. */
export interface InvoiceDocumentData extends Pick<Invoice, "kind" | "version" | "snapshot"> {
  number: string | null;
  issuedOn: ISODate | null;
}

/** Tax invoices show paise; plain receipts are whole rupees, so they keep the app's usual format. */
export function moneyFormatterFor(kind: InvoiceKind): (paise: Paise) => string {
  return kind === "tax_invoice" ? formatINRPaise : (paise) => formatINR(paise / 100);
}

/**
 * The receipt or tax invoice as a white sheet of paper. It carries only the property's own branding.
 * Everything comes from the snapshot, so an issued document reads the same forever. The layout follows the
 * document's own width (container queries, not the screen's), so the modal, the public page and the PDF render
 * agree: narrow, the rows stack and long names wrap, so nothing scrolls sideways.
 */
export function InvoiceDocument({
  document,
  cancelled = false,
  className,
}: {
  document: InvoiceDocumentData;
  /** Derived from the booking when viewed; the snapshot itself is never changed. */
  cancelled?: boolean;
  className?: string;
}) {
  const t = useCopy();
  const d = t.invoices.document;
  const { snapshot, kind } = document;
  const { property, owner, gst, guest, stay } = snapshot;
  const money = moneyFormatterFor(kind);
  const totals = documentTotals(snapshot.total, snapshot.payments);
  const draft = document.number === null;

  return (
    <div className="@container min-w-0">
      <article
        aria-label={t.invoices.kinds[kind].title}
        className={cn(
          "relative flex min-w-0 flex-col gap-6 rounded-2xl border border-line bg-surface p-4 text-ink shadow-card @xl:p-8",
          className,
        )}
      >
        <header className="flex min-w-0 flex-col gap-4 border-b border-line pb-5 @xl:flex-row @xl:justify-between @xl:gap-6">
          <div className="flex min-w-0 items-start gap-3.5">
            <PropertyIllustration type={property.type} />
            <div className="flex min-w-0 flex-col gap-0.5">
              <h3 className="text-title-3 break-words text-ink">{property.name}</h3>
              {formatAddressLines(property).map((line) => (
                <p key={line} className="text-subhead break-words text-ink-3">
                  {line}
                </p>
              ))}
              {gst && <p className="mt-1 text-subhead font-semibold break-words text-ink-2">{d.gstin(gst.gstin)}</p>}
            </div>
          </div>
          <div className="flex min-w-0 flex-col gap-0.5 @xl:max-w-56 @xl:items-end @xl:text-right">
            <p className="text-footnote font-medium text-ink-3">{d.owner}</p>
            <p className="text-subhead font-semibold break-words text-ink">{owner.name}</p>
            <p className="text-subhead text-ink-2 tabular">{formatPhone(owner.phone)}</p>
            {owner.email && <p className="text-subhead break-all text-ink-2">{owner.email}</p>}
          </div>
        </header>

        <div className="flex min-w-0 flex-wrap items-start justify-between gap-x-4 gap-y-3">
          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-title-2 text-ink">{t.invoices.kinds[kind].title}</h3>
              {draft && <Badge tone="neutral">{d.draft}</Badge>}
              {document.version > 1 && <Badge tone="brand">{d.revised(document.version)}</Badge>}
            </div>
            <p className="text-subhead break-words text-ink-2 tabular">
              {draft ? d.numberPending : `${d.numberLabel} ${document.number}`}
            </p>
            {document.issuedOn && (
              <p className="text-subhead text-ink-3">
                {d.issuedOn} {formatFullDate(document.issuedOn)}
              </p>
            )}
          </div>
          {cancelled && (
            <span className="-rotate-3 rounded-md border-2 border-danger-600 px-2.5 py-0.5 text-subhead font-bold tracking-widest text-danger-600 uppercase">
              {d.cancelledStamp}
            </span>
          )}
        </div>

        <div className="grid min-w-0 grid-cols-1 gap-6 @xl:grid-cols-2">
          <Section title={d.billedTo}>
            <p className="text-callout font-medium break-words text-ink">{guest.name}</p>
            {guest.phone && <p className="text-subhead text-ink-3 tabular">{maskPhone(guest.phone)}</p>}
          </Section>

          <Section title={d.stay}>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
              <Fact label={d.checkIn} value={formatFullDate(stay.checkIn)} />
              <Fact label={d.checkOut} value={formatFullDate(stay.checkOut)} />
              <Fact label={d.nights} value={String(stay.nights)} />
              <Fact label={d.guests} value={String(stay.guestCount)} />
              {stay.showRooms && (
                <Fact
                  label={d.rooms}
                  value={stay.roomsBooked === null ? t.bookings.rooms.whole : t.bookings.rooms.count(stay.roomsBooked)}
                />
              )}
            </dl>
          </Section>
        </div>

        <Section title={d.amounts}>
          <dl className="flex flex-col gap-2 text-callout">
            {/* On a tax invoice the accommodation line is the taxable value, so the column adds up:
              accommodation + GST = total, whether the GST was included or added on top. */}
            <Line
              label={gst ? d.accommodationTaxable(stay.nights) : d.accommodation(stay.nights)}
              value={money(gst ? gst.breakdown.taxable : snapshot.total)}
            />
            {gst && <Line label={d.gst(gst.breakdown.rate)} value={money(gst.breakdown.gst)} />}
            <Line label={d.total} value={money(snapshot.total)} strong className="border-t border-line pt-2" />
          </dl>
        </Section>

        <Section title={d.payments}>
          {snapshot.payments.length === 0 ? (
            <p className="text-subhead text-ink-3">{d.noPayments}</p>
          ) : (
            <ul className="flex flex-col gap-2 text-callout">
              {snapshot.payments.map((payment, index) => (
                <li key={index} className="flex min-w-0 items-baseline justify-between gap-3">
                  <span className="min-w-0 break-words text-ink-2">
                    {formatFullDate(payment.receivedOn)} · {t.common.paymentMethods[payment.method]}
                  </span>
                  <span className="shrink-0 font-medium text-ink tabular">{money(payment.amount * 100)}</span>
                </li>
              ))}
            </ul>
          )}
          <dl className="mt-1 flex flex-col gap-2 border-t border-line pt-3 text-callout">
            <Line label={d.received} value={money(totals.received)} />
            <Line
              label={d.balanceDue}
              value={totals.paidInFull ? d.paidInFull : money(totals.balanceDue)}
              strong
              valueClassName={totals.paidInFull ? "text-success-700" : undefined}
            />
          </dl>
        </Section>

        <footer className="border-t border-line pt-4 text-center text-subhead text-ink-3">{d.thanks}</footer>
      </article>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex min-w-0 flex-col gap-2">
      <h4 className="text-footnote font-semibold tracking-wide text-ink-3 uppercase">{title}</h4>
      {children}
    </section>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-col">
      <dt className="text-footnote text-ink-3">{label}</dt>
      <dd className="text-callout font-medium break-words text-ink">{value}</dd>
    </div>
  );
}

function Line({
  label,
  value,
  strong = false,
  className,
  valueClassName,
}: {
  label: string;
  value: string;
  strong?: boolean;
  className?: string;
  valueClassName?: string;
}) {
  return (
    <div className={cn("flex min-w-0 items-baseline justify-between gap-3", className)}>
      <dt className={cn("min-w-0 break-words", strong ? "font-semibold text-ink" : "text-ink-2")}>{label}</dt>
      <dd
        className={cn("shrink-0 tabular", strong ? "font-semibold text-ink" : "font-medium text-ink", valueClassName)}
      >
        {value}
      </dd>
    </div>
  );
}

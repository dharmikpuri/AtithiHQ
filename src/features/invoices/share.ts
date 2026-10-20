/**
 * Building and sending a shared receipt link from the owner's own WhatsApp.
 * Same idea as the guest link in `features/bookings/share.ts`: a prefilled chat, no platform number.
 */
import { routes } from "@/config/routes";
import { publicOrigin } from "@/config/site";
import { getCopy } from "@/content";
import { RECEIPT_LINK_HOURS } from "@/domain/invoice";
import type { Invoice } from "@/domain/types";
import { firstNameOf } from "@/features/bookings/share";

/** The full link sent to the guest. Uses NEXT_PUBLIC_SITE_URL in production (see `config/site.ts`). */
function receiptLinkUrl(token: string): string {
  return `${publicOrigin()}${routes.receipt(token)}`;
}

/** The WhatsApp message that goes with a fresh link. */
export function buildReceiptMessage(invoice: Pick<Invoice, "kind" | "snapshot">, token: string): string {
  const t = getCopy().invoices.share;
  return t.message(
    firstNameOf(invoice.snapshot.guest.name),
    t.kindInMessage[invoice.kind],
    invoice.snapshot.property.name,
    receiptLinkUrl(token),
    RECEIPT_LINK_HOURS,
  );
}

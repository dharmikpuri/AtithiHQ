"use client";

import { useState } from "react";
import { toast } from "sonner";
import { WhatsAppIcon } from "@/components/brand/whatsapp-icon";
import { Button } from "@/components/ui/button";
import { useCopy } from "@/content";
import { whatsappUrl } from "@/features/bookings/share";
import type { Invoice } from "@/domain/types";
import { useShareInvoice } from "../queries";
import { buildReceiptMessage } from "../share";

/**
 * "Send on WhatsApp" for an issued, current document. Each press makes a fresh link, then opens the lead
 * guest's chat (or WhatsApp without a number) with the message filled in. "Shared" only means the owner
 * opened WhatsApp, not that anything was delivered.
 */
export function SendReceiptButton({
  invoice,
  variant = "soft",
  size = "lg",
  fullWidth,
}: {
  invoice: Pick<Invoice, "id" | "kind" | "snapshot">;
  variant?: "soft" | "secondary";
  size?: "md" | "lg";
  fullWidth?: boolean;
}) {
  const t = useCopy().invoices.share;
  const share = useShareInvoice();
  const [busy, setBusy] = useState(false);

  async function send() {
    // The link comes from an async call, and browsers only allow a window opened straight from the click.
    // So open it now and point it at WhatsApp once the link exists.
    const popup = window.open("", "_blank");
    setBusy(true);
    try {
      const link = await share.mutateAsync(invoice.id);
      const url = whatsappUrl(buildReceiptMessage(invoice, link.token), invoice.snapshot.guest.phone);
      if (popup) popup.location.href = url;
      else window.location.href = url;
    } catch {
      popup?.close();
      toast.error(t.error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      loading={busy}
      leadingIcon={<WhatsAppIcon className="text-success-600" />}
      onClick={send}
    >
      {t.button}
    </Button>
  );
}

"use client";

import { CalendarX2, LinkIcon, XCircle } from "lucide-react";
import { WhatsAppIcon } from "@/components/brand/whatsapp-icon";
import { Button } from "@/components/ui/button";
import { useCopy } from "@/content";
import type { GuestLinkView } from "@/domain/read-models";
import { firstNameOf, whatsappUrl } from "@/features/bookings/share";
import { formatFullDate } from "@/lib/dates";
import { GuestShell } from "./guest-shell";

type Reason = "not_found" | "expired" | "cancelled";

/** Friendly dead end with the one useful next step: contact the host. */
export function LinkUnavailable({ reason, view }: { reason: Reason; view?: GuestLinkView }) {
  const t = useCopy().guestForm.unavailable;
  const Icon = reason === "expired" ? CalendarX2 : reason === "cancelled" ? XCircle : LinkIcon;
  const title = reason === "expired" ? t.expiredTitle : reason === "cancelled" ? t.cancelledTitle : t.notFoundTitle;
  const body =
    reason === "expired" && view
      ? t.expiredBody(formatFullDate(view.stay.checkOut))
      : reason === "cancelled"
        ? t.cancelledBody
        : t.notFoundBody;
  const host = view ? firstNameOf(view.property.hostName) || view.property.name : null;

  return (
    <GuestShell propertyName={view?.property.name}>
      <div className="flex flex-1 flex-col items-center justify-center gap-4 py-12 text-center">
        <span className="flex size-16 items-center justify-center rounded-2xl bg-canvas text-ink-3">
          <Icon className="size-8" aria-hidden />
        </span>
        <div className="flex max-w-xs flex-col gap-2">
          <h1 className="text-title-2 text-ink">{title}</h1>
          <p className="text-callout leading-6 text-ink-3">{body}</p>
        </div>
        {view && host && (
          <Button asChild variant="secondary" size="lg" className="mt-2">
            <a href={whatsappUrl("", view.property.hostPhone)} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon className="size-5 text-success-600" />
              {t.contactHost(host)}
            </a>
          </Button>
        )}
      </div>
    </GuestShell>
  );
}

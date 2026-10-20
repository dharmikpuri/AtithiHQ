"use client";

import { CircleCheck, Copy, Link2, Share2 } from "lucide-react";
import { toast } from "sonner";
import { WhatsAppIcon } from "@/components/brand/whatsapp-icon";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { useCopy } from "@/content";
import { leadGuestOf } from "@/domain/booking-rules";
import type { BookingRecord } from "@/domain/read-models";
import { useCurrentSession } from "@/features/auth/queries";
import { copyText } from "@/lib/clipboard";
import { maskPhone } from "@/lib/phone";
import { useMarkLinkShared } from "../queries";
import { buildShareMessage, canUseNativeShare, firstNameOf, guestLinkUrl, whatsappUrl, type ShareKind } from "../share";

interface ShareLinkSheetProps {
  booking: BookingRecord;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Fixed when the sheet opens, so the message doesn't change mid-way. */
  kind: ShareKind;
  /** Opened straight after creating the booking. */
  justCreated?: boolean;
}

export function ShareLinkSheet({ booking, open, onOpenChange, kind, justCreated = false }: ShareLinkSheetProps) {
  const t = useCopy();
  const s = t.bookings.share;
  const { property } = useCurrentSession();
  const markShared = useMarkLinkShared(booking.id);

  const lead = leadGuestOf(booking);
  const firstName = firstNameOf(lead?.guest.name ?? "");
  const phone = lead?.guest.phone ?? null;
  const message = buildShareMessage(booking, property, kind);

  const shared = () => markShared.mutate();

  function sendOnWhatsApp() {
    window.open(whatsappUrl(message, phone), "_blank", "noopener,noreferrer");
    shared();
    onOpenChange(false);
  }

  async function copy(text: string, done: string) {
    if (await copyText(text)) {
      toast.success(done);
      shared();
    }
  }

  async function shareElsewhere() {
    try {
      await navigator.share({ text: message });
      shared();
      onOpenChange(false);
    } catch {
      // The owner closed the share panel — nothing to do.
    }
  }

  const title = justCreated ? s.createdTitle : kind === "invite" ? s.title(firstName) : s.reminderTitle(firstName);

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={
        justCreated ? (
          <span className="flex items-center gap-2">
            <CircleCheck className="size-6 text-success-500" aria-hidden />
            {title}
          </span>
        ) : (
          title
        )
      }
      description={justCreated ? s.createdBody : s.description}
      footer={
        <div className="flex flex-col gap-3">
          <div className="flex flex-col items-center gap-1.5">
            <Button
              size="xl"
              fullWidth
              onClick={sendOnWhatsApp}
              className="bg-success-600 hover:bg-success-700 active:bg-success-700"
              leadingIcon={<WhatsAppIcon className="size-6" />}
            >
              {s.whatsapp}
            </Button>
            <p className="text-footnote text-ink-3 tabular">
              {phone ? s.whatsappTo(maskPhone(phone)) : s.whatsappChoose}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" size="lg" leadingIcon={<Copy />} onClick={() => copy(message, s.copiedMessage)}>
              {s.copyMessage}
            </Button>
            <Button
              variant="secondary"
              size="lg"
              leadingIcon={<Link2 />}
              onClick={() => copy(guestLinkUrl(booking.link.token), t.bookings.link.copied)}
            >
              {t.bookings.link.copy}
            </Button>
          </div>
          {canUseNativeShare() && (
            <Button variant="ghost" size="lg" leadingIcon={<Share2 />} onClick={shareElsewhere}>
              {s.otherApps}
            </Button>
          )}
          {justCreated && (
            <Button variant="ghost" size="lg" onClick={() => onOpenChange(false)}>
              {s.later}
            </Button>
          )}
        </div>
      }
    >
      <div className="flex flex-col gap-2">
        <p className="text-subhead font-medium text-ink-2">{s.messageLabel}</p>
        <div className="relative rounded-2xl rounded-tl-md border border-success-100 bg-success-50/60 px-4 py-3.5">
          <p className="text-callout leading-6 break-words whitespace-pre-wrap text-ink">{message}</p>
        </div>
      </div>
    </Sheet>
  );
}

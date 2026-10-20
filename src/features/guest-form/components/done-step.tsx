"use client";

import { Check, IdCard, PencilLine, Users } from "lucide-react";
import { WhatsAppIcon } from "@/components/brand/whatsapp-icon";
import { Button } from "@/components/ui/button";
import { useCopy } from "@/content";
import type { GuestLinkView } from "@/domain/read-models";
import { firstNameOf, whatsappUrl } from "@/features/bookings/share";
import { formatTimeOfDay, formatWeekdayDate } from "@/lib/dates";
import { GuestShell } from "./guest-shell";

/**
 * Confirmation. One job: reassure the guest the host has everything.
 * No sharing step — the person who booked has already added everyone.
 */
export function DoneStep({ view, preview, onEdit }: { view: GuestLinkView; preview: boolean; onEdit: () => void }) {
  const t = useCopy();
  const d = t.guestForm.done;
  const host = firstNameOf(view.property.hostName) || view.property.name;
  const guests = view.submittedGuests;
  const ids = guests.filter((guest) => guest.document).length;
  const idEnabled = view.property.idRequirement !== "off";

  return (
    <GuestShell propertyName={view.property.name} preview={preview}>
      <div className="flex flex-col items-center gap-5 pt-4 text-center">
        <span className="flex size-20 items-center justify-center rounded-full bg-success-50 ring-8 ring-success-50/60">
          <span className="flex size-14 items-center justify-center rounded-full bg-success-500 text-white">
            <Check className="size-8" strokeWidth={3} aria-hidden />
          </span>
        </span>
        <div className="flex flex-col gap-1.5">
          <h1 className="text-title-1 text-ink">{d.title(firstNameOf(view.lead.name))}</h1>
          <p className="text-body text-ink-2">{d.subtitle(host)}</p>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3">
        <div className="grid grid-cols-1 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-subtle">
          <SummaryRow icon={<Users className="size-5" aria-hidden />} text={d.guestsAdded(guests.length)} />
          {idEnabled && <SummaryRow icon={<IdCard className="size-5" aria-hidden />} text={d.idsAdded(ids)} />}
          <div className="flex items-center justify-between gap-4 px-4 py-3 text-callout">
            <span className="text-ink-3">{t.guestForm.welcome.checkIn}</span>
            <span className="font-semibold text-ink">
              {formatWeekdayDate(view.stay.checkIn)} ·{" "}
              {t.guestForm.welcome.from(formatTimeOfDay(view.property.checkInTime))}
            </span>
          </div>
        </div>
        <p className="px-1 text-center text-subhead leading-5 text-ink-3">{d.change}</p>
      </div>

      <div className="mt-auto flex flex-col gap-2 pt-8">
        <Button asChild size="xl" fullWidth className="bg-success-600 hover:bg-success-700">
          <a href={whatsappUrl("", view.property.hostPhone)} target="_blank" rel="noopener noreferrer">
            <WhatsAppIcon className="size-6" />
            {d.message(host)}
          </a>
        </Button>
        <Button variant="ghost" size="lg" leadingIcon={<PencilLine />} onClick={onEdit}>
          {d.edit}
        </Button>
      </div>
    </GuestShell>
  );
}

function SummaryRow({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 text-callout font-medium text-ink">
      <span className="text-success-600">{icon}</span>
      {text}
      <Check className="ml-auto size-5 text-success-500" aria-hidden />
    </div>
  );
}

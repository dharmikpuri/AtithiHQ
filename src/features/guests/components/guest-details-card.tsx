"use client";

import { Globe, IdCard, Pencil, Phone, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCopy } from "@/content";
import { countryName } from "@/domain/countries";
import type { GuestProfile } from "@/domain/read-models";
import { cn } from "@/lib/cn";
import { formatFullDate } from "@/lib/dates";
import { formatPhone } from "@/lib/phone";

/** Contact and identity details. The phone is shown in full here — the owner needs to call. */
export function GuestDetailsCard({ profile, onEdit }: { profile: GuestProfile; onEdit: () => void }) {
  const t = useCopy();
  const d = t.guests.profile.details;
  const { guest } = profile.summary;
  const idDocument = profile.document;

  return (
    <Card>
      <div className="flex min-h-14 items-center justify-between gap-3 px-4 pt-3 sm:min-h-15 sm:px-5 sm:pt-4">
        <h2 className="text-headline text-ink">{d.title}</h2>
        <Button variant="ghost" leadingIcon={<Pencil />} onClick={onEdit} className="-mr-2">
          {d.edit}
        </Button>
      </div>
      <ul className="mt-2 divide-y divide-line border-t border-line">
        <DetailRow
          icon={Phone}
          label={t.common.fields.mobile}
          value={guest.phone ? formatPhone(guest.phone) : d.noPhone}
          muted={!guest.phone}
          action={
            !guest.phone && (
              <Button variant="soft" size="md" onClick={onEdit}>
                {d.addPhone}
              </Button>
            )
          }
        />
        <DetailRow icon={Globe} label={t.common.fields.nationality} value={countryName(guest.nationality)} />
        <DetailRow
          icon={IdCard}
          label={d.id}
          value={idDocument ? d.idValue(t.common.idTypes[idDocument.type], idDocument.last4) : d.noId}
          sub={idDocument && d.deleteOn(formatFullDate(idDocument.deleteOn))}
          muted={!idDocument}
        />
      </ul>
    </Card>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
  sub,
  muted = false,
  action,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  sub?: string | null;
  muted?: boolean;
  action?: ReactNode;
}) {
  return (
    <li className="flex min-h-17 items-center gap-3 px-4 py-3 sm:px-5">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-subtle text-ink-3">
        <Icon className="size-4.5" aria-hidden />
      </span>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="text-footnote font-medium text-ink-3">{label}</span>
        <span className={cn("text-body font-medium tabular", muted ? "text-ink-3" : "text-ink")}>{value}</span>
        {sub && <span className="text-footnote text-ink-3">{sub}</span>}
      </div>
      {action}
    </li>
  );
}

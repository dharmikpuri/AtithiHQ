"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ExternalLink, IdCard, UserMinus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Sheet } from "@/components/ui/sheet";
import { routes } from "@/config/routes";
import { useCopy } from "@/content";
import { leadGuestOf } from "@/domain/booking-rules";
import type { BookingGuestDetails, BookingRecord } from "@/domain/read-models";
import { useCurrentSession } from "@/features/auth/queries";
import { GuestDetailsFields } from "@/features/guest-details/guest-details-fields";
import {
  emptyGuestDetails,
  guestDetailsFromEntry,
  guestDetailsSchema,
  toGuestDetailsInput,
  type GuestDetailsValues,
} from "@/features/guest-details/guest-details-schema";
import { IdDocumentFields } from "@/features/guest-details/id-document-fields";
import { useAddGuest, useRemoveGuest, useUpdateGuest } from "../queries";
import { IdDocumentViewer } from "./id-document-viewer";

const FORM_ID = "guest-entry-form";

interface GuestEntrySheetProps {
  booking: BookingRecord;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** `null` adds a new person to the booking. */
  entry: BookingGuestDetails | null;
}

/**
 * The owner typing details in — the path that makes the product work at
 * 0% guest completion. Mount with a fresh `key` each time it opens.
 */
export function GuestEntrySheet({ booking, open, onOpenChange, entry }: GuestEntrySheetProps) {
  const t = useCopy();
  const g = t.bookings.guestSheet;
  const { property } = useCurrentSession();
  const idEnabled = property.idRequirement !== "off";
  const lead = leadGuestOf(booking);
  const isPendingLead = entry?.role === "lead" && entry.status === "pending";

  const form = useForm<GuestDetailsValues>({
    resolver: zodResolver(guestDetailsSchema),
    defaultValues: entry
      ? guestDetailsFromEntry(entry)
      : { ...emptyGuestDetails, nationality: lead?.guest.nationality ?? emptyGuestDetails.nationality },
  });
  const nationality = useWatch({ control: form.control, name: "nationality" });

  const addGuest = useAddGuest(booking.id);
  const updateGuest = useUpdateGuest(booking.id);
  const removeGuest = useRemoveGuest(booking.id);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [viewingId, setViewingId] = useState(false);
  const saving = addGuest.isPending || updateGuest.isPending;

  const submit = form.handleSubmit((values) => {
    const input = toGuestDetailsInput(values, idEnabled);
    const options = {
      onSuccess: () => {
        toast.success(entry ? g.updated : g.added);
        onOpenChange(false);
      },
      onError: () => toast.error(t.common.states.errorBody),
    };
    if (entry) updateGuest.mutate({ guestId: entry.guestId, input }, options);
    else addGuest.mutate(input, options);
  });

  return (
    <>
      <Sheet
        open={open}
        onOpenChange={onOpenChange}
        dismissible={!saving}
        title={!entry ? g.addTitle : isPendingLead ? g.completeLeadTitle : g.editTitle}
        description={!entry || isPendingLead ? g.addDescription : undefined}
        footer={
          <Button type="submit" form={FORM_ID} size="xl" fullWidth loading={saving}>
            {g.save}
          </Button>
        }
      >
        <form id={FORM_ID} onSubmit={submit} noValidate className="flex flex-col gap-6">
          <GuestDetailsFields form={form} autoFocus={!entry} />

          {idEnabled && (
            <section className="flex flex-col gap-4 border-t border-line pt-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-body font-semibold text-ink">{t.common.idDocument.section}</h3>
                {entry?.document && (
                  <Button variant="soft" size="sm" leadingIcon={<IdCard />} onClick={() => setViewingId(true)}>
                    {t.bookings.document.view}
                  </Button>
                )}
              </div>
              <IdDocumentFields form={form} preferPassport={nationality !== "IN"} />
            </section>
          )}

          {entry && (entry.status === "added" || entry.role === "companion") && (
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-4">
              {entry.status === "added" && (
                <Button asChild variant="ghost" size="md" className="-ml-2">
                  <Link href={routes.guest(entry.guestId)}>
                    <ExternalLink aria-hidden />
                    {g.viewProfile}
                  </Link>
                </Button>
              )}
              {entry.role === "companion" && (
                <Button
                  variant="ghost"
                  size="md"
                  className="-mr-2 ml-auto text-danger-600 hover:bg-danger-50"
                  leadingIcon={<UserMinus />}
                  onClick={() => setConfirmRemove(true)}
                >
                  {g.remove}
                </Button>
              )}
            </div>
          )}
        </form>
      </Sheet>

      {entry && (
        <ConfirmDialog
          open={confirmRemove}
          onOpenChange={setConfirmRemove}
          title={g.removeConfirm.title}
          description={g.removeConfirm.body}
          confirmLabel={g.removeConfirm.confirm}
          tone="danger"
          loading={removeGuest.isPending}
          onConfirm={() =>
            removeGuest.mutate(entry.guestId, {
              onSuccess: () => {
                setConfirmRemove(false);
                toast.success(g.removed);
                onOpenChange(false);
              },
              onError: () => toast.error(t.common.states.errorBody),
            })
          }
        />
      )}
      {entry?.document && <IdDocumentViewer document={entry.document} open={viewingId} onOpenChange={setViewingId} />}
    </>
  );
}

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { useCopy } from "@/content";
import type { Guest } from "@/domain/types";
import { firstNameOf } from "@/features/bookings/share";
import { GuestDetailsFields } from "@/features/guest-details/guest-details-fields";
import {
  emptyGuestDetails,
  guestDetailsSchema,
  type GuestDetailsValues,
} from "@/features/guest-details/guest-details-schema";
import { useUpdateGuestProfile } from "../queries";

const FORM_ID = "edit-guest-form";

interface EditGuestSheetProps {
  guest: Guest;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Name, mobile and nationality for this person across all their stays.
 * ID documents belong to a stay, so they're edited on the booking instead.
 * Mount with a fresh `key` each time it opens.
 */
export function EditGuestSheet({ guest, open, onOpenChange }: EditGuestSheetProps) {
  const t = useCopy();
  const e = t.guests.editSheet;
  const update = useUpdateGuestProfile(guest.id);

  const form = useForm<GuestDetailsValues>({
    resolver: zodResolver(guestDetailsSchema),
    defaultValues: {
      ...emptyGuestDetails,
      name: guest.name,
      phone: guest.phone ?? "",
      nationality: guest.nationality,
    },
  });

  const submit = form.handleSubmit((values) =>
    update.mutate(
      { name: values.name.trim(), phone: values.phone || null, nationality: values.nationality },
      {
        onSuccess: () => {
          toast.success(e.saved);
          onOpenChange(false);
        },
        onError: () => toast.error(t.common.states.errorBody),
      },
    ),
  );

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      dismissible={!update.isPending}
      title={e.title}
      description={e.description(firstNameOf(guest.name))}
      footer={
        <Button type="submit" form={FORM_ID} size="xl" fullWidth loading={update.isPending}>
          {t.common.actions.saveChanges}
        </Button>
      }
    >
      <form id={FORM_ID} onSubmit={submit} noValidate>
        <GuestDetailsFields form={form} />
      </form>
    </Sheet>
  );
}

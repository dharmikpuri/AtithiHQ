"use client";

import { MoreHorizontal, Pencil, Plus, UserX } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Page, ScreenHeader } from "@/components/layout/page";
import { ActionMenu, type ActionMenuItem } from "@/components/ui/action-menu";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { IconButton } from "@/components/ui/icon-button";
import { Skeleton } from "@/components/ui/skeleton";
import { routes } from "@/config/routes";
import { useCopy } from "@/content";
import type { GuestProfile } from "@/domain/read-models";
import { firstNameOf } from "@/features/bookings/share";
import { isApiError } from "@/lib/api";
import { useGuestProfile } from "../queries";
import { EditGuestSheet } from "./edit-guest-sheet";
import { GuestDetailsCard } from "./guest-details-card";
import { GuestProfileHero } from "./guest-profile-hero";
import { GuestStaysCard } from "./guest-stays-card";

const newBookingHref = (guestId: string) => routes.newBooking({ guestId });

export function GuestProfileScreen({ guestId }: { guestId: string }) {
  const t = useCopy();
  const p = t.guests.profile;
  const { data: profile, isPending, isError, error, refetch } = useGuestProfile(guestId);

  // `key` gives each opening a fresh form; `open` stays separate so the sheet can animate out.
  const [editing, setEditing] = useState(false);
  const [editKey, setEditKey] = useState(0);
  const openEdit = () => {
    setEditKey((value) => value + 1);
    setEditing(true);
  };

  return (
    <>
      <ScreenHeader
        width="fluid"
        title={profile ? profile.summary.guest.name : p.title}
        backHref={routes.guests()}
        backLabel={p.back}
        revealTitleOnScroll
        actions={profile && <ProfileActions profile={profile} onEdit={openEdit} />}
      />
      <Page width="fluid" className="pt-1 pb-10 md:pt-2">
        {isPending ? (
          <ProfileSkeleton />
        ) : isError ? (
          isApiError(error, "not_found") ? (
            <EmptyState
              icon={UserX}
              title={t.common.states.notFoundTitle}
              description={p.notFound}
              action={
                <Button asChild variant="secondary">
                  <Link href={routes.guests()}>{p.backToList}</Link>
                </Button>
              }
            />
          ) : (
            <ErrorState onRetry={() => refetch()} />
          )
        ) : (
          <GuestProfileContent profile={profile} onEdit={openEdit} />
        )}
      </Page>

      {profile && (
        <EditGuestSheet key={editKey} guest={profile.summary.guest} open={editing} onOpenChange={setEditing} />
      )}
    </>
  );
}

function GuestProfileContent({ profile, onEdit }: { profile: GuestProfile; onEdit: () => void }) {
  const p = useCopy().guests.profile;
  const { guest } = profile.summary;

  return (
    <div className="flex flex-col gap-6">
      <GuestProfileHero profile={profile} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-start lg:gap-6">
        <GuestStaysCard profile={profile} />
        <div className="grid grid-cols-1 gap-4">
          <GuestDetailsCard profile={profile} onEdit={onEdit} />
          <Button asChild size="lg" fullWidth>
            <Link href={newBookingHref(guest.id)}>
              <Plus aria-hidden />
              {p.newBooking(firstNameOf(guest.name))}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

/** A visible Edit button on larger screens; everything in one menu on phones. */
function ProfileActions({ profile, onEdit }: { profile: GuestProfile; onEdit: () => void }) {
  const p = useCopy().guests.profile;
  const router = useRouter();
  const { guest } = profile.summary;

  const items: ActionMenuItem[] = [
    { label: p.edit, icon: Pencil, onSelect: onEdit },
    { label: p.newBooking(firstNameOf(guest.name)), icon: Plus, onSelect: () => router.push(newBookingHref(guest.id)) },
  ];

  return (
    <>
      <Button variant="secondary" leadingIcon={<Pencil />} onClick={onEdit} className="hidden sm:inline-flex">
        {p.edit}
      </Button>
      <ActionMenu
        title={p.menu}
        items={items}
        trigger={
          <IconButton aria-label={p.menu} variant="ghost" className="sm:hidden">
            <MoreHorizontal />
          </IconButton>
        }
      />
    </>
  );
}

function ProfileSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-hidden>
      <div className="flex items-center gap-4">
        <Skeleton className="size-16 shrink-0 rounded-full sm:size-20" />
        <div className="flex flex-1 flex-col gap-2.5">
          <Skeleton className="h-8 w-48 max-w-full" />
          <Skeleton className="h-4 w-36" />
        </div>
      </div>
      <Skeleton className="h-36 w-full rounded-2xl md:h-20" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-6">
        <Skeleton className="h-72 rounded-2xl" />
        <Skeleton className="h-60 rounded-2xl" />
      </div>
    </div>
  );
}

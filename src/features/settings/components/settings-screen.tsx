"use client";

import { Building2, ClipboardList, LogOut, UserRound } from "lucide-react";
import { useState } from "react";
import { LogoMark } from "@/components/brand/logo";
import { PropertyIllustration } from "@/components/brand/property-illustration";
import { Page, PageTitle } from "@/components/layout/page";
import { ListRow } from "@/components/ui/list";
import { routes } from "@/config/routes";
import { useCopy } from "@/content";
import { isLinkUsable, leadNameOf, stayPhase } from "@/domain/booking-rules";
import type { BookingRecord } from "@/domain/read-models";
import { formatPostalAddress, ownerProfileOf, propertyProfileOf } from "@/domain/profiles";
import type { ISODate } from "@/domain/types";
import { LogoutDialog } from "@/features/auth/logout-dialog";
import { useCurrentSession } from "@/features/auth/queries";
import { useBookings } from "@/features/bookings/queries";
import { formatTimeOfDay, todayISO } from "@/lib/dates";
import { formatPhone } from "@/lib/phone";
import type { TextSettingKind, TimeSettingKind } from "../settings-fields";
import { SettingsGroup } from "./settings-group";
import {
  AddressSheet,
  AlternatePhoneSheet,
  BookingModeSheet,
  GstSheet,
  IdRequirementSheet,
  PropertyTypeSheet,
  RetentionSheet,
  TextSettingSheet,
  TimeSettingSheet,
} from "./settings-sheets";

type Overlay =
  | { kind: "text"; field: TextSettingKind }
  | { kind: "alternatePhone" }
  | { kind: "propertyType" }
  | { kind: "address" }
  | { kind: "bookingMode" }
  | { kind: "gst" }
  | { kind: "time"; field: TimeSettingKind }
  | { kind: "idRequirement" }
  | { kind: "retention" };

export function SettingsScreen() {
  const t = useCopy();
  const s = t.settings;
  const session = useCurrentSession();
  // Two separate profiles: who runs the place, and the place itself.
  const owner = ownerProfileOf(session.owner);
  const property = propertyProfileOf(session.property);
  const { idRequirement, documentRetentionDays } = session.property;

  // One editor at a time. `open` is kept separate so sheets can animate out,
  // and `key` gives each opening a fresh form.
  const [overlay, setOverlay] = useState<Overlay | null>(null);
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState(0);
  const show = (next: Overlay) => {
    setOverlay(next);
    setKey((value) => value + 1);
    setOpen(true);
  };
  const sheetProps = { open, onOpenChange: setOpen };

  return (
    <Page className="pb-8">
      <PageTitle title={s.title} subtitle={s.subtitle} />

      <div className="flex flex-col gap-7 lg:gap-0">
        <SettingsGroup icon={UserRound} title={s.groups.profile.title} description={s.groups.profile.description}>
          <ListRow
            title={s.ownerName.label}
            value={owner.name}
            onClick={() => show({ kind: "text", field: "ownerName" })}
          />
          <ListRow
            title={s.mobile.label}
            subtitle={s.mobile.note}
            value={<span className="tabular">{formatPhone(owner.phone)}</span>}
          />
          <ListRow
            title={s.alternatePhone.label}
            value={
              owner.alternatePhone ? (
                <span className="tabular">{formatPhone(owner.alternatePhone)}</span>
              ) : (
                s.alternatePhone.notSet
              )
            }
            onClick={() => show({ kind: "alternatePhone" })}
          />
          <ListRow
            title={s.email.label}
            value={owner.email ?? s.alternatePhone.notSet}
            onClick={() => show({ kind: "text", field: "email" })}
          />
        </SettingsGroup>

        <SettingsGroup icon={Building2} title={s.groups.property.title} description={s.groups.property.description}>
          <ListRow
            leading={<PropertyIllustration type={property.type} className="size-12" />}
            title={t.common.propertyTypes[property.type].label}
            subtitle={s.propertyType.label}
            onClick={() => show({ kind: "propertyType" })}
          />
          <ListRow
            title={s.propertyName.label}
            value={property.name}
            onClick={() => show({ kind: "text", field: "propertyName" })}
          />
          <ListRow
            title={s.location.label}
            value={property.address.locality}
            onClick={() => show({ kind: "text", field: "location" })}
          />
          <ListRow
            title={s.address.label}
            subtitle={formatPostalAddress(property.address)}
            onClick={() => show({ kind: "address" })}
          />
          <ListRow
            title={s.bookingMode.label}
            subtitle={t.common.inventory.short(
              t.common.bookingModes[property.inventory.mode].label,
              property.inventory.totalRooms,
            )}
            onClick={() => show({ kind: "bookingMode" })}
          />
          <ListRow
            title={s.gst.label}
            value={property.gst ? s.gst.summary(property.gst.gstin, property.gst.rate) : s.gst.notRegistered}
            onClick={() => show({ kind: "gst" })}
          />
          <ListRow
            title={s.checkInTime.label}
            value={formatTimeOfDay(property.checkInTime)}
            onClick={() => show({ kind: "time", field: "checkInTime" })}
          />
          <ListRow
            title={s.checkOutTime.label}
            value={formatTimeOfDay(property.checkOutTime)}
            onClick={() => show({ kind: "time", field: "checkOutTime" })}
          />
        </SettingsGroup>

        <SettingsGroup
          icon={ClipboardList}
          title={s.groups.guestForm.title}
          description={s.groups.guestForm.description}
        >
          <ListRow
            title={s.idRequirement.label}
            subtitle={s.idRequirement.summaries[idRequirement]}
            value={t.common.idRequirements[idRequirement]}
            onClick={() => show({ kind: "idRequirement" })}
          />
          <ListRow
            title={s.retention.label}
            subtitle={s.retention.summary}
            value={s.retention.option(documentRetentionDays)}
            onClick={() => show({ kind: "retention" })}
          />
          <PreviewRow />
        </SettingsGroup>

        <SettingsGroup icon={LogOut} title={s.groups.account.title} description={s.groups.account.description}>
          <LogoutRow />
        </SettingsGroup>
      </div>

      <footer className="mt-12 flex flex-col items-center gap-2 text-center">
        <LogoMark className="size-7" />
        <div className="flex flex-col gap-0.5">
          <p className="text-subhead font-semibold text-ink-2">{t.common.appName}</p>
          <p className="text-footnote text-ink-3">{s.footer.version}</p>
          <p className="text-footnote text-ink-3">{t.common.byline}</p>
        </div>
      </footer>

      {overlay?.kind === "text" && <TextSettingSheet key={key} kind={overlay.field} {...sheetProps} />}
      {overlay?.kind === "time" && <TimeSettingSheet key={key} kind={overlay.field} {...sheetProps} />}
      {overlay?.kind === "alternatePhone" && <AlternatePhoneSheet key={key} {...sheetProps} />}
      {overlay?.kind === "propertyType" && <PropertyTypeSheet key={key} {...sheetProps} />}
      {overlay?.kind === "address" && <AddressSheet key={key} {...sheetProps} />}
      {overlay?.kind === "bookingMode" && <BookingModeSheet key={key} {...sheetProps} />}
      {overlay?.kind === "gst" && <GstSheet key={key} {...sheetProps} />}
      {overlay?.kind === "idRequirement" && <IdRequirementSheet key={key} {...sheetProps} />}
      {overlay?.kind === "retention" && <RetentionSheet key={key} {...sheetProps} />}
    </Page>
  );
}

/**
 * The booking whose guest form is most worth previewing: the next arrival
 * (today or later), otherwise someone staying now. Only links that still work.
 */
function previewBookingOf(bookings: BookingRecord[], today: ISODate): BookingRecord | undefined {
  const byCheckIn = (a: BookingRecord, b: BookingRecord) => a.checkIn.localeCompare(b.checkIn);
  const live = bookings.filter((booking) => isLinkUsable(booking, today) && stayPhase(booking, today) !== "past");
  return live.filter((booking) => booking.checkIn >= today).sort(byCheckIn)[0] ?? live.sort(byCheckIn)[0];
}

/** Opens a real booking's guest form in preview mode. Hidden when there is nothing to preview. */
function PreviewRow() {
  const copy = useCopy().settings.preview;
  const { data: bookings } = useBookings();
  const booking = bookings && previewBookingOf(bookings, todayISO());
  if (!booking) return null;
  return (
    <ListRow
      title={copy.label}
      subtitle={copy.hint(leadNameOf(booking))}
      href={routes.guestForm(booking.link.token, { preview: true })}
    />
  );
}

/** Opens the shared log-out confirmation. */
function LogoutRow() {
  const t = useCopy();
  const [confirming, setConfirming] = useState(false);

  return (
    <>
      <ListRow
        title={t.auth.logout.label}
        tone="danger"
        chevron={false}
        leading={<LogOut className="size-5 text-danger-600" aria-hidden />}
        onClick={() => setConfirming(true)}
      />
      <LogoutDialog open={confirming} onOpenChange={setConfirming} />
    </>
  );
}

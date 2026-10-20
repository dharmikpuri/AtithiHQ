"use client";

import { Field } from "@/components/ui/field";
import { RadioCards } from "@/components/ui/radio-cards";
import { Stepper } from "@/components/ui/stepper";
import { useCopy } from "@/content";
import {
  BOOKING_MODES,
  MAX_ROOMS,
  MIN_ROOMS,
  normaliseInventory,
  usesRoomInventory,
  type BookingMode,
} from "@/domain/inventory";
import { InventorySummary } from "./inventory-summary";

/**
 * Choose how the property is rented and, for room-based modes, how many rooms (a quantity only).
 * Shows the inventory that results. Used in registration and in Settings.
 */
export function BookingModeFields({
  mode,
  roomCount,
  onModeChange,
  onRoomCountChange,
  roomCountError,
}: {
  mode: BookingMode;
  roomCount: number;
  onModeChange: (mode: BookingMode) => void;
  onRoomCountChange: (count: number) => void;
  roomCountError?: string;
}) {
  const t = useCopy();
  const s = t.auth.setup;

  function changeMode(next: BookingMode) {
    onModeChange(next);
    // Keep the count inside what the new mode accepts (renting "both" ways needs 2 rooms or more).
    if (usesRoomInventory(next) && roomCount < MIN_ROOMS[next]) onRoomCountChange(MIN_ROOMS[next]);
  }

  return (
    <div className="flex flex-col gap-5">
      <Field label={s.bookingMode}>
        <RadioCards
          value={mode}
          onChange={changeMode}
          options={BOOKING_MODES.map((value) => ({
            value,
            label: t.common.bookingModes[value].label,
            description: t.common.bookingModes[value].description,
          }))}
        />
      </Field>

      {usesRoomInventory(mode) && (
        <Field label={s.roomCount} hint={s.roomCountHint} error={roomCountError}>
          <Stepper
            value={roomCount}
            onChange={onRoomCountChange}
            min={MIN_ROOMS[mode]}
            max={MAX_ROOMS}
            unitLabel={s.roomCountUnit}
          />
        </Field>
      )}

      <InventorySummary inventory={normaliseInventory(mode, roomCount)} />
    </div>
  );
}

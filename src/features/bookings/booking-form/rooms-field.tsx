"use client";

import type { CSSProperties } from "react";
import { Field } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";
import { RadioCards } from "@/components/ui/radio-cards";
import { Stepper } from "@/components/ui/stepper";
import { useCopy } from "@/content";
import type { Availability, RoomRequestProblem } from "@/domain/availability";
import type { RoomInventory } from "@/domain/inventory";
import { cn } from "@/lib/cn";

/** Message for a request that doesn't fit, in the owner's words. */
function roomProblemMessage(
  t: ReturnType<typeof useCopy>,
  problem: RoomRequestProblem,
  availability: Availability | null,
): string {
  const f = t.bookings.form;
  const total = availability?.totalRooms ?? 0;
  switch (problem) {
    case "rooms_required":
      return f.roomsRequired;
    case "rooms_unavailable":
      return f.roomsUnavailable(total);
    case "too_many_rooms":
      return f.tooManyRooms(availability?.remainingRooms ?? 0);
    case "whole_unavailable":
      return availability?.wholeBooked
        ? f.wholeUnavailableWhole
        : f.wholeUnavailableRooms(availability?.bookedRooms ?? 0);
    case "whole_not_offered":
      return f.roomsRequired;
  }
}

/**
 * Rooms for a booking at a room-based property: the whole property (when it's let both ways)
 * or a number of rooms. Shows what is free for the chosen dates and stops at what's left.
 * Quantities only: rooms are never named, numbered or picked individually.
 */
export function RoomsField({
  inventory,
  availability,
  bookWhole,
  rooms,
  onBookWholeChange,
  onRoomsChange,
  problem,
}: {
  inventory: RoomInventory;
  /** `null` until both dates are chosen. */
  availability: Availability | null;
  bookWhole: boolean;
  rooms: number;
  onBookWholeChange: (whole: boolean) => void;
  onRoomsChange: (rooms: number) => void;
  problem: RoomRequestProblem | null;
}) {
  const t = useCopy();
  const f = t.bookings.form;
  const total = inventory.totalRooms ?? 0;
  const whole = inventory.mode === "both" && bookWhole;
  const free = availability ? availability.remainingRooms : total;

  return (
    <div className="flex flex-col gap-4">
      {inventory.mode === "both" && (
        <Field label={f.roomsKind}>
          <RadioCards
            value={whole ? "whole" : "rooms"}
            onChange={(value) => onBookWholeChange(value === "whole")}
            className="sm:flex-row"
            options={[
              { value: "rooms", label: f.someRooms, description: f.someRoomsHint },
              {
                value: "whole",
                label: f.wholeProperty,
                description: f.wholeHint(total),
                disabled: availability !== null && !availability.canBookWhole && !whole,
              },
            ]}
          />
        </Field>
      )}

      {!whole && (
        <Field label={f.roomCount} inline>
          <Stepper value={rooms} onChange={onRoomsChange} min={1} max={Math.max(1, free)} unitLabel={f.roomsUnit} />
        </Field>
      )}

      <InventoryMeter
        total={total}
        availability={availability}
        selected={whole ? total : rooms}
        over={problem !== null}
      />

      {problem && availability && (
        <Notice tone="danger" role="alert">
          {roomProblemMessage(t, problem, availability)}
        </Notice>
      )}
    </div>
  );
}

/** Total, booked and free rooms for the dates, as one line and a bar. */
function InventoryMeter({
  total,
  availability,
  selected,
  over,
}: {
  total: number;
  availability: Availability | null;
  selected: number;
  over: boolean;
}) {
  const f = useCopy().bookings.form;
  if (!availability) {
    return <p className="rounded-xl bg-subtle px-4 py-3 text-subhead text-ink-3">{f.chooseDatesFirst}</p>;
  }
  const booked = availability.bookedRooms;
  const share = (rooms: number): CSSProperties => ({
    width: `${(Math.min(rooms, total) / Math.max(total, 1)) * 100}%`,
  });
  const shown = Math.min(selected, Math.max(0, total - booked));

  return (
    <div className="flex flex-col gap-2 rounded-xl bg-subtle px-4 py-3">
      <p className="text-subhead text-ink-2 tabular">{f.inventoryLine(total, booked, availability.remainingRooms)}</p>
      <div
        role="img"
        aria-label={f.meterLabel(booked, selected, total)}
        className="flex h-2.5 overflow-hidden rounded-full bg-line"
      >
        <span className="h-full bg-ink-4" style={share(booked)} />
        <span className={cn("h-full", over ? "bg-danger-500" : "bg-brand-600")} style={share(shown)} />
      </div>
    </div>
  );
}

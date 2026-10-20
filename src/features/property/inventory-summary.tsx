import { BedDouble, Check, House, Layers } from "lucide-react";
import { IconTile } from "@/components/ui/icon-tile";
import { getCopy } from "@/content";
import type { RoomInventory } from "@/domain/inventory";
import { cn } from "@/lib/cn";

const MODE_ICONS = { entire: House, rooms: BedDouble, both: Layers };

/**
 * What the chosen booking mode means for this property, in plain words: how many rooms can be
 * booked and how bookings share them. Rooms are a quantity, so nothing here is named or numbered.
 */
export function InventorySummary({ inventory, className }: { inventory: RoomInventory; className?: string }) {
  const t = getCopy().common;
  const copy = t.inventory;
  const rooms = inventory.totalRooms ?? 0;
  const lines =
    inventory.mode === "entire"
      ? [copy.entire]
      : inventory.mode === "rooms"
        ? [copy.roomsLine(rooms)]
        : [copy.wholeLine(rooms), copy.splitLine(rooms)];

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn("flex flex-col gap-3 rounded-2xl border border-brand-100 bg-brand-50/60 p-4", className)}
    >
      <div className="flex items-center gap-3">
        <IconTile icon={MODE_ICONS[inventory.mode]} />
        <div className="min-w-0 flex-1">
          <p className="text-footnote font-medium text-ink-2">{copy.summaryTitle}</p>
          <p className="text-headline text-ink">{t.bookingModes[inventory.mode].label}</p>
        </div>
        {inventory.totalRooms !== null && (
          <span className="shrink-0 rounded-full bg-surface px-3 py-1 text-subhead font-semibold text-brand-700 tabular shadow-card">
            {copy.rooms(inventory.totalRooms)}
          </span>
        )}
      </div>
      <ul className="flex flex-col gap-1.5">
        {lines.map((line) => (
          <li key={line} className="flex items-start gap-2 text-subhead text-ink-2">
            <Check className="mt-0.5 size-4 shrink-0 text-success-600" aria-hidden />
            {line}
          </li>
        ))}
      </ul>
    </div>
  );
}

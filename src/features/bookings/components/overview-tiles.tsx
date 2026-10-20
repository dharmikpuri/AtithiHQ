"use client";

import { ClipboardList, IndianRupee, LogIn, Users, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { surfaceStyles } from "@/components/ui/card";
import { IconTile } from "@/components/ui/icon-tile";
import { Skeleton } from "@/components/ui/skeleton";
import { routes } from "@/config/routes";
import { useCopy } from "@/content";
import type { BookingsOverview } from "@/domain/booking-collections";
import { cn } from "@/lib/cn";
import { formatINR } from "@/lib/money";

interface TileProps {
  href: string;
  icon: LucideIcon;
  value: string;
  label: string;
  highlight?: boolean;
  scroll?: boolean;
}

function Tile({ href, icon: Icon, value, label, highlight, scroll = true }: TileProps) {
  return (
    <Link
      href={href}
      scroll={scroll}
      className={cn(
        surfaceStyles(),
        "group flex flex-col gap-1 px-3.5 py-3 transition-colors duration-150 outline-none hover:bg-subtle focus-visible:ring-2 focus-visible:ring-brand-500 sm:gap-2 sm:p-4",
      )}
    >
      <span className="flex items-center justify-between gap-2">
        <span className={cn("truncate text-title-2 tabular", highlight ? "text-accent-700" : "text-ink")}>{value}</span>
        <IconTile icon={Icon} size="sm" tone={highlight ? "accent" : "brand"} />
      </span>
      <span className="truncate text-subhead font-medium text-ink-3">{label}</span>
    </Link>
  );
}

/** The four numbers an owner checks every morning. Each one is a shortcut. */
export function OverviewTiles({ overview }: { overview: BookingsOverview }) {
  const t = useCopy().bookings.overview;
  return (
    <section aria-label={t.label} className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      <Tile
        href={routes.bookingsView("today")}
        scroll={false}
        icon={LogIn}
        value={String(overview.arrivingToday)}
        label={t.arrivingToday}
      />
      <Tile
        href={routes.bookingsView("awaiting")}
        scroll={false}
        icon={ClipboardList}
        value={String(overview.awaitingDetails)}
        label={t.awaitingDetails}
      />
      <Tile
        href={routes.payments}
        icon={IndianRupee}
        value={formatINR(overview.outstanding)}
        label={t.outstanding}
        highlight={overview.outstanding > 0}
      />
      <Tile href={routes.guests()} icon={Users} value={String(overview.guestsThisYear)} label={t.guestsThisYear} />
    </section>
  );
}

export function OverviewTilesSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4" aria-hidden>
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className={cn(surfaceStyles({ elevation: "none" }), "flex flex-col gap-3 p-4")}>
          <Skeleton className="size-8" />
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-3.5 w-24" />
        </div>
      ))}
    </div>
  );
}

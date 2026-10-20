"use client";

import { CalendarCheck, CalendarClock, CircleCheck, History, Plus, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { HomestayScene } from "@/components/brand/homestay-scene";
import { Page, PageTitle } from "@/components/layout/page";
import { Button } from "@/components/ui/button";
import { surfaceStyles } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { ExportButton, type ExportPeriod } from "@/components/ui/export-button";
import { FilterButton, FilterChips, NoFilterResults } from "@/components/ui/filters";
import {
  SegmentedTabs,
  SegmentedTabsContent,
  SegmentedTabsList,
  SegmentedTabsTrigger,
} from "@/components/ui/segmented-tabs";
import { routes } from "@/config/routes";
import { useCopy } from "@/content";
import { awaitingDetails, groupBookings, summarizeBookings } from "@/domain/booking-collections";
import type { BookingRecord } from "@/domain/read-models";
import { useCurrentSession } from "@/features/auth/queries";
import { todayISO } from "@/lib/dates";
import type { ExportFormat } from "@/lib/export/table";
import type { FilterState } from "@/lib/filters";
import { useUrlFilters } from "@/lib/hooks/use-url-filters";
import { withParams } from "@/lib/url";
import { bookingFilterFields, matchesBookingFilters } from "../booking-filters";
import { useBookings } from "../queries";
import { BookingGroup, BookingList, BookingListSkeleton, MonthGroups } from "./booking-list";
import { OverviewTiles, OverviewTilesSkeleton } from "./overview-tiles";

const VIEWS = ["today", "upcoming", "past", "awaiting"] as const;
type View = (typeof VIEWS)[number];

export function BookingsScreen() {
  const t = useCopy();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { owner, property } = useCurrentSession();
  const { data: bookings, isPending, isError, refetch } = useBookings();
  const today = todayISO();

  const firstName = owner.name.trim().split(/\s+/)[0] ?? "";
  const requested = searchParams.get("view") as View | null;
  // The empty state has its own big "New booking" button; avoid showing two.
  const isEmpty = bookings?.length === 0;

  return (
    <Page width="fluid" className="pb-24 md:pb-0">
      <PageTitle
        title={t.bookings.list.greeting(firstName)}
        subtitle={`${property.name} · ${property.location}`}
        actions={
          !isEmpty && (
            <Button asChild size="lg" className="hidden md:inline-flex">
              <Link href={routes.newBooking()}>
                <Plus aria-hidden />
                {t.common.nav.newBooking}
              </Link>
            </Button>
          )
        }
      />

      {isPending ? (
        <div className="flex flex-col gap-6">
          <OverviewTilesSkeleton />
          <BookingListSkeleton />
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : bookings.length === 0 ? (
        <FirstBookingEmpty />
      ) : (
        <BookingsContent
          bookings={bookings}
          today={today}
          requested={requested && VIEWS.includes(requested) ? requested : null}
          // Tabs keep any filters that are applied.
          onViewChange={(view) => router.replace(withParams(pathname, searchParams, { view }), { scroll: false })}
          onClearFilter={() =>
            router.replace(withParams(pathname, searchParams, { view: undefined }), { scroll: false })
          }
        />
      )}

      {!isEmpty && <NewBookingFab />}
    </Page>
  );
}

function BookingsContent({
  bookings,
  today,
  requested,
  onViewChange,
  onClearFilter,
}: {
  bookings: BookingRecord[];
  today: string;
  requested: View | null;
  onViewChange: (view: View) => void;
  onClearFilter: () => void;
}) {
  const t = useCopy();
  const copy = t.bookings.list;
  const { property } = useCurrentSession();
  const fields = bookingFilterFields(t, property.bookingMode);
  const filters = useUrlFilters(fields);
  const filtering = filters.activeCount > 0;
  const clearFilters = () => filters.apply({});

  const matching = (state: FilterState) => bookings.filter((booking) => matchesBookingFilters(booking, state));
  const groups = groupBookings(matching(filters.values), today);
  // The overview tiles always describe the whole property, not the filtered list.
  const overview = summarizeBookings(bookings, today);
  const allGroups = groupBookings(bookings, today);
  // With nothing happening today, open on what's coming up.
  const view: View = requested ?? (allGroups.todayCount === 0 && allGroups.upcoming.length > 0 ? "upcoming" : "today");

  /** What the current view shows for a set of filters: what "Show N results" counts and Export writes. */
  const viewBookings = (state: FilterState): BookingRecord[] => {
    const list = matching(state);
    if (view === "awaiting") return awaitingDetails(list, today);
    const grouped = groupBookings(list, today);
    if (view === "today") return [...grouped.today.arriving, ...grouped.today.staying, ...grouped.today.departing];
    return view === "upcoming" ? grouped.upcoming : grouped.past;
  };

  /** On screen: the current tab and filters. A period: every booking matching the other filters, by check-in. */
  const exportRows = (period: ExportPeriod): BookingRecord[] =>
    period.kind === "view"
      ? viewBookings(filters.values)
      : matching({ ...filters.values, checkin: { from: period.from, to: period.to } }).sort((a, b) =>
          a.checkIn.localeCompare(b.checkIn),
        );

  const exportFile = async (format: ExportFormat, period: ExportPeriod) => {
    const [{ exportTables }, { bookingsExportTables }] = await Promise.all([
      import("@/lib/export"),
      import("../export"),
    ]);
    return exportTables({
      area: t.bookings.export.fileName,
      tables: bookingsExportTables(t, exportRows(period), today, property.bookingMode),
      format,
      today,
    });
  };

  const toolbar = (
    <div className="flex items-center justify-end gap-2">
      <FilterButton
        fields={fields}
        values={filters.values}
        onApply={filters.apply}
        countFor={(draft) => viewBookings(draft).length}
      />
      <ExportButton
        what={t.bookings.export.what}
        describe={(period) => {
          const count = exportRows(period).length;
          return count ? t.common.count.bookings(count) : null;
        }}
        onExport={exportFile}
      />
    </div>
  );
  const chips = <FilterChips fields={fields} values={filters.values} onApply={filters.apply} />;
  const noResults = <NoFilterResults onClear={clearFilters} />;

  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      <OverviewTiles overview={overview} />

      {view === "awaiting" ? (
        <AwaitingView
          bookings={awaitingDetails(matching(filters.values), today)}
          onClear={onClearFilter}
          toolbar={toolbar}
          chips={chips}
          noResults={filtering ? noResults : null}
        />
      ) : (
        <SegmentedTabs
          value={view}
          onValueChange={(value) => onViewChange(value as View)}
          className="flex flex-col gap-5"
        >
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <SegmentedTabsList aria-label={copy.tabsLabel}>
                <SegmentedTabsTrigger value="today" count={groups.todayCount}>
                  {copy.tabs.today}
                </SegmentedTabsTrigger>
                <SegmentedTabsTrigger value="upcoming" count={groups.upcoming.length}>
                  {copy.tabs.upcoming}
                </SegmentedTabsTrigger>
                <SegmentedTabsTrigger value="past">{copy.tabs.past}</SegmentedTabsTrigger>
              </SegmentedTabsList>
              {toolbar}
            </div>
            {chips}
          </div>

          <SegmentedTabsContent value="today" className="flex flex-col gap-7 outline-none">
            {groups.todayCount === 0 && filtering ? (
              noResults
            ) : groups.todayCount === 0 ? (
              <EmptyState
                compact
                icon={CalendarCheck}
                title={copy.empty.todayTitle}
                description={copy.empty.todayBody}
                action={
                  groups.upcoming.length > 0 && (
                    <Button variant="secondary" onClick={() => onViewChange("upcoming")}>
                      {copy.empty.seeUpcoming}
                    </Button>
                  )
                }
              />
            ) : (
              <>
                <BookingGroup title={copy.sections.arriving} bookings={groups.today.arriving} />
                <BookingGroup title={copy.sections.staying} bookings={groups.today.staying} />
                <BookingGroup title={copy.sections.departing} bookings={groups.today.departing} />
              </>
            )}
          </SegmentedTabsContent>

          <SegmentedTabsContent value="upcoming" className="outline-none">
            {groups.upcoming.length === 0 && filtering ? (
              noResults
            ) : groups.upcoming.length === 0 ? (
              <EmptyState
                compact
                icon={CalendarClock}
                title={copy.empty.upcomingTitle}
                description={copy.empty.upcomingBody}
                action={
                  <Button asChild variant="secondary">
                    <Link href={routes.newBooking()}>
                      <Plus aria-hidden />
                      {t.common.nav.newBooking}
                    </Link>
                  </Button>
                }
              />
            ) : (
              <MonthGroups bookings={groups.upcoming} />
            )}
          </SegmentedTabsContent>

          <SegmentedTabsContent value="past" className="outline-none">
            {groups.past.length === 0 && filtering ? (
              noResults
            ) : groups.past.length === 0 ? (
              <EmptyState compact icon={History} title={copy.empty.pastTitle} description={copy.empty.pastBody} />
            ) : (
              <MonthGroups bookings={groups.past} />
            )}
          </SegmentedTabsContent>
        </SegmentedTabs>
      )}
    </div>
  );
}

function AwaitingView({
  bookings,
  onClear,
  toolbar,
  chips,
  noResults,
}: {
  bookings: BookingRecord[];
  onClear: () => void;
  toolbar: ReactNode;
  chips: ReactNode;
  /** Replaces the "everyone's details are in" message when filters hide everything. */
  noResults: ReactNode;
}) {
  const copy = useCopy().bookings.list.awaitingFilter;
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3 rounded-2xl border border-brand-100 bg-brand-50 px-4 py-3">
        <div className="min-w-0">
          <h2 className="text-body font-semibold text-ink">{copy.title}</h2>
          <p className="text-subhead text-ink-2">{copy.description}</p>
        </div>
        <Button variant="secondary" size="sm" onClick={onClear} leadingIcon={<X />} className="shrink-0">
          {copy.clear}
        </Button>
      </div>
      {toolbar}
      {chips}
      {bookings.length === 0 ? (
        (noResults ?? <EmptyState compact icon={CircleCheck} title={copy.emptyTitle} description={copy.emptyBody} />)
      ) : (
        <BookingList bookings={bookings} />
      )}
    </section>
  );
}

function FirstBookingEmpty() {
  const t = useCopy();
  return (
    <div className={surfaceStyles({ radius: "xl" })}>
      <EmptyState
        illustration={<HomestayScene className="w-64 max-w-full" />}
        title={t.bookings.list.empty.allTitle}
        description={t.bookings.list.empty.allBody}
        action={
          <Button asChild size="xl" className="px-7">
            <Link href={routes.newBooking()}>
              <Plus aria-hidden />
              {t.common.nav.newBooking}
            </Link>
          </Button>
        }
      />
    </div>
  );
}

/** Phones only: the main action, always within thumb reach. */
function NewBookingFab() {
  const t = useCopy();
  return (
    <Link
      href={routes.newBooking()}
      className="fixed right-4 bottom-[calc(4rem+env(safe-area-inset-bottom)+1rem)] z-30 flex h-14 items-center gap-2 rounded-2xl bg-brand-600 pr-5 pl-4 text-body font-semibold text-white shadow-fab transition-transform duration-150 outline-none focus-visible:ring-4 focus-visible:ring-brand-300 active:scale-95 md:hidden"
    >
      <Plus className="size-6" aria-hidden />
      {t.common.nav.newBooking}
    </Link>
  );
}

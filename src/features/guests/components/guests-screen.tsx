"use client";

import { ArrowDownUp, Plus, SearchX, Users, X } from "lucide-react";
import Link from "next/link";
import { Page, PageTitle } from "@/components/layout/page";
import { Button } from "@/components/ui/button";
import { surfaceStyles } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { ExportButton, type ExportPeriod } from "@/components/ui/export-button";
import { FilterButton, FilterChips, NoFilterResults } from "@/components/ui/filters";
import { NativeSelect } from "@/components/ui/native-select";
import { SearchInput } from "@/components/ui/search-input";
import { routes } from "@/config/routes";
import { useCopy } from "@/content";
import { useBookings } from "@/features/bookings/queries";
import { cn } from "@/lib/cn";
import { todayISO } from "@/lib/dates";
import type { ExportFormat } from "@/lib/export/table";
import type { FilterState } from "@/lib/filters";
import { useUrlFilters } from "@/lib/hooks/use-url-filters";
import { GUEST_SORTS, parseGuestSort, type GuestSort } from "../guest-collections";
import {
  buildGuestGroups,
  guestFilterFields,
  matchesGuestFilters,
  searchGroups,
  sortGroups,
  type GuestGroup,
} from "../guest-groups";
import { useGuests } from "../queries";
import { useGuestListParams } from "../use-guest-list-params";
import { GuestList, GuestListSkeleton } from "./guest-list";

export function GuestsScreen() {
  const t = useCopy();
  const guests = useGuests();
  const bookings = useBookings();
  const people = guests.data;

  return (
    <Page width="fluid" className="pb-10">
      <PageTitle
        title={t.guests.list.title}
        // Keep the line's height while loading so the list doesn't jump.
        subtitle={people ? people.length > 0 && t.common.count.people(people.length) : <>&nbsp;</>}
      />

      {guests.isError || bookings.isError ? (
        <ErrorState
          onRetry={() => {
            void guests.refetch();
            void bookings.refetch();
          }}
        />
      ) : !people || !bookings.data ? (
        <GuestListSkeleton />
      ) : bookings.data.length === 0 ? (
        <EmptyGuestBook />
      ) : (
        <GuestsContent groups={buildGuestGroups(bookings.data)} />
      )}
    </Page>
  );
}

function GuestsContent({ groups }: { groups: GuestGroup[] }) {
  const t = useCopy();
  const l = t.guests.list;
  const { query, sort, setQuery, setSort } = useGuestListParams();
  const fields = guestFilterFields(t);
  const filters = useUrlFilters(fields);
  const today = todayISO();
  const searching = query.trim().length > 0;

  const visibleFor = (state: FilterState) =>
    sortGroups(
      searchGroups(
        groups.filter((group) => matchesGuestFilters(group, state, today)),
        query,
      ),
      sort,
      today,
    );
  const visible = visibleFor(filters.values);

  /** On screen: search and filters as they are. A period: the same, but by these check-in dates. */
  const exportMatches = (period: ExportPeriod) =>
    period.kind === "view" ? visible : visibleFor({ ...filters.values, checkin: { from: period.from, to: period.to } });

  const exportFile = async (format: ExportFormat, period: ExportPeriod) => {
    const matches = exportMatches(period);
    const [{ exportTables }, { guestsExportTables }] = await Promise.all([import("@/lib/export"), import("../export")]);
    return exportTables({
      area: t.guests.export.fileName,
      tables: guestsExportTables(
        t,
        matches.map((match) => match.group),
        today,
      ),
      format,
      today,
    });
  };

  return (
    <div className="flex flex-col gap-4 md:gap-5">
      <div className="flex flex-col gap-3 lg:flex-row">
        <SearchInput
          value={query}
          onChange={setQuery}
          label={l.searchLabel}
          placeholder={l.searchPlaceholder}
          className="lg:flex-1"
        />
        <div className="flex gap-2 lg:contents">
          <SortSelect value={sort} onChange={setSort} className="min-w-0 flex-1 lg:w-48 lg:flex-none" />
          <FilterButton
            compact
            fields={fields}
            values={filters.values}
            onApply={filters.apply}
            countFor={(draft) => visibleFor(draft).length}
          />
          <ExportButton
            compact
            what={t.guests.export.what}
            describe={(period) => {
              const matches = exportMatches(period);
              const people = matches.reduce((sum, match) => sum + 1 + match.group.members.length, 0);
              return matches.length ? t.guests.export.summary(matches.length, people) : null;
            }}
            onExport={exportFile}
          />
        </div>
      </div>
      <FilterChips fields={fields} values={filters.values} onApply={filters.apply} />

      <p className="sr-only" aria-live="polite">
        {searching ? l.results(visible.length) : ""}
      </p>

      {visible.length === 0 && searching ? (
        <EmptyState
          compact
          icon={SearchX}
          title={l.noResults.title(query.trim())}
          description={l.noResults.body}
          action={
            <Button variant="secondary" leadingIcon={<X />} onClick={() => setQuery("")}>
              {l.noResults.clear}
            </Button>
          }
        />
      ) : visible.length === 0 ? (
        <NoFilterResults onClear={() => filters.apply({})} />
      ) : (
        <GuestList matches={visible} sort={sort} today={today} />
      )}
    </div>
  );
}

function SortSelect({
  value,
  onChange,
  className,
}: {
  value: GuestSort;
  onChange: (sort: GuestSort) => void;
  className?: string;
}) {
  const l = useCopy().guests.list;
  return (
    <div className={cn("relative", className)}>
      <ArrowDownUp
        className="pointer-events-none absolute top-1/2 left-3.5 z-10 size-4.5 -translate-y-1/2 text-ink-3"
        aria-hidden
      />
      <NativeSelect
        aria-label={l.sortLabel}
        value={value}
        onChange={(event) => onChange(parseGuestSort(event.target.value))}
        className="pl-10"
      >
        {GUEST_SORTS.map((sort) => (
          <option key={sort} value={sort}>
            {l.sorts[sort]}
          </option>
        ))}
      </NativeSelect>
    </div>
  );
}

function EmptyGuestBook() {
  const t = useCopy();
  return (
    <div className={surfaceStyles({ radius: "xl" })}>
      <EmptyState
        icon={Users}
        title={t.guests.list.empty.title}
        description={t.guests.list.empty.body}
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

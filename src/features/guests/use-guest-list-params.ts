"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { startTransition, useOptimistic } from "react";
import { withParams } from "@/lib/url";
import { DEFAULT_GUEST_SORT, parseGuestSort, type GuestSort } from "./guest-collections";

export interface GuestListParams {
  query: string;
  sort: GuestSort;
}

/**
 * Search and sort live in the URL (`?q=&sort=`), so refresh and back/forward
 * bring the same view back. The optimistic copy keeps typing instant while
 * the router catches up with the new URL.
 */
export function useGuestListParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [params, setOptimisticParams] = useOptimistic<GuestListParams>({
    query: searchParams.get("q") ?? "",
    sort: parseGuestSort(searchParams.get("sort")),
  });

  const update = (next: Partial<GuestListParams>) => {
    const merged = { ...params, ...next };
    startTransition(() => {
      setOptimisticParams(merged);
      // Only search and sort change; filters and anything else in the URL stay.
      const href = withParams(pathname, searchParams, {
        q: merged.query || undefined,
        sort: merged.sort === DEFAULT_GUEST_SORT ? undefined : merged.sort,
      });
      router.replace(href, { scroll: false });
    });
  };

  return {
    ...params,
    setQuery: (query: string) => update({ query }),
    setSort: (sort: GuestSort) => update({ sort }),
  };
}

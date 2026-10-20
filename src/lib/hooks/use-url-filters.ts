"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { countActive, readFilters, writeFilters, type FilterField, type FilterState } from "@/lib/filters";

/**
 * A screen's filters, read from and written to the URL. Other parameters
 * (tab, search, sort) are left untouched.
 */
export function useUrlFilters(fields: readonly FilterField[]) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const values = readFilters(fields, new URLSearchParams(searchParams.toString()));

  const apply = (next: FilterState) => {
    const query = writeFilters(fields, next, new URLSearchParams(searchParams.toString())).toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  return { values, apply, activeCount: countActive(fields, values) };
}

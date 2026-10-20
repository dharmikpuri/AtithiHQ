"use client";

import type { ComponentProps } from "react";
import { NativeSelect } from "@/components/ui/native-select";
import { COUNTRIES, countryName } from "@/domain/countries";

/** Nationality picker. India first, then common visitor countries. */
export function CountrySelect(props: Omit<ComponentProps<typeof NativeSelect>, "children">) {
  return (
    <NativeSelect autoComplete="country" {...props}>
      {COUNTRIES.map((country) => (
        <option key={country.code} value={country.code}>
          {countryName(country.code)}
        </option>
      ))}
    </NativeSelect>
  );
}

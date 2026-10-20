import type { CountryCode } from "./types";

export interface Country {
  code: CountryCode;
  /** International dialling prefix without the `+`. */
  dial: string;
}

/**
 * Countries offered for nationality and phone prefixes.
 * India first, then the most common visitor origins, then alphabetical.
 * Names are resolved at runtime with `Intl.DisplayNames`, so they localise
 * automatically when other languages are added.
 */
export const COUNTRIES: readonly Country[] = [
  { code: "IN", dial: "91" },
  { code: "AE", dial: "971" },
  { code: "GB", dial: "44" },
  { code: "US", dial: "1" },
  { code: "AU", dial: "61" },
  { code: "CA", dial: "1" },
  { code: "DE", dial: "49" },
  { code: "FR", dial: "33" },
  { code: "IT", dial: "39" },
  { code: "RU", dial: "7" },
  { code: "SG", dial: "65" },
  { code: "NP", dial: "977" },
  { code: "LK", dial: "94" },
  { code: "BD", dial: "880" },
  { code: "AR", dial: "54" },
  { code: "AT", dial: "43" },
  { code: "BE", dial: "32" },
  { code: "BH", dial: "973" },
  { code: "BR", dial: "55" },
  { code: "BT", dial: "975" },
  { code: "CH", dial: "41" },
  { code: "CN", dial: "86" },
  { code: "DK", dial: "45" },
  { code: "ES", dial: "34" },
  { code: "FI", dial: "358" },
  { code: "ID", dial: "62" },
  { code: "IE", dial: "353" },
  { code: "IL", dial: "972" },
  { code: "JP", dial: "81" },
  { code: "KE", dial: "254" },
  { code: "KR", dial: "82" },
  { code: "KW", dial: "965" },
  { code: "MV", dial: "960" },
  { code: "MX", dial: "52" },
  { code: "MY", dial: "60" },
  { code: "NL", dial: "31" },
  { code: "NO", dial: "47" },
  { code: "NZ", dial: "64" },
  { code: "OM", dial: "968" },
  { code: "PH", dial: "63" },
  { code: "PL", dial: "48" },
  { code: "PT", dial: "351" },
  { code: "QA", dial: "974" },
  { code: "SA", dial: "966" },
  { code: "SE", dial: "46" },
  { code: "TH", dial: "66" },
  { code: "TR", dial: "90" },
  { code: "UA", dial: "380" },
  { code: "ZA", dial: "27" },
];

export function findCountry(code: CountryCode): Country | undefined {
  return COUNTRIES.find((country) => country.code === code);
}

const displayNames = new Map<string, Intl.DisplayNames>();

/** Localised country name, e.g. `IN` → "India". */
export function countryName(code: CountryCode, locale = "en-IN"): string {
  let names = displayNames.get(locale);
  if (!names) {
    names = new Intl.DisplayNames([locale], { type: "region" });
    displayNames.set(locale, names);
  }
  return names.of(code) ?? code;
}

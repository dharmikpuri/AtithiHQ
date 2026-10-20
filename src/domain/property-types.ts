/**
 * Kinds of property an owner can register. To add one: append its id here, then TypeScript
 * points at everything that needs it (its name and description in `common.propertyTypes`,
 * its illustration in `components/brand/property-illustration.tsx`).
 */
export const PROPERTY_TYPES = ["homestay", "villa", "guest_house", "cottage", "hostel"] as const;

export type PropertyType = (typeof PROPERTY_TYPES)[number];

export function isPropertyType(value: unknown): value is PropertyType {
  return typeof value === "string" && (PROPERTY_TYPES as readonly string[]).includes(value);
}

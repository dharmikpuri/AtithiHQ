/**
 * The owner and the property are separate profiles: who runs the place, and the place itself.
 * Contact details belong to the owner; the address belongs to the property, never the reverse.
 * Screens read these shapes instead of picking fields off the raw records.
 */
import { indianStateName } from "./indian-states";
import type { PropertyGst } from "./gst";
import { inventoryOf, type RoomInventory } from "./inventory";
import type { PropertyType } from "./property-types";
import type { IndianStateCode, Owner, PhoneE164, Property, TimeOfDay } from "./types";

export interface OwnerProfile {
  name: string;
  /** Verified sign-in number. Read-only. */
  phone: PhoneE164;
  alternatePhone: PhoneE164 | null;
  email: string | null;
}

export interface PropertyAddress {
  /** Area or locality, shown to guests. */
  locality: string;
  city: string;
  state: IndianStateCode;
  pincode: string;
}

export interface PropertyProfile {
  type: PropertyType;
  name: string;
  address: PropertyAddress;
  checkInTime: TimeOfDay;
  checkOutTime: TimeOfDay;
  /** How it is rented, and how many rooms (as a quantity). */
  inventory: RoomInventory;
  /** GST details, or `null` when not GST registered. */
  gst: PropertyGst | null;
}

export function ownerProfileOf(owner: Owner): OwnerProfile {
  return { name: owner.name, phone: owner.phone, alternatePhone: owner.alternatePhone, email: owner.email };
}

export function propertyProfileOf(property: Property): PropertyProfile {
  return {
    type: property.type,
    name: property.name,
    address: { locality: property.location, city: property.city, state: property.state, pincode: property.pincode },
    checkInTime: property.checkInTime,
    checkOutTime: property.checkOutTime,
    inventory: inventoryOf(property),
    gst: property.gst,
  };
}

/** "Mapusa, Goa 403507": the postal part of the address, for one line. */
export function formatPostalAddress({ city, state, pincode }: PropertyAddress): string {
  return [city, [indianStateName(state), pincode].filter(Boolean).join(" ")].filter(Boolean).join(", ");
}

/**
 * The address as printed on a document: the locality, then the postal line ("Assagao" /
 * "Mapusa, Goa 403507"). The locality is left out when the postal line already says it, e.g. an
 * owner who typed "Mapusa" as both, or "Mapusa, Goa" as the locality, so nothing prints twice.
 */
export function formatAddressLines(address: PropertyAddress): string[] {
  const postal = formatPostalAddress(address);
  const locality = address.locality.trim();
  // Whole names only, so a locality like "Pa" isn't mistaken for part of "Mapusa".
  const named = new Set(
    [address.city, indianStateName(address.state), address.pincode].map((part) => (part ?? "").trim().toLowerCase()),
  );
  const repeats = locality === "" || locality.split(",").every((part) => named.has(part.trim().toLowerCase()));
  return repeats ? [postal] : [locality, postal];
}

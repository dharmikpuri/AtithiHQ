/**
 * Data store for the mock backend.
 *
 * One "tenant" per owner phone number, mirroring the architecture rule that
 * each owner's records are isolated at the data layer. The tenants are saved in
 * this browser's localStorage, so every tab shares them and a refresh keeps them
 * (a real backend replaces all of this). Other browsers and devices see nothing.
 *
 * Every API call runs `hydrate()` → work → `persist()` in one synchronous step
 * (see `respond` in mock-api.ts), so a tab always starts from the latest saved
 * data and never overwrites another tab's newer write with a stale copy.
 *
 * The demo is seeded once, relative to that day, and then left alone: wiping it at midnight
 * would throw away whatever someone was in the middle of. "Log out → reset the demo" re-seeds it.
 */
import type {
  Booking,
  Guest,
  IdDocument,
  Invoice,
  Owner,
  Payment,
  PhoneE164,
  Property,
  ReceiptLink,
} from "@/domain/types";
import { todayISO } from "@/lib/dates";
import { createDemoTenant, DEMO_OWNER_PHONE } from "./seed";

export interface Tenant {
  owner: Owner;
  property: Property | null;
  guests: Guest[];
  bookings: Booking[];
  payments: Payment[];
  documents: IdDocument[];
  invoices: Invoice[];
  receiptLinks: ReceiptLink[];
}

const STORAGE_KEY = "atithi.mock-store.v1";
const STORAGE_VERSION = 1;

interface StoredPayload {
  version: number;
  tenants: [PhoneE164, Tenant][];
}

let tenants = new Map<PhoneE164, Tenant>();
/** The last string written to, or read from, storage: writing the same thing again is skipped. */
let lastSerialised: string | null = null;
let warned = false;

function warnOnce(error: unknown) {
  if (warned) return;
  warned = true;
  console.warn("Mock data can't be saved in this browser, so it lasts only until this page closes.", error);
}

function ensureDemoTenant() {
  if (!tenants.has(DEMO_OWNER_PHONE)) tenants.set(DEMO_OWNER_PHONE, createDemoTenant(todayISO()));
}

function parsePayload(raw: string): StoredPayload | null {
  try {
    const data = JSON.parse(raw) as Partial<StoredPayload> | null;
    if (!data || data.version !== STORAGE_VERSION || !Array.isArray(data.tenants)) return null;
    return { version: STORAGE_VERSION, tenants: data.tenants };
  } catch {
    return null;
  }
}

let counter = 0;
/** Short unique id with a readable prefix, e.g. `bk_lq3x9a2k4f`. The random tail keeps tabs from colliding. */
export function newId(prefix: string): string {
  counter += 1;
  return `${prefix}_${Date.now().toString(36)}${counter.toString(36)}${randomChars(4)}`;
}

const TOKEN_ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";

function randomChars(length: number): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => TOKEN_ALPHABET[byte % TOKEN_ALPHABET.length]).join("");
}

/** Unguessable link token. A real backend should use a CSPRNG of ≥128 bits. */
export function newLinkToken(): string {
  return randomChars(10);
}

export function nowISO(): string {
  return new Date().toISOString();
}

/** Runs `callback` when another tab saves new data. Returns the cleanup. */
export function onStoreChangedElsewhere(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const listener = (event: StorageEvent) => {
    // `key` is null when the whole storage is cleared.
    if (event.key === null || event.key === STORAGE_KEY) callback();
  };
  window.addEventListener("storage", listener);
  return () => window.removeEventListener("storage", listener);
}

export const store = {
  /**
   * Replaces the in-memory copy with what is saved, so this tab works on the latest data.
   * A missing, unreadable or older-format save starts empty. Where storage isn't available
   * (server, private mode) the in-memory copy is kept as it is.
   */
  hydrate(): void {
    if (typeof window === "undefined") return;
    let raw: string | null;
    try {
      raw = window.localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      warnOnce(error);
      return;
    }

    const payload = raw === null ? null : parsePayload(raw);
    if (raw !== null && !payload) {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Nothing to do: it is replaced on the next successful write.
      }
      raw = null;
    }

    tenants = new Map(payload?.tenants ?? []);
    lastSerialised = raw;
  },

  /** Saves the in-memory copy. Skipped when nothing changed; a failed write keeps working in memory. */
  persist(): void {
    if (typeof window === "undefined") return;
    const payload: StoredPayload = {
      version: STORAGE_VERSION,
      tenants: [...tenants.entries()],
    };
    const serialised = JSON.stringify(payload);
    if (serialised === lastSerialised) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, serialised);
      lastSerialised = serialised;
    } catch (error) {
      warnOnce(error);
    }
  },

  getTenant(phone: PhoneE164): Tenant | undefined {
    ensureDemoTenant();
    return tenants.get(phone);
  },

  getOrCreateTenant(phone: PhoneE164): Tenant {
    ensureDemoTenant();
    let tenant = tenants.get(phone);
    if (!tenant) {
      tenant = {
        owner: {
          id: newId("own"),
          name: "",
          phone,
          alternatePhone: null,
          email: null,
          consent: null,
          createdAt: nowISO(),
        },
        property: null,
        guests: [],
        bookings: [],
        payments: [],
        documents: [],
        invoices: [],
        receiptLinks: [],
      };
      tenants.set(phone, tenant);
    }
    return tenant;
  },

  /** Removes a number's data. The demo number comes back fresh on the next access. */
  deleteTenant(phone: PhoneE164): void {
    tenants.delete(phone);
  },

  /** Public lookup used by the guest link — searches every tenant. */
  findByLinkToken(token: string): { tenant: Tenant; booking: Booking } | undefined {
    ensureDemoTenant();
    for (const tenant of tenants.values()) {
      const booking = tenant.bookings.find((item) => item.link.token === token);
      if (booking) return { tenant, booking };
    }
    return undefined;
  },

  /** Public lookup used by the shared receipt page — searches every tenant. */
  findByReceiptToken(token: string): { tenant: Tenant; link: ReceiptLink; invoice: Invoice } | undefined {
    ensureDemoTenant();
    for (const tenant of tenants.values()) {
      const link = tenant.receiptLinks.find((item) => item.token === token);
      const invoice = link && tenant.invoices.find((item) => item.id === link.invoiceId);
      if (link && invoice) return { tenant, link, invoice };
    }
    return undefined;
  },
};

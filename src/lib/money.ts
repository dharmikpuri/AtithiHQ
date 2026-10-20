import type { Paise, Rupees } from "@/domain/types";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const grouped = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

/** ₹25,000 · ₹1,24,500 (Indian digit grouping). */
export function formatINR(amount: Rupees): string {
  return inr.format(amount);
}

/** 125000 → "1,25,000" (no symbol), used inside amount inputs. */
export function formatAmountInput(amount: Rupees | null | undefined): string {
  if (amount === null || amount === undefined || Number.isNaN(amount)) return "";
  return grouped.format(amount);
}

/** "1,25,000" → 125000. Returns `null` for empty input. */
export function parseAmountInput(value: string): Rupees | null {
  const digits = value.replace(/\D/g, "");
  if (digits === "") return null;
  return Number.parseInt(digits, 10);
}

const inrPaise = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** 952381 paise → "₹9,523.81". Always two decimals, for tax invoices. */
export function formatINRPaise(paise: Paise): string {
  return inrPaise.format(paise / 100);
}

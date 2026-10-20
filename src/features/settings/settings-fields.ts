import { z } from "zod";
import { getCopy } from "@/content";
import { isValidEmail } from "@/domain/registration";
import type { TimeOfDay } from "@/domain/types";
import { locationField } from "@/features/onboarding/setup-schema";
import { nameField } from "@/lib/validation";

/** The editable text settings. Same rules as registration. */
export const textSettingSchemas = {
  ownerName: nameField,
  propertyName: nameField,
  location: locationField,
  email: z.string().trim().refine(isValidEmail, getCopy().common.validation.emailInvalid),
} satisfies Record<string, z.ZodType<string>>;

export type TextSettingKind = keyof typeof textSettingSchemas;
export type TimeSettingKind = "checkInTime" | "checkOutTime";

/** Every half hour of the day, "00:00" to "23:30". */
const HALF_HOURS: TimeOfDay[] = Array.from(
  { length: 48 },
  (_, index) => `${String(Math.floor(index / 2)).padStart(2, "0")}:${index % 2 ? "30" : "00"}`,
);

/** Half-hour steps, plus the current value if it was saved off-step (e.g. "14:15"). */
export function timeOptions(current: TimeOfDay): TimeOfDay[] {
  return HALF_HOURS.includes(current) ? HALF_HOURS : [...HALF_HOURS, current].sort();
}

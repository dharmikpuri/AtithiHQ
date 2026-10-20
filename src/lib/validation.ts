/** Shared form validators. Messages come from the copy dictionary. */
import { z } from "zod";
import { getCopy } from "@/content";
import { NAME_LENGTH } from "@/domain/constants";
import { isValidE164, splitE164 } from "@/lib/phone";

const v = getCopy().common.validation;

export const nameField = z.string().trim().min(NAME_LENGTH.min, v.nameTooShort).max(NAME_LENGTH.max, v.nameTooLong);

/** Optional phone: empty, or a complete valid number. */
export const optionalPhoneField = z.string().refine(
  (value) => value === "" || isValidE164(value),
  (value) => ({ message: splitE164(value || "+91").dial === "91" ? v.phoneInvalidIndia : v.phoneInvalid }),
);

export const requiredPhoneField = z.string().refine(
  (value) => isValidE164(value),
  (value) => ({ message: splitE164(value || "+91").dial === "91" ? v.phoneInvalidIndia : v.phoneInvalid }),
);

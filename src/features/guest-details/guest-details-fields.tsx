"use client";

import { Controller, type UseFormReturn } from "react-hook-form";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { useCopy } from "@/content";
import { CountrySelect } from "./country-select";
import type { GuestDetailsValues } from "./guest-details-schema";

interface GuestDetailsFieldsProps {
  form: UseFormReturn<GuestDetailsValues>;
  phoneRequired?: boolean;
  phoneHint?: string;
  autoFocus?: boolean;
}

/** Name, mobile and nationality. */
export function GuestDetailsFields({ form, phoneRequired = false, phoneHint, autoFocus }: GuestDetailsFieldsProps) {
  const t = useCopy().common.fields;
  const { errors } = form.formState;
  return (
    <div className="flex flex-col gap-4">
      <Field label={t.fullName} error={errors.name?.message}>
        <Input
          autoComplete="name"
          autoCapitalize="words"
          enterKeyHint="next"
          autoFocus={autoFocus}
          {...form.register("name")}
        />
      </Field>
      <Field label={t.mobile} hint={phoneHint} error={errors.phone?.message} optional={!phoneRequired}>
        <Controller
          control={form.control}
          name="phone"
          render={({ field }) => <PhoneInput value={field.value} onChange={field.onChange} onBlur={field.onBlur} />}
        />
      </Field>
      <Field label={t.nationality} error={errors.nationality?.message}>
        <CountrySelect {...form.register("nationality")} />
      </Field>
    </div>
  );
}

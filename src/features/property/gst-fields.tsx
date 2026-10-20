"use client";

import { ChoiceChips } from "@/components/ui/choice-chips";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RadioCards } from "@/components/ui/radio-cards";
import { useCopy } from "@/content";
import { GST_RATES, GSTIN_LENGTH, isGstRate, normaliseGstin, type GstRate } from "@/domain/gst";

/**
 * Whether the property is GST registered and, if so, its GSTIN and rate. Optional everywhere:
 * "not registered" is the default. Used in registration and in Settings.
 */
export function GstFields({
  registered,
  gstin,
  rate,
  onRegisteredChange,
  onGstinChange,
  onRateChange,
  gstinError,
  rateError,
}: {
  registered: boolean;
  gstin: string;
  rate: GstRate | null;
  onRegisteredChange: (registered: boolean) => void;
  onGstinChange: (gstin: string) => void;
  onRateChange: (rate: GstRate) => void;
  gstinError?: string;
  rateError?: string;
}) {
  const s = useCopy().auth.setup;

  return (
    <div className="flex flex-col gap-5">
      <Field label={s.gstQuestion}>
        <RadioCards
          value={registered ? "yes" : "no"}
          onChange={(next) => onRegisteredChange(next === "yes")}
          options={[
            { value: "no", label: s.gstNo.label, description: s.gstNo.description },
            { value: "yes", label: s.gstYes.label, description: s.gstYes.description },
          ]}
        />
      </Field>

      {registered && (
        <>
          <Field label={s.gstin} hint={s.gstinHint} error={gstinError}>
            <Input
              value={gstin}
              // Capitals and no spaces as they type or paste. Capped after the spaces are gone, not
              // with `maxLength`, which would cut a pasted "30ABCDE 1234F1Z5" short.
              onChange={(event) => onGstinChange(normaliseGstin(event.target.value).slice(0, GSTIN_LENGTH))}
              autoCapitalize="characters"
              autoComplete="off"
              spellCheck={false}
              placeholder={s.gstinPlaceholder}
              className="tabular"
              aria-required
            />
          </Field>
          <Field label={s.gstRate} hint={s.gstRateHint} error={rateError}>
            <ChoiceChips
              value={rate === null ? null : String(rate)}
              onChange={(next) => {
                const value = Number(next);
                if (isGstRate(value)) onRateChange(value);
              }}
              options={GST_RATES.map((value) => ({ value: String(value), label: s.gstRateOption(value) }))}
            />
          </Field>
        </>
      )}
    </div>
  );
}

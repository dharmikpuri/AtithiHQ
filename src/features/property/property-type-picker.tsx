"use client";

import { Check } from "lucide-react";
import { RadioGroup } from "radix-ui";
import { PropertyIllustration } from "@/components/brand/property-illustration";
import { useFieldControl } from "@/components/ui/field";
import { useCopy } from "@/content";
import { PROPERTY_TYPES, type PropertyType } from "@/domain/property-types";
import { cn } from "@/lib/cn";

/**
 * Choose the kind of property: one card per type, with its illustration.
 * A radio group, so arrow keys move between cards. Inside a `Field`, it takes the field's label.
 */
export function PropertyTypePicker({
  value,
  onChange,
  onBlur,
  className,
}: {
  value: PropertyType | "" | null | undefined;
  onChange: (value: PropertyType) => void;
  onBlur?: () => void;
  className?: string;
}) {
  const t = useCopy();
  const field = useFieldControl();
  return (
    <RadioGroup.Root
      value={value ?? ""}
      onValueChange={(next) => onChange(next as PropertyType)}
      onBlur={onBlur}
      aria-labelledby={field ? `${field.id}-label` : undefined}
      aria-describedby={field?.describedBy}
      aria-invalid={field?.invalid || undefined}
      className={cn("grid grid-cols-2 gap-2.5 sm:grid-cols-3", className)}
    >
      {PROPERTY_TYPES.map((type) => {
        const copy = t.common.propertyTypes[type];
        return (
          <RadioGroup.Item
            key={type}
            value={type}
            className={cn(
              "group relative flex flex-col items-center gap-2 rounded-2xl border bg-surface px-2.5 pt-3.5 pb-3 text-center transition-[background-color,border-color,box-shadow] duration-150",
              "border-line-strong hover:border-ink-4 hover:bg-subtle active:bg-canvas",
              "ring-brand-600 ring-inset data-[state=checked]:border-brand-600 data-[state=checked]:bg-brand-50/60 data-[state=checked]:ring-1",
              field?.invalid && "border-danger-500",
            )}
          >
            <span
              aria-hidden
              className="absolute top-2 right-2 flex size-5 scale-0 items-center justify-center rounded-full bg-brand-600 text-white transition-transform duration-150 group-data-[state=checked]:scale-100"
            >
              <Check className="size-3.5" strokeWidth={3} />
            </span>
            <PropertyIllustration type={type} className="size-14" />
            <span className="flex flex-col gap-0.5">
              <span className="text-subhead font-semibold text-ink">{copy.label}</span>
              <span className="text-caption leading-4 text-ink-3">{copy.description}</span>
            </span>
          </RadioGroup.Item>
        );
      })}
    </RadioGroup.Root>
  );
}

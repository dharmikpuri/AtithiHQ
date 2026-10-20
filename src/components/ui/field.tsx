"use client";

import { CircleAlert } from "lucide-react";
import { createContext, useContext, useId, type ReactNode } from "react";
import { useCopy } from "@/content";
import { cn } from "@/lib/cn";

interface FieldContextValue {
  id: string;
  describedBy: string | undefined;
  invalid: boolean;
}

const FieldContext = createContext<FieldContextValue | null>(null);

/**
 * Wires a control to its label, hint and error.
 * Controls inside (`Input`, `Select`, `PhoneInput`…) pick up the ids automatically.
 */
export function useFieldControl() {
  return useContext(FieldContext);
}

interface FieldProps {
  label: ReactNode;
  children: ReactNode;
  hint?: ReactNode;
  error?: string;
  optional?: boolean;
  /** Visually hide the label but keep it for screen readers. */
  hideLabel?: boolean;
  /** Override the generated id (e.g. to match an external label). */
  id?: string;
  className?: string;
  /** Rendered to the right of the label, e.g. a "Change" link. */
  labelAction?: ReactNode;
  /** Label and control on one row — for compact controls like a stepper. */
  inline?: boolean;
}

export function Field({
  label,
  children,
  hint,
  error,
  optional,
  hideLabel,
  id,
  className,
  labelAction,
  inline,
}: FieldProps) {
  const t = useCopy();
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const hintId = hint ? `${controlId}-hint` : undefined;
  const errorId = error ? `${controlId}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;

  return (
    <FieldContext.Provider value={{ id: controlId, describedBy, invalid: Boolean(error) }}>
      <div className={cn("flex flex-col gap-1.5", className)}>
        <div className={cn(inline && "flex items-center justify-between gap-4")}>
          <div className={cn("flex items-baseline justify-between gap-3", hideLabel && "sr-only")}>
            <label
              id={`${controlId}-label`}
              htmlFor={controlId}
              className={cn("font-medium", inline ? "text-body text-ink" : "text-subhead text-ink-2")}
            >
              {label}
              {optional && <span className="ml-1.5 font-normal text-ink-3">· {t.common.fields.optional}</span>}
            </label>
            {labelAction}
          </div>
          {inline ? children : <div className="mt-1.5">{children}</div>}
        </div>
        {error ? (
          <p id={errorId} role="alert" className="flex items-start gap-1.5 text-subhead font-medium text-danger-600">
            <CircleAlert className="mt-px size-4 shrink-0" aria-hidden />
            {error}
          </p>
        ) : (
          hint && (
            <p id={hintId} className="text-subhead text-ink-3">
              {hint}
            </p>
          )
        )}
      </div>
    </FieldContext.Provider>
  );
}

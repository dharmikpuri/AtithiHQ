import { Check } from "lucide-react";
import { getCopy } from "@/content";
import { cn } from "@/lib/cn";

/** Where the new owner is: 1 mobile number, 2 verify, 3 your details. */
export type RegistrationStep = 1 | 2 | 3;

/**
 * Progress through registration. Three short segments with labels; finished steps show a tick.
 * The current step is announced ("Step 2 of 3: Verify").
 */
export function RegistrationSteps({ current, className }: { current: RegistrationStep; className?: string }) {
  const t = getCopy().auth.steps;
  const total = t.items.length;
  return (
    <nav aria-label={t.label} className={cn("flex flex-col gap-2", className)}>
      <p className="text-footnote font-semibold text-brand-700">
        {t.current(current, total)}
        <span className="sr-only">: {t.items[current - 1]}</span>
      </p>
      <ol className="grid grid-cols-3 gap-2">
        {t.items.map((label, index) => {
          const step = index + 1;
          const done = step < current;
          const active = step === current;
          return (
            <li key={label} aria-current={active ? "step" : undefined} className="flex flex-col gap-1.5">
              <span
                aria-hidden
                className={cn("h-1.5 rounded-full", done || active ? "bg-brand-600" : "bg-line-strong")}
              />
              <span
                className={cn(
                  "flex items-center gap-1 text-caption",
                  active ? "font-semibold text-ink" : done ? "text-ink-2" : "text-ink-3",
                )}
              >
                {done && <Check className="size-3.5 text-success-600" aria-hidden />}
                {label}
                {done && <span className="sr-only"> ({t.done})</span>}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

import type { LucideIcon } from "lucide-react";
import { useId, type ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { List } from "@/components/ui/list";

/**
 * A titled group of setting rows.
 * Phones and tablets: heading above the card. Desktop: heading and a one-line
 * description on the left, the card on the right.
 */
export function SettingsGroup({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: LucideIcon;
  title: ReactNode;
  description: ReactNode;
  children: ReactNode;
}) {
  const headingId = useId();
  return (
    <section
      aria-labelledby={headingId}
      className="grid grid-cols-1 gap-2.5 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-10 lg:border-t lg:border-line lg:py-8 lg:first:border-t-0 lg:first:pt-0"
    >
      <div className="px-1 lg:px-0 lg:pt-1">
        <span className="mb-3 hidden size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 lg:flex">
          <Icon className="size-5" aria-hidden />
        </span>
        <h2 id={headingId} className="text-callout font-semibold text-ink-2 lg:text-headline lg:text-ink">
          {title}
        </h2>
        <p className="mt-0.5 hidden text-subhead text-ink-3 md:block">{description}</p>
      </div>
      <Card className="overflow-hidden lg:self-start">
        <List>{children}</List>
      </Card>
    </section>
  );
}

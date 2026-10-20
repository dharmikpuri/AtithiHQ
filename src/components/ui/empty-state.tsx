import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { IconTile } from "./icon-tile";

interface EmptyStateProps {
  title: ReactNode;
  description?: ReactNode;
  icon?: LucideIcon;
  /** A custom illustration replaces the icon. */
  illustration?: ReactNode;
  action?: ReactNode;
  className?: string;
  compact?: boolean;
}

/** What a screen shows when there is nothing yet — always with a next step. */
export function EmptyState({
  title,
  description,
  icon: Icon,
  illustration,
  action,
  className,
  compact,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center text-center",
        compact ? "gap-3 px-4 py-8" : "gap-4 px-6 py-12 sm:py-16",
        className,
      )}
    >
      {illustration ??
        (Icon && (
          <span aria-hidden className="relative flex items-center justify-center p-4">
            <span className="absolute inset-0 rounded-full bg-brand-50" />
            <span className="absolute inset-2 rounded-full border border-brand-100 bg-surface/60" />
            <IconTile icon={Icon} size={compact ? "lg" : "xl"} className="relative" />
          </span>
        ))}
      <div className="flex max-w-sm flex-col gap-1.5">
        <h3 className={cn("text-ink", compact ? "text-headline" : "text-title-3")}>{title}</h3>
        {description && <p className="text-callout leading-6 text-ink-3">{description}</p>}
      </div>
      {action && <div className="mt-1 flex flex-col items-center gap-2">{action}</div>}
    </div>
  );
}

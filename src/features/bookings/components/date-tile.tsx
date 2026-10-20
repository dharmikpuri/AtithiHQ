import { format } from "date-fns";
import type { ISODate } from "@/domain/types";
import { cn } from "@/lib/cn";
import { fromISODate } from "@/lib/dates";

/** Calendar-leaf date: quick to scan down a list of arrivals. */
export function DateTile({ date, muted = false, className }: { date: ISODate; muted?: boolean; className?: string }) {
  const value = fromISODate(date);
  return (
    <span
      aria-hidden
      className={cn(
        "flex w-12 shrink-0 flex-col items-center justify-center overflow-hidden rounded-xl border text-center",
        muted ? "border-line bg-canvas text-ink-3" : "border-brand-100 bg-brand-50 text-brand-700",
        className,
      )}
    >
      <span
        className={cn(
          "w-full py-0.5 text-micro font-bold tracking-widest uppercase",
          muted ? "bg-ink/5 text-ink-2" : "bg-brand-600 text-white",
        )}
      >
        {format(value, "MMM")}
      </span>
      <span className="pt-0.5 pb-1 text-title-3 leading-6 tabular">{format(value, "d")}</span>
    </span>
  );
}

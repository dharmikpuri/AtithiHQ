import { cn } from "@/lib/cn";

const TONES = {
  brand: "bg-brand-500",
  success: "bg-success-500",
  accent: "bg-accent-500",
  warning: "bg-warning-500",
};

export function ProgressBar({
  value,
  tone = "brand",
  label,
  className,
}: {
  /** 0–1 */
  value: number;
  tone?: keyof typeof TONES;
  label: string;
  className?: string;
}) {
  const percent = Math.round(Math.min(1, Math.max(0, value)) * 100);
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      className={cn("h-2 w-full overflow-hidden rounded-full bg-ink/7", className)}
    >
      <div
        className={cn("h-full rounded-full transition-[width] duration-500 ease-out-soft", TONES[tone])}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

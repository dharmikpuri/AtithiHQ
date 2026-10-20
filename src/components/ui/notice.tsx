import { CircleAlert, CircleCheck, Info, TriangleAlert, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const TONES = {
  info: { box: "border-brand-100 bg-brand-50 text-brand-800", icon: Info, iconClass: "text-brand-500" },
  warning: {
    box: "border-warning-100 bg-warning-50 text-warning-700",
    icon: TriangleAlert,
    iconClass: "text-warning-600",
  },
  success: {
    box: "border-success-100 bg-success-50 text-success-700",
    icon: CircleCheck,
    iconClass: "text-success-600",
  },
  danger: { box: "border-danger-100 bg-danger-50 text-danger-700", icon: CircleAlert, iconClass: "text-danger-600" },
  neutral: { box: "border-line bg-subtle text-ink-2", icon: Info, iconClass: "text-ink-3" },
} satisfies Record<string, { box: string; icon: LucideIcon; iconClass: string }>;

/** Inline message inside a page or form. */
export function Notice({
  tone = "info",
  title,
  children,
  action,
  icon,
  className,
  role,
}: {
  tone?: keyof typeof TONES;
  /** "alert" for messages that appear after an action and must be announced. */
  role?: "alert" | "status";
  title?: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
  icon?: LucideIcon;
  className?: string;
}) {
  const style = TONES[tone];
  const Icon = icon ?? style.icon;
  return (
    <div role={role} className={cn("flex items-start gap-3 rounded-xl border px-3.5 py-3", style.box, className)}>
      <Icon className={cn("mt-0.5 size-4.5 shrink-0", style.iconClass)} aria-hidden />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5 text-subhead leading-5">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div>{children}</div>}
        {action && <div className="mt-2">{action}</div>}
      </div>
    </div>
  );
}

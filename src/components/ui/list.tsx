import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

export function List({ className, ...props }: ComponentProps<"ul">) {
  return <ul className={cn("divide-y divide-line", className)} {...props} />;
}

interface ListRowProps {
  title: ReactNode;
  subtitle?: ReactNode;
  leading?: ReactNode;
  /** Right-aligned value, e.g. a setting's current value. */
  value?: ReactNode;
  trailing?: ReactNode;
  href?: string;
  onClick?: () => void;
  /** Show a chevron to signal navigation. Defaults to true for links. */
  chevron?: boolean;
  tone?: "default" | "danger";
  className?: string;
  /** Extra content below the title row. */
  children?: ReactNode;
}

const rowBase =
  "flex w-full min-h-[60px] items-center gap-3 px-4 py-3 text-left sm:px-5 outline-none transition-colors duration-150 focus-visible:bg-brand-50/60";
const interactive = "cursor-pointer hover:bg-subtle active:bg-canvas";

export function ListRow({
  title,
  subtitle,
  leading,
  value,
  trailing,
  href,
  onClick,
  chevron,
  tone = "default",
  className,
  children,
}: ListRowProps) {
  const showChevron = chevron ?? Boolean(href || onClick);
  const content = (
    <>
      {leading && <span className="flex shrink-0 items-center">{leading}</span>}
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className={cn("truncate text-body font-medium", tone === "danger" ? "text-danger-600" : "text-ink")}>
          {title}
        </span>
        {subtitle && <span className="truncate text-subhead text-ink-3">{subtitle}</span>}
        {children}
      </span>
      {value && <span className="max-w-[45%] shrink-0 truncate text-right text-callout text-ink-3">{value}</span>}
      {trailing}
      {showChevron && <ChevronRight className="size-5 shrink-0 text-ink-4" aria-hidden />}
    </>
  );

  return (
    <li className="list-none">
      {href ? (
        <Link href={href} className={cn(rowBase, interactive, className)}>
          {content}
        </Link>
      ) : onClick ? (
        <button type="button" onClick={onClick} className={cn(rowBase, interactive, className)}>
          {content}
        </button>
      ) : (
        <div className={cn(rowBase, className)}>{content}</div>
      )}
    </li>
  );
}

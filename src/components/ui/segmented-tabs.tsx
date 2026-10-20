"use client";

import { Tabs } from "radix-ui";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Segmented control for switching between views of the same list. */
export const SegmentedTabs = Tabs.Root;

export function SegmentedTabsList({ className, ...props }: ComponentProps<typeof Tabs.List>) {
  return (
    <Tabs.List
      className={cn("flex w-full rounded-2xl bg-ink/6 p-1 sm:inline-flex sm:w-auto sm:self-start", className)}
      {...props}
    />
  );
}

export function SegmentedTabsTrigger({
  className,
  children,
  count,
  ...props
}: ComponentProps<typeof Tabs.Trigger> & { count?: number }) {
  return (
    <Tabs.Trigger
      className={cn(
        "group flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl px-4 text-callout font-medium text-ink-2 transition-[color,background-color,box-shadow] duration-150",
        "hover:text-ink data-[state=active]:bg-surface data-[state=active]:font-semibold data-[state=active]:text-ink data-[state=active]:shadow-raised",
        "sm:min-w-28 sm:flex-none",
        className,
      )}
      {...props}
    >
      {children}
      {count !== undefined && <TabCount>{count}</TabCount>}
    </Tabs.Trigger>
  );
}

function TabCount({ children }: { children: ReactNode }) {
  return (
    <span className="min-w-5 rounded-full bg-ink/7 px-1.5 text-center text-caption leading-5 font-semibold text-ink-3 tabular group-data-[state=active]:bg-brand-50 group-data-[state=active]:text-brand-700">
      {children}
    </span>
  );
}

export const SegmentedTabsContent = Tabs.Content;

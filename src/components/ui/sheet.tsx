"use client";

import { X } from "lucide-react";
import { Dialog } from "radix-ui";
import type { ReactNode } from "react";
import { Drawer } from "vaul";
import { useCopy } from "@/content";
import { cn } from "@/lib/cn";
import { useIsDesktopLayout } from "@/lib/hooks/use-media-query";
import { IconButton } from "./icon-button";

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  /** Sticky action area. Stays visible above the keyboard and home indicator. */
  footer?: ReactNode;
  size?: "md" | "lg" | "xl";
  /** Set false while saving so a stray tap doesn't close the sheet. */
  dismissible?: boolean;
  /** Content is flush with the edges (e.g. lists). */
  flush?: boolean;
}

/**
 * The one overlay pattern for focused tasks.
 * Phones: a bottom sheet you can swipe down. Tablet & desktop: a centred dialog.
 */
export function Sheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = "md",
  dismissible = true,
  flush = false,
}: SheetProps) {
  const isDesktop = useIsDesktopLayout();
  const t = useCopy();

  const handleOpenChange = (next: boolean) => {
    if (!next && !dismissible) return;
    onOpenChange(next);
  };

  const body = (
    <div className={cn("min-h-0 flex-1 overflow-y-auto overscroll-contain", flush ? "pb-2" : "px-5 pb-5 sm:px-6")}>
      {children}
    </div>
  );

  const footerArea = footer && (
    <div className="border-t border-line bg-surface px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6 sm:pb-5">
      {footer}
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog.Root open={open} onOpenChange={handleOpenChange}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-brand-950/40 backdrop-blur-[2px] data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in" />
          <Dialog.Content
            className={cn(
              "fixed top-1/2 left-1/2 z-50 flex max-h-[min(88dvh,760px)] w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-3xl bg-surface shadow-pop outline-none",
              "data-[state=closed]:animate-pop-out data-[state=open]:animate-pop-in",
              size === "xl" ? "max-w-3xl" : size === "lg" ? "max-w-2xl" : "max-w-lg",
            )}
          >
            <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4">
              <div className="flex min-w-0 flex-col gap-1">
                <Dialog.Title className="text-title-3 text-ink">{title}</Dialog.Title>
                {description ? (
                  <Dialog.Description className="text-callout text-ink-3">{description}</Dialog.Description>
                ) : (
                  <Dialog.Description className="sr-only">{title}</Dialog.Description>
                )}
              </div>
              <Dialog.Close asChild>
                <IconButton aria-label={t.common.a11y.closeDialog} size="sm" className="-mt-1 -mr-2">
                  <X />
                </IconButton>
              </Dialog.Close>
            </div>
            {body}
            {footerArea}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    );
  }

  return (
    <Drawer.Root open={open} onOpenChange={handleOpenChange} dismissible={dismissible} repositionInputs={false}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-brand-950/40" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 flex max-h-[92dvh] flex-col rounded-t-[28px] bg-surface shadow-pop outline-none">
          <div aria-hidden className="mx-auto mt-2.5 h-1.5 w-10 shrink-0 rounded-full bg-ink/15" />
          <div className="flex flex-col gap-1 px-5 pt-4 pb-4">
            <Drawer.Title className="text-title-3 text-ink">{title}</Drawer.Title>
            {description ? (
              <Drawer.Description className="text-callout text-ink-3">{description}</Drawer.Description>
            ) : (
              <Drawer.Description className="sr-only">{title}</Drawer.Description>
            )}
          </div>
          {body}
          {footerArea ?? <div className="h-[env(safe-area-inset-bottom)] shrink-0" />}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

"use client";

import { X } from "lucide-react";
import { Dialog } from "radix-ui";
import type { ReactNode } from "react";
import { useCopy } from "@/content";
import { IconButton } from "./icon-button";

interface DocumentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  /** The document. It scrolls inside the modal, so it can be as long as it needs. */
  children: ReactNode;
  /** Sticky action area under the document, for actions on it (send, download). */
  footer?: ReactNode;
}

/**
 * A large modal for reading a document. Phones: full-screen. From `sm` up: centred, with the document
 * scrolling inside. The title and the close button stay put. Esc and the X close it; focus stays inside.
 * Sits above sheets (z-60) so it can be opened from one.
 */
export function DocumentModal({ open, onOpenChange, title, children, footer }: DocumentModalProps) {
  const t = useCopy();
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-60 bg-brand-950/45 backdrop-blur-[2px] data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in" />
        <Dialog.Content className="fixed inset-0 z-60 flex flex-col overflow-hidden bg-canvas outline-none data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in sm:inset-auto sm:top-1/2 sm:left-1/2 sm:max-h-[90dvh] sm:w-[calc(100%-2rem)] sm:max-w-3xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl sm:shadow-pop sm:data-[state=closed]:animate-pop-out sm:data-[state=open]:animate-pop-in">
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-line bg-surface py-2 pr-2 pl-5 sm:pl-6">
            <Dialog.Title className="min-w-0 truncate text-headline text-ink">{title}</Dialog.Title>
            <Dialog.Close asChild>
              <IconButton aria-label={t.common.a11y.closeDialog}>
                <X />
              </IconButton>
            </Dialog.Close>
          </div>
          <Dialog.Description className="sr-only">{title}</Dialog.Description>
          {/* Focusable, so keyboard users can scroll a long document with the arrow keys. */}
          <div
            tabIndex={0}
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-inset sm:p-6"
          >
            {children}
          </div>
          {footer && (
            <div className="shrink-0 border-t border-line bg-surface px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6 sm:pb-4">
              {footer}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

"use client";

import { AlertDialog } from "radix-ui";
import type { ReactNode } from "react";
import { useCopy } from "@/content";
import { Button } from "./button";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: "default" | "danger";
  loading?: boolean;
  onConfirm: () => void;
}

/** Asks before anything destructive or hard to undo. */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel,
  tone = "default",
  loading,
  onConfirm,
}: ConfirmDialogProps) {
  const t = useCopy();
  return (
    <AlertDialog.Root open={open} onOpenChange={(next) => !loading && onOpenChange(next)}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-[60] bg-brand-950/45 backdrop-blur-[2px] data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in" />
        <AlertDialog.Content className="fixed top-1/2 left-1/2 z-[60] w-[calc(100%-2.5rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-surface p-6 shadow-pop outline-none data-[state=closed]:animate-pop-out data-[state=open]:animate-pop-in">
          <AlertDialog.Title className="text-title-3 text-ink">{title}</AlertDialog.Title>
          {description ? (
            <AlertDialog.Description className="mt-2 text-callout leading-6 text-ink-2">
              {description}
            </AlertDialog.Description>
          ) : (
            <AlertDialog.Description className="sr-only">{title}</AlertDialog.Description>
          )}
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <AlertDialog.Cancel asChild>
              <Button variant="secondary" size="lg" className="sm:h-11 sm:text-callout" disabled={loading}>
                {cancelLabel ?? t.common.actions.cancel}
              </Button>
            </AlertDialog.Cancel>
            <Button
              variant={tone === "danger" ? "danger" : "primary"}
              size="lg"
              className="sm:h-11 sm:text-callout"
              loading={loading}
              onClick={onConfirm}
            >
              {confirmLabel}
            </Button>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}

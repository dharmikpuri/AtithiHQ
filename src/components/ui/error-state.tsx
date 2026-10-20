"use client";

import { CloudOff, RotateCcw } from "lucide-react";
import { useCopy } from "@/content";
import { Button } from "./button";
import { EmptyState } from "./empty-state";

/** Standard "couldn't load" state with a retry. */
export function ErrorState({
  onRetry,
  title,
  description,
  className,
}: {
  onRetry?: () => void;
  title?: string;
  description?: string;
  className?: string;
}) {
  const t = useCopy();
  return (
    <EmptyState
      className={className}
      illustration={
        <span className="flex size-14 items-center justify-center rounded-2xl bg-danger-50 text-danger-600">
          <CloudOff className="size-7" aria-hidden />
        </span>
      }
      title={title ?? t.common.states.errorTitle}
      description={description ?? t.common.states.errorBody}
      action={
        onRetry && (
          <Button variant="secondary" leadingIcon={<RotateCcw />} onClick={onRetry}>
            {t.common.actions.retry}
          </Button>
        )
      }
    />
  );
}

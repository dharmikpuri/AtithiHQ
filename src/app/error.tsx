"use client";

import { ErrorState } from "@/components/ui/error-state";

/** Last-resort boundary: something crashed while rendering. */
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-dvh items-center justify-center px-6">
      <ErrorState onRetry={reset} />
    </div>
  );
}

"use client";

import { useEffect } from "react";

/** Warns before a refresh or tab close would throw away unsaved form input. */
export function useUnsavedChangesWarning(hasChanges: boolean) {
  useEffect(() => {
    if (!hasChanges) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasChanges]);
}

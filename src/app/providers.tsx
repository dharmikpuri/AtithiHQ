"use client";

import { QueryClientProvider, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { useEffect, type ReactNode } from "react";
import { onExternalChange } from "@/lib/api";
import { Toaster } from "@/components/ui/toaster";
import { createQueryClient } from "@/lib/query-client";

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  // A fresh client per server render; one shared client in the browser.
  if (typeof window === "undefined") return createQueryClient();
  browserQueryClient ??= createQueryClient();
  return browserQueryClient;
}

/** Demo build: data another tab saved makes everything on screen refetch. */
function RefreshOnExternalChange() {
  const queryClient = useQueryClient();
  useEffect(() => onExternalChange(() => void queryClient.invalidateQueries()), [queryClient]);
  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={getQueryClient()}>
      <RefreshOnExternalChange />
      {children}
      <Toaster />
    </QueryClientProvider>
  );
}

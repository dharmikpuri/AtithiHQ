import { QueryClient } from "@tanstack/react-query";
import { isApiError } from "@/lib/api";

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        // Don't retry answers the server gave on purpose (not found, unauthorised…).
        retry: (failureCount, error) => !isApiError(error) && failureCount < 2,
      },
      mutations: { retry: false },
    },
  });
}

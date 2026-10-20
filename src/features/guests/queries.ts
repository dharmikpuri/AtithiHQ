"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, queryKeys, type GuestDetailsInput } from "@/lib/api";

export function useGuests() {
  return useQuery({ queryKey: queryKeys.guests.list(), queryFn: () => api.guests.list() });
}

export function useGuestProfile(guestId: string) {
  return useQuery({ queryKey: queryKeys.guests.detail(guestId), queryFn: () => api.guests.get(guestId) });
}

export function useUpdateGuestProfile(guestId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Pick<GuestDetailsInput, "name" | "phone" | "nationality">) => api.guests.update(guestId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.guests.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
    },
  });
}

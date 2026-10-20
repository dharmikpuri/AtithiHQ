"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, queryKeys, type GuestSubmissionInput } from "@/lib/api";

export function useGuestLink(token: string) {
  return useQuery({
    queryKey: queryKeys.guestLink(token),
    queryFn: () => api.guestLink.open(token),
    // Opening the link is recorded once; don't refetch behind the guest's back.
    staleTime: Infinity,
  });
}

export function useSubmitGuestDetails(token: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: GuestSubmissionInput) => api.guestLink.submit(token, input),
    onSuccess: (view) => {
      queryClient.setQueryData(queryKeys.guestLink(token), view);
      // If the owner is previewing in the same browser, their screens update too.
      void queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.guests.all });
    },
  });
}

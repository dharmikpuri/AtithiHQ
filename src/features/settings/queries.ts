"use client";

import { useMutation, useQueryClient, type QueryClient } from "@tanstack/react-query";
import type { Session } from "@/domain/read-models";
import { api, queryKeys, type OwnerProfileUpdateInput, type PropertyUpdateInput } from "@/lib/api";

/** Prefix shared by every cached guest-link view (`["guest-link", token]`). */

/** The guest form shows the host's name and property details, so open previews must refresh. */
function refreshGuestLinks(queryClient: QueryClient) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.guestLinks });
}

export function useUpdateOwner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: OwnerProfileUpdateInput) => api.account.updateOwner(input),
    onSuccess: (owner) => {
      queryClient.setQueryData<Session | null>(queryKeys.session, (session) => session && { ...session, owner });
      refreshGuestLinks(queryClient);
    },
  });
}

export function useUpdateProperty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PropertyUpdateInput) => api.account.updateProperty(input),
    onSuccess: (property, input) => {
      queryClient.setQueryData<Session | null>(queryKeys.session, (session) => session && { ...session, property });
      refreshGuestLinks(queryClient);
      // The retention period moves every document's deletion date.
      if (input.documentRetentionDays !== undefined) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
        void queryClient.invalidateQueries({ queryKey: queryKeys.guests.all });
      }
    },
  });
}

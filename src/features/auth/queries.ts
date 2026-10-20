"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, queryKeys, type RegistrationInput } from "@/lib/api";
import type { PhoneE164 } from "@/domain/types";

export function useSession() {
  return useQuery({
    queryKey: queryKeys.session,
    queryFn: () => api.auth.getSession(),
    staleTime: Infinity,
  });
}

/** The signed-in owner's session. Only use inside the owner shell, where it is guaranteed. */
export function useCurrentSession() {
  const { data } = useSession();
  if (!data?.property) throw new Error("useCurrentSession used outside a completed session");
  return { owner: data.owner, property: data.property };
}

export function useRequestCode() {
  return useMutation({ mutationFn: (phone: PhoneE164) => api.auth.requestCode(phone) });
}

export function useVerifyCode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ phone, code }: { phone: PhoneE164; code: string }) => api.auth.verifyCode(phone, code),
    onSuccess: (session) => {
      // A new owner must never see the previous owner's cached data.
      queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== queryKeys.session[0] });
      queryClient.setQueryData(queryKeys.session, session);
    },
  });
}

export function useCompleteRegistration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: RegistrationInput) => api.account.completeRegistration(input),
    onSuccess: (session) => queryClient.setQueryData(queryKeys.session, session),
  });
}

/**
 * Where the owner goes after signing out. The log-out dialog picks it (sign-in, or registration after
 * deleting a test account); the guards that react to the signed-out session follow it, so they don't
 * race the dialog to a different page. Read once, then forgotten.
 */
let signOutDestination: string | null = null;

export function takeSignOutDestination(): string | null {
  const destination = signOutDestination;
  signOutDestination = null;
  return destination;
}

/** `erase`: also delete the signed-in number's data (demo build only). `redirectTo`: where to go next. */
export type LogoutVariables = { erase?: boolean; redirectTo?: string };

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ erase }: LogoutVariables) => api.auth.logout({ erase }),
    onSuccess: (_, { redirectTo }) => {
      signOutDestination = redirectTo ?? null;
      // Null the session first so mounted screens see "signed out" rather than a
      // missing cache entry, then drop everything else the owner had loaded.
      queryClient.setQueryData(queryKeys.session, null);
      queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== queryKeys.session[0] });
    },
  });
}

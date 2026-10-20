"use client";

import { useIsFetching, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, queryKeys, type IssueInvoiceInput } from "@/lib/api";

export function useInvoices() {
  return useQuery({ queryKey: queryKeys.invoices.list(), queryFn: () => api.invoices.list() });
}

/**
 * Issuing can also change the booking's total, so the bookings are refreshed along with the documents.
 * Both refreshes are awaited: the issue stays pending until the screen has the new numbers.
 */
export function useIssueInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: IssueInvoiceInput) => api.invoices.issue(input),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all }),
      ]),
  });
}

/**
 * Whether the documents or the bookings are being refreshed. While one has caught up and the other
 * hasn't, a document compared with its booking can look out of date when it isn't.
 */
export function useInvoicesRefreshing() {
  return useIsFetching({ queryKey: queryKeys.invoices.all }) + useIsFetching({ queryKey: queryKeys.bookings.all }) > 0;
}

/** Makes a fresh public link for a document; the list is refreshed so "Shared on WhatsApp" shows up. */
export function useShareInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (invoiceId: string) => api.invoices.share(invoiceId),
    // Not awaited: the sender opens WhatsApp as soon as the link exists.
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all }),
  });
}

/** The public receipt page's data. No login: the link is the credential. */
export function useReceiptLink(token: string) {
  return useQuery({
    queryKey: queryKeys.receiptLink(token),
    queryFn: () => api.receipts.view(token),
    // The link's own expiry decides, not the cache.
    staleTime: Infinity,
  });
}

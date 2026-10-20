"use client";

import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import type { BookingRecord } from "@/domain/read-models";
import {
  api,
  queryKeys,
  type BookingInput,
  type CreateBookingInput,
  type GuestDetailsInput,
  type PaymentInput,
} from "@/lib/api";

export function useBookings() {
  return useQuery({ queryKey: queryKeys.bookings.list(), queryFn: () => api.bookings.list() });
}

export function useBooking(bookingId: string) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: queryKeys.bookings.detail(bookingId),
    queryFn: () => api.bookings.get(bookingId),
    // Show the row from the list instantly while the full record loads.
    placeholderData: () =>
      queryClient.getQueryData<BookingRecord[]>(queryKeys.bookings.list())?.find((booking) => booking.id === bookingId),
  });
}

/** After any booking change: refresh the detail now, everything derived later. */
function syncBooking(queryClient: QueryClient, booking: BookingRecord) {
  queryClient.setQueryData(queryKeys.bookings.detail(booking.id), booking);
  queryClient.setQueryData<BookingRecord[]>(queryKeys.bookings.list(), (list) =>
    list
      ? list.some((item) => item.id === booking.id)
        ? list.map((item) => (item.id === booking.id ? booking : item))
        : [...list, booking]
      : list,
  );
  void queryClient.invalidateQueries({ queryKey: queryKeys.bookings.list() });
  void queryClient.invalidateQueries({ queryKey: queryKeys.guests.all });
}

function useBookingMutation<TVariables>(mutationFn: (variables: TVariables) => Promise<BookingRecord>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (booking) => syncBooking(queryClient, booking),
  });
}

export const useCreateBooking = () => useBookingMutation((input: CreateBookingInput) => api.bookings.create(input));

export const useUpdateBooking = (bookingId: string) =>
  useBookingMutation((input: BookingInput) => api.bookings.update(bookingId, input));

export const useCancelBooking = (bookingId: string) => useBookingMutation(() => api.bookings.cancel(bookingId));

export const useRestoreBooking = (bookingId: string) => useBookingMutation(() => api.bookings.restore(bookingId));

export const useMarkLinkShared = (bookingId: string) =>
  useBookingMutation(() => api.bookings.markLinkShared(bookingId));

export const useAddGuest = (bookingId: string) =>
  useBookingMutation((input: GuestDetailsInput) => api.bookings.addGuest(bookingId, input));

export const useUpdateGuest = (bookingId: string) =>
  useBookingMutation(({ guestId, input }: { guestId: string; input: GuestDetailsInput }) =>
    api.bookings.updateGuest(bookingId, guestId, input),
  );

export const useRemoveGuest = (bookingId: string) =>
  useBookingMutation((guestId: string) => api.bookings.removeGuest(bookingId, guestId));

export const useRecordPayment = (bookingId: string) =>
  useBookingMutation((input: PaymentInput) => api.payments.record(bookingId, input));

export const useUpdatePayment = (bookingId: string) =>
  useBookingMutation(({ paymentId, input }: { paymentId: string; input: PaymentInput }) =>
    api.payments.update(bookingId, paymentId, input),
  );

export const useRemovePayment = (bookingId: string) =>
  useBookingMutation((paymentId: string) => api.payments.remove(bookingId, paymentId));

export function useDocumentView() {
  return useMutation({ mutationFn: (documentId: string) => api.documents.requestView(documentId) });
}

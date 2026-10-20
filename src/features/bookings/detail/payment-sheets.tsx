"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { ChoiceChips } from "@/components/ui/choice-chips";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { MoneyInput } from "@/components/ui/money-input";
import { Sheet } from "@/components/ui/sheet";
import { getCopy, useCopy } from "@/content";
import { dueAmount, leadNameOf } from "@/domain/booking-rules";
import { MAX_AMOUNT, PAYMENT_METHODS, PAYMENT_NOTE_MAX, PLATFORM_SOURCES } from "@/domain/constants";
import type { BookingRecord } from "@/domain/read-models";
import type { Payment, PaymentMethod } from "@/domain/types";
import { todayISO } from "@/lib/dates";
import { formatINR } from "@/lib/money";
import { bookingToInput } from "../booking-form/booking-form-schema";
import { useRecordPayment, useRemovePayment, useUpdateBooking, useUpdatePayment } from "../queries";

const copy = getCopy();
const p = copy.bookings.paymentSheet;

const paymentSchema = z.object({
  amount: z
    .number({ invalid_type_error: copy.common.validation.amountPositive })
    .int()
    .min(1, copy.common.validation.amountPositive)
    .max(MAX_AMOUNT, copy.common.validation.amountTooLarge)
    .nullable()
    .refine((value) => value !== null, copy.common.validation.amountPositive),
  method: z.enum(PAYMENT_METHODS as [PaymentMethod, ...PaymentMethod[]]),
  receivedOn: z.string().refine((value) => value <= todayISO(), p.dateFuture),
  note: z.string().max(PAYMENT_NOTE_MAX),
});
type PaymentFormInput = z.input<typeof paymentSchema>;
type PaymentValues = z.output<typeof paymentSchema>;

const PAYMENT_FORM_ID = "payment-form";

/** Record a new payment, or edit / delete an existing one. Mount with a fresh `key` per open. */
export function PaymentSheet({
  booking,
  payment,
  open,
  onOpenChange,
  showGuest = false,
}: {
  booking: BookingRecord;
  payment: Payment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Name the guest in the subtitle — for when the sheet opens away from the booking page. */
  showGuest?: boolean;
}) {
  const t = useCopy();
  const due = dueAmount(booking);
  const record = useRecordPayment(booking.id);
  const update = useUpdatePayment(booking.id);
  const remove = useRemovePayment(booking.id);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const saving = record.isPending || update.isPending;

  const form = useForm<PaymentFormInput, unknown, PaymentValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: payment
      ? { amount: payment.amount, method: payment.method, receivedOn: payment.receivedOn, note: payment.note ?? "" }
      : {
          amount: null,
          method: PLATFORM_SOURCES.has(booking.source) ? "platform" : "upi",
          receivedOn: todayISO(),
          note: "",
        },
  });
  const { errors } = form.formState;

  const submit = form.handleSubmit((values) => {
    const input = {
      amount: values.amount,
      method: values.method,
      receivedOn: values.receivedOn,
      note: values.note.trim() || null,
    };
    const options = {
      onSuccess: () => {
        toast.success(payment ? p.updated : p.recorded);
        onOpenChange(false);
      },
      onError: () => toast.error(t.common.states.errorBody),
    };
    if (payment) update.mutate({ paymentId: payment.id, input }, options);
    else record.mutate(input, options);
  });

  return (
    <>
      <Sheet
        open={open}
        onOpenChange={onOpenChange}
        dismissible={!saving}
        title={payment ? p.editTitle : p.recordTitle}
        description={
          !payment && due !== null && due > 0
            ? showGuest
              ? p.dueHintWithGuest(leadNameOf(booking), formatINR(due))
              : p.dueHint(formatINR(due))
            : undefined
        }
        footer={
          <div className="flex flex-col gap-2">
            <Button type="submit" form={PAYMENT_FORM_ID} size="xl" fullWidth loading={saving}>
              {p.save}
            </Button>
            {payment && (
              <Button
                variant="ghost"
                size="lg"
                className="text-danger-600 hover:bg-danger-50"
                leadingIcon={<Trash2 />}
                onClick={() => setConfirmDelete(true)}
              >
                {p.remove}
              </Button>
            )}
          </div>
        }
      >
        <form id={PAYMENT_FORM_ID} onSubmit={submit} noValidate className="flex flex-col gap-5">
          <Field
            label={p.amount}
            error={errors.amount?.message}
            labelAction={
              !payment && due !== null && due > 0 ? (
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => form.setValue("amount", due, { shouldDirty: true, shouldValidate: true })}
                >
                  {p.fillDue}
                </Button>
              ) : undefined
            }
          >
            <Controller
              control={form.control}
              name="amount"
              render={({ field }) => (
                <MoneyInput value={field.value} onChange={field.onChange} onBlur={field.onBlur} autoFocus={!payment} />
              )}
            />
          </Field>
          <Field label={p.method}>
            <Controller
              control={form.control}
              name="method"
              render={({ field }) => (
                <ChoiceChips
                  value={field.value}
                  onChange={field.onChange}
                  options={PAYMENT_METHODS.map((method) => ({ value: method, label: t.common.paymentMethods[method] }))}
                />
              )}
            />
          </Field>
          <Field label={p.date} error={errors.receivedOn?.message}>
            <Input type="date" max={todayISO()} shellClassName="max-w-64" {...form.register("receivedOn")} />
          </Field>
          <Field label={p.note} optional error={errors.note?.message}>
            <Input placeholder={p.notePlaceholder} maxLength={PAYMENT_NOTE_MAX} {...form.register("note")} />
          </Field>
        </form>
      </Sheet>

      {payment && (
        <ConfirmDialog
          open={confirmDelete}
          onOpenChange={setConfirmDelete}
          title={p.removeConfirm.title}
          description={p.removeConfirm.body}
          confirmLabel={p.removeConfirm.confirm}
          tone="danger"
          loading={remove.isPending}
          onConfirm={() =>
            remove.mutate(payment.id, {
              onSuccess: () => {
                setConfirmDelete(false);
                toast.success(p.removed);
                onOpenChange(false);
              },
              onError: () => toast.error(t.common.states.errorBody),
            })
          }
        />
      )}
    </>
  );
}

const TOTAL_FORM_ID = "total-form";

/** Set or change the agreed total for the stay. */
export function TotalAmountSheet({
  booking,
  open,
  onOpenChange,
}: {
  booking: BookingRecord;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useCopy();
  const update = useUpdateBooking(booking.id);
  const [total, setTotal] = useState<number | null>(booking.totalAmount);
  const [error, setError] = useState<string>();

  function save(event: React.FormEvent) {
    event.preventDefault();
    if (total !== null && total > MAX_AMOUNT) {
      setError(t.common.validation.amountTooLarge);
      return;
    }
    update.mutate(
      { ...bookingToInput(booking), totalAmount: total },
      {
        onSuccess: () => {
          toast.success(p.totalSaved);
          onOpenChange(false);
        },
        onError: () => toast.error(t.common.states.errorBody),
      },
    );
  }

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      dismissible={!update.isPending}
      title={p.totalTitle}
      description={p.totalDescription}
      footer={
        <Button type="submit" form={TOTAL_FORM_ID} size="xl" fullWidth loading={update.isPending}>
          {t.common.actions.save}
        </Button>
      }
    >
      <form id={TOTAL_FORM_ID} onSubmit={save} noValidate>
        <Field label={t.bookings.payments.total} error={error}>
          <MoneyInput
            value={total}
            onChange={(value) => {
              setTotal(value);
              setError(undefined);
            }}
            autoFocus
          />
        </Field>
      </form>
    </Sheet>
  );
}

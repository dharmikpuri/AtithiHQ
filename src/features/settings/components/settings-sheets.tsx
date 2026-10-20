"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, MapPin, ShieldCheck } from "lucide-react";
import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Notice } from "@/components/ui/notice";
import { PhoneInput } from "@/components/ui/phone-input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { RadioCards } from "@/components/ui/radio-cards";
import { Sheet } from "@/components/ui/sheet";
import { useCopy } from "@/content";
import { ID_REQUIREMENTS, RETENTION_OPTIONS } from "@/domain/constants";
import { isGstRate, normaliseGstin, type GstRate, type PropertyGst } from "@/domain/gst";
import { INDIAN_STATES, isIndianStateCode } from "@/domain/indian-states";
import { inventoryInUse, toInventoryBooking } from "@/domain/availability";
import {
  DEFAULT_ROOM_COUNT,
  inventoryOf,
  normaliseInventory,
  usesRoomInventory,
  type BookingMode,
} from "@/domain/inventory";
import type { PropertyType } from "@/domain/property-types";
import { isDifferentPhone, isValidPincode } from "@/domain/registration";
import type { IdRequirement, PhoneE164 } from "@/domain/types";
import { gstSchema, inventorySchema } from "@/features/onboarding/setup-schema";
import { BookingModeFields } from "@/features/property/booking-mode-fields";
import { GstFields } from "@/features/property/gst-fields";
import { PropertyTypePicker } from "@/features/property/property-type-picker";
import { useBookings } from "@/features/bookings/queries";
import { isApiError } from "@/lib/api";
import { todayISO } from "@/lib/dates";
import { nameField, requiredPhoneField } from "@/lib/validation";
import { useCurrentSession } from "@/features/auth/queries";
import { formatTimeOfDay } from "@/lib/dates";
import { useUpdateOwner, useUpdateProperty } from "../queries";
import { textSettingSchemas, timeOptions, type TextSettingKind, type TimeSettingKind } from "../settings-fields";

/* Every editor here is mounted with a fresh `key` each time it opens. */

interface EditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** One setting, one sheet: a focused editor with Save pinned to the bottom. */
function SettingSheet({
  open,
  onOpenChange,
  title,
  description,
  saving,
  onSubmit,
  children,
}: EditorProps & {
  title: ReactNode;
  description?: ReactNode;
  saving: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
}) {
  const t = useCopy();
  const formId = useId();
  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      dismissible={!saving}
      title={title}
      description={description}
      footer={
        <Button type="submit" form={formId} size="xl" fullWidth loading={saving}>
          {t.common.actions.save}
        </Button>
      }
    >
      <form id={formId} onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        {children}
      </form>
    </Sheet>
  );
}

/** What every editor does once the change is saved: confirm, then close. */
function useSaveCallbacks(onOpenChange: (open: boolean) => void, savedMessage: string) {
  const t = useCopy();
  return {
    onSuccess: () => {
      toast.success(savedMessage);
      onOpenChange(false);
    },
    onError: () => toast.error(t.common.states.errorBody),
  };
}

/** Owner's name or email; property name or area. */
export function TextSettingSheet({ kind, open, onOpenChange }: EditorProps & { kind: TextSettingKind }) {
  const copy = useCopy().settings[kind];
  const { owner, property } = useCurrentSession();
  const updateOwner = useUpdateOwner();
  const updateProperty = useUpdateProperty();
  const callbacks = useSaveCallbacks(onOpenChange, copy.saved);
  const current = {
    ownerName: owner.name,
    email: owner.email ?? "",
    propertyName: property.name,
    location: property.location,
  }[kind];

  const form = useForm<{ value: string }>({
    resolver: zodResolver(z.object({ value: textSettingSchemas[kind] })),
    defaultValues: { value: current },
  });

  const submit = form.handleSubmit(({ value }) => {
    if (value === current) return onOpenChange(false);
    if (kind === "ownerName") updateOwner.mutate({ name: value }, callbacks);
    else if (kind === "email") updateOwner.mutate({ email: value }, callbacks);
    else updateProperty.mutate(kind === "propertyName" ? { name: value } : { location: value }, callbacks);
  });

  return (
    <SettingSheet
      open={open}
      onOpenChange={onOpenChange}
      title={copy.label}
      saving={updateOwner.isPending || updateProperty.isPending}
      onSubmit={submit}
    >
      <Field label={copy.label} hideLabel hint={copy.hint} error={form.formState.errors.value?.message}>
        {kind === "email" ? (
          <Input
            autoFocus
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            placeholder={copy.placeholder}
            leading={<Mail className="size-4.5" aria-hidden />}
            {...form.register("value")}
          />
        ) : (
          <Input
            autoFocus
            autoCapitalize="words"
            autoComplete={kind === "ownerName" ? "name" : kind === "propertyName" ? "organization" : "address-level3"}
            placeholder={copy.placeholder}
            leading={kind === "location" ? <MapPin className="size-5" aria-hidden /> : undefined}
            {...form.register("value")}
          />
        )}
      </Field>
    </SettingSheet>
  );
}

/** Check-in or check-out time, in half-hour steps. */
export function TimeSettingSheet({ kind, open, onOpenChange }: EditorProps & { kind: TimeSettingKind }) {
  const copy = useCopy().settings[kind];
  const { property } = useCurrentSession();
  const current = property[kind];
  const [value, setValue] = useState(current);
  const update = useUpdateProperty();
  const callbacks = useSaveCallbacks(onOpenChange, copy.saved);

  return (
    <SettingSheet
      open={open}
      onOpenChange={onOpenChange}
      title={copy.label}
      description={copy.description}
      saving={update.isPending}
      onSubmit={(event) => {
        event.preventDefault();
        if (value === current) onOpenChange(false);
        else update.mutate({ [kind]: value }, callbacks);
      }}
    >
      <Field label={copy.label} hideLabel>
        <NativeSelect value={value} onChange={(event) => setValue(event.target.value)}>
          {timeOptions(current).map((option) => (
            <option key={option} value={option}>
              {formatTimeOfDay(option)}
            </option>
          ))}
        </NativeSelect>
      </Field>
    </SettingSheet>
  );
}

/** Whether guests are asked for a photo ID. */
export function IdRequirementSheet({ open, onOpenChange }: EditorProps) {
  const t = useCopy();
  const copy = t.settings.idRequirement;
  const { property } = useCurrentSession();
  const [value, setValue] = useState<IdRequirement>(property.idRequirement);
  const update = useUpdateProperty();
  const callbacks = useSaveCallbacks(onOpenChange, copy.saved);

  return (
    <SettingSheet
      open={open}
      onOpenChange={onOpenChange}
      title={copy.label}
      description={copy.description}
      saving={update.isPending}
      onSubmit={(event) => {
        event.preventDefault();
        if (value === property.idRequirement) onOpenChange(false);
        else update.mutate({ idRequirement: value }, callbacks);
      }}
    >
      <RadioCards
        aria-label={copy.label}
        value={value}
        onChange={setValue}
        options={ID_REQUIREMENTS.map((rule) => ({
          value: rule,
          label: t.common.idRequirements[rule],
          description: copy.options[rule],
        }))}
      />
      <Notice tone="info" icon={ShieldCheck} title={copy.neverBlocks}>
        {copy.manual}
      </Notice>
    </SettingSheet>
  );
}

/** How long ID photos are kept after check-out. */
/**
 * How long ID photos are kept. Changing it asks for confirmation first: a shorter period
 * deletes photos sooner, and that can't be undone.
 */
export function RetentionSheet({ open, onOpenChange }: EditorProps) {
  const t = useCopy().settings;
  const copy = t.retention;
  const confirm = t.retentionConfirm;
  const [confirming, setConfirming] = useState(false);
  const { property } = useCurrentSession();
  const current = property.documentRetentionDays;
  const [value, setValue] = useState(current);
  const update = useUpdateProperty();
  const callbacks = useSaveCallbacks(onOpenChange, copy.saved);
  const options = RETENTION_OPTIONS.includes(current)
    ? RETENTION_OPTIONS
    : [...RETENTION_OPTIONS, current].sort((a, b) => a - b);

  return (
    <SettingSheet
      open={open}
      onOpenChange={onOpenChange}
      title={copy.label}
      description={copy.description}
      saving={update.isPending}
      onSubmit={(event) => {
        event.preventDefault();
        if (value === current) onOpenChange(false);
        else setConfirming(true);
      }}
    >
      <RadioCards
        aria-label={copy.label}
        value={String(value)}
        onChange={(next) => setValue(Number(next))}
        options={options.map((days) => ({ value: String(days), label: copy.option(days) }))}
      />
      <Notice tone="success" icon={ShieldCheck} title={copy.reassurance}>
        {copy.appliesToExisting}
      </Notice>
      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        tone={value < current ? "danger" : "default"}
        title={value < current ? confirm.shorterTitle : confirm.longerTitle}
        description={(value < current ? confirm.shorterBody : confirm.longerBody)(copy.option(value))}
        confirmLabel={confirm.confirm}
        cancelLabel={confirm.cancel}
        loading={update.isPending}
        onConfirm={() =>
          update.mutate(
            { documentRetentionDays: value },
            {
              ...callbacks,
              onSuccess: () => {
                setConfirming(false);
                callbacks.onSuccess();
              },
            },
          )
        }
      />
    </SettingSheet>
  );
}

/** The owner's second number. Must differ from the verified sign-in number. */
export function AlternatePhoneSheet({ open, onOpenChange }: EditorProps) {
  const t = useCopy();
  const copy = t.settings.alternatePhone;
  const { owner } = useCurrentSession();
  const update = useUpdateOwner();
  const callbacks = useSaveCallbacks(onOpenChange, copy.saved);
  const schema = z.object({
    value: requiredPhoneField.refine(
      (value) => isDifferentPhone(value as PhoneE164, owner.phone),
      t.common.validation.alternatePhoneSame,
    ),
  });
  const form = useForm<{ value: string }>({
    resolver: zodResolver(schema),
    defaultValues: { value: owner.alternatePhone ?? "" },
  });
  const phone = useWatch({ control: form.control, name: "value" });

  const submit = form.handleSubmit(({ value }) => {
    if (value === owner.alternatePhone) return onOpenChange(false);
    update.mutate({ alternatePhone: value as PhoneE164 }, callbacks);
  });

  return (
    <SettingSheet
      open={open}
      onOpenChange={onOpenChange}
      title={copy.label}
      saving={update.isPending}
      onSubmit={submit}
    >
      <Field label={copy.label} hideLabel hint={copy.hint} error={form.formState.errors.value?.message}>
        <PhoneInput
          autoFocus
          value={phone}
          onChange={(value) => form.setValue("value", value, { shouldValidate: form.formState.isSubmitted })}
        />
      </Field>
    </SettingSheet>
  );
}

/** Homestay, villa…: picks the property's illustration everywhere. */
export function PropertyTypeSheet({ open, onOpenChange }: EditorProps) {
  const copy = useCopy().settings.propertyType;
  const { property } = useCurrentSession();
  const [value, setValue] = useState<PropertyType>(property.type);
  const update = useUpdateProperty();
  const callbacks = useSaveCallbacks(onOpenChange, copy.saved);

  return (
    <SettingSheet
      open={open}
      onOpenChange={onOpenChange}
      title={copy.label}
      description={copy.description}
      saving={update.isPending}
      onSubmit={(event) => {
        event.preventDefault();
        if (value === property.type) onOpenChange(false);
        else update.mutate({ type: value }, callbacks);
      }}
    >
      <Field label={copy.label} hideLabel>
        <PropertyTypePicker value={value} onChange={setValue} />
      </Field>
    </SettingSheet>
  );
}

const addressSchema = z.object({
  city: nameField,
  state: z.string().refine(isIndianStateCode, "state"),
  pincode: z.string().trim().refine(isValidPincode, "pincode"),
});

/** City, state and PIN code of the property (the area is edited on its own row). */
export function AddressSheet({ open, onOpenChange }: EditorProps) {
  const t = useCopy();
  const copy = t.settings.address;
  const labels = t.auth.setup;
  const v = t.common.validation;
  const { property } = useCurrentSession();
  const update = useUpdateProperty();
  const callbacks = useSaveCallbacks(onOpenChange, copy.saved);
  const form = useForm<z.infer<typeof addressSchema>>({
    resolver: zodResolver(addressSchema),
    defaultValues: { city: property.city, state: property.state, pincode: property.pincode },
  });
  const { errors } = form.formState;

  const submit = form.handleSubmit((values) => {
    const unchanged =
      values.city.trim() === property.city && values.state === property.state && values.pincode === property.pincode;
    if (unchanged) return onOpenChange(false);
    update.mutate({ city: values.city.trim(), state: values.state, pincode: values.pincode }, callbacks);
  });

  return (
    <SettingSheet
      open={open}
      onOpenChange={onOpenChange}
      title={copy.label}
      description={copy.description}
      saving={update.isPending}
      onSubmit={submit}
    >
      <Field label={labels.city} error={errors.city?.message}>
        <Input autoComplete="address-level2" autoCapitalize="words" {...form.register("city")} />
      </Field>
      <Field label={labels.state} error={errors.state ? v.stateRequired : undefined}>
        <NativeSelect autoComplete="address-level1" {...form.register("state")}>
          <option value="" disabled>
            {labels.statePlaceholder}
          </option>
          {INDIAN_STATES.map((state) => (
            <option key={state.code} value={state.code}>
              {state.name}
            </option>
          ))}
        </NativeSelect>
      </Field>
      <Field label={labels.pincode} error={errors.pincode ? v.pincodeInvalid : undefined}>
        <Input
          inputMode="numeric"
          autoComplete="postal-code"
          maxLength={6}
          className="tabular"
          {...form.register("pincode", {
            onChange: (event) => {
              event.target.value = event.target.value.replace(/\D/g, "").slice(0, 6);
            },
          })}
        />
      </Field>
    </SettingSheet>
  );
}

/** Entire property, room by room, or both, and the number of bookable rooms (a quantity). */
export function BookingModeSheet({ open, onOpenChange }: EditorProps) {
  const copy = useCopy().settings.bookingMode;
  const { property } = useCurrentSession();
  const current = inventoryOf(property);
  const [mode, setMode] = useState<BookingMode>(current.mode);
  const [roomCount, setRoomCount] = useState(current.totalRooms ?? DEFAULT_ROOM_COUNT);
  const [error, setError] = useState<string>();
  const update = useUpdateProperty();
  const callbacks = useSaveCallbacks(onOpenChange, copy.saved);
  const { data: bookings = [] } = useBookings();
  // The inventory can't shrink below what upcoming bookings already use.
  const inUse = inventoryInUse(bookings.map(toInventoryBooking), todayISO());
  // On a phone the reason can sit below the fold, behind the Save button: bring it into view.
  const fieldsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (error)
      fieldsRef.current?.querySelector('[role="alert"]')?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [error]);

  return (
    <SettingSheet
      open={open}
      onOpenChange={onOpenChange}
      title={copy.label}
      description={copy.description}
      saving={update.isPending}
      onSubmit={(event) => {
        event.preventDefault();
        const parsed = inventorySchema.safeParse({ bookingMode: mode, roomCount });
        if (!parsed.success) return setError(parsed.error.issues[0]?.message);
        const next = normaliseInventory(mode, roomCount);
        if (next.mode === current.mode && next.totalRooms === current.totalRooms) return onOpenChange(false);
        if (!usesRoomInventory(next.mode) && inUse.hasRoomBookings) return setError(copy.roomBookingsExist);
        if (usesRoomInventory(next.mode) && (next.totalRooms ?? 0) < inUse.minRooms) {
          return setError(copy.roomsInUse(inUse.minRooms));
        }
        update.mutate(
          { bookingMode: next.mode, roomCount: next.totalRooms },
          {
            ...callbacks,
            onError: (saveError) =>
              isApiError(saveError, "unavailable") ? setError(copy.roomsInUse(inUse.minRooms)) : callbacks.onError(),
          },
        );
      }}
    >
      <div ref={fieldsRef} className="contents">
        <BookingModeFields
          mode={mode}
          roomCount={roomCount}
          onModeChange={(next) => {
            setMode(next);
            setError(undefined);
          }}
          onRoomCountChange={(next) => {
            setRoomCount(next);
            setError(undefined);
          }}
          roomCountError={usesRoomInventory(mode) ? error : undefined}
        />
        {/* With no room count on screen, the reason goes here instead. */}
        {error && !usesRoomInventory(mode) && (
          <Notice tone="danger" role="alert">
            {error}
          </Notice>
        )}
      </div>
    </SettingSheet>
  );
}

/** GST registration, GSTIN and rate: printed on tax invoices. Optional, so "not registered" is a valid save. */
export function GstSheet({ open, onOpenChange }: EditorProps) {
  const copy = useCopy().settings.gst;
  const { property } = useCurrentSession();
  const current = property.gst;
  const [registered, setRegistered] = useState(current !== null);
  const [gstin, setGstin] = useState(current?.gstin ?? "");
  const [rate, setRate] = useState<GstRate | null>(current?.rate ?? null);
  const [errors, setErrors] = useState<{ gstin?: string; rate?: string }>({});
  const update = useUpdateProperty();
  const callbacks = useSaveCallbacks(onOpenChange, copy.saved);
  // On a phone the reason can sit below the fold, behind the Save button: bring it into view.
  const fieldsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (errors.gstin || errors.rate)
      fieldsRef.current?.querySelector('[role="alert"]')?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [errors]);

  return (
    <SettingSheet
      open={open}
      onOpenChange={onOpenChange}
      title={copy.label}
      description={copy.description}
      saving={update.isPending}
      onSubmit={(event) => {
        event.preventDefault();
        const parsed = gstSchema.safeParse({ registered, gstin, rate });
        if (!parsed.success) {
          const messageAt = (path: string) => parsed.error.issues.find((issue) => issue.path[0] === path)?.message;
          return setErrors({ gstin: messageAt("gstin"), rate: messageAt("rate") });
        }
        const next: PropertyGst | null = registered && isGstRate(rate) ? { gstin: normaliseGstin(gstin), rate } : null;
        if (next?.gstin === current?.gstin && next?.rate === current?.rate) return onOpenChange(false);
        update.mutate({ gst: next }, callbacks);
      }}
    >
      <div ref={fieldsRef} className="contents">
        <GstFields
          registered={registered}
          gstin={gstin}
          rate={rate}
          onRegisteredChange={(next) => {
            setRegistered(next);
            setErrors({});
          }}
          onGstinChange={(next) => {
            setGstin(next);
            setErrors((previous) => ({ ...previous, gstin: undefined }));
          }}
          onRateChange={(next) => {
            setRate(next);
            setErrors((previous) => ({ ...previous, rate: undefined }));
          }}
          gstinError={errors.gstin}
          rateError={errors.rate}
        />
      </div>
    </SettingSheet>
  );
}

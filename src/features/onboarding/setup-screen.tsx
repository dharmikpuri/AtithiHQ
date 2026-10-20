"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { BadgeCheck, Lock, Mail, MapPin } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { Logo } from "@/components/brand/logo";
import { PropertyIllustration } from "@/components/brand/property-illustration";
import { Splash } from "@/components/layout/splash";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { surfaceStyles } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Notice } from "@/components/ui/notice";
import { PhoneInput } from "@/components/ui/phone-input";
import { OWNER_HOME, routes } from "@/config/routes";
import { useCopy } from "@/content";
import { isGstRate, normaliseGstin, type GstRate } from "@/domain/gst";
import { INDIAN_STATES } from "@/domain/indian-states";
import { DEFAULT_ROOM_COUNT, isBookingMode, normaliseInventory } from "@/domain/inventory";
import { isPropertyType, type PropertyType } from "@/domain/property-types";
import type { Session } from "@/domain/read-models";
import { registrationStatus, TERMS_VERSION } from "@/domain/registration";
import { LogoutDialog } from "@/features/auth/logout-dialog";
import { RegistrationSteps } from "@/features/auth/registration-steps";
import { BookingModeFields } from "@/features/property/booking-mode-fields";
import { GstFields } from "@/features/property/gst-fields";
import { PropertyTypePicker } from "@/features/property/property-type-picker";
import { takeSignOutDestination, useCompleteRegistration, useSession } from "@/features/auth/queries";
import { isApiError } from "@/lib/api";
import { cn } from "@/lib/cn";
import { formatPhone } from "@/lib/phone";
import { EMPTY_REGISTRATION, registrationSchema, type RegistrationValues } from "./setup-schema";

/**
 * Step 3 of registration, after the mobile number is verified. Also where an owner lands if an
 * earlier registration was left incomplete (details or consent missing): what they gave before
 * is filled in. Nobody reaches the dashboard until this is complete.
 */
export function SetupScreen() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const completeRegistration = useCompleteRegistration();
  const status = registrationStatus(session);

  // Not verified? Start registration (or, just signed out, go where the log-out dialog chose).
  // Already complete? Go to the dashboard.
  useEffect(() => {
    if (isPending || completeRegistration.isSuccess) return;
    if (status === "unverified") router.replace(takeSignOutDestination() ?? routes.register);
    else if (status === "complete") router.replace(OWNER_HOME);
  }, [isPending, status, completeRegistration.isSuccess, router]);

  if (isPending || !session || (status === "complete" && !completeRegistration.isPending)) return <Splash />;
  return <RegistrationForm session={session} completeRegistration={completeRegistration} />;
}

/** What an incomplete registration already has, so the owner doesn't type it twice. */
function initialValues({ owner, property }: Session): RegistrationValues {
  return {
    owner: {
      name: owner.name,
      alternatePhone: owner.alternatePhone ?? "",
      email: owner.email ?? "",
    },
    property: property
      ? {
          type: isPropertyType(property.type) ? property.type : "",
          name: property.name,
          location: property.location,
          city: property.city ?? "",
          state: property.state ?? "",
          pincode: property.pincode ?? "",
        }
      : EMPTY_REGISTRATION.property,
    inventory:
      property && isBookingMode(property.bookingMode)
        ? { bookingMode: property.bookingMode, roomCount: property.roomCount ?? DEFAULT_ROOM_COUNT }
        : EMPTY_REGISTRATION.inventory,
    gst: property?.gst
      ? { registered: true, gstin: property.gst.gstin, rate: property.gst.rate }
      : EMPTY_REGISTRATION.gst,
    consent: false,
  };
}

function RegistrationForm({
  session,
  completeRegistration,
}: {
  session: Session;
  completeRegistration: ReturnType<typeof useCompleteRegistration>;
}) {
  const t = useCopy();
  const s = t.auth.setup;
  const router = useRouter();
  const [confirmingLogout, setConfirmingLogout] = useState(false);
  const primaryPhone = session.owner.phone;
  const schema = useMemo(() => registrationSchema(primaryPhone), [primaryPhone]);

  const form = useForm<RegistrationValues>({
    resolver: zodResolver(schema),
    defaultValues: initialValues(session),
  });
  const { errors, submitCount } = form.formState;
  const preview = useWatch({ control: form.control });
  const hasErrors = submitCount > 0 && Object.keys(errors).length > 0;
  // Until a kind is chosen, the preview shows a homestay.
  const chosenType = preview.property?.type;
  const previewType: PropertyType = isPropertyType(chosenType) ? chosenType : "homestay";

  const onSubmit = form.handleSubmit((values) =>
    completeRegistration.mutate(
      {
        owner: values.owner,
        // The schema has checked the type; narrow it for the API.
        property: { ...values.property, type: values.property.type as PropertyType },
        inventory: (({ mode, totalRooms }) => ({ bookingMode: mode, roomCount: totalRooms }))(
          normaliseInventory(values.inventory.bookingMode, values.inventory.roomCount),
        ),
        // The schema has checked the rate when registered.
        gst: values.gst.registered
          ? { gstin: normaliseGstin(values.gst.gstin), rate: values.gst.rate as GstRate }
          : null,
        consent: { accepted: values.consent, termsVersion: TERMS_VERSION, acceptedAt: new Date().toISOString() },
      },
      {
        onSuccess: () => {
          toast.success(s.done);
          router.replace(OWNER_HOME);
        },
        onError: (error) => toast.error(isApiError(error, "validation") ? s.errorSummary : t.common.states.errorBody),
      },
    ),
  );

  return (
    <div className="flex flex-1 flex-col px-5 pt-[calc(env(safe-area-inset-top)+1.25rem)] pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-8">
      <div className="flex min-w-0 items-center justify-between gap-3">
        <Link href={routes.home} aria-label={t.common.appName} className="rounded-lg lg:hidden">
          <Logo />
        </Link>
        <Button
          variant="link"
          size="sm"
          className="ml-auto min-w-0 text-subhead text-ink-3 hover:text-brand-700"
          onClick={() => setConfirmingLogout(true)}
        >
          <span className="truncate">{t.auth.logout.notYou}</span>
        </Button>
      </div>
      <LogoutDialog open={confirmingLogout} onOpenChange={setConfirmingLogout} />
      <div className="mx-auto flex w-full max-w-xl flex-1 animate-rise-in flex-col pt-8 pb-8 lg:pt-14">
        <RegistrationSteps current={3} />
        <p className="mt-8 text-subhead font-semibold tracking-wider text-accent-600 uppercase">{s.eyebrow}</p>
        <h1 className="mt-2 text-title-1 text-ink">{s.title}</h1>
        <p className="mt-2 text-body text-ink-3">{s.subtitle}</p>

        <form onSubmit={onSubmit} noValidate className="mt-8 flex flex-col gap-10">
          {hasErrors && (
            <Notice tone="danger" role="alert">
              {s.errorSummary}
            </Notice>
          )}

          <FormSection title={s.ownerSection} hint={s.ownerSectionHint}>
            <Field label={s.ownerName} hint={s.ownerNameHint} error={errors.owner?.name?.message}>
              <Input
                autoComplete="name"
                autoCapitalize="words"
                placeholder={s.ownerNamePlaceholder}
                aria-required
                {...form.register("owner.name")}
              />
            </Field>
            <Field label={s.primaryPhone} hint={s.primaryPhoneHint}>
              <Input
                value={formatPhone(primaryPhone)}
                readOnly
                aria-readonly
                tabIndex={-1}
                leading={<Lock className="size-4.5" aria-hidden />}
                trailing={
                  <Badge tone="success" size="sm">
                    <BadgeCheck aria-hidden />
                    {s.verified}
                  </Badge>
                }
                shellClassName="bg-subtle"
                className="text-ink-2"
              />
            </Field>
            <Field label={s.alternatePhone} hint={s.alternatePhoneHint} error={errors.owner?.alternatePhone?.message}>
              <Controller
                control={form.control}
                name="owner.alternatePhone"
                render={({ field }) => (
                  <PhoneInput value={field.value} onChange={field.onChange} onBlur={field.onBlur} name={field.name} />
                )}
              />
            </Field>
            <Field label={s.email} error={errors.owner?.email?.message}>
              <Input
                type="email"
                inputMode="email"
                autoComplete="email"
                autoCapitalize="none"
                spellCheck={false}
                placeholder={s.emailPlaceholder}
                leading={<Mail className="size-4.5" aria-hidden />}
                aria-required
                {...form.register("owner.email")}
              />
            </Field>
          </FormSection>

          <FormSection title={s.propertySection} hint={s.propertySectionHint}>
            <Field label={s.propertyType} hint={s.propertyTypeHint} error={errors.property?.type?.message}>
              <Controller
                control={form.control}
                name="property.type"
                render={({ field }) => (
                  <PropertyTypePicker
                    value={field.value as PropertyType | ""}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                )}
              />
            </Field>
            <Field label={s.propertyName} error={errors.property?.name?.message}>
              <Input
                autoComplete="organization"
                autoCapitalize="words"
                placeholder={s.propertyNamePlaceholder}
                aria-required
                {...form.register("property.name")}
              />
            </Field>
            <Field label={s.location} hint={s.locationHint} error={errors.property?.location?.message}>
              <Input
                autoCapitalize="words"
                placeholder={s.locationPlaceholder}
                leading={<MapPin className="size-5" aria-hidden />}
                aria-required
                {...form.register("property.location")}
              />
            </Field>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-[1fr_10rem]">
              <Field label={s.city} error={errors.property?.city?.message}>
                <Input
                  autoComplete="address-level2"
                  autoCapitalize="words"
                  placeholder={s.cityPlaceholder}
                  aria-required
                  {...form.register("property.city")}
                />
              </Field>
              <Field label={s.pincode} error={errors.property?.pincode?.message}>
                <Input
                  inputMode="numeric"
                  autoComplete="postal-code"
                  maxLength={6}
                  placeholder={s.pincodePlaceholder}
                  className="tabular"
                  aria-required
                  {...form.register("property.pincode", {
                    // Keep digits only, so pasted "403 507" still works.
                    onChange: (event) => {
                      event.target.value = event.target.value.replace(/\D/g, "").slice(0, 6);
                    },
                  })}
                />
              </Field>
            </div>
            <Field label={s.state} error={errors.property?.state?.message}>
              <NativeSelect aria-required autoComplete="address-level1" {...form.register("property.state")}>
                <option value="" disabled>
                  {s.statePlaceholder}
                </option>
                {INDIAN_STATES.map((state) => (
                  <option key={state.code} value={state.code}>
                    {state.name}
                  </option>
                ))}
              </NativeSelect>
            </Field>

            <GuestPreview
              type={previewType}
              ownerName={preview.owner?.name?.trim() ?? ""}
              propertyName={preview.property?.name?.trim() ?? ""}
              location={preview.property?.location?.trim() ?? ""}
            />
          </FormSection>

          <FormSection title={s.inventorySection} hint={s.inventorySectionHint}>
            <Controller
              control={form.control}
              name="inventory"
              render={({ field }) => (
                <BookingModeFields
                  mode={field.value.bookingMode}
                  roomCount={field.value.roomCount}
                  onModeChange={(bookingMode) => field.onChange({ ...form.getValues("inventory"), bookingMode })}
                  onRoomCountChange={(roomCount) => field.onChange({ ...form.getValues("inventory"), roomCount })}
                  roomCountError={errors.inventory?.roomCount?.message}
                />
              )}
            />
          </FormSection>

          <FormSection title={s.gstSection} hint={s.gstSectionHint}>
            <Controller
              control={form.control}
              name="gst"
              render={({ field }) => (
                <GstFields
                  registered={field.value.registered}
                  gstin={field.value.gstin}
                  rate={isGstRate(field.value.rate) ? field.value.rate : null}
                  onRegisteredChange={(registered) => field.onChange({ ...form.getValues("gst"), registered })}
                  onGstinChange={(gstin) => field.onChange({ ...form.getValues("gst"), gstin })}
                  onRateChange={(rate) => field.onChange({ ...form.getValues("gst"), rate })}
                  gstinError={errors.gst?.gstin?.message}
                  rateError={errors.gst?.rate?.message}
                />
              )}
            />
          </FormSection>

          <FormSection title={s.consentSection}>
            <Controller
              control={form.control}
              name="consent"
              render={({ field }) => (
                <Checkbox
                  id="registration-consent"
                  ref={field.ref}
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(checked === true)}
                  onBlur={field.onBlur}
                  aria-required
                  error={errors.consent?.message}
                  label={
                    <>
                      {s.consentStart}
                      <LegalLink href={routes.terms}>{s.terms}</LegalLink>
                      {s.consentJoin}
                      <LegalLink href={routes.privacyPolicy}>{s.privacy}</LegalLink>
                      {s.consentEnd}
                    </>
                  }
                />
              )}
            />
          </FormSection>

          <Button type="submit" size="xl" fullWidth loading={completeRegistration.isPending}>
            {s.submit}
          </Button>
        </form>
      </div>
    </div>
  );
}

/**
 * A titled group of fields. `min-w-0`: a fieldset is otherwise never narrower
 * than its content's natural width, and the phone inputs made small phones scroll sideways.
 */
function FormSection({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <fieldset className="flex min-w-0 flex-col gap-5">
      <legend className="mb-5 flex w-full flex-col gap-1 border-b border-line pb-3">
        <span className="text-headline text-ink">{title}</span>
        {hint && <span className="text-subhead text-ink-3">{hint}</span>}
      </legend>
      {children}
    </fieldset>
  );
}

/** Opens a legal page in a new tab, so the half-filled form isn't lost. */
function LegalLink({ href, children }: { href: string; children: ReactNode }) {
  const t = useCopy();
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener"
      className="rounded font-semibold text-brand-600 underline underline-offset-2 hover:text-brand-700"
    >
      {children}
      <span className="sr-only"> {t.auth.setup.opensInNewTab}</span>
    </Link>
  );
}

/** A miniature of the guest's welcome screen, so owners see why these details matter. */
function GuestPreview({
  type,
  ownerName,
  propertyName,
  location,
}: {
  type: PropertyType;
  ownerName: string;
  propertyName: string;
  location: string;
}) {
  const t = useCopy();
  return (
    <div className="flex flex-col gap-2">
      <p className="text-subhead font-medium text-ink-2">{t.auth.setup.previewLabel}</p>
      <div aria-hidden className={cn(surfaceStyles(), "overflow-hidden")}>
        <div className="flex items-center gap-4 bg-brand-50/70 px-4 py-3">
          <PropertyIllustration type={type} framed={false} className="size-16" />
          <div className="min-w-0">
            <p className="truncate text-body font-semibold text-ink">
              {propertyName || t.auth.setup.previewPropertyFallback}
            </p>
            <p className="truncate text-subhead text-ink-3">{location || t.auth.setup.previewLocationFallback}</p>
          </div>
        </div>
        <div className="flex flex-col gap-1 px-4 py-3">
          <p className="text-subhead text-ink-2">{t.auth.setup.previewWelcome}</p>
          {ownerName && <p className="text-footnote text-ink-3">{t.auth.setup.previewHost(ownerName)}</p>}
        </div>
      </div>
    </div>
  );
}

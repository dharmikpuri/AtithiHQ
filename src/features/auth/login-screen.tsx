"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { HomestayScene } from "@/components/brand/homestay-scene";
import { Logo } from "@/components/brand/logo";
import { IconTile } from "@/components/ui/icon-tile";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { OtpInput } from "@/components/ui/otp-input";
import { PhoneInput } from "@/components/ui/phone-input";
import { OWNER_HOME, routes } from "@/config/routes";
import { useCopy } from "@/content";
import type { PhoneE164 } from "@/domain/types";
import { toast } from "sonner";
import { registrationStatus } from "@/domain/registration";
import { demo, isApiError } from "@/lib/api";
import { formatPhone, isValidE164, splitE164 } from "@/lib/phone";
import { useRequestCode, useVerifyCode } from "./queries";
import { RegistrationSteps } from "./registration-steps";

type Step = { name: "phone" } | { name: "code"; phone: PhoneE164 };

/**
 * `signin`: returning owners. `register`: "Get started" for new owners. Both verify the mobile
 * number with the same code steps; registration adds a progress indicator and its own wording,
 * then continues to the registration form.
 */
export type AuthMode = "signin" | "register";

export function LoginScreen({ mode = "signin" }: { mode?: AuthMode }) {
  const t = useCopy();
  const [step, setStep] = useState<Step>({ name: "phone" });
  const [phone, setPhone] = useState<PhoneE164 | "">("");

  return (
    <div className="flex flex-1 flex-col px-5 pt-[calc(env(safe-area-inset-top)+1.25rem)] pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-8">
      <Link href={routes.home} aria-label={t.common.appName} className="self-start rounded-lg lg:hidden">
        <Logo />
      </Link>
      <div className="mx-auto flex w-full max-w-100 flex-1 flex-col pt-10 pb-8 sm:justify-center sm:py-8">
        {step.name === "phone" ? (
          <PhoneStep
            mode={mode}
            phone={phone}
            onPhoneChange={setPhone}
            onCodeSent={(value) => setStep({ name: "code", phone: value })}
          />
        ) : (
          <CodeStep mode={mode} phone={step.phone} onChangeNumber={() => setStep({ name: "phone" })} />
        )}
      </div>
    </div>
  );
}

function PhoneStep({
  mode,
  phone,
  onPhoneChange,
  onCodeSent,
}: {
  mode: AuthMode;
  phone: PhoneE164 | "";
  onPhoneChange: (value: PhoneE164 | "") => void;
  onCodeSent: (phone: PhoneE164) => void;
}) {
  const t = useCopy();
  const requestCode = useRequestCode();
  const [error, setError] = useState<string>();
  const registering = mode === "register";
  const r = t.auth.register;

  function submit(event?: FormEvent) {
    event?.preventDefault();
    if (!phone || !isValidE164(phone)) {
      setError(
        splitE164(phone || "+91").dial === "91"
          ? t.common.validation.phoneInvalidIndia
          : t.common.validation.phoneInvalid,
      );
      return;
    }
    setError(undefined);
    requestCode.mutate(phone, {
      onSuccess: () => onCodeSent(phone),
      onError: () => setError(t.common.states.errorBody),
    });
  }

  return (
    <div className="flex animate-rise-in flex-col">
      {registering ? (
        <RegistrationSteps current={1} className="mb-8" />
      ) : (
        <HomestayScene className="mb-8 w-56 lg:hidden" />
      )}
      <h1 className="text-title-1 text-ink">{registering ? r.title : t.auth.login.title}</h1>
      <p className="mt-2 text-body text-ink-3">{registering ? r.subtitle : t.auth.login.subtitle}</p>

      <form onSubmit={submit} noValidate className="mt-8 flex flex-col gap-5">
        <Field label={t.auth.login.phoneLabel} hint={registering ? r.phoneHint : t.auth.login.phoneHint} error={error}>
          <PhoneInput
            value={phone}
            onChange={(value) => {
              onPhoneChange(value);
              if (error) setError(undefined);
            }}
            autoFocus
          />
        </Field>
        <Button type="submit" size="xl" fullWidth loading={requestCode.isPending} trailingIcon={<ArrowRight />}>
          {t.auth.login.sendCode}
        </Button>
      </form>

      {demo.enabled && (
        <div className="mt-10 rounded-2xl border border-dashed border-line-strong bg-surface/60 p-4">
          <div className="flex items-start gap-3">
            <IconTile icon={Sparkles} tone="accent" size="sm" className="rounded-full" />
            <div className="flex flex-col gap-1">
              <p className="text-callout font-semibold text-ink">
                {registering ? r.demoTitle : t.auth.login.demoTitle}
              </p>
              <p className="text-subhead leading-5 text-ink-3">{registering ? r.demoBody : t.auth.login.demoBody}</p>
              {!registering && (
                <Button
                  variant="link"
                  size="sm"
                  className="mt-1 self-start"
                  onClick={() => {
                    onPhoneChange(demo.ownerPhone);
                    setError(undefined);
                  }}
                >
                  {t.auth.login.useDemo}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      <p className="mt-8 text-center text-callout text-ink-3">
        {registering ? r.alreadyRegistered : t.auth.login.newHere}{" "}
        <Link
          href={registering ? routes.login : routes.register}
          className="rounded font-semibold text-brand-600 hover:text-brand-700 hover:underline"
        >
          {registering ? r.signIn : t.auth.login.createAccount}
        </Link>
      </p>
    </div>
  );
}

const RESEND_SECONDS = 30;

function CodeStep({ mode, phone, onChangeNumber }: { mode: AuthMode; phone: PhoneE164; onChangeNumber: () => void }) {
  const t = useCopy();
  const router = useRouter();
  const verify = useVerifyCode();
  const requestCode = useRequestCode();
  const [code, setCode] = useState("");
  const [invalid, setInvalid] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = window.setTimeout(() => setSecondsLeft((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [secondsLeft]);

  function submit(value = code) {
    if (value.length !== 6 || verify.isPending) return;
    verify.mutate(
      { phone, code: value },
      {
        onSuccess: (session) => {
          const complete = registrationStatus(session) === "complete";
          // "Get started" with a number that is already registered simply signs the owner in.
          if (complete && mode === "register") toast.info(t.auth.register.existingAccount);
          router.replace(complete ? OWNER_HOME : routes.setup);
        },
        onError: (error) => {
          // Clear the boxes so the owner can simply type the code again.
          setCode("");
          setInvalid(true);
          if (!isApiError(error, "invalid_code")) toast.error(t.common.states.errorBody);
        },
      },
    );
  }

  function resend() {
    requestCode.mutate(phone, {
      onSuccess: () => {
        setSecondsLeft(RESEND_SECONDS);
        setCode("");
        setInvalid(false);
        toast.success(t.auth.otp.resent);
      },
    });
  }

  return (
    <div className="flex animate-rise-in flex-col">
      {mode === "register" && <RegistrationSteps current={2} className="mb-8" />}
      <h1 className="text-title-1 text-ink">{t.auth.otp.title}</h1>
      <p className="mt-2 text-body text-ink-3">
        {demo.enabled ? t.auth.otp.demoSentTo(formatPhone(phone)) : t.auth.otp.sentTo(formatPhone(phone))}
      </p>
      <Button variant="link" size="sm" className="mt-1 self-start text-callout" onClick={onChangeNumber}>
        {t.auth.otp.changeNumber}
      </Button>

      <form
        noValidate
        className="mt-8 flex flex-col gap-5"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <div className="flex flex-col gap-2">
          <OtpInput
            label={t.auth.otp.codeLabel}
            value={code}
            onChange={(value) => {
              setCode(value);
              if (invalid && value) setInvalid(false);
            }}
            onComplete={submit}
            invalid={invalid}
            disabled={verify.isPending}
            autoFocus
            describedBy={invalid ? "otp-error" : demo.enabled ? "otp-hint" : undefined}
          />
          {invalid ? (
            <p id="otp-error" role="alert" className="text-subhead font-medium text-danger-600">
              {t.auth.otp.invalid}
            </p>
          ) : (
            demo.enabled && (
              <p id="otp-hint" className="text-subhead text-ink-3">
                {t.auth.otp.demoHint}
              </p>
            )
          )}
        </div>

        <Button type="submit" size="xl" fullWidth loading={verify.isPending} disabled={code.length !== 6}>
          {t.auth.otp.verify}
        </Button>

        <div className="flex justify-center">
          {secondsLeft > 0 ? (
            <p className="text-callout text-ink-3 tabular" aria-live="polite">
              {t.auth.otp.resendIn(secondsLeft)}
            </p>
          ) : (
            <Button variant="ghost" size="md" onClick={resend} loading={requestCode.isPending}>
              {t.auth.otp.resend}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

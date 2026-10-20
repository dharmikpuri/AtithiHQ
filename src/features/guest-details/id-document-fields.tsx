"use client";

import { Camera, EyeOff, ImageIcon, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Controller, useWatch, type UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { ChoiceChips } from "@/components/ui/choice-chips";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useCopy } from "@/content";
import { ID_DOCUMENT_TYPES } from "@/domain/constants";
import type { GuestDetailsValues } from "./guest-details-schema";

interface IdDocumentFieldsProps {
  form: UseFormReturn<GuestDetailsValues>;
  /** Offer a "No ID" choice (owner entry). The guest form skips the step instead. */
  allowNone?: boolean;
  /** Suggest passport first for visitors from abroad. */
  preferPassport?: boolean;
}

/**
 * ID type, last four characters and an optional photo.
 * The full ID number is never asked for or stored.
 */
export function IdDocumentFields({ form, allowNone = true, preferPassport = false }: IdDocumentFieldsProps) {
  const t = useCopy().common;
  const [idType, hasImage] = useWatch({ control: form.control, name: ["idType", "idHasImage"] });
  const { errors } = form.formState;

  const types = preferPassport
    ? (["passport", ...ID_DOCUMENT_TYPES.filter((type) => type !== "passport")] as const)
    : ID_DOCUMENT_TYPES;
  const options = [
    ...types.map((type) => ({ value: type, label: t.idTypes[type] })),
    ...(allowNone ? [{ value: "none" as const, label: t.idDocument.none }] : []),
  ];

  return (
    <div className="flex flex-col gap-4">
      <Field label={t.idDocument.type}>
        <Controller
          control={form.control}
          name="idType"
          render={({ field }) => <ChoiceChips value={field.value} onChange={field.onChange} options={options} />}
        />
      </Field>

      {idType !== "none" && (
        <>
          <Field
            label={idType === "passport" ? t.idDocument.last4Passport : t.idDocument.last4}
            hint={t.idDocument.last4Hint}
            error={errors.idLast4?.message}
          >
            <Input
              inputMode={idType === "aadhaar" ? "numeric" : "text"}
              autoComplete="off"
              autoCapitalize="characters"
              maxLength={4}
              placeholder="1234"
              leading={<span className="text-body tracking-widest text-ink-4">••••</span>}
              className="font-semibold tracking-[0.3em] tabular"
              shellClassName="max-w-56"
              {...form.register("idLast4")}
            />
          </Field>
          <PhotoPicker
            hasImage={hasImage}
            masked={idType === "aadhaar"}
            onChange={(next) => form.setValue("idHasImage", next, { shouldDirty: true })}
          />
        </>
      )}
    </div>
  );
}

/**
 * Camera-first photo capture. In this UI build the photo stays on the device;
 * the backend upload (masked, encrypted, auto-deleted) plugs in later.
 */
function PhotoPicker({
  hasImage,
  masked,
  onChange,
}: {
  hasImage: boolean;
  masked: boolean;
  onChange: (hasImage: boolean) => void;
}) {
  const t = useCopy().common.idDocument;
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl],
  );

  function pick(file: File | undefined) {
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    onChange(true);
  }

  function clear() {
    setPreviewUrl(null);
    onChange(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-subhead font-medium text-ink-2">{t.photo}</p>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(event) => pick(event.target.files?.[0])}
      />
      {hasImage ? (
        <div className="flex items-center gap-3 rounded-xl border border-line bg-subtle p-2.5">
          <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-brand-100">
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- local object URL preview
              <img src={previewUrl} alt="" className="size-full object-cover" />
            ) : (
              <span className="flex size-full items-center justify-center text-brand-500">
                <ImageIcon className="size-6" aria-hidden />
              </span>
            )}
            {masked && (
              <span className="absolute inset-x-0 top-1/2 flex h-5 -translate-y-1/2 items-center justify-center gap-1 bg-ink/80 text-micro font-semibold text-white">
                <EyeOff className="size-3" aria-hidden />
                {t.masked}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-callout font-medium text-ink">{t.photoAdded}</p>
            {masked && <p className="text-footnote leading-5 text-ink-3">{t.maskedOnDevice}</p>}
          </div>
          <div className="flex shrink-0 flex-col gap-1 sm:flex-row">
            <Button variant="ghost" size="sm" onClick={() => inputRef.current?.click()}>
              {t.photoReplace}
            </Button>
            <Button variant="ghost" size="sm" className="text-danger-600" onClick={clear} aria-label={t.photoRemove}>
              <Trash2 />
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-3 rounded-xl border border-dashed border-line-strong bg-surface px-4 py-3.5 text-left transition-colors hover:border-brand-400 hover:bg-brand-50/50 focus-visible:ring-4 focus-visible:ring-brand-500/12 focus-visible:outline-none"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <Camera className="size-5" aria-hidden />
          </span>
          <span className="flex flex-col">
            <span className="text-callout font-semibold text-ink">{t.photoAdd}</span>
            <span className="text-footnote text-ink-3">{t.photoHint}</span>
          </span>
        </button>
      )}
    </div>
  );
}

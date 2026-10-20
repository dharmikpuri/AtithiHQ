"use client";

import { ChevronLeft, Eye } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { Logo, LogoMark } from "@/components/brand/logo";
import { initialsOf } from "@/components/ui/avatar";
import { IconButton } from "@/components/ui/icon-button";
import { isInternalPath } from "@/config/routes";
import { useCopy } from "@/content";
import { cn } from "@/lib/cn";

interface GuestShellProps {
  propertyName?: string;
  /** "Step 2 of 3" — omitted on the welcome and done screens. */
  progress?: { step: number; total: number };
  onBack?: () => void;
  preview?: boolean;
  /** Hide the compact header (the welcome screen has its own hero). */
  bare?: boolean;
  children: ReactNode;
  footer?: ReactNode;
}

/**
 * Frame for every guest screen. A phone-sized column everywhere: full-bleed on
 * phones, a centred card on larger screens. Built to load fast on slow data.
 */
export function GuestShell({ propertyName, progress, onBack, preview, bare, children, footer }: GuestShellProps) {
  const t = useCopy();
  return (
    <div className="flex min-h-dvh flex-col bg-surface md:bg-canvas md:px-6 md:py-10">
      {preview && <PreviewBanner />}
      <div className="mx-auto flex w-full max-w-120 flex-1 flex-col md:flex-none md:rounded-[28px] md:border md:border-line md:bg-surface md:shadow-raised">
        {!bare && (
          <header className="sticky top-0 z-20 rounded-t-[28px] bg-surface/95 pt-safe backdrop-blur-md">
            <div className="flex h-14 items-center gap-2 px-3 sm:px-4">
              {onBack ? (
                <IconButton aria-label={t.guestForm.back} onClick={onBack}>
                  <ChevronLeft className="size-6" />
                </IconButton>
              ) : (
                <span className="w-2" />
              )}
              {!propertyName && <Logo />}
              {propertyName && (
                <span className="flex min-w-0 flex-1 items-center gap-2">
                  <PropertyMark name={propertyName} />
                  <span className="truncate text-callout font-semibold text-ink">{propertyName}</span>
                </span>
              )}
              {progress && (
                <span className="ml-auto shrink-0 pr-2 text-subhead font-medium text-ink-3 tabular">
                  {t.guestForm.progress(progress.step, progress.total)}
                </span>
              )}
            </div>
            {progress && (
              <div
                className="h-1 bg-ink/6"
                role="progressbar"
                aria-label={t.guestForm.progress(progress.step, progress.total)}
                aria-valuemin={1}
                aria-valuemax={progress.total}
                aria-valuenow={progress.step}
              >
                <div
                  className="h-full rounded-r-full bg-brand-500 transition-[width] duration-500 ease-out-soft"
                  style={{ width: `${(progress.step / progress.total) * 100}%` }}
                />
              </div>
            )}
          </header>
        )}
        <main className="flex flex-1 animate-rise-in flex-col px-5 pt-6 pb-8 sm:px-7">{children}</main>
        {footer && (
          <div className="sticky bottom-0 z-20 rounded-b-[28px] border-t border-line bg-surface/95 px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-md sm:px-7 md:pb-6">
            {footer}
          </div>
        )}
      </div>
      <p className="mt-6 hidden items-center justify-center gap-2 text-footnote text-ink-3 md:flex">
        <LogoMark className="size-4" />
        {t.common.appName}
      </p>
    </div>
  );
}

function PropertyMark({ name, className }: { name: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent-100 text-footnote font-bold text-accent-700",
        className,
      )}
    >
      {initialsOf(name)}
    </span>
  );
}

function PreviewBanner() {
  const t = useCopy().guestForm.preview;
  const router = useRouter();
  // Owner previews carry the screen they came from, so "Back" returns there.
  const from = useSearchParams().get("from");
  const back = () => (from && isInternalPath(from) ? router.push(from) : router.back());
  return (
    <div className="sticky top-0 z-30 bg-brand-900 pt-safe text-white md:static md:mx-auto md:mb-6 md:w-full md:max-w-120 md:rounded-2xl">
      <div className="flex items-center gap-3 px-4 py-2.5">
        <Eye className="size-4.5 shrink-0 text-brand-200" aria-hidden />
        <p className="min-w-0 flex-1 text-footnote leading-5 text-white/85">
          <span className="font-semibold text-white">{t.label} · </span>
          {t.body}
        </p>
        <button
          type="button"
          onClick={back}
          className="shrink-0 rounded-lg bg-white/10 px-3 py-2 text-footnote font-semibold text-white hover:bg-white/20"
        >
          {t.back}
        </button>
      </div>
    </div>
  );
}

"use client";

import { Copy, Eye, EyeOff } from "lucide-react";
import { useEffect, useState, type ComponentProps } from "react";
import { toast } from "sonner";
import { useCopy } from "@/content";
import type { PhoneE164 } from "@/domain/types";
import { copyText } from "@/lib/clipboard";
import { cn } from "@/lib/cn";
import { formatPhone, maskPhone } from "@/lib/phone";

/** How long a revealed number stays visible before it hides itself again. */
const AUTO_HIDE_MS = 30_000;

/**
 * A phone number that is masked by default (+91 98••• •••10).
 * The eye reveals the full number as a tap-to-call link with a copy button,
 * and it hides itself again after a short while. For phone numbers only —
 * identity documents are never revealed this way.
 *
 * Sits above "stretched" row links (`relative z-10`), so it can live inside a tappable row.
 */
export function PhoneReveal({ phone, className }: { phone: PhoneE164; className?: string }) {
  const t = useCopy().common.phone;
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (!revealed) return;
    const timer = window.setTimeout(() => setRevealed(false), AUTO_HIDE_MS);
    return () => window.clearTimeout(timer);
  }, [revealed]);

  const full = formatPhone(phone);

  return (
    <span className={cn("relative z-10 inline-flex max-w-full min-w-0 items-center gap-0.5 tabular", className)}>
      {revealed ? (
        <>
          <a
            href={`tel:${phone}`}
            aria-label={t.call(full)}
            className="truncate rounded font-medium text-brand-700 underline-offset-2 hover:underline"
          >
            {full}
          </a>
          <InlineIconButton
            aria-label={t.copy}
            onClick={async () => {
              if (await copyText(phone)) toast.success(t.copied);
              else toast.error(t.copyFailed);
            }}
          >
            <Copy />
          </InlineIconButton>
          <InlineIconButton aria-label={t.hide} onClick={() => setRevealed(false)}>
            <EyeOff />
          </InlineIconButton>
        </>
      ) : (
        <>
          <span className="truncate">{maskPhone(phone)}</span>
          <InlineIconButton aria-label={t.show} onClick={() => setRevealed(true)}>
            <Eye />
          </InlineIconButton>
        </>
      )}
    </span>
  );
}

/** A small icon button that fits inside a line of text but still has a 44px touch area. */
function InlineIconButton({ className, children, ...props }: ComponentProps<"button">) {
  return (
    <button
      type="button"
      {...props}
      className={cn(
        "relative inline-flex size-7 shrink-0 items-center justify-center rounded-full text-ink-3 transition-colors",
        "after:absolute after:-inset-2 hover:bg-ink/5 hover:text-ink focus-visible:text-ink [&_svg]:size-4",
        className,
      )}
    >
      {children}
    </button>
  );
}

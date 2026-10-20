"use client";

import { LockKeyhole, RotateCcw, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useCopy } from "@/content";
import type { IdDocument } from "@/domain/types";
import { formatFullDate } from "@/lib/dates";
import { useDocumentView } from "../queries";

/**
 * Shows an identity document through a short-lived link.
 * The view closes itself when the link expires; every open is audited server-side.
 */
export function IdDocumentViewer({
  document,
  open,
  onOpenChange,
}: {
  document: IdDocument;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useCopy();
  const d = t.bookings.document;
  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={d.title(t.common.idTypes[document.type])}
      description={d.numberOnFile(document.last4)}
    >
      {open && <SecureImage document={document} />}
    </Sheet>
  );
}

function SecureImage({ document }: { document: IdDocument }) {
  const t = useCopy();
  const d = t.bookings.document;
  const request = useDocumentView();
  const [now, setNow] = useState(() => Date.now());
  const { mutate } = request;

  useEffect(() => {
    if (document.hasImage) mutate(document.id);
  }, [document.id, document.hasImage, mutate]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const expiresAt = request.data ? new Date(request.data.expiresAt).getTime() : null;
  const secondsLeft = expiresAt ? Math.max(0, Math.ceil((expiresAt - now) / 1000)) : null;
  const expired = secondsLeft === 0;

  return (
    <div className="flex flex-col gap-4">
      {!document.hasImage ? (
        <div className="rounded-2xl border border-dashed border-line-strong bg-subtle px-4 py-8 text-center text-callout text-ink-3">
          {d.noImage}
        </div>
      ) : request.isPending || !request.data ? (
        <Skeleton className="aspect-[1.6] w-full rounded-2xl" />
      ) : expired ? (
        <div className="flex aspect-[1.6] w-full flex-col items-center justify-center gap-3 rounded-2xl border border-line bg-subtle text-center">
          <LockKeyhole className="size-8 text-ink-4" aria-hidden />
          <p className="text-callout text-ink-2">{d.expired}</p>
          <Button variant="secondary" size="sm" leadingIcon={<RotateCcw />} onClick={() => mutate(document.id)}>
            {d.openAgain}
          </Button>
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-2xl border border-line bg-canvas">
          {/* eslint-disable-next-line @next/next/no-img-element -- signed, short-lived URL */}
          <img
            src={request.data.url}
            alt={d.title(t.common.idTypes[document.type])}
            className="aspect-[1.6] w-full object-cover"
          />
          <span className="absolute top-3 right-3 rounded-full bg-ink/80 px-2.5 py-1 text-caption font-semibold text-white tabular">
            {d.expiresIn(secondsLeft ?? 60)}
          </span>
        </div>
      )}
      <div className="flex items-start gap-3 rounded-xl bg-brand-50 px-3.5 py-3 text-subhead leading-5 text-brand-800">
        <ShieldCheck className="mt-0.5 size-4.5 shrink-0 text-brand-500" aria-hidden />
        <div className="flex flex-col gap-1">
          <p>{d.secureNote}</p>
          <p className="font-medium">{d.deleteOn(formatFullDate(document.deleteOn))}</p>
        </div>
      </div>
    </div>
  );
}

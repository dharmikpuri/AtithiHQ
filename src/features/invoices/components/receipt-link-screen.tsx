"use client";

import { CalendarX2, LinkIcon } from "lucide-react";
import type { ReactNode } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Notice } from "@/components/ui/notice";
import { Skeleton } from "@/components/ui/skeleton";
import { useCopy } from "@/content";
import type { ReceiptLinkView } from "@/domain/read-models";
import { isApiError } from "@/lib/api";
import { formatDateTime } from "@/lib/dates";
import { useReceiptLink } from "../queries";
import { DownloadPdfButton } from "./download-pdf-button";
import { InvoiceDocument } from "./invoice-document";

/**
 * The public page behind a shared link, at `/r/<token>`. No login: the link is the credential.
 * It carries only the property's own name, never AtithiHQ's logo, name or footer.
 */
export function ReceiptLinkScreen({ token }: { token: string }) {
  const t = useCopy().invoices.publicPage;
  const { data: view, isPending, isError, error, refetch } = useReceiptLink(token);

  if (isPending) return <LoadingPage />;
  if (isError) {
    if (isApiError(error, "not_found")) {
      return (
        <Centered>
          <EmptyState icon={LinkIcon} title={t.invalidTitle} description={t.invalidBody} />
        </Centered>
      );
    }
    return (
      <Centered>
        <ErrorState onRetry={() => refetch()} />
      </Centered>
    );
  }
  if (view.status === "expired") {
    return (
      <Centered>
        <EmptyState icon={CalendarX2} title={t.expiredTitle} description={t.expiredBody(view.propertyName)} />
      </Centered>
    );
  }
  return <ReceiptPage view={view} />;
}

function ReceiptPage({ view }: { view: Extract<ReceiptLinkView, { status: "valid" }> }) {
  const t = useCopy();
  const p = t.invoices.publicPage;
  const propertyName = view.snapshot.property.name;

  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <header className="border-b border-line bg-surface pt-safe">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-3 py-3 sm:px-6">
          <div className="flex min-w-0 flex-col">
            <h1 className="truncate text-callout font-semibold text-ink">{propertyName}</h1>
            <p className="text-footnote text-ink-3">{p.expiresOn(formatDateTime(view.expiresAt))}</p>
          </div>
          <div className="shrink-0">
            <DownloadPdfButton document={view} cancelled={view.cancelled} variant="primary" size="md" />
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-3 py-4 pb-[max(2rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-6">
        {view.superseded && (
          <Notice tone="warning">{p.superseded(propertyName, t.invoices.share.kindInMessage[view.kind])}</Notice>
        )}
        <InvoiceDocument document={view} cancelled={view.cancelled} />
      </main>
    </div>
  );
}

function Centered({ children }: { children: ReactNode }) {
  return <main className="flex min-h-dvh items-center justify-center bg-canvas px-3 py-8">{children}</main>;
}

function LoadingPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-canvas" aria-hidden>
      <div className="border-b border-line bg-surface">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-3 py-3 sm:px-6">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-11 w-36 rounded-xl" />
        </div>
      </div>
      <div className="mx-auto w-full max-w-3xl px-3 py-4 sm:px-6 sm:py-6">
        <Skeleton className="h-130 w-full rounded-2xl" />
      </div>
    </div>
  );
}

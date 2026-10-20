"use client";

import { Download } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCopy } from "@/content";
import { downloadDocumentPdf, PDF_RENDER_WIDTH } from "../pdf";
import { InvoiceDocument, type InvoiceDocumentData } from "./invoice-document";

/**
 * "Download PDF" for an issued document. The PDF is made from its own copy of the document, drawn off
 * screen at a fixed A4 width, so it looks the same whatever device it is made on (the on-screen copy is
 * never captured). That copy carries only the property's own branding.
 */
export function DownloadPdfButton({
  document,
  cancelled = false,
  variant = "secondary",
  size = "lg",
  fullWidth,
}: {
  document: InvoiceDocumentData & { number: string };
  cancelled?: boolean;
  variant?: "primary" | "secondary";
  size?: "md" | "lg";
  fullWidth?: boolean;
}) {
  const t = useCopy().invoices.pdf;
  const targetRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);

  async function download() {
    const target = targetRef.current;
    if (!target || busy) return;
    setBusy(true);
    try {
      await downloadDocumentPdf(target, document.number);
    } catch {
      toast.error(t.error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        fullWidth={fullWidth}
        loading={busy}
        leadingIcon={<Download />}
        onClick={download}
      >
        {busy ? t.downloading : t.download}
      </Button>
      {/* Off screen, not hidden: a hidden element can't be drawn. Wider than a phone, but fixed and to the
          left, so it adds no scrolling. The inner box is what gets captured. */}
      <div aria-hidden inert className="pointer-events-none fixed top-0 -left-2500">
        <div ref={targetRef} style={{ width: PDF_RENDER_WIDTH }} className="bg-white">
          <InvoiceDocument document={document} cancelled={cancelled} className="rounded-none border-0 shadow-none" />
        </div>
      </div>
    </>
  );
}

import { ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { IconTile } from "@/components/ui/icon-tile";
import { Notice } from "@/components/ui/notice";
import { routes } from "@/config/routes";
import { getCopy } from "@/content";
import { TERMS_VERSION } from "@/domain/registration";

/**
 * A placeholder legal document, clearly marked as a draft. Replace the copy in
 * `content/en/legal.ts` with the final, reviewed text before launch.
 */
export function LegalPage({ doc }: { doc: "terms" | "privacy" }) {
  const t = getCopy().legal;
  const page = t[doc];
  return (
    <div className="min-h-dvh bg-surface">
      <header className="border-b border-line">
        <div className="mx-auto flex h-16 w-full max-w-3xl items-center justify-between px-5 sm:px-8">
          <Link href={routes.home} aria-label={getCopy().common.appName} className="rounded-lg">
            <Logo />
          </Link>
          <Link
            href={routes.home}
            className="inline-flex items-center gap-1.5 rounded-lg text-subhead font-medium text-ink-2 hover:text-brand-700"
          >
            <ArrowLeft className="size-4" aria-hidden />
            {t.back}
          </Link>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-5 py-12 sm:px-8 sm:py-16">
        <IconTile icon={FileText} size="lg" />
        <h1 className="text-large-title text-ink">{page.title}</h1>
        <Notice tone="warning" title={t.draftTitle}>
          {t.draftBody}
        </Notice>
        <ul className="flex list-disc flex-col gap-3 pl-5 text-body text-ink-2">
          {page.points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
        <p className="text-footnote text-ink-3">
          {t.updated}: {TERMS_VERSION}
        </p>
      </main>
    </div>
  );
}

import { Compass } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { getCopy } from "@/content";

export default function NotFound() {
  const t = getCopy();
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-8 px-6 text-center">
      <Logo />
      <div className="flex max-w-sm flex-col items-center gap-4">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
          <Compass className="size-7" aria-hidden />
        </span>
        <h1 className="text-title-2 text-ink">{t.common.states.notFoundTitle}</h1>
        <p className="text-callout leading-6 text-ink-3">{t.common.states.notFoundBody}</p>
        <Button asChild size="lg" className="mt-2">
          <Link href={routes.bookings}>{t.common.nav.bookings}</Link>
        </Button>
      </div>
    </div>
  );
}

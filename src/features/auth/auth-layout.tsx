import { Check } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { HomestayScene } from "@/components/brand/homestay-scene";
import { Logo } from "@/components/brand/logo";
import { routes } from "@/config/routes";
import { getCopy } from "@/content";

/**
 * Frame for sign-in and first-time setup.
 * Phones: a single focused column. Desktop: the brand story on a navy panel that stays in
 * place while the form scrolls.
 */
export function AuthLayout({ children }: { children: ReactNode }) {
  const copy = getCopy();
  const t = copy.auth.brandPanel;
  return (
    <div className="flex min-h-dvh">
      {/* Stays put while the form beside it scrolls (the registration form is long). */}
      <aside className="sticky top-0 hidden h-dvh w-[44%] max-w-160 flex-col justify-between gap-6 self-start overflow-hidden bg-brand-950 p-12 text-white lg:flex [@media(max-height:820px)]:p-10">
        {/* Cool glow and a faint grid, matching the home page */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_55%_at_90%_0%,var(--color-brand-700),transparent)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-grid mask-[radial-gradient(ellipse_80%_60%_at_80%_10%,black,transparent)] [--grid-line:rgb(255_255_255/0.05)]"
        />
        <Link href={routes.home} aria-label={copy.common.appName} className="relative self-start rounded-lg">
          <Logo inverted showByline />
        </Link>
        <div className="relative flex flex-col gap-10 [@media(max-height:820px)]:gap-6">
          {/* Shorter laptop screens: a smaller scene so the panel fits without scrolling. */}
          <HomestayScene tone="dark" className="max-w-md [@media(max-height:820px)]:max-w-xs" />
          <div className="flex max-w-md flex-col gap-4">
            <h2 className="text-display text-balance">{t.headline}</h2>
            <p className="text-lead text-white/70">{t.body}</p>
          </div>
          <ul className="flex flex-col gap-3">
            {t.points.map((point) => (
              <li key={point} className="flex items-center gap-3 text-callout text-white/85">
                <span className="flex size-6 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15">
                  <Check className="size-3.5" aria-hidden />
                </span>
                {point}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-subhead text-white/50">{copy.common.copyright(new Date().getFullYear())}</p>
      </aside>
      {/* `min-w-0`: a flex item never shrinks below its content's natural width otherwise, and an
          input's default width (the verified number with its badge) made phones 14px too wide. */}
      <main className="flex min-w-0 flex-1 flex-col">{children}</main>
    </div>
  );
}

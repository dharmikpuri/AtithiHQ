import Link from "next/link";
import { Logo, LogoMark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { getCopy } from "@/content";
import { HOME_SECTIONS } from "@/lib/seo/structured-data";
import { AccountLink } from "./account-link";

export const MAIN_CONTENT_ID = "main";

/** Sticky top bar: brand, section links (from tablet up) and the way in. */
export function HomeHeader() {
  const t = getCopy();
  const nav = t.home.nav;
  const links = [
    { href: `#${HOME_SECTIONS.howItWorks}`, label: nav.howItWorks },
    { href: `#${HOME_SECTIONS.guests}`, label: nav.guests },
    { href: `#${HOME_SECTIONS.privacy}`, label: nav.privacy },
    { href: `#${HOME_SECTIONS.faq}`, label: nav.faq },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-brand-100 bg-brand-50/85 pt-safe backdrop-blur-lg">
      <a
        href={`#${MAIN_CONTENT_ID}`}
        className="sr-only rounded-lg bg-brand-600 px-4 py-2 text-subhead font-semibold text-white focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50"
      >
        {nav.skipToContent}
      </a>
      <div className="mx-auto flex h-18 w-full max-w-7xl items-center gap-6 px-5 sm:px-8">
        <Link href={routes.home} aria-label={t.common.appName} className="group/logo shrink-0 rounded-lg">
          {/* The smallest phones (under 400px) show the mark alone, so the account buttons fit. */}
          <Logo size="lg" motion="hop" className="max-[399px]:hidden" />
          <LogoMark motion="hop" className="size-10 min-[400px]:hidden" />
        </Link>
        <nav aria-label={nav.label} className="hidden flex-1 justify-center md:flex">
          <ul className="flex items-center gap-1">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="rounded-full px-4 py-2 text-callout font-medium text-ink-2 transition-colors hover:bg-brand-100 hover:text-ink"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <Button asChild variant="ghost" size="md" className="px-3 sm:px-4">
            <AccountLink intent="signIn">{nav.signIn}</AccountLink>
          </Button>
          <Button asChild size="md">
            <AccountLink intent="start">{nav.getStarted}</AccountLink>
          </Button>
        </div>
      </div>
    </header>
  );
}

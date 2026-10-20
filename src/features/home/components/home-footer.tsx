import { ArrowUp, MapPin, ShieldCheck, Smartphone, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand/logo";
import { duotone } from "@/components/ui/icon-tile";
import { site } from "@/config/site";
import { getCopy } from "@/content";
import { HOME_SECTIONS } from "@/lib/seo/structured-data";
import { AccountLink } from "./account-link";
import { MAIN_CONTENT_ID } from "./home-header";

const LINK_CLASS = "text-callout text-ink-2 transition-colors hover:text-brand-700";

/** Icons for `footer.badges`, in the same order. */
const BADGE_ICONS: LucideIcon[] = [MapPin, ShieldCheck, Smartphone];

export function HomeFooter() {
  const t = getCopy();
  const { footer, nav, hero } = t.home;
  const product = [
    { href: `#${HOME_SECTIONS.howItWorks}`, label: nav.howItWorks },
    { href: `#${HOME_SECTIONS.guests}`, label: nav.guests },
    { href: `#${HOME_SECTIONS.features}`, label: hero.links.payments },
    { href: `#${HOME_SECTIONS.privacy}`, label: nav.privacy },
    { href: `#${HOME_SECTIONS.faq}`, label: nav.faq },
  ];

  return (
    <footer className="relative overflow-hidden bg-surface">
      <div className="relative mx-auto w-full max-w-7xl">
        <div className="grid grid-cols-2 gap-10 px-5 pt-16 pb-12 sm:px-8 md:grid-cols-[2fr_1fr_1fr_1fr] lg:pt-20">
          <div className="col-span-2 flex max-w-sm flex-col gap-5 md:col-span-1">
            <Logo size="lg" showByline />
            <p className="text-callout text-ink-2">{footer.tagline}</p>
            <ul className="flex flex-wrap gap-2">
              {footer.badges.map((badge, index) => {
                const Icon = BADGE_ICONS[index];
                return (
                  <li
                    key={badge}
                    className="inline-flex items-center gap-1.5 rounded-full border border-brand-100 bg-brand-50 py-1 pr-3 pl-2 text-footnote font-medium text-brand-800"
                  >
                    <Icon className="size-3.5 text-brand-600" aria-hidden {...duotone} />
                    {badge}
                  </li>
                );
              })}
            </ul>
          </div>

          <FooterColumn title={footer.product}>
            {product.map((link) => (
              <li key={link.href + link.label}>
                <a href={link.href} className={LINK_CLASS}>
                  {link.label}
                </a>
              </li>
            ))}
          </FooterColumn>

          <FooterColumn title={footer.account}>
            <AccountLink intent="signIn" listItem className={LINK_CLASS}>
              {nav.signIn}
            </AccountLink>
            <AccountLink
              intent="start"
              listItem
              className="text-callout font-semibold text-brand-600 hover:text-brand-700"
            >
              {nav.getStarted}
            </AccountLink>
          </FooterColumn>

          <FooterColumn title={footer.company}>
            <li className="text-callout text-ink-2">{site.company}</li>
            <li className="text-callout text-ink-2">{footer.madeIn}</li>
          </FooterColumn>
        </div>

        {/* The name, oversized and fading into the page */}
        <p
          aria-hidden
          className="pointer-events-none -mb-[0.12em] bg-linear-to-b from-brand-200 via-brand-100 to-surface bg-clip-text px-3 text-center text-mega whitespace-nowrap text-transparent select-none"
        >
          {site.name}
        </p>

        <div className="relative flex flex-col gap-3 border-t border-line px-5 py-6 text-footnote text-ink-3 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>
            {t.common.copyright(new Date().getFullYear())} · {footer.builtFor}
          </p>
          <a
            href={`#${MAIN_CONTENT_ID}`}
            className="group inline-flex items-center gap-2 self-start rounded-full border border-line-strong bg-surface py-1.5 pr-3.5 pl-2 font-medium text-ink-2 transition-colors hover:border-brand-300 hover:text-brand-700 sm:self-auto"
          >
            <span className="flex size-6 items-center justify-center rounded-full bg-brand-600 text-white transition-transform group-hover:-translate-y-0.5">
              <ArrowUp className="size-3.5" aria-hidden />
            </span>
            {footer.backToTop}
          </a>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: ReactNode }) {
  return (
    <nav aria-label={title} className="flex flex-col gap-4">
      <p className="text-headline text-ink">{title}</p>
      <ul className="flex flex-col gap-3">{children}</ul>
    </nav>
  );
}

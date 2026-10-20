"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { OWNER_HOME, routes } from "@/config/routes";
import { useCopy } from "@/content";
import { registrationStatus } from "@/domain/registration";
import { useSession } from "@/features/auth/queries";

/**
 * Where the home page's account links lead, by who is looking. The home page is open to
 * everyone, so an owner who is already signed in sees a way back into the app instead of
 * "Sign in" and "Get started":
 * - signed out: sign in, or start registration (the page as it is rendered)
 * - registration complete: open the dashboard
 * - registration part-way: continue registration
 */
function useAccountState() {
  const { data: session } = useSession();
  return registrationStatus(session);
}

/**
 * `start` is a "Get started" link; `signIn` a "Sign in" link, which is hidden once signed in
 * (the `start` link beside it already leads into the app). `children` is the signed-out
 * content; signed in, the label changes and `arrow` adds a trailing arrow.
 * Works inside `<Button asChild>`: styling props are passed through to the link. `listItem`
 * wraps it in an `<li>`, so a hidden link leaves no empty item behind.
 */
export function AccountLink({
  intent,
  arrow = false,
  listItem = false,
  children,
  ...props
}: Omit<ComponentProps<typeof Link>, "href"> & {
  intent: "start" | "signIn";
  arrow?: boolean;
  listItem?: boolean;
  children: ReactNode;
}) {
  const nav = useCopy().home.nav;
  const state = useAccountState();

  let link: ReactNode;
  if (state === "unverified") {
    link = (
      <Link href={intent === "start" ? routes.register : routes.login} {...props}>
        {children}
      </Link>
    );
  } else if (intent === "signIn") {
    return null;
  } else {
    link = (
      <Link href={state === "complete" ? OWNER_HOME : routes.setup} {...props}>
        {state === "complete" ? nav.openDashboard : nav.continueRegistration}
        {arrow && <ArrowRight />}
      </Link>
    );
  }
  return listItem ? <li>{link}</li> : link;
}

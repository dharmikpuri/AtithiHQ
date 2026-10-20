"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { ErrorState } from "@/components/ui/error-state";
import { routes } from "@/config/routes";
import { registrationStatus } from "@/domain/registration";
import { takeSignOutDestination, useSession } from "@/features/auth/queries";
import { BottomNav } from "./bottom-nav";
import { SideNav } from "./side-nav";
import { Splash } from "./splash";

/**
 * Frame for every signed-in owner screen.
 * Sends signed-out visitors to login, and owners whose registration is incomplete
 * (details or consent missing) to the registration form. Nothing renders until it is complete.
 */
export function OwnerShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { data: session, isPending, isError, refetch } = useSession();

  const needsLogin = !isPending && !isError && !session;
  const needsSetup = Boolean(session) && registrationStatus(session) === "incomplete";

  useEffect(() => {
    // Just signed out: go where the log-out dialog chose (e.g. registration after deleting a test account).
    if (needsLogin) router.replace(takeSignOutDestination() ?? routes.login);
    else if (needsSetup) router.replace(routes.setup);
  }, [needsLogin, needsSetup, router]);

  if (isError) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <ErrorState onRetry={() => refetch()} />
      </div>
    );
  }
  if (isPending || needsLogin || needsSetup) return <Splash />;

  return (
    <div className="min-h-dvh md:pl-24 lg:pl-[264px]">
      <SideNav />
      <main className="pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-12">{children}</main>
      <BottomNav />
    </div>
  );
}

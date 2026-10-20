"use client";

import { ChevronsUpDown, LogOut, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ActionMenu } from "@/components/ui/action-menu";
import { Avatar } from "@/components/ui/avatar";
import { routes } from "@/config/routes";
import { useCopy } from "@/content";
import { LogoutDialog } from "@/features/auth/logout-dialog";
import { useSession } from "@/features/auth/queries";
import { cn } from "@/lib/cn";
import { formatPhone } from "@/lib/phone";

/**
 * The signed-in owner's menu: Settings and Log out.
 * - `avatar`: a round button with the owner's initials (phone top bar, tablet rail).
 * - `sidebar`: name and number, for the bottom of the desktop sidebar.
 * A dropdown from tablet up, an action sheet on phones.
 */
export function AccountMenu({ variant = "avatar", className }: { variant?: "avatar" | "sidebar"; className?: string }) {
  const t = useCopy();
  const router = useRouter();
  const [confirmingLogout, setConfirmingLogout] = useState(false);
  // Reads the session without asserting it: during sign-out it is briefly empty.
  const { data: session } = useSession();
  if (!session?.property) return null;

  const name = session.owner.name || session.property.name;
  const trigger =
    variant === "sidebar" ? (
      <button
        type="button"
        aria-label={t.auth.account.open}
        className={cn(
          "flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors outline-none hover:bg-ink/4 focus-visible:ring-2 focus-visible:ring-brand-500",
          className,
        )}
      >
        <Avatar name={name} size="sm" tone="brand" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-subhead font-semibold text-ink">{session.owner.name}</span>
          <span className="block truncate text-footnote text-ink-3 tabular">{formatPhone(session.owner.phone)}</span>
        </span>
        <ChevronsUpDown className="size-4 shrink-0 text-ink-3" aria-hidden />
      </button>
    ) : (
      <button
        type="button"
        aria-label={t.auth.account.open}
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-full transition-transform outline-none focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-95",
          className,
        )}
      >
        <Avatar name={name} size="sm" tone="brand" className="ring-2 ring-surface" />
      </button>
    );

  return (
    <>
      <ActionMenu
        title={t.auth.account.signedInAs(name)}
        trigger={trigger}
        items={[
          { label: t.common.nav.settings, icon: Settings, onSelect: () => router.push(routes.settings) },
          { label: t.auth.logout.label, icon: LogOut, tone: "danger", onSelect: () => setConfirmingLogout(true) },
        ]}
      />
      <LogoutDialog open={confirmingLogout} onOpenChange={setConfirmingLogout} />
    </>
  );
}

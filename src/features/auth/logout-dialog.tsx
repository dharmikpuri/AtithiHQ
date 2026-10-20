"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { AlertDialog } from "radix-ui";
import { useState } from "react";
import { toast } from "sonner";
import { PropertyIllustration } from "@/components/brand/property-illustration";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { IconTile } from "@/components/ui/icon-tile";
import { Notice } from "@/components/ui/notice";
import { RadioCards } from "@/components/ui/radio-cards";
import { routes } from "@/config/routes";
import { useCopy } from "@/content";
import { isPropertyType } from "@/domain/property-types";
import { registrationStatus } from "@/domain/registration";
import { demo } from "@/lib/api";
import { formatPhone } from "@/lib/phone";
import { useLogout, useSession } from "./queries";

type LogoutChoice = "keep" | "erase";

/**
 * "Log out of AtithiHQ?" — the one confirmation used everywhere an owner can sign out
 * (account menu, Settings, the registration form). It shows which account is signed in and, in
 * the demo build, offers to reset the demo or delete the test account so a number can be reused
 * from scratch. On success it hands over to the sign-in page (or registration, after a delete).
 */
export function LogoutDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const t = useCopy();
  const copy = t.auth.logout;
  const router = useRouter();
  const logout = useLogout();
  const { data: session } = useSession();
  const [choice, setChoice] = useState<LogoutChoice>("keep");

  const owner = session?.owner;
  const property = session?.property;
  const isDemoNumber = owner?.phone === demo.ownerPhone;
  const erase = demo.enabled && choice === "erase";
  const unfinished = registrationStatus(session) === "incomplete";
  // Stays busy until the next page takes over.
  const busy = logout.isPending || logout.isSuccess;

  const confirmLabel = !erase
    ? copy.dialog.confirmKeep
    : isDemoNumber
      ? copy.dialog.confirmReset
      : copy.dialog.confirmDelete;
  const eraseOption = isDemoNumber ? copy.dialog.resetDemo : copy.dialog.deleteAccount;

  function handleOpenChange(next: boolean) {
    if (busy) return;
    if (!next) setChoice("keep");
    onOpenChange(next);
  }

  function confirm() {
    // After deleting a test account, go straight to registration so it can be tested again.
    const redirectTo = erase && !isDemoNumber ? routes.register : routes.login;
    logout.mutate(
      { erase, redirectTo },
      {
        onSuccess: () => {
          if (!erase) toast.success(copy.done);
          else toast.success(isDemoNumber ? copy.dialog.doneReset : copy.dialog.doneDeleted);
          router.replace(redirectTo);
        },
        onError: () => toast.error(t.common.states.errorBody),
      },
    );
  }

  return (
    <AlertDialog.Root open={open} onOpenChange={handleOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-[60] bg-brand-950/45 backdrop-blur-[2px] data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in" />
        <AlertDialog.Content className="fixed top-1/2 left-1/2 z-[60] max-h-[calc(100dvh-2rem)] w-[calc(100%-2.5rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl bg-surface p-5 shadow-pop outline-none data-[state=closed]:animate-pop-out data-[state=open]:animate-pop-in sm:p-6">
          <div className="flex items-start gap-3.5">
            <IconTile icon={LogOut} tone="brand" size="lg" />
            <div className="min-w-0 flex-1">
              <AlertDialog.Title className="text-title-3 break-words text-ink">{copy.confirm.title}</AlertDialog.Title>
              <AlertDialog.Description className="mt-1.5 text-callout leading-6 text-ink-2">
                {copy.confirm.body}
              </AlertDialog.Description>
            </div>
          </div>

          {owner && (
            <div className="mt-5 flex min-w-0 flex-col gap-3 rounded-2xl border border-line bg-subtle p-3.5">
              <div className="flex min-w-0 items-center gap-3">
                <Avatar name={owner.name} tone="brand" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-body font-semibold text-ink">{owner.name || copy.dialog.newAccount}</p>
                  <p className="truncate text-subhead text-ink-3 tabular">{formatPhone(owner.phone)}</p>
                </div>
              </div>
              {property && (
                <div className="flex min-w-0 items-center gap-3 border-t border-line pt-3">
                  <PropertyIllustration
                    type={isPropertyType(property.type) ? property.type : "homestay"}
                    framed={false}
                    className="size-10"
                  />
                  <p className="min-w-0 flex-1 truncate text-subhead font-medium text-ink-2">{property.name}</p>
                </div>
              )}
              {unfinished && <p className="text-subhead text-ink-3">{copy.dialog.registrationPending}</p>}
            </div>
          )}

          {demo.enabled && (
            <div className="mt-5 flex flex-col gap-2.5">
              <p className="text-footnote font-semibold tracking-wider text-ink-3 uppercase">
                {copy.dialog.testingLabel}
              </p>
              <RadioCards<LogoutChoice>
                aria-label={copy.dialog.optionsLabel}
                value={choice}
                onChange={setChoice}
                options={[
                  { value: "keep", label: copy.dialog.keep.label, description: copy.dialog.keep.description },
                  { value: "erase", label: eraseOption.label, description: eraseOption.description },
                ]}
              />
              {erase && !isDemoNumber && (
                <Notice tone="warning" role="status">
                  {copy.dialog.deleteWarning}
                </Notice>
              )}
            </div>
          )}

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <AlertDialog.Cancel asChild>
              <Button variant="secondary" size="lg" className="sm:h-11 sm:text-callout" disabled={busy}>
                {copy.confirm.cancel}
              </Button>
            </AlertDialog.Cancel>
            <Button variant="danger" size="lg" className="sm:h-11 sm:text-callout" loading={busy} onClick={confirm}>
              {confirmLabel}
            </Button>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}

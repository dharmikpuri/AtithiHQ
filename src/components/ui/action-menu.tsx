"use client";

import type { LucideIcon } from "lucide-react";
import { DropdownMenu, Slot } from "radix-ui";
import { useState, type ReactElement } from "react";
import { Drawer } from "vaul";
import { cn } from "@/lib/cn";
import { useIsDesktopLayout } from "@/lib/hooks/use-media-query";

export interface ActionMenuItem {
  label: string;
  icon?: LucideIcon;
  onSelect: () => void;
  tone?: "default" | "danger";
  disabled?: boolean;
}

interface ActionMenuProps {
  /** The button that opens the menu. */
  trigger: ReactElement;
  items: ActionMenuItem[];
  /** Heading of the sheet on phones; also the accessible name. */
  title: string;
}

/** Overflow actions: a dropdown on larger screens, an action sheet on phones. */
export function ActionMenu({ trigger, items, title }: ActionMenuProps) {
  const isDesktop = useIsDesktopLayout();
  const [open, setOpen] = useState(false);

  // Run the action after the menu has closed, so any dialog it opens
  // receives focus cleanly.
  const select = (item: ActionMenuItem) => {
    setOpen(false);
    window.setTimeout(item.onSelect, isDesktop ? 0 : 180);
  };

  if (isDesktop) {
    return (
      <DropdownMenu.Root open={open} onOpenChange={setOpen}>
        <DropdownMenu.Trigger asChild>{trigger}</DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            sideOffset={6}
            aria-label={title}
            className="z-50 min-w-52 rounded-2xl border border-line bg-surface p-1.5 shadow-pop data-[state=open]:animate-fade-in"
          >
            {items.map((item) => (
              <DropdownMenu.Item
                key={item.label}
                disabled={item.disabled}
                onSelect={() => select(item)}
                className={cn(
                  "flex h-11 cursor-pointer items-center gap-3 rounded-xl px-3 text-callout font-medium outline-none data-[disabled]:opacity-40 data-[highlighted]:bg-canvas",
                  item.tone === "danger" ? "text-danger-600" : "text-ink",
                )}
              >
                {item.icon && <item.icon className="size-4.5 shrink-0 opacity-80" aria-hidden />}
                {item.label}
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    );
  }

  return (
    <>
      <Slot.Root onClick={() => setOpen(true)} aria-haspopup="dialog" aria-expanded={open}>
        {trigger}
      </Slot.Root>
      <Drawer.Root open={open} onOpenChange={setOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-50 bg-brand-950/40" />
          <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-[28px] bg-surface pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-pop outline-none">
            <div aria-hidden className="mx-auto mt-2.5 h-1.5 w-10 rounded-full bg-ink/15" />
            <Drawer.Title className="px-5 pt-4 pb-2 text-subhead font-medium text-ink-3">{title}</Drawer.Title>
            <Drawer.Description className="sr-only">{title}</Drawer.Description>
            <ul className="px-2 pb-1">
              {items.map((item) => (
                <li key={item.label}>
                  <button
                    type="button"
                    disabled={item.disabled}
                    onClick={() => select(item)}
                    className={cn(
                      "flex h-14 w-full items-center gap-4 rounded-2xl px-3 text-left text-body font-medium active:bg-canvas disabled:opacity-40",
                      item.tone === "danger" ? "text-danger-600" : "text-ink",
                    )}
                  >
                    {item.icon && <item.icon className="size-5 shrink-0 opacity-80" aria-hidden />}
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  );
}

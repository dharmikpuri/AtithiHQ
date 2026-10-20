"use client";

import { CircleAlert, CircleCheck, Info } from "lucide-react";
import { Toaster as Sonner } from "sonner";

/** App-wide toasts. Top of the screen so they never cover bottom navigation. */
export function Toaster() {
  return (
    <Sonner
      position="top-center"
      offset={{ top: "calc(env(safe-area-inset-top) + 12px)" }}
      mobileOffset={{ top: "calc(env(safe-area-inset-top) + 10px)", left: "12px", right: "12px" }}
      gap={8}
      visibleToasts={3}
      icons={{
        success: <CircleCheck className="size-5 text-success-500" aria-hidden />,
        error: <CircleAlert className="size-5 text-danger-500" aria-hidden />,
        info: <Info className="size-5 text-brand-300" aria-hidden />,
      }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "flex w-full items-center gap-3 rounded-2xl bg-brand-950 px-4 py-3.5 text-callout font-medium text-white shadow-pop sm:w-[380px]",
          title: "leading-5",
          description: "mt-0.5 text-subhead font-normal text-white/70",
          actionButton:
            "ml-auto shrink-0 rounded-lg bg-white/10 px-3 py-1.5 text-subhead font-semibold text-white hover:bg-white/20",
          icon: "shrink-0",
        },
      }}
    />
  );
}

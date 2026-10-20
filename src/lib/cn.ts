import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * Teaches tailwind-merge about the custom tokens defined in `globals.css`.
 * Without this, `cn("text-body", "text-ink")` could drop one of the two classes,
 * because both start with `text-`.
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: [
        "micro",
        "caption",
        "footnote",
        "subhead",
        "callout",
        "body",
        "lead",
        "headline",
        "title-3",
        "title-2",
        "title-1",
        "large-title",
        "display",
        "display-lg",
        "display-xl",
        "mega",
      ],
      shadow: ["card", "raised", "pop", "fab", "glow"],
      animate: [
        "fade-in",
        "fade-out",
        "pop-in",
        "pop-out",
        "rise-in",
        "float",
        "draw",
        "pulse-ring",
        "enter",
        "tick",
        "fill",
        "guest-drop",
        "guest-hop",
        "dash-flow",
        "type",
        "scan",
        "shine",
        "loader-roof",
        "loader-guest",
        "loader-dot",
      ],
      ease: ["out-soft"],
    },
  },
});

/** Merges class names and resolves conflicting Tailwind utilities. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

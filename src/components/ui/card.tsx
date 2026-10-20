import { cva } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

/**
 * The standard surface for anything card-like: white, hairline border, soft shadow.
 * Use it for list rows, tiles and panels so every card in the app changes together.
 * `cn(surfaceStyles({ radius: "xl" }), "p-4")`
 */
export const surfaceStyles = cva("border border-line bg-surface", {
  variants: {
    radius: { md: "rounded-xl", lg: "rounded-2xl", xl: "rounded-3xl" },
    elevation: { none: "", card: "shadow-card", raised: "shadow-raised", glow: "shadow-glow" },
  },
  defaultVariants: { radius: "lg", elevation: "card" },
});

export function Card({ className, ...props }: ComponentProps<"section">) {
  return <section className={cn(surfaceStyles(), className)} {...props} />;
}

import type { Metadata } from "next";
import { OwnerShell } from "@/components/layout/owner-shell";
import { PRIVATE_ROBOTS } from "@/lib/seo/metadata";

export const metadata: Metadata = { robots: PRIVATE_ROBOTS };

export default function OwnerLayout({ children }: LayoutProps<"/">) {
  return <OwnerShell>{children}</OwnerShell>;
}

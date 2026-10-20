import type { Metadata } from "next";
import { routes } from "@/config/routes";
import { getCopy } from "@/content";
import { HomePage } from "@/features/home/home-page";
import { publicPageMetadata } from "@/lib/seo/metadata";

const { meta } = getCopy().home;

export const metadata: Metadata = publicPageMetadata({
  title: meta.title,
  description: meta.description,
  path: routes.home,
  absoluteTitle: true,
});

/** Public home page. Signed-in owners are sent straight to their bookings by `proxy.ts`. */
export default function Page() {
  return <HomePage />;
}

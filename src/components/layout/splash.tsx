import { BrandLoader } from "@/components/brand/brand-loader";
import { getCopy } from "@/content";

/** Full-screen loading: while the session is checked, or a page is on its way. */
export function Splash() {
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <BrandLoader label={getCopy().common.states.loading} />
    </div>
  );
}

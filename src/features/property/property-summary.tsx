import { PropertyIllustration } from "@/components/brand/property-illustration";
import { getCopy } from "@/content";
import type { PropertyProfile } from "@/domain/profiles";
import { cn } from "@/lib/cn";

/**
 * The property at a glance: its illustration, name, kind and area.
 * `compact` for tight spots like the sidebar; the default for Settings.
 */
export function PropertySummary({
  profile,
  compact = false,
  className,
}: {
  profile: PropertyProfile;
  compact?: boolean;
  className?: string;
}) {
  const type = getCopy().common.propertyTypes[profile.type];
  return (
    <div className={cn("flex min-w-0 items-center", compact ? "gap-3" : "gap-4", className)}>
      <PropertyIllustration type={profile.type} className={compact ? "size-11" : "size-16"} />
      <div className="min-w-0">
        <p className={cn("truncate font-semibold text-ink", compact ? "text-callout" : "text-headline")}>
          {profile.name}
        </p>
        <p className={cn("truncate text-ink-3", compact ? "text-footnote" : "text-subhead")}>
          {type.label} · {profile.address.locality}
        </p>
      </div>
    </div>
  );
}

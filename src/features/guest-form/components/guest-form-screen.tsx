"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useCopy } from "@/content";
import type { GuestLinkView } from "@/domain/read-models";
import { isApiError } from "@/lib/api";
import { initialDraft, toSubmissionGuest, type GuestDraft } from "../draft";
import { useGuestLink, useSubmitGuestDetails } from "../queries";
import { DoneStep } from "./done-step";
import { GuestShell } from "./guest-shell";
import { IdStep } from "./id-step";
import { LinkUnavailable } from "./link-unavailable";
import { OthersStep } from "./others-step";
import type { StepFrameProps } from "./step-frame";
import { WelcomeStep } from "./welcome-step";
import { YouStep } from "./you-step";

type Step = "welcome" | "you" | "others" | "id" | "done";
const STEPS: Step[] = ["welcome", "you", "others", "id", "done"];

/** The public guest form at `/g/<token>`. No login: the link is the credential. */
export function GuestFormScreen({ token }: { token: string }) {
  const { data: view, isPending, isError, error, refetch } = useGuestLink(token);

  if (isPending) return <LoadingShell />;
  if (isError) {
    if (isApiError(error, "not_found")) return <LinkUnavailable reason="not_found" />;
    return (
      <GuestShell>
        <ErrorState onRetry={() => refetch()} className="my-auto" />
      </GuestShell>
    );
  }
  if (view.state !== "active") return <LinkUnavailable reason={view.state} view={view} />;
  return <GuestFlow view={view} token={token} />;
}

function GuestFlow({ view, token }: { view: GuestLinkView; token: string }) {
  const t = useCopy();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const preview = searchParams.get("preview") === "1";
  const requested = searchParams.get("step") as Step | null;
  const submit = useSubmitGuestDetails(token);

  const [draft, setDraft] = useState<GuestDraft>(() => initialDraft(view));
  // Steps only make sense after "Start" in this visit; a reload mid-way starts over.
  const [started, setStarted] = useState(false);
  const step: Step =
    requested && STEPS.includes(requested) && (started || (requested === "done" && view.submittedGuests.length > 0))
      ? requested
      : "welcome";

  const idEnabled = view.property.idRequirement !== "off";
  const hasOthers = view.stay.guestCount > 1 || draft.companions.length > 0;
  const flow: Step[] = ["you", ...(hasOthers ? (["others"] as const) : []), ...(idEnabled ? (["id"] as const) : [])];

  const hrefFor = (next: Step) => {
    const params = new URLSearchParams();
    if (preview) params.set("preview", "1");
    const from = searchParams.get("from");
    if (from) params.set("from", from);
    if (next !== "welcome") params.set("step", next);
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  };

  useEffect(() => {
    if (requested && requested !== step) router.replace(hrefFor(step), { scroll: false });
    // hrefFor is derived from the same params; re-running on step change is enough.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requested, step]);

  const goTo = (next: Step) => router.push(hrefFor(next));
  const nextAfter = (current: Step): Step | null => flow[flow.indexOf(current) + 1] ?? null;

  function send(nextDraft: GuestDraft) {
    submit.mutate(
      { guests: [nextDraft.lead, ...nextDraft.companions].map((guest) => toSubmissionGuest(guest, idEnabled)) },
      {
        onSuccess: () => router.replace(hrefFor("done")),
        onError: () => toast.error(t.guestForm.submitError),
      },
    );
  }

  function advance(current: Step, nextDraft = draft) {
    const next = nextAfter(current);
    if (next) goTo(next);
    else send(nextDraft);
  }

  const ctaFor = (current: Step) => (nextAfter(current) ? t.guestForm.continue : t.guestForm.submit);
  const frame = (current: Step): StepFrameProps => ({
    propertyName: view.property.name,
    progress: { step: flow.indexOf(current) + 1, total: flow.length },
    onBack: () => router.back(),
    preview,
  });

  switch (step) {
    case "welcome":
      return (
        <WelcomeStep
          view={view}
          preview={preview}
          onStart={() => {
            setStarted(true);
            goTo("you");
          }}
        />
      );
    case "you":
      return (
        <YouStep
          frame={frame("you")}
          lead={draft.lead}
          ctaLabel={ctaFor("you")}
          onSave={(lead) => {
            const nextDraft = { ...draft, lead };
            setDraft(nextDraft);
            advance("you", nextDraft);
          }}
        />
      );
    case "others":
      return (
        <OthersStep
          frame={frame("others")}
          guestCount={view.stay.guestCount}
          leadNationality={draft.lead.nationality}
          companions={draft.companions}
          onChange={(companions) => setDraft((current) => ({ ...current, companions }))}
          onContinue={() => advance("others")}
          ctaLabel={ctaFor("others")}
          submitting={submit.isPending}
        />
      );
    case "id":
      return (
        <IdStep
          frame={frame("id")}
          requirement={view.property.idRequirement === "required" ? "required" : "optional"}
          retentionLabel={t.guestForm.retention(view.property.documentRetentionDays)}
          guests={[draft.lead, ...draft.companions]}
          onChange={(guest) =>
            setDraft((current) =>
              guest.key === current.lead.key
                ? { ...current, lead: guest }
                : { ...current, companions: current.companions.map((item) => (item.key === guest.key ? guest : item)) },
            )
          }
          onSubmit={() => send(draft)}
          submitting={submit.isPending}
        />
      );
    case "done":
      return (
        <DoneStep
          view={view}
          preview={preview}
          onEdit={() => {
            setDraft(initialDraft(view));
            setStarted(true);
            goTo("you");
          }}
        />
      );
  }
}

function LoadingShell() {
  return (
    <GuestShell bare>
      <div aria-hidden className="flex flex-col items-center gap-4 pt-10">
        <Skeleton className="h-24 w-60 rounded-2xl" />
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-28" />
      </div>
      <div aria-hidden className="mt-10 flex flex-col gap-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="mt-4 h-36 w-full rounded-2xl" />
      </div>
    </GuestShell>
  );
}

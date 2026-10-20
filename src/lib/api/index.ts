/**
 * The single place the UI gets its backend from.
 *
 * To connect the real backend: implement `AtithiApi` with HTTP calls
 * (e.g. `src/lib/api/http-api.ts`) and export it here instead of `mockApi`.
 */
import { mockApi } from "@/lib/mock/mock-api";
import { DEMO_OWNER_PHONE } from "@/lib/mock/seed";
import { onStoreChangedElsewhere } from "@/lib/mock/store";
import type { AtithiApi } from "./contract";

export const api: AtithiApi = mockApi;

/** Demo helpers shown on the login screen. Disable when the real backend is connected. */
export const demo = { enabled: true, ownerPhone: DEMO_OWNER_PHONE } as const;

/**
 * Demo build only: runs `listener` when another tab of this browser changes the saved mock data, so the
 * screens can refresh. A real backend has no such hook; delete this with the mock.
 */
export const onExternalChange: (listener: () => void) => () => void = onStoreChangedElsewhere;

export * from "./contract";
export { queryKeys } from "./query-keys";

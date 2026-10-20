/**
 * All user-facing text lives in `src/content/<locale>/`.
 *
 * Only English exists today. To add Hindi: create `src/content/hi/` with the
 * same shape (TypeScript will flag anything missing), then pick the
 * dictionary from the user's language inside `useCopy` / `getCopy`.
 */
import { en } from "./en";

export type Copy = typeof en;

/** For code outside React (validation schemas, share messages). */
export function getCopy(): Copy {
  return en;
}

/** For components. Returns the dictionary for the current language. */
export function useCopy(): Copy {
  return en;
}

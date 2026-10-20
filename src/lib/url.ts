/**
 * `pathname?query` with some parameters changed and every other one kept,
 * so tabs, search, sort and filters never wipe each other out.
 * Pass `undefined` (or "") to remove a parameter.
 */
export function withParams(
  pathname: string,
  current: { toString(): string },
  updates: Record<string, string | undefined>,
): string {
  const params = new URLSearchParams(current.toString());
  for (const [key, value] of Object.entries(updates)) {
    if (value) params.set(key, value);
    else params.delete(key);
  }
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

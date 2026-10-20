/**
 * Name of the cookie that marks a signed-in owner.
 * Shared by the browser (mock auth) and `src/proxy.ts` (route protection).
 * With a real backend this becomes an httpOnly cookie set by the server.
 */
export const SESSION_COOKIE = "atithi_session";

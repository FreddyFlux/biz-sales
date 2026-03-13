/**
 * Auth layer - isolated for future Azure/SharePoint migration.
 * Only this module should import from @neondatabase/auth.
 */
import { neonAuth } from "@neondatabase/auth/next/server";
import type { AppUser } from "./types";

export { authApiHandler, neonAuthMiddleware } from "@neondatabase/auth/next/server";

/**
 * Get current user or null. Use this everywhere instead of raw auth.
 */
export async function getCurrentUser(): Promise<AppUser | null> {
  const { user } = await neonAuth();
  if (!user) return null;
  return {
    id: user.id,
    email: user.email ?? null,
  };
}

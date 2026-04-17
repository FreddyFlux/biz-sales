"use client";

/**
 * Client-side auth. Isolated for future migration.
 *
 * Password reset: `requestPasswordReset` / `resetPassword` use `redirectTo` URLs that must be
 * allowed in Neon Console → Auth → Configuration → Domains (production hosts), or reset emails
 * will not redirect correctly. Localhost is pre-allowed for development.
 *
 * @see https://neon.com/docs/auth/guides/configure-domains
 */
import { createAuthClient } from "@neondatabase/auth/next";

export const authClient = createAuthClient();

"use client";

/**
 * Client-side auth. Isolated for future migration.
 */
import { createAuthClient } from "@neondatabase/auth/next";

export const authClient = createAuthClient();

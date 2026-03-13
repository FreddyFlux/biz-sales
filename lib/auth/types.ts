/**
 * App-level user type. Isolated from auth provider.
 * Swap Neon Auth for Azure/SharePoint later by only changing lib/auth.
 */
export type AppUser = {
  id: string;
  email: string | null;
};

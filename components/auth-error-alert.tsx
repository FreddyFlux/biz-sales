"use client";

import Link from "next/link";
import type { AuthErrorInfo } from "@/lib/auth/auth-errors";
import { cn } from "@/lib/utils";

interface AuthErrorAlertProps {
  error: AuthErrorInfo;
  className?: string;
  /** Show "Sign in" link when user already exists (signup page) */
  showSignInLink?: boolean;
  /** Show "Sign up" link for invalid credentials (login page) */
  showSignUpLink?: boolean;
}

export function AuthErrorAlert({
  error,
  className,
  showSignInLink,
  showSignUpLink,
}: AuthErrorAlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        "rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm",
        "dark:border-destructive/40 dark:bg-destructive/10",
        className
      )}
    >
      <p className="font-medium text-destructive">{error.title}</p>
      <p className="mt-1 text-muted-foreground">{error.message}</p>
      {error.hint && (
        <p className="mt-2 text-muted-foreground/90">{error.hint}</p>
      )}
      {(showSignInLink || showSignUpLink) && (
        <p className="mt-3">
          {showSignInLink && (
            <Link
              href="/login"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Sign in to your account →
            </Link>
          )}
          {showSignUpLink && (
            <Link
              href="/signup"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Create an account →
            </Link>
          )}
        </p>
      )}
    </div>
  );
}

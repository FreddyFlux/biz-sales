"use client";

import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth/client";
import { parseRequestPasswordResetError } from "@/lib/auth/auth-errors";
import { AuthErrorAlert } from "@/components/auth-error-alert";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<{ message?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const redirectTo = `${window.location.origin}/reset-password`;
      const { error: err } = await authClient.requestPasswordReset({
        email,
        redirectTo,
      });
      if (err) {
        setError(err);
        return;
      }
      setSubmitted(true);
    } catch (thrown) {
      setError(
        thrown instanceof Error ? thrown : { message: "Something went wrong" }
      );
    } finally {
      setLoading(false);
    }
  }

  const errorInfo = parseRequestPasswordResetError(error);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6 rounded-lg border bg-card p-6">
        <h1 className="text-xl font-semibold">Forgot password</h1>
        {submitted ? (
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>
              If an account exists for that email, we sent a link to reset your
              password. Check your inbox and spam folder.
            </p>
            <p>
              <Link
                href="/login"
                className="font-medium text-primary hover:underline"
              >
                Back to sign in
              </Link>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Enter your email and we&apos;ll send you a reset link if an account
              exists.
            </p>
            <div>
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              />
            </div>
            {errorInfo && <AuthErrorAlert error={errorInfo} />}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending..." : "Send reset link"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              <Link
                href="/login"
                className="font-medium text-primary hover:underline"
              >
                Back to sign in
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

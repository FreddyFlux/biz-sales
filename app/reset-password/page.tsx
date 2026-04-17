"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import type { AuthErrorInfo } from "@/lib/auth/auth-errors";
import { parseResetPasswordError } from "@/lib/auth/auth-errors";
import { AuthErrorAlert } from "@/components/auth-error-alert";
import { Button } from "@/components/ui/button";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const urlError = searchParams.get("error");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<{ message?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  if (urlError === "INVALID_TOKEN") {
    return (
      <div className="space-y-4 text-sm">
        <p className="text-muted-foreground">
          This reset link is invalid or has expired. Request a new one below.
        </p>
        <p>
          <Link
            href="/forgot-password"
            className="font-medium text-primary hover:underline"
          >
            Request a new reset link
          </Link>
        </p>
        <p>
          <Link
            href="/login"
            className="text-muted-foreground hover:underline"
          >
            Back to sign in
          </Link>
        </p>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="space-y-4 text-sm text-muted-foreground">
        <p>Missing reset token. Open the link from your email, or request a new reset.</p>
        <p>
          <Link
            href="/forgot-password"
            className="font-medium text-primary hover:underline"
          >
            Forgot password
          </Link>
        </p>
      </div>
    );
  }

  const resetToken = token;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError({ message: "Passwords do not match" });
      return;
    }
    setLoading(true);
    try {
      const { error: err } = await authClient.resetPassword({
        newPassword: password,
        token: resetToken,
      });
      if (err) {
        setError(err);
        return;
      }
      router.push("/login");
      router.refresh();
    } catch (thrown) {
      setError(
        thrown instanceof Error ? thrown : { message: "Reset failed" }
      );
    } finally {
      setLoading(false);
    }
  }

  const mismatch: AuthErrorInfo = {
    type: "unknown",
    title: "Passwords do not match",
    message: "Enter the same password in both fields.",
    hint: undefined,
  };

  const errorInfo = error?.message?.includes("do not match")
    ? mismatch
    : parseResetPasswordError(error);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="password" className="text-sm font-medium">
          New password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
          className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label htmlFor="confirm" className="text-sm font-medium">
          Confirm password
        </label>
        <input
          id="confirm"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
          className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
        />
      </div>
      {errorInfo && <AuthErrorAlert error={errorInfo} />}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Updating..." : "Set new password"}
      </Button>
    </form>
  );
}

function ResetPasswordFallback() {
  return (
    <p className="text-sm text-muted-foreground">Loading...</p>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6 rounded-lg border bg-card p-6">
        <h1 className="text-xl font-semibold">Set new password</h1>
        <Suspense fallback={<ResetPasswordFallback />}>
          <ResetPasswordForm />
        </Suspense>
        <p className="text-center text-sm text-muted-foreground">
          <Link href="/login" className="font-medium text-primary hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

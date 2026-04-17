"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import { parseSignInError } from "@/lib/auth/auth-errors";
import { AuthErrorAlert } from "@/components/auth-error-alert";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<{ message?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error: err } = await authClient.signIn.email({
        email,
        password,
      });
      if (err) {
        setError(err);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch (thrown) {
      setError(
        thrown instanceof Error ? thrown : { message: "Sign in failed" }
      );
    } finally {
      setLoading(false);
    }
  }

  const errorInfo = parseSignInError(error);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6 rounded-lg border bg-card p-6">
        <h1 className="text-xl font-semibold">Sign in</h1>
        <form onSubmit={handleSignIn} className="space-y-4">
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
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <a
                href="/forgot-password"
                className="text-sm font-medium text-primary hover:underline"
              >
                Forgot password?
              </a>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>
          {errorInfo && (
            <AuthErrorAlert
              error={errorInfo}
              showSignUpLink={errorInfo.type === "invalid_credentials"}
            />
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            No account?{" "}
            <a href="/signup" className="font-medium text-primary hover:underline">
              Sign up
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}

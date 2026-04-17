/**
 * Maps auth API errors to user-friendly messages and hints.
 * Better Auth returns generic "Invalid email or password" for login failures
 * (user not found, wrong password) for security - we provide helpful hints instead.
 */

export type AuthErrorType =
  | "user_already_exists"
  | "invalid_credentials"
  | "invalid_email"
  | "password_too_short"
  | "password_too_long"
  | "invalid_reset_token"
  | "unknown";

export interface AuthErrorInfo {
  title: string;
  message: string;
  hint?: string;
  type: AuthErrorType;
}

/**
 * Parse sign-up errors into user-friendly info.
 */
export function parseSignUpError(error: { message?: string } | null): AuthErrorInfo | null {
  if (!error?.message) return null;

  const msg = error.message.toLowerCase();

  if (
    msg.includes("user already exists") ||
    msg.includes("already exists") ||
    msg.includes("use another email")
  ) {
    return {
      type: "user_already_exists",
      title: "Account already exists",
      message: "An account with this email already exists.",
      hint: "Try signing in instead, or use a different email address.",
    };
  }

  if (msg.includes("invalid email")) {
    return {
      type: "invalid_email",
      title: "Invalid email",
      message: "Please enter a valid email address.",
      hint: undefined,
    };
  }

  if (msg.includes("password") && msg.includes("short")) {
    return {
      type: "password_too_short",
      title: "Password too short",
      message: error.message,
      hint: undefined,
    };
  }

  if (msg.includes("password") && msg.includes("long")) {
    return {
      type: "password_too_long",
      title: "Password too long",
      message: error.message,
      hint: undefined,
    };
  }

  return {
    type: "unknown",
    title: "Sign up failed",
    message: error.message,
    hint: undefined,
  };
}

/**
 * Parse sign-in errors into user-friendly info.
 * Note: For security, the API returns the same "Invalid email or password"
 * for both "user not found" and "wrong password" - we provide a helpful hint.
 */
export function parseSignInError(error: { message?: string } | null): AuthErrorInfo | null {
  if (!error?.message) return null;

  const msg = error.message.toLowerCase();

  if (
    msg.includes("invalid email") ||
    msg.includes("invalid password") ||
    msg.includes("invalid email or password") ||
    msg.includes("invalid credentials")
  ) {
    return {
      type: "invalid_credentials",
      title: "Invalid email or password",
      message:
        "We couldn't sign you in. This could mean the email doesn't have an account, or the password is incorrect.",
      hint: "Double-check your email and password. If you don't have an account yet, sign up below.",
    };
  }

  return {
    type: "unknown",
    title: "Sign in failed",
    message: error.message,
    hint: "Please try again. If the problem persists, try signing up for a new account.",
  };
}

/**
 * Parse errors from requestPasswordReset (forgot-password).
 */
export function parseRequestPasswordResetError(
  error: { message?: string } | null
): AuthErrorInfo | null {
  if (!error?.message) return null;

  const msg = error.message.toLowerCase();

  if (msg.includes("invalid email")) {
    return {
      type: "invalid_email",
      title: "Invalid email",
      message: "Please enter a valid email address.",
      hint: undefined,
    };
  }

  return {
    type: "unknown",
    title: "Could not send reset link",
    message: error.message,
    hint: "Please try again in a few minutes.",
  };
}

/**
 * Parse errors from resetPassword (reset-password page).
 */
export function parseResetPasswordError(
  error: { message?: string } | null
): AuthErrorInfo | null {
  if (!error?.message) return null;

  const msg = error.message.toLowerCase();

  if (
    msg.includes("invalid token") ||
    msg.includes("expired") ||
    msg.includes("invalid_token")
  ) {
    return {
      type: "invalid_reset_token",
      title: "Link invalid or expired",
      message:
        "This reset link is no longer valid. Password reset links expire after a short time.",
      hint: "Request a new reset link from the forgot password page.",
    };
  }

  if (msg.includes("password") && msg.includes("short")) {
    return {
      type: "password_too_short",
      title: "Password too short",
      message: error.message,
      hint: undefined,
    };
  }

  if (msg.includes("password") && msg.includes("long")) {
    return {
      type: "password_too_long",
      title: "Password too long",
      message: error.message,
      hint: undefined,
    };
  }

  return {
    type: "unknown",
    title: "Could not reset password",
    message: error.message,
    hint: undefined,
  };
}

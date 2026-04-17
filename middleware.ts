import { neonAuthMiddleware } from "@/lib/auth/server";

export default neonAuthMiddleware({
  loginUrl: "/login",
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|login|signup|forgot-password|reset-password|api/auth|api/health|teams-config).*)",
  ],
};

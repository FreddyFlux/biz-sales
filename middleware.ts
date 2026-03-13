import { neonAuthMiddleware } from "@/lib/auth/server";

export default neonAuthMiddleware({
  loginUrl: "/login",
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|login|signup|api/auth|teams-config).*)",
  ],
};

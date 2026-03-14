import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/server";
import { DashboardNav } from "./dashboard-nav";
import { QueryProvider } from "./query-provider";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <QueryProvider>
    <div
      style={{
        minHeight: "100vh",
        background: "#060d1a",
        fontFamily: "var(--font-syne), 'Segoe UI', sans-serif",
        padding: "24px 18px 60px",
        color: "#ccdaf0",
      }}
    >
      <div
        style={{
          maxWidth: 660,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <header>
          <DashboardNav />
          <h1
            style={{
              fontSize: 24,
              fontWeight: 800,
              letterSpacing: "-0.04em",
              color: "#dce8f8",
            }}
          >
            Sales Tracker
          </h1>
        </header>
        {children}
      </div>
    </div>
    </QueryProvider>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard/daily-stats", label: "Daily stats" },
  { href: "/dashboard/statistics", label: "Statistics" },
] as const;

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <div
      style={{
        display: "flex",
        gap: 6,
        marginBottom: 8,
      }}
    >
      {navItems.map(({ href, label }) => {
        const isActive =
          pathname === href ||
          (href === "/dashboard/daily-stats" && pathname === "/dashboard");
        return (
          <Link
            key={href}
            href={href}
            style={{
              padding: "6px 12px",
              fontSize: 11,
              fontWeight: 600,
              fontFamily: "var(--font-dm-mono), monospace",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: isActive ? "#4f8fff" : "#49679a",
              background: isActive ? "#4f8fff15" : "transparent",
              border: `1px solid ${isActive ? "#4f8fff40" : "#1a2840"}`,
              borderRadius: 8,
              textDecoration: "none",
              transition: "all 0.15s ease",
            }}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}

"use client";

import dynamic from "next/dynamic";

const StatisticsClient = dynamic(
  () => import("./statistics-client").then((m) => m.StatisticsClient),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          minHeight: 200,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#8aa0c0",
          fontFamily: "var(--font-dm-mono), monospace",
          fontSize: 14,
        }}
      >
        Loading statistics…
      </div>
    ),
  }
);

export function StatisticsPageClient() {
  return <StatisticsClient />;
}

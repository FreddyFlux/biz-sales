"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Activity } from "@/lib/data/types";
import type { DailyProgress } from "@/lib/data/statsService";
import { DashboardClient } from "../dashboard-client";

async function fetchDailyStats(): Promise<{
  stats: DailyProgress;
  meetings: Activity[];
}> {
  const res = await fetch("/api/stats/daily");
  if (!res.ok) throw new Error("Failed to fetch daily stats");
  const data = await res.json();
  return {
    stats: data.stats,
    meetings: (data.meetings ?? []).map((m: Activity & { occurredAt: string }) => ({
      ...m,
      occurredAt: new Date(m.occurredAt),
    })),
  };
}

export function DailyStatsClient() {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["stats", "daily"],
    queryFn: fetchDailyStats,
    staleTime: 60 * 1000,
  });

  if (isLoading && !data) {
    return (
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
        Loading daily stats…
      </div>
    );
  }

  if (error && !data) {
    return (
      <div
        style={{
          padding: 32,
          textAlign: "center",
          color: "#fca5a5",
          background: "linear-gradient(145deg, #0b1524 0%, #080f1e 100%)",
          border: "1px solid #dc2626",
          borderRadius: 16,
        }}
      >
        <p style={{ fontSize: 14, marginBottom: 12 }}>
          {error instanceof Error ? error.message : "Failed to load"}
        </p>
        <button
          onClick={() => refetch()}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            border: "1px solid #111d30",
            background: "#0b1524",
            color: "#ccdaf0",
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <DashboardClient
      initialStats={data.stats}
      initialMeetings={data.meetings}
      onInvalidateDailyStats={() =>
        queryClient.invalidateQueries({ queryKey: ["stats", "daily"] })
      }
    />
  );
}

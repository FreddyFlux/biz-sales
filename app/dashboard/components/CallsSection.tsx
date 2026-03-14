"use client";

import { ActionBtn } from "./ActionBtn";
import { BenchBar } from "./BenchBar";
import { DashboardCard } from "./DashboardCard";
import type { DailyProgress } from "@/lib/data/statsService";

export function CallsSection({
  stats,
  avg,
  rec,
  onRecord,
  isLoading,
}: {
  stats: DailyProgress;
  avg: DailyProgress["avg"];
  rec: DailyProgress["rec"];
  onRecord: (payload: { kind: "call"; outcome: string }) => void;
  isLoading: boolean;
}) {
  return (
    <DashboardCard title="Calls" icon="📞" accent="#4f8fff">
      <div style={{ display: "flex", gap: 10 }}>
        <ActionBtn
          label="No Answer"
          onClick={() => onRecord({ kind: "call", outcome: "no_answer" })}
          color="#769acc"
          count={stats.todayCalls - stats.todayConnected}
          disabled={isLoading}
        />
        <ActionBtn
          label="Connected ✓"
          onClick={() => onRecord({ kind: "call", outcome: "connected" })}
          color="#4f8fff"
          count={stats.todayConnected}
          disabled={isLoading}
        />
      </div>
      <BenchBar
        label="Total calls"
        value={stats.todayCalls}
        avg={avg.calls}
        record={rec.calls}
        color="#4f8fff"
        weekValue={stats.weekToDate.calls}
        weekExpected={stats.weekExpected.calls}
      />
      <BenchBar
        label="Connected"
        value={stats.todayConnected}
        avg={avg.connected}
        record={rec.connected}
        color="#8b72ff"
        weekValue={stats.weekToDate.connected}
        weekExpected={stats.weekExpected.connected}
      />
    </DashboardCard>
  );
}

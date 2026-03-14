"use client";

import { ActionBtn } from "./ActionBtn";
import { BenchBar } from "./BenchBar";
import { DashboardCard } from "./DashboardCard";
import type { DailyProgress } from "@/lib/data/statsService";

export function EmailsSection({
  stats,
  avg,
  rec,
  onRecord,
  isLoading,
}: {
  stats: DailyProgress;
  avg: DailyProgress["avg"];
  rec: DailyProgress["rec"];
  onRecord: (payload: { kind: "email"; outcome: string }) => void;
  isLoading: boolean;
}) {
  return (
    <DashboardCard title="Emails Sent" icon="✉️" accent="#ff6e40">
      <ActionBtn
        label="Email Sent"
        onClick={() => onRecord({ kind: "email", outcome: "sent" })}
        color="#ff6e40"
        count={stats.todayEmails}
        disabled={isLoading}
      />
      <BenchBar
        label="Emails sent"
        value={stats.todayEmails}
        avg={avg.emails}
        record={rec.emails}
        color="#ff6e40"
        weekValue={stats.weekToDate.emails}
        weekExpected={stats.weekExpected.emails}
      />
    </DashboardCard>
  );
}

"use client";

import { ActionBtn } from "./ActionBtn";
import { BenchBar } from "./BenchBar";
import { DashboardCard } from "./DashboardCard";
import type { DailyProgress } from "@/lib/data/statsService";

export function MeetingsSection({
  stats,
  avg,
  rec,
  onRecord,
  isLoading,
}: {
  stats: DailyProgress;
  avg: DailyProgress["avg"];
  rec: DailyProgress["rec"];
  onRecord: (payload: { kind: "meeting"; outcome: string }) => void;
  isLoading: boolean;
}) {
  return (
    <DashboardCard title="Meetings Booked" icon="📅" accent="#00c4bd">
      <div style={{ display: "flex", gap: 10 }}>
        <ActionBtn
          label="New Customer"
          onClick={() => onRecord({ kind: "meeting", outcome: "new_customer" })}
          color="#00c4bd"
          count={stats.todayMeetingsNew}
          disabled={isLoading}
        />
        <ActionBtn
          label="Existing Customer"
          onClick={() =>
            onRecord({ kind: "meeting", outcome: "existing_customer" })
          }
          color="#0095ff"
          count={stats.todayMeetingsExist}
          disabled={isLoading}
        />
      </div>
      <BenchBar
        label="New customer"
        value={stats.todayMeetingsNew}
        avg={avg.meetingsNew}
        record={rec.meetingsNew}
        color="#00c4bd"
        weekValue={stats.weekToDate.meetingsNew}
        weekExpected={stats.weekExpected.meetingsNew}
      />
      <BenchBar
        label="Existing customer"
        value={stats.todayMeetingsExist}
        avg={avg.meetingsExist}
        record={rec.meetingsExist}
        color="#0095ff"
        weekValue={stats.weekToDate.meetingsExist}
        weekExpected={stats.weekExpected.meetingsExist}
      />
    </DashboardCard>
  );
}

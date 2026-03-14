"use client";

import { ProgressRing } from "./ProgressRing";

export function RingsOverview({
  stats,
  avg,
  rec,
}: {
  stats: {
    todayCalls: number;
    todayConnected: number;
    todayMeetingsNew: number;
    todayMeetingsExist: number;
    todayEmails: number;
  };
  avg: { calls: number; connected: number; meetingsNew: number; meetingsExist: number; emails: number };
  rec: { calls: number; connected: number; meetingsNew: number; meetingsExist: number; emails: number };
}) {
  return (
    <div
      style={{
        background: "linear-gradient(145deg, #0b1524 0%, #080f1e 100%)",
        border: "1px solid #111d30",
        borderRadius: 16,
        padding: "20px 16px",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 12,
      }}
    >
      <ProgressRing
        value={stats.todayCalls}
        average={avg.calls}
        record={rec.calls}
        label="Calls"
        color="#4f8fff"
      />
      <ProgressRing
        value={stats.todayConnected}
        average={avg.connected}
        record={rec.connected}
        label="Connected"
        color="#8b72ff"
      />
      <ProgressRing
        value={stats.todayMeetingsNew + stats.todayMeetingsExist}
        average={avg.meetingsNew + avg.meetingsExist}
        record={rec.meetingsNew + rec.meetingsExist}
        label="Meetings"
        color="#00c4bd"
      />
      <ProgressRing
        value={stats.todayEmails}
        average={avg.emails}
        record={rec.emails}
        label="Emails"
        color="#ff6e40"
      />
    </div>
  );
}

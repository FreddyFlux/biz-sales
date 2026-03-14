"use client";

import { Calendar, Users } from "lucide-react";
import type { Activity } from "@/lib/data/types";
import { formatMeetingTime, formatOutcome } from "@/lib/utils/formatters";

export function MeetingsList({ meetings }: { meetings: Activity[] }) {
  return (
    <div
      style={{
        background: "linear-gradient(145deg, #0b1524 0%, #0e1a2e 100%)",
        border: "1px solid #1a2840",
        borderRadius: 16,
        padding: "20px 22px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        <Users size={15} style={{ color: "#5e81b4" }} />
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "#5e81b4",
            textTransform: "uppercase",
            letterSpacing: "0.12em",
          }}
        >
          Today&apos;s booked meetings
        </span>
      </div>
      {meetings.length === 0 ? (
        <p
          style={{
            fontSize: 12,
            color: "#769acc",
            fontFamily: "var(--font-dm-mono), monospace",
          }}
        >
          No meetings recorded yet today.
        </p>
      ) : (
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {meetings.map((meeting) => (
            <li
              key={meeting.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 12px",
                background: "#111d2e",
                borderRadius: 8,
                border: "1px solid #1a2840",
              }}
            >
              <Calendar size={14} style={{ color: "#769acc" }} />
              <span
                style={{
                  fontSize: 12,
                  fontFamily: "var(--font-dm-mono), monospace",
                  color: "#8aa0c0",
                }}
              >
                {formatMeetingTime(meeting.occurredAt)}
              </span>
              <span style={{ color: "#2a3d5a" }}>—</span>
              <span style={{ fontWeight: 600, color: "#ccdaf0" }}>
                {formatOutcome(meeting.outcome)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Phone,
  Mail,
  Calendar,
  LogOut,
  Undo2,
  Trash2,
  Users,
} from "lucide-react";
import { authClient } from "@/lib/auth/client";
import type { Activity } from "@/lib/data/types";
import type { DailyProgress } from "@/lib/data/statsService";

type ActivityPayload = { kind: "call" | "meeting" | "email"; outcome: string };

function formatMeetingTime(date: Date) {
  return new Date(date).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatOutcome(outcome: string) {
  return outcome
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

async function recordActivity(payload: ActivityPayload) {
  const res = await fetch("/api/activities", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to record");
  return res.json();
}

async function deleteActivity(id: string) {
  const res = await fetch(`/api/activities/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to undo");
  return res.json();
}

async function deleteTodaysData() {
  const res = await fetch("/api/activities/today", { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete today's data");
  return res.json();
}

type UndoableAction = {
  activityId: string;
  previousStats: DailyProgress;
  activity?: Activity;
};

// ─── UI Components (example style) ───────────────────────────────────────────

function ProgressRing({
  value,
  average,
  record,
  size = 84,
  label,
  color,
}: {
  value: number;
  average: number;
  record: number;
  size?: number;
  label: string;
  color: string;
}) {
  const pctAvg = average > 0 ? Math.min(value / average, 1.5) : 0;
  const pctRecord = record > 0 ? Math.min(value / record, 1.0) : 0;
  const r = (size - 14) / 2;
  const circ = 2 * Math.PI * r;
  const overAvg = value >= average && average > 0;
  const overRec = value >= record && record > 0;
  const ringColor =
    overRec ? "#fbbf24"
    : overAvg ? "#22c55e"
    : color;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
      }}
    >
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#1e2d45"
          strokeWidth={9}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#2a3d5a"
          strokeWidth={3}
          strokeDasharray={`${pctRecord * circ} ${circ}`}
          strokeLinecap="round"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={ringColor}
          strokeWidth={9}
          strokeDasharray={`${pctAvg * circ} ${circ}`}
          strokeLinecap="round"
          style={{
            transition: "stroke-dasharray 0.4s ease, stroke 0.3s",
          }}
        />
        <text
          x={size / 2}
          y={size / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={ringColor}
          fontSize={size * 0.21}
          fontWeight="700"
          fontFamily="var(--font-dm-mono), monospace"
          style={{
            transform: "rotate(90deg)",
            transformOrigin: `${size / 2}px ${size / 2}px`,
            transition: "fill 0.3s",
          }}
        >
          {value}
        </text>
      </svg>
      <span
        style={{
          fontSize: 10,
          color: "#4a6080",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          fontWeight: 700,
          fontFamily: "var(--font-dm-mono), monospace",
        }}
      >
        {label}
      </span>
    </div>
  );
}

function ActionBtn({
  label,
  onClick,
  color,
  count,
  disabled,
}: {
  label: string;
  onClick: () => void;
  color: string;
  count: number;
  disabled: boolean;
}) {
  const [flash, setFlash] = useState(false);
  const handleClick = () => {
    if (disabled) return;
    onClick();
    setFlash(true);
    setTimeout(() => setFlash(false), 280);
  };
  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      style={{
        flex: 1,
        background: flash ? color : `${color}15`,
        border: `1px solid ${color}40`,
        borderRadius: 10,
        color: flash ? "#060d1a" : color,
        padding: "11px 14px",
        fontFamily: "var(--font-syne), sans-serif",
        fontSize: 13,
        fontWeight: 700,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        transition: "all 0.12s ease",
      }}
    >
      <span>{label}</span>
      <span
        style={{
          background: flash ? "#06090f40" : `${color}25`,
          borderRadius: 20,
          padding: "2px 9px",
          fontSize: 12,
          fontWeight: 800,
          fontFamily: "var(--font-dm-mono), monospace",
          minWidth: 28,
          textAlign: "center",
        }}
      >
        {count}
      </span>
    </button>
  );
}

function BenchBar({
  label,
  value,
  avg,
  record,
  color,
  weekValue,
  weekExpected,
}: {
  label: string;
  value: number;
  avg: number;
  record: number;
  color: string;
  weekValue?: number;
  weekExpected?: number;
}) {
  const pct = record > 0 ? Math.min((value / record) * 100, 100) : 0;
  const avgPct = record > 0 ? (avg / record) * 100 : 0;
  const overAvg = value >= avg && avg > 0;
  const overRec = value >= record && record > 0;
  const fill =
    overRec ? "#fbbf24"
    : overAvg ? "#22c55e"
    : color;

  const weekPct =
    weekValue != null && weekExpected != null && weekExpected > 0
      ? Math.min((weekValue / weekExpected) * 100, 100)
      : 0;
  const weekOverExpected =
    weekValue != null && weekExpected != null && weekValue >= weekExpected && weekExpected > 0;
  const weekFill = weekOverExpected ? "#22c55e" : "#4f8fff";

  const hasWeek = weekValue != null && weekExpected != null;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        fontFamily: "var(--font-dm-mono), monospace",
        fontSize: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ color: "#8aa0c0", fontWeight: 600, minWidth: 100 }}>
          {label}
        </span>
        <div
          style={{
            flex: 1,
            display: "flex",
            gap: 8,
            alignItems: "center",
            minWidth: 0,
          }}
        >
          {/* Today */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#3a5070", fontWeight: 700, fontSize: 9, textTransform: "uppercase" }}>
                Today
              </span>
              <span>
                <span style={{ color: fill, fontWeight: 700 }}>{value}</span>
                <span style={{ color: "#2a3d5a" }}> · avg {avg} · rec {record}</span>
              </span>
            </div>
            <div
              style={{
                height: 4,
                background: "#111d2e",
                borderRadius: 2,
                position: "relative",
                overflow: "hidden",
              }}
            >
              {avgPct > 0 && (
                <div
                  style={{
                    position: "absolute",
                    left: `${avgPct}%`,
                    top: -1,
                    width: 1,
                    height: 6,
                    background: "#22c55e55",
                  }}
                />
              )}
              <div
                style={{
                  width: `${pct}%`,
                  height: "100%",
                  borderRadius: 2,
                  background: fill,
                  transition: "width 0.35s ease",
                }}
              />
            </div>
          </div>
          {/* Week */}
          {hasWeek && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#3a5070", fontWeight: 700, fontSize: 9, textTransform: "uppercase" }}>
                  Week
                </span>
                <span>
                  <span style={{ color: weekFill, fontWeight: 700 }}>{weekValue}</span>
                  <span style={{ color: "#2a3d5a" }}>/{weekExpected}</span>
                </span>
              </div>
              <div
                style={{
                  height: 4,
                  background: "#111d2e",
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${weekPct}%`,
                    height: "100%",
                    borderRadius: 2,
                    background: weekFill,
                    transition: "width 0.35s ease",
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Card({
  title,
  icon,
  accent,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  accent: string;
  children: React.ReactNode;
}) {
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
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -20,
          right: -20,
          width: 120,
          height: 120,
          background: `radial-gradient(circle, ${accent}18, transparent 65%)`,
          pointerEvents: "none",
        }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        <span style={{ fontSize: 15 }}>{icon}</span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "#3a5070",
            textTransform: "uppercase",
            letterSpacing: "0.12em",
          }}
        >
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export function DashboardClient({
  initialStats,
  initialMeetings,
}: {
  initialStats: DailyProgress;
  initialMeetings: Activity[];
}) {
  const [stats, setStats] = useState(initialStats);
  const [meetings, setMeetings] = useState<Activity[]>(initialMeetings);
  const [loading, setLoading] = useState<string | null>(null);
  const [undoStack, setUndoStack] = useState<UndoableAction[]>([]);
  const [undoing, setUndoing] = useState(false);
  const [deletingToday, setDeletingToday] = useState(false);
  const router = useRouter();

  const today = new Date().toLocaleDateString("en-NO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const avg = stats.avg;
  const rec = stats.rec;

  const totalNow =
    stats.todayCalls +
    stats.todayMeetingsNew +
    stats.todayMeetingsExist +
    stats.todayEmails;
  const totalAvg = avg.calls + avg.meetingsNew + avg.meetingsExist + avg.emails;
  const overallPct = totalAvg > 0 ? Math.round((totalNow / totalAvg) * 100) : 0;
  const isLoading = loading !== null;
  const pctColor = overallPct >= 100 ? "#22c55e" : "#4f8fff";

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/login");
    router.refresh();
  }

  async function handleRecord(payload: ActivityPayload) {
    const previousStats = stats;
    setStats((prev) => {
      const newCalls = prev.todayCalls + (payload.kind === "call" ? 1 : 0);
      const newConnected =
        prev.todayConnected +
        (payload.kind === "call" && payload.outcome === "connected" ? 1 : 0);
      const newMeetingsNew =
        prev.todayMeetingsNew +
        (payload.kind === "meeting" && payload.outcome === "new_customer" ?
          1
        : 0);
      const newMeetingsExist =
        prev.todayMeetingsExist +
        (payload.kind === "meeting" && payload.outcome === "existing_customer" ?
          1
        : 0);
      const newMeetings = newMeetingsNew + newMeetingsExist;
      const newEmails = prev.todayEmails + (payload.kind === "email" ? 1 : 0);
      const newCount = newCalls + newMeetings + newEmails;

      const weekDelta = {
        calls: payload.kind === "call" ? 1 : 0,
        connected:
          payload.kind === "call" && payload.outcome === "connected" ? 1 : 0,
        meetingsNew:
          payload.kind === "meeting" && payload.outcome === "new_customer" ?
            1
          : 0,
        meetingsExist:
          payload.kind === "meeting" && payload.outcome === "existing_customer" ?
            1
          : 0,
        emails: payload.kind === "email" ? 1 : 0,
      };

      const newWeekToDate = {
        calls: prev.weekToDate.calls + weekDelta.calls,
        connected: prev.weekToDate.connected + weekDelta.connected,
        meetingsNew: prev.weekToDate.meetingsNew + weekDelta.meetingsNew,
        meetingsExist: prev.weekToDate.meetingsExist + weekDelta.meetingsExist,
        emails: prev.weekToDate.emails + weekDelta.emails,
      };

      const wdw = prev.workingDaysInWeek ?? 5;
      const wde = prev.workDaysElapsed ?? 1;
      const newWeekExpected = {
        calls: Math.round((newWeekToDate.calls / wdw) * wde),
        connected: Math.round((newWeekToDate.connected / wdw) * wde),
        meetingsNew: Math.round((newWeekToDate.meetingsNew / wdw) * wde),
        meetingsExist: Math.round((newWeekToDate.meetingsExist / wdw) * wde),
        emails: Math.round((newWeekToDate.emails / wdw) * wde),
      };

      return {
        ...prev,
        todayCount: newCount,
        todayCalls: newCalls,
        todayConnected: newConnected,
        todayMeetings: newMeetings,
        todayMeetingsNew: newMeetingsNew,
        todayMeetingsExist: newMeetingsExist,
        todayEmails: newEmails,
        progressToGoal: prev.goal > 0 ? Math.min(1, newCount / prev.goal) : 0,
        progressToRecord:
          prev.recordDayCount > 0 ?
            Math.min(1, newCount / prev.recordDayCount)
          : 0,
        weekToDate: newWeekToDate,
        weekExpected: newWeekExpected,
      };
    });
    setLoading(JSON.stringify(payload));
    try {
      const { activity } = await recordActivity(payload);
      setUndoStack((prev) => [
        ...prev,
        { activityId: activity.id, previousStats, activity },
      ]);
      if (payload.kind === "meeting") {
        setMeetings((prev) =>
          [...prev, activity].sort(
            (a, b) =>
              new Date(a.occurredAt).getTime() -
              new Date(b.occurredAt).getTime(),
          ),
        );
      }
    } catch {
      setStats(previousStats);
    } finally {
      setLoading(null);
    }
  }

  async function handleUndo() {
    if (undoStack.length === 0) return;
    setUndoing(true);
    const lastAction = undoStack[undoStack.length - 1];
    const { activityId, previousStats } = lastAction;
    const statsBeforeUndo = stats;
    setStats(previousStats);
    setUndoStack((prev) => prev.slice(0, -1));
    try {
      await deleteActivity(activityId);
      if (lastAction.activity?.kind === "meeting") {
        setMeetings((prev) => prev.filter((m) => m.id !== activityId));
      }
    } catch {
      setStats(statsBeforeUndo);
      setUndoStack((prev) => [...prev, lastAction]);
    } finally {
      setUndoing(false);
    }
  }

  async function handleDeleteTodaysData() {
    if (
      !confirm(
        "Delete all of today's activities? This cannot be undone. Only today's data will be removed.",
      )
    ) {
      return;
    }
    setDeletingToday(true);
    const previousStats = stats;
    try {
      await deleteTodaysData();
      setStats({
        ...previousStats,
        todayCount: 0,
        todayCalls: 0,
        todayMeetings: 0,
        todayEmails: 0,
        todayConnected: 0,
        todayMeetingsNew: 0,
        todayMeetingsExist: 0,
        progressToGoal: 0,
        progressToRecord: 0,
        weekToDate: {
          calls: previousStats.weekToDate.calls - previousStats.todayCalls,
          connected:
            previousStats.weekToDate.connected - previousStats.todayConnected,
          meetingsNew:
            previousStats.weekToDate.meetingsNew -
            previousStats.todayMeetingsNew,
          meetingsExist:
            previousStats.weekToDate.meetingsExist -
            previousStats.todayMeetingsExist,
          emails: previousStats.weekToDate.emails - previousStats.todayEmails,
        },
      });
      setUndoStack([]);
      setMeetings([]);
    } catch {
      // No rollback needed
    } finally {
      setDeletingToday(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#060d1a",
        fontFamily: "var(--font-syne), 'Segoe UI', sans-serif",
        padding: "24px 18px 60px",
        color: "#ccdaf0",
      }}
    >
      <style>{`
        button:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.12); }
        button:active:not(:disabled) { transform: scale(0.97); }
      `}</style>

      <div
        style={{
          maxWidth: 660,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
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
            <p
              style={{
                fontSize: 11,
                color: "#2d4060",
                marginTop: 3,
                fontFamily: "var(--font-dm-mono), monospace",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              {today}
            </p>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: 6,
            }}
          >
            <div
              style={{
                background: `${pctColor}15`,
                border: `1px solid ${pctColor}30`,
                borderRadius: 12,
                padding: "7px 14px",
                textAlign: "center",
                minWidth: 76,
              }}
            >
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: pctColor,
                  fontFamily: "var(--font-dm-mono), monospace",
                }}
              >
                {isLoading ? "—" : `${overallPct}%`}
              </div>
              <div
                style={{
                  fontSize: 9,
                  color: "#2d4060",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginTop: 1,
                }}
              >
                of avg day
              </div>
            </div>
            <div
              style={{
                fontSize: 10,
                color: "#2a3a50",
                fontFamily: "var(--font-dm-mono), monospace",
              }}
            >
              {stats.daysLogged} days logged
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {undoStack.length > 0 && (
                <button
                  type="button"
                  onClick={handleUndo}
                  disabled={undoing || loading !== null}
                  style={{
                    background: "#1a284015",
                    border: "1px solid #1a2840",
                    borderRadius: 8,
                    padding: "6px 12px",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#8aa0c0",
                    cursor: undoing || loading ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <Undo2 size={12} />
                  Undo {undoStack.length > 1 ? `(${undoStack.length})` : ""}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Rings overview */}
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

        {/* Calls */}
        <Card title="Calls" icon="📞" accent="#4f8fff">
          <div style={{ display: "flex", gap: 10 }}>
            <ActionBtn
              label="No Answer"
              onClick={() =>
                handleRecord({ kind: "call", outcome: "no_answer" })
              }
              color="#4a6080"
              count={stats.todayCalls - stats.todayConnected}
              disabled={isLoading}
            />
            <ActionBtn
              label="Connected ✓"
              onClick={() =>
                handleRecord({ kind: "call", outcome: "connected" })
              }
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
        </Card>

        {/* Meetings */}
        <Card title="Meetings Booked" icon="📅" accent="#00c4bd">
          <div style={{ display: "flex", gap: 10 }}>
            <ActionBtn
              label="New Customer"
              onClick={() =>
                handleRecord({ kind: "meeting", outcome: "new_customer" })
              }
              color="#00c4bd"
              count={stats.todayMeetingsNew}
              disabled={isLoading}
            />
            <ActionBtn
              label="Existing Customer"
              onClick={() =>
                handleRecord({
                  kind: "meeting",
                  outcome: "existing_customer",
                })
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
        </Card>

        {/* Emails */}
        <Card title="Emails Sent" icon="✉️" accent="#ff6e40">
          <ActionBtn
            label="Email Sent"
            onClick={() => handleRecord({ kind: "email", outcome: "sent" })}
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
        </Card>

        {/* Today's booked meetings */}
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
            <Users size={15} style={{ color: "#3a5070" }} />
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#3a5070",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
              }}
            >
              Today&apos;s booked meetings
            </span>
          </div>
          {meetings.length === 0 ?
            <p
              style={{
                fontSize: 12,
                color: "#4a6080",
                fontFamily: "var(--font-dm-mono), monospace",
              }}
            >
              No meetings recorded yet today.
            </p>
          : <ul
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
                  <Calendar size={14} style={{ color: "#4a6080" }} />
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
          }
        </div>

        {/* Legend */}
        <div
          style={{
            display: "flex",
            gap: 16,
            justifyContent: "center",
            flexWrap: "wrap",
            paddingTop: 4,
          }}
        >
          {[
            ["Ring fill", "vs avg day"],
            ["Green ring", "above average"],
            ["Gold ring", "new record"],
            ["Thin ring", "vs record"],
          ].map(([k, v], i) => (
            <div
              key={k}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                fontSize: 10,
                color: "#2a3a50",
                fontFamily: "var(--font-dm-mono), monospace",
              }}
            >
              <div
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: 2,
                  background: ["#4f8fff", "#22c55e", "#fbbf24", "#2a3d5a"][i],
                }}
              />
              <span>
                <span style={{ color: "#3a5070" }}>{k}</span> = {v}
              </span>
            </div>
          ))}
        </div>

        {/* Delete today's data & Sign out */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: 4,
          }}
        >
          {stats.todayCount > 0 ? (
            <button
              type="button"
              onClick={handleDeleteTodaysData}
              disabled={deletingToday || loading !== null}
              style={{
                background: "transparent",
                border: "1px solid #ff6e4040",
                borderRadius: 8,
                padding: "8px 16px",
                fontSize: 11,
                fontWeight: 600,
                color: "#ff6e40",
                cursor: deletingToday || loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                opacity: deletingToday || loading ? 0.5 : 1,
              }}
            >
              <Trash2 size={12} />
              Delete today&apos;s data
            </button>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={handleSignOut}
            style={{
              background: "transparent",
              border: "1px solid #1a2840",
              borderRadius: 8,
              padding: "8px 16px",
              fontSize: 11,
              fontWeight: 600,
              color: "#8aa0c0",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <LogOut size={12} />
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

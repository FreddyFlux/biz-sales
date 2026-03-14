"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import type { Activity } from "@/lib/data/types";
import type { DailyProgress } from "@/lib/data/statsService";
import {
  recordActivity,
  deleteActivity,
  deleteTodaysData,
  type ActivityPayload,
} from "@/lib/api/activities";
import {
  DailyStatsHeader,
  RingsOverview,
  CallsSection,
  MeetingsSection,
  EmailsSection,
  MeetingsList,
  LegendSection,
  ActionsFooter,
} from "./components";

type UndoableAction = {
  activityId: string;
  previousStats: DailyProgress;
  activity?: Activity;
};

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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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
        (payload.kind === "meeting" && payload.outcome === "new_customer"
          ? 1
          : 0);
      const newMeetingsExist =
        prev.todayMeetingsExist +
        (payload.kind === "meeting" && payload.outcome === "existing_customer"
          ? 1
          : 0);
      const newMeetings = newMeetingsNew + newMeetingsExist;
      const newEmails = prev.todayEmails + (payload.kind === "email" ? 1 : 0);
      const newCount = newCalls + newMeetings + newEmails;

      const weekDelta = {
        calls: payload.kind === "call" ? 1 : 0,
        connected:
          payload.kind === "call" && payload.outcome === "connected" ? 1 : 0,
        meetingsNew:
          payload.kind === "meeting" && payload.outcome === "new_customer"
            ? 1
            : 0,
        meetingsExist:
          payload.kind === "meeting" &&
          payload.outcome === "existing_customer"
            ? 1
            : 0,
        emails: payload.kind === "email" ? 1 : 0,
      };

      const newWeekToDate = {
        calls: prev.weekToDate.calls + weekDelta.calls,
        connected: prev.weekToDate.connected + weekDelta.connected,
        meetingsNew: prev.weekToDate.meetingsNew + weekDelta.meetingsNew,
        meetingsExist:
          prev.weekToDate.meetingsExist + weekDelta.meetingsExist,
        emails: prev.weekToDate.emails + weekDelta.emails,
      };

      const wdw = prev.workingDaysInWeek ?? 5;
      const wde = prev.workDaysElapsed ?? 1;
      const newWeekExpected = {
        calls: Math.round((newWeekToDate.calls / wdw) * wde),
        connected: Math.round((newWeekToDate.connected / wdw) * wde),
        meetingsNew: Math.round((newWeekToDate.meetingsNew / wdw) * wde),
        meetingsExist: Math.round(
          (newWeekToDate.meetingsExist / wdw) * wde
        ),
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
          prev.recordDayCount > 0
            ? Math.min(1, newCount / prev.recordDayCount)
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
              new Date(b.occurredAt).getTime()
          )
        );
      }
    } catch {
      setStats(previousStats);
      setErrorMessage("Failed to record. Please try again.");
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
      setErrorMessage("Failed to undo. Please try again.");
    } finally {
      setUndoing(false);
    }
  }

  async function handleDeleteTodaysData() {
    if (
      !confirm(
        "Delete all of today's activities? This cannot be undone. Only today's data will be removed."
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
      setErrorMessage("Failed to delete today's data. Please try again.");
    } finally {
      setDeletingToday(false);
    }
  }

  return (
    <>
      <style>{`
        button:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.12); }
        button:active:not(:disabled) { transform: scale(0.97); }
      `}</style>

      {errorMessage && (
        <div
          role="alert"
          style={{
            padding: "12px 16px",
            borderRadius: 8,
            background: "rgba(220, 38, 38, 0.15)",
            border: "1px solid #dc2626",
            color: "#fca5a5",
            fontSize: 14,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>{errorMessage}</span>
          <button
            onClick={() => setErrorMessage(null)}
            aria-label="Dismiss"
            style={{
              background: "none",
              border: "none",
              color: "#fca5a5",
              cursor: "pointer",
              fontSize: 18,
              padding: "0 4px",
            }}
          >
            ×
          </button>
        </div>
      )}

      <DailyStatsHeader
        today={today}
        overallPct={overallPct}
        isLoading={isLoading}
        pctColor={pctColor}
        daysLogged={stats.daysLogged}
        undoStackLength={undoStack.length}
        onUndo={handleUndo}
        undoing={undoing}
        loading={loading}
      />

      <RingsOverview stats={stats} avg={avg} rec={rec} />

      <CallsSection
        stats={stats}
        avg={avg}
        rec={rec}
        onRecord={handleRecord}
        isLoading={isLoading}
      />

      <MeetingsSection
        stats={stats}
        avg={avg}
        rec={rec}
        onRecord={handleRecord}
        isLoading={isLoading}
      />

      <EmailsSection
        stats={stats}
        avg={avg}
        rec={rec}
        onRecord={handleRecord}
        isLoading={isLoading}
      />

      <MeetingsList meetings={meetings} />

      <LegendSection />

      <ActionsFooter
        hasData={stats.todayCount > 0}
        onDeleteToday={handleDeleteTodaysData}
        onSignOut={handleSignOut}
        deletingToday={deletingToday}
        loading={loading}
      />
    </>
  );
}

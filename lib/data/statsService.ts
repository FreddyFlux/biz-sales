/**
 * Domain service - today vs average/goal/record.
 * Depends only on ActivityRepository interface.
 */
import type { Activity } from "./types";
import { activitiesRepo } from "./activitiesRepo";
import {
  getWorkingDaysInWeek,
  getWorkDaysElapsedInWeek,
} from "@/lib/workingDays";

export type OutcomeBreakdown = {
  calls: number;
  connected: number;
  meetingsNew: number;
  meetingsExist: number;
  emails: number;
};

export type DailyProgress = {
  todayCount: number;
  todayCalls: number;
  todayMeetings: number;
  todayEmails: number;
  todayConnected: number;
  todayMeetingsNew: number;
  todayMeetingsExist: number;
  averagePerDay: number;
  goal: number;
  recordDayCount: number;
  progressToGoal: number;
  progressToRecord: number;
  /** Per-outcome averages (from historical days, excluding today) */
  avg: OutcomeBreakdown;
  /** Per-outcome records */
  rec: OutcomeBreakdown;
  daysLogged: number;
  /** Week-to-date totals (Mon–today) for work week progress */
  weekToDate: OutcomeBreakdown;
  /** Expected at this point: (weekToDate / workingDaysInWeek) × workDaysElapsed */
  weekExpected: OutcomeBreakdown;
  /** Norwegian working days elapsed this week (1–5 typically, fewer on holiday weeks) */
  workDaysElapsed: number;
  /** Total Norwegian working days in this week (3–5 typically) */
  workingDaysInWeek: number;
};

function computeBenchmarks(
  history: { day: string; calls: number; connected: number; meetingsNew: number; meetingsExist: number; emails: number }[],
  todayStr: string
) {
  const past = history.filter((r) => r.day !== todayStr);
  if (past.length === 0) {
    const fallback: OutcomeBreakdown = {
      calls: 20,
      connected: 8,
      meetingsNew: 2,
      meetingsExist: 2,
      emails: 12,
    };
    return { avg: fallback, rec: { ...fallback, calls: 40, connected: 16, meetingsNew: 4, meetingsExist: 5, emails: 25 }, daysLogged: 0 };
  }
  const fields = ["calls", "connected", "meetingsNew", "meetingsExist", "emails"] as const;
  const avg: OutcomeBreakdown = { calls: 0, connected: 0, meetingsNew: 0, meetingsExist: 0, emails: 0 };
  const rec: OutcomeBreakdown = { calls: 0, connected: 0, meetingsNew: 0, meetingsExist: 0, emails: 0 };
  for (const f of fields) {
    const vals = past.map((r) => r[f] ?? 0);
    avg[f] = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
    rec[f] = Math.max(...vals, 1);
  }
  return { avg, rec, daysLogged: past.length };
}

export async function getTodayProgress(opts: {
  userId: string;
  today: Date;
  goal: number;
}): Promise<DailyProgress> {
  const todayStr = `${opts.today.getFullYear()}-${String(opts.today.getMonth() + 1).padStart(2, "0")}-${String(opts.today.getDate()).padStart(2, "0")}`;
  const [todayActivities, hist, breakdown] = await Promise.all([
    activitiesRepo.listByUserAndDay(opts.userId, opts.today),
    activitiesRepo.getHistoricalStats(opts.userId),
    activitiesRepo.getHistoricalBreakdown(opts.userId),
  ]);

  const todayCalls = todayActivities.filter((a: Activity) => a.kind === "call").length;
  const todayConnected = todayActivities.filter(
    (a: Activity) => a.kind === "call" && a.outcome === "connected"
  ).length;
  const todayMeetingsNew = todayActivities.filter(
    (a: Activity) => a.kind === "meeting" && a.outcome === "new_customer"
  ).length;
  const todayMeetingsExist = todayActivities.filter(
    (a: Activity) => a.kind === "meeting" && a.outcome === "existing_customer"
  ).length;
  const todayMeetings = todayMeetingsNew + todayMeetingsExist;
  const todayEmails = todayActivities.filter((a: Activity) => a.kind === "email").length;
  const todayCount = todayActivities.length;

  const progressToGoal =
    opts.goal > 0 ? Math.min(1, todayCount / opts.goal) : 0;
  const progressToRecord =
    hist.recordDayCount > 0
      ? Math.min(1, todayCount / hist.recordDayCount)
      : 0;

  const benchmarks = computeBenchmarks(breakdown, todayStr);

  // Week-to-date: Mon of this week through today (Norwegian working days)
  const d = opts.today;
  const monday = new Date(d);
  const mondayOffset = d.getDay() === 0 ? -6 : 1 - d.getDay();
  monday.setDate(d.getDate() + mondayOffset);
  const mondayStr = `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, "0")}-${String(monday.getDate()).padStart(2, "0")}`;

  const weekDays = breakdown.filter((r) => r.day >= mondayStr && r.day <= todayStr);
  const workDaysElapsed = getWorkDaysElapsedInWeek(d);
  const workingDaysInWeek = getWorkingDaysInWeek(d);

  const fields = ["calls", "connected", "meetingsNew", "meetingsExist", "emails"] as const;
  const weekToDate: OutcomeBreakdown = { calls: 0, connected: 0, meetingsNew: 0, meetingsExist: 0, emails: 0 };
  for (const r of weekDays) {
    for (const f of fields) weekToDate[f] += (r[f] ?? 0);
  }

  // Expected at this point: use actual week data / working days in week × work days elapsed.
  // When no data this week, fall back to historical avg × work days elapsed.
  const weekExpected: OutcomeBreakdown = { calls: 0, connected: 0, meetingsNew: 0, meetingsExist: 0, emails: 0 };
  for (const f of fields) {
    const total = weekToDate[f];
    if (total > 0 && workingDaysInWeek > 0) {
      weekExpected[f] = Math.round((total / workingDaysInWeek) * workDaysElapsed);
    } else {
      weekExpected[f] = Math.round(benchmarks.avg[f] * workDaysElapsed);
    }
  }

  return {
    todayCount,
    todayCalls,
    todayMeetings,
    todayEmails,
    todayConnected,
    todayMeetingsNew,
    todayMeetingsExist,
    averagePerDay: hist.averagePerDay,
    goal: opts.goal,
    recordDayCount: hist.recordDayCount,
    progressToGoal,
    progressToRecord,
    avg: benchmarks.avg,
    rec: benchmarks.rec,
    daysLogged: benchmarks.daysLogged,
    weekToDate,
    weekExpected,
    workDaysElapsed,
    workingDaysInWeek,
  };
}

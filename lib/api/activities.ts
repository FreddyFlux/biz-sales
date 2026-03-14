/**
 * Client-side API for activities and statistics.
 */

export type ActivityPayload = {
  kind: "call" | "meeting" | "email";
  outcome: string;
};

export type DayBreakdown = {
  day: string;
  calls: number;
  connected: number;
  meetingsNew: number;
  meetingsExist: number;
  emails: number;
};

export type MonthWithData = { year: number; month: number };

export type StatisticsResponse = {
  availableMonths: MonthWithData[];
  breakdown: DayBreakdown[] | null;
};

export async function recordActivity(payload: ActivityPayload) {
  const res = await fetch("/api/activities", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to record");
  return res.json();
}

export async function deleteActivity(id: string) {
  const res = await fetch(`/api/activities/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to undo");
  return res.json();
}

export async function deleteTodaysData() {
  const res = await fetch("/api/activities/today", { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete today's data");
  return res.json();
}

export async function fetchStatistics(params?: {
  year?: number;
  month?: number;
}): Promise<StatisticsResponse> {
  const url = new URL("/api/stats/statistics", window.location.origin);
  if (params?.year && params?.month) {
    url.searchParams.set("year", String(params.year));
    url.searchParams.set("month", String(params.month));
  }
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

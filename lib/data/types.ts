/**
 * Domain types - DB-agnostic. Used by DAL and app logic.
 */

export type ActivityKind = "call" | "meeting" | "email";

export type CallOutcome = "no_answer" | "connected";
export type MeetingOutcome = "new_customer" | "existing_customer";
export type EmailOutcome = "sent";

export type ActivityOutcome =
  | CallOutcome
  | MeetingOutcome
  | EmailOutcome;

export type Activity = {
  id: string;
  userId: string;
  kind: ActivityKind;
  outcome: ActivityOutcome;
  occurredAt: Date;
};

export type HistoricalDayBreakdown = {
  day: string;
  calls: number;
  connected: number;
  meetingsNew: number;
  meetingsExist: number;
  emails: number;
};

export interface ActivityRepository {
  create(activity: Omit<Activity, "id">): Promise<Activity>;
  delete(id: string, userId: string): Promise<boolean>;
  deleteByUserAndDay(userId: string, day: Date): Promise<number>;
  listByUserAndDay(userId: string, day: Date): Promise<Activity[]>;
  getHistoricalStats(userId: string): Promise<{
    averagePerDay: number;
    recordDayCount: number;
  }>;
  getHistoricalBreakdown(userId: string, daysBack?: number): Promise<HistoricalDayBreakdown[]>;
}

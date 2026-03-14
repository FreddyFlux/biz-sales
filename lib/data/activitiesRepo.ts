/**
 * Data access layer - Neon/Drizzle implementation.
 * Swap this for SharePoint/Azure implementation later.
 */
import { and, desc, eq, gte, lt, sql } from "drizzle-orm";
import { db } from "@/lib/db/drizzle";
import { activities } from "@/lib/db/schema";
import type { Activity, ActivityRepository, HistoricalDayBreakdown } from "./types";

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function endOfDay(d: Date) {
  const s = startOfDay(d);
  return new Date(s.getTime() + 24 * 60 * 60 * 1000);
}

export const activitiesRepo: ActivityRepository = {
  async create(input) {
    const [row] = await db
      .insert(activities)
      .values({
        userId: input.userId,
        kind: input.kind,
        outcome: input.outcome,
        occurredAt: input.occurredAt,
      })
      .returning();

    if (!row) throw new Error("Failed to create activity");
    return {
      id: row.id,
      userId: row.userId,
      kind: row.kind as Activity["kind"],
      outcome: row.outcome as Activity["outcome"],
      occurredAt: row.occurredAt!,
    };
  },

  async delete(id, userId) {
    const [deleted] = await db
      .delete(activities)
      .where(and(eq(activities.id, id), eq(activities.userId, userId)))
      .returning({ id: activities.id });
    return !!deleted;
  },

  async deleteByUserAndDay(userId, day) {
    const from = startOfDay(day);
    const to = endOfDay(day);
    const deleted = await db
      .delete(activities)
      .where(
        and(
          eq(activities.userId, userId),
          gte(activities.occurredAt, from),
          lt(activities.occurredAt, to)
        )
      )
      .returning({ id: activities.id });
    return deleted.length;
  },

  async listByUserAndDay(userId, day) {
    const from = startOfDay(day);
    const to = endOfDay(day);
    let rows;
    try {
      rows = await db
        .select()
        .from(activities)
        .where(
          and(
            eq(activities.userId, userId),
            gte(activities.occurredAt, from),
            lt(activities.occurredAt, to)
          )
        );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const causeMsg =
        err instanceof Error && err.cause instanceof Error
          ? (err.cause as Error).message
          : null;
      const hint = causeMsg
        ? `Underlying error: ${causeMsg}. `
        : "";
      throw new Error(
        `Failed to list activities: ${msg}. ${hint}Ensure DATABASE_URL is set and the schema is pushed (npm run db:push).`
      );
    }

    return rows.map((row) => ({
      id: row.id,
      userId: row.userId,
      kind: row.kind as Activity["kind"],
      outcome: row.outcome as Activity["outcome"],
      occurredAt: row.occurredAt!,
    }));
  },

  async getHistoricalStats(userId) {
    const rows = await db
      .select({
        day: sql<string>`date_trunc('day', ${activities.occurredAt})`,
        count: sql<number>`count(*)::int`,
      })
      .from(activities)
      .where(eq(activities.userId, userId))
      .groupBy(sql`date_trunc('day', ${activities.occurredAt})`);

    if (rows.length === 0) {
      return { averagePerDay: 0, recordDayCount: 0 };
    }

    const total = rows.reduce((sum, r) => sum + Number(r.count), 0);
    const avg = total / rows.length;
    const record = Math.max(...rows.map((r) => Number(r.count)));
    return { averagePerDay: avg, recordDayCount: record };
  },

  /** Per-outcome breakdown per day for benchmarks (avg/record) */
  async getHistoricalBreakdown(userId: string, daysBack = 365) {
    const from = new Date();
    from.setDate(from.getDate() - daysBack);
    const rows = await db
      .select({
        occurredAt: activities.occurredAt,
        kind: activities.kind,
        outcome: activities.outcome,
      })
      .from(activities)
      .where(
        and(
          eq(activities.userId, userId),
          gte(activities.occurredAt, from)
        )
      )
      .orderBy(activities.occurredAt);

    const byDay = new Map<
      string,
      { calls: number; connected: number; meetingsNew: number; meetingsExist: number; emails: number }
    >();

    for (const r of rows) {
      if (!r.occurredAt) continue;
      const day = new Date(r.occurredAt).toISOString().slice(0, 10);
      if (!byDay.has(day)) {
        byDay.set(day, {
          calls: 0,
          connected: 0,
          meetingsNew: 0,
          meetingsExist: 0,
          emails: 0,
        });
      }
      const row = byDay.get(day)!;
      if (r.kind === "call") {
        row.calls++;
        if (r.outcome === "connected") row.connected++;
      } else if (r.kind === "meeting") {
        if (r.outcome === "new_customer") row.meetingsNew++;
        else if (r.outcome === "existing_customer") row.meetingsExist++;
      } else if (r.kind === "email") {
        row.emails++;
      }
    }

    return Array.from(byDay.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([day, row]) => ({ day, ...row }));
  },

  async getAvailableMonthsWithData(userId: string) {
    const rows = await db
      .select({
        year: sql<number>`extract(year from ${activities.occurredAt})::int`,
        month: sql<number>`extract(month from ${activities.occurredAt})::int`,
      })
      .from(activities)
      .where(eq(activities.userId, userId))
      .groupBy(
        sql`extract(year from ${activities.occurredAt})`,
        sql`extract(month from ${activities.occurredAt})`
      )
      .orderBy(
        desc(sql`extract(year from ${activities.occurredAt})`),
        desc(sql`extract(month from ${activities.occurredAt})`)
      );

    return rows.map((r) => ({ year: r.year, month: r.month }));
  },

  async getBreakdownForMonth(
    userId: string,
    year: number,
    month: number
  ): Promise<
    { day: string; calls: number; connected: number; meetingsNew: number; meetingsExist: number; emails: number }[]
  > {
    const from = new Date(year, month - 1, 1);
    const rows = await db
      .select({
        occurredAt: activities.occurredAt,
        kind: activities.kind,
        outcome: activities.outcome,
      })
      .from(activities)
      .where(
        and(
          eq(activities.userId, userId),
          gte(activities.occurredAt, from),
          lt(activities.occurredAt, new Date(year, month, 1))
        )
      )
      .orderBy(activities.occurredAt);

    const byDay = new Map<
      string,
      { calls: number; connected: number; meetingsNew: number; meetingsExist: number; emails: number }
    >();

    for (const r of rows) {
      if (!r.occurredAt) continue;
      const day = new Date(r.occurredAt).toISOString().slice(0, 10);
      if (!byDay.has(day)) {
        byDay.set(day, {
          calls: 0,
          connected: 0,
          meetingsNew: 0,
          meetingsExist: 0,
          emails: 0,
        });
      }
      const row = byDay.get(day)!;
      if (r.kind === "call") {
        row.calls++;
        if (r.outcome === "connected") row.connected++;
      } else if (r.kind === "meeting") {
        if (r.outcome === "new_customer") row.meetingsNew++;
        else if (r.outcome === "existing_customer") row.meetingsExist++;
      } else if (r.kind === "email") {
        row.emails++;
      }
    }

    return Array.from(byDay.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([day, row]) => ({ day, ...row }));
  },
};

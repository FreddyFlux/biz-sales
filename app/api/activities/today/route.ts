import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/server";
import { activitiesRepo } from "@/lib/data/activitiesRepo";

/**
 * GET /api/activities/today
 * Returns today's activities for the current user.
 */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date();
  const activities = await activitiesRepo.listByUserAndDay(user.id, today);

  return NextResponse.json({ activities });
}

/**
 * DELETE /api/activities/today
 * Deletes ONLY today's activities for the current user.
 * Uses server date to determine "today" - no other days are affected.
 */
export async function DELETE() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date();
  const deletedCount = await activitiesRepo.deleteByUserAndDay(user.id, today);

  return NextResponse.json({ deletedCount, success: true });
}

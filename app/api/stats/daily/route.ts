import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/server";
import { getTodayProgress } from "@/lib/data/statsService";
import { activitiesRepo } from "@/lib/data/activitiesRepo";

const DAILY_GOAL = 50;

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = new Date();
    const [stats, allActivities] = await Promise.all([
      getTodayProgress({
        userId: user.id,
        today,
        goal: DAILY_GOAL,
      }),
      activitiesRepo.listByUserAndDay(user.id, today),
    ]);

    const todaysMeetings = allActivities
      .filter((a) => a.kind === "meeting")
      .sort(
        (a, b) =>
          new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime()
      );

    return NextResponse.json({ stats, meetings: todaysMeetings });
  } catch (err) {
    console.error("GET /api/stats/daily:", err);
    return NextResponse.json(
      { error: "Failed to fetch daily stats" },
      { status: 500 }
    );
  }
}

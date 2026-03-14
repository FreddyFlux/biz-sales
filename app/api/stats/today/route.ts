import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/server";
import { getTodayProgress } from "@/lib/data/statsService";

const DAILY_GOAL = 50;

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stats = await getTodayProgress({
      userId: user.id,
      today: new Date(),
      goal: DAILY_GOAL,
    });

    return NextResponse.json(stats);
  } catch (err) {
    console.error("GET /api/stats/today:", err);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}

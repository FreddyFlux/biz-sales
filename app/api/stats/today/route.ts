import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/server";
import { getTodayProgress } from "@/lib/data/statsService";

const DAILY_GOAL = 50;

export async function GET() {
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
}

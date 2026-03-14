import { activitiesRepo } from "@/lib/data/activitiesRepo";
import { getTodayProgress } from "@/lib/data/statsService";
import { getCurrentUser } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import { DashboardClient } from "../dashboard-client";

const DAILY_GOAL = 50;

export default async function DailyStatsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

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

  return (
    <DashboardClient
      initialStats={stats}
      initialMeetings={todaysMeetings}
    />
  );
}

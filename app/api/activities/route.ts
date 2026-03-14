import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/server";
import { activitiesRepo } from "@/lib/data/activitiesRepo";
import { recordActivitySchema } from "@/lib/data/commands";
import type { ActivityOutcome } from "@/lib/data/types";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await req.json();
    const parsed = recordActivitySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", issues: parsed.error.format() },
        { status: 400 }
      );
    }

    const { kind, outcome } = parsed.data;

    const activity = await activitiesRepo.create({
      userId: user.id,
      kind,
      outcome: outcome as ActivityOutcome,
      occurredAt: new Date(),
    });

    return NextResponse.json({ activity });
  } catch (err) {
    console.error("POST /api/activities:", err);
    return NextResponse.json(
      { error: "Failed to record activity" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/server";
import { activitiesRepo } from "@/lib/data/activitiesRepo";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Activity ID required" }, { status: 400 });
    }

    const deleted = await activitiesRepo.delete(id, user.id);
    if (!deleted) {
      return NextResponse.json(
        { error: "Activity not found or already deleted" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/activities/[id]:", err);
    return NextResponse.json(
      { error: "Failed to delete activity" },
      { status: 500 }
    );
  }
}

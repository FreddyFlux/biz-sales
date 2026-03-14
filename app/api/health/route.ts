import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";

export const dynamic = "force-dynamic";

/**
 * Health check endpoint for load balancers and monitoring.
 * Returns 200 if the app is running and can reach the database.
 */
export async function GET() {
  try {
    await db.execute(sql`SELECT 1`);
    return NextResponse.json({ status: "ok" });
  } catch (err) {
    console.error("Health check failed:", err);
    return NextResponse.json(
      { status: "error", message: "Database unreachable" },
      { status: 503 }
    );
  }
}

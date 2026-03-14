import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/server";
import { activitiesRepo } from "@/lib/data/activitiesRepo";

function parseYearMonth(
  yearParam: string | null,
  monthParam: string | null
): { year: number; month: number } | null {
  if (!yearParam || !monthParam) return null;
  const year = parseInt(yearParam, 10);
  const month = parseInt(monthParam, 10);
  if (Number.isNaN(year) || Number.isNaN(month)) return null;
  if (year < 2000 || year > 2100) return null;
  if (month < 1 || month > 12) return null;
  return { year, month };
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const yearParam = searchParams.get("year");
    const monthParam = searchParams.get("month");
    const parsed = parseYearMonth(yearParam, monthParam);

    const [availableMonths, breakdown] = await Promise.all([
      activitiesRepo.getAvailableMonthsWithData(user.id),
      parsed
        ? activitiesRepo.getBreakdownForMonth(user.id, parsed.year, parsed.month)
        : Promise.resolve(null),
    ]);

    return NextResponse.json({
      availableMonths,
      breakdown,
    });
  } catch (err) {
    console.error("GET /api/stats/statistics:", err);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}

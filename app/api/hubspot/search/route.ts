import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

const SEARCH_LIMIT = 100;

/**
 * Segments from spaces / hyphens / underscores. HubSpot CONTAINS_TOKEN matches
 * whole indexed tokens only — a 3-letter segment like "nor" will NOT match
 * "norsk", which breaks typing "midt-nor…". We only AND segments with length
 * >= MIN_HUBSPOT_TOKEN_LEN; shorter pieces are ignored until the user types more.
 */
const MIN_HUBSPOT_TOKEN_LEN = 4;

function meaningfulSearchTokens(q: string): string[] {
  return q
    .split(/[\s\-_]+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= MIN_HUBSPOT_TOKEN_LEN);
}

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const type = searchParams.get("type"); // "contacts" | "companies"

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  if (type !== "contacts" && type !== "companies") {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  const apiKey = process.env.HUBSPOT_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "HubSpot API key not configured" },
      { status: 500 },
    );
  }

  try {
    if (type === "companies") {
      const tokens = meaningfulSearchTokens(q);
      const body =
        tokens.length > 0 ?
          {
            filterGroups: [
              {
                filters: tokens.map((token) => ({
                  propertyName: "name",
                  operator: "CONTAINS_TOKEN" as const,
                  value: token,
                })),
              },
              {
                filters: tokens.map((token) => ({
                  propertyName: "domain",
                  operator: "CONTAINS_TOKEN" as const,
                  value: token,
                })),
              },
            ],
            limit: SEARCH_LIMIT,
            properties: ["name", "domain"],
            sorts: [{ propertyName: "name", direction: "ASCENDING" }],
          }
        : {
            query: q,
            limit: SEARCH_LIMIT,
            properties: ["name", "domain"],
            sorts: [{ propertyName: "name", direction: "ASCENDING" }],
          };

      const res = await fetch(
        `https://api.hubapi.com/crm/v3/objects/companies/search`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        console.error("HubSpot companies search error:", data);
        return NextResponse.json(
          { error: data.message ?? "HubSpot search failed" },
          { status: res.status },
        );
      }
      const results = (data.results ?? []).map((c: Record<string, unknown>) => {
        const props = (c.properties ?? {}) as Record<string, string | undefined>;
        return {
          id: String(c.id),
          label: props.name ?? "Unknown",
          sub: props.domain ?? "",
        };
      });
      return NextResponse.json({ results });
    }

    const res = await fetch(
      `https://api.hubapi.com/crm/v3/objects/contacts/search`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: q,
          limit: SEARCH_LIMIT,
          properties: ["firstname", "lastname", "email", "company"],
        }),
      },
    );
    const data = await res.json();
    if (!res.ok) {
      console.error("HubSpot contacts search error:", data);
      return NextResponse.json(
        { error: data.message ?? "HubSpot search failed" },
        { status: res.status },
      );
    }
    const results = (data.results ?? []).map((c: Record<string, unknown>) => {
      const props = (c.properties ?? {}) as Record<string, string | undefined>;
      const first = props.firstname?.trim() ?? "";
      const last = props.lastname?.trim() ?? "";
      const email = props.email?.trim() ?? "";
      const label =
        [first, last].filter(Boolean).join(" ") || email || "Unknown";
      const company = (props.company ?? "").trim();
      const sub =
        email && company ? `${email} · ${company}`
        : email || company || "";
      return { id: String(c.id), label, sub };
    });
    return NextResponse.json({ results });
  } catch (err) {
    console.error("HubSpot search error:", err);
    return NextResponse.json(
      { error: "HubSpot search failed" },
      { status: 500 },
    );
  }
}

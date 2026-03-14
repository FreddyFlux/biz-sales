"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

import {
  formatMonthOption,
  type MonthWithData,
} from "@/lib/utils/formatters";
import type { DayBreakdown } from "@/lib/api/activities";

const callsChartConfig = {
  connected: {
    label: "Connected",
    color: "var(--chart-1)",
  },
  noAnswer: {
    label: "No Answer",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

const meetingsChartConfig = {
  meetingsNew: {
    label: "New Customer",
    color: "var(--chart-3)",
  },
  meetingsExist: {
    label: "Existing Customer",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

const emailsChartConfig = {
  emails: {
    label: "Emails Sent",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig;

function getDefaultSelection(
  available: MonthWithData[],
  now: Date
): MonthWithData | null {
  const current = { year: now.getFullYear(), month: now.getMonth() + 1 };
  const found = available.find(
    (m) => m.year === current.year && m.month === current.month
  );
  return found ?? available[0] ?? null;
}

export function StatisticsClient() {
  const now = new Date();
  const [availableMonths, setAvailableMonths] = React.useState<MonthWithData[]>(
    []
  );
  const [selected, setSelected] = React.useState<MonthWithData | null>(null);
  const [breakdown, setBreakdown] = React.useState<DayBreakdown[] | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Fetch available months on mount
  React.useEffect(() => {
    async function load() {
      try {
        setError(null);
        const res = await fetch("/api/stats/statistics");
        if (!res.ok) throw new Error("Failed to fetch statistics");
        const data = await res.json();
        setAvailableMonths(data.availableMonths ?? []);
        const defaultSel = getDefaultSelection(
          data.availableMonths ?? [],
          now
        );
        setSelected(defaultSel);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load statistics");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Fetch breakdown when selection changes
  React.useEffect(() => {
    if (!selected) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(
      `/api/stats/statistics?year=${selected.year}&month=${selected.month}`
    )
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch");
        return r.json();
      })
      .then((data) => {
        if (!cancelled) setBreakdown(data.breakdown ?? []);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load data");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selected?.year, selected?.month]);

  const chartData = React.useMemo(() => {
    if (!breakdown?.length) return [];
    return breakdown.map((d) => ({
      date: d.day,
      calls: d.calls,
      connected: d.connected,
      noAnswer: d.calls - d.connected,
    }));
  }, [breakdown]);

  const meetingsChartData = React.useMemo(() => {
    if (!breakdown?.length) return [];
    return breakdown.map((d) => ({
      date: d.day,
      meetingsNew: d.meetingsNew,
      meetingsExist: d.meetingsExist,
    }));
  }, [breakdown]);

  const emailsChartData = React.useMemo(() => {
    if (!breakdown?.length) return [];
    return breakdown.map((d) => ({
      date: d.day,
      emails: d.emails,
    }));
  }, [breakdown]);

  const total = React.useMemo(
    () => ({
      calls: chartData.reduce((acc, curr) => acc + curr.calls, 0),
      connected: chartData.reduce((acc, curr) => acc + curr.connected, 0),
      meetingsBooked: meetingsChartData.reduce(
        (acc, curr) => acc + curr.meetingsNew + curr.meetingsExist,
        0
      ),
      emails: emailsChartData.reduce((acc, curr) => acc + curr.emails, 0),
    }),
    [chartData, meetingsChartData, emailsChartData]
  );

  if (error && availableMonths.length === 0) {
    return (
      <div
        style={{
          background: "linear-gradient(145deg, #0b1524 0%, #080f1e 100%)",
          border: "1px solid #dc2626",
          borderRadius: 16,
          padding: 32,
          textAlign: "center",
          color: "#fca5a5",
        }}
      >
        <p style={{ fontSize: 14, fontFamily: "var(--font-dm-mono), monospace", marginBottom: 12 }}>
          {error}
        </p>
        <button
          onClick={() => {
            setError(null);
            setLoading(true);
            window.location.reload();
          }}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            border: "1px solid #111d30",
            background: "#0b1524",
            color: "#ccdaf0",
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (loading && availableMonths.length === 0) {
    return (
      <div
        style={{
          background: "linear-gradient(145deg, #0b1524 0%, #080f1e 100%)",
          border: "1px solid #111d30",
          borderRadius: 16,
          padding: 32,
          textAlign: "center",
          color: "#8aa0c0",
        }}
      >
        <p style={{ fontSize: 14, fontFamily: "var(--font-dm-mono), monospace" }}>
          Loading statistics…
        </p>
      </div>
    );
  }

  if (availableMonths.length === 0) {
    return (
      <div
        style={{
          background: "linear-gradient(145deg, #0b1524 0%, #080f1e 100%)",
          border: "1px solid #111d30",
          borderRadius: 16,
          padding: 32,
          textAlign: "center",
          color: "#8aa0c0",
        }}
      >
        <p
          style={{
            fontSize: 14,
            fontFamily: "var(--font-dm-mono), monospace",
            marginBottom: 8,
          }}
        >
          Statistics & reports
        </p>
        <p style={{ fontSize: 12, color: "#49679a" }}>
          No data yet. Start logging calls, meetings, and emails to see your
          statistics.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "linear-gradient(145deg, #0b1524 0%, #080f1e 100%)",
        border: "1px solid #111d30",
        borderRadius: 16,
        padding: 24,
        display: "flex",
        flexDirection: "column",
        gap: 24,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <h2
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: "#dce8f8",
            fontFamily: "var(--font-dm-mono), monospace",
          }}
        >
          Statistics & reports
        </h2>
        {error && (
          <div
            style={{
              padding: "12px 16px",
              borderRadius: 8,
              background: "rgba(220, 38, 38, 0.15)",
              border: "1px solid #dc2626",
              color: "#fca5a5",
              fontSize: 14,
            }}
          >
            {error}
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <label
            htmlFor="month-filter"
            style={{ fontSize: 13, color: "#8aa0c0" }}
          >
            Period:
          </label>
          <select
            id="month-filter"
            value={
              selected
                ? `${selected.year}-${String(selected.month).padStart(2, "0")}`
                : ""
            }
            onChange={(e) => {
              const v = e.target.value;
              if (!v) return;
              const [y, m] = v.split("-").map(Number);
              setSelected({ year: y, month: m });
            }}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid #111d30",
              background: "#0b1524",
              color: "#ccdaf0",
              fontSize: 14,
              fontFamily: "var(--font-dm-mono), monospace",
            }}
          >
            {availableMonths.map((m) => (
              <option
                key={`${m.year}-${m.month}`}
                value={`${m.year}-${String(m.month).padStart(2, "0")}`}
              >
                {formatMonthOption(m)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Card
        className="border-[#111d30] bg-[#0b1524]/80"
        style={{ borderColor: "#111d30" }}
      >
        <CardHeader className="flex flex-col items-stretch border-b border-[#111d30] p-0 sm:flex-row">
          <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:py-6">
            <CardTitle className="text-[#dce8f8]">
              Calls – {selected ? formatMonthOption(selected) : ""}
            </CardTitle>
            <CardDescription className="text-[#8aa0c0]">
              Daily call volume for the selected month
            </CardDescription>
          </div>
          <div className="flex">
            <div className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t border-[#111d30] px-6 py-4 text-left sm:border-t-0 sm:border-l sm:px-8 sm:py-6">
              <span className="text-xs text-[#8aa0c0]">Calls</span>
              <span className="text-lg font-bold leading-none text-[#dce8f8] sm:text-3xl">
                {total.calls.toLocaleString()}
              </span>
            </div>
            <div className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t border-l border-[#111d30] px-6 py-4 text-left sm:px-8 sm:py-6">
              <span className="text-xs text-[#8aa0c0]">Connected</span>
              <span className="text-lg font-bold leading-none text-[#dce8f8] sm:text-3xl">
                {total.connected.toLocaleString()}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-2 sm:p-6">
          {loading ? (
            <div
              className="flex h-[250px] items-center justify-center text-[#8aa0c0]"
              style={{ fontFamily: "var(--font-dm-mono), monospace" }}
            >
              Loading chart…
            </div>
          ) : chartData.length === 0 ? (
            <div
              className="flex h-[250px] items-center justify-center text-[#8aa0c0]"
              style={{ fontFamily: "var(--font-dm-mono), monospace" }}
            >
              No data for this month
            </div>
          ) : (
            <ChartContainer
              config={callsChartConfig}
              className="aspect-auto h-[250px] w-full"
            >
              <BarChart
                accessibilityLayer
                data={chartData}
                margin={{ left: 12, right: 12 }}
              >
                <CartesianGrid vertical={false} stroke="#111d30" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={32}
                  tick={{ fill: "#8aa0c0" }}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      className="w-[150px] border-[#111d30] bg-[#0b1524]"
                      hideLabel={false}
                      labelFormatter={(value) => {
                        return new Date(value).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        });
                      }}
                    />
                  }
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar
                  dataKey="noAnswer"
                  stackId="a"
                  fill="var(--color-noAnswer)"
                  radius={[0, 0, 4, 4]}
                />
                <Bar
                  dataKey="connected"
                  stackId="a"
                  fill="var(--color-connected)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      <Card
        className="border-[#111d30] bg-[#0b1524]/80"
        style={{ borderColor: "#111d30" }}
      >
        <CardHeader className="flex flex-col items-stretch border-b border-[#111d30] p-0 sm:flex-row">
          <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:py-6">
            <CardTitle className="text-[#dce8f8]">
              Meetings Booked – {selected ? formatMonthOption(selected) : ""}
            </CardTitle>
            <CardDescription className="text-[#8aa0c0]">
              Daily meetings booked for the selected month
            </CardDescription>
          </div>
          <div className="flex">
            <div className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t border-[#111d30] px-6 py-4 text-left sm:border-t-0 sm:border-l sm:px-8 sm:py-6">
              <span className="text-xs text-[#8aa0c0]">Total</span>
              <span className="text-lg font-bold leading-none text-[#dce8f8] sm:text-3xl">
                {total.meetingsBooked.toLocaleString()}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-2 sm:p-6">
          {loading ? (
            <div
              className="flex h-[250px] items-center justify-center text-[#8aa0c0]"
              style={{ fontFamily: "var(--font-dm-mono), monospace" }}
            >
              Loading chart…
            </div>
          ) : meetingsChartData.length === 0 ? (
            <div
              className="flex h-[250px] items-center justify-center text-[#8aa0c0]"
              style={{ fontFamily: "var(--font-dm-mono), monospace" }}
            >
              No data for this month
            </div>
          ) : (
            <ChartContainer
              config={meetingsChartConfig}
              className="aspect-auto h-[250px] w-full"
            >
              <BarChart
                accessibilityLayer
                data={meetingsChartData}
                margin={{ left: 12, right: 12 }}
              >
                <CartesianGrid vertical={false} stroke="#111d30" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={32}
                  tick={{ fill: "#8aa0c0" }}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      className="w-[150px] border-[#111d30] bg-[#0b1524]"
                      hideLabel={false}
                      labelFormatter={(value) => {
                        return new Date(value).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        });
                      }}
                    />
                  }
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar
                  dataKey="meetingsExist"
                  stackId="a"
                  fill="var(--color-meetingsExist)"
                  radius={[0, 0, 4, 4]}
                />
                <Bar
                  dataKey="meetingsNew"
                  stackId="a"
                  fill="var(--color-meetingsNew)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      <Card
        className="border-[#111d30] bg-[#0b1524]/80"
        style={{ borderColor: "#111d30" }}
      >
        <CardHeader className="flex flex-col items-stretch border-b border-[#111d30] p-0 sm:flex-row">
          <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:py-6">
            <CardTitle className="text-[#dce8f8]">
              Emails Sent – {selected ? formatMonthOption(selected) : ""}
            </CardTitle>
            <CardDescription className="text-[#8aa0c0]">
              Daily emails sent for the selected month
            </CardDescription>
          </div>
          <div className="flex">
            <div className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t border-[#111d30] px-6 py-4 text-left sm:border-t-0 sm:border-l sm:px-8 sm:py-6">
              <span className="text-xs text-[#8aa0c0]">Total</span>
              <span className="text-lg font-bold leading-none text-[#dce8f8] sm:text-3xl">
                {total.emails.toLocaleString()}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-2 sm:p-6">
          {loading ? (
            <div
              className="flex h-[250px] items-center justify-center text-[#8aa0c0]"
              style={{ fontFamily: "var(--font-dm-mono), monospace" }}
            >
              Loading chart…
            </div>
          ) : emailsChartData.length === 0 ? (
            <div
              className="flex h-[250px] items-center justify-center text-[#8aa0c0]"
              style={{ fontFamily: "var(--font-dm-mono), monospace" }}
            >
              No data for this month
            </div>
          ) : (
            <ChartContainer
              config={emailsChartConfig}
              className="aspect-auto h-[250px] w-full"
            >
              <BarChart
                accessibilityLayer
                data={emailsChartData}
                margin={{ left: 12, right: 12 }}
              >
                <CartesianGrid vertical={false} stroke="#111d30" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={32}
                  tick={{ fill: "#8aa0c0" }}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      className="w-[150px] border-[#111d30] bg-[#0b1524]"
                      hideLabel={false}
                      labelFormatter={(value) => {
                        return new Date(value).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        });
                      }}
                    />
                  }
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar
                  dataKey="emails"
                  fill="var(--color-emails)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

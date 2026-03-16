"use client";

export function BenchBar({
  label,
  value,
  avg,
  record,
  color,
  weekValue,
  prevWeek,
  weekRec,
}: {
  label: string;
  value: number;
  avg: number;
  record: number;
  color: string;
  weekValue?: number;
  prevWeek?: number;
  weekRec?: number;
}) {
  const pct = record > 0 ? Math.min((value / record) * 100, 100) : 0;
  const avgPct = record > 0 ? (avg / record) * 100 : 0;
  const overAvg = value >= avg && avg > 0;
  const overRec = value >= record && record > 0;
  const fill =
    overRec ? "#fbbf24" : overAvg ? "#22c55e" : color;

  const weekPct =
    weekValue != null && weekRec != null && weekRec > 0
      ? Math.min((weekValue / weekRec) * 100, 100)
      : 0;
  const prevWeekPct =
    prevWeek != null && weekRec != null && weekRec > 0
      ? (prevWeek / weekRec) * 100
      : 0;
  const overPrevWeek =
    weekValue != null &&
    prevWeek != null &&
    weekValue >= prevWeek &&
    prevWeek > 0;
  const overWeekRec =
    weekValue != null &&
    weekRec != null &&
    weekValue >= weekRec &&
    weekRec > 0;
  const weekFill =
    overWeekRec ? "#fbbf24" : overPrevWeek ? "#22c55e" : "#4f8fff";

  const hasWeek =
    weekValue != null && prevWeek != null && weekRec != null;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        fontFamily: "var(--font-dm-mono), monospace",
        fontSize: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ color: "#8aa0c0", fontWeight: 600, minWidth: 100 }}>
          {label}
        </span>
        <div
          style={{
            flex: 1,
            display: "flex",
            gap: 8,
            alignItems: "center",
            minWidth: 0,
          }}
        >
          {/* Today */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 2,
              minWidth: 0,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  color: "#5e81b4",
                  fontWeight: 700,
                  fontSize: 9,
                  textTransform: "uppercase",
                }}
              >
                Today
              </span>
              <span>
                <span style={{ color: fill, fontWeight: 700 }}>{value}</span>
                <span style={{ color: "#2a3d5a" }}>
                  {" "}
                  · avg {avg} · rec {record}
                </span>
              </span>
            </div>
            <div
              style={{
                height: 4,
                background: "#111d2e",
                borderRadius: 2,
                position: "relative",
                overflow: "hidden",
              }}
            >
              {avgPct > 0 && (
                <div
                  style={{
                    position: "absolute",
                    left: `${avgPct}%`,
                    top: -1,
                    width: 1,
                    height: 6,
                    background: "#22c55e55",
                  }}
                />
              )}
              <div
                style={{
                  width: `${pct}%`,
                  height: "100%",
                  borderRadius: 2,
                  background: fill,
                  transition: "width 0.35s ease",
                }}
              />
            </div>
          </div>
          {/* Week */}
          {hasWeek && (
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: 2,
                minWidth: 0,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    color: "#5e81b4",
                    fontWeight: 700,
                    fontSize: 9,
                    textTransform: "uppercase",
                  }}
                >
                  Week
                </span>
                <span>
                  <span style={{ color: weekFill, fontWeight: 700 }}>
                    {weekValue}
                  </span>
                  <span style={{ color: "#2a3d5a" }}>
                    {" "}
                    · prev week {prevWeek} · rec {weekRec}
                  </span>
                </span>
              </div>
              <div
                style={{
                  height: 4,
                  background: "#111d2e",
                  borderRadius: 2,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {prevWeekPct > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      left: `${prevWeekPct}%`,
                      top: -1,
                      width: 1,
                      height: 6,
                      background: "#22c55e55",
                    }}
                  />
                )}
                <div
                  style={{
                    width: `${weekPct}%`,
                    height: "100%",
                    borderRadius: 2,
                    background: weekFill,
                    transition: "width 0.35s ease",
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

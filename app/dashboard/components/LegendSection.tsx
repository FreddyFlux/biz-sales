"use client";

const LEGEND_ITEMS = [
  ["Ring fill", "vs avg day"],
  ["Green ring", "above average"],
  ["Gold ring", "new record"],
  ["Thin ring", "vs record"],
] as const;

const LEGEND_COLORS = ["#4f8fff", "#22c55e", "#fbbf24", "#2a3d5a"] as const;

export function LegendSection() {
  return (
    <div
      style={{
        display: "flex",
        gap: 16,
        justifyContent: "center",
        flexWrap: "wrap",
        paddingTop: 4,
      }}
    >
      {LEGEND_ITEMS.map(([k, v], i) => (
        <div
          key={k}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            fontSize: 10,
            color: "#445e81",
            fontFamily: "var(--font-dm-mono), monospace",
          }}
        >
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: 2,
              background: LEGEND_COLORS[i],
            }}
          />
          <span>
            <span style={{ color: "#5e81b4" }}>{k}</span> = {v}
          </span>
        </div>
      ))}
    </div>
  );
}

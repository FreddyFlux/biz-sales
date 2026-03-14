"use client";

import { Undo2 } from "lucide-react";

export function DailyStatsHeader({
  today,
  overallPct,
  isLoading,
  pctColor,
  daysLogged,
  undoStackLength,
  onUndo,
  undoing,
  loading,
}: {
  today: string;
  overallPct: number;
  isLoading: boolean;
  pctColor: string;
  daysLogged: number;
  undoStackLength: number;
  onUndo: () => void;
  undoing: boolean;
  loading: string | null;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
      }}
    >
      <div>
        <p
          style={{
            fontSize: 11,
            color: "#49679a",
            fontFamily: "var(--font-dm-mono), monospace",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          {today}
        </p>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 6,
        }}
      >
        <div
          style={{
            background: `${pctColor}15`,
            border: `1px solid ${pctColor}30`,
            borderRadius: 12,
            padding: "7px 14px",
            textAlign: "center",
            minWidth: 76,
          }}
        >
          <div
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: pctColor,
              fontFamily: "var(--font-dm-mono), monospace",
            }}
          >
            {isLoading ? "—" : `${overallPct}%`}
          </div>
          <div
            style={{
              fontSize: 9,
              color: "#49679a",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginTop: 1,
            }}
          >
            of avg day
          </div>
        </div>
        <div
          style={{
            fontSize: 10,
            color: "#445e81",
            fontFamily: "var(--font-dm-mono), monospace",
          }}
        >
          {daysLogged} days logged
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {undoStackLength > 0 && (
            <button
              type="button"
              onClick={onUndo}
              disabled={undoing || loading !== null}
              style={{
                background: "#1a284015",
                border: "1px solid #1a2840",
                borderRadius: 8,
                padding: "6px 12px",
                fontSize: 11,
                fontWeight: 600,
                color: "#8aa0c0",
                cursor: undoing || loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Undo2 size={12} />
              Undo {undoStackLength > 1 ? `(${undoStackLength})` : ""}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

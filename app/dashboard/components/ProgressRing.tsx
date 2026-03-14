"use client";

export function ProgressRing({
  value,
  average,
  record,
  size = 84,
  label,
  color,
}: {
  value: number;
  average: number;
  record: number;
  size?: number;
  label: string;
  color: string;
}) {
  const pctAvg = average > 0 ? Math.min(value / average, 1.5) : 0;
  const pctRecord = record > 0 ? Math.min(value / record, 1.0) : 0;
  const r = (size - 14) / 2;
  const circ = 2 * Math.PI * r;
  const overAvg = value >= average && average > 0;
  const overRec = value >= record && record > 0;
  const ringColor =
    overRec ? "#fbbf24" : overAvg ? "#22c55e" : color;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
      }}
    >
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#1e2d45"
          strokeWidth={9}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#2a3d5a"
          strokeWidth={3}
          strokeDasharray={`${pctRecord * circ} ${circ}`}
          strokeLinecap="round"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={ringColor}
          strokeWidth={9}
          strokeDasharray={`${pctAvg * circ} ${circ}`}
          strokeLinecap="round"
          style={{
            transition: "stroke-dasharray 0.4s ease, stroke 0.3s",
          }}
        />
        <text
          x={size / 2}
          y={size / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={ringColor}
          fontSize={size * 0.21}
          fontWeight="700"
          fontFamily="var(--font-dm-mono), monospace"
          style={{
            transform: "rotate(90deg)",
            transformOrigin: `${size / 2}px ${size / 2}px`,
            transition: "fill 0.3s",
          }}
        >
          {value}
        </text>
      </svg>
      <span
        style={{
          fontSize: 10,
          color: "#769acc",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          fontWeight: 700,
          fontFamily: "var(--font-dm-mono), monospace",
        }}
      >
        {label}
      </span>
    </div>
  );
}

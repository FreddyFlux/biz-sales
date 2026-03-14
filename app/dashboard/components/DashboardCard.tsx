"use client";

export function DashboardCard({
  title,
  icon,
  accent,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "linear-gradient(145deg, #0b1524 0%, #0e1a2e 100%)",
        border: "1px solid #1a2840",
        borderRadius: 16,
        padding: "20px 22px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -20,
          right: -20,
          width: 120,
          height: 120,
          background: `radial-gradient(circle, ${accent}18, transparent 65%)`,
          pointerEvents: "none",
        }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        <span style={{ fontSize: 15 }}>{icon}</span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "#5e81b4",
            textTransform: "uppercase",
            letterSpacing: "0.12em",
          }}
        >
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}

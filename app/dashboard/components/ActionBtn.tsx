"use client";

import { useState } from "react";

export function ActionBtn({
  label,
  onClick,
  color,
  count,
  disabled,
}: {
  label: string;
  onClick: () => void;
  color: string;
  count: number;
  disabled: boolean;
}) {
  const [flash, setFlash] = useState(false);
  const handleClick = () => {
    if (disabled) return;
    onClick();
    setFlash(true);
    setTimeout(() => setFlash(false), 280);
  };
  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      style={{
        flex: 1,
        background: flash ? color : `${color}15`,
        border: `1px solid ${color}40`,
        borderRadius: 10,
        color: flash ? "#060d1a" : color,
        padding: "11px 14px",
        fontFamily: "var(--font-syne), sans-serif",
        fontSize: 13,
        fontWeight: 700,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        transition: "all 0.12s ease",
      }}
    >
      <span>{label}</span>
      <span
        style={{
          background: flash ? "#06090f40" : `${color}25`,
          borderRadius: 20,
          padding: "2px 9px",
          fontSize: 12,
          fontWeight: 800,
          fontFamily: "var(--font-dm-mono), monospace",
          minWidth: 28,
          textAlign: "center",
        }}
      >
        {count}
      </span>
    </button>
  );
}

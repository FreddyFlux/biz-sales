"use client";

import { LogOut, Trash2 } from "lucide-react";

export function ActionsFooter({
  hasData,
  onDeleteToday,
  onSignOut,
  deletingToday,
  loading,
}: {
  hasData: boolean;
  onDeleteToday: () => void;
  onSignOut: () => void;
  deletingToday: boolean;
  loading: string | null;
}) {
  const isDisabled = deletingToday || loading !== null;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        paddingTop: 4,
      }}
    >
      {hasData ? (
        <button
          type="button"
          onClick={onDeleteToday}
          disabled={isDisabled}
          style={{
            background: "transparent",
            border: "1px solid #ff6e4040",
            borderRadius: 8,
            padding: "8px 16px",
            fontSize: 11,
            fontWeight: 600,
            color: "#ff6e40",
            cursor: isDisabled ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            opacity: isDisabled ? 0.5 : 1,
          }}
        >
          <Trash2 size={12} />
          Delete today&apos;s data
        </button>
      ) : (
        <span />
      )}
      <button
        type="button"
        onClick={onSignOut}
        style={{
          background: "transparent",
          border: "1px solid #1a2840",
          borderRadius: 8,
          padding: "8px 16px",
          fontSize: 11,
          fontWeight: 600,
          color: "#8aa0c0",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <LogOut size={12} />
        Sign out
      </button>
    </div>
  );
}

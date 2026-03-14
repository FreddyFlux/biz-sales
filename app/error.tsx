"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Route error:", error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#060d1a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        fontFamily: "var(--font-dm-mono), monospace",
        color: "#ccdaf0",
      }}
    >
      <h1
        style={{
          fontSize: 20,
          fontWeight: 700,
          color: "#dce8f8",
          marginBottom: 8,
        }}
      >
        Something went wrong
      </h1>
      <p
        style={{
          fontSize: 14,
          color: "#8aa0c0",
          marginBottom: 24,
          textAlign: "center",
          maxWidth: 400,
        }}
      >
        An unexpected error occurred. Please try again.
      </p>
      <Button
        onClick={reset}
        variant="outline"
        style={{
          borderColor: "#111d30",
          background: "#0b1524",
          color: "#ccdaf0",
        }}
      >
        Try again
      </Button>
    </div>
  );
}

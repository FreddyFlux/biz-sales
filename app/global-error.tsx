"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="en" className="dark">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          background: "#060d1a",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          fontFamily: "'DM Mono', monospace",
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
          A critical error occurred. Please refresh the page or try again later.
        </p>
        <button
          onClick={reset}
          style={{
            padding: "10px 20px",
            borderRadius: 8,
            border: "1px solid #111d30",
            background: "#0b1524",
            color: "#ccdaf0",
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}

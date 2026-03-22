"use client";

import {
  useState,
  useCallback,
  useRef,
  useEffect,
  useLayoutEffect,
} from "react";
import { DashboardCard } from "./DashboardCard";

const LOCAL_RECORDER_URL = "http://localhost:5050";

type HubSpotResult = { id: string; label: string; sub: string };

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  borderRadius: 8,
  border: "1px solid #1a2840",
  background: "#060d1a",
  color: "#c8d8f0",
  fontFamily: "var(--font-syne), sans-serif",
  fontSize: 13,
  fontWeight: 500,
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.15s ease",
};

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  color: "#5e81b4",
  fontFamily: "var(--font-dm-mono), monospace",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  marginBottom: 4,
  display: "block",
};

function SearchInput({
  label,
  placeholder,
  type,
  onSelect,
  disabled,
}: {
  label: string;
  placeholder: string;
  type: "contacts" | "companies";
  onSelect: (result: HubSpotResult) => void;
  disabled: boolean;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<HubSpotResult[]>([]);
  const [selected, setSelected] = useState<HubSpotResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listScrollRef = useRef<HTMLDivElement>(null);
  const [scrollFade, setScrollFade] = useState({
    canScroll: false,
    showTop: false,
    showBottom: false,
  });

  const updateScrollFade = useCallback(() => {
    const el = listScrollRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const canScroll = scrollHeight > clientHeight + 1;
    const showTop = canScroll && scrollTop > 2;
    const showBottom = canScroll && scrollTop + clientHeight < scrollHeight - 2;
    setScrollFade({ canScroll, showTop, showBottom });
  }, []);

  useLayoutEffect(() => {
    if (!open || results.length === 0) return;
    updateScrollFade();
  }, [open, results, updateScrollFade]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleChange = (value: string) => {
    setQuery(value);
    setSelected(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/hubspot/search?q=${encodeURIComponent(value)}&type=${type}`,
        );
        const data = await res.json();
        setResults(data.results ?? []);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  const handleSelect = (result: HubSpotResult) => {
    setSelected(result);
    setQuery(result.label);
    setResults([]);
    setOpen(false);
    onSelect(result);
  };

  const handleClear = () => {
    setSelected(null);
    setQuery("");
    setResults([]);
    onSelect({ id: "", label: "", sub: "" });
  };

  return (
    <div ref={wrapperRef} style={{ position: "relative" }}>
      <label style={labelStyle}>{label}</label>
      <div style={{ position: "relative" }}>
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          disabled={disabled}
          style={{
            ...inputStyle,
            borderColor: selected ? "#4f8fff40" : "#1a2840",
            paddingRight: selected ? 32 : 12,
          }}
        />
        {selected && (
          <button
            type="button"
            onClick={handleClear}
            style={{
              position: "absolute",
              right: 8,
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              color: "#5e81b4",
              cursor: "pointer",
              fontSize: 14,
              padding: 2,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        )}
      </div>

      {selected && (
        <div
          style={{
            fontSize: 10,
            color: "#4f8fff",
            fontFamily: "var(--font-dm-mono), monospace",
            marginTop: 3,
          }}
        >
          ✓ Matched HubSpot ID {selected.id}
        </div>
      )}

      {loading && (
        <div
          style={{
            fontSize: 10,
            color: "#3a5070",
            fontFamily: "var(--font-dm-mono), monospace",
            marginTop: 3,
          }}
        >
          Searching...
        </div>
      )}

      {open && results.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            marginTop: 4,
            background: "#0b1524",
            border: "1px solid #1a2840",
            borderRadius: 8,
            zIndex: 50,
            overflow: "hidden",
          }}
        >
          {scrollFade.showTop && (
            <div
              aria-hidden
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
                height: 20,
                pointerEvents: "none",
                zIndex: 1,
                background:
                  "linear-gradient(to bottom, #0b1524, rgba(11,21,36,0))",
              }}
            />
          )}
          <div
            ref={listScrollRef}
            className="call-recording-search-dropdown-scroll"
            onScroll={updateScrollFade}
            style={{
              maxHeight: 220,
              overflowY: "auto",
              overflowX: "hidden",
            }}
          >
            {results.map((r, i) => (
              <button
                key={r.id}
                type="button"
                onClick={() => handleSelect(r)}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "9px 12px",
                  background: "none",
                  border: "none",
                  borderBottom:
                    i < results.length - 1 ? "1px solid #1a2840" : "none",
                  color: "#c8d8f0",
                  fontFamily: "var(--font-syne), sans-serif",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                {r.label}
                {r.sub && (
                  <span
                    style={{
                      display: "block",
                      fontSize: 11,
                      color: "#5e81b4",
                      fontFamily: "var(--font-dm-mono), monospace",
                      fontWeight: 400,
                      marginTop: 1,
                    }}
                  >
                    {r.sub}
                  </span>
                )}
              </button>
            ))}
          </div>
          {scrollFade.showBottom && (
            <div
              aria-hidden
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                height: 24,
                pointerEvents: "none",
                zIndex: 1,
                background:
                  "linear-gradient(to top, #0b1524, rgba(11,21,36,0))",
              }}
            />
          )}
        </div>
      )}

      {open && results.length === 0 && !loading && query.length >= 2 && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            marginTop: 4,
            background: "#0b1524",
            border: "1px solid #1a2840",
            borderRadius: 8,
            padding: "9px 12px",
            fontSize: 12,
            color: "#3a5070",
            fontFamily: "var(--font-dm-mono), monospace",
            zIndex: 50,
          }}
        >
          No results found
        </div>
      )}
    </div>
  );
}

export function CallRecordingSection() {
  const [contact, setContact] = useState<HubSpotResult | null>(null);
  const [company, setCompany] = useState<HubSpotResult | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const canRecord = !!contact?.id && !!company?.id;

  const toggleRecording = useCallback(async () => {
    setError(null);

    if (!canRecord && !isRecording) {
      setError("Select a contact and company before recording.");
      return;
    }

    const endpoint = isRecording ? "/stop" : "/start";

    try {
      const res = await fetch(`${LOCAL_RECORDER_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body:
          isRecording ?
            JSON.stringify({
              contactId: contact?.id,
              contactName: contact?.label,
              companyId: company?.id,
              companyName: company?.label,
            })
          : undefined,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message ?? "Recorder error");
        return;
      }

      if (isRecording) {
        setSending(true);
        setContact(null);
        setCompany(null);
        setTimeout(() => setSending(false), 4000);
      }

      setIsRecording((prev) => !prev);
    } catch {
      setError("Could not reach local recorder. Is call_recorder.py running?");
    }
  }, [isRecording, contact, company, canRecord]);

  return (
    <DashboardCard title="Call Recording" icon="🎙" accent="#ff4444">
      <style>{`
        @keyframes recording-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255,68,68,0.4); }
          50%       { box-shadow: 0 0 0 8px rgba(255,68,68,0); }
        }
        @keyframes dot-blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.2; }
        }
        .call-recording-search-dropdown-scroll {
          scrollbar-width: thin;
          scrollbar-color: #3a5070 #0a1422;
        }
        .call-recording-search-dropdown-scroll::-webkit-scrollbar {
          width: 8px;
        }
        .call-recording-search-dropdown-scroll::-webkit-scrollbar-track {
          background: #0a1422;
          border-radius: 0 8px 8px 0;
        }
        .call-recording-search-dropdown-scroll::-webkit-scrollbar-thumb {
          background: #3a5070;
          border-radius: 4px;
          border: 2px solid #0a1422;
        }
        .call-recording-search-dropdown-scroll::-webkit-scrollbar-thumb:hover {
          background: #4f6a8f;
        }
      `}</style>

      {!isRecording && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <SearchInput
            label="Contact"
            placeholder='Search HubSpot e.g. "Brian"'
            type="contacts"
            onSelect={setContact}
            disabled={isRecording}
          />
          <SearchInput
            label="Company"
            placeholder='Search HubSpot e.g. "HubSpot"'
            type="companies"
            onSelect={setCompany}
            disabled={isRecording}
          />
        </div>
      )}

      {isRecording && (
        <div
          style={{
            padding: "10px 12px",
            background: "rgba(255,68,68,0.06)",
            borderRadius: 8,
            border: "1px solid rgba(255,68,68,0.15)",
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: "#5e81b4",
              fontFamily: "var(--font-dm-mono), monospace",
            }}
          >
            Recording call with
          </div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#c8d8f0",
              fontFamily: "var(--font-syne), sans-serif",
              marginTop: 2,
            }}
          >
            {contact?.label}
          </div>
          <div
            style={{
              fontSize: 11,
              color: "#5e81b4",
              fontFamily: "var(--font-dm-mono), monospace",
              marginTop: 1,
            }}
          >
            {company?.label}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={toggleRecording}
        disabled={!isRecording && !canRecord}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          padding: "11px 14px",
          borderRadius: 10,
          border: isRecording ? "1px solid #ff444480" : "1px solid #ff444440",
          background:
            isRecording ? "rgba(255,68,68,0.15)"
            : canRecord ? "rgba(255,68,68,0.08)"
            : "rgba(255,68,68,0.03)",
          color:
            isRecording ? "#ff6666"
            : canRecord ? "#ff6666"
            : "#ff444450",
          fontFamily: "var(--font-syne), sans-serif",
          fontSize: 13,
          fontWeight: 700,
          cursor: isRecording || canRecord ? "pointer" : "not-allowed",
          transition: "all 0.12s ease",
          animation: isRecording ? "recording-pulse 1.5s infinite" : "none",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {isRecording ?
            <span
              style={{
                display: "inline-block",
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#ff4444",
                animation: "dot-blink 1s infinite",
              }}
            />
          : <span style={{ fontSize: 15 }}>🎙</span>}
          {isRecording ? "Stop Recording" : "Record Call"}
        </span>
        <span
          style={{
            background:
              isRecording ? "rgba(255,68,68,0.25)" : "rgba(255,68,68,0.12)",
            borderRadius: 20,
            padding: "2px 9px",
            fontSize: 11,
            fontWeight: 800,
            fontFamily: "var(--font-dm-mono), monospace",
            color: isRecording ? "#ff8888" : "#ff6666",
          }}
        >
          {isRecording ? "REC" : "OFF"}
        </span>
      </button>

      {sending && (
        <div
          style={{
            fontSize: 11,
            color: "#5e81b4",
            fontFamily: "var(--font-dm-mono), monospace",
            padding: "4px 8px",
          }}
        >
          ⏳ Sending to HubSpot...
        </div>
      )}

      {error && (
        <div
          style={{
            fontSize: 11,
            color: "#ff8888",
            fontFamily: "var(--font-dm-mono), monospace",
            padding: "4px 8px",
            background: "rgba(255,68,68,0.08)",
            borderRadius: 6,
            border: "1px solid rgba(255,68,68,0.2)",
          }}
        >
          ⚠ {error}
        </div>
      )}

      {!isRecording && !canRecord && !error && (
        <div
          style={{
            fontSize: 11,
            color: "#3a5070",
            fontFamily: "var(--font-dm-mono), monospace",
          }}
        >
          Search and select a contact + company to enable recording
        </div>
      )}
    </DashboardCard>
  );
}

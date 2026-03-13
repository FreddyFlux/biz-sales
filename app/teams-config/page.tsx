"use client";

import Script from "next/script";
import { useState } from "react";

declare global {
  interface Window {
    microsoftTeams?: {
      app: { initialize: () => Promise<void> };
      pages: {
        config: {
          setValidityState: (valid: boolean) => void;
          registerOnSaveHandler: (handler: (saveEvent: { notifySuccess: () => void }) => void) => void;
          setConfig: (config: { contentUrl: string; websiteUrl: string; suggestedDisplayName: string }) => void;
        };
      };
    };
  }
}

function initTeams() {
  if (typeof window === "undefined" || !window.microsoftTeams) return;
  const teams = window.microsoftTeams;
  teams.app.initialize().then(() => {
    teams.pages.config.setValidityState(true);
    teams.pages.config.registerOnSaveHandler((saveEvent) => {
      const baseUrl = window.location.origin;
      const tabUrl = `${baseUrl}/dashboard`;
      teams.pages.config.setConfig({
        contentUrl: tabUrl,
        websiteUrl: tabUrl,
        suggestedDisplayName: "Sales Tracker",
      });
      saveEvent.notifySuccess();
    });
  });
}

export default function TeamsConfigPage() {
  const [status, setStatus] = useState("Loading Teams SDK...");

  return (
    <>
      <Script
        src="https://res.cdn.office.net/teams-js/2.0.0/js/MicrosoftTeams.min.js"
        strategy="afterInteractive"
        onLoad={() => {
          initTeams();
          setStatus("Ready. Click Save in Teams to add the tab.");
        }}
      />
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">{status}</p>
      </div>
    </>
  );
}

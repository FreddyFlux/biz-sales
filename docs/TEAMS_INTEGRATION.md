# Microsoft Teams Integration Guide

This guide explains how to integrate your Sales Tracker app (deployed on Vercel) into Microsoft Teams as a tab or full app.

---

## Prerequisites

- **Vercel deployment URL**: Your app must be live (e.g. `https://sales-tracker.vercel.app` or your custom domain)
- **Microsoft 365 account**: Admin access if you want to distribute the app organization-wide
- **Teams client**: Desktop, web, or mobile

---

## Part 1: Prepare Your App for Embedding

Teams loads your app inside an iframe. You must ensure your app allows this.

### 1.1 Allow iframe embedding

Add headers so Teams can embed your app. Create or update `next.config.ts`:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "ALLOWALL", // Or use "SAMEORIGIN" - Teams needs ALLOWALL for cross-origin
          },
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors https://*.teams.microsoft.com https://*.teams.live.com https://*.skype.com https://*.teams.microsoft.us https://*.gov.teams.microsoft.us 'self'",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

**Note**: `X-Frame-Options: ALLOWALL` is not a standard value. The standard approach is to **omit** `X-Frame-Options` and use only `Content-Security-Policy: frame-ancestors` to allow embedding. If you have both, `frame-ancestors` takes precedence in modern browsers.

**Recommended** – use only CSP:

```ts
{
  key: "Content-Security-Policy",
  value: "frame-ancestors https://*.teams.microsoft.com https://*.teams.live.com https://*.skype.com https://*.teams.microsoft.us https://*.gov.teams.microsoft.us 'self'",
}
```

### 1.2 Cookie settings for iframe auth

Your app uses Neon Auth with cookies. In an iframe (third-party context), cookies may be blocked unless they use `SameSite=None; Secure`.

Check your Neon Auth configuration. If cookies are not set with `SameSite=None` for cross-site embedding, you may need to:

- Configure Neon Auth to use `SameSite=None` and `Secure` for the auth cookie when the app is loaded in Teams
- Or use a different auth flow (e.g. Teams SSO) for the embedded experience

### 1.3 Optional: Detect Teams context

You can detect when the app runs inside Teams and adjust behavior (e.g. hide header, resize):

```ts
// lib/teams.ts
export function isInTeams(): boolean {
  if (typeof window === "undefined") return false;
  return window.self !== window.top;
}
```

---

## Part 2: Option A – Add as Website Tab (Simplest)

No manifest or packaging required. Good for personal or small-team use.

### Step 1: Open a Team or Chat

1. Open Microsoft Teams
2. Go to a **Team** channel or a **Chat**

### Step 2: Add a tab

1. Click **+** (Add a tab) at the top of the channel/chat
2. Search for **"Website"** or **"Link"**
3. Select **Website** (or **Link** if available)

### Step 3: Configure the tab

1. **Tab name**: e.g. `Sales Tracker`
2. **URL**: Your Vercel URL, e.g. `https://your-app.vercel.app/dashboard`
3. Click **Save**

### Step 4: Use the tab

The tab will load your app in an iframe. Users will need to sign in to your app (Neon Auth) inside the tab if they are not already logged in.

**Limitations**:
- No custom icon in the tab picker
- No organization-wide distribution
- Manual setup per channel/chat

---

## Part 3: Option B – Full Teams App (Manifest Package)

For organization-wide distribution, custom branding, and a proper app experience.

### Step 1: Create the manifest

Create a folder `teams-app` in your project with these files:

#### `teams-app/manifest.json`

```json
{
  "$schema": "https://developer.microsoft.com/en-us/json-schemas/teams/v1.16/MicrosoftTeams.schema.json",
  "manifestVersion": "1.16",
  "version": "1.0.0",
  "id": "YOUR-APP-ID-GUID",
  "packageName": "com.yourcompany.salestracker",
  "developer": {
    "name": "Your Company Name",
    "websiteUrl": "https://your-app.vercel.app",
    "privacyUrl": "https://your-app.vercel.app/privacy",
    "termsOfUseUrl": "https://your-app.vercel.app/terms"
  },
  "icons": {
    "color": "color.png",
    "outline": "outline.png"
  },
  "name": {
    "short": "Sales Tracker",
    "full": "Sales Tracker - Track calls, meetings, and emails"
  },
  "description": {
    "short": "Track daily sales activities",
    "full": "Track calls, meetings, and emails with daily progress. Monitor your sales activities and stay on top of your goals."
  },
  "accentColor": "#FFFFFF",
  "configurableTabs": [
    {
      "configurationUrl": "https://your-app.vercel.app/teams-config",
      "scopes": ["team", "groupchat"],
      "context": ["channelTab", "chatTab"],
      "canUpdateConfiguration": true
    }
  ],
  "validDomains": [
    "your-app.vercel.app",
    "*.vercel.app"
  ],
  "webApplicationInfo": {
    "id": "YOUR-AAD-APP-ID",
    "resource": "api://your-app.vercel.app/YOUR-AAD-APP-ID"
  }
}
```

**Replace**:
- `YOUR-APP-ID-GUID`: Generate a new GUID (e.g. [guidgenerator.com](https://www.guidgenerator.com/))
- `your-app.vercel.app`: Your actual Vercel domain
- `YOUR-AAD-APP-ID`: Only needed if you add Teams SSO (Azure AD app registration)

#### `teams-app/color.png`

- 192×192 px, full color icon

#### `teams-app/outline.png`

- 32×32 px, transparent background, outline icon

### Step 2: Create the configuration page (required for configurable tabs)

Teams needs a page that configures the tab. Create:

**`app/teams-config/page.tsx`**

```tsx
"use client";

import { useEffect } from "react";

export default function TeamsConfigPage() {
  useEffect(() => {
    // Teams SDK will call this page to configure the tab
    // When loaded in Teams, microsoftTeams is available
    if (typeof window !== "undefined" && (window as any).microsoftTeams) {
      const teams = (window as any).microsoftTeams;
      teams.app.initialize().then(() => {
        teams.pages.config.setValidityState(true);
        teams.pages.config.registerOnSaveHandler((saveEvent: any) => {
          const tabUrl = `${window.location.origin}/dashboard`;
          teams.pages.config.setConfig({
            contentUrl: tabUrl,
            websiteUrl: tabUrl,
            suggestedDisplayName: "Sales Tracker",
          });
          saveEvent.notifySuccess();
        });
      });
    }
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Loading configuration...</p>
    </div>
  );
}
```

**Note**: The Teams JavaScript SDK must be loaded. Add it to your layout or this page:

```html
<script src="https://res.cdn.office.net/teams-js/2.0.0/js/MicrosoftTeams.min.js" crossOrigin="anonymous"></script>
```

### Step 3: Generate a new GUID for your app

Run in terminal or use an online generator:

```bash
# PowerShell (Windows)
[guid]::NewGuid().ToString()
```

### Step 4: Create the app package

1. Zip the contents of `teams-app`:
   - `manifest.json`
   - `color.png`
   - `outline.png`

2. The zip file is your **Teams app package** (`.zip`).

### Step 5: Upload and install

**For a single team (no admin)**:
1. In Teams, go to **Apps** (left sidebar)
2. Click **Manage your apps** → **Upload an app** → **Upload a custom app**
3. Select your `.zip` file
4. The app appears in "Built for [your org]"
5. Add it to a team: **Apps** → find **Sales Tracker** → **Add** → choose team/channel

**For organization-wide (admin)**:
1. Admin goes to [Teams Admin Center](https://admin.teams.microsoft.com)
2. **Teams apps** → **Manage apps**
3. **Upload** → upload the `.zip`
4. Approve and assign policies to make it available to users

---

## Part 4: Optional – Teams SSO (Single Sign-On)

To let users sign in with their Microsoft account instead of your Neon Auth:

1. **Register an app in Azure AD**:
   - [Azure Portal](https://portal.azure.com) → **App registrations** → **New registration**
   - Name: e.g. "Sales Tracker Teams"
   - Supported account types: **Accounts in this organizational directory only** (or as needed)
   - Redirect URI: `https://your-app.vercel.app/api/auth/callback` (or your auth callback)

2. **Configure Teams**:
   - In the app registration, add **API permissions** (e.g. `User.Read`, `openid`)
   - Create a **client secret** if using server-side auth
   - Copy **Application (client) ID** into your manifest `webApplicationInfo.id`

3. **Implement SSO in your app**:
   - Use the Teams JS SDK to get an auth token
   - Exchange it for a session in your backend
   - This requires replacing or extending Neon Auth with Azure AD/Teams SSO

This is more involved and typically done when you want to move away from Neon Auth for Teams users.

---

## Part 5: Checklist Before Going Live

- [ ] App is deployed and accessible at your Vercel URL
- [ ] `Content-Security-Policy: frame-ancestors` allows Teams domains
- [ ] Auth works in iframe (cookies with `SameSite=None; Secure` if needed)
- [ ] `/dashboard` (or your main URL) works when loaded directly and in an iframe
- [ ] Icons (`color.png`, `outline.png`) are created and included in the package
- [ ] `manifest.json` uses correct URLs and a unique GUID
- [ ] Configuration page (`/teams-config`) exists and loads the Teams SDK

---

## Part 6: Troubleshooting

| Issue | Possible cause | Fix |
|-------|----------------|-----|
| Blank tab | App blocks embedding | Add `frame-ancestors` CSP header |
| "Refused to display" | X-Frame-Options blocking | Remove or relax X-Frame-Options; use CSP |
| Login loop / auth fails | Cookies blocked in iframe | Set `SameSite=None; Secure` on auth cookies |
| Config page doesn't run | Teams SDK not loaded | Add Teams JS script to config page |
| App not in Teams store | Wrong manifest | Validate at [Teams manifest validator](https://developer.microsoft.com/en-us/microsoft-365/teams-app-validation-tool) |

---

## Quick Reference

| Method | Effort | Distribution | Best for |
|--------|--------|--------------|----------|
| Website tab | Low | Per channel/chat | Quick test, small teams |
| Full app package | Medium | Org-wide possible | Production, branding |

---

## Resources

- [Teams tabs documentation](https://learn.microsoft.com/en-us/microsoftteams/platform/tabs/what-are-tabs)
- [Build a configurable tab](https://learn.microsoft.com/en-us/microsoftteams/platform/tabs/how-to/create-tab-pages/configuration-page)
- [Teams app manifest](https://learn.microsoft.com/en-us/microsoftteams/platform/resources/schema/manifest-schema)
- [Teams manifest validator](https://developer.microsoft.com/en-us/microsoft-365/teams-app-validation-tool)

# Teams App Package

Before creating the zip package:

1. **Replace placeholders in `manifest.json`**:
   - `REPLACE-WITH-YOUR-GUID` → Generate at [guidgenerator.com](https://www.guidgenerator.com/)
   - `YOUR-VERCEL-URL.vercel.app` → Your actual Vercel deployment URL

2. **Add icon files** (required):
   - `color.png` — 192×192 px, full color
   - `outline.png` — 32×32 px, transparent background

3. **Create the package**: Zip `manifest.json`, `color.png`, and `outline.png` together.

4. **Upload** in Teams: Apps → Manage your apps → Upload a custom app.

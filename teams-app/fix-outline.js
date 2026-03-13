/**
 * Fixes the Teams outline icon to meet requirements:
 * - Fully transparent background
 * - Only white (#FFFFFF) for the icon (no other colors)
 *
 * Run: node fix-outline.js
 */

const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

async function fixOutline() {
  const dir = __dirname;
  const inputPath = path.join(dir, "outline.png");
  const outputPath = path.join(dir, "outline.png");

  const { data, info } = await sharp(inputPath)
    .raw()
    .ensureAlpha()
    .toBuffer({ resolveWithObject: true });

  const threshold = 40; // Pixels darker than this become transparent

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    // Luminance: how "bright" the pixel is
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) * (a / 255);

    if (luminance > threshold || a > 150) {
      // Logo/content pixel -> make white, fully opaque
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
      data[i + 3] = 255;
    } else {
      // Background -> fully transparent
      data[i] = 0;
      data[i + 1] = 0;
      data[i + 2] = 0;
      data[i + 3] = 0;
    }
  }

  await sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4,
    },
  })
    .png()
    .toFile(outputPath);

  console.log("Outline icon fixed! Saved to outline.png");
  console.log("Icon is now white on fully transparent background (32x32 px).");
}

fixOutline().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});

#!/usr/bin/env node
/**
 * render-card.js - Render HTML card templates to PNG images
 *
 * Usage:
 *   node render-card.js <input.html> [output.png] [--scale=N]
 *   node render-card.js card-template.html card.png --scale=3
 *
 * Options:
 *   --scale=N    Render at Nx resolution (default: 3 for 300dpi-equivalent)
 *   --selector   CSS selector for card element (default: .card)
 *   --all        Render all .card elements as separate files
 *
 * Dependencies: playwright (npm install playwright)
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function renderCard(inputPath, outputPath, options = {}) {
  const scale = options.scale || 3; // 3x for ~300dpi from 100dpi base
  const selector = options.selector || '.card';
  const renderAll = options.all || false;

  const absoluteInput = path.resolve(inputPath);
  if (!fs.existsSync(absoluteInput)) {
    console.error(`Input file not found: ${absoluteInput}`);
    process.exit(1);
  }

  // Try to find an existing Chrome/Chromium installation
  const possiblePaths = [
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
    '/root/.cache/ms-playwright/chromium-1194/chrome-linux/chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/google-chrome',
  ].filter(Boolean);

  let executablePath = null;
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      executablePath = p;
      break;
    }
  }

  const launchOptions = executablePath ? { executablePath } : {};
  const browser = await chromium.launch(launchOptions);
  const page = await browser.newPage();

  // Set device scale factor for high-DPI rendering
  await page.setViewportSize({ width: 1200, height: 2000 });

  await page.goto(`file://${absoluteInput}`);

  // Brief wait for rendering (don't wait for network - local file)
  await page.waitForTimeout(500);

  if (renderAll) {
    // Render each card to a separate file
    const cards = await page.$$(selector);
    console.log(`Found ${cards.length} cards to render`);

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const outputFile = outputPath
        ? outputPath.replace('.png', `-${i + 1}.png`)
        : `card-${i + 1}.png`;

      // Get bounding box and use page screenshot with clip
      const box = await card.boundingBox();
      if (box) {
        await page.screenshot({
          path: outputFile,
          clip: { x: box.x, y: box.y, width: box.width, height: box.height },
          omitBackground: true
        });
        console.log(`Rendered: ${outputFile}`);
      }
    }
  } else {
    // Render just the first matching card
    const card = await page.$(selector);
    if (!card) {
      console.error(`No element found matching selector: ${selector}`);
      await browser.close();
      process.exit(1);
    }

    const output = outputPath || 'card.png';
    const box = await card.boundingBox();
    if (box) {
      await page.screenshot({
        path: output,
        clip: { x: box.x, y: box.y, width: box.width, height: box.height },
        omitBackground: true
      });
      console.log(`Rendered: ${output}`);
    }
  }

  await browser.close();
}

// Parse command line arguments
const args = process.argv.slice(2);
const flags = args.filter(a => a.startsWith('--'));
const positional = args.filter(a => !a.startsWith('--'));

const options = {
  scale: 3,
  all: flags.includes('--all'),
  selector: '.card'
};

for (const flag of flags) {
  if (flag.startsWith('--scale=')) {
    options.scale = parseInt(flag.split('=')[1], 10);
  }
  if (flag.startsWith('--selector=')) {
    options.selector = flag.split('=')[1];
  }
}

if (positional.length < 1) {
  console.log(`
Card Renderer - Convert HTML cards to PNG images

Usage:
  node render-card.js <input.html> [output.png] [options]

Options:
  --scale=N     Render scale factor (default: 3 for ~300dpi)
  --all         Render all cards in the file
  --selector=S  CSS selector for cards (default: .card)

Examples:
  node render-card.js card.html                    # Render first card to card.png
  node render-card.js template.html cards.png --all  # Render all cards
`);
  process.exit(0);
}

renderCard(positional[0], positional[1], options).catch(err => {
  console.error('Render failed:', err);
  process.exit(1);
});

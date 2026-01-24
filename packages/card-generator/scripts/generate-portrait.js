#!/usr/bin/env node
/**
 * generate-portrait.js - Generate portrait images for cards
 *
 * Usage:
 *   node generate-portrait.js <output.png> [--color=#hex] [--width=N] [--height=N]
 *   node generate-portrait.js portrait.png --color=#8B4513
 *   node generate-portrait.js portrait.png --prompt="gnome knight" --api  (future: call fal.ai)
 *
 * Currently generates dummy solid-color images for testing.
 * Add --api flag (not yet implemented) to call fal.ai for real images.
 *
 * Dependencies: sharp (npm install sharp)
 */

const fs = require('fs');
const path = require('path');

// Default portrait dimensions (5:7 ratio, sized for card)
const DEFAULT_WIDTH = 512;
const DEFAULT_HEIGHT = 716;

// Category colors for dummy images
const CATEGORY_COLORS = {
  npc: '#8B4513',      // brown
  location: '#2E8B57', // green
  item: '#4169E1',     // blue
  faction: '#8B008B',  // purple
  quest: '#B8860B',    // gold
  default: '#666666'   // gray
};

async function generateDummyPortrait(outputPath, options = {}) {
  const width = options.width || DEFAULT_WIDTH;
  const height = options.height || DEFAULT_HEIGHT;
  const color = options.color || CATEGORY_COLORS[options.category] || CATEGORY_COLORS.default;

  let sharp;
  try {
    sharp = require('sharp');
  } catch (e) {
    console.error('Error: sharp not installed. Run: npm install sharp');
    console.error('Creating placeholder text file instead.');

    // Fallback: create a placeholder file
    fs.writeFileSync(outputPath + '.placeholder', JSON.stringify({
      width, height, color,
      note: 'Install sharp to generate actual PNG: npm install sharp'
    }, null, 2));
    console.log(`Created placeholder: ${outputPath}.placeholder`);
    return;
  }

  // Create solid color image
  const image = sharp({
    create: {
      width,
      height,
      channels: 3,
      background: color
    }
  });

  await image.png().toFile(outputPath);
  console.log(`Generated: ${outputPath} (${width}x${height}, ${color})`);
}

async function generateApiPortrait(outputPath, prompt, options = {}) {
  // Future: implement fal.ai API call
  console.error('API portrait generation not yet implemented.');
  console.error('Falling back to dummy portrait.');
  await generateDummyPortrait(outputPath, options);
}

// CLI
const args = process.argv.slice(2);
const positional = args.filter(a => !a.startsWith('--'));
const flags = Object.fromEntries(
  args.filter(a => a.startsWith('--'))
    .map(a => a.slice(2).split('='))
    .map(([k, v]) => [k, v ?? true])
);

if (positional.length < 1) {
  console.log(`
generate-portrait.js - Create portrait images for cards

Usage:
  node generate-portrait.js <output.png> [options]

Options:
  --color=#RRGGBB    Solid color for dummy image (default: gray)
  --category=TYPE    Use category color (npc/location/item/faction/quest)
  --width=N          Width in pixels (default: 512)
  --height=N         Height in pixels (default: 716)
  --prompt="..."     Image prompt (for future API integration)
  --api              Use fal.ai API (not yet implemented)

Examples:
  node generate-portrait.js portrait.png --category=npc
  node generate-portrait.js portrait.png --color=#8B4513
`);
  process.exit(0);
}

const outputPath = positional[0];
const options = {
  color: flags.color,
  category: flags.category,
  width: flags.width ? parseInt(flags.width, 10) : undefined,
  height: flags.height ? parseInt(flags.height, 10) : undefined
};

if (flags.api) {
  generateApiPortrait(outputPath, flags.prompt, options);
} else {
  generateDummyPortrait(outputPath, options);
}

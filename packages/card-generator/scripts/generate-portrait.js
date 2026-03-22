#!/usr/bin/env node
/**
 * Generate portrait images for cards.
 *
 * Usage:
 *   node generate-portrait.js <output.png> --category=npc
 *   node generate-portrait.js <output.png> --prompt="gnome knight" --api
 *
 * Without --api, generates a dummy placeholder image for layout testing.
 * With --api, calls fal.ai Flux (requires FAL_KEY env var).
 */

const fs = require('fs');
const path = require('path');

const SIZE_PRESETS = {
  square: { width: 1024, height: 1024 },
  square_hd: { width: 1024, height: 1024 },
  portrait_4_3: { width: 768, height: 1024 },
  portrait_16_9: { width: 576, height: 1024 },
  landscape_4_3: { width: 1024, height: 768 },
  landscape_16_9: { width: 1024, height: 576 },
};

const DEFAULT_SIZE = 'portrait_4_3';

const CATEGORY_COLORS = {
  npc: '#8B4513',
  location: '#2E8B57',
  item: '#4169E1',
  faction: '#8B008B',
  quest: '#B8860B',
  mystery: '#4A4A4A',
  default: '#666666'
};

function adjustColor(hex, amount) {
  const num = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + amount));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
  const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
}

async function generateDummyPortrait(outputPath, options = {}) {
  const sharp = require('sharp');
  const preset = SIZE_PRESETS[options.size] || SIZE_PRESETS[DEFAULT_SIZE];
  const width = options.width || preset.width;
  const height = options.height || preset.height;
  const color = options.color || CATEGORY_COLORS[options.category] || CATEGORY_COLORS.default;

  const svg = `
    <svg width="${width}" height="${height}">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${color}"/>
          <stop offset="100%" style="stop-color:${adjustColor(color, -30)}"/>
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#grad)"/>
      <text x="${width/2}" y="${height/2}" font-family="serif" font-size="48"
            fill="rgba(255,255,255,0.3)" text-anchor="middle">[Portrait]</text>
    </svg>
  `;

  await sharp(Buffer.from(svg)).png().toFile(outputPath);
  console.log(`Generated placeholder: ${outputPath} (${width}x${height})`);
}

async function generateApiPortrait(outputPath, prompt, options = {}) {
  const apiKey = process.env.FAL_KEY;
  if (!apiKey) {
    console.error('FAL_KEY not set. Get one at: https://fal.ai/dashboard/keys');
    console.error('Falling back to dummy portrait.');
    return generateDummyPortrait(outputPath, options);
  }

  if (!prompt) {
    console.error('--prompt required for API mode.');
    process.exit(1);
  }

  const { fal } = require('@fal-ai/client');
  fal.config({ credentials: apiKey });

  const sizePreset = options.size || DEFAULT_SIZE;
  console.log(`Generating portrait via fal.ai Flux...`);
  console.log(`  Prompt: "${prompt}"`);
  console.log(`  Size: ${sizePreset}`);

  try {
    const result = await fal.subscribe('fal-ai/flux/dev', {
      input: {
        prompt,
        image_size: sizePreset,
        num_images: 1
      }
    });

    if (!result.data?.images?.[0]?.url) {
      console.error('No image URL in API response.');
      process.exit(1);
    }

    const imageUrl = result.data.images[0].url;
    console.log(`  Downloading...`);

    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error(`Download failed: ${response.status}`);
    const buffer = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync(outputPath, buffer);

    console.log(`Generated: ${outputPath}`);
  } catch (error) {
    console.error('fal.ai API error:', error.message);
    process.exit(1);
  }
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
  --size=PRESET      Flux size preset (default: portrait_4_3)
  --category=TYPE    Category color for placeholder (npc/location/item/faction/quest/mystery)
  --prompt="..."     Image prompt (requires --api)
  --api              Use fal.ai Flux API (requires FAL_KEY)

Size presets:
  portrait_4_3   768x1024  (recommended)
  square         1024x1024
  landscape_4_3  1024x768

Examples:
  node generate-portrait.js portrait.png --category=npc
  node generate-portrait.js portrait.png --prompt="gnome knight" --api
`);
  process.exit(0);
}

const outputPath = positional[0];
const options = {
  size: flags.size,
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

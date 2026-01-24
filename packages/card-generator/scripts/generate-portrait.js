#!/usr/bin/env node
/**
 * generate-portrait.js - Generate portrait images for cards
 *
 * Usage:
 *   node generate-portrait.js <output.png> [--size=PRESET] [--category=TYPE]
 *   node generate-portrait.js portrait.png --size=portrait_4_3 --category=npc
 *   node generate-portrait.js portrait.png --prompt="gnome knight" --api
 *
 * Currently generates dummy solid-color images for testing.
 * Add --api flag to call fal.ai Flux (requires FAL_KEY env var).
 *
 * Dependencies: sharp (npm install sharp)
 */

const fs = require('fs');
const path = require('path');

// Flux standard size presets (fal.ai)
// See: https://fal.ai/models/fal-ai/flux/dev/api
const SIZE_PRESETS = {
  // Square
  square: { width: 1024, height: 1024 },
  square_hd: { width: 1024, height: 1024 },

  // Portrait (vertical)
  portrait_4_3: { width: 768, height: 1024 },   // 3:4 ratio - good for cards
  portrait_16_9: { width: 576, height: 1024 },  // 9:16 ratio

  // Landscape (horizontal)
  landscape_4_3: { width: 1024, height: 768 },
  landscape_16_9: { width: 1024, height: 576 },

  // Card-optimized (will be cropped to fit card)
  card: { width: 768, height: 1024 }  // Same as portrait_4_3
};

const DEFAULT_SIZE = 'portrait_4_3';

// Category colors for dummy images
const CATEGORY_COLORS = {
  npc: '#8B4513',
  location: '#2E8B57',
  item: '#4169E1',
  faction: '#8B008B',
  quest: '#B8860B',
  mystery: '#4A4A4A',
  default: '#666666'
};

async function generateDummyPortrait(outputPath, options = {}) {
  const preset = SIZE_PRESETS[options.size] || SIZE_PRESETS[DEFAULT_SIZE];
  const width = options.width || preset.width;
  const height = options.height || preset.height;
  const color = options.color || CATEGORY_COLORS[options.category] || CATEGORY_COLORS.default;

  let sharp;
  try {
    sharp = require('sharp');
  } catch (e) {
    console.error('Error: sharp not installed. Run: npm install sharp');
    process.exit(1);
  }

  // Create gradient/textured dummy instead of solid color
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
  console.log(`Generated: ${outputPath} (${width}x${height}, ${options.size || DEFAULT_SIZE})`);
}

function adjustColor(hex, amount) {
  // Darken/lighten a hex color
  const num = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + amount));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
  const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
}

async function generateApiPortrait(outputPath, prompt, options = {}) {
  const apiKey = process.env.FAL_KEY;
  if (!apiKey) {
    console.error('Error: FAL_KEY environment variable not set.');
    console.error('Get your API key at: https://fal.ai/dashboard/keys');
    console.error('Falling back to dummy portrait.');
    return generateDummyPortrait(outputPath, options);
  }

  if (!prompt) {
    console.error('Error: --prompt required for API mode.');
    process.exit(1);
  }

  const { execSync } = require('child_process');

  const sizePreset = options.size || DEFAULT_SIZE;
  console.log(`Generating portrait via fal.ai Flux...`);
  console.log(`  Prompt: "${prompt}"`);
  console.log(`  Size: ${sizePreset}`);

  try {
    // Use curl for HTTP requests (more reliable DNS in some environments)
    const payload = JSON.stringify({
      prompt: prompt,
      image_size: sizePreset,
      num_images: 1
    });

    const curlCmd = `curl -s -X POST "https://fal.run/fal-ai/flux/dev" \
      -H "Authorization: Key ${apiKey}" \
      -H "Content-Type: application/json" \
      -d '${payload.replace(/'/g, "'\\''")}'`;

    console.log('  Calling fal.ai API...');
    const resultStr = execSync(curlCmd, { encoding: 'utf-8', timeout: 120000 });
    const result = JSON.parse(resultStr);

    if (!result.images?.[0]?.url) {
      console.error('Error: No image URL in API response.');
      console.error('Response:', JSON.stringify(result, null, 2));
      process.exit(1);
    }

    const imageUrl = result.images[0].url;
    console.log(`  Downloading from: ${imageUrl.slice(0, 60)}...`);

    // Download the image using curl
    execSync(`curl -s -o "${outputPath}" "${imageUrl}"`, { timeout: 60000 });

    console.log(`Generated: ${outputPath}`);
  } catch (error) {
    console.error('Error calling fal.ai API:', error.message);
    if (error.stdout) {
      console.error('stdout:', error.stdout.toString());
    }
    if (error.stderr) {
      console.error('stderr:', error.stderr.toString());
    }
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
  --size=PRESET      Flux standard size (default: portrait_4_3)
  --category=TYPE    Category color (npc/location/item/faction/quest/mystery)
  --color=#RRGGBB    Custom color (overrides category)
  --width=N          Custom width (overrides preset)
  --height=N         Custom height (overrides preset)
  --prompt="..."     Image prompt (for --api mode)
  --api              Use fal.ai Flux API (requires FAL_KEY)

Size presets (Flux standard):
  portrait_4_3   768x1024  (recommended for cards)
  portrait_16_9  576x1024
  square         1024x1024
  landscape_4_3  1024x768
  landscape_16_9 1024x576

Examples:
  node generate-portrait.js portrait.png --category=npc
  node generate-portrait.js portrait.png --size=portrait_4_3 --category=npc
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

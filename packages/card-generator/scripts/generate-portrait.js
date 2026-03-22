#!/usr/bin/env node
/**
 * Generate portrait images for cards.
 *
 * Usage:
 *   node generate-portrait.js <output.png> "prompt describing the subject"
 *   node generate-portrait.js portrait.png                  # placeholder
 *
 * If FAL_KEY is set and a prompt is given, calls fal.ai Flux.
 * Otherwise generates a placeholder for layout testing.
 */

const fs = require('fs');

const PORTRAIT_SIZE = 'portrait_4_3'; // 768x1024

async function generatePlaceholder(outputPath) {
  const sharp = require('sharp');
  const w = 768, h = 1024;
  const svg = `
    <svg width="${w}" height="${h}">
      <rect width="${w}" height="${h}" fill="#666"/>
      <text x="${w/2}" y="${h/2}" font-family="serif" font-size="48"
            fill="rgba(255,255,255,0.3)" text-anchor="middle">[Portrait]</text>
    </svg>
  `;
  await sharp(Buffer.from(svg)).png().toFile(outputPath);
  console.log(`Generated placeholder: ${outputPath} (${w}x${h})`);
}

async function generatePortrait(outputPath, prompt) {
  const apiKey = process.env.FAL_KEY;
  if (!apiKey) {
    console.error('FAL_KEY not set. Generating placeholder instead.');
    console.error('Get a key at: https://fal.ai/dashboard/keys');
    return generatePlaceholder(outputPath);
  }

  const { fal } = require('@fal-ai/client');
  fal.config({ credentials: apiKey });

  console.log(`Generating portrait via fal.ai Flux...`);
  console.log(`  Prompt: "${prompt}"`);

  const result = await fal.subscribe('fal-ai/flux/dev', {
    input: { prompt, image_size: PORTRAIT_SIZE, num_images: 1 }
  });

  if (!result.data?.images?.[0]?.url) {
    console.error('No image URL in API response.');
    process.exit(1);
  }

  const response = await fetch(result.data.images[0].url);
  if (!response.ok) throw new Error(`Download failed: ${response.status}`);
  fs.writeFileSync(outputPath, Buffer.from(await response.arrayBuffer()));
  console.log(`Generated: ${outputPath}`);
}

// CLI
const [outputPath, ...promptParts] = process.argv.slice(2);

if (!outputPath) {
  console.log(`
generate-portrait.js - Generate portrait image for a card

Usage:
  node generate-portrait.js <output.png> "prompt describing the subject"
  node generate-portrait.js <output.png>   (placeholder if no prompt or no FAL_KEY)

Examples:
  node generate-portrait.js portrait.png "gnome inventor, ink wash style, head and shoulders"
  node generate-portrait.js portrait.png
`);
  process.exit(0);
}

const prompt = promptParts.join(' ');

if (prompt) {
  generatePortrait(outputPath, prompt).catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
} else {
  generatePlaceholder(outputPath);
}

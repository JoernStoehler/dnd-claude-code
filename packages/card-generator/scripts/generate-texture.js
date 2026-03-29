#!/usr/bin/env node
/**
 * Generate background texture for cards.
 *
 * Usage:
 *   node generate-texture.js <output.png> "prompt describing the texture"
 *   node generate-texture.js texture.png                    # placeholder
 *
 * With a prompt: calls fal.ai Flux (requires FAL_KEY).
 * Crops center 60% of generated image to avoid boundary artifacts,
 * then resizes to card dimensions (827x1417).
 */

const fs = require('fs');

const CARD_WIDTH = 827;
const CARD_HEIGHT = 1417;

async function generatePlaceholder(outputPath) {
  const sharp = require('sharp');
  const svg = `
    <svg width="${CARD_WIDTH}" height="${CARD_HEIGHT}">
      <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="#654321"/>
      <text x="${CARD_WIDTH/2}" y="${CARD_HEIGHT/2}" font-family="serif" font-size="32"
            fill="rgba(255,255,255,0.2)" text-anchor="middle">[Texture]</text>
    </svg>
  `;
  await sharp(Buffer.from(svg)).png().toFile(outputPath);
  console.log(`Generated placeholder: ${outputPath} (${CARD_WIDTH}x${CARD_HEIGHT})`);
}

async function generateTexture(outputPath, prompt) {
  const apiKey = process.env.FAL_KEY;
  if (!apiKey) {
    console.error('FAL_KEY not set. Set it in .env or environment.');
    process.exit(1);
  }

  const sharp = require('sharp');
  const { fal } = require('@fal-ai/client');
  fal.config({ credentials: apiKey });

  console.log(`Generating texture via fal.ai Flux...`);
  console.log(`  Prompt: "${prompt}"`);

  const result = await fal.subscribe('fal-ai/flux/dev', {
    input: { prompt, image_size: 'square_hd', num_images: 1 }
  });

  if (!result.data?.images?.[0]?.url) {
    console.error('No image URL in API response.');
    process.exit(1);
  }

  const response = await fetch(result.data.images[0].url);
  if (!response.ok) throw new Error(`Download failed: ${response.status}`);
  const buffer = Buffer.from(await response.arrayBuffer());

  // Crop center 60% to remove boundary effects, then resize to card dimensions
  const metadata = await sharp(buffer).metadata();
  const cropSize = Math.floor(Math.min(metadata.width, metadata.height) * 0.6);
  const cropX = Math.floor((metadata.width - cropSize) / 2);
  const cropY = Math.floor((metadata.height - cropSize) / 2);

  await sharp(buffer)
    .extract({ left: cropX, top: cropY, width: cropSize, height: cropSize })
    .resize(CARD_WIDTH, CARD_HEIGHT, { fit: 'cover' })
    .png()
    .toFile(outputPath);

  console.log(`Generated: ${outputPath} (${CARD_WIDTH}x${CARD_HEIGHT})`);
}

// CLI
const [outputPath, ...promptParts] = process.argv.slice(2);

if (!outputPath) {
  console.log(`
generate-texture.js - Generate background texture for a card

Usage:
  node generate-texture.js <output.png> "prompt describing the texture"
  node generate-texture.js <output.png>   (placeholder for layout testing)

Examples:
  node generate-texture.js texture.png "brown leather surface, warm cognac tones, 8k detail"
  node generate-texture.js texture.png "aged green parchment, weathered map paper"
  node generate-texture.js texture.png
`);
  process.exit(0);
}

const prompt = promptParts.join(' ');

if (prompt) {
  generateTexture(outputPath, prompt).catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
} else {
  generatePlaceholder(outputPath);
}

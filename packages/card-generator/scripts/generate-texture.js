#!/usr/bin/env node
/**
 * Generate background textures for cards.
 *
 * Usage:
 *   node generate-texture.js <output.png> --category=npc
 *   node generate-texture.js <output.png> --category=npc --api
 *   node generate-texture.js <output.png> --prompt="dark stone wall" --api
 *
 * Without --api, generates a dummy placeholder. With --api, calls fal.ai Flux.
 */

const fs = require('fs');

const CARD_WIDTH = 827;
const CARD_HEIGHT = 1417;

const CATEGORY_TEXTURES = {
  npc: {
    colors: { accent: '#8B4513', light: '#D2691E' },
    defaultStyle: 'leather',
    promptBase: 'extreme close-up macro photograph of brown leather surface, studio product photography, soft diffused lighting, warm cognac tones, visible natural grain, full frame composition filling entire image, 8k texture detail'
  },
  location: {
    colors: { accent: '#2E8B57', light: '#3CB371' },
    defaultStyle: 'parchment',
    promptBase: 'aged green-tinted parchment texture, weathered map paper, subtle compass rose watermark'
  },
  item: {
    colors: { accent: '#4169E1', light: '#6495ED' },
    defaultStyle: 'velvet',
    promptBase: 'deep blue velvet texture with subtle silver thread pattern, treasure chest lining'
  },
  faction: {
    colors: { accent: '#8B008B', light: '#BA55D3' },
    defaultStyle: 'banner',
    promptBase: 'rich purple fabric texture, medieval banner material, subtle heraldic pattern'
  },
  quest: {
    colors: { accent: '#B8860B', light: '#DAA520' },
    defaultStyle: 'scroll',
    promptBase: 'golden aged scroll texture, wax-sealed document paper, adventure map feel'
  },
  mystery: {
    colors: { accent: '#4A4A4A', light: '#696969' },
    defaultStyle: 'shadow',
    promptBase: 'dark smoky texture, mysterious fog, subtle arcane symbols in shadow'
  }
};

const TEXTURE_STYLES = {
  leather: 'aged leather texture, embossed, warm tones, medieval book binding',
  parchment: 'weathered parchment paper, aged vellum, slightly yellowed',
  velvet: 'rich velvet fabric texture, soft lighting, luxurious material',
  banner: 'woven fabric texture, medieval banner material, slight wear',
  scroll: 'ancient scroll paper, rolled edges effect, aged document',
  wood: 'polished dark wood grain, oak or mahogany, carved frame feel',
  metal: 'brushed metal texture, bronze or copper tones, slight patina',
  stone: 'weathered stone texture, castle wall, subtle moss'
};

async function generateDummyTexture(outputPath, options = {}) {
  const sharp = require('sharp');
  const cat = CATEGORY_TEXTURES[options.category] || CATEGORY_TEXTURES.npc;
  const colors = cat.colors;

  const svg = `
    <svg width="${CARD_WIDTH}" height="${CARD_HEIGHT}">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${colors.accent}"/>
          <stop offset="100%" style="stop-color:${colors.light}"/>
        </linearGradient>
        <filter id="noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" result="noise"/>
          <feColorMatrix type="saturate" values="0"/>
          <feBlend in="SourceGraphic" in2="noise" mode="multiply"/>
        </filter>
      </defs>
      <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="url(#bg)" filter="url(#noise)"/>
    </svg>
  `;

  await sharp(Buffer.from(svg)).png().toFile(outputPath);
  console.log(`Generated placeholder: ${outputPath} (${CARD_WIDTH}x${CARD_HEIGHT})`);
}

async function generateApiTexture(outputPath, options = {}) {
  const apiKey = process.env.FAL_KEY;
  if (!apiKey) {
    console.error('FAL_KEY not set. Falling back to dummy texture.');
    return generateDummyTexture(outputPath, options);
  }

  const sharp = require('sharp');
  const { fal } = require('@fal-ai/client');
  fal.config({ credentials: apiKey });

  const cat = CATEGORY_TEXTURES[options.category] || CATEGORY_TEXTURES.npc;
  const style = options.style || cat.defaultStyle;
  const styleDesc = TEXTURE_STYLES[style] || TEXTURE_STYLES.leather;

  let prompt = options.prompt;
  if (!prompt) {
    prompt = `${cat.promptBase}, ${styleDesc}, seamless tileable texture, high detail, no text, no symbols, abstract background pattern`;
  }
  const fullPrompt = `${prompt}, 4k quality, photorealistic texture detail`;

  console.log(`Generating texture via fal.ai Flux...`);
  console.log(`  Category: ${options.category || 'npc'}`);
  console.log(`  Style: ${style}`);
  console.log(`  Prompt: "${fullPrompt.slice(0, 80)}..."`);

  try {
    const result = await fal.subscribe('fal-ai/flux/dev', {
      input: {
        prompt: fullPrompt,
        image_size: 'square_hd',
        num_images: 1
      }
    });

    if (!result.data?.images?.[0]?.url) {
      console.error('No image URL in API response.');
      return generateDummyTexture(outputPath, options);
    }

    const imageUrl = result.data.images[0].url;
    console.log(`  Downloading...`);

    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error(`Download failed: ${response.status}`);
    const buffer = Buffer.from(await response.arrayBuffer());

    // Crop center 60% to remove boundary effects, then resize to card dimensions
    const tempBuf = buffer;
    const metadata = await sharp(tempBuf).metadata();
    const cropSize = Math.floor(Math.min(metadata.width, metadata.height) * 0.6);
    const cropX = Math.floor((metadata.width - cropSize) / 2);
    const cropY = Math.floor((metadata.height - cropSize) / 2);

    console.log(`  Cropping center ${cropSize}x${cropSize}...`);

    await sharp(tempBuf)
      .extract({ left: cropX, top: cropY, width: cropSize, height: cropSize })
      .resize(CARD_WIDTH, CARD_HEIGHT, { fit: 'cover' })
      .png()
      .toFile(outputPath);

    console.log(`Generated: ${outputPath} (${CARD_WIDTH}x${CARD_HEIGHT})`);
  } catch (error) {
    console.error('fal.ai API error:', error.message);
    return generateDummyTexture(outputPath, options);
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
generate-texture.js - Create background textures for cards

Usage:
  node generate-texture.js <output.png> [options]

Options:
  --category=TYPE    Card category (npc/location/item/faction/quest/mystery)
  --style=STYLE      Texture style (leather/parchment/velvet/banner/scroll/wood/metal/stone)
  --prompt="..."     Custom prompt (overrides category/style)
  --api              Use fal.ai Flux API (requires FAL_KEY)

Examples:
  node generate-texture.js texture.png --category=npc
  node generate-texture.js texture.png --category=npc --api
  node generate-texture.js texture.png --prompt="dark stone wall" --api

Category defaults:
  npc      -> leather    location -> parchment    item    -> velvet
  faction  -> banner     quest    -> scroll       mystery -> shadow
`);
  process.exit(0);
}

const outputPath = positional[0];
const options = {
  category: flags.category,
  style: flags.style,
  prompt: flags.prompt
};

if (flags.api) {
  generateApiTexture(outputPath, options);
} else {
  generateDummyTexture(outputPath, options);
}

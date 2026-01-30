#!/usr/bin/env node
/**
 * generate-texture.js - Generate background textures for cards via fal.ai
 *
 * Usage:
 *   node generate-texture.js <output.png> --category=npc --style=leather
 *   node generate-texture.js texture.png --prompt="custom prompt" --api
 *
 * Dependencies: sharp
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Card dimensions (tarot size)
const CARD_WIDTH = 827;
const CARD_HEIGHT = 1417;

// Category base colors and texture styles
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

// Texture style variations
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

  // Generate gradient with noise pattern as placeholder
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
      <text x="${CARD_WIDTH/2}" y="${CARD_HEIGHT/2}" font-family="serif" font-size="32"
            fill="rgba(255,255,255,0.2)" text-anchor="middle">[Texture Placeholder]</text>
    </svg>
  `;

  await sharp(Buffer.from(svg)).png().toFile(outputPath);
  console.log(`Generated placeholder: ${outputPath} (${CARD_WIDTH}x${CARD_HEIGHT})`);
}

async function generateApiTexture(outputPath, options = {}) {
  const apiKey = process.env.FAL_KEY;
  if (!apiKey) {
    console.error('Error: FAL_KEY environment variable not set.');
    console.error('Falling back to dummy texture.');
    return generateDummyTexture(outputPath, options);
  }

  const cat = CATEGORY_TEXTURES[options.category] || CATEGORY_TEXTURES.npc;
  const style = options.style || cat.defaultStyle;
  const styleDesc = TEXTURE_STYLES[style] || TEXTURE_STYLES.leather;

  // Build the prompt
  let prompt = options.prompt;
  if (!prompt) {
    prompt = `${cat.promptBase}, ${styleDesc}, seamless tileable texture, high detail, no text, no symbols, abstract background pattern`;
  }

  // Add quality and style modifiers
  const fullPrompt = `${prompt}, 4k quality, photorealistic texture detail`;

  console.log(`Generating texture via fal.ai Flux...`);
  console.log(`  Category: ${options.category || 'npc'}`);
  console.log(`  Style: ${style}`);
  console.log(`  Prompt: "${fullPrompt.slice(0, 80)}..."`);

  try {
    // Use portrait aspect ratio closest to card dimensions
    const payload = JSON.stringify({
      prompt: fullPrompt,
      image_size: 'portrait_4_3',  // 768x1024, will resize to card
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
      return generateDummyTexture(outputPath, options);
    }

    const imageUrl = result.images[0].url;
    console.log(`  Downloading from: ${imageUrl.slice(0, 60)}...`);

    // Download to temp file
    const tempPath = outputPath + '.tmp.png';
    execSync(`curl -s -o "${tempPath}" "${imageUrl}"`, { timeout: 60000 });

    // Resize to exact card dimensions
    const sharp = require('sharp');
    await sharp(tempPath)
      .resize(CARD_WIDTH, CARD_HEIGHT, { fit: 'cover' })
      .png()
      .toFile(outputPath);

    // Clean up temp
    fs.unlinkSync(tempPath);

    console.log(`Generated: ${outputPath} (${CARD_WIDTH}x${CARD_HEIGHT})`);
  } catch (error) {
    console.error('Error calling fal.ai API:', error.message);
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
  node generate-texture.js bg-npc.png --category=npc            # Placeholder
  node generate-texture.js bg-npc.png --category=npc --api      # Real texture
  node generate-texture.js bg.png --style=leather --api         # Style override
  node generate-texture.js bg.png --prompt="dark stone wall" --api

Categories and default styles:
  npc      -> leather (warm brown, gold embossing)
  location -> parchment (green-tinted, map-like)
  item     -> velvet (deep blue, silver accents)
  faction  -> banner (purple fabric, heraldic)
  quest    -> scroll (golden aged paper)
  mystery  -> shadow (dark fog, arcane)
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

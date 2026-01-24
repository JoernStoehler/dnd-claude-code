#!/usr/bin/env node
/**
 * Explore different card sizes and image aspect ratios
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const PADDING = 36;

const CATEGORY_COLORS = {
  npc: { accent: '#8B4513', light: '#D2691E', dark: '#5D2E0C' }
};

const CATEGORY_ICONS = {
  npc: '<circle cx="12" cy="8" r="5"/><path d="M4 22c0-6 4-9 8-9s8 3 8 9"/>'
};

function escapeXml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function wordWrap(text, maxChars) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';
  for (const word of words) {
    if ((currentLine + ' ' + word).trim().length <= maxChars) {
      currentLine = (currentLine + ' ' + word).trim();
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

async function renderCard(config, card, portraitPath, outputPath) {
  const { cardWidth, cardHeight, portraitHeight, headerHeight, footerHeight, cropPosition } = config;
  const colors = CATEGORY_COLORS.npc;
  const bodyHeight = cardHeight - headerHeight - portraitHeight - footerHeight;

  // Background
  const bgSvg = `
    <svg width="${cardWidth}" height="${cardHeight}">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#f4e4c1"/>
          <stop offset="100%" style="stop-color:#e8d4a8"/>
        </linearGradient>
      </defs>
      <rect width="${cardWidth}" height="${cardHeight}" fill="url(#bg)"/>
    </svg>
  `;

  // Header
  const icon = CATEGORY_ICONS.npc;
  const headerSvg = `
    <svg width="${cardWidth}" height="${headerHeight}">
      <defs>
        <linearGradient id="hg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${colors.accent}"/>
          <stop offset="100%" style="stop-color:${colors.light}"/>
        </linearGradient>
      </defs>
      <rect width="${cardWidth}" height="${headerHeight}" fill="url(#hg)"/>
      <g transform="translate(16, ${(headerHeight - 24) / 2}) scale(1)" fill="rgba(255,255,255,0.7)">${icon}</g>
      <g transform="translate(${cardWidth - 40}, ${(headerHeight - 24) / 2}) scale(1)" fill="rgba(255,255,255,0.7)">${icon}</g>
      <text x="${cardWidth/2}" y="${headerHeight/2 + 14}" font-family="serif" font-size="42" font-weight="bold"
            fill="#f4e4c1" text-anchor="middle">${escapeXml(card.name)}</text>
    </svg>
  `;

  // Body
  const descLines = wordWrap(escapeXml(card.description || ''), 42);
  const descText = descLines.map((line, i) =>
    `<text x="${PADDING}" y="${36 + i * 32}" font-family="serif" font-size="26" fill="#2a2016">${line}</text>`
  ).join('\n');
  const bodySvg = `<svg width="${cardWidth}" height="${bodyHeight}">${descText}</svg>`;

  // Footer
  const footerSvg = `
    <svg width="${cardWidth}" height="${footerHeight}">
      <rect width="${cardWidth}" height="${footerHeight}" fill="#e8d4a8"/>
      <line x1="0" y1="0" x2="${cardWidth}" y2="0" stroke="#c4a882" stroke-width="2"/>
      <text x="${cardWidth/2}" y="${footerHeight/2 + 5}" font-family="serif" font-size="18" fill="#5a4a36"
            text-anchor="middle">${escapeXml(card.footer || '')}</text>
    </svg>
  `;

  // Portrait with configurable crop position
  const portraitBuffer = await sharp(portraitPath)
    .resize(cardWidth, portraitHeight, {
      fit: 'cover',
      position: cropPosition || 'center'
    })
    .toBuffer();

  const bg = await sharp(Buffer.from(bgSvg)).png().toBuffer();
  const header = await sharp(Buffer.from(headerSvg)).png().toBuffer();
  const body = await sharp(Buffer.from(bodySvg)).png().toBuffer();
  const footer = await sharp(Buffer.from(footerSvg)).png().toBuffer();

  await sharp(bg)
    .composite([
      { input: header, top: 0, left: 0 },
      { input: portraitBuffer, top: headerHeight, left: 0 },
      { input: body, top: headerHeight + portraitHeight, left: 0 },
      { input: footer, top: cardHeight - footerHeight, left: 0 }
    ])
    .png().toFile(outputPath);

  // Calculate and return crop info
  const imgMeta = await sharp(portraitPath).metadata();
  const scaleFactor = cardWidth / imgMeta.width;
  const scaledHeight = imgMeta.height * scaleFactor;
  const cropAmount = scaledHeight - portraitHeight;
  const cropPercent = (cropAmount / scaledHeight * 100).toFixed(1);

  return {
    scaledHeight: Math.round(scaledHeight),
    cropAmount: Math.round(cropAmount),
    cropPercent,
    bodyHeight,
    linesAvailable: Math.floor((bodyHeight - 36) / 32)
  };
}

async function main() {
  const card = {
    name: "Grimble Thornwick",
    description: "A tinkering gnome inventor with perpetually soot-stained fingers and an infectious enthusiasm for clockwork contraptions. His workshop is legendary for both its ingenious devices and occasional explosions.",
    footer: "Thornwick's Emporium",
    category: "npc"
  };

  const baseDir = process.argv[2] || '.';
  const squarePortrait = path.join(baseDir, 'portrait.png'); // 1024x1024

  // Generate 4:3 portrait for comparison
  const portrait43 = path.join(baseDir, 'portrait-4x3.png');

  const configs = [
    // Poker card + square image
    {
      name: 'poker-square',
      desc: 'Poker (750×1050) + Square image',
      cardWidth: 750, cardHeight: 1050,
      portraitHeight: 750, headerHeight: 80, footerHeight: 36,
      portrait: squarePortrait
    },
    // Poker card + 4:3 image, center crop
    {
      name: 'poker-4x3-center',
      desc: 'Poker (750×1050) + 4:3 image, center crop',
      cardWidth: 750, cardHeight: 1050,
      portraitHeight: 650, headerHeight: 85, footerHeight: 36,
      portrait: portrait43,
      cropPosition: 'center'
    },
    // Poker card + 4:3 image, top-weighted crop
    {
      name: 'poker-4x3-top',
      desc: 'Poker (750×1050) + 4:3 image, top crop (keep face)',
      cardWidth: 750, cardHeight: 1050,
      portraitHeight: 650, headerHeight: 85, footerHeight: 36,
      portrait: portrait43,
      cropPosition: 'top'
    },
    // Taller card + 4:3 image, minimal crop
    {
      name: 'tall-4x3',
      desc: 'Tall card (750×1200) + 4:3 image, minimal crop',
      cardWidth: 750, cardHeight: 1200,
      portraitHeight: 900, headerHeight: 85, footerHeight: 36,
      portrait: portrait43,
      cropPosition: 'center'
    },
    // Poker + 4:3 full height (heavy crop on width)
    {
      name: 'poker-4x3-full',
      desc: 'Poker (750×1050) + 4:3 full height, crop sides',
      cardWidth: 750, cardHeight: 1050,
      portraitHeight: 750, headerHeight: 80, footerHeight: 36,
      portrait: portrait43,
      cropPosition: 'center'
    },
  ];

  console.log('Generating comparison cards...\n');

  const results = [];
  for (const cfg of configs) {
    if (!fs.existsSync(cfg.portrait)) {
      console.log(`  Skipping ${cfg.name}: portrait not found`);
      continue;
    }
    const outPath = path.join(baseDir, `size-${cfg.name}.png`);
    const stats = await renderCard(cfg, card, cfg.portrait, outPath);
    results.push({ ...cfg, ...stats, outPath });
    console.log(`  ${cfg.name}: ${cfg.cardWidth}×${cfg.cardHeight}, portrait=${cfg.portraitHeight}px`);
    console.log(`    Crop: ${stats.cropPercent}% (${stats.cropAmount}px of ${stats.scaledHeight}px)`);
    console.log(`    Text: ${stats.bodyHeight}px (~${stats.linesAvailable} lines)`);
    console.log(`    → ${outPath}\n`);
  }

  // Write summary markdown
  const md = `# Card Size Exploration

Same content, different card sizes and image aspect ratios.

${results.map(r => `
## ${r.desc}

- Card: ${r.cardWidth}×${r.cardHeight}px
- Portrait area: ${r.portraitHeight}px
- Image crop: **${r.cropPercent}%** (${r.cropAmount}px removed)
- Text space: ${r.bodyHeight}px (~${r.linesAvailable} lines)

![${r.name}](size-${r.name}.png)
`).join('\n---\n')}
`;

  fs.writeFileSync(path.join(baseDir, 'SIZE-COMPARISON.md'), md);
  console.log('Summary written to SIZE-COMPARISON.md');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

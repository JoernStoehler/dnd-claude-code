#!/usr/bin/env node
/**
 * Render complete cards using different portrait styles
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const CARD_WIDTH = 750;
const CARD_HEIGHT = 1050;
const PADDING = 36;

const STYLES = ['classic-dnd', 'oil-painting', 'watercolor', 'ink-wash', 'storybook', 'renaissance'];

const STYLE_CONFIG = {
  portraitHeight: 750,
  headerHeight: 80,
  footerHeight: 36,
};

const COLORS = { accent: '#8B4513', light: '#D2691E', dark: '#5D2E0C' };
const ICON = '<circle cx="12" cy="8" r="5"/><path d="M4 22c0-6 4-9 8-9s8 3 8 9"/>';

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

async function renderCard(portraitPath, outputPath, card) {
  const { portraitHeight, headerHeight, footerHeight } = STYLE_CONFIG;
  const bodyHeight = CARD_HEIGHT - headerHeight - portraitHeight - footerHeight;

  const bgSvg = `<svg width="${CARD_WIDTH}" height="${CARD_HEIGHT}">
    <defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f4e4c1"/>
      <stop offset="100%" style="stop-color:#e8d4a8"/>
    </linearGradient></defs>
    <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="url(#bg)"/>
  </svg>`;

  const headerSvg = `<svg width="${CARD_WIDTH}" height="${headerHeight}">
    <defs><linearGradient id="hg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${COLORS.accent}"/>
      <stop offset="100%" style="stop-color:${COLORS.light}"/>
    </linearGradient></defs>
    <rect width="${CARD_WIDTH}" height="${headerHeight}" fill="url(#hg)"/>
    <g transform="translate(20, ${(headerHeight-28)/2}) scale(${28/24})" fill="rgba(255,255,255,0.7)">${ICON}</g>
    <g transform="translate(${CARD_WIDTH-48}, ${(headerHeight-28)/2}) scale(${28/24})" fill="rgba(255,255,255,0.7)">${ICON}</g>
    <text x="${CARD_WIDTH/2}" y="${headerHeight/2+16}" font-family="serif" font-size="48" font-weight="bold"
          fill="#f4e4c1" text-anchor="middle">${escapeXml(card.name)}</text>
  </svg>`;

  const descLines = wordWrap(escapeXml(card.description), 42);
  const descText = descLines.map((line, i) =>
    `<text x="${PADDING}" y="${40 + i * 34}" font-family="serif" font-size="28" fill="#2a2016">${line}</text>`
  ).join('\n');
  const bodySvg = `<svg width="${CARD_WIDTH}" height="${bodyHeight}">${descText}</svg>`;

  const footerSvg = `<svg width="${CARD_WIDTH}" height="${footerHeight}">
    <rect width="${CARD_WIDTH}" height="${footerHeight}" fill="#e8d4a8"/>
    <line x1="0" y1="0" x2="${CARD_WIDTH}" y2="0" stroke="#c4a882" stroke-width="2"/>
    <text x="${CARD_WIDTH/2}" y="${footerHeight/2+6}" font-family="serif" font-size="20" fill="#5a4a36"
          text-anchor="middle">${escapeXml(card.footer)}</text>
  </svg>`;

  const portraitBuffer = await sharp(portraitPath)
    .resize(CARD_WIDTH, portraitHeight, { fit: 'cover' })
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
      { input: footer, top: CARD_HEIGHT - footerHeight, left: 0 }
    ])
    .png().toFile(outputPath);
}

async function main() {
  const baseDir = process.argv[2] || '.';

  const card = {
    name: "Grimble Thornwick",
    description: "A tinkering gnome inventor with perpetually soot-stained fingers and an infectious enthusiasm for clockwork contraptions. His workshop is legendary.",
    footer: "Thornwick's Emporium"
  };

  console.log('Rendering complete cards with different portrait styles...\n');

  const rendered = [];

  for (const styleId of STYLES) {
    const portraitPath = path.join(baseDir, `style-${styleId}.png`);
    const cardPath = path.join(baseDir, `card-${styleId}.png`);

    if (!fs.existsSync(portraitPath)) {
      console.log(`  Skipping ${styleId}: portrait not found`);
      continue;
    }

    await renderCard(portraitPath, cardPath, card);
    console.log(`  Rendered: card-${styleId}.png`);
    rendered.push(styleId);
  }

  // Update the markdown with card renders
  let md = `# Art Style Comparison

Same character rendered in different artistic styles. Each row shows:
1. **Portrait** - The AI-generated image
2. **Complete Card** - How it looks on the final card

---

`;

  for (const styleId of rendered) {
    const styleName = styleId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    md += `## ${styleName}

| Portrait | Complete Card |
|----------|---------------|
| ![portrait](style-${styleId}.png) | ![card](card-${styleId}.png) |

---

`;
  }

  md += `## Your Feedback

Which art style(s) work best for your cards?

Preferences:

Notes (consistency, printing concerns, etc.):
`;

  fs.writeFileSync(path.join(baseDir, 'STYLE-COMPARISON.md'), md);
  console.log('\nUpdated STYLE-COMPARISON.md with card renders');
}

main().catch(console.error);

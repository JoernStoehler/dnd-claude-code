#!/usr/bin/env node
/**
 * render-card-sharp.js - Render card PNG directly using sharp (no browser)
 *
 * Usage:
 *   node render-card-sharp.js <card.json> <output.png> [--style=STYLE]
 *
 * Styles: dark (default), parchment
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Card dimensions (poker size at 300dpi)
const CARD_WIDTH = 750;
const CARD_HEIGHT = 1050;
const PADDING = 36;

// Style configurations
const STYLES = {
  dark: {
    portraitHeight: 620,
    headerHeight: 95,
    footerHeight: 40,
    bgColor: '#1a1a1a',
    textColor: '#e0e0e0',
    headerTextColor: 'white',
    footerBgColor: '#111111',
    footerTextColor: '#666666',
    textured: true,
    portraitInset: 0
  },
  parchment: {
    portraitHeight: 620,
    headerHeight: 95,
    footerHeight: 40,
    bgColor: '#f4e4c1',
    textColor: '#2a2016',
    headerTextColor: '#f4e4c1',
    footerBgColor: '#e8d4a8',
    footerTextColor: '#5a4a36',
    textured: true,
    portraitInset: 0
  },
};

// Category colors
const CATEGORY_COLORS = {
  npc: { accent: '#8B4513', light: '#D2691E', dark: '#5D2E0C' },
  location: { accent: '#2E8B57', light: '#3CB371', dark: '#1D5A38' },
  item: { accent: '#4169E1', light: '#6495ED', dark: '#2B4594' },
  faction: { accent: '#8B008B', light: '#BA55D3', dark: '#5C005C' },
  quest: { accent: '#B8860B', light: '#DAA520', dark: '#7A5907' },
  mystery: { accent: '#4A4A4A', light: '#6A6A6A', dark: '#2A2A2A' }
};

function generateNoisePattern(width, height, density, color = 'white') {
  const dots = [];
  const count = Math.floor(width * height * density / 100);
  for (let i = 0; i < count; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const r = Math.random() * 1.5 + 0.5;
    const opacity = Math.random() * 0.08;
    dots.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" opacity="${opacity}"/>`);
  }
  return dots.join('\n');
}

async function createBackground(width, height, colors, style) {
  const s = STYLES[style];
  const noiseColor = style === 'parchment' ? '#8B4513' : 'white';

  const svg = `
    <svg width="${width}" height="${height}">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${style === 'parchment' ? '#f4e4c1' : colors.dark}"/>
          <stop offset="50%" style="stop-color:${s.bgColor}"/>
          <stop offset="100%" style="stop-color:${style === 'parchment' ? '#e8d4a8' : '#0d0d0d'}"/>
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#bg)"/>
      ${s.textured ? generateNoisePattern(width, height, 0.02, noiseColor) : ''}
    </svg>
  `;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

async function createHeader(width, height, category, name, colors, style) {
  const s = STYLES[style];
  const safeName = escapeXml(name);
  const safeCategory = escapeXml(category.toUpperCase());
  const fontSize = 40;
  const catSize = 22;

  const svg = `
    <svg width="${width}" height="${height}">
      <defs>
        <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${colors.accent}"/>
          <stop offset="100%" style="stop-color:${colors.light}"/>
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#headerGrad)"/>
      <text x="${width/2}" y="${catSize + 8}"
            font-family="serif" font-size="${catSize}" font-weight="400"
            fill="rgba(255,255,255,0.8)" text-anchor="middle"
            letter-spacing="4">${safeCategory}</text>
      <text x="${width/2}" y="${height - 20}"
            font-family="serif" font-size="${fontSize}" font-weight="bold"
            fill="${s.headerTextColor}" text-anchor="middle">${safeName}</text>
    </svg>
  `;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

async function createBody(width, height, description, colors, style) {
  const s = STYLES[style];
  const safeDesc = escapeXml(description || '');
  const fontSize = 28;
  const lineHeight = 34;
  const maxChars = 42;

  const descLines = wordWrap(safeDesc, maxChars);
  const descY = 40;

  const descText = descLines.map((line, i) =>
    `<text x="${PADDING}" y="${descY + i * lineHeight}"
           font-family="serif" font-size="${fontSize}" fill="${s.textColor}">${line}</text>`
  ).join('\n');

  const svg = `
    <svg width="${width}" height="${height}">
      <rect width="${width}" height="${height}" fill="transparent"/>
      ${descText}
    </svg>
  `;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

async function createFooter(width, height, text, style) {
  const s = STYLES[style];
  const borderColor = style === 'parchment' ? '#c4a882' : '#333333';

  const svg = `
    <svg width="${width}" height="${height}">
      <rect width="${width}" height="${height}" fill="${s.footerBgColor}"/>
      <line x1="0" y1="0" x2="${width}" y2="0" stroke="${borderColor}" stroke-width="2"/>
      <text x="${width/2}" y="${height/2 + 6}"
            font-family="serif" font-size="20" fill="${s.footerTextColor}"
            text-anchor="middle">${escapeXml(text || '')}</text>
    </svg>
  `;
  return sharp(Buffer.from(svg)).png().toBuffer();
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

function escapeXml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function renderCard(cardPath, outputPath, style = 'dark') {
  const card = JSON.parse(fs.readFileSync(cardPath, 'utf8'));
  const cardDir = path.dirname(cardPath);
  const colors = CATEGORY_COLORS[card.category] || CATEGORY_COLORS.npc;
  const s = STYLES[style];

  // Calculate portrait dimensions with inset
  const inset = s.portraitInset || 0;
  const portraitWidth = CARD_WIDTH - (inset * 2);
  const portraitInnerHeight = s.portraitHeight - (inset * 2);

  // Load or create portrait
  let portraitBuffer = null;
  if (card.portrait) {
    const portraitPath = path.resolve(cardDir, card.portrait);
    if (fs.existsSync(portraitPath)) {
      portraitBuffer = await sharp(portraitPath)
        .resize(portraitWidth, portraitInnerHeight, { fit: 'cover' })
        .toBuffer();
    }
  }

  if (!portraitBuffer) {
    const placeholderSvg = `
      <svg width="${portraitWidth}" height="${portraitInnerHeight}">
        <rect width="${portraitWidth}" height="${portraitInnerHeight}" fill="${colors.accent}" opacity="0.3"/>
        <text x="${portraitWidth/2}" y="${portraitInnerHeight/2}"
              font-family="serif" font-size="32" fill="${style === 'parchment' ? '#5a4a36' : '#666666'}"
              text-anchor="middle">[Portrait]</text>
      </svg>
    `;
    portraitBuffer = await sharp(Buffer.from(placeholderSvg)).png().toBuffer();
  }

  const bodyHeight = CARD_HEIGHT - s.headerHeight - s.portraitHeight - s.footerHeight;

  const [background, header, body, footer] = await Promise.all([
    createBackground(CARD_WIDTH, CARD_HEIGHT, colors, style),
    createHeader(CARD_WIDTH, s.headerHeight, card.category, card.name, colors, style),
    createBody(CARD_WIDTH, bodyHeight, card.description, colors, style),
    createFooter(CARD_WIDTH, s.footerHeight, card.footer, style)
  ]);

  // Calculate portrait position (centered if inset)
  const portraitLeft = inset - (s.portraitBorder || 0);
  const portraitTop = s.headerHeight + inset - (s.portraitBorder || 0);

  await sharp(background)
    .composite([
      { input: header, top: 0, left: 0 },
      { input: portraitBuffer, top: portraitTop, left: portraitLeft },
      { input: body, top: s.headerHeight + s.portraitHeight, left: 0 },
      { input: footer, top: CARD_HEIGHT - s.footerHeight, left: 0 }
    ])
    .png()
    .toFile(outputPath);

  console.log(`Rendered: ${outputPath} (${style})`);
}

// CLI
const args = process.argv.slice(2);
const positional = args.filter(a => !a.startsWith('--'));
const flags = Object.fromEntries(
  args.filter(a => a.startsWith('--'))
    .map(a => a.slice(2).split('='))
    .map(([k, v]) => [k, v ?? true])
);

if (positional.length < 2) {
  console.log(`
render-card-sharp.js - Render card PNG using sharp

Usage:
  node render-card-sharp.js <card.json> <output.png> [--style=STYLE]

Styles:
  dark      - Dark textured background, light text (default)
  parchment - Aged paper look, dark text

Example:
  node render-card-sharp.js card.json card.png --style=parchment
`);
  process.exit(0);
}

const style = flags.style || 'dark';
if (!STYLES[style]) {
  console.error(`Unknown style: ${style}. Available: ${Object.keys(STYLES).join(', ')}`);
  process.exit(1);
}

renderCard(positional[0], positional[1], style).catch(err => {
  console.error('Render failed:', err);
  process.exit(1);
});

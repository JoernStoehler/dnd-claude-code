#!/usr/bin/env node
/**
 * render-card-sharp.js - Render card PNG directly using sharp (no browser)
 *
 * Usage:
 *   node render-card-sharp.js <card.json> <output.png>
 *   node render-card-sharp.js card.json card.png
 *
 * Dependencies: sharp (npm install sharp)
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Card dimensions (poker size at ~3x for 300dpi)
const CARD_WIDTH = 750;   // 2.5" * 300dpi
const CARD_HEIGHT = 1050; // 3.5" * 300dpi
const PORTRAIT_HEIGHT = 480;
const HEADER_HEIGHT = 120;
const FOOTER_HEIGHT = 45;
const PADDING = 36;
const CORNER_RADIUS = 36;

// Category colors
const CATEGORY_COLORS = {
  npc: { accent: '#8B4513', light: '#D2691E', dark: '#5D2E0C' },
  location: { accent: '#2E8B57', light: '#3CB371', dark: '#1D5A38' },
  item: { accent: '#4169E1', light: '#6495ED', dark: '#2B4594' },
  faction: { accent: '#8B008B', light: '#BA55D3', dark: '#5C005C' },
  quest: { accent: '#B8860B', light: '#DAA520', dark: '#7A5907' }
};

/**
 * Create a textured background gradient
 */
async function createBackground(width, height, colors) {
  // Create base gradient
  const gradientSvg = `
    <svg width="${width}" height="${height}">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${colors.dark}"/>
          <stop offset="50%" style="stop-color:#1a1a1a"/>
          <stop offset="100%" style="stop-color:#0d0d0d"/>
        </linearGradient>
        <filter id="noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" result="noise"/>
          <feColorMatrix type="saturate" values="0"/>
          <feBlend in="SourceGraphic" in2="noise" mode="multiply"/>
        </filter>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#bg)"/>
      <!-- Add subtle noise texture via semi-random dots -->
      ${generateNoisePattern(width, height, 0.02)}
    </svg>
  `;

  return sharp(Buffer.from(gradientSvg)).png().toBuffer();
}

/**
 * Generate subtle noise pattern as SVG circles
 */
function generateNoisePattern(width, height, density) {
  const dots = [];
  const count = Math.floor(width * height * density / 100);
  for (let i = 0; i < count; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const r = Math.random() * 1.5 + 0.5;
    const opacity = Math.random() * 0.08;
    dots.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="white" opacity="${opacity}"/>`);
  }
  return dots.join('\n');
}

/**
 * Create the header with category and name
 */
async function createHeader(width, height, category, name, colors) {
  // Escape XML entities
  const safeName = escapeXml(name);
  const safeCategory = escapeXml(category.toUpperCase());

  const svg = `
    <svg width="${width}" height="${height}">
      <defs>
        <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${colors.accent}"/>
          <stop offset="100%" style="stop-color:${colors.light}"/>
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#headerGrad)"/>
      <text x="${width/2}" y="35"
            font-family="serif" font-size="24" font-weight="400"
            fill="rgba(255,255,255,0.8)" text-anchor="middle"
            letter-spacing="4">${safeCategory}</text>
      <text x="${width/2}" y="${height - 25}"
            font-family="serif" font-size="42" font-weight="bold"
            fill="white" text-anchor="middle"
            style="text-shadow: 2px 2px 4px rgba(0,0,0,0.3)">${safeName}</text>
    </svg>
  `;

  return sharp(Buffer.from(svg)).png().toBuffer();
}

/**
 * Create the body text area
 */
async function createBody(width, height, description, details, colors) {
  const safeDesc = escapeXml(description);

  // Word wrap description
  const descLines = wordWrap(safeDesc, 45);
  const descY = 40;
  const lineHeight = 32;

  const descText = descLines.map((line, i) =>
    `<text x="${PADDING}" y="${descY + i * lineHeight}"
           font-family="serif" font-size="28" fill="#e0e0e0">${line}</text>`
  ).join('\n');

  // Details section
  let detailsText = '';
  if (details && Object.keys(details).length > 0) {
    const detailY = descY + descLines.length * lineHeight + 40;
    let dy = 0;
    for (const [key, value] of Object.entries(details)) {
      detailsText += `
        <text x="${PADDING}" y="${detailY + dy}" font-family="serif" font-size="26">
          <tspan fill="${colors.light}" font-weight="bold">${escapeXml(key)}:</tspan>
          <tspan fill="#aaaaaa"> ${escapeXml(value)}</tspan>
        </text>
      `;
      dy += 34;
    }
  }

  const svg = `
    <svg width="${width}" height="${height}">
      <rect width="${width}" height="${height}" fill="transparent"/>
      ${descText}
      <line x1="${PADDING}" y1="${descY + descLines.length * lineHeight + 10}"
            x2="${width - PADDING}" y2="${descY + descLines.length * lineHeight + 10}"
            stroke="#444444" stroke-width="2"/>
      ${detailsText}
    </svg>
  `;

  return sharp(Buffer.from(svg)).png().toBuffer();
}

/**
 * Create footer
 */
async function createFooter(width, height, text) {
  const svg = `
    <svg width="${width}" height="${height}">
      <rect width="${width}" height="${height}" fill="#111111"/>
      <line x1="0" y1="0" x2="${width}" y2="0" stroke="#333333" stroke-width="2"/>
      <text x="${width/2}" y="${height/2 + 8}"
            font-family="serif" font-size="22" fill="#666666"
            text-anchor="middle">${escapeXml(text || '')}</text>
    </svg>
  `;

  return sharp(Buffer.from(svg)).png().toBuffer();
}

/**
 * Simple word wrap
 */
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

/**
 * Escape XML special characters
 */
function escapeXml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Main render function
 */
async function renderCard(cardPath, outputPath) {
  // Load card definition
  const card = JSON.parse(fs.readFileSync(cardPath, 'utf8'));
  const cardDir = path.dirname(cardPath);
  const colors = CATEGORY_COLORS[card.category] || CATEGORY_COLORS.npc;

  // Load portrait if exists
  let portraitBuffer = null;
  if (card.portrait) {
    const portraitPath = path.resolve(cardDir, card.portrait);
    if (fs.existsSync(portraitPath)) {
      portraitBuffer = await sharp(portraitPath)
        .resize(CARD_WIDTH, PORTRAIT_HEIGHT, { fit: 'cover' })
        .toBuffer();
    }
  }

  // Create placeholder if no portrait
  if (!portraitBuffer) {
    const placeholderSvg = `
      <svg width="${CARD_WIDTH}" height="${PORTRAIT_HEIGHT}">
        <rect width="${CARD_WIDTH}" height="${PORTRAIT_HEIGHT}" fill="${colors.accent}" opacity="0.3"/>
        <text x="${CARD_WIDTH/2}" y="${PORTRAIT_HEIGHT/2}"
              font-family="serif" font-size="32" fill="#666666"
              text-anchor="middle">[Portrait]</text>
      </svg>
    `;
    portraitBuffer = await sharp(Buffer.from(placeholderSvg)).png().toBuffer();
  }

  // Calculate body height
  const bodyHeight = CARD_HEIGHT - HEADER_HEIGHT - PORTRAIT_HEIGHT - FOOTER_HEIGHT;

  // Create all components
  const [background, header, body, footer] = await Promise.all([
    createBackground(CARD_WIDTH, CARD_HEIGHT, colors),
    createHeader(CARD_WIDTH, HEADER_HEIGHT, card.category, card.name, colors),
    createBody(CARD_WIDTH, bodyHeight, card.description, card.details, colors),
    createFooter(CARD_WIDTH, FOOTER_HEIGHT, card.footer)
  ]);

  // Composite all layers
  const result = await sharp(background)
    .composite([
      { input: header, top: 0, left: 0 },
      { input: portraitBuffer, top: HEADER_HEIGHT, left: 0 },
      { input: body, top: HEADER_HEIGHT + PORTRAIT_HEIGHT, left: 0 },
      { input: footer, top: CARD_HEIGHT - FOOTER_HEIGHT, left: 0 }
    ])
    .png()
    .toFile(outputPath);

  console.log(`Rendered: ${outputPath} (${CARD_WIDTH}x${CARD_HEIGHT})`);
}

// CLI
const args = process.argv.slice(2);
if (args.length < 2) {
  console.log(`
render-card-sharp.js - Render card PNG using sharp (no browser needed)

Usage:
  node render-card-sharp.js <card.json> <output.png>

Example:
  node render-card-sharp.js card.json card.png
`);
  process.exit(0);
}

renderCard(args[0], args[1]).catch(err => {
  console.error('Render failed:', err);
  process.exit(1);
});

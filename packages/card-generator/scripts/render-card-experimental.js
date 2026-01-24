#!/usr/bin/env node
/**
 * render-card-experimental.js - Explore different card layouts
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const CARD_WIDTH = 750;
const CARD_HEIGHT = 1050;
const PADDING = 36;

// Category colors
const CATEGORY_COLORS = {
  npc: { accent: '#8B4513', light: '#D2691E', dark: '#5D2E0C' },
  location: { accent: '#2E8B57', light: '#3CB371', dark: '#1D5A38' },
  item: { accent: '#4169E1', light: '#6495ED', dark: '#2B4594' },
  faction: { accent: '#8B008B', light: '#BA55D3', dark: '#5C005C' },
  quest: { accent: '#B8860B', light: '#DAA520', dark: '#7A5907' },
  mystery: { accent: '#4A4A4A', light: '#6A6A6A', dark: '#2A2A2A' }
};

const CATEGORY_ICONS = {
  npc: '<circle cx="12" cy="8" r="5"/><path d="M4 22c0-6 4-9 8-9s8 3 8 9"/>',
  location: '<path d="M4 22V10l8-8 8 8v12H4zm6-8h4v8h-4z"/>',
  item: '<path d="M12 2l10 10-10 10L2 12z"/>',
  faction: '<path d="M12 2l8 6v8l-8 6-8-6V8z"/>',
  quest: '<path d="M12 2l3 6 6 1-4 4 1 6-6-3-6 3 1-6-4-4 6-1z"/>',
  mystery: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4" fill="white"/>'
};

function escapeXml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
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

// LAYOUT A: Current design (baseline)
async function renderLayoutA(card, portraitBuffer, colors, outputPath) {
  const headerHeight = 95;
  const portraitHeight = 620;
  const footerHeight = 40;
  const bodyHeight = CARD_HEIGHT - headerHeight - portraitHeight - footerHeight;

  // Background
  const bgSvg = `
    <svg width="${CARD_WIDTH}" height="${CARD_HEIGHT}">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#f4e4c1"/>
          <stop offset="50%" style="stop-color:#f4e4c1"/>
          <stop offset="100%" style="stop-color:#e8d4a8"/>
        </linearGradient>
      </defs>
      <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="url(#bg)"/>
    </svg>
  `;

  // Header with icons
  const icon = CATEGORY_ICONS[card.category] || CATEGORY_ICONS.npc;
  const headerSvg = `
    <svg width="${CARD_WIDTH}" height="${headerHeight}">
      <defs>
        <linearGradient id="hg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${colors.accent}"/>
          <stop offset="100%" style="stop-color:${colors.light}"/>
        </linearGradient>
      </defs>
      <rect width="${CARD_WIDTH}" height="${headerHeight}" fill="url(#hg)"/>
      <g transform="translate(20, ${(headerHeight - 28) / 2}) scale(${28 / 24})"
         fill="rgba(255,255,255,0.7)">${icon}</g>
      <g transform="translate(${CARD_WIDTH - 48}, ${(headerHeight - 28) / 2}) scale(${28 / 24})"
         fill="rgba(255,255,255,0.7)">${icon}</g>
      <text x="${CARD_WIDTH/2}" y="${headerHeight/2 + 16}"
            font-family="serif" font-size="48" font-weight="bold"
            fill="#f4e4c1" text-anchor="middle">${escapeXml(card.name)}</text>
    </svg>
  `;

  // Body text
  const descLines = wordWrap(escapeXml(card.description || ''), 42);
  const descText = descLines.map((line, i) =>
    `<text x="${PADDING}" y="${40 + i * 34}" font-family="serif" font-size="28" fill="#2a2016">${line}</text>`
  ).join('\n');
  const bodySvg = `<svg width="${CARD_WIDTH}" height="${bodyHeight}">${descText}</svg>`;

  // Footer
  const footerSvg = `
    <svg width="${CARD_WIDTH}" height="${footerHeight}">
      <rect width="${CARD_WIDTH}" height="${footerHeight}" fill="#e8d4a8"/>
      <line x1="0" y1="0" x2="${CARD_WIDTH}" y2="0" stroke="#c4a882" stroke-width="2"/>
      <text x="${CARD_WIDTH/2}" y="${footerHeight/2 + 6}"
            font-family="serif" font-size="20" fill="#5a4a36"
            text-anchor="middle">${escapeXml(card.footer || '')}</text>
    </svg>
  `;

  const resizedPortrait = await sharp(portraitBuffer)
    .resize(CARD_WIDTH, portraitHeight, { fit: 'cover' })
    .toBuffer();

  const bg = await sharp(Buffer.from(bgSvg)).png().toBuffer();
  const header = await sharp(Buffer.from(headerSvg)).png().toBuffer();
  const body = await sharp(Buffer.from(bodySvg)).png().toBuffer();
  const footer = await sharp(Buffer.from(footerSvg)).png().toBuffer();

  await sharp(bg)
    .composite([
      { input: header, top: 0, left: 0 },
      { input: resizedPortrait, top: headerHeight, left: 0 },
      { input: body, top: headerHeight + portraitHeight, left: 0 },
      { input: footer, top: CARD_HEIGHT - footerHeight, left: 0 }
    ])
    .png().toFile(outputPath);
}

// LAYOUT B: Text overlay on portrait (gradient fade)
async function renderLayoutB(card, portraitBuffer, colors, outputPath) {
  const headerHeight = 85;
  const portraitHeight = 800;
  const footerHeight = 40;
  const overlayHeight = 200;

  const bgSvg = `
    <svg width="${CARD_WIDTH}" height="${CARD_HEIGHT}">
      <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="#f4e4c1"/>
    </svg>
  `;

  const icon = CATEGORY_ICONS[card.category] || CATEGORY_ICONS.npc;
  const headerSvg = `
    <svg width="${CARD_WIDTH}" height="${headerHeight}">
      <defs>
        <linearGradient id="hg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${colors.accent}"/>
          <stop offset="100%" style="stop-color:${colors.light}"/>
        </linearGradient>
      </defs>
      <rect width="${CARD_WIDTH}" height="${headerHeight}" fill="url(#hg)"/>
      <g transform="translate(16, ${(headerHeight - 24) / 2}) scale(1)"
         fill="rgba(255,255,255,0.7)">${icon}</g>
      <g transform="translate(${CARD_WIDTH - 40}, ${(headerHeight - 24) / 2}) scale(1)"
         fill="rgba(255,255,255,0.7)">${icon}</g>
      <text x="${CARD_WIDTH/2}" y="${headerHeight/2 + 14}"
            font-family="serif" font-size="44" font-weight="bold"
            fill="#f4e4c1" text-anchor="middle">${escapeXml(card.name)}</text>
    </svg>
  `;

  // Text overlay with gradient background
  const descLines = wordWrap(escapeXml(card.description || ''), 44);
  const descText = descLines.map((line, i) =>
    `<text x="${PADDING}" y="${70 + i * 32}" font-family="serif" font-size="26" fill="#f4e4c1">${line}</text>`
  ).join('\n');
  const overlaySvg = `
    <svg width="${CARD_WIDTH}" height="${overlayHeight}">
      <defs>
        <linearGradient id="fade" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:rgba(0,0,0,0)"/>
          <stop offset="30%" style="stop-color:rgba(0,0,0,0.7)"/>
          <stop offset="100%" style="stop-color:rgba(0,0,0,0.85)"/>
        </linearGradient>
      </defs>
      <rect width="${CARD_WIDTH}" height="${overlayHeight}" fill="url(#fade)"/>
      ${descText}
    </svg>
  `;

  const footerSvg = `
    <svg width="${CARD_WIDTH}" height="${footerHeight}">
      <rect width="${CARD_WIDTH}" height="${footerHeight}" fill="#1a1a1a"/>
      <text x="${CARD_WIDTH/2}" y="${footerHeight/2 + 6}"
            font-family="serif" font-size="18" fill="#888888"
            text-anchor="middle">${escapeXml(card.footer || '')}</text>
    </svg>
  `;

  const resizedPortrait = await sharp(portraitBuffer)
    .resize(CARD_WIDTH, portraitHeight, { fit: 'cover' })
    .toBuffer();

  const bg = await sharp(Buffer.from(bgSvg)).png().toBuffer();
  const header = await sharp(Buffer.from(headerSvg)).png().toBuffer();
  const overlay = await sharp(Buffer.from(overlaySvg)).png().toBuffer();
  const footer = await sharp(Buffer.from(footerSvg)).png().toBuffer();

  // Composite portrait with overlay
  const portraitWithOverlay = await sharp(resizedPortrait)
    .composite([{ input: overlay, top: portraitHeight - overlayHeight, left: 0 }])
    .toBuffer();

  await sharp(bg)
    .composite([
      { input: header, top: 0, left: 0 },
      { input: portraitWithOverlay, top: headerHeight, left: 0 },
      { input: footer, top: CARD_HEIGHT - footerHeight, left: 0 }
    ])
    .png().toFile(outputPath);
}

// LAYOUT C: Portrait first, name below portrait
async function renderLayoutC(card, portraitBuffer, colors, outputPath) {
  const portraitHeight = 650;
  const nameHeight = 80;
  const bodyHeight = 280;
  const footerHeight = 40;

  const bgSvg = `
    <svg width="${CARD_WIDTH}" height="${CARD_HEIGHT}">
      <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="#f4e4c1"/>
    </svg>
  `;

  // Name bar below portrait
  const icon = CATEGORY_ICONS[card.category] || CATEGORY_ICONS.npc;
  const nameSvg = `
    <svg width="${CARD_WIDTH}" height="${nameHeight}">
      <defs>
        <linearGradient id="ng" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${colors.accent}"/>
          <stop offset="100%" style="stop-color:${colors.light}"/>
        </linearGradient>
      </defs>
      <rect width="${CARD_WIDTH}" height="${nameHeight}" fill="url(#ng)"/>
      <g transform="translate(20, ${(nameHeight - 28) / 2}) scale(${28 / 24})"
         fill="rgba(255,255,255,0.7)">${icon}</g>
      <g transform="translate(${CARD_WIDTH - 48}, ${(nameHeight - 28) / 2}) scale(${28 / 24})"
         fill="rgba(255,255,255,0.7)">${icon}</g>
      <text x="${CARD_WIDTH/2}" y="${nameHeight/2 + 16}"
            font-family="serif" font-size="46" font-weight="bold"
            fill="white" text-anchor="middle">${escapeXml(card.name)}</text>
    </svg>
  `;

  const descLines = wordWrap(escapeXml(card.description || ''), 42);
  const descText = descLines.map((line, i) =>
    `<text x="${PADDING}" y="${40 + i * 34}" font-family="serif" font-size="28" fill="#2a2016">${line}</text>`
  ).join('\n');
  const bodySvg = `<svg width="${CARD_WIDTH}" height="${bodyHeight}">${descText}</svg>`;

  const footerSvg = `
    <svg width="${CARD_WIDTH}" height="${footerHeight}">
      <rect width="${CARD_WIDTH}" height="${footerHeight}" fill="#e8d4a8"/>
      <line x1="0" y1="0" x2="${CARD_WIDTH}" y2="0" stroke="#c4a882" stroke-width="2"/>
      <text x="${CARD_WIDTH/2}" y="${footerHeight/2 + 6}"
            font-family="serif" font-size="20" fill="#5a4a36"
            text-anchor="middle">${escapeXml(card.footer || '')}</text>
    </svg>
  `;

  const resizedPortrait = await sharp(portraitBuffer)
    .resize(CARD_WIDTH, portraitHeight, { fit: 'cover' })
    .toBuffer();

  const bg = await sharp(Buffer.from(bgSvg)).png().toBuffer();
  const name = await sharp(Buffer.from(nameSvg)).png().toBuffer();
  const body = await sharp(Buffer.from(bodySvg)).png().toBuffer();
  const footer = await sharp(Buffer.from(footerSvg)).png().toBuffer();

  await sharp(bg)
    .composite([
      { input: resizedPortrait, top: 0, left: 0 },
      { input: name, top: portraitHeight, left: 0 },
      { input: body, top: portraitHeight + nameHeight, left: 0 },
      { input: footer, top: CARD_HEIGHT - footerHeight, left: 0 }
    ])
    .png().toFile(outputPath);
}

// LAYOUT D: Name overlay at bottom of portrait
async function renderLayoutD(card, portraitBuffer, colors, outputPath) {
  const portraitHeight = 720;
  const nameOverlayHeight = 100;
  const bodyHeight = 290;
  const footerHeight = 40;

  const bgSvg = `
    <svg width="${CARD_WIDTH}" height="${CARD_HEIGHT}">
      <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="#f4e4c1"/>
    </svg>
  `;

  // Name overlay on portrait
  const icon = CATEGORY_ICONS[card.category] || CATEGORY_ICONS.npc;
  const nameOverlaySvg = `
    <svg width="${CARD_WIDTH}" height="${nameOverlayHeight}">
      <rect width="${CARD_WIDTH}" height="${nameOverlayHeight}" fill="rgba(0,0,0,0.7)"/>
      <g transform="translate(20, ${(nameOverlayHeight - 28) / 2}) scale(${28 / 24})"
         fill="${colors.light}">${icon}</g>
      <g transform="translate(${CARD_WIDTH - 48}, ${(nameOverlayHeight - 28) / 2}) scale(${28 / 24})"
         fill="${colors.light}">${icon}</g>
      <text x="${CARD_WIDTH/2}" y="${nameOverlayHeight/2 + 18}"
            font-family="serif" font-size="50" font-weight="bold"
            fill="white" text-anchor="middle">${escapeXml(card.name)}</text>
    </svg>
  `;

  const descLines = wordWrap(escapeXml(card.description || ''), 42);
  const descText = descLines.map((line, i) =>
    `<text x="${PADDING}" y="${40 + i * 34}" font-family="serif" font-size="28" fill="#2a2016">${line}</text>`
  ).join('\n');
  const bodySvg = `<svg width="${CARD_WIDTH}" height="${bodyHeight}">${descText}</svg>`;

  const footerSvg = `
    <svg width="${CARD_WIDTH}" height="${footerHeight}">
      <rect width="${CARD_WIDTH}" height="${footerHeight}" fill="#e8d4a8"/>
      <line x1="0" y1="0" x2="${CARD_WIDTH}" y2="0" stroke="#c4a882" stroke-width="2"/>
      <text x="${CARD_WIDTH/2}" y="${footerHeight/2 + 6}"
            font-family="serif" font-size="20" fill="#5a4a36"
            text-anchor="middle">${escapeXml(card.footer || '')}</text>
    </svg>
  `;

  const resizedPortrait = await sharp(portraitBuffer)
    .resize(CARD_WIDTH, portraitHeight, { fit: 'cover' })
    .toBuffer();

  const nameOverlay = await sharp(Buffer.from(nameOverlaySvg)).png().toBuffer();

  // Composite name overlay on portrait
  const portraitWithName = await sharp(resizedPortrait)
    .composite([{ input: nameOverlay, top: portraitHeight - nameOverlayHeight, left: 0 }])
    .toBuffer();

  const bg = await sharp(Buffer.from(bgSvg)).png().toBuffer();
  const body = await sharp(Buffer.from(bodySvg)).png().toBuffer();
  const footer = await sharp(Buffer.from(footerSvg)).png().toBuffer();

  await sharp(bg)
    .composite([
      { input: portraitWithName, top: 0, left: 0 },
      { input: body, top: portraitHeight, left: 0 },
      { input: footer, top: CARD_HEIGHT - footerHeight, left: 0 }
    ])
    .png().toFile(outputPath);
}

// LAYOUT E: Minimal - thin accent line, no header band
async function renderLayoutE(card, portraitBuffer, colors, outputPath) {
  const accentHeight = 8;
  const portraitHeight = 640;
  const nameHeight = 70;
  const bodyHeight = 292;
  const footerHeight = 40;

  const bgSvg = `
    <svg width="${CARD_WIDTH}" height="${CARD_HEIGHT}">
      <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="#f4e4c1"/>
    </svg>
  `;

  // Thin accent line
  const accentSvg = `
    <svg width="${CARD_WIDTH}" height="${accentHeight}">
      <rect width="${CARD_WIDTH}" height="${accentHeight}" fill="${colors.accent}"/>
    </svg>
  `;

  // Simple name (no background)
  const icon = CATEGORY_ICONS[card.category] || CATEGORY_ICONS.npc;
  const nameSvg = `
    <svg width="${CARD_WIDTH}" height="${nameHeight}">
      <g transform="translate(20, ${(nameHeight - 24) / 2}) scale(1)"
         fill="${colors.accent}">${icon}</g>
      <g transform="translate(${CARD_WIDTH - 44}, ${(nameHeight - 24) / 2}) scale(1)"
         fill="${colors.accent}">${icon}</g>
      <text x="${CARD_WIDTH/2}" y="${nameHeight/2 + 14}"
            font-family="serif" font-size="42" font-weight="bold"
            fill="${colors.dark}" text-anchor="middle">${escapeXml(card.name)}</text>
    </svg>
  `;

  const descLines = wordWrap(escapeXml(card.description || ''), 42);
  const descText = descLines.map((line, i) =>
    `<text x="${PADDING}" y="${36 + i * 32}" font-family="serif" font-size="26" fill="#2a2016">${line}</text>`
  ).join('\n');
  const bodySvg = `<svg width="${CARD_WIDTH}" height="${bodyHeight}">${descText}</svg>`;

  const footerSvg = `
    <svg width="${CARD_WIDTH}" height="${footerHeight}">
      <rect width="${CARD_WIDTH}" height="${footerHeight}" fill="#e8d4a8"/>
      <line x1="0" y1="0" x2="${CARD_WIDTH}" y2="0" stroke="#c4a882" stroke-width="1"/>
      <text x="${CARD_WIDTH/2}" y="${footerHeight/2 + 6}"
            font-family="serif" font-size="18" fill="#5a4a36"
            text-anchor="middle">${escapeXml(card.footer || '')}</text>
    </svg>
  `;

  const resizedPortrait = await sharp(portraitBuffer)
    .resize(CARD_WIDTH, portraitHeight, { fit: 'cover' })
    .toBuffer();

  const bg = await sharp(Buffer.from(bgSvg)).png().toBuffer();
  const accent = await sharp(Buffer.from(accentSvg)).png().toBuffer();
  const name = await sharp(Buffer.from(nameSvg)).png().toBuffer();
  const body = await sharp(Buffer.from(bodySvg)).png().toBuffer();
  const footer = await sharp(Buffer.from(footerSvg)).png().toBuffer();

  await sharp(bg)
    .composite([
      { input: accent, top: 0, left: 0 },
      { input: resizedPortrait, top: accentHeight, left: 0 },
      { input: name, top: accentHeight + portraitHeight, left: 0 },
      { input: body, top: accentHeight + portraitHeight + nameHeight, left: 0 },
      { input: footer, top: CARD_HEIGHT - footerHeight, left: 0 }
    ])
    .png().toFile(outputPath);
}

// LAYOUT F: Full bleed portrait with floating text box
async function renderLayoutF(card, portraitBuffer, colors, outputPath) {
  const portraitHeight = 1050; // Full card
  const boxMargin = 30;
  const boxHeight = 280;
  const boxY = CARD_HEIGHT - boxHeight - boxMargin;

  const icon = CATEGORY_ICONS[card.category] || CATEGORY_ICONS.npc;

  // Text box overlay
  const descLines = wordWrap(escapeXml(card.description || ''), 38);
  const descText = descLines.map((line, i) =>
    `<text x="${boxMargin + 20}" y="${80 + i * 30}" font-family="serif" font-size="24" fill="#2a2016">${line}</text>`
  ).join('\n');

  const boxSvg = `
    <svg width="${CARD_WIDTH}" height="${CARD_HEIGHT}">
      <rect x="${boxMargin}" y="${boxY}" width="${CARD_WIDTH - boxMargin*2}" height="${boxHeight}"
            fill="rgba(244,228,193,0.92)" rx="8"/>
      <rect x="${boxMargin}" y="${boxY}" width="${CARD_WIDTH - boxMargin*2}" height="50"
            fill="${colors.accent}" rx="8"/>
      <rect x="${boxMargin}" y="${boxY + 42}" width="${CARD_WIDTH - boxMargin*2}" height="10"
            fill="${colors.accent}"/>
      <g transform="translate(${boxMargin + 16}, ${boxY + 13}) scale(1)"
         fill="rgba(255,255,255,0.8)">${icon}</g>
      <text x="${CARD_WIDTH/2}" y="${boxY + 36}"
            font-family="serif" font-size="32" font-weight="bold"
            fill="white" text-anchor="middle">${escapeXml(card.name)}</text>
      ${descText.replace(/y="(\d+)"/g, (m, y) => `y="${boxY + 50 + parseInt(y) - 80 + 30}"`)}
      <text x="${CARD_WIDTH/2}" y="${boxY + boxHeight - 12}"
            font-family="serif" font-size="16" fill="#5a4a36"
            text-anchor="middle">${escapeXml(card.footer || '')}</text>
    </svg>
  `;

  const resizedPortrait = await sharp(portraitBuffer)
    .resize(CARD_WIDTH, portraitHeight, { fit: 'cover' })
    .toBuffer();

  const box = await sharp(Buffer.from(boxSvg)).png().toBuffer();

  await sharp(resizedPortrait)
    .composite([{ input: box, top: 0, left: 0 }])
    .png().toFile(outputPath);
}

// Main
async function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.log('Usage: node render-card-experimental.js <card.json> <output-dir>');
    process.exit(1);
  }

  const cardPath = args[0];
  const outputDir = args[1];

  const card = JSON.parse(fs.readFileSync(cardPath, 'utf8'));
  const cardDir = path.dirname(cardPath);
  const colors = CATEGORY_COLORS[card.category] || CATEGORY_COLORS.npc;

  // Load portrait
  let portraitBuffer;
  if (card.portrait) {
    const portraitPath = path.resolve(cardDir, card.portrait);
    if (fs.existsSync(portraitPath)) {
      portraitBuffer = fs.readFileSync(portraitPath);
    }
  }
  if (!portraitBuffer) {
    console.error('Portrait not found');
    process.exit(1);
  }

  // Render all layouts
  const layouts = [
    ['A', 'Current design (header → portrait → text)', renderLayoutA],
    ['B', 'Text overlay on portrait (gradient fade)', renderLayoutB],
    ['C', 'Portrait first, name bar below', renderLayoutC],
    ['D', 'Name overlay at bottom of portrait', renderLayoutD],
    ['E', 'Minimal (thin accent, no header band)', renderLayoutE],
    ['F', 'Full bleed portrait with floating box', renderLayoutF],
  ];

  for (const [id, desc, fn] of layouts) {
    const outPath = path.join(outputDir, `layout-${id}.png`);
    console.log(`Rendering Layout ${id}: ${desc}`);
    await fn(card, portraitBuffer, colors, outPath);
    console.log(`  → ${outPath}`);
  }

  console.log('Done!');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

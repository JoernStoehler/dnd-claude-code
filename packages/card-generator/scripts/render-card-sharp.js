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

// Card dimensions (tarot size at 300dpi: 70×120mm)
const CARD_WIDTH = 827;
const CARD_HEIGHT = 1417;
const PADDING = 40;
const PORTRAIT_BORDER = 40; // Category-colored border around portrait (MTG-style framing)

// Style configurations (tarot size)
const STYLES = {
  dark: {
    portraitHeight: 827,
    headerHeight: 90,
    footerHeight: 40,
    bgColor: '#1a1a1a',
    textColor: '#e0e0e0',
    headerTextColor: 'white',
    footerBgColor: '#111111',
    footerTextColor: '#666666'
  },
  parchment: {
    portraitHeight: 827,
    headerHeight: 90,
    footerHeight: 40,
    bgColor: '#f4e4c1',
    textColor: '#2a2016',
    headerTextColor: '#f4e4c1',
    footerBgColor: '#e8d4a8',
    footerTextColor: '#5a4a36'
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

async function createBackground(width, height, colors, style, headerHeight, portraitHeight) {
  const s = STYLES[style];

  // Portrait border area (category-colored frame around portrait)
  const borderGradient = `
    <defs>
      <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${colors.accent}"/>
        <stop offset="100%" style="stop-color:${colors.light}"/>
      </linearGradient>
    </defs>
    <rect x="0" y="${headerHeight}" width="${width}" height="${portraitHeight}" fill="url(#borderGrad)"/>
  `;

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
      ${borderGradient}
    </svg>
  `;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

// Category icons (simple SVG paths, 24x24 viewBox)
const CATEGORY_ICONS = {
  npc: '<circle cx="12" cy="8" r="5"/><path d="M4 22c0-6 4-9 8-9s8 3 8 9"/>', // person
  location: '<path d="M4 22V10l8-8 8 8v12H4zm6-8h4v8h-4z"/>', // house
  item: '<path d="M12 2l10 10-10 10L2 12z"/>', // diamond
  faction: '<path d="M12 2l8 6v8l-8 6-8-6V8z"/>', // hexagon
  quest: '<path d="M12 2l3 6 6 1-4 4 1 6-6-3-6 3 1-6-4-4 6-1z"/>', // star
  mystery: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4" fill="white"/>' // eye
};

// Calculate font size for header based on name length
// Returns { fontSize, lines } where lines is array of text lines
function calculateHeaderFont(name, maxWidth, iconMargin, iconSize) {
  const availableWidth = maxWidth - (iconMargin + iconSize) * 2 - 20; // 20px extra padding
  const baseFontSize = 52;
  const minFontSize = 32;

  // Approximate character width as 0.6 * fontSize for serif
  const charWidthRatio = 0.55;

  // Try single line first
  for (let fontSize = baseFontSize; fontSize >= minFontSize; fontSize -= 4) {
    const estimatedWidth = name.length * fontSize * charWidthRatio;
    if (estimatedWidth <= availableWidth) {
      return { fontSize, lines: [name] };
    }
  }

  // Need to wrap to 2 lines at minimum font size
  const fontSize = minFontSize;
  const charsPerLine = Math.floor(availableWidth / (fontSize * charWidthRatio));
  const words = name.split(' ');
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + ' ' + word).trim().length <= charsPerLine) {
      currentLine = (currentLine + ' ' + word).trim();
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);

  // Limit to 2 lines
  if (lines.length > 2) {
    lines[1] = lines.slice(1).join(' ');
    lines.length = 2;
    // Truncate if still too long
    if (lines[1].length > charsPerLine) {
      lines[1] = lines[1].slice(0, charsPerLine - 3) + '...';
    }
  }

  return { fontSize, lines };
}

async function createHeader(width, height, category, name, colors, style) {
  const s = STYLES[style];
  const iconSize = 32;
  const iconMargin = 24;
  const icon = CATEGORY_ICONS[category] || CATEGORY_ICONS.npc;

  const { fontSize, lines } = calculateHeaderFont(name, width, iconMargin, iconSize);
  const lineHeight = fontSize * 1.1;
  const totalTextHeight = lines.length * lineHeight;
  const textStartY = (height + fontSize * 0.35) / 2 - (totalTextHeight - lineHeight) / 2;

  const textElements = lines.map((line, i) =>
    `<text x="${width/2}" y="${textStartY + i * lineHeight}"
           font-family="serif" font-size="${fontSize}" font-weight="bold"
           fill="${s.headerTextColor}" text-anchor="middle">${escapeXml(line)}</text>`
  ).join('\n');

  const svg = `
    <svg width="${width}" height="${height}">
      <defs>
        <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${colors.accent}"/>
          <stop offset="100%" style="stop-color:${colors.light}"/>
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#headerGrad)"/>
      <g transform="translate(${iconMargin}, ${(height - iconSize) / 2}) scale(${iconSize / 24})"
         fill="rgba(255,255,255,0.7)" stroke="none">${icon}</g>
      <g transform="translate(${width - iconMargin - iconSize}, ${(height - iconSize) / 2}) scale(${iconSize / 24})"
         fill="rgba(255,255,255,0.7)" stroke="none">${icon}</g>
      ${textElements}
    </svg>
  `;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

async function createBody(width, height, description, colors, style) {
  const s = STYLES[style];
  const safeDesc = escapeXml(description || '');

  // Standard font for 1-6 lines, smaller for 7+
  const standardFontSize = 28;
  const standardLineHeight = 36;
  const standardMaxChars = 46;

  const smallFontSize = 24;
  const smallLineHeight = 30;
  const smallMaxChars = 54;

  // First try with standard font
  let descLines = wordWrap(safeDesc, standardMaxChars);
  let fontSize = standardFontSize;
  let lineHeight = standardLineHeight;

  // If more than 6 lines, switch to smaller font
  if (descLines.length > 6) {
    descLines = wordWrap(safeDesc, smallMaxChars);
    fontSize = smallFontSize;
    lineHeight = smallLineHeight;
  }

  const descY = 44;

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

  // Portrait dimensions (with border)
  const portraitAreaWidth = CARD_WIDTH;
  const portraitAreaHeight = s.portraitHeight;
  const portraitWidth = portraitAreaWidth - PORTRAIT_BORDER * 2;
  const portraitHeight = portraitAreaHeight - PORTRAIT_BORDER * 2;

  // Load or create portrait
  let portraitBuffer = null;
  if (card.portrait) {
    const portraitPath = path.resolve(cardDir, card.portrait);
    if (fs.existsSync(portraitPath)) {
      portraitBuffer = await sharp(portraitPath)
        .resize(portraitWidth, portraitHeight, { fit: 'cover' })
        .toBuffer();
    }
  }

  if (!portraitBuffer) {
    const placeholderSvg = `
      <svg width="${portraitWidth}" height="${portraitHeight}">
        <rect width="${portraitWidth}" height="${portraitHeight}" fill="${colors.accent}" opacity="0.3"/>
        <text x="${portraitWidth/2}" y="${portraitHeight/2}"
              font-family="serif" font-size="32" fill="${style === 'parchment' ? '#5a4a36' : '#666666'}"
              text-anchor="middle">[Portrait]</text>
      </svg>
    `;
    portraitBuffer = await sharp(Buffer.from(placeholderSvg)).png().toBuffer();
  }

  const bodyHeight = CARD_HEIGHT - s.headerHeight - s.portraitHeight - s.footerHeight;

  const [background, header, body, footer] = await Promise.all([
    createBackground(CARD_WIDTH, CARD_HEIGHT, colors, style, s.headerHeight, s.portraitHeight),
    createHeader(CARD_WIDTH, s.headerHeight, card.category, card.name, colors, style),
    createBody(CARD_WIDTH, bodyHeight, card.description, colors, style),
    createFooter(CARD_WIDTH, s.footerHeight, card.footer, style)
  ]);

  // Portrait position (centered within border)
  const portraitLeft = PORTRAIT_BORDER;
  const portraitTop = s.headerHeight + PORTRAIT_BORDER;

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

/**
 * Card renderer - generates tarot-sized PNG cards with texture backgrounds.
 *
 * Layout: texture background + rounded portrait + SVG overlay (title, text, icons, footer).
 * Uses opentype.js for actual font measurement instead of character-count heuristics.
 *
 * @example
 *   const { renderCard } = require('./render-card');
 *   await renderCard({
 *     card: { name: 'Grimble', description: '...', footer: 'Shop', category: 'npc' },
 *     portraitPath: 'portrait.png',
 *     texturePath: 'texture.png',
 *     outputPath: 'card.png'
 *   });
 */

const fs = require('fs');
const sharp = require('sharp');
const opentype = require('opentype.js');

// =============================================================================
// FONT LOADING
// =============================================================================

let titleFont = null;
const FONT_PATHS = [
  '/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf',
  '/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf',
  '/System/Library/Fonts/Times.ttc',
  'C:\\Windows\\Fonts\\timesbd.ttf'
];
for (const fp of FONT_PATHS) {
  if (fs.existsSync(fp)) {
    try {
      titleFont = opentype.loadSync(fp);
      break;
    } catch (e) { /* try next */ }
  }
}

function measureTextWidth(text, fontSize) {
  if (!titleFont) {
    return text.length * fontSize * 0.6; // fallback estimate
  }
  const scale = fontSize / titleFont.unitsPerEm;
  let width = 0;
  for (let i = 0; i < text.length; i++) {
    const glyph = titleFont.charToGlyph(text[i]);
    width += glyph.advanceWidth * scale;
  }
  return width;
}

// =============================================================================
// LAYOUT CONSTANTS
// =============================================================================

const W = 827, H = 1417;              // Card dimensions (tarot at 300dpi)
const B = 40;                          // Margin on all four sides

const HEADER_CONTENT_H = 80;          // Title + icons region
const PORTRAIT_H = 650;               // Portrait image height
const FOOTER_H = 40;                  // Footer text + icons

// Derived vertical positions
const HEADER_TOP = B;                                     // 40
const HEADER_BOTTOM = B + HEADER_CONTENT_H;               // 120
const PORTRAIT_TOP = HEADER_BOTTOM;                       // 120
const PORTRAIT_BOTTOM = PORTRAIT_TOP + PORTRAIT_H;        // 770
const TEXT_TOP = PORTRAIT_BOTTOM;                          // 770
const FOOTER_TOP = H - B - FOOTER_H;                      // 1337
const FOOTER_BOTTOM = H - B;                              // 1377
const TEXT_BOTTOM = FOOTER_TOP;                            // 1337

// Horizontal positions
const CONTENT_LEFT = B;                                   // 40
const CONTENT_RIGHT = W - B;                              // 787
const CONTENT_W = W - 2 * B;                              // 747

// Icons
const ICON_SIZE = 36;
const ICON_MARGIN = 12;
const ICON_LEFT_X = CONTENT_LEFT + ICON_MARGIN;           // 52
const ICON_RIGHT_X = CONTENT_RIGHT - ICON_SIZE - ICON_MARGIN; // 739

// Title
const TITLE_MAX_W = CONTENT_W - 2 * (ICON_SIZE + ICON_MARGIN + 10); // ~611px
const TITLE_SIZES_SINGLE = [52, 42, 34, 28];
const TITLE_SIZES_DOUBLE = [34, 28];

// Portrait positioning (inset from content edges)
const PORTRAIT_PADDING = 20;
const PORTRAIT_W = CONTENT_W - 2 * PORTRAIT_PADDING;      // 707
const PORTRAIT_X = CONTENT_LEFT + PORTRAIT_PADDING;        // 60

// Typography
const LINE_HEIGHT = 36;
const TEXT_AREA_PADDING = 24;
const TEXT_START_OFFSET = 44;
const DIVIDER_OFFSET = 16;
const FOOTER_BASELINE_OFFSET = 8;
const FOOTER_SIDE_PADDING = 20;

// Decorative
const DIVIDER_MARGIN = 20;
const DECORATIVE_CORNER_SIZE = 15;
const PORTRAIT_BORDER_OFFSET = 4;
const PORTRAIT_BORDER_WIDTH = 4;

// Colors
const TEXT_COLOR = '#f4e4c1';
const TEXT_STROKE = 'stroke="rgba(0,0,0,0.5)" stroke-width="2" paint-order="stroke"';

// Corner radius for rounded portrait
const CORNER_RADIUS = 20;

// =============================================================================
// CATEGORY DATA
// =============================================================================

const CATEGORY_ICONS = {
  npc: `<g transform="translate(0,0) scale(1.5)" fill="none" stroke="#f4e4c1" stroke-width="2"><circle cx="12" cy="8" r="5"/><path d="M4 22c0-6 4-9 8-9s8 3 8 9"/></g>`,
  location: `<g transform="translate(0,0) scale(1.5)" fill="none" stroke="#f4e4c1" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></g>`,
  item: `<g transform="translate(0,0) scale(1.5)" fill="none" stroke="#f4e4c1" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></g>`,
  faction: `<g transform="translate(0,0) scale(1.5)" fill="none" stroke="#f4e4c1" stroke-width="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></g>`,
  quest: `<g transform="translate(0,0) scale(1.5)" fill="none" stroke="#f4e4c1" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></g>`,
  mystery: `<g transform="translate(0,0) scale(1.5)" fill="none" stroke="#f4e4c1" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/></g>`
};

const CATEGORY_COLORS = {
  npc: { accent: '#8B4513', light: '#D2691E' },
  location: { accent: '#2E8B57', light: '#3CB371' },
  item: { accent: '#4169E1', light: '#6495ED' },
  faction: { accent: '#8B008B', light: '#BA55D3' },
  quest: { accent: '#B8860B', light: '#DAA520' },
  mystery: { accent: '#4A4A4A', light: '#696969' }
};

// =============================================================================
// TEXT UTILITIES
// =============================================================================

function escapeXml(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function wrapText(text, maxWidth, fontSize) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';
  for (const word of words) {
    const testLine = currentLine ? currentLine + ' ' + word : word;
    if (measureTextWidth(testLine, fontSize) <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

function truncateToFit(text, fontSize, maxWidth) {
  if (measureTextWidth(text, fontSize) <= maxWidth) return text;
  let truncated = text;
  while (measureTextWidth(truncated + '\u2026', fontSize) > maxWidth && truncated.length > 1) {
    truncated = truncated.slice(0, -1);
  }
  return truncated + '\u2026';
}

// =============================================================================
// TITLE SIZING
// =============================================================================

function findBestTitleSplit(name, fontSize = 34) {
  const words = name.split(' ');
  if (words.length < 2) return null;
  let best = null, bestMaxW = Infinity;
  for (let i = 1; i < words.length; i++) {
    const line1 = words.slice(0, i).join(' ');
    const line2 = words.slice(i).join(' ');
    const maxW = Math.max(measureTextWidth(line1, fontSize), measureTextWidth(line2, fontSize));
    if (maxW < bestMaxW) { bestMaxW = maxW; best = [line1, line2]; }
  }
  return best;
}

function calculateAutoTitle(name, defaultSize = 52) {
  const split = findBestTitleSplit(name);

  // Try single line at each size (largest to smallest)
  for (const size of TITLE_SIZES_SINGLE) {
    if (measureTextWidth(name, size) <= TITLE_MAX_W) {
      return { size, lines: [name] };
    }
  }

  // Try 2 lines
  if (split) {
    for (const size of TITLE_SIZES_DOUBLE) {
      const w1 = measureTextWidth(split[0], size);
      const w2 = measureTextWidth(split[1], size);
      if (w1 <= TITLE_MAX_W && w2 <= TITLE_MAX_W) {
        return { size, lines: split };
      }
    }
  }

  // Fallback: truncate at smallest size
  const minSize = TITLE_SIZES_SINGLE[TITLE_SIZES_SINGLE.length - 1];
  let truncated = name;
  while (measureTextWidth(truncated + '\u2026', minSize) > TITLE_MAX_W && truncated.length > 1) {
    truncated = truncated.slice(0, -1);
  }
  return { size: minSize, lines: [truncated + '\u2026'] };
}

// =============================================================================
// SVG GENERATION
// =============================================================================

function generateTitleSvg(titleLines, titleSize) {
  const titleLineHeight = titleSize * 1.1;
  const titleBlockHeight = titleLines.length * titleLineHeight;
  const headerCenterY = HEADER_TOP + HEADER_CONTENT_H / 2;
  const titleStartY = headerCenterY - titleBlockHeight / 2 + titleSize * 0.75;

  return titleLines.map((line, i) =>
    `<text x="${W / 2}" y="${titleStartY + i * titleLineHeight}" font-family="serif" font-size="${titleSize}" font-weight="bold" fill="${TEXT_COLOR}" text-anchor="middle" ${TEXT_STROKE}>${escapeXml(line)}</text>`
  ).join('\n    ');
}

function generateHeaderIcons(iconSvg) {
  const headerIconY = HEADER_TOP + (HEADER_CONTENT_H - ICON_SIZE) / 2;
  return `
    <g transform="translate(${ICON_LEFT_X}, ${headerIconY})">${iconSvg}</g>
    <g transform="translate(${ICON_RIGHT_X}, ${headerIconY})">${iconSvg}</g>
  `;
}

function generateFooterIcons(iconSvg) {
  const footerIconY = FOOTER_TOP + (FOOTER_H - ICON_SIZE) / 2;
  return `
    <g transform="translate(${ICON_LEFT_X}, ${footerIconY})">${iconSvg}</g>
    <g transform="translate(${ICON_RIGHT_X}, ${footerIconY})">${iconSvg}</g>
  `;
}

function generateFooterText(footer) {
  const FOOTER_FONT_SIZE = 24;
  const FOOTER_MAX_W = CONTENT_W - 2 * FOOTER_SIDE_PADDING;
  const displayFooter = truncateToFit(footer, FOOTER_FONT_SIZE, FOOTER_MAX_W);
  const footerCenterY = FOOTER_TOP + FOOTER_H / 2;
  const footerTextY = footerCenterY + FOOTER_BASELINE_OFFSET;
  return `<text x="${W / 2}" y="${footerTextY}" font-family="serif" font-size="${FOOTER_FONT_SIZE}" fill="${TEXT_COLOR}" text-anchor="middle" ${TEXT_STROKE}>${escapeXml(displayFooter)}</text>`;
}

function generateDivider() {
  const dividerY = TEXT_TOP + DIVIDER_MARGIN;
  return `<line x1="${CONTENT_LEFT + DIVIDER_MARGIN}" y1="${dividerY}" x2="${CONTENT_RIGHT - DIVIDER_MARGIN}" y2="${dividerY}" stroke="${TEXT_COLOR}" stroke-width="3" opacity="0.7"/>`;
}

function generatePortraitClipDefs() {
  return `<defs>
    <clipPath id="portraitClip">
      <rect x="${PORTRAIT_X}" y="${PORTRAIT_TOP}" width="${PORTRAIT_W}" height="${PORTRAIT_H}" rx="${CORNER_RADIUS}"/>
    </clipPath>
  </defs>`;
}

function generateOverlaySvg(card) {
  const iconSvg = CATEGORY_ICONS[card.category] || CATEGORY_ICONS.npc;
  const { size: titleSize, lines: titleLines } = calculateAutoTitle(card.name);

  const textMaxWidth = CONTENT_W - TEXT_AREA_PADDING * 2;
  const bodySize = 28;
  const bodyLines = wrapText(escapeXml(card.description), textMaxWidth, bodySize);
  const textStartY = TEXT_TOP + TEXT_START_OFFSET + DIVIDER_OFFSET;

  return `<svg width="${W}" height="${H}">
    ${generatePortraitClipDefs()}
    ${generateHeaderIcons(iconSvg)}
    ${generateTitleSvg(titleLines, titleSize)}
    ${generateDivider()}
    ${bodyLines.map((l, i) => `<text x="${CONTENT_LEFT + TEXT_AREA_PADDING}" y="${textStartY + i * LINE_HEIGHT}" font-family="serif" font-size="${bodySize}" fill="${TEXT_COLOR}" ${TEXT_STROKE}>${l}</text>`).join('')}
    ${generateFooterIcons(iconSvg)}
    ${generateFooterText(card.footer || '')}
  </svg>`;
}

// =============================================================================
// RENDERING
// =============================================================================

async function renderCard({ card, portraitPath, texturePath, outputPath }) {
  if (!fs.existsSync(portraitPath)) {
    throw new Error(`Portrait not found: ${portraitPath}`);
  }
  if (!fs.existsSync(texturePath)) {
    throw new Error(`Texture not found: ${texturePath}`);
  }

  // Build portrait with rounded corners
  const mask = Buffer.from(`<svg width="${PORTRAIT_W}" height="${PORTRAIT_H}">
    <rect width="${PORTRAIT_W}" height="${PORTRAIT_H}" rx="${CORNER_RADIUS}" fill="white"/>
  </svg>`);
  const maskBuffer = await sharp(mask).png().toBuffer();
  const portrait = await sharp(portraitPath)
    .resize(PORTRAIT_W, PORTRAIT_H, { fit: 'cover' })
    .composite([{ input: maskBuffer, blend: 'dest-in' }])
    .png()
    .toBuffer();

  // Resize texture to card dimensions
  const texture = await sharp(texturePath).resize(W, H, { fit: 'cover' }).toBuffer();

  // Generate SVG overlay
  const svg = generateOverlaySvg(card);
  const overlay = await sharp(Buffer.from(svg)).png().toBuffer();

  // Composite: texture -> portrait -> SVG overlay
  await sharp(texture)
    .composite([
      { input: portrait, top: PORTRAIT_TOP, left: PORTRAIT_X },
      { input: overlay, top: 0, left: 0 }
    ])
    .png()
    .toFile(outputPath);
}

module.exports = {
  renderCard,
  // Exported for testing or advanced use
  CATEGORY_ICONS,
  CATEGORY_COLORS,
  W, H, B,
  PORTRAIT_W, PORTRAIT_H,
  measureTextWidth,
  calculateAutoTitle,
  wrapText,
  escapeXml
};

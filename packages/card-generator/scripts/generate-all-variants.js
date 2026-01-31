#!/usr/bin/env node
/**
 * Generate layout variants for comparison
 *
 * LAYOUT SPECIFICATION
 * ====================
 * Card dimensions: W=827px, H=1417px (tarot size at 300dpi)
 *
 * MARGINS (B=40px on all four sides for print safety):
 *   Safe area: x ∈ [B, W-B] = [40, 787], y ∈ [B, H-B] = [40, 1377]
 *
 * VERTICAL REGIONS (top to bottom, all within safe area):
 *   Header:   y ∈ [B, B+HEADER_H]                    - title + corner icons
 *   Portrait: y ∈ [B+HEADER_H, B+HEADER_H+PORTRAIT_H] - character image
 *   Text:     y ∈ [portrait_bottom, footer_top]      - description
 *   Footer:   y ∈ [H-B-FOOTER_H, H-B]                - location + corner icons
 *
 * CONSTRAINTS:
 *   C1: Title must fit between header icons (width ≤ TITLE_MAX_W)
 *   C2: 2-line title (75px) must fit in header region
 *   C3: All content must stay within safe area (B margin from edges)
 *   C4: Icons vertically centered in their regions
 *
 * DERIVED MEASUREMENTS:
 *   - Icon size: 36px (24px base scaled 1.5x)
 *   - 2-line title at 34px: 2 * 34 * 1.1 = 75px height
 *   - Header needs: max(icon_h, title_h) + padding ≈ 80px
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const opentype = require('opentype.js');

// Load system serif font for text measurement
// Falls back to a reasonable default if not found
let titleFont = null;
const fontPaths = [
  '/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf',
  '/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf',
  '/System/Library/Fonts/Times.ttc',
  'C:\\Windows\\Fonts\\timesbd.ttf'
];
for (const fp of fontPaths) {
  if (fs.existsSync(fp)) {
    try {
      titleFont = opentype.loadSync(fp);
      break;
    } catch (e) { /* try next */ }
  }
}

// Measure actual text width in pixels at given font size
function measureTextWidth(text, fontSize) {
  if (!titleFont) {
    // Fallback: estimate based on 0.6 average char width
    return text.length * fontSize * 0.6;
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
// LAYOUT CONSTANTS - All positioning derives from these values
// =============================================================================
const W = 827, H = 1417;           // Card dimensions
const B = 40;                       // Margin on ALL four sides

// Vertical region heights (content heights, not including margins)
const HEADER_CONTENT_H = 80;        // Space for title + icons (fits 2-line title)
const PORTRAIT_H = 650;             // Portrait image height (reduced to fit margins)
const FOOTER_H = 40;                // Footer text + icons

// Derived vertical positions (all respect top margin B)
const HEADER_TOP = B;                                    // 40
const HEADER_BOTTOM = B + HEADER_CONTENT_H;              // 120
const PORTRAIT_TOP = HEADER_BOTTOM;                      // 120
const PORTRAIT_BOTTOM = PORTRAIT_TOP + PORTRAIT_H;       // 770
const TEXT_TOP = PORTRAIT_BOTTOM;                        // 770
const FOOTER_TOP = H - B - FOOTER_H;                     // 1337
const FOOTER_BOTTOM = H - B;                             // 1377
const TEXT_BOTTOM = FOOTER_TOP;                          // 1337

// Horizontal positions
const CONTENT_LEFT = B;                                  // 40
const CONTENT_RIGHT = W - B;                             // 787
const CONTENT_W = W - 2 * B;                             // 747

// Icon dimensions and positions
const ICON_SIZE = 36;
const ICON_MARGIN = 12;                                  // Margin from content edge
const ICON_LEFT_X = CONTENT_LEFT + ICON_MARGIN;          // 52
const ICON_RIGHT_X = CONTENT_RIGHT - ICON_SIZE - ICON_MARGIN;  // 739

// Title constraints (actual width measured via opentype.js)
const TITLE_MAX_W = CONTENT_W - 2 * (ICON_SIZE + ICON_MARGIN + 10);  // ~611px

// Portrait positioning (with padding to be narrower than text)
const PORTRAIT_PADDING = 20;
const PORTRAIT_W = CONTENT_W - 2 * PORTRAIT_PADDING;     // 707
const PORTRAIT_X = CONTENT_LEFT + PORTRAIT_PADDING;      // 60

// Colors
const TEXT_COLOR = '#f4e4c1';  // Cream/parchment for text on dark backgrounds
const TEXT_COLOR_DARK = '#2a2016';  // Dark text for light backgrounds
const PARCHMENT_LIGHT = '#f4e4c1';  // Light parchment background
const PARCHMENT_DARK = '#e8d4a8';   // Darker parchment for footer
const FOOTER_TEXT_DARK = '#5a4a36'; // Footer text on light background
const DARK_TINT = 'rgba(0,0,0,0.35)';  // Dark overlay for text area
const LEATHER_TINT = 'rgba(90,50,20,0.5)';  // Leather-colored overlay
const TEXT_STROKE_COLOR = 'rgba(0,0,0,0.5)';  // Text stroke for readability

// Typography
const LINE_HEIGHT = 36;                                  // Standard line height for body text
const TEXT_AREA_PADDING = 24;                            // Horizontal padding inside text area
const TEXT_START_OFFSET = 44;                            // Vertical offset from TEXT_TOP to first line
const FOOTER_BASELINE_OFFSET = 8;                        // Baseline offset for footer text
const TITLE_SIZES_SINGLE = [52, 42, 34, 28];             // Title sizes to try for single line
const TITLE_SIZES_DOUBLE = [34, 28];                     // Title sizes that fit 2 lines in header

// Decorative elements
const DIVIDER_MARGIN = 20;                               // Horizontal margin for divider line
const DIVIDER_OFFSET = 16;                               // Extra vertical offset when divider present
const FOOTER_SIDE_PADDING = 20;                          // Side padding for footer text
const DECORATIVE_CORNER_SIZE = 15;                       // Size of decorative corner brackets
const PORTRAIT_BORDER_OFFSET = 4;                        // Offset for portrait border stroke
const PORTRAIT_BORDER_WIDTH = 4;                         // Stroke width for portrait border

// =============================================================================
// END LAYOUT CONSTANTS
// =============================================================================

const NPC_COLORS = { accent: '#8B4513', light: '#D2691E' };

// Category-specific icons (simple SVG paths for different card types)
const CATEGORY_ICONS = {
  npc: `<g transform="translate(0,0) scale(1.5)" fill="none" stroke="#f4e4c1" stroke-width="2"><circle cx="12" cy="8" r="5"/><path d="M4 22c0-6 4-9 8-9s8 3 8 9"/></g>`,
  location: `<g transform="translate(0,0) scale(1.5)" fill="none" stroke="#f4e4c1" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></g>`,
  item: `<g transform="translate(0,0) scale(1.5)" fill="none" stroke="#f4e4c1" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></g>`,
  faction: `<g transform="translate(0,0) scale(1.5)" fill="none" stroke="#f4e4c1" stroke-width="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></g>`,
  quest: `<g transform="translate(0,0) scale(1.5)" fill="none" stroke="#f4e4c1" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></g>`
};

const ICON_SVG = CATEGORY_ICONS.npc; // Default icon

// Test card content for edge cases
const CARD_SAMPLES = {
  default: {
    name: 'Grimble Thornwick',
    desc: 'A tinkering gnome inventor with perpetually soot-stained fingers and an infectious enthusiasm for clockwork contraptions.',
    footer: "Thornwick's Emporium"
  },
  shortText: {
    name: 'Bob',
    desc: 'A friendly innkeeper.',
    footer: 'Inn'
  },
  mediumText: {
    name: 'Lady Seraphina Windwhisper',
    desc: 'An elegant elven diplomat known for her silver tongue and keen political instincts.',
    footer: "Elven Embassy"
  },
  longText: {
    name: 'Bartholomew Coppergear III',
    desc: 'A meticulous dwarven artificer who spent three centuries perfecting the art of clockwork engineering. His workshop is filled with whirring gears, ticking mechanisms, and the occasional explosive prototype. Despite his gruff exterior, he secretly crafts music boxes for orphaned children.',
    footer: "The Grand Clockwork Emporium of Wonders"
  },
  veryLongText: {
    name: 'High Archmagister Valdris Stormweaver the Eternal',
    desc: 'An ancient wizard of immense power who has lived for millennia through forbidden time magic. His tower stands at the crossroads of three ley lines, drawing arcane energy from the very fabric of reality. Those who seek his counsel must first solve three riddles, survive the maze of living shadows, and prove their worth in a battle of wits against his enchanted chess set. Many have tried; few have succeeded.',
    footer: "Tower of Eternal Mysteries, Northwest of the Crystal Lake"
  },
  // Width measurement tests at 52px (find where overlap starts)
  test15: { name: 'WWWWWWWWWWWWWWW', desc: 'Test 15 wide chars', footer: 'Test' }, // 15 chars
  test17: { name: 'WWWWWWWWWWWWWWWWW', desc: 'Test 17 wide chars', footer: 'Test' }, // 17 chars
  test19: { name: 'WWWWWWWWWWWWWWWWWWW', desc: 'Test 19 wide chars', footer: 'Test' }, // 19 chars
  test21: { name: 'WWWWWWWWWWWWWWWWWWWWW', desc: 'Test 21 wide chars', footer: 'Test' }, // 21 chars
  // Category-specific samples
  location: {
    name: 'The Gilded Tankard',
    desc: 'A bustling tavern at the crossroads where travelers share tales and merchants strike deals over foaming ales.',
    footer: 'Market District'
  },
  item: {
    name: 'Blade of the Dawn',
    desc: 'An ancient longsword that glows with warm light. Deals extra radiant damage to undead.',
    footer: 'Legendary Weapon'
  },
  faction: {
    name: 'The Silver Hand',
    desc: 'A secretive order of paladins dedicated to hunting down evil across the realm.',
    footer: 'Lawful Good'
  }
};

const CARD = CARD_SAMPLES.default;

/** Escape special XML characters in text for safe SVG embedding */
const escapeXml = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

// Wrap text to fit within maxWidth pixels at given fontSize
// Uses actual text measurement instead of character count
const wrap = (text, maxWidth, fontSize) => {
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
};

// =============================================================================
// SVG HELPER FUNCTIONS
// These are extracted from textureOverlaySvg() to improve readability
// =============================================================================

// Find best 2-line split for a title (minimizes the wider line's width)
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

/**
 * Calculate optimal title size and line breaks to fit within header
 * @param {string} name - The title text
 * @param {number} defaultSize - Default font size (typically 52)
 * @param {number|null} forceTitleSize - Force specific size (for testing)
 * @returns {{size: number, lines: string[]}} Optimal size and line array
 */
function calculateAutoTitle(name, defaultSize, forceTitleSize = null) {
  const split = findBestTitleSplit(name);

  if (forceTitleSize) {
    return { size: forceTitleSize, lines: [name] };
  }

  // Try single line at each size (largest to smallest)
  for (const size of TITLE_SIZES_SINGLE) {
    if (measureTextWidth(name, size) <= TITLE_MAX_W) {
      return { size, lines: [name] };
    }
  }

  // Try 2 lines (only smaller sizes fit in header height)
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
  while (measureTextWidth(truncated + '…', minSize) > TITLE_MAX_W && truncated.length > 1) {
    truncated = truncated.slice(0, -1);
  }
  return { size: minSize, lines: [truncated + '…'] };
}

// Truncate text to fit within maxWidth at given fontSize
function truncateToFit(text, fontSize, maxWidth) {
  if (measureTextWidth(text, fontSize) <= maxWidth) {
    return text;
  }
  let truncated = text;
  while (measureTextWidth(truncated + '…', fontSize) > maxWidth && truncated.length > 1) {
    truncated = truncated.slice(0, -1);
  }
  return truncated + '…';
}

// Generate header icons SVG
function generateHeaderIcons(iconSvg, showIcons) {
  if (!showIcons) return '';
  const headerIconY = HEADER_TOP + (HEADER_CONTENT_H - ICON_SIZE) / 2;
  return `
    <g transform="translate(${ICON_LEFT_X}, ${headerIconY})">${iconSvg}</g>
    <g transform="translate(${ICON_RIGHT_X}, ${headerIconY})">${iconSvg}</g>
  `;
}

/**
 * Generate footer SVG with location text
 * @param {string} footer - Footer text (location name)
 * @param {string} fontFamily - Font family name
 * @param {string} textColor - Fill color for text
 * @param {string} textStroke - Stroke style for text readability
 * @param {boolean} showFooter - Whether to render footer
 * @returns {string} SVG text element or empty string
 */
function generateFooterSvg(footer, fontFamily, textColor, textStroke, showFooter) {
  if (!showFooter) return '';
  const FOOTER_FONT_SIZE = 24;
  const FOOTER_MAX_W = CONTENT_W - 2 * FOOTER_SIDE_PADDING;
  const displayFooter = truncateToFit(footer, FOOTER_FONT_SIZE, FOOTER_MAX_W);
  const footerCenterY = FOOTER_TOP + FOOTER_H / 2;
  const footerTextY = footerCenterY + FOOTER_BASELINE_OFFSET;
  return `
    <text x="${W/2}" y="${footerTextY}" font-family="${fontFamily}" font-size="${FOOTER_FONT_SIZE}" fill="${textColor}" text-anchor="middle" ${textStroke}>${escapeXml(displayFooter)}</text>
  `;
}

// Generate divider line SVG
function generateDividerSvg(divider, textColor, textBorder) {
  if (!divider) return '';
  const dividerY = TEXT_TOP + (textBorder !== 'none' ? DIVIDER_MARGIN : 10);
  return `
    <line x1="${CONTENT_LEFT + DIVIDER_MARGIN}" y1="${dividerY}" x2="${CONTENT_RIGHT - DIVIDER_MARGIN}" y2="${dividerY}" stroke="${textColor}" stroke-width="3" opacity="0.7"/>
  `;
}

/**
 * Generate text area background SVG with optional tint overlay
 * @param {'dark'|'leather'|'none'} textTint - Tint style for text area
 * @param {boolean} showFooter - Whether footer is visible (affects height)
 * @returns {string} SVG rect element or empty string
 */
function generateTextAreaBg(textTint, showFooter) {
  const textBgH = TEXT_BOTTOM - TEXT_TOP + (showFooter ? FOOTER_H : 0);
  if (textTint === 'dark') {
    return `<rect x="${CONTENT_LEFT}" y="${TEXT_TOP}" width="${CONTENT_W}" height="${textBgH}" fill="${DARK_TINT}"/>`;
  } else if (textTint === 'leather') {
    return `<rect x="${CONTENT_LEFT}" y="${TEXT_TOP}" width="${CONTENT_W}" height="${textBgH}" fill="${LEATHER_TINT}"/>`;
  }
  return '';
}

// Generate text area border SVG
function generateTextAreaBorder(textBorder, textColor, iconSvg, showFooter) {
  const textBgH = TEXT_BOTTOM - TEXT_TOP + (showFooter ? FOOTER_H : 0);

  if (textBorder === 'line') {
    return `<rect x="${CONTENT_LEFT}" y="${TEXT_TOP}" width="${CONTENT_W}" height="${textBgH}" fill="none" stroke="${textColor}" stroke-width="2" opacity="0.5"/>`;
  }

  if (textBorder === 'decorative') {
    const tbX = CONTENT_LEFT, tbY = TEXT_TOP, tbW = CONTENT_W, tbH = textBgH;
    const cs = DECORATIVE_CORNER_SIZE;
    return `
      <path d="M${tbX+cs},${tbY} L${tbX},${tbY} L${tbX},${tbY+cs}" fill="none" stroke="${textColor}" stroke-width="2"/>
      <path d="M${tbX+tbW-cs},${tbY} L${tbX+tbW},${tbY} L${tbX+tbW},${tbY+cs}" fill="none" stroke="${textColor}" stroke-width="2"/>
      <path d="M${tbX},${tbY+tbH-cs} L${tbX},${tbY+tbH} L${tbX+cs},${tbY+tbH}" fill="none" stroke="${textColor}" stroke-width="2"/>
      <path d="M${tbX+tbW},${tbY+tbH-cs} L${tbX+tbW},${tbY+tbH} L${tbX+tbW-cs},${tbY+tbH}" fill="none" stroke="${textColor}" stroke-width="2"/>
    `;
  }

  if (textBorder === 'icons') {
    const footerIconY = FOOTER_TOP + (FOOTER_H - ICON_SIZE) / 2;
    return `
      <g transform="translate(${ICON_LEFT_X}, ${footerIconY})">${iconSvg}</g>
      <g transform="translate(${ICON_RIGHT_X}, ${footerIconY})">${iconSvg}</g>
    `;
  }

  return '';
}

// Generate portrait border SVG
function generatePortraitBorder(portraitBorder, portraitCorners, cornerRadius, textColor) {
  if (portraitBorder !== 'line') return '';

  const offset = PORTRAIT_BORDER_OFFSET;
  if (portraitCorners === 'rounded') {
    return `<rect x="${PORTRAIT_X - offset}" y="${PORTRAIT_TOP - offset}" width="${PORTRAIT_W + offset*2}" height="${PORTRAIT_H + offset*2}" rx="${cornerRadius + offset}" fill="none" stroke="${textColor}" stroke-width="${PORTRAIT_BORDER_WIDTH}"/>`;
  }
  return `<rect x="${PORTRAIT_X - offset}" y="${PORTRAIT_TOP - offset}" width="${PORTRAIT_W + offset*2}" height="${PORTRAIT_H + offset*2}" fill="none" stroke="${textColor}" stroke-width="${PORTRAIT_BORDER_WIDTH}"/>`;
}

// Generate title SVG (1 or 2 lines, vertically centered in header)
function generateTitleSvg(titleLines, titleSize, fontFamily, textColor, textStroke) {
  const titleLineHeight = titleSize * 1.1;
  const titleBlockHeight = titleLines.length * titleLineHeight;
  const headerCenterY = HEADER_TOP + HEADER_CONTENT_H / 2;
  const titleStartY = headerCenterY - titleBlockHeight/2 + titleSize * 0.75;

  return titleLines.map((line, i) =>
    `<text x="${W/2}" y="${titleStartY + i * titleLineHeight}" font-family="${fontFamily}" font-size="${titleSize}" font-weight="bold" fill="${textColor}" text-anchor="middle" ${textStroke}>${escapeXml(line)}</text>`
  ).join('\n    ');
}

// Generate clip path defs for rounded portrait
function generatePortraitClipDefs(portraitCorners, cornerRadius) {
  if (portraitCorners !== 'rounded') return '';
  return `<defs>
    <clipPath id="portraitClip">
      <rect x="${PORTRAIT_X}" y="${PORTRAIT_TOP}" width="${PORTRAIT_W}" height="${PORTRAIT_H}" rx="${cornerRadius}"/>
    </clipPath>
  </defs>`;
}

// =============================================================================
// END SVG HELPER FUNCTIONS
// =============================================================================

// Render card with optional texture background
// Layers (bottom to top): texture/gradient → portrait → SVG overlay
async function render(svg, portraitPath, outputPath, pX, pY, pW, pH, texturePath = null) {
  const portrait = await sharp(portraitPath).resize(pW, pH, { fit: 'cover' }).toBuffer();

  if (texturePath && fs.existsSync(texturePath)) {
    // Use texture as background
    const texture = await sharp(texturePath).resize(W, H, { fit: 'cover' }).toBuffer();
    const overlay = await sharp(Buffer.from(svg)).png().toBuffer();

    await sharp(texture)
      .composite([
        { input: portrait, top: pY, left: pX },
        { input: overlay, top: 0, left: 0 }
      ])
      .png()
      .toFile(outputPath);
  } else {
    // Use SVG gradient as background (current behavior)
    const bg = await sharp(Buffer.from(svg)).png().toBuffer();
    await sharp(bg).composite([{ input: portrait, top: pY, left: pX }]).png().toFile(outputPath);
  }
}

// Generate SVG overlay for texture backgrounds
// Uses layout constants and helper functions defined above
function textureOverlaySvg(opts = {}) {
  // Parse options with defaults
  const textColor = TEXT_COLOR;
  const showFooter = opts.showFooter !== false;
  const showIcons = opts.showIcons !== false;
  const fontFamily = opts.fontFamily || 'serif';
  const bodySize = opts.bodySize || 28;
  const divider = opts.divider !== false;
  const cornerRadius = opts.cornerRadius || 20;
  const cardData = opts.cardData || CARD;
  const iconSvg = opts.iconSvg || ICON_SVG;
  const textTint = opts.textTint || 'dark';
  const textBorder = opts.textBorder || 'none';
  const portraitBorder = opts.portraitBorder || 'none';
  const portraitCorners = opts.portraitCorners || 'square';

  // Calculate title sizing
  const { size: autoTitleSize, lines: titleLines } = calculateAutoTitle(
    cardData.name, opts.titleSize || 52, opts.forceTitleSize
  );

  // Common stroke style for text readability on textures
  const textStroke = 'stroke="rgba(0,0,0,0.5)" stroke-width="2" paint-order="stroke"';

  // Build body text lines
  const textMaxWidth = CONTENT_W - TEXT_AREA_PADDING * 2;
  const bodyLines = wrap(escapeXml(cardData.desc), textMaxWidth, bodySize);
  const textStartY = TEXT_TOP + TEXT_START_OFFSET + (divider ? DIVIDER_OFFSET : 0);

  // Assemble SVG from helper-generated components
  return `<svg width="${W}" height="${H}">
    ${generatePortraitClipDefs(portraitCorners, cornerRadius)}
    ${generateTextAreaBg(textTint, showFooter)}
    ${generateTextAreaBorder(textBorder, textColor, iconSvg, showFooter)}
    ${generatePortraitBorder(portraitBorder, portraitCorners, cornerRadius, textColor)}
    ${generateHeaderIcons(iconSvg, showIcons)}
    ${generateTitleSvg(titleLines, autoTitleSize, fontFamily, textColor, textStroke)}
    ${generateDividerSvg(divider, textColor, textBorder)}
    ${bodyLines.map((l, i) => `<text x="${CONTENT_LEFT + TEXT_AREA_PADDING}" y="${textStartY + i * LINE_HEIGHT}" font-family="${fontFamily}" font-size="${bodySize}" fill="${textColor}" ${textStroke}>${l}</text>`).join('')}
    ${generateFooterSvg(cardData.footer, fontFamily, textColor, textStroke, showFooter)}
  </svg>`;
}

// Render card with texture background and portrait
// Uses layout constants for positioning
async function renderTextureCard(svg, portraitPath, outputPath, texturePath, opts = {}) {
  const cornerRadius = opts.cornerRadius || 20;
  const roundedPortrait = opts.roundedPortrait || false;

  let portrait = await sharp(portraitPath).resize(PORTRAIT_W, PORTRAIT_H, { fit: 'cover' });

  if (roundedPortrait) {
    // Create rounded corners mask
    const mask = Buffer.from(`<svg width="${PORTRAIT_W}" height="${PORTRAIT_H}">
      <rect width="${PORTRAIT_W}" height="${PORTRAIT_H}" rx="${cornerRadius}" fill="white"/>
    </svg>`);
    const maskBuffer = await sharp(mask).png().toBuffer();
    portrait = await portrait
      .composite([{ input: maskBuffer, blend: 'dest-in' }])
      .png()
      .toBuffer();
  } else {
    portrait = await portrait.toBuffer();
  }

  const texture = await sharp(texturePath).resize(W, H, { fit: 'cover' }).toBuffer();
  const overlay = await sharp(Buffer.from(svg)).png().toBuffer();

  await sharp(texture)
    .composite([
      { input: portrait, top: PORTRAIT_TOP, left: PORTRAIT_X },
      { input: overlay, top: 0, left: 0 }
    ])
    .png()
    .toFile(outputPath);
}

// Original overlay function for backwards compatibility
function overlayOnlySvg(opts = {}) {
  return textureOverlaySvg({ ...opts, textTint: 'dark' });
}

// NEW LAYOUT: Header full-width at top, border on sides/bottom only
// HHHH  <- header edge-to-edge
// XPPX  <- portrait with side borders
// XTTX  <- text with side borders
// XXXX  <- bottom border
function baseFullFrame(opts = {}) {
  const headerH = opts.headerH || 90;
  const portraitH = opts.portraitH || 680;
  const solidColor = opts.solidColor !== false;  // Default: solid category color for text area
  const textBg = solidColor ? 'none' : (opts.textBg || '#f4e4c1');
  const textColor = solidColor ? '#f4e4c1' : '#2a2016';
  const textBgOpacity = opts.textBgOpacity || 1;
  const footerH = opts.footerH || 36;
  const showFooter = opts.showFooter !== false;
  const showIcons = opts.showIcons !== false;
  const fontFamily = opts.fontFamily || 'serif';
  const titleSize = opts.titleSize || 52;
  const bodySize = opts.bodySize || 24;
  const bodyStyle = opts.bodyStyle || 'normal';
  const textAlign = opts.textAlign || 'start';
  const textX = textAlign === 'middle' ? W/2 : B + 24;
  const divider = opts.divider || false;

  // Layout: header at y=0, portrait at y=headerH, text below portrait, bottom border
  const portraitTop = headerH;
  const textAreaTop = headerH + portraitH;
  const textAreaH = H - headerH - portraitH - B - (showFooter ? footerH : 0);

  // Icons centered vertically in header
  const iconY = (headerH - ICON_SIZE) / 2;
  const icons = showIcons ? `
    <g transform="translate(${B + 12}, ${iconY})">${ICON_SVG}</g>
    <g transform="translate(${W - B - 48}, ${iconY})">${ICON_SVG}</g>
  ` : '';

  const footerSvg = showFooter ? (solidColor ? `
    <rect x="${B}" y="${H - B - footerH}" width="${W - B*2}" height="${footerH}" fill="rgba(0,0,0,0.2)"/>
    <text x="${W/2}" y="${H - B - 10}" font-family="${fontFamily}" font-size="20" fill="#f4e4c1" text-anchor="middle">${escapeXml(CARD.footer)}</text>
  ` : `
    <rect x="${B}" y="${H - B - footerH}" width="${W - B*2}" height="${footerH}" fill="#e8d4a8"/>
    <text x="${W/2}" y="${H - B - 10}" font-family="${fontFamily}" font-size="20" fill="#5a4a36" text-anchor="middle">${escapeXml(CARD.footer)}</text>
  `) : '';

  const dividerSvg = divider ? `
    <line x1="${B + DIVIDER_MARGIN}" y1="${textAreaTop + 10}" x2="${W - B - DIVIDER_MARGIN}" y2="${textAreaTop + 10}" stroke="#f4e4c1" stroke-width="3" opacity="0.7"/>
  ` : '';

  // Text wrapping with actual measurement
  const textMaxW = CONTENT_W - TEXT_AREA_PADDING * 2;
  const lines = wrap(escapeXml(CARD.desc), textMaxW, bodySize);
  const textStartY = textAreaTop + TEXT_START_OFFSET + (divider ? DIVIDER_OFFSET : 0);

  return `<svg width="${W}" height="${H}">
    <defs>
      <linearGradient id="c" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${NPC_COLORS.accent}"/>
        <stop offset="100%" style="stop-color:${NPC_COLORS.light}"/>
      </linearGradient>
    </defs>
    <!-- Single background for entire card -->
    <rect width="${W}" height="${H}" fill="url(#c)"/>
    ${icons}
    <text x="${W/2}" y="${headerH/2 + titleSize/3}" font-family="${fontFamily}" font-size="${titleSize}" font-weight="bold" fill="#f4e4c1" text-anchor="middle">${escapeXml(CARD.name)}</text>
    <!-- Text area (inset by border on sides and bottom) -->
    ${textBg !== 'none' ? `<rect x="${B}" y="${textAreaTop}" width="${W - B*2}" height="${textAreaH + (showFooter ? footerH : 0)}" fill="${textBg}" opacity="${textBgOpacity}"/>` : ''}
    ${dividerSvg}
    ${lines.map((l, i) => `<text x="${textX}" y="${textStartY + i * LINE_HEIGHT}" font-family="${fontFamily}" font-size="${bodySize}" font-style="${bodyStyle}" fill="${textColor}" text-anchor="${textAlign}">${l}</text>`).join('')}
    ${footerSvg}
  </svg>`;
}

// =============================================================================
// VARIANT FACTORY FUNCTIONS
// These reduce repetition in the variants array by providing common patterns
// for creating variant objects with consistent structure.
// =============================================================================

/**
 * Factory for gradient-based card variants (00-08 series)
 * Uses baseFullFrame() for SVG generation with solid color gradient backgrounds.
 *
 * @param {string} id - Unique variant ID (e.g., '00-default')
 * @param {string} desc - Human-readable description
 * @param {Object} opts - Options passed to baseFullFrame():
 *   - {boolean} divider - Show divider line (default: false)
 *   - {boolean} showIcons - Show category icons (default: true)
 *   - {boolean} solidColor - Use solid color vs parchment (default: true)
 *   - {string} fontFamily - Font name (default: 'serif')
 *   - {string} textAlign - 'start' or 'middle' (default: 'start')
 *   - {string} bodyStyle - 'normal' or 'italic' (default: 'normal')
 * @returns {{id: string, desc: string, gen: Function}} Variant object
 */
function gradientVariant(id, desc, opts = {}) {
  return {
    id,
    desc,
    gen: async (portraitPath, outputPath) => {
      const svg = baseFullFrame(opts);
      await render(svg, portraitPath, outputPath, B, 90, W - B*2, 680);
    }
  };
}

/**
 * Factory for texture-based card variants (09-18 series)
 * Uses textureOverlaySvg() for SVG and renderTextureCard() for compositing.
 *
 * @param {string} id - Unique variant ID (e.g., '09-tex-dark-tint')
 * @param {string} desc - Human-readable description
 * @param {Object} svgOpts - Options for textureOverlaySvg():
 *   - {string} textTint - 'dark', 'leather', or 'none'
 *   - {string} textBorder - 'none', 'line', 'decorative', or 'icons'
 *   - {string} portraitBorder - 'none' or 'line'
 *   - {string} portraitCorners - 'square' or 'rounded'
 * @param {Object} renderOpts - Options for renderTextureCard():
 *   - {boolean} roundedPortrait - Apply rounded corners to portrait
 *   - {number} cornerRadius - Radius for rounded corners (default: 20)
 * @returns {{id: string, desc: string, gen: Function}} Variant object
 */
function textureVariant(id, desc, svgOpts = {}, renderOpts = {}) {
  return {
    id,
    desc,
    gen: async (portraitPath, outputPath, texturePath) => {
      const svg = textureOverlaySvg(svgOpts);
      await renderTextureCard(svg, portraitPath, outputPath, texturePath, renderOpts);
    }
  };
}

// Default options for the "preferred style" (variant 18-tex-corner-icons)
const PREFERRED_RENDER_OPTS = { roundedPortrait: true, cornerRadius: 20 };
const PREFERRED_SVG_BASE = { textTint: 'none', textBorder: 'icons', portraitCorners: 'rounded' };

/**
 * Factory for test variants (20-43 series) using preferred style settings.
 * All test variants use the same visual style (rounded portrait, corner icons)
 * but with different card content or forced settings for edge case testing.
 *
 * @param {string} id - Unique variant ID (e.g., '20-text-short')
 * @param {string} desc - Human-readable description
 * @param {string} sampleKey - Key in CARD_SAMPLES for test content
 * @param {string|null} iconKey - Key in CATEGORY_ICONS, or null for default
 * @param {Object} extraOpts - Additional options (e.g., {forceTitleSize: 52})
 * @returns {{id: string, desc: string, gen: Function}} Variant object
 */
function testVariant(id, desc, sampleKey, iconKey = null, extraOpts = {}) {
  if (!CARD_SAMPLES[sampleKey]) {
    throw new Error(`testVariant: Unknown sample key "${sampleKey}"`);
  }
  return {
    id,
    desc,
    gen: async (portraitPath, outputPath, texturePath) => {
      const svgOpts = {
        ...PREFERRED_SVG_BASE,
        cardData: CARD_SAMPLES[sampleKey],
        ...extraOpts
      };
      if (iconKey) {
        svgOpts.iconSvg = CATEGORY_ICONS[iconKey];
      }
      const svg = textureOverlaySvg(svgOpts);
      await renderTextureCard(svg, portraitPath, outputPath, texturePath, PREFERRED_RENDER_OPTS);
    }
  };
}

// =============================================================================
// END VARIANT FACTORY FUNCTIONS
// =============================================================================

const variants = [
  // =============================================================================
  // LEGACY GRADIENT VARIANTS (00-08)
  // These use gradient backgrounds instead of textures. Kept for comparison.
  // =============================================================================
  gradientVariant('00-default', 'Gradient: full-width header, 40px border, icons, divider', { divider: true }),
  // 01-border-20px: Custom layout with 20px border (not refactorable to factory)
  {
    id: '01-border-20px',
    desc: 'Gradient: thinner 20px border (custom layout)',
    gen: async (p, o) => {
      const b = 20, headerH = 100, portraitH = 700;
      const svg = `<svg width="${W}" height="${H}">
        <defs><linearGradient id="c" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:${NPC_COLORS.accent}"/><stop offset="100%" style="stop-color:${NPC_COLORS.light}"/></linearGradient></defs>
        <rect width="${W}" height="${H}" fill="url(#c)"/>
        <g transform="translate(${b + 12}, ${b + 32})">${ICON_SVG}</g>
        <g transform="translate(${W - b - 48}, ${b + 32})">${ICON_SVG}</g>
        <text x="${W/2}" y="${b + 68}" font-family="serif" font-size="52" font-weight="bold" fill="#f4e4c1" text-anchor="middle">${escapeXml(CARD.name)}</text>
        <rect x="${b}" y="${b + headerH + portraitH}" width="${W-b*2}" height="${H - b*2 - headerH - portraitH - 36}" fill="#f4e4c1"/>
        ${wrap(escapeXml(CARD.desc), W - b*2 - 48, 24).map((l, i) => `<text x="${b + 24}" y="${b + headerH + portraitH + TEXT_START_OFFSET + i * LINE_HEIGHT}" font-family="serif" font-size="24" fill="#2a2016">${l}</text>`).join('')}
        <rect x="${b}" y="${H - b - 36}" width="${W-b*2}" height="36" fill="#e8d4a8"/>
        <text x="${W/2}" y="${H - b - 10}" font-family="serif" font-size="20" fill="#5a4a36" text-anchor="middle">${escapeXml(CARD.footer)}</text>
      </svg>`;
      await render(svg, p, o, b, b + headerH, W - b*2, portraitH);
    }
  },
  gradientVariant('02-parchment-textbox', 'Gradient: parchment text box (old default)', { solidColor: false }),
  gradientVariant('03-no-icons', 'Gradient: no category icons', { showIcons: false }),
  gradientVariant('04-no-divider', 'Gradient: no divider line', { divider: false }),
  gradientVariant('05-sans-serif', 'Gradient: sans-serif font', { fontFamily: 'sans-serif', bodySize: 22 }),
  gradientVariant('06-centered-text', 'Gradient: centered description', { textAlign: 'middle' }),
  gradientVariant('07-italic-desc', 'Gradient: italic description', { bodyStyle: 'italic' }),
  // 08-portrait-frame-only: Old style with portrait-only frame (custom layout)
  {
    id: '08-portrait-frame-only',
    desc: 'Gradient: old style portrait-only frame (custom layout)',
    gen: async (p, o) => {
      const svg = `<svg width="${W}" height="${H}">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#f4e4c1"/><stop offset="100%" style="stop-color:#e8d4a8"/></linearGradient>
          <linearGradient id="c" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:${NPC_COLORS.accent}"/><stop offset="100%" style="stop-color:${NPC_COLORS.light}"/></linearGradient>
        </defs>
        <rect width="${W}" height="${H}" fill="url(#bg)"/>
        <rect height="90" width="${W}" fill="url(#c)"/>
        <rect y="90" height="827" width="${W}" fill="url(#c)"/>
        <g transform="translate(24, 27)">${ICON_SVG}</g>
        <g transform="translate(${W - 60}, 27)">${ICON_SVG}</g>
        <text x="${W/2}" y="62" font-family="serif" font-size="52" font-weight="bold" fill="#f4e4c1" text-anchor="middle">${escapeXml(CARD.name)}</text>
        ${wrap(escapeXml(CARD.desc), W - 80, 28).map((l, i) => `<text x="40" y="${961 + i * LINE_HEIGHT}" font-family="serif" font-size="28" fill="#2a2016">${l}</text>`).join('')}
        <rect y="${H - 40}" height="40" width="${W}" fill="#e8d4a8"/>
        <text x="${W/2}" y="${H - 13}" font-family="serif" font-size="22" fill="#5a4a36" text-anchor="middle">${escapeXml(CARD.footer)}</text>
      </svg>`;
      await render(svg, p, o, 40, 130, W - 80, 747);
    }
  },

  // =============================================================================
  // TEXTURE VARIANTS (09-18)
  // These use texture backgrounds - the preferred style for production cards.
  // =============================================================================

  // Text area tinting options
  textureVariant('09-tex-dark-tint', 'Texture: dark tint on text area', { textTint: 'dark' }),
  textureVariant('10-tex-leather-tint', 'Texture: leather-colored tint', { textTint: 'leather' }),
  textureVariant('11-tex-no-tint', 'Texture: no tint (stroke only)', { textTint: 'none' }),

  // Text area border options
  textureVariant('12-tex-line-border', 'Texture: line border on text area', { textTint: 'none', textBorder: 'line' }),
  textureVariant('13-tex-decorative-border', 'Texture: decorative corners', { textTint: 'none', textBorder: 'decorative' }),

  // Portrait options
  textureVariant('14-tex-rounded-portrait', 'Texture: rounded portrait', { textTint: 'dark' }, PREFERRED_RENDER_OPTS),
  textureVariant('15-tex-portrait-border', 'Texture: portrait border line', { textTint: 'dark', portraitBorder: 'line' }),

  // Combined options (preferred style)
  textureVariant('16-tex-rounded-with-border', 'Texture: rounded + border',
    { textTint: 'dark', portraitBorder: 'line', portraitCorners: 'rounded' }, PREFERRED_RENDER_OPTS),
  textureVariant('17-tex-decorative-corners', 'Texture: rounded + decorative',
    { textTint: 'none', textBorder: 'decorative', portraitCorners: 'rounded' }, PREFERRED_RENDER_OPTS),
  textureVariant('18-tex-corner-icons', 'Texture: rounded + corner icons (CURRENT DEFAULT)',
    { textTint: 'none', textBorder: 'icons', portraitCorners: 'rounded' }, PREFERRED_RENDER_OPTS),

  // =============================================================================
  // TEST VARIANTS (20-43)
  // These test edge cases using the preferred style (18-tex-corner-icons settings).
  // =============================================================================

  // Text length tests
  testVariant('20-text-short', 'Test: short text', 'shortText'),
  testVariant('21-text-medium', 'Test: medium text', 'mediumText'),
  testVariant('22-text-long', 'Test: long text', 'longText'),
  testVariant('23-text-very-long', 'Test: very long text', 'veryLongText'),

  // Category tests (different icons)
  testVariant('30-cat-location', 'Test: location icon', 'location', 'location'),
  testVariant('31-cat-item', 'Test: item icon', 'item', 'item'),
  testVariant('32-cat-faction', 'Test: faction icon', 'faction', 'faction'),

  // Width measurement tests (force 52px title to test overflow)
  testVariant('40-width-15W', 'Test: 15 W chars at 52px', 'test15', null, { forceTitleSize: 52 }),
  testVariant('41-width-17W', 'Test: 17 W chars at 52px', 'test17', null, { forceTitleSize: 52 }),
  testVariant('42-width-19W', 'Test: 19 W chars at 52px', 'test19', null, { forceTitleSize: 52 }),
  testVariant('43-width-21W', 'Test: 21 W chars at 52px', 'test21', null, { forceTitleSize: 52 }),
];

async function main() {
  const outDir = process.argv[2] || 'campaigns/example/cards/exploration';
  const portraitPath = path.join(outDir, 'portrait.png');
  const texturePath = path.join(outDir, 'texture.png');

  // Validate required files exist
  if (!fs.existsSync(portraitPath)) {
    console.error(`Error: Portrait not found: ${portraitPath}`);
    process.exit(1);
  }
  if (!fs.existsSync(texturePath)) {
    console.error(`Error: Texture not found: ${texturePath}`);
    process.exit(1);
  }

  console.log(`Generating ${variants.length} layout variants...\n`);

  let successCount = 0;
  for (const v of variants) {
    const outPath = path.join(outDir, `${v.id}.png`);
    try {
      await v.gen(portraitPath, outPath, texturePath);
      console.log(`  ✓ ${v.id}: ${v.desc}`);
      successCount++;
    } catch (err) {
      console.error(`  ✗ ${v.id}: ${v.desc}`);
      console.error(`    Error: ${err.message}`);
      throw err; // Stop on first error for debugging
    }
  }
  console.log(`\nGenerated ${successCount}/${variants.length} variants successfully.`);

  // Generate markdown
  let md = `# Layout Variant Comparison

## Current Default

**Settings**: Texture background, no tint, rounded portrait, icons in footer corners.

| CURRENT DEFAULT (18-tex-corner-icons) |
|:---:|
| <img src="18-tex-corner-icons.png" width="350"/> |

---

## Alternative Settings

### Text Area Tinting

| No tint (CURRENT) | Dark tint | Leather tint |
|:---:|:---:|:---:|
| <img src="18-tex-corner-icons.png" width="200"/> | <img src="09-tex-dark-tint.png" width="200"/> | <img src="10-tex-leather-tint.png" width="200"/> |

### Footer Decoration

| Icons (CURRENT) | Decorative corners | None |
|:---:|:---:|:---:|
| <img src="18-tex-corner-icons.png" width="200"/> | <img src="17-tex-decorative-corners.png" width="200"/> | <img src="11-tex-no-tint.png" width="200"/> |

### Portrait Styling

| Rounded (CURRENT) | Square | Rounded + border |
|:---:|:---:|:---:|
| <img src="18-tex-corner-icons.png" width="200"/> | <img src="11-tex-no-tint.png" width="200"/> | <img src="16-tex-rounded-with-border.png" width="200"/> |

### Text Area Borders

| None (CURRENT) | Line border | Decorative corners |
|:---:|:---:|:---:|
| <img src="18-tex-corner-icons.png" width="200"/> | <img src="12-tex-line-border.png" width="200"/> | <img src="13-tex-decorative-border.png" width="200"/> |

---

## Legacy Variants (Gradient Background)

These use a solid color gradient instead of texture background.

| Gradient default | Parchment text box | No icons |
|:---:|:---:|:---:|
| <img src="00-default.png" width="200"/> | <img src="02-parchment-textbox.png" width="200"/> | <img src="03-no-icons.png" width="200"/> |

---

## Edge Case Tests

### Text Length Handling

| Short text | Medium text |
|:---:|:---:|
| <img src="20-text-short.png" width="250"/> | <img src="21-text-medium.png" width="250"/> |

| Long text | Very long text |
|:---:|:---:|
| <img src="22-text-long.png" width="250"/> | <img src="23-text-very-long.png" width="250"/> |

### Category Variants (different icons)

| Location | Item | Faction |
|:---:|:---:|:---:|
| <img src="30-cat-location.png" width="200"/> | <img src="31-cat-item.png" width="200"/> | <img src="32-cat-faction.png" width="200"/> |

---
`;

  fs.writeFileSync(path.join(outDir, 'VARIANTS.md'), md);
  console.log(`\nWrote VARIANTS.md`);
}

main().catch(console.error);

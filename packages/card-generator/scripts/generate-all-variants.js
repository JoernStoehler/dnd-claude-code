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

// Title constraints
const TITLE_MAX_W = CONTENT_W - 2 * (ICON_SIZE + ICON_MARGIN + 10);  // ~611px
// Measured character limits (worst-case W chars): 52px≤14, 42px≤17, 34px≤21, 28px≤26

// Portrait positioning (with padding to be narrower than text)
const PORTRAIT_PADDING = 20;
const PORTRAIT_W = CONTENT_W - 2 * PORTRAIT_PADDING;     // 707
const PORTRAIT_X = CONTENT_LEFT + PORTRAIT_PADDING;      // 60

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

const esc = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const wrap = (t,n) => { const w=t.split(' '),l=[]; let c=''; for(const x of w){if((c+' '+x).trim().length<=n)c=(c+' '+x).trim();else{if(c)l.push(c);c=x;}} if(c)l.push(c); return l; };

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
// Uses layout constants defined at top of file
function textureOverlaySvg(opts = {}) {
  const textColor = '#f4e4c1';
  const showFooter = opts.showFooter !== false;
  const showIcons = opts.showIcons !== false;
  const fontFamily = opts.fontFamily || 'serif';
  const titleSize = opts.titleSize || 52;
  const bodySize = opts.bodySize || 28;
  const divider = opts.divider !== false;
  const charsPerLine = opts.charsPerLine || 38;
  const cornerRadius = opts.cornerRadius || 20;

  // Custom card content and icon support
  const cardData = opts.cardData || CARD;
  const iconSvg = opts.iconSvg || ICON_SVG;

  // Find best 2-line split (minimize the longer line's length)
  const bestSplit = (name) => {
    const words = name.split(' ');
    if (words.length < 2) return null;
    let best = null, bestMax = Infinity;
    for (let i = 1; i < words.length; i++) {
      const line1 = words.slice(0, i).join(' ');
      const line2 = words.slice(i).join(' ');
      const maxLen = Math.max(line1.length, line2.length);
      if (maxLen < bestMax) { bestMax = maxLen; best = [line1, line2]; }
    }
    return best;
  };

  const name = cardData.name;
  const split = bestSplit(name);

  let autoTitleSize = titleSize;
  let titleLines = [name];

  // Allow forcing a specific size for measurement tests
  if (opts.forceTitleSize) {
    autoTitleSize = opts.forceTitleSize;
    titleLines = [name];
  } else {
    // Measured limits (worst-case chars like W at 52px fit ~14-15)
    // Single line: 52px ≤14 chars, 42px ≤17 chars, 34px ≤21 chars, 28px ≤26 chars
    // For 2 lines: each line must fit, so use same limits per line
    if (name.length <= 14) {
      autoTitleSize = 52; titleLines = [name];
    } else if (name.length <= 17) {
      autoTitleSize = 42; titleLines = [name];
    } else if (name.length <= 21) {
      autoTitleSize = 34; titleLines = [name];
    } else if (split && Math.max(split[0].length, split[1].length) <= 21) {
      autoTitleSize = 34; titleLines = split;
    } else if (name.length <= 26) {
      autoTitleSize = 28; titleLines = [name];
    } else if (split && Math.max(split[0].length, split[1].length) <= 26) {
      autoTitleSize = 28; titleLines = split;
    } else {
      // Truncate
      autoTitleSize = 28;
      titleLines = [name.slice(0, 25) + '…'];
    }
  }

  // Truncate footer if too long (max ~40 chars for single line)
  const maxFooterLen = 40;
  const displayFooter = cardData.footer.length > maxFooterLen
    ? cardData.footer.slice(0, maxFooterLen - 1) + '…'
    : cardData.footer;

  // Text area styling
  const textTint = opts.textTint || 'dark';  // 'none', 'dark', 'leather'
  const textBorder = opts.textBorder || 'none';  // 'none', 'line', 'decorative'

  // Portrait styling
  const portraitBorder = opts.portraitBorder || 'none';  // 'none', 'line'
  const portraitCorners = opts.portraitCorners || 'square';  // 'square', 'rounded'

  // Use layout constants (defined at top of file)
  const textAreaH = TEXT_BOTTOM - TEXT_TOP - (showFooter ? FOOTER_H : 0);

  // Header icons: vertically centered in header region [HEADER_TOP, HEADER_BOTTOM]
  const headerIconY = HEADER_TOP + (HEADER_CONTENT_H - ICON_SIZE) / 2;
  const icons = showIcons ? `
    <g transform="translate(${ICON_LEFT_X}, ${headerIconY})">${iconSvg}</g>
    <g transform="translate(${ICON_RIGHT_X}, ${headerIconY})">${iconSvg}</g>
  ` : '';

  const textStroke = 'stroke="rgba(0,0,0,0.5)" stroke-width="2" paint-order="stroke"';

  // Footer: vertically centered in footer region [FOOTER_TOP, FOOTER_BOTTOM]
  const footerCenterY = FOOTER_TOP + FOOTER_H / 2;
  const footerTextY = footerCenterY + 8; // baseline offset
  const footerSvg = showFooter ? `
    <text x="${W/2}" y="${footerTextY}" font-family="${fontFamily}" font-size="24" fill="${textColor}" text-anchor="middle" ${textStroke}>${esc(displayFooter)}</text>
  ` : '';

  // Divider line at top of text area
  const dividerY = TEXT_TOP + (textBorder !== 'none' ? 20 : 10);
  const dividerSvg = divider ? `
    <line x1="${CONTENT_LEFT + 20}" y1="${dividerY}" x2="${CONTENT_RIGHT - 20}" y2="${dividerY}" stroke="${textColor}" stroke-width="3" opacity="0.7"/>
  ` : '';

  const lines = wrap(esc(cardData.desc), charsPerLine);
  const lineHeight = 36;
  const textStartY = TEXT_TOP + 44 + (divider ? 16 : 0);

  // Text area background based on tint option
  const textBgH = TEXT_BOTTOM - TEXT_TOP + (showFooter ? FOOTER_H : 0);
  let textBgSvg = '';
  if (textTint === 'dark') {
    textBgSvg = `<rect x="${CONTENT_LEFT}" y="${TEXT_TOP}" width="${CONTENT_W}" height="${textBgH}" fill="rgba(0,0,0,0.35)"/>`;
  } else if (textTint === 'leather') {
    textBgSvg = `<rect x="${CONTENT_LEFT}" y="${TEXT_TOP}" width="${CONTENT_W}" height="${textBgH}" fill="rgba(90,50,20,0.5)"/>`;
  }
  // 'none' = no background

  // Text area border
  let textBorderSvg = '';
  if (textBorder === 'line') {
    textBorderSvg = `<rect x="${CONTENT_LEFT}" y="${TEXT_TOP}" width="${CONTENT_W}" height="${textBgH}" fill="none" stroke="${textColor}" stroke-width="2" opacity="0.5"/>`;
  } else if (textBorder === 'decorative') {
    // Decorative corners
    const tbX = CONTENT_LEFT, tbY = TEXT_TOP, tbW = CONTENT_W, tbH = textBgH;
    const cs = 15; // corner size
    textBorderSvg = `
      <path d="M${tbX+cs},${tbY} L${tbX},${tbY} L${tbX},${tbY+cs}" fill="none" stroke="${textColor}" stroke-width="2"/>
      <path d="M${tbX+tbW-cs},${tbY} L${tbX+tbW},${tbY} L${tbX+tbW},${tbY+cs}" fill="none" stroke="${textColor}" stroke-width="2"/>
      <path d="M${tbX},${tbY+tbH-cs} L${tbX},${tbY+tbH} L${tbX+cs},${tbY+tbH}" fill="none" stroke="${textColor}" stroke-width="2"/>
      <path d="M${tbX+tbW},${tbY+tbH-cs} L${tbX+tbW},${tbY+tbH} L${tbX+tbW-cs},${tbY+tbH}" fill="none" stroke="${textColor}" stroke-width="2"/>
    `;
  } else if (textBorder === 'icons') {
    // Footer icons: centered in footer region [FOOTER_TOP, FOOTER_BOTTOM]
    const footerIconY = FOOTER_TOP + (FOOTER_H - ICON_SIZE) / 2;
    textBorderSvg = `
      <g transform="translate(${ICON_LEFT_X}, ${footerIconY})">${iconSvg}</g>
      <g transform="translate(${ICON_RIGHT_X}, ${footerIconY})">${iconSvg}</g>
    `;
  }

  // Portrait border - draw OUTSIDE the portrait area with clear offset
  let portraitBorderSvg = '';
  if (portraitBorder === 'line') {
    const borderOffset = 4;
    const strokeW = 4;
    if (portraitCorners === 'rounded') {
      portraitBorderSvg = `<rect x="${PORTRAIT_X - borderOffset}" y="${PORTRAIT_TOP - borderOffset}" width="${PORTRAIT_W + borderOffset*2}" height="${PORTRAIT_H + borderOffset*2}" rx="${cornerRadius + borderOffset}" fill="none" stroke="${textColor}" stroke-width="${strokeW}"/>`;
    } else {
      portraitBorderSvg = `<rect x="${PORTRAIT_X - borderOffset}" y="${PORTRAIT_TOP - borderOffset}" width="${PORTRAIT_W + borderOffset*2}" height="${PORTRAIT_H + borderOffset*2}" fill="none" stroke="${textColor}" stroke-width="${strokeW}"/>`;
    }
  }

  // Clip path for rounded portrait
  let defs = '';
  if (portraitCorners === 'rounded') {
    defs = `<defs>
      <clipPath id="portraitClip">
        <rect x="${PORTRAIT_X}" y="${PORTRAIT_TOP}" width="${PORTRAIT_W}" height="${PORTRAIT_H}" rx="${cornerRadius}"/>
      </clipPath>
    </defs>`;
  }

  // Generate title SVG (1 or 2 lines, vertically centered in header region)
  // Header region: y ∈ [HEADER_TOP, HEADER_BOTTOM]
  const titleLineHeight = autoTitleSize * 1.1;
  const titleBlockHeight = titleLines.length * titleLineHeight;
  const headerCenterY = HEADER_TOP + HEADER_CONTENT_H / 2;
  const titleStartY = headerCenterY - titleBlockHeight/2 + autoTitleSize * 0.75;
  const titleSvg = titleLines.map((line, i) =>
    `<text x="${W/2}" y="${titleStartY + i * titleLineHeight}" font-family="${fontFamily}" font-size="${autoTitleSize}" font-weight="bold" fill="${textColor}" text-anchor="middle" ${textStroke}>${esc(line)}</text>`
  ).join('\n    ');

  return `<svg width="${W}" height="${H}">
    ${defs}
    ${textBgSvg}
    ${textBorderSvg}
    ${portraitBorderSvg}
    ${icons}
    ${titleSvg}
    ${dividerSvg}
    ${lines.map((l, i) => `<text x="${CONTENT_LEFT + 24}" y="${textStartY + i * lineHeight}" font-family="${fontFamily}" font-size="${bodySize}" fill="${textColor}" ${textStroke}>${l}</text>`).join('')}
    ${footerSvg}
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
  const charsPerLine = opts.charsPerLine || 42;
  const divider = opts.divider || false;

  // Layout: header at y=0, portrait at y=headerH, text below portrait, bottom border
  const portraitTop = headerH;
  const textAreaTop = headerH + portraitH;
  const textAreaH = H - headerH - portraitH - B - (showFooter ? footerH : 0);

  // Icons centered vertically in header
  const iconY = (headerH - 36) / 2;
  const icons = showIcons ? `
    <g transform="translate(${B + 12}, ${iconY})">${ICON_SVG}</g>
    <g transform="translate(${W - B - 48}, ${iconY})">${ICON_SVG}</g>
  ` : '';

  const footerSvg = showFooter ? (solidColor ? `
    <rect x="${B}" y="${H - B - footerH}" width="${W - B*2}" height="${footerH}" fill="rgba(0,0,0,0.2)"/>
    <text x="${W/2}" y="${H - B - 10}" font-family="${fontFamily}" font-size="20" fill="#f4e4c1" text-anchor="middle">${esc(CARD.footer)}</text>
  ` : `
    <rect x="${B}" y="${H - B - footerH}" width="${W - B*2}" height="${footerH}" fill="#e8d4a8"/>
    <text x="${W/2}" y="${H - B - 10}" font-family="${fontFamily}" font-size="20" fill="#5a4a36" text-anchor="middle">${esc(CARD.footer)}</text>
  `) : '';

  const dividerSvg = divider ? `
    <line x1="${B + 20}" y1="${textAreaTop + 10}" x2="${W - B - 20}" y2="${textAreaTop + 10}" stroke="#f4e4c1" stroke-width="3" opacity="0.7"/>
  ` : '';

  const lines = wrap(esc(CARD.desc), charsPerLine);
  const lineHeight = 32;
  const textStartY = textAreaTop + 40 + (divider ? 16 : 0);

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
    <text x="${W/2}" y="${headerH/2 + titleSize/3}" font-family="${fontFamily}" font-size="${titleSize}" font-weight="bold" fill="#f4e4c1" text-anchor="middle">${esc(CARD.name)}</text>
    <!-- Text area (inset by border on sides and bottom) -->
    ${textBg !== 'none' ? `<rect x="${B}" y="${textAreaTop}" width="${W - B*2}" height="${textAreaH + (showFooter ? footerH : 0)}" fill="${textBg}" opacity="${textBgOpacity}"/>` : ''}
    ${dividerSvg}
    ${lines.map((l, i) => `<text x="${textX}" y="${textStartY + i * lineHeight}" font-family="${fontFamily}" font-size="${bodySize}" font-style="${bodyStyle}" fill="${textColor}" text-anchor="${textAlign}">${l}</text>`).join('')}
    ${footerSvg}
  </svg>`;
}

const variants = [
  // === CURRENT DEFAULT ===
  {
    id: '00-default',
    desc: 'NEW DEFAULT: Header full-width, 40px side border, icons, divider',
    gen: async (p, o) => {
      const svg = baseFullFrame({ divider: true });
      await render(svg, p, o, B, 90, W - B*2, 680);  // portrait at y=headerH
    }
  },

  // === BORDER VARIATIONS ===
  {
    id: '01-border-20px',
    desc: 'Thinner border: 20px',
    gen: async (p, o) => {
      const b = 20;
      const headerH = 100;
      const portraitH = 700; // slightly taller due to thinner border
      const svg = `<svg width="${W}" height="${H}">
        <defs><linearGradient id="c" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:${NPC_COLORS.accent}"/><stop offset="100%" style="stop-color:${NPC_COLORS.light}"/></linearGradient></defs>
        <rect width="${W}" height="${H}" fill="url(#c)"/>
        <rect x="${b}" y="${b}" width="${W-b*2}" height="${headerH}" fill="url(#c)"/>
        <g transform="translate(${b + 12}, ${b + 32})">${ICON_SVG}</g>
        <g transform="translate(${W - b - 48}, ${b + 32})">${ICON_SVG}</g>
        <text x="${W/2}" y="${b + 68}" font-family="serif" font-size="52" font-weight="bold" fill="#f4e4c1" text-anchor="middle">${esc(CARD.name)}</text>
        <rect x="${b}" y="${b + headerH + portraitH}" width="${W-b*2}" height="${H - b*2 - headerH - portraitH - 36}" fill="#f4e4c1"/>
        ${wrap(esc(CARD.desc), 44).map((l, i) => `<text x="${b + 24}" y="${b + headerH + portraitH + 40 + i * 32}" font-family="serif" font-size="24" fill="#2a2016">${l}</text>`).join('')}
        <rect x="${b}" y="${H - b - 36}" width="${W-b*2}" height="36" fill="#e8d4a8"/>
        <text x="${W/2}" y="${H - b - 10}" font-family="serif" font-size="20" fill="#5a4a36" text-anchor="middle">${esc(CARD.footer)}</text>
      </svg>`;
      await render(svg, p, o, b, b + headerH, W - b*2, portraitH);
    }
  },

  // === TEXT BOX STYLING ===
  {
    id: '02-parchment-textbox',
    desc: 'Parchment text box (OLD default)',
    gen: async (p, o) => {
      const svg = baseFullFrame({ solidColor: false });
      await render(svg, p, o, B, 90, W - B*2, 680);
    }
  },

  // === HEADER VARIATIONS ===
  {
    id: '03-no-icons',
    desc: 'No category icons in header',
    gen: async (p, o) => {
      const svg = baseFullFrame({ showIcons: false });
      await render(svg, p, o, B, 90, W - B*2, 680);
    }
  },

  // === DECORATIVE ELEMENTS ===
  {
    id: '04-no-divider',
    desc: 'No divider line between portrait and text',
    gen: async (p, o) => {
      const svg = baseFullFrame({ divider: false });
      await render(svg, p, o, B, 90, W - B*2, 680);
    }
  },

  // === TYPOGRAPHY ===
  {
    id: '05-sans-serif',
    desc: 'Sans-serif font throughout',
    gen: async (p, o) => {
      const svg = baseFullFrame({ fontFamily: 'sans-serif', bodySize: 22, charsPerLine: 46 });
      await render(svg, p, o, B, 90, W - B*2, 680);
    }
  },
  {
    id: '06-centered-text',
    desc: 'Center-aligned description text',
    gen: async (p, o) => {
      const svg = baseFullFrame({ textAlign: 'middle' });
      await render(svg, p, o, B, 90, W - B*2, 680);
    }
  },
  {
    id: '07-italic-desc',
    desc: 'Italic description text',
    gen: async (p, o) => {
      const svg = baseFullFrame({ bodyStyle: 'italic' });
      await render(svg, p, o, B, 90, W - B*2, 680);
    }
  },

  // === PORTRAIT-ONLY FRAME (old style for comparison) ===
  {
    id: '08-portrait-frame-only',
    desc: 'OLD STYLE: Border only around portrait',
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
        <text x="${W/2}" y="62" font-family="serif" font-size="52" font-weight="bold" fill="#f4e4c1" text-anchor="middle">${esc(CARD.name)}</text>
        ${wrap(esc(CARD.desc), 46).map((l, i) => `<text x="40" y="${961 + i * 36}" font-family="serif" font-size="28" fill="#2a2016">${l}</text>`).join('')}
        <rect y="${H - 40}" height="40" width="${W}" fill="#e8d4a8"/>
        <text x="${W/2}" y="${H - 13}" font-family="serif" font-size="22" fill="#5a4a36" text-anchor="middle">${esc(CARD.footer)}</text>
      </svg>`;
      await render(svg, p, o, 40, 130, W - 80, 747);
    }
  },

  // === TEXTURE BACKGROUND VARIANTS ===
  // Text area tinting options
  {
    id: '09-tex-dark-tint',
    desc: 'Texture: dark tint on text area (current)',
    gen: async (p, o, texturePath) => {
      const svg = textureOverlaySvg({ textTint: 'dark' });
      await renderTextureCard(svg, p, o, texturePath, {});
    }
  },
  {
    id: '10-tex-leather-tint',
    desc: 'Texture: leather-colored tint on text area',
    gen: async (p, o, texturePath) => {
      const svg = textureOverlaySvg({ textTint: 'leather' });
      await renderTextureCard(svg, p, o, texturePath, {});
    }
  },
  {
    id: '11-tex-no-tint',
    desc: 'Texture: no tint (text stroke only)',
    gen: async (p, o, texturePath) => {
      const svg = textureOverlaySvg({ textTint: 'none' });
      await renderTextureCard(svg, p, o, texturePath, {});
    }
  },

  // Text area border options
  {
    id: '12-tex-line-border',
    desc: 'Texture: line border around text area',
    gen: async (p, o, texturePath) => {
      const svg = textureOverlaySvg({ textTint: 'none', textBorder: 'line' });
      await renderTextureCard(svg, p, o, texturePath, {});
    }
  },
  {
    id: '13-tex-decorative-border',
    desc: 'Texture: decorative corner border on text area',
    gen: async (p, o, texturePath) => {
      const svg = textureOverlaySvg({ textTint: 'none', textBorder: 'decorative' });
      await renderTextureCard(svg, p, o, texturePath, {});
    }
  },

  // Portrait options
  {
    id: '14-tex-rounded-portrait',
    desc: 'Texture: rounded portrait corners',
    gen: async (p, o, texturePath) => {
      const svg = textureOverlaySvg({ textTint: 'dark' });
      await renderTextureCard(svg, p, o, texturePath, { roundedPortrait: true, cornerRadius: 20 });
    }
  },
  {
    id: '15-tex-portrait-border',
    desc: 'Texture: border line around portrait',
    gen: async (p, o, texturePath) => {
      const svg = textureOverlaySvg({ textTint: 'dark', portraitBorder: 'line' });
      await renderTextureCard(svg, p, o, texturePath, {});
    }
  },

  // Combined options
  {
    id: '16-tex-rounded-with-border',
    desc: 'Texture: rounded portrait + border',
    gen: async (p, o, texturePath) => {
      const svg = textureOverlaySvg({ textTint: 'dark', portraitBorder: 'line', portraitCorners: 'rounded' });
      await renderTextureCard(svg, p, o, texturePath, { roundedPortrait: true, cornerRadius: 20 });
    }
  },
  {
    id: '17-tex-decorative-corners',
    desc: 'Texture: rounded portrait + decorative corner brackets',
    gen: async (p, o, texturePath) => {
      const svg = textureOverlaySvg({ textTint: 'none', textBorder: 'decorative', portraitCorners: 'rounded' });
      await renderTextureCard(svg, p, o, texturePath, { roundedPortrait: true, cornerRadius: 20 });
    }
  },
  {
    id: '18-tex-corner-icons',
    desc: 'Texture: rounded portrait + icons in lower corners',
    gen: async (p, o, texturePath) => {
      const svg = textureOverlaySvg({ textTint: 'none', textBorder: 'icons', portraitCorners: 'rounded' });
      await renderTextureCard(svg, p, o, texturePath, { roundedPortrait: true, cornerRadius: 20 });
    }
  },

  // === TEXT LENGTH TESTS ===
  {
    id: '20-text-short',
    desc: 'Test: short text (minimal content)',
    gen: async (p, o, texturePath) => {
      const svg = textureOverlaySvg({
        textTint: 'none', textBorder: 'icons', portraitCorners: 'rounded',
        cardData: CARD_SAMPLES.shortText
      });
      await renderTextureCard(svg, p, o, texturePath, { roundedPortrait: true, cornerRadius: 20 });
    }
  },
  {
    id: '21-text-medium',
    desc: 'Test: medium text (typical NPC)',
    gen: async (p, o, texturePath) => {
      const svg = textureOverlaySvg({
        textTint: 'none', textBorder: 'icons', portraitCorners: 'rounded',
        cardData: CARD_SAMPLES.mediumText
      });
      await renderTextureCard(svg, p, o, texturePath, { roundedPortrait: true, cornerRadius: 20 });
    }
  },
  {
    id: '22-text-long',
    desc: 'Test: long text (detailed description)',
    gen: async (p, o, texturePath) => {
      const svg = textureOverlaySvg({
        textTint: 'none', textBorder: 'icons', portraitCorners: 'rounded',
        cardData: CARD_SAMPLES.longText
      });
      await renderTextureCard(svg, p, o, texturePath, { roundedPortrait: true, cornerRadius: 20 });
    }
  },
  {
    id: '23-text-very-long',
    desc: 'Test: very long text (potential overflow)',
    gen: async (p, o, texturePath) => {
      const svg = textureOverlaySvg({
        textTint: 'none', textBorder: 'icons', portraitCorners: 'rounded',
        cardData: CARD_SAMPLES.veryLongText
      });
      await renderTextureCard(svg, p, o, texturePath, { roundedPortrait: true, cornerRadius: 20 });
    }
  },

  // === CATEGORY TESTS ===
  {
    id: '30-cat-location',
    desc: 'Test: location category (different icon)',
    gen: async (p, o, texturePath) => {
      const svg = textureOverlaySvg({
        textTint: 'none', textBorder: 'icons', portraitCorners: 'rounded',
        cardData: CARD_SAMPLES.location,
        iconSvg: CATEGORY_ICONS.location
      });
      await renderTextureCard(svg, p, o, texturePath, { roundedPortrait: true, cornerRadius: 20 });
    }
  },
  {
    id: '31-cat-item',
    desc: 'Test: item category (different icon)',
    gen: async (p, o, texturePath) => {
      const svg = textureOverlaySvg({
        textTint: 'none', textBorder: 'icons', portraitCorners: 'rounded',
        cardData: CARD_SAMPLES.item,
        iconSvg: CATEGORY_ICONS.item
      });
      await renderTextureCard(svg, p, o, texturePath, { roundedPortrait: true, cornerRadius: 20 });
    }
  },
  {
    id: '32-cat-faction',
    desc: 'Test: faction category (different icon)',
    gen: async (p, o, texturePath) => {
      const svg = textureOverlaySvg({
        textTint: 'none', textBorder: 'icons', portraitCorners: 'rounded',
        cardData: CARD_SAMPLES.faction,
        iconSvg: CATEGORY_ICONS.faction
      });
      await renderTextureCard(svg, p, o, texturePath, { roundedPortrait: true, cornerRadius: 20 });
    }
  },

  // === WIDTH MEASUREMENT TESTS (all at 52px to find limit) ===
  {
    id: '40-width-15W',
    desc: 'Width test: 15 W chars at 52px',
    gen: async (p, o, texturePath) => {
      const svg = textureOverlaySvg({
        textTint: 'none', textBorder: 'icons', portraitCorners: 'rounded',
        cardData: CARD_SAMPLES.test15,
        forceTitleSize: 52
      });
      await renderTextureCard(svg, p, o, texturePath, { roundedPortrait: true, cornerRadius: 20 });
    }
  },
  {
    id: '41-width-17W',
    desc: 'Width test: 17 W chars at 52px',
    gen: async (p, o, texturePath) => {
      const svg = textureOverlaySvg({
        textTint: 'none', textBorder: 'icons', portraitCorners: 'rounded',
        cardData: CARD_SAMPLES.test17,
        forceTitleSize: 52
      });
      await renderTextureCard(svg, p, o, texturePath, { roundedPortrait: true, cornerRadius: 20 });
    }
  },
  {
    id: '42-width-19W',
    desc: 'Width test: 19 W chars at 52px',
    gen: async (p, o, texturePath) => {
      const svg = textureOverlaySvg({
        textTint: 'none', textBorder: 'icons', portraitCorners: 'rounded',
        cardData: CARD_SAMPLES.test19,
        forceTitleSize: 52
      });
      await renderTextureCard(svg, p, o, texturePath, { roundedPortrait: true, cornerRadius: 20 });
    }
  },
  {
    id: '43-width-21W',
    desc: 'Width test: 21 W chars at 52px',
    gen: async (p, o, texturePath) => {
      const svg = textureOverlaySvg({
        textTint: 'none', textBorder: 'icons', portraitCorners: 'rounded',
        cardData: CARD_SAMPLES.test21,
        forceTitleSize: 52
      });
      await renderTextureCard(svg, p, o, texturePath, { roundedPortrait: true, cornerRadius: 20 });
    }
  },
];

async function main() {
  const outDir = process.argv[2] || 'campaigns/example/cards/exploration';
  const portraitPath = path.join(outDir, 'portrait.png');
  const texturePath = path.join(outDir, 'texture.png');

  console.log(`Generating ${variants.length} layout variants...\n`);

  for (const v of variants) {
    const outPath = path.join(outDir, `${v.id}.png`);
    await v.gen(portraitPath, outPath, texturePath);
    console.log(`  ${v.id}: ${v.desc}`);
  }

  // Generate markdown
  let md = `# Layout Variant Comparison

**Texture cards**: AI-generated leather background, no tint, rounded portrait, icons in corners.

Legacy: Gradient background with solid color text area.

---

## New Default

| Solid color (NEW DEFAULT) |
|:---:|
| <img src="00-default.png" width="300"/> |

---

## Text Box Background

| Solid (default) | Parchment (old) |
|:---:|:---:|
| <img src="00-default.png" width="250"/> | <img src="02-parchment-textbox.png" width="250"/> |

---

## Header Icons

| With icons (default) | No icons |
|:---:|:---:|
| <img src="00-default.png" width="250"/> | <img src="03-no-icons.png" width="250"/> |

---

## Decorative Elements

| With divider (default) | Without divider |
|:---:|:---:|
| <img src="00-default.png" width="250"/> | <img src="04-no-divider.png" width="250"/> |

---

## Typography

**Serif (default)**
<img src="00-default.png" width="300"/>

**Sans-serif**
<img src="05-sans-serif.png" width="300"/>

**Centered**
<img src="06-centered-text.png" width="300"/>

**Italic**
<img src="07-italic-desc.png" width="300"/>

---

## Texture Background Variants

Generate texture: \`node scripts/generate-texture.js texture.png --category=npc --api\`

### Text Area Tinting

| Dark tint | Leather tint | No tint (preferred) |
|:---:|:---:|:---:|
| <img src="09-tex-dark-tint.png" width="200"/> | <img src="10-tex-leather-tint.png" width="200"/> | <img src="11-tex-no-tint.png" width="200"/> |

### Text Area Borders

| Line border | Decorative corners |
|:---:|:---:|
| <img src="12-tex-line-border.png" width="250"/> | <img src="13-tex-decorative-border.png" width="250"/> |

### Portrait Styling

| Rounded corners | Border line | Rounded + border |
|:---:|:---:|:---:|
| <img src="14-tex-rounded-portrait.png" width="200"/> | <img src="15-tex-portrait-border.png" width="200"/> | <img src="16-tex-rounded-with-border.png" width="200"/> |

### Text Area Decoration

| Decorative corners | Icons in corners |
|:---:|:---:|
| <img src="17-tex-decorative-corners.png" width="250"/> | <img src="18-tex-corner-icons.png" width="250"/> |

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

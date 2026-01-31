#!/usr/bin/env node
/**
 * Generate layout variants for comparison
 * NEW DEFAULTS: Full frame, 40px border, icons in header
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const W = 827, H = 1417;
const B = 40; // Border width
const NPC_COLORS = { accent: '#8B4513', light: '#D2691E' };
const ICON_SVG = `<g transform="translate(0,0) scale(1.5)" fill="none" stroke="#f4e4c1" stroke-width="2"><circle cx="12" cy="8" r="5"/><path d="M4 22c0-6 4-9 8-9s8 3 8 9"/></g>`;
const CARD = { name: 'Grimble Thornwick', desc: 'A tinkering gnome inventor with perpetually soot-stained fingers and an infectious enthusiasm for clockwork contraptions.', footer: "Thornwick's Emporium" };

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
// Options for text area: tint (none, dark, leather), border (none, line, decorative)
// Options for portrait: border (none, line), corners (square, rounded)
function textureOverlaySvg(opts = {}) {
  const headerH = opts.headerH || 90;
  const portraitH = opts.portraitH || 680;
  const textColor = '#f4e4c1';
  const footerH = opts.footerH || 36;
  const showFooter = opts.showFooter !== false;
  const showIcons = opts.showIcons !== false;
  const fontFamily = opts.fontFamily || 'serif';
  const titleSize = opts.titleSize || 52;
  const bodySize = opts.bodySize || 24;
  const divider = opts.divider !== false;
  const charsPerLine = opts.charsPerLine || 42;

  // Text area styling
  const textTint = opts.textTint || 'dark';  // 'none', 'dark', 'leather'
  const textBorder = opts.textBorder || 'none';  // 'none', 'line', 'decorative'

  // Portrait styling
  const portraitBorder = opts.portraitBorder || 'none';  // 'none', 'line'
  const portraitCorners = opts.portraitCorners || 'square';  // 'square', 'rounded'
  const cornerRadius = opts.cornerRadius || 20;

  const textAreaTop = headerH + portraitH;
  const textAreaH = H - headerH - portraitH - B - (showFooter ? footerH : 0);
  const portraitW = W - B * 2;

  const iconY = (headerH - 36) / 2;
  const icons = showIcons ? `
    <g transform="translate(${B + 12}, ${iconY})">${ICON_SVG}</g>
    <g transform="translate(${W - B - 48}, ${iconY})">${ICON_SVG}</g>
  ` : '';

  const textStroke = 'stroke="rgba(0,0,0,0.5)" stroke-width="2" paint-order="stroke"';

  const footerSvg = showFooter ? `
    <text x="${W/2}" y="${H - B - 10}" font-family="${fontFamily}" font-size="20" fill="${textColor}" text-anchor="middle" ${textStroke}>${esc(CARD.footer)}</text>
  ` : '';

  const dividerSvg = divider ? `
    <line x1="${B + 20}" y1="${textAreaTop + 10}" x2="${W - B - 20}" y2="${textAreaTop + 10}" stroke="${textColor}" stroke-width="3" opacity="0.7"/>
  ` : '';

  const lines = wrap(esc(CARD.desc), charsPerLine);
  const lineHeight = 32;
  const textStartY = textAreaTop + 40 + (divider ? 16 : 0);

  // Text area background based on tint option
  let textBgSvg = '';
  if (textTint === 'dark') {
    textBgSvg = `<rect x="${B}" y="${textAreaTop}" width="${W - B*2}" height="${textAreaH + (showFooter ? footerH : 0)}" fill="rgba(0,0,0,0.35)"/>`;
  } else if (textTint === 'leather') {
    textBgSvg = `<rect x="${B}" y="${textAreaTop}" width="${W - B*2}" height="${textAreaH + (showFooter ? footerH : 0)}" fill="rgba(90,50,20,0.5)"/>`;
  }
  // 'none' = no background

  // Text area border
  let textBorderSvg = '';
  if (textBorder === 'line') {
    textBorderSvg = `<rect x="${B}" y="${textAreaTop}" width="${W - B*2}" height="${textAreaH + (showFooter ? footerH : 0)}" fill="none" stroke="${textColor}" stroke-width="2" opacity="0.5"/>`;
  } else if (textBorder === 'decorative') {
    // Decorative corners
    const tbX = B, tbY = textAreaTop, tbW = W - B*2, tbH = textAreaH + (showFooter ? footerH : 0);
    const cs = 15; // corner size
    textBorderSvg = `
      <path d="M${tbX+cs},${tbY} L${tbX},${tbY} L${tbX},${tbY+cs}" fill="none" stroke="${textColor}" stroke-width="2"/>
      <path d="M${tbX+tbW-cs},${tbY} L${tbX+tbW},${tbY} L${tbX+tbW},${tbY+cs}" fill="none" stroke="${textColor}" stroke-width="2"/>
      <path d="M${tbX},${tbY+tbH-cs} L${tbX},${tbY+tbH} L${tbX+cs},${tbY+tbH}" fill="none" stroke="${textColor}" stroke-width="2"/>
      <path d="M${tbX+tbW},${tbY+tbH-cs} L${tbX+tbW},${tbY+tbH} L${tbX+tbW-cs},${tbY+tbH}" fill="none" stroke="${textColor}" stroke-width="2"/>
    `;
  }

  // Portrait border
  let portraitBorderSvg = '';
  if (portraitBorder === 'line') {
    if (portraitCorners === 'rounded') {
      portraitBorderSvg = `<rect x="${B}" y="${headerH}" width="${portraitW}" height="${portraitH}" rx="${cornerRadius}" fill="none" stroke="${textColor}" stroke-width="3"/>`;
    } else {
      portraitBorderSvg = `<rect x="${B}" y="${headerH}" width="${portraitW}" height="${portraitH}" fill="none" stroke="${textColor}" stroke-width="3"/>`;
    }
  }

  // Clip path for rounded portrait (will be used by render function)
  let defs = '';
  if (portraitCorners === 'rounded') {
    defs = `<defs>
      <clipPath id="portraitClip">
        <rect x="${B}" y="${headerH}" width="${portraitW}" height="${portraitH}" rx="${cornerRadius}"/>
      </clipPath>
    </defs>`;
  }

  return `<svg width="${W}" height="${H}">
    ${defs}
    ${textBgSvg}
    ${textBorderSvg}
    ${portraitBorderSvg}
    ${icons}
    <text x="${W/2}" y="${headerH/2 + titleSize/3}" font-family="${fontFamily}" font-size="${titleSize}" font-weight="bold" fill="${textColor}" text-anchor="middle" ${textStroke}>${esc(CARD.name)}</text>
    ${dividerSvg}
    ${lines.map((l, i) => `<text x="${B + 24}" y="${textStartY + i * lineHeight}" font-family="${fontFamily}" font-size="${bodySize}" fill="${textColor}" ${textStroke}>${l}</text>`).join('')}
    ${footerSvg}
  </svg>`;
}

// Render with rounded portrait corners
async function renderTextureCard(svg, portraitPath, outputPath, texturePath, opts = {}) {
  const headerH = opts.headerH || 90;
  const portraitH = opts.portraitH || 680;
  const portraitW = W - B * 2;
  const cornerRadius = opts.cornerRadius || 20;
  const roundedPortrait = opts.roundedPortrait || false;

  let portrait = await sharp(portraitPath).resize(portraitW, portraitH, { fit: 'cover' });

  if (roundedPortrait) {
    // Create rounded corners mask
    const mask = Buffer.from(`<svg width="${portraitW}" height="${portraitH}">
      <rect width="${portraitW}" height="${portraitH}" rx="${cornerRadius}" fill="white"/>
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
      { input: portrait, top: headerH, left: B },
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
    id: '17-tex-full-polish',
    desc: 'Texture: rounded portrait + decorative text border',
    gen: async (p, o, texturePath) => {
      const svg = textureOverlaySvg({ textTint: 'none', textBorder: 'decorative', portraitBorder: 'line', portraitCorners: 'rounded' });
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

New default: **Full frame**, 40px border, 90px header, solid color, icons, **divider line**.

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

| Dark tint (current) | Leather tint | No tint |
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

### Full Polish

<img src="17-tex-full-polish.png" width="300"/>

Rounded portrait + decorative text border corners

---
`;

  fs.writeFileSync(path.join(outDir, 'VARIANTS.md'), md);
  console.log(`\nWrote VARIANTS.md`);
}

main().catch(console.error);

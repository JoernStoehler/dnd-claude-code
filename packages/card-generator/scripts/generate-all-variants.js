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

async function render(svg, portraitPath, outputPath, pX, pY, pW, pH) {
  const bg = await sharp(Buffer.from(svg)).png().toBuffer();
  const portrait = await sharp(portraitPath).resize(pW, pH, { fit: 'cover' }).toBuffer();
  await sharp(bg).composite([{ input: portrait, top: pY, left: pX }]).png().toFile(outputPath);
}

// NEW DEFAULT: Full frame with icons
function baseFullFrame(opts = {}) {
  const headerH = opts.headerH || 80;
  const portraitH = opts.portraitH || 700;
  const textBg = opts.textBg || '#f4e4c1';
  const textBgOpacity = opts.textBgOpacity || 1;
  const footerH = opts.footerH || 36;
  const showFooter = opts.showFooter !== false;
  const showIcons = opts.showIcons !== false;
  const fontFamily = opts.fontFamily || 'serif';
  const titleSize = opts.titleSize || 44;
  const bodySize = opts.bodySize || 24;
  const bodyStyle = opts.bodyStyle || 'normal';
  const textAlign = opts.textAlign || 'start';
  const textX = textAlign === 'middle' ? W/2 : B + 24;
  const charsPerLine = opts.charsPerLine || 42;
  const divider = opts.divider || false;
  const rounded = opts.rounded || false;

  const textAreaTop = B + headerH + portraitH;
  const textAreaH = H - B*2 - headerH - portraitH - (showFooter ? footerH : 0);

  const icons = showIcons ? `
    <g transform="translate(${B + 12}, ${B + 22})">${ICON_SVG}</g>
    <g transform="translate(${W - B - 48}, ${B + 22})">${ICON_SVG}</g>
  ` : '';

  const footerSvg = showFooter ? `
    <rect x="${B}" y="${H - B - footerH}" width="${W - B*2}" height="${footerH}" fill="#e8d4a8"/>
    <text x="${W/2}" y="${H - B - 10}" font-family="${fontFamily}" font-size="20" fill="#5a4a36" text-anchor="middle">${esc(CARD.footer)}</text>
  ` : '';

  const dividerSvg = divider ? `
    <line x1="${B + 20}" y1="${textAreaTop + 10}" x2="${W - B - 20}" y2="${textAreaTop + 10}" stroke="${NPC_COLORS.accent}" stroke-width="2"/>
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
    <rect width="${W}" height="${H}" fill="url(#c)"/>
    <rect x="${B}" y="${B}" width="${W - B*2}" height="${headerH}" fill="url(#c)"/>
    ${icons}
    <text x="${W/2}" y="${B + 54}" font-family="${fontFamily}" font-size="${titleSize}" font-weight="bold" fill="#f4e4c1" text-anchor="middle">${esc(CARD.name)}</text>
    <rect x="${B}" y="${textAreaTop}" width="${W - B*2}" height="${textAreaH + (showFooter ? footerH : 0)}" fill="${textBg}" opacity="${textBgOpacity}"/>
    ${dividerSvg}
    ${lines.map((l, i) => `<text x="${textX}" y="${textStartY + i * lineHeight}" font-family="${fontFamily}" font-size="${bodySize}" font-style="${bodyStyle}" fill="#2a2016" text-anchor="${textAlign}">${l}</text>`).join('')}
    ${footerSvg}
  </svg>`;
}

const variants = [
  // === CURRENT DEFAULT ===
  {
    id: '00-default',
    desc: 'NEW DEFAULT: Full frame, 40px border, icons',
    gen: async (p, o) => {
      const svg = baseFullFrame();
      await render(svg, p, o, B, B + 80, W - B*2, 700);
    }
  },

  // === BORDER VARIATIONS ===
  {
    id: '01-border-20px',
    desc: 'Thinner border: 20px',
    gen: async (p, o) => {
      const b = 20;
      const svg = `<svg width="${W}" height="${H}">
        <defs><linearGradient id="c" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:${NPC_COLORS.accent}"/><stop offset="100%" style="stop-color:${NPC_COLORS.light}"/></linearGradient></defs>
        <rect width="${W}" height="${H}" fill="url(#c)"/>
        <rect x="${b}" y="${b}" width="${W-b*2}" height="80" fill="url(#c)"/>
        <g transform="translate(${b + 12}, ${b + 22})">${ICON_SVG}</g>
        <g transform="translate(${W - b - 48}, ${b + 22})">${ICON_SVG}</g>
        <text x="${W/2}" y="${b + 54}" font-family="serif" font-size="44" font-weight="bold" fill="#f4e4c1" text-anchor="middle">${esc(CARD.name)}</text>
        <rect x="${b}" y="${b + 80 + 740}" width="${W-b*2}" height="${H - b*2 - 80 - 740}" fill="#f4e4c1"/>
        ${wrap(esc(CARD.desc), 44).map((l, i) => `<text x="${b + 24}" y="${b + 80 + 740 + 40 + i * 32}" font-family="serif" font-size="24" fill="#2a2016">${l}</text>`).join('')}
        <rect x="${b}" y="${H - b - 36}" width="${W-b*2}" height="36" fill="#e8d4a8"/>
        <text x="${W/2}" y="${H - b - 10}" font-family="serif" font-size="20" fill="#5a4a36" text-anchor="middle">${esc(CARD.footer)}</text>
      </svg>`;
      await render(svg, p, o, b, b + 80, W - b*2, 740);
    }
  },

  // === TEXT BOX STYLING ===
  {
    id: '02-tinted-textbox',
    desc: 'Tinted text box: light category color',
    gen: async (p, o) => {
      const svg = baseFullFrame({ textBg: NPC_COLORS.light, textBgOpacity: 0.2 });
      await render(svg, p, o, B, B + 80, W - B*2, 700);
    }
  },
  {
    id: '03-solid-textbox',
    desc: 'Solid text box: category color background',
    gen: async (p, o) => {
      const svg = `<svg width="${W}" height="${H}">
        <defs><linearGradient id="c" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:${NPC_COLORS.accent}"/><stop offset="100%" style="stop-color:${NPC_COLORS.light}"/></linearGradient></defs>
        <rect width="${W}" height="${H}" fill="url(#c)"/>
        <g transform="translate(${B + 12}, ${B + 22})">${ICON_SVG}</g>
        <g transform="translate(${W - B - 48}, ${B + 22})">${ICON_SVG}</g>
        <text x="${W/2}" y="${B + 54}" font-family="serif" font-size="44" font-weight="bold" fill="#f4e4c1" text-anchor="middle">${esc(CARD.name)}</text>
        ${wrap(esc(CARD.desc), 42).map((l, i) => `<text x="${B + 24}" y="${B + 80 + 700 + 40 + i * 32}" font-family="serif" font-size="24" fill="#f4e4c1">${l}</text>`).join('')}
        <rect x="${B}" y="${H - B - 36}" width="${W - B*2}" height="36" fill="rgba(0,0,0,0.2)"/>
        <text x="${W/2}" y="${H - B - 10}" font-family="serif" font-size="20" fill="#f4e4c1" text-anchor="middle">${esc(CARD.footer)}</text>
      </svg>`;
      await render(svg, p, o, B, B + 80, W - B*2, 700);
    }
  },

  // === PORTRAIT SIZE ===
  {
    id: '04-larger-portrait',
    desc: 'Larger portrait (800px): less text space',
    gen: async (p, o) => {
      const pH = 800;
      const svg = baseFullFrame({ portraitH: pH });
      await render(svg, p, o, B, B + 80, W - B*2, pH);
    }
  },

  // === HEADER VARIATIONS ===
  {
    id: '05-no-icons',
    desc: 'No category icons in header',
    gen: async (p, o) => {
      const svg = baseFullFrame({ showIcons: false });
      await render(svg, p, o, B, B + 80, W - B*2, 700);
    }
  },
  {
    id: '06-larger-header',
    desc: 'Larger header (100px) with bigger title',
    gen: async (p, o) => {
      const svg = baseFullFrame({ headerH: 100, titleSize: 52, portraitH: 680 });
      await render(svg, p, o, B, B + 100, W - B*2, 680);
    }
  },

  // === DECORATIVE ELEMENTS ===
  {
    id: '07-divider-line',
    desc: 'Divider line between portrait and text',
    gen: async (p, o) => {
      const svg = baseFullFrame({ divider: true });
      await render(svg, p, o, B, B + 80, W - B*2, 700);
    }
  },

  // === THEME ===
  {
    id: '08-dark-theme',
    desc: 'Dark theme: dark background, light text',
    gen: async (p, o) => {
      const svg = `<svg width="${W}" height="${H}">
        <defs><linearGradient id="c" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:${NPC_COLORS.accent}"/><stop offset="100%" style="stop-color:${NPC_COLORS.light}"/></linearGradient></defs>
        <rect width="${W}" height="${H}" fill="#1a1a1a"/>
        <rect x="${B}" y="${B}" width="${W-B*2}" height="80" fill="url(#c)"/>
        <rect x="${B}" y="${B + 80}" width="${W-B*2}" height="700" fill="url(#c)"/>
        <g transform="translate(${B + 12}, ${B + 22})">${ICON_SVG}</g>
        <g transform="translate(${W - B - 48}, ${B + 22})">${ICON_SVG}</g>
        <text x="${W/2}" y="${B + 54}" font-family="serif" font-size="44" font-weight="bold" fill="#f4e4c1" text-anchor="middle">${esc(CARD.name)}</text>
        <rect x="${B}" y="${B + 80 + 700}" width="${W-B*2}" height="${H - B*2 - 80 - 700 - 36}" fill="#2a2a2a"/>
        ${wrap(esc(CARD.desc), 42).map((l, i) => `<text x="${B + 24}" y="${B + 80 + 700 + 40 + i * 32}" font-family="serif" font-size="24" fill="#e0e0e0">${l}</text>`).join('')}
        <rect x="${B}" y="${H - B - 36}" width="${W - B*2}" height="36" fill="#222"/>
        <text x="${W/2}" y="${H - B - 10}" font-family="serif" font-size="20" fill="#888" text-anchor="middle">${esc(CARD.footer)}</text>
      </svg>`;
      await render(svg, p, o, B, B + 80, W - B*2, 700);
    }
  },

  // === FOOTER VARIATIONS ===
  {
    id: '09-no-footer',
    desc: 'No footer: more text space',
    gen: async (p, o) => {
      const svg = baseFullFrame({ showFooter: false });
      await render(svg, p, o, B, B + 80, W - B*2, 700);
    }
  },
  {
    id: '10-footer-in-portrait',
    desc: 'Footer overlaid on portrait bottom',
    gen: async (p, o) => {
      const svg = `<svg width="${W}" height="${H}">
        <defs><linearGradient id="c" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:${NPC_COLORS.accent}"/><stop offset="100%" style="stop-color:${NPC_COLORS.light}"/></linearGradient></defs>
        <rect width="${W}" height="${H}" fill="url(#c)"/>
        <rect x="${B}" y="${B}" width="${W-B*2}" height="80" fill="url(#c)"/>
        <g transform="translate(${B + 12}, ${B + 22})">${ICON_SVG}</g>
        <g transform="translate(${W - B - 48}, ${B + 22})">${ICON_SVG}</g>
        <text x="${W/2}" y="${B + 54}" font-family="serif" font-size="44" font-weight="bold" fill="#f4e4c1" text-anchor="middle">${esc(CARD.name)}</text>
        <rect x="${B}" y="${B + 80 + 660}" width="${W-B*2}" height="40" fill="rgba(0,0,0,0.6)"/>
        <text x="${W/2}" y="${B + 80 + 688}" font-family="serif" font-size="20" fill="white" text-anchor="middle">${esc(CARD.footer)}</text>
        <rect x="${B}" y="${B + 80 + 700}" width="${W-B*2}" height="${H - B*2 - 80 - 700}" fill="#f4e4c1"/>
        ${wrap(esc(CARD.desc), 42).map((l, i) => `<text x="${B + 24}" y="${B + 80 + 700 + 40 + i * 32}" font-family="serif" font-size="24" fill="#2a2016">${l}</text>`).join('')}
      </svg>`;
      await render(svg, p, o, B, B + 80, W - B*2, 700);
    }
  },

  // === TYPOGRAPHY ===
  {
    id: '11-sans-serif',
    desc: 'Sans-serif font throughout',
    gen: async (p, o) => {
      const svg = baseFullFrame({ fontFamily: 'sans-serif', bodySize: 22, charsPerLine: 46 });
      await render(svg, p, o, B, B + 80, W - B*2, 700);
    }
  },
  {
    id: '12-centered-text',
    desc: 'Center-aligned description text',
    gen: async (p, o) => {
      const svg = baseFullFrame({ textAlign: 'middle' });
      await render(svg, p, o, B, B + 80, W - B*2, 700);
    }
  },
  {
    id: '13-italic-desc',
    desc: 'Italic description text',
    gen: async (p, o) => {
      const svg = baseFullFrame({ bodyStyle: 'italic' });
      await render(svg, p, o, B, B + 80, W - B*2, 700);
    }
  },

  // === PORTRAIT-ONLY FRAME (old style for comparison) ===
  {
    id: '14-portrait-frame-only',
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
];

async function main() {
  const outDir = process.argv[2] || 'campaigns/example/cards/exploration';
  const portraitPath = path.join(outDir, 'portrait.png');

  console.log(`Generating ${variants.length} layout variants...\n`);

  for (const v of variants) {
    const outPath = path.join(outDir, `${v.id}.png`);
    await v.gen(portraitPath, outPath);
    console.log(`  ${v.id}: ${v.desc}`);
  }

  // Generate markdown
  let md = `# Layout Variant Comparison

New default: **Full frame** with 40px border and icons.

**Feedback needed:** Which elements work best? Any combinations to try?

---

## New Default

| Full frame (NEW DEFAULT) |
|:---:|
| <img src="00-default.png" width="300"/> |

---

## Border Width

| 40px (default) | 20px |
|:---:|:---:|
| <img src="00-default.png" width="250"/> | <img src="01-border-20px.png" width="250"/> |

---

## Text Box Background

| Parchment (default) | Tinted | Solid color |
|:---:|:---:|:---:|
| <img src="00-default.png" width="250"/> | <img src="02-tinted-textbox.png" width="250"/> | <img src="03-solid-textbox.png" width="250"/> |

---

## Portrait Size

| Default (700px) | Larger (800px) |
|:---:|:---:|
| <img src="00-default.png" width="250"/> | <img src="04-larger-portrait.png" width="250"/> |

---

## Header Variations

| With icons (default) | No icons | Larger header |
|:---:|:---:|:---:|
| <img src="00-default.png" width="250"/> | <img src="05-no-icons.png" width="250"/> | <img src="06-larger-header.png" width="250"/> |

---

## Decorative Elements

| Default | With divider line |
|:---:|:---:|
| <img src="00-default.png" width="250"/> | <img src="07-divider-line.png" width="250"/> |

---

## Theme

| Light (default) | Dark |
|:---:|:---:|
| <img src="00-default.png" width="250"/> | <img src="08-dark-theme.png" width="250"/> |

---

## Footer Variations

| Default | No footer | Overlaid on portrait |
|:---:|:---:|:---:|
| <img src="00-default.png" width="250"/> | <img src="09-no-footer.png" width="250"/> | <img src="10-footer-in-portrait.png" width="250"/> |

---

## Typography

| Serif (default) | Sans-serif | Centered | Italic |
|:---:|:---:|:---:|:---:|
| <img src="00-default.png" width="250"/> | <img src="11-sans-serif.png" width="250"/> | <img src="12-centered-text.png" width="250"/> | <img src="13-italic-desc.png" width="250"/> |

---

## Full Frame vs Portrait Frame

| Full frame (NEW) | Portrait frame only (OLD) |
|:---:|:---:|
| <img src="00-default.png" width="250"/> | <img src="14-portrait-frame-only.png" width="250"/> |

---
`;

  fs.writeFileSync(path.join(outDir, 'VARIANTS.md'), md);
  console.log(`\nWrote VARIANTS.md`);
}

main().catch(console.error);

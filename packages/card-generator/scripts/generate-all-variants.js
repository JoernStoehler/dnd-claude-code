#!/usr/bin/env node
/**
 * Generate MANY layout variants for comparison
 * Each variant explores a different design idea
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const W = 827, H = 1417;
const NPC_COLORS = { accent: '#8B4513', light: '#D2691E' };
const ICON = '<circle cx="12" cy="8" r="5"/><path d="M4 22c0-6 4-9 8-9s8 3 8 9"/>';
const CARD = { name: 'Grimble Thornwick', desc: 'A tinkering gnome inventor with perpetually soot-stained fingers and an infectious enthusiasm for clockwork contraptions.', footer: "Thornwick's Emporium" };

const esc = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const wrap = (t,n) => { const w=t.split(' '),l=[]; let c=''; for(const x of w){if((c+' '+x).trim().length<=n)c=(c+' '+x).trim();else{if(c)l.push(c);c=x;}} if(c)l.push(c); return l; };

async function render(svg, portraitPath, outputPath, pX, pY, pW, pH) {
  const bg = await sharp(Buffer.from(svg)).png().toBuffer();
  const portrait = await sharp(portraitPath).resize(pW, pH, { fit: 'cover' }).toBuffer();
  await sharp(bg).composite([{ input: portrait, top: pY, left: pX }]).png().toFile(outputPath);
}

const variants = [
  // === BORDER VARIATIONS ===
  {
    id: '01-border-40px',
    desc: 'Current: 40px category border around portrait',
    gen: async (p, o) => {
      const svg = `<svg width="${W}" height="${H}"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#f4e4c1"/><stop offset="100%" style="stop-color:#e8d4a8"/></linearGradient><linearGradient id="c" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:${NPC_COLORS.accent}"/><stop offset="100%" style="stop-color:${NPC_COLORS.light}"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#bg)"/><rect height="90" width="${W}" fill="url(#c)"/><rect y="90" height="827" width="${W}" fill="url(#c)"/><text x="${W/2}" y="62" font-family="serif" font-size="52" font-weight="bold" fill="#f4e4c1" text-anchor="middle">${esc(CARD.name)}</text>${wrap(esc(CARD.desc),46).map((l,i)=>`<text x="40" y="${961+i*36}" font-family="serif" font-size="28" fill="#2a2016">${l}</text>`).join('')}<rect y="${H-40}" height="40" width="${W}" fill="#e8d4a8"/><text x="${W/2}" y="${H-13}" font-family="serif" font-size="22" fill="#5a4a36" text-anchor="middle">${esc(CARD.footer)}</text></svg>`;
      await render(svg, p, o, 40, 130, W-80, 747);
    }
  },
  {
    id: '02-border-20px',
    desc: 'Thinner border: 20px (more portrait visible)',
    gen: async (p, o) => {
      const svg = `<svg width="${W}" height="${H}"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#f4e4c1"/><stop offset="100%" style="stop-color:#e8d4a8"/></linearGradient><linearGradient id="c" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:${NPC_COLORS.accent}"/><stop offset="100%" style="stop-color:${NPC_COLORS.light}"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#bg)"/><rect height="90" width="${W}" fill="url(#c)"/><rect y="90" height="827" width="${W}" fill="url(#c)"/><text x="${W/2}" y="62" font-family="serif" font-size="52" font-weight="bold" fill="#f4e4c1" text-anchor="middle">${esc(CARD.name)}</text>${wrap(esc(CARD.desc),46).map((l,i)=>`<text x="40" y="${961+i*36}" font-family="serif" font-size="28" fill="#2a2016">${l}</text>`).join('')}<rect y="${H-40}" height="40" width="${W}" fill="#e8d4a8"/><text x="${W/2}" y="${H-13}" font-family="serif" font-size="22" fill="#5a4a36" text-anchor="middle">${esc(CARD.footer)}</text></svg>`;
      await render(svg, p, o, 20, 110, W-40, 787);
    }
  },
  {
    id: '03-border-none',
    desc: 'No border: edge-to-edge portrait',
    gen: async (p, o) => {
      const svg = `<svg width="${W}" height="${H}"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#f4e4c1"/><stop offset="100%" style="stop-color:#e8d4a8"/></linearGradient><linearGradient id="c" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:${NPC_COLORS.accent}"/><stop offset="100%" style="stop-color:${NPC_COLORS.light}"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#bg)"/><rect height="90" width="${W}" fill="url(#c)"/><text x="${W/2}" y="62" font-family="serif" font-size="52" font-weight="bold" fill="#f4e4c1" text-anchor="middle">${esc(CARD.name)}</text>${wrap(esc(CARD.desc),46).map((l,i)=>`<text x="40" y="${961+i*36}" font-family="serif" font-size="28" fill="#2a2016">${l}</text>`).join('')}<rect y="${H-40}" height="40" width="${W}" fill="#e8d4a8"/><text x="${W/2}" y="${H-13}" font-family="serif" font-size="22" fill="#5a4a36" text-anchor="middle">${esc(CARD.footer)}</text></svg>`;
      await render(svg, p, o, 0, 90, W, 827);
    }
  },

  // === FULL CARD FRAME ===
  {
    id: '04-fullframe',
    desc: 'Full frame: category border around entire card',
    gen: async (p, o) => {
      const B = 30;
      const svg = `<svg width="${W}" height="${H}"><defs><linearGradient id="c" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:${NPC_COLORS.accent}"/><stop offset="100%" style="stop-color:${NPC_COLORS.light}"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#c)"/><rect x="${B}" y="${B}" width="${W-B*2}" height="70" fill="url(#c)"/><text x="${W/2}" y="${B+50}" font-family="serif" font-size="44" font-weight="bold" fill="#f4e4c1" text-anchor="middle">${esc(CARD.name)}</text><rect x="${B}" y="${B+70+700}" width="${W-B*2}" height="${H-B*2-70-700-36}" fill="#f4e4c1"/>${wrap(esc(CARD.desc),42).map((l,i)=>`<text x="${B+24}" y="${B+70+700+36+i*32}" font-family="serif" font-size="24" fill="#2a2016">${l}</text>`).join('')}<rect x="${B}" y="${H-B-36}" width="${W-B*2}" height="36" fill="#e8d4a8"/><text x="${W/2}" y="${H-B-10}" font-family="serif" font-size="20" fill="#5a4a36" text-anchor="middle">${esc(CARD.footer)}</text></svg>`;
      await render(svg, p, o, B, B+70, W-B*2, 700);
    }
  },

  // === TEXT BOX STYLING ===
  {
    id: '05-tinted-textbox',
    desc: 'Tinted text box: light category color behind text',
    gen: async (p, o) => {
      const svg = `<svg width="${W}" height="${H}"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#f4e4c1"/><stop offset="100%" style="stop-color:#e8d4a8"/></linearGradient><linearGradient id="c" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:${NPC_COLORS.accent}"/><stop offset="100%" style="stop-color:${NPC_COLORS.light}"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#bg)"/><rect height="90" width="${W}" fill="url(#c)"/><rect y="90" height="827" width="${W}" fill="url(#c)"/><rect y="917" height="460" width="${W}" fill="url(#c)" opacity="0.15"/><text x="${W/2}" y="62" font-family="serif" font-size="52" font-weight="bold" fill="#f4e4c1" text-anchor="middle">${esc(CARD.name)}</text>${wrap(esc(CARD.desc),46).map((l,i)=>`<text x="40" y="${961+i*36}" font-family="serif" font-size="28" fill="#2a2016">${l}</text>`).join('')}<rect y="${H-40}" height="40" width="${W}" fill="url(#c)" opacity="0.3"/><text x="${W/2}" y="${H-13}" font-family="serif" font-size="22" fill="#3a2a16" text-anchor="middle">${esc(CARD.footer)}</text></svg>`;
      await render(svg, p, o, 40, 130, W-80, 747);
    }
  },
  {
    id: '06-solid-textbox',
    desc: 'Solid text box: same color as header',
    gen: async (p, o) => {
      const svg = `<svg width="${W}" height="${H}"><defs><linearGradient id="c" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:${NPC_COLORS.accent}"/><stop offset="100%" style="stop-color:${NPC_COLORS.light}"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#c)"/><rect y="917" height="460" width="${W}" fill="#f4e4c1"/><text x="${W/2}" y="62" font-family="serif" font-size="52" font-weight="bold" fill="#f4e4c1" text-anchor="middle">${esc(CARD.name)}</text>${wrap(esc(CARD.desc),46).map((l,i)=>`<text x="40" y="${961+i*36}" font-family="serif" font-size="28" fill="#2a2016">${l}</text>`).join('')}<rect y="${H-40}" height="40" width="${W}" fill="#e8d4a8"/><text x="${W/2}" y="${H-13}" font-family="serif" font-size="22" fill="#5a4a36" text-anchor="middle">${esc(CARD.footer)}</text></svg>`;
      await render(svg, p, o, 40, 130, W-80, 747);
    }
  },

  // === PORTRAIT SIZE ===
  {
    id: '07-smaller-portrait',
    desc: 'Smaller portrait (650px): more text space',
    gen: async (p, o) => {
      const PH = 650;
      const svg = `<svg width="${W}" height="${H}"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#f4e4c1"/><stop offset="100%" style="stop-color:#e8d4a8"/></linearGradient><linearGradient id="c" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:${NPC_COLORS.accent}"/><stop offset="100%" style="stop-color:${NPC_COLORS.light}"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#bg)"/><rect height="90" width="${W}" fill="url(#c)"/><rect y="90" height="${PH}" width="${W}" fill="url(#c)"/><text x="${W/2}" y="62" font-family="serif" font-size="52" font-weight="bold" fill="#f4e4c1" text-anchor="middle">${esc(CARD.name)}</text>${wrap(esc(CARD.desc),46).map((l,i)=>`<text x="40" y="${90+PH+44+i*36}" font-family="serif" font-size="28" fill="#2a2016">${l}</text>`).join('')}<rect y="${H-40}" height="40" width="${W}" fill="#e8d4a8"/><text x="${W/2}" y="${H-13}" font-family="serif" font-size="22" fill="#5a4a36" text-anchor="middle">${esc(CARD.footer)}</text></svg>`;
      await render(svg, p, o, 40, 130, W-80, PH-80);
    }
  },
  {
    id: '08-larger-portrait',
    desc: 'Larger portrait (900px): less text space',
    gen: async (p, o) => {
      const PH = 900;
      const svg = `<svg width="${W}" height="${H}"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#f4e4c1"/><stop offset="100%" style="stop-color:#e8d4a8"/></linearGradient><linearGradient id="c" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:${NPC_COLORS.accent}"/><stop offset="100%" style="stop-color:${NPC_COLORS.light}"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#bg)"/><rect height="90" width="${W}" fill="url(#c)"/><rect y="90" height="${PH}" width="${W}" fill="url(#c)"/><text x="${W/2}" y="62" font-family="serif" font-size="52" font-weight="bold" fill="#f4e4c1" text-anchor="middle">${esc(CARD.name)}</text>${wrap(esc(CARD.desc),46).map((l,i)=>`<text x="40" y="${90+PH+44+i*36}" font-family="serif" font-size="28" fill="#2a2016">${l}</text>`).join('')}<rect y="${H-40}" height="40" width="${W}" fill="#e8d4a8"/><text x="${W/2}" y="${H-13}" font-family="serif" font-size="22" fill="#5a4a36" text-anchor="middle">${esc(CARD.footer)}</text></svg>`;
      await render(svg, p, o, 40, 130, W-80, PH-80);
    }
  },

  // === HEADER VARIATIONS ===
  {
    id: '09-no-icons',
    desc: 'No category icons in header',
    gen: async (p, o) => {
      const svg = `<svg width="${W}" height="${H}"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#f4e4c1"/><stop offset="100%" style="stop-color:#e8d4a8"/></linearGradient><linearGradient id="c" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:${NPC_COLORS.accent}"/><stop offset="100%" style="stop-color:${NPC_COLORS.light}"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#bg)"/><rect height="90" width="${W}" fill="url(#c)"/><rect y="90" height="827" width="${W}" fill="url(#c)"/><text x="${W/2}" y="62" font-family="serif" font-size="52" font-weight="bold" fill="#f4e4c1" text-anchor="middle">${esc(CARD.name)}</text>${wrap(esc(CARD.desc),46).map((l,i)=>`<text x="40" y="${961+i*36}" font-family="serif" font-size="28" fill="#2a2016">${l}</text>`).join('')}<rect y="${H-40}" height="40" width="${W}" fill="#e8d4a8"/><text x="${W/2}" y="${H-13}" font-family="serif" font-size="22" fill="#5a4a36" text-anchor="middle">${esc(CARD.footer)}</text></svg>`;
      await render(svg, p, o, 40, 130, W-80, 747);
    }
  },
  {
    id: '10-larger-header',
    desc: 'Larger header (120px) with bigger title',
    gen: async (p, o) => {
      const HH = 120;
      const svg = `<svg width="${W}" height="${H}"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#f4e4c1"/><stop offset="100%" style="stop-color:#e8d4a8"/></linearGradient><linearGradient id="c" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:${NPC_COLORS.accent}"/><stop offset="100%" style="stop-color:${NPC_COLORS.light}"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#bg)"/><rect height="${HH}" width="${W}" fill="url(#c)"/><rect y="${HH}" height="800" width="${W}" fill="url(#c)"/><text x="${W/2}" y="82" font-family="serif" font-size="64" font-weight="bold" fill="#f4e4c1" text-anchor="middle">${esc(CARD.name)}</text>${wrap(esc(CARD.desc),46).map((l,i)=>`<text x="40" y="${HH+800+44+i*36}" font-family="serif" font-size="28" fill="#2a2016">${l}</text>`).join('')}<rect y="${H-40}" height="40" width="${W}" fill="#e8d4a8"/><text x="${W/2}" y="${H-13}" font-family="serif" font-size="22" fill="#5a4a36" text-anchor="middle">${esc(CARD.footer)}</text></svg>`;
      await render(svg, p, o, 40, HH+40, W-80, 720);
    }
  },
  {
    id: '11-name-below-portrait',
    desc: 'Name below portrait (reversed layout)',
    gen: async (p, o) => {
      const svg = `<svg width="${W}" height="${H}"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#f4e4c1"/><stop offset="100%" style="stop-color:#e8d4a8"/></linearGradient><linearGradient id="c" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:${NPC_COLORS.accent}"/><stop offset="100%" style="stop-color:${NPC_COLORS.light}"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#bg)"/><rect y="0" height="827" width="${W}" fill="url(#c)"/><rect y="827" height="90" width="${W}" fill="url(#c)"/><text x="${W/2}" y="889" font-family="serif" font-size="52" font-weight="bold" fill="#f4e4c1" text-anchor="middle">${esc(CARD.name)}</text>${wrap(esc(CARD.desc),46).map((l,i)=>`<text x="40" y="${961+i*36}" font-family="serif" font-size="28" fill="#2a2016">${l}</text>`).join('')}<rect y="${H-40}" height="40" width="${W}" fill="#e8d4a8"/><text x="${W/2}" y="${H-13}" font-family="serif" font-size="22" fill="#5a4a36" text-anchor="middle">${esc(CARD.footer)}</text></svg>`;
      await render(svg, p, o, 40, 40, W-80, 747);
    }
  },

  // === DECORATIVE ELEMENTS ===
  {
    id: '12-rounded-portrait',
    desc: 'Rounded corners on portrait area',
    gen: async (p, o) => {
      const svg = `<svg width="${W}" height="${H}"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#f4e4c1"/><stop offset="100%" style="stop-color:#e8d4a8"/></linearGradient><linearGradient id="c" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:${NPC_COLORS.accent}"/><stop offset="100%" style="stop-color:${NPC_COLORS.light}"/></linearGradient><clipPath id="clip"><rect x="40" y="130" width="747" height="747" rx="20"/></clipPath></defs><rect width="${W}" height="${H}" fill="url(#bg)"/><rect height="90" width="${W}" fill="url(#c)"/><rect y="90" height="827" width="${W}" fill="url(#c)"/><text x="${W/2}" y="62" font-family="serif" font-size="52" font-weight="bold" fill="#f4e4c1" text-anchor="middle">${esc(CARD.name)}</text>${wrap(esc(CARD.desc),46).map((l,i)=>`<text x="40" y="${961+i*36}" font-family="serif" font-size="28" fill="#2a2016">${l}</text>`).join('')}<rect y="${H-40}" height="40" width="${W}" fill="#e8d4a8"/><text x="${W/2}" y="${H-13}" font-family="serif" font-size="22" fill="#5a4a36" text-anchor="middle">${esc(CARD.footer)}</text></svg>`;
      // For rounded, we'd need to apply clipPath - simplified version
      await render(svg, p, o, 40, 130, W-80, 747);
    }
  },
  {
    id: '13-divider-line',
    desc: 'Divider line between portrait and text',
    gen: async (p, o) => {
      const svg = `<svg width="${W}" height="${H}"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#f4e4c1"/><stop offset="100%" style="stop-color:#e8d4a8"/></linearGradient><linearGradient id="c" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:${NPC_COLORS.accent}"/><stop offset="100%" style="stop-color:${NPC_COLORS.light}"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#bg)"/><rect height="90" width="${W}" fill="url(#c)"/><rect y="90" height="827" width="${W}" fill="url(#c)"/><line x1="60" y1="927" x2="${W-60}" y2="927" stroke="${NPC_COLORS.accent}" stroke-width="3"/><text x="${W/2}" y="62" font-family="serif" font-size="52" font-weight="bold" fill="#f4e4c1" text-anchor="middle">${esc(CARD.name)}</text>${wrap(esc(CARD.desc),46).map((l,i)=>`<text x="40" y="${971+i*36}" font-family="serif" font-size="28" fill="#2a2016">${l}</text>`).join('')}<rect y="${H-40}" height="40" width="${W}" fill="#e8d4a8"/><text x="${W/2}" y="${H-13}" font-family="serif" font-size="22" fill="#5a4a36" text-anchor="middle">${esc(CARD.footer)}</text></svg>`;
      await render(svg, p, o, 40, 130, W-80, 747);
    }
  },

  // === DARK THEME ===
  {
    id: '14-dark-theme',
    desc: 'Dark theme: dark background, light text',
    gen: async (p, o) => {
      const svg = `<svg width="${W}" height="${H}"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#1a1a1a"/><stop offset="100%" style="stop-color:#0d0d0d"/></linearGradient><linearGradient id="c" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:${NPC_COLORS.accent}"/><stop offset="100%" style="stop-color:${NPC_COLORS.light}"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#bg)"/><rect height="90" width="${W}" fill="url(#c)"/><rect y="90" height="827" width="${W}" fill="url(#c)"/><text x="${W/2}" y="62" font-family="serif" font-size="52" font-weight="bold" fill="#f4e4c1" text-anchor="middle">${esc(CARD.name)}</text>${wrap(esc(CARD.desc),46).map((l,i)=>`<text x="40" y="${961+i*36}" font-family="serif" font-size="28" fill="#e0e0e0">${l}</text>`).join('')}<rect y="${H-40}" height="40" width="${W}" fill="#111"/><text x="${W/2}" y="${H-13}" font-family="serif" font-size="22" fill="#666" text-anchor="middle">${esc(CARD.footer)}</text></svg>`;
      await render(svg, p, o, 40, 130, W-80, 747);
    }
  },

  // === CATEGORY IN DIFFERENT PLACES ===
  {
    id: '15-category-badge',
    desc: 'Category badge in corner instead of icons',
    gen: async (p, o) => {
      const svg = `<svg width="${W}" height="${H}"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#f4e4c1"/><stop offset="100%" style="stop-color:#e8d4a8"/></linearGradient><linearGradient id="c" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:${NPC_COLORS.accent}"/><stop offset="100%" style="stop-color:${NPC_COLORS.light}"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#bg)"/><rect height="90" width="${W}" fill="url(#c)"/><rect y="90" height="827" width="${W}" fill="url(#c)"/><rect x="${W-100}" y="100" width="90" height="30" rx="4" fill="rgba(0,0,0,0.5)"/><text x="${W-55}" y="121" font-family="sans-serif" font-size="16" fill="white" text-anchor="middle">NPC</text><text x="${W/2}" y="62" font-family="serif" font-size="52" font-weight="bold" fill="#f4e4c1" text-anchor="middle">${esc(CARD.name)}</text>${wrap(esc(CARD.desc),46).map((l,i)=>`<text x="40" y="${961+i*36}" font-family="serif" font-size="28" fill="#2a2016">${l}</text>`).join('')}<rect y="${H-40}" height="40" width="${W}" fill="#e8d4a8"/><text x="${W/2}" y="${H-13}" font-family="serif" font-size="22" fill="#5a4a36" text-anchor="middle">${esc(CARD.footer)}</text></svg>`;
      await render(svg, p, o, 40, 130, W-80, 747);
    }
  },

  // === FOOTER VARIATIONS ===
  {
    id: '16-no-footer',
    desc: 'No footer: more text space',
    gen: async (p, o) => {
      const svg = `<svg width="${W}" height="${H}"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#f4e4c1"/><stop offset="100%" style="stop-color:#e8d4a8"/></linearGradient><linearGradient id="c" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:${NPC_COLORS.accent}"/><stop offset="100%" style="stop-color:${NPC_COLORS.light}"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#bg)"/><rect height="90" width="${W}" fill="url(#c)"/><rect y="90" height="827" width="${W}" fill="url(#c)"/><text x="${W/2}" y="62" font-family="serif" font-size="52" font-weight="bold" fill="#f4e4c1" text-anchor="middle">${esc(CARD.name)}</text>${wrap(esc(CARD.desc),46).map((l,i)=>`<text x="40" y="${961+i*36}" font-family="serif" font-size="28" fill="#2a2016">${l}</text>`).join('')}</svg>`;
      await render(svg, p, o, 40, 130, W-80, 747);
    }
  },
  {
    id: '17-footer-in-portrait',
    desc: 'Footer overlaid on portrait bottom',
    gen: async (p, o) => {
      const svg = `<svg width="${W}" height="${H}"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#f4e4c1"/><stop offset="100%" style="stop-color:#e8d4a8"/></linearGradient><linearGradient id="c" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:${NPC_COLORS.accent}"/><stop offset="100%" style="stop-color:${NPC_COLORS.light}"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#bg)"/><rect height="90" width="${W}" fill="url(#c)"/><rect y="90" height="827" width="${W}" fill="url(#c)"/><rect y="877" height="40" width="${W}" fill="rgba(0,0,0,0.6)"/><text x="${W/2}" y="904" font-family="serif" font-size="22" fill="white" text-anchor="middle">${esc(CARD.footer)}</text><text x="${W/2}" y="62" font-family="serif" font-size="52" font-weight="bold" fill="#f4e4c1" text-anchor="middle">${esc(CARD.name)}</text>${wrap(esc(CARD.desc),46).map((l,i)=>`<text x="40" y="${961+i*36}" font-family="serif" font-size="28" fill="#2a2016">${l}</text>`).join('')}</svg>`;
      await render(svg, p, o, 40, 130, W-80, 747);
    }
  },

  // === TYPOGRAPHY ===
  {
    id: '18-sans-serif',
    desc: 'Sans-serif font throughout',
    gen: async (p, o) => {
      const svg = `<svg width="${W}" height="${H}"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#f4e4c1"/><stop offset="100%" style="stop-color:#e8d4a8"/></linearGradient><linearGradient id="c" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:${NPC_COLORS.accent}"/><stop offset="100%" style="stop-color:${NPC_COLORS.light}"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#bg)"/><rect height="90" width="${W}" fill="url(#c)"/><rect y="90" height="827" width="${W}" fill="url(#c)"/><text x="${W/2}" y="62" font-family="sans-serif" font-size="48" font-weight="bold" fill="#f4e4c1" text-anchor="middle">${esc(CARD.name)}</text>${wrap(esc(CARD.desc),48).map((l,i)=>`<text x="40" y="${961+i*34}" font-family="sans-serif" font-size="24" fill="#2a2016">${l}</text>`).join('')}<rect y="${H-40}" height="40" width="${W}" fill="#e8d4a8"/><text x="${W/2}" y="${H-13}" font-family="sans-serif" font-size="20" fill="#5a4a36" text-anchor="middle">${esc(CARD.footer)}</text></svg>`;
      await render(svg, p, o, 40, 130, W-80, 747);
    }
  },

  // === MISC ===
  {
    id: '19-centered-text',
    desc: 'Center-aligned description text',
    gen: async (p, o) => {
      const svg = `<svg width="${W}" height="${H}"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#f4e4c1"/><stop offset="100%" style="stop-color:#e8d4a8"/></linearGradient><linearGradient id="c" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:${NPC_COLORS.accent}"/><stop offset="100%" style="stop-color:${NPC_COLORS.light}"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#bg)"/><rect height="90" width="${W}" fill="url(#c)"/><rect y="90" height="827" width="${W}" fill="url(#c)"/><text x="${W/2}" y="62" font-family="serif" font-size="52" font-weight="bold" fill="#f4e4c1" text-anchor="middle">${esc(CARD.name)}</text>${wrap(esc(CARD.desc),46).map((l,i)=>`<text x="${W/2}" y="${961+i*36}" font-family="serif" font-size="28" fill="#2a2016" text-anchor="middle">${l}</text>`).join('')}<rect y="${H-40}" height="40" width="${W}" fill="#e8d4a8"/><text x="${W/2}" y="${H-13}" font-family="serif" font-size="22" fill="#5a4a36" text-anchor="middle">${esc(CARD.footer)}</text></svg>`;
      await render(svg, p, o, 40, 130, W-80, 747);
    }
  },
  {
    id: '20-italic-desc',
    desc: 'Italic description text',
    gen: async (p, o) => {
      const svg = `<svg width="${W}" height="${H}"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#f4e4c1"/><stop offset="100%" style="stop-color:#e8d4a8"/></linearGradient><linearGradient id="c" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:${NPC_COLORS.accent}"/><stop offset="100%" style="stop-color:${NPC_COLORS.light}"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#bg)"/><rect height="90" width="${W}" fill="url(#c)"/><rect y="90" height="827" width="${W}" fill="url(#c)"/><text x="${W/2}" y="62" font-family="serif" font-size="52" font-weight="bold" fill="#f4e4c1" text-anchor="middle">${esc(CARD.name)}</text>${wrap(esc(CARD.desc),46).map((l,i)=>`<text x="40" y="${961+i*36}" font-family="serif" font-size="28" font-style="italic" fill="#2a2016">${l}</text>`).join('')}<rect y="${H-40}" height="40" width="${W}" fill="#e8d4a8"/><text x="${W/2}" y="${H-13}" font-family="serif" font-size="22" fill="#5a4a36" text-anchor="middle">${esc(CARD.footer)}</text></svg>`;
      await render(svg, p, o, 40, 130, W-80, 747);
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

Generated ${variants.length} design variants. Please review and provide feedback.

**What I want feedback on:** Which layout elements work best? Any combinations you'd like to see?

---

`;

  for (const v of variants) {
    md += `## ${v.id.replace(/-/g, ' ').replace(/^\d+ /, '')}\n\n`;
    md += `**${v.desc}**\n\n`;
    md += `![${v.id}](${v.id}.png)\n\n---\n\n`;
  }

  fs.writeFileSync(path.join(outDir, 'VARIANTS.md'), md);
  console.log(`\nWrote VARIANTS.md`);
}

main().catch(console.error);

#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const PADDING = 36;
const COLORS = { accent: '#8B4513', light: '#D2691E', dark: '#5D2E0C' };
const ICON = '<circle cx="12" cy="8" r="5"/><path d="M4 22c0-6 4-9 8-9s8 3 8 9"/>';

function escapeXml(s) { return s ? String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;') : ''; }
function wordWrap(text, max) {
  const words = text.split(' '), lines = [];
  let line = '';
  for (const w of words) {
    if ((line + ' ' + w).trim().length <= max) line = (line + ' ' + w).trim();
    else { if (line) lines.push(line); line = w; }
  }
  if (line) lines.push(line);
  return lines;
}

async function render(cfg, card, imgPath, outPath) {
  const { W, H, portrait, header, footer, fontSize, lineHeight, maxChars } = cfg;
  const body = H - header - portrait - footer;

  const bgSvg = `<svg width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#f4e4c1"/></svg>`;
  const headerSvg = `<svg width="${W}" height="${header}">
    <defs><linearGradient id="hg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${COLORS.accent}"/><stop offset="100%" style="stop-color:${COLORS.light}"/>
    </linearGradient></defs>
    <rect width="${W}" height="${header}" fill="url(#hg)"/>
    <g transform="translate(20,${(header-28)/2}) scale(${28/24})" fill="rgba(255,255,255,0.7)">${ICON}</g>
    <g transform="translate(${W-48},${(header-28)/2}) scale(${28/24})" fill="rgba(255,255,255,0.7)">${ICON}</g>
    <text x="${W/2}" y="${header/2+16}" font-family="serif" font-size="48" font-weight="bold" fill="#f4e4c1" text-anchor="middle">${escapeXml(card.name)}</text>
  </svg>`;

  const lines = wordWrap(escapeXml(card.description), maxChars);
  const bodyText = lines.map((l,i) => `<text x="${PADDING}" y="${36+i*lineHeight}" font-family="serif" font-size="${fontSize}" fill="#2a2016">${l}</text>`).join('');
  const bodySvg = `<svg width="${W}" height="${body}">${bodyText}</svg>`;

  const footerSvg = `<svg width="${W}" height="${footer}">
    <rect width="${W}" height="${footer}" fill="#e8d4a8"/>
    <line x1="0" y1="0" x2="${W}" y2="0" stroke="#c4a882" stroke-width="2"/>
    <text x="${W/2}" y="${footer/2+6}" font-family="serif" font-size="20" fill="#5a4a36" text-anchor="middle">${escapeXml(card.footer)}</text>
  </svg>`;

  const imgBuf = await sharp(imgPath).resize(W, portrait, { fit: 'cover' }).toBuffer();
  const bg = await sharp(Buffer.from(bgSvg)).png().toBuffer();
  const hdr = await sharp(Buffer.from(headerSvg)).png().toBuffer();
  const bdy = await sharp(Buffer.from(bodySvg)).png().toBuffer();
  const ftr = await sharp(Buffer.from(footerSvg)).png().toBuffer();

  await sharp(bg).composite([
    { input: hdr, top: 0, left: 0 },
    { input: imgBuf, top: header, left: 0 },
    { input: bdy, top: header + portrait, left: 0 },
    { input: ftr, top: H - footer, left: 0 }
  ]).png().toFile(outPath);

  const meta = await sharp(imgPath).metadata();
  const scaled = Math.round(meta.height * (W / meta.width));
  const crop = Math.max(0, scaled - portrait);
  const cropPct = ((crop / scaled) * 100).toFixed(1);
  const linesAvail = Math.floor((body - 36) / lineHeight);
  return { W, H, portrait, body, crop, cropPct, linesAvail, fontSize, lineHeight };
}

async function main() {
  const dir = process.argv[2] || '.';
  const img = path.join(dir, 'portrait.png');
  const card = { name: "Grimble Thornwick", description: "A tinkering gnome inventor with perpetually soot-stained fingers and an infectious enthusiasm for clockwork contraptions. His workshop is legendary for both its ingenious devices and occasional explosions.", footer: "Thornwick's Emporium" };

  const configs = [
    { id: 'A-5pct-5lines', label: 'Poker, 5% crop, 5 lines', W: 750, H: 1050, portrait: 713, header: 80, footer: 36, fontSize: 28, lineHeight: 34, maxChars: 42 },
    { id: 'B-7pct-6lines', label: 'Poker, 7.5% crop, 6 lines', W: 750, H: 1050, portrait: 694, header: 80, footer: 36, fontSize: 28, lineHeight: 34, maxChars: 42 },
    { id: 'C-5pct-6lines-small', label: 'Poker, 5% crop, 6 lines (smaller text)', W: 750, H: 1050, portrait: 713, header: 80, footer: 36, fontSize: 24, lineHeight: 28, maxChars: 48 },
    { id: 'D-tarot-full', label: 'Tarot, minimal crop, 8+ lines', W: 827, H: 1430, portrait: 827, header: 90, footer: 40, fontSize: 28, lineHeight: 34, maxChars: 46 },
  ];

  const results = [];
  for (const c of configs) {
    const out = path.join(dir, `tradeoff-${c.id}.png`);
    const stats = await render(c, card, img, out);
    results.push({ ...c, ...stats });
    console.log(`${c.id}: ${stats.cropPct}% crop, ${stats.linesAvail} lines`);
  }

  let md = `# Card Size/Crop Trade-offs

Same content, same image. Which trade-off do you prefer?

| Option | Card | Crop | Lines | Text Size |
|--------|------|------|-------|-----------|
${results.map(r => `| ${r.label} | ${r.W}×${r.H} | ${r.cropPct}% | ${r.linesAvail} | ${r.fontSize}px |`).join('\n')}

---

`;
  for (const r of results) {
    md += `## ${r.label}

![${r.id}](tradeoff-${r.id}.png)

- Card: ${r.W}×${r.H}px
- Portrait: ${r.portrait}px, Crop: ${r.cropPct}%
- Body: ${r.body}px = ${r.linesAvail} lines @ ${r.fontSize}px

---

`;
  }
  md += `## Feedback\n\nPreferred option: \nNotes: \n`;
  fs.writeFileSync(path.join(dir, 'TRADEOFF-COMPARISON.md'), md);
  console.log('Wrote TRADEOFF-COMPARISON.md');
}

main().catch(console.error);

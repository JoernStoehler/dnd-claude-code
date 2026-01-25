#!/usr/bin/env node
/**
 * Render multiple card configurations for comparison
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const PADDING = 36;
const CATEGORY_COLORS = { npc: { accent: '#8B4513', light: '#D2691E', dark: '#5D2E0C' } };
const CATEGORY_ICONS = { npc: '<circle cx="12" cy="8" r="5"/><path d="M4 22c0-6 4-9 8-9s8 3 8 9"/>' };

function escapeXml(str) {
  return str ? String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;') : '';
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

async function renderCard(cfg, card, portraitPath, outputPath) {
  const { cardWidth, cardHeight, portraitHeight, headerHeight, footerHeight, fontSize, lineHeight, maxChars } = cfg;
  const colors = CATEGORY_COLORS.npc;
  const bodyHeight = cardHeight - headerHeight - portraitHeight - footerHeight;

  const bgSvg = `<svg width="${cardWidth}" height="${cardHeight}">
    <defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f4e4c1"/><stop offset="100%" style="stop-color:#e8d4a8"/>
    </linearGradient></defs>
    <rect width="${cardWidth}" height="${cardHeight}" fill="url(#bg)"/>
  </svg>`;

  const icon = CATEGORY_ICONS.npc;
  const headerSvg = `<svg width="${cardWidth}" height="${headerHeight}">
    <defs><linearGradient id="hg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${colors.accent}"/><stop offset="100%" style="stop-color:${colors.light}"/>
    </linearGradient></defs>
    <rect width="${cardWidth}" height="${headerHeight}" fill="url(#hg)"/>
    <g transform="translate(20, ${(headerHeight-28)/2}) scale(${28/24})" fill="rgba(255,255,255,0.7)">${icon}</g>
    <g transform="translate(${cardWidth-48}, ${(headerHeight-28)/2}) scale(${28/24})" fill="rgba(255,255,255,0.7)">${icon}</g>
    <text x="${cardWidth/2}" y="${headerHeight/2+16}" font-family="serif" font-size="48" font-weight="bold"
          fill="#f4e4c1" text-anchor="middle">${escapeXml(card.name)}</text>
  </svg>`;

  const descLines = wordWrap(escapeXml(card.description), maxChars);
  const descText = descLines.map((line, i) =>
    `<text x="${PADDING}" y="${36 + i * lineHeight}" font-family="serif" font-size="${fontSize}" fill="#2a2016">${line}</text>`
  ).join('\n');
  const bodySvg = `<svg width="${cardWidth}" height="${bodyHeight}">${descText}</svg>`;

  const footerSvg = `<svg width="${cardWidth}" height="${footerHeight}">
    <rect width="${cardWidth}" height="${footerHeight}" fill="#e8d4a8"/>
    <line x1="0" y1="0" x2="${cardWidth}" y2="0" stroke="#c4a882" stroke-width="2"/>
    <text x="${cardWidth/2}" y="${footerHeight/2+6}" font-family="serif" font-size="20" fill="#5a4a36"
          text-anchor="middle">${escapeXml(card.footer)}</text>
  </svg>`;

  const portraitBuffer = await sharp(portraitPath)
    .resize(cardWidth, portraitHeight, { fit: 'cover', position: cfg.cropPosition || 'center' })
    .toBuffer();

  const bg = await sharp(Buffer.from(bgSvg)).png().toBuffer();
  const header = await sharp(Buffer.from(headerSvg)).png().toBuffer();
  const body = await sharp(Buffer.from(bodySvg)).png().toBuffer();
  const footer = await sharp(Buffer.from(footerSvg)).png().toBuffer();

  await sharp(bg)
    .composite([
      { input: header, top: 0, left: 0 },
      { input: portraitBuffer, top: headerHeight, left: 0 },
      { input: body, top: headerHeight + portraitHeight, left: 0 },
      { input: footer, top: cardHeight - footerHeight, left: 0 }
    ])
    .png().toFile(outputPath);

  // Calculate stats
  const imgMeta = await sharp(portraitPath).metadata();
  const scaleFactor = cardWidth / imgMeta.width;
  const scaledHeight = Math.round(imgMeta.height * scaleFactor);
  const cropAmount = Math.max(0, scaledHeight - portraitHeight);
  const cropPercent = ((cropAmount / scaledHeight) * 100).toFixed(1);
  const linesAvailable = Math.floor((bodyHeight - 36) / lineHeight);

  return { cardWidth, cardHeight, portraitHeight, scaledHeight, cropAmount, cropPercent, bodyHeight, linesAvailable };
}

async function main() {
  const baseDir = process.argv[2] || '.';
  const squareImg = path.join(baseDir, 'portrait.png');
  const img43 = path.join(baseDir, 'portrait-4x3.png');

  const card = {
    name: "Grimble Thornwick",
    description: "A tinkering gnome inventor with perpetually soot-stained fingers and an infectious enthusiasm for clockwork contraptions. His workshop is legendary for both its ingenious devices and occasional explosions.",
    footer: "Thornwick's Emporium"
  };

  const configs = [
    // Option 1: Square image, taller card for 6 lines
    { id: 'opt1-square-tall', label: 'Square image + Tall card (6 lines)',
      cardWidth: 750, cardHeight: 1110, portraitHeight: 750, headerHeight: 80, footerHeight: 36,
      fontSize: 28, lineHeight: 34, maxChars: 42, portrait: squareImg },

    // Option 2: Square image, poker size, smaller text for 6 lines
    { id: 'opt2-square-poker-smalltext', label: 'Square image + Poker + Smaller text (6 lines)',
      cardWidth: 750, cardHeight: 1050, portraitHeight: 750, headerHeight: 80, footerHeight: 36,
      fontSize: 24, lineHeight: 28, maxChars: 48, portrait: squareImg },

    // Option 3: 4:3 image, taller card, ~5% crop
    { id: 'opt3-43-tall-5crop', label: '4:3 image + Tall card (~10% crop)',
      cardWidth: 750, cardHeight: 1200, portraitHeight: 900, headerHeight: 80, footerHeight: 36,
      fontSize: 28, lineHeight: 34, maxChars: 42, portrait: img43 },

    // Option 4: 4:3 image, poker size, 25% crop (current CLAUDE.md recommendation)
    { id: 'opt4-43-poker-25crop', label: '4:3 image + Poker (25% crop)',
      cardWidth: 750, cardHeight: 1050, portraitHeight: 750, headerHeight: 80, footerHeight: 36,
      fontSize: 28, lineHeight: 34, maxChars: 42, portrait: img43 },

    // Option 5: 4:3 image, poker size, top-weighted crop
    { id: 'opt5-43-poker-topcrop', label: '4:3 image + Poker + Top crop (keep head)',
      cardWidth: 750, cardHeight: 1050, portraitHeight: 750, headerHeight: 80, footerHeight: 36,
      fontSize: 28, lineHeight: 34, maxChars: 42, portrait: img43, cropPosition: 'top' },
  ];

  const results = [];
  for (const cfg of configs) {
    if (!fs.existsSync(cfg.portrait)) {
      console.log(`Skipping ${cfg.id}: portrait not found`);
      continue;
    }
    const outPath = path.join(baseDir, `${cfg.id}.png`);
    const stats = await renderCard(cfg, card, cfg.portrait, outPath);
    results.push({ ...cfg, ...stats, filename: `${cfg.id}.png` });
    console.log(`Rendered: ${cfg.id}`);
  }

  // Generate markdown with embedded images
  let md = `# Card Design Comparison

All options show the same content. Goal: 6 lines of text, ≤5% crop ideal.

| Option | Card Size | Image | Crop | Text Lines |
|--------|-----------|-------|------|------------|
${results.map(r => `| ${r.label.split(' + ')[0]} | ${r.cardWidth}×${r.cardHeight} | ${r.portrait.includes('4x3') ? '4:3' : 'Square'} | ${r.cropPercent}% | ${r.linesAvailable} |`).join('\n')}

---

`;

  for (const r of results) {
    md += `## ${r.label}

- **Card:** ${r.cardWidth}×${r.cardHeight}px
- **Portrait area:** ${r.portraitHeight}px (image scales to ${r.scaledHeight}px)
- **Crop:** ${r.cropPercent}% (${r.cropAmount}px removed)
- **Text space:** ${r.bodyHeight}px = ${r.linesAvailable} lines
- **Font:** ${r.fontSize}px / ${r.lineHeight}px line height

![${r.label}](${r.filename})

---

`;
  }

  md += `## Your Feedback

Which option do you prefer? Note any issues:

- Option 1:
- Option 2:
- Option 3:
- Option 4:
- Option 5:
`;

  fs.writeFileSync(path.join(baseDir, 'CARD-COMPARISON.md'), md);
  console.log('\nWrote CARD-COMPARISON.md');
}

main().catch(console.error);

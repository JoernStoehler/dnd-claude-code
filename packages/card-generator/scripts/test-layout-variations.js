#!/usr/bin/env node
/**
 * Test the tarot layout with varied content to verify it works across use cases
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Tarot size
const CARD_WIDTH = 827;
const CARD_HEIGHT = 1417;
const HEADER_HEIGHT = 90;
const FOOTER_HEIGHT = 40;
const PORTRAIT_HEIGHT = 827;
const BODY_HEIGHT = CARD_HEIGHT - HEADER_HEIGHT - PORTRAIT_HEIGHT - FOOTER_HEIGHT;
const PADDING = 40;

const CATEGORY_COLORS = {
  npc: { accent: '#8B4513', light: '#D2691E' },
  location: { accent: '#2E8B57', light: '#3CB371' },
  item: { accent: '#4169E1', light: '#6495ED' },
};

const CATEGORY_ICONS = {
  npc: '<circle cx="12" cy="8" r="5"/><path d="M4 22c0-6 4-9 8-9s8 3 8 9"/>',
  location: '<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>',
  item: '<path d="M12 2L4 7v6l8 5 8-5V7l-8-5zm0 2.5L17 8l-5 3-5-3 5-3.5zM6 9.3l5 3v5.4l-5-3.1V9.3zm12 5.3l-5 3.1v-5.4l5-3v5.3z"/>',
};

function escapeXml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
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

async function renderCard(card, portraitPath, outputPath) {
  const colors = CATEGORY_COLORS[card.category] || CATEGORY_COLORS.npc;
  const icon = CATEGORY_ICONS[card.category] || CATEGORY_ICONS.npc;
  const fontSize = 28;
  const lineHeight = 36;
  const maxChars = 46;

  const bgSvg = `<svg width="${CARD_WIDTH}" height="${CARD_HEIGHT}">
    <defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f4e4c1"/>
      <stop offset="100%" style="stop-color:#e8d4a8"/>
    </linearGradient></defs>
    <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="url(#bg)"/>
  </svg>`;

  const headerSvg = `<svg width="${CARD_WIDTH}" height="${HEADER_HEIGHT}">
    <defs><linearGradient id="hg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${colors.accent}"/>
      <stop offset="100%" style="stop-color:${colors.light}"/>
    </linearGradient></defs>
    <rect width="${CARD_WIDTH}" height="${HEADER_HEIGHT}" fill="url(#hg)"/>
    <g transform="translate(24, ${(HEADER_HEIGHT-32)/2}) scale(${32/24})" fill="rgba(255,255,255,0.7)">${icon}</g>
    <g transform="translate(${CARD_WIDTH-56}, ${(HEADER_HEIGHT-32)/2}) scale(${32/24})" fill="rgba(255,255,255,0.7)">${icon}</g>
    <text x="${CARD_WIDTH/2}" y="${HEADER_HEIGHT/2+18}" font-family="serif" font-size="52" font-weight="bold"
          fill="#f4e4c1" text-anchor="middle">${escapeXml(card.name)}</text>
  </svg>`;

  const descLines = wordWrap(escapeXml(card.description), maxChars);
  const linesUsed = descLines.length;
  const linesAvailable = Math.floor((BODY_HEIGHT - 44) / lineHeight);

  const descText = descLines.map((line, i) =>
    `<text x="${PADDING}" y="${44 + i * lineHeight}" font-family="serif" font-size="${fontSize}" fill="#2a2016">${line}</text>`
  ).join('\n');
  const bodySvg = `<svg width="${CARD_WIDTH}" height="${BODY_HEIGHT}">${descText}</svg>`;

  const footerSvg = `<svg width="${CARD_WIDTH}" height="${FOOTER_HEIGHT}">
    <rect width="${CARD_WIDTH}" height="${FOOTER_HEIGHT}" fill="#e8d4a8"/>
    <line x1="0" y1="0" x2="${CARD_WIDTH}" y2="0" stroke="#c4a882" stroke-width="2"/>
    <text x="${CARD_WIDTH/2}" y="${FOOTER_HEIGHT/2+7}" font-family="serif" font-size="22" fill="#5a4a36"
          text-anchor="middle">${escapeXml(card.footer)}</text>
  </svg>`;

  let portraitBuffer;
  if (fs.existsSync(portraitPath)) {
    portraitBuffer = await sharp(portraitPath)
      .resize(CARD_WIDTH, PORTRAIT_HEIGHT, { fit: 'cover' })
      .toBuffer();
  } else {
    // Placeholder
    const placeholderSvg = `<svg width="${CARD_WIDTH}" height="${PORTRAIT_HEIGHT}">
      <rect width="${CARD_WIDTH}" height="${PORTRAIT_HEIGHT}" fill="${colors.accent}" opacity="0.2"/>
      <text x="${CARD_WIDTH/2}" y="${PORTRAIT_HEIGHT/2}" font-family="serif" font-size="32" fill="#5a4a36"
            text-anchor="middle">[${card.category} image]</text>
    </svg>`;
    portraitBuffer = await sharp(Buffer.from(placeholderSvg)).png().toBuffer();
  }

  const bg = await sharp(Buffer.from(bgSvg)).png().toBuffer();
  const header = await sharp(Buffer.from(headerSvg)).png().toBuffer();
  const body = await sharp(Buffer.from(bodySvg)).png().toBuffer();
  const footer = await sharp(Buffer.from(footerSvg)).png().toBuffer();

  await sharp(bg)
    .composite([
      { input: header, top: 0, left: 0 },
      { input: portraitBuffer, top: HEADER_HEIGHT, left: 0 },
      { input: body, top: HEADER_HEIGHT + PORTRAIT_HEIGHT, left: 0 },
      { input: footer, top: CARD_HEIGHT - FOOTER_HEIGHT, left: 0 }
    ])
    .png().toFile(outputPath);

  return { linesUsed, linesAvailable, descLength: card.description.length };
}

async function main() {
  const outDir = process.argv[2] || 'campaigns/example/cards/layout-test';
  fs.mkdirSync(outDir, { recursive: true });

  // Test cases covering different content lengths and categories
  const testCases = [
    {
      id: 'npc-short',
      card: {
        name: "Brix",
        description: "A quiet halfling barmaid. Observant.",
        footer: "The Rusty Anchor",
        category: "npc"
      }
    },
    {
      id: 'npc-medium',
      card: {
        name: "Grimble Thornwick",
        description: "A tinkering gnome inventor with perpetually soot-stained fingers and an infectious enthusiasm for clockwork contraptions. His workshop is legendary for both its ingenious devices and occasional explosions.",
        footer: "Thornwick's Emporium",
        category: "npc"
      }
    },
    {
      id: 'npc-long',
      card: {
        name: "Lord Aldric Vance",
        description: "The Duke of Westmarch, a calculating politician whose warm smile conceals ruthless ambition. He rose from minor nobility through strategic marriages and convenient deaths. Now controls the grain trade across three provinces. Secretly funds the Thieves' Guild in exchange for information. His wife suspects nothing, but his eldest son has begun asking questions. Weaknesses: pride, his daughter, aged Dwarven whiskey.",
        footer: "Vance Manor, Westmarch",
        category: "npc"
      }
    },
    {
      id: 'location-short',
      card: {
        name: "The Rusty Anchor",
        description: "A dockside tavern. Cheap ale, cheaper rooms.",
        footer: "Harbor District",
        category: "location"
      }
    },
    {
      id: 'location-long',
      card: {
        name: "The Whispering Archives",
        description: "An ancient library built into a hollowed mountain. The stacks extend for miles into the darkness, organized by a cataloging system no living scholar understands. Magical silence pervades most sections, but in the deepest vaults, visitors report hearing whispered conversations in dead languages. The head librarian is a lich who traded his phylactery for complete knowledge of the collection.",
        footer: "Northern Peaks",
        category: "location"
      }
    },
    {
      id: 'item-medium',
      card: {
        name: "Blade of the Fallen Star",
        description: "A longsword forged from meteoric iron, its edge perpetually cold to the touch. Glows faintly blue in the presence of undead. Once belonged to a paladin who fell defending a village from a vampire lord. The blade remembers.",
        footer: "Rare, requires attunement",
        category: "item"
      }
    },
    {
      id: 'npc-long-name',
      card: {
        name: "Bartholomew Fitzgerald III",
        description: "A pompous merchant prince who insists on his full title at all times.",
        footer: "Fitzgerald Trading Company",
        category: "npc"
      }
    },
  ];

  const results = [];
  const portraitPath = path.join(outDir, '../tarot-sample/portrait.png'); // Reuse existing portrait

  for (const test of testCases) {
    const outPath = path.join(outDir, `test-${test.id}.png`);
    const stats = await renderCard(test.card, portraitPath, outPath);
    results.push({ ...test, ...stats });
    console.log(`${test.id}: ${stats.linesUsed}/${stats.linesAvailable} lines (${stats.descLength} chars)`);
  }

  // Check for issues
  const issues = results.filter(r => r.linesUsed > r.linesAvailable);
  if (issues.length > 0) {
    console.log('\n⚠️  TEXT OVERFLOW:');
    issues.forEach(i => console.log(`  ${i.id}: ${i.linesUsed} lines needed, only ${i.linesAvailable} available`));
  } else {
    console.log('\n✓ All test cases fit within available space');
  }

  // Write summary
  let md = `# Layout Test Results

Testing tarot layout (${CARD_WIDTH}×${CARD_HEIGHT}px) with varied content.

**Layout specs:**
- Header: ${HEADER_HEIGHT}px
- Portrait: ${PORTRAIT_HEIGHT}px
- Body: ${BODY_HEIGHT}px (${Math.floor((BODY_HEIGHT - 44) / 36)} lines max)
- Footer: ${FOOTER_HEIGHT}px

## Test Results

| Test | Category | Chars | Lines Used | Status |
|------|----------|-------|------------|--------|
${results.map(r => `| ${r.id} | ${r.card.category} | ${r.descLength} | ${r.linesUsed}/${r.linesAvailable} | ${r.linesUsed <= r.linesAvailable ? '✓' : '⚠️ OVERFLOW'} |`).join('\n')}

## Sample Cards

${results.map(r => `### ${r.card.name} (${r.id})
![${r.id}](test-${r.id}.png)
`).join('\n')}
`;

  fs.writeFileSync(path.join(outDir, 'LAYOUT-TEST.md'), md);
  console.log('\nWrote LAYOUT-TEST.md');
}

main().catch(console.error);

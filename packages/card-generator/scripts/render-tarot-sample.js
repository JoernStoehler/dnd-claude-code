#!/usr/bin/env node
/**
 * Render a tarot-sized card sample with ink wash style
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Tarot size at 300dpi: 70mm × 120mm = 827 × 1417px
const CARD_WIDTH = 827;
const CARD_HEIGHT = 1417;
const HEADER_HEIGHT = 90;
const FOOTER_HEIGHT = 40;
const PORTRAIT_HEIGHT = 827; // Square image, no crop
const BODY_HEIGHT = CARD_HEIGHT - HEADER_HEIGHT - PORTRAIT_HEIGHT - FOOTER_HEIGHT; // 460px
const PADDING = 40;

const COLORS = { accent: '#8B4513', light: '#D2691E' };
const ICON = '<circle cx="12" cy="8" r="5"/><path d="M4 22c0-6 4-9 8-9s8 3 8 9"/>';

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

async function generatePortrait(outPath, prompt) {
  const apiKey = process.env.FAL_KEY;
  if (!apiKey) {
    console.error('FAL_KEY not set');
    process.exit(1);
  }

  const payload = JSON.stringify({
    prompt: prompt,
    image_size: 'square', // 1024x1024, scales to 827x827 with no crop
    num_images: 1
  });

  console.log('Generating portrait...');
  const curlCmd = `curl -s -X POST "https://fal.run/fal-ai/flux/dev" \
    -H "Authorization: Key ${apiKey}" \
    -H "Content-Type: application/json" \
    -d '${payload.replace(/'/g, "'\\''")}'`;

  const resultStr = execSync(curlCmd, { encoding: 'utf-8', timeout: 120000 });
  const result = JSON.parse(resultStr);

  if (!result.images?.[0]?.url) {
    console.error('No image URL in response');
    process.exit(1);
  }

  execSync(`curl -s -o "${outPath}" "${result.images[0].url}"`, { timeout: 60000 });
  console.log(`Portrait saved: ${outPath}`);
}

async function renderCard(portraitPath, outputPath, card) {
  const fontSize = 28;
  const lineHeight = 36;
  const maxChars = 46;
  const linesAvailable = Math.floor((BODY_HEIGHT - 40) / lineHeight);

  console.log(`Card: ${CARD_WIDTH}×${CARD_HEIGHT}px`);
  console.log(`Portrait: ${PORTRAIT_HEIGHT}px (square, 0% crop)`);
  console.log(`Body: ${BODY_HEIGHT}px (${linesAvailable} lines @ ${fontSize}px)`);

  const bgSvg = `<svg width="${CARD_WIDTH}" height="${CARD_HEIGHT}">
    <defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f4e4c1"/>
      <stop offset="100%" style="stop-color:#e8d4a8"/>
    </linearGradient></defs>
    <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="url(#bg)"/>
  </svg>`;

  const headerSvg = `<svg width="${CARD_WIDTH}" height="${HEADER_HEIGHT}">
    <defs><linearGradient id="hg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${COLORS.accent}"/>
      <stop offset="100%" style="stop-color:${COLORS.light}"/>
    </linearGradient></defs>
    <rect width="${CARD_WIDTH}" height="${HEADER_HEIGHT}" fill="url(#hg)"/>
    <g transform="translate(24, ${(HEADER_HEIGHT-32)/2}) scale(${32/24})" fill="rgba(255,255,255,0.7)">${ICON}</g>
    <g transform="translate(${CARD_WIDTH-56}, ${(HEADER_HEIGHT-32)/2}) scale(${32/24})" fill="rgba(255,255,255,0.7)">${ICON}</g>
    <text x="${CARD_WIDTH/2}" y="${HEADER_HEIGHT/2+18}" font-family="serif" font-size="52" font-weight="bold"
          fill="#f4e4c1" text-anchor="middle">${escapeXml(card.name)}</text>
  </svg>`;

  const descLines = wordWrap(escapeXml(card.description), maxChars);
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

  const portraitBuffer = await sharp(portraitPath)
    .resize(CARD_WIDTH, PORTRAIT_HEIGHT, { fit: 'cover' })
    .toBuffer();

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

  console.log(`Card saved: ${outputPath}`);
}

async function main() {
  const outDir = process.argv[2] || 'campaigns/example/cards/npc/tarot-sample';
  fs.mkdirSync(outDir, { recursive: true });

  const card = {
    name: "Grimble Thornwick",
    description: "A tinkering gnome inventor with perpetually soot-stained fingers and an infectious enthusiasm for clockwork contraptions. His workshop is legendary for both its ingenious devices and occasional explosions. Villagers seek him for repairs but keep their distance during experiments.",
    footer: "Thornwick's Emporium"
  };

  const prompt = "head and shoulders portrait, centered composition, facing slightly left, gnome inventor with brass goggles, wild white hair, soot-stained cheeks, cheerful expression, ink drawing with watercolor wash, pen and ink linework, warm workshop lighting";

  const portraitPath = path.join(outDir, 'portrait.png');
  const cardPath = path.join(outDir, 'card-tarot-inkwash.png');

  await generatePortrait(portraitPath, prompt);
  await renderCard(portraitPath, cardPath, card);

  // Write info file
  const info = `# Tarot Size Sample

**Card:** ${CARD_WIDTH}×${CARD_HEIGHT}px (70×120mm at 300dpi)
**Portrait:** ${PORTRAIT_HEIGHT}px (square image, 0% crop)
**Body:** ${BODY_HEIGHT}px (${Math.floor((BODY_HEIGHT - 40) / 36)} lines @ 28px)
**Style:** Ink wash

![Card](card-tarot-inkwash.png)

## Prompt Used
\`\`\`
${prompt}
\`\`\`
`;
  fs.writeFileSync(path.join(outDir, 'SAMPLE.md'), info);
  console.log('\nWrote SAMPLE.md');
}

main().catch(console.error);

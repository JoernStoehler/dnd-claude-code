#!/usr/bin/env node
/**
 * Quick render of Path A vs Path B comparison
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const PADDING = 36;

const CATEGORY_COLORS = { npc: { accent: '#8B4513', light: '#D2691E', dark: '#5D2E0C' } };
const CATEGORY_ICONS = { npc: '<circle cx="12" cy="8" r="5"/><path d="M4 22c0-6 4-9 8-9s8 3 8 9"/>' };

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

async function renderCard(config, card, portraitPath, outputPath) {
  const { cardWidth, cardHeight, portraitHeight, headerHeight, footerHeight } = config;
  const colors = CATEGORY_COLORS.npc;
  const bodyHeight = cardHeight - headerHeight - portraitHeight - footerHeight;

  const bgSvg = `
    <svg width="${cardWidth}" height="${cardHeight}">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#f4e4c1"/>
          <stop offset="100%" style="stop-color:#e8d4a8"/>
        </linearGradient>
      </defs>
      <rect width="${cardWidth}" height="${cardHeight}" fill="url(#bg)"/>
    </svg>
  `;

  const icon = CATEGORY_ICONS.npc;
  const headerSvg = `
    <svg width="${cardWidth}" height="${headerHeight}">
      <defs>
        <linearGradient id="hg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${colors.accent}"/>
          <stop offset="100%" style="stop-color:${colors.light}"/>
        </linearGradient>
      </defs>
      <rect width="${cardWidth}" height="${headerHeight}" fill="url(#hg)"/>
      <g transform="translate(20, ${(headerHeight - 28) / 2}) scale(${28/24})" fill="rgba(255,255,255,0.7)">${icon}</g>
      <g transform="translate(${cardWidth - 48}, ${(headerHeight - 28) / 2}) scale(${28/24})" fill="rgba(255,255,255,0.7)">${icon}</g>
      <text x="${cardWidth/2}" y="${headerHeight/2 + 16}" font-family="serif" font-size="48" font-weight="bold"
            fill="#f4e4c1" text-anchor="middle">${escapeXml(card.name)}</text>
    </svg>
  `;

  const descLines = wordWrap(escapeXml(card.description || ''), 42);
  const descText = descLines.map((line, i) =>
    `<text x="${PADDING}" y="${40 + i * 34}" font-family="serif" font-size="28" fill="#2a2016">${line}</text>`
  ).join('\n');
  const bodySvg = `<svg width="${cardWidth}" height="${bodyHeight}">${descText}</svg>`;

  const footerSvg = `
    <svg width="${cardWidth}" height="${footerHeight}">
      <rect width="${cardWidth}" height="${footerHeight}" fill="#e8d4a8"/>
      <line x1="0" y1="0" x2="${cardWidth}" y2="0" stroke="#c4a882" stroke-width="2"/>
      <text x="${cardWidth/2}" y="${footerHeight/2 + 6}" font-family="serif" font-size="20" fill="#5a4a36"
            text-anchor="middle">${escapeXml(card.footer || '')}</text>
    </svg>
  `;

  const portraitBuffer = await sharp(portraitPath)
    .resize(cardWidth, portraitHeight, { fit: 'cover' })
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

  console.log(`Rendered: ${outputPath} (${cardWidth}×${cardHeight}, body=${bodyHeight}px)`);
}

async function main() {
  const baseDir = process.argv[2] || '.';
  const portraitPath = path.join(baseDir, 'portrait.png');

  const card = {
    name: "Grimble Thornwick",
    description: "A tinkering gnome inventor with perpetually soot-stained fingers and an infectious enthusiasm for clockwork contraptions. His workshop is legendary for both its ingenious devices and occasional explosions.",
    footer: "Thornwick's Emporium"
  };

  const shortCard = {
    ...card,
    description: "A tinkering gnome inventor with perpetually soot-stained fingers and an infectious enthusiasm for clockwork."
  };

  // Path A: Poker (750×1050), short description
  await renderCard({
    cardWidth: 750, cardHeight: 1050,
    portraitHeight: 750, headerHeight: 80, footerHeight: 36
  }, shortCard, portraitPath, path.join(baseDir, 'path-A-poker-short.png'));

  // Path B: Taller (750×1110), full description
  await renderCard({
    cardWidth: 750, cardHeight: 1110,
    portraitHeight: 750, headerHeight: 80, footerHeight: 36
  }, card, portraitPath, path.join(baseDir, 'path-B-tall-full.png'));

  console.log('Done!');
}

main().catch(console.error);

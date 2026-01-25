#!/usr/bin/env node
/**
 * Compare edge-to-edge portrait vs bordered portrait
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const CARD_WIDTH = 827;
const CARD_HEIGHT = 1417;
const HEADER_HEIGHT = 90;
const FOOTER_HEIGHT = 40;
const PORTRAIT_HEIGHT = 827;
const BODY_HEIGHT = CARD_HEIGHT - HEADER_HEIGHT - PORTRAIT_HEIGHT - FOOTER_HEIGHT;
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

async function renderCard(portraitPath, outputPath, card, borderWidth = 0) {
  const fontSize = 28;
  const lineHeight = 36;
  const maxChars = 46;

  // Portrait area with optional border
  const portraitAreaWidth = CARD_WIDTH - borderWidth * 2;
  const portraitAreaHeight = PORTRAIT_HEIGHT - borderWidth * 2;

  const bgSvg = `<svg width="${CARD_WIDTH}" height="${CARD_HEIGHT}">
    <defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f4e4c1"/>
      <stop offset="100%" style="stop-color:#e8d4a8"/>
    </linearGradient></defs>
    <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="url(#bg)"/>
    ${borderWidth > 0 ? `
    <defs><linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${COLORS.accent}"/>
      <stop offset="100%" style="stop-color:${COLORS.light}"/>
    </linearGradient></defs>
    <rect x="0" y="${HEADER_HEIGHT}" width="${CARD_WIDTH}" height="${PORTRAIT_HEIGHT}" fill="url(#borderGrad)"/>
    ` : ''}
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
    .resize(portraitAreaWidth, portraitAreaHeight, { fit: 'cover' })
    .toBuffer();

  const bg = await sharp(Buffer.from(bgSvg)).png().toBuffer();
  const header = await sharp(Buffer.from(headerSvg)).png().toBuffer();
  const body = await sharp(Buffer.from(bodySvg)).png().toBuffer();
  const footer = await sharp(Buffer.from(footerSvg)).png().toBuffer();

  await sharp(bg)
    .composite([
      { input: header, top: 0, left: 0 },
      { input: portraitBuffer, top: HEADER_HEIGHT + borderWidth, left: borderWidth },
      { input: body, top: HEADER_HEIGHT + PORTRAIT_HEIGHT, left: 0 },
      { input: footer, top: CARD_HEIGHT - FOOTER_HEIGHT, left: 0 }
    ])
    .png().toFile(outputPath);
}

async function main() {
  const outDir = 'campaigns/example/cards/exploration';
  const portraitPath = path.join(outDir, 'portrait.png');

  const card = {
    name: "Grimble Thornwick",
    description: "A tinkering gnome inventor with perpetually soot-stained fingers and an infectious enthusiasm for clockwork contraptions.",
    footer: "Thornwick's Emporium"
  };

  // Edge-to-edge (current)
  await renderCard(portraitPath, path.join(outDir, 'border-none.png'), card, 0);
  console.log('Rendered: border-none.png (edge-to-edge)');

  // With border
  await renderCard(portraitPath, path.join(outDir, 'border-20px.png'), card, 20);
  console.log('Rendered: border-20px.png (20px category border)');

  await renderCard(portraitPath, path.join(outDir, 'border-40px.png'), card, 40);
  console.log('Rendered: border-40px.png (40px category border)');
}

main().catch(console.error);

#!/usr/bin/env node
/**
 * Render a card PNG from a JSON definition.
 *
 * Usage:
 *   node render-card.js <card.json> <output.png> [--portrait=PATH] [--texture=PATH]
 *
 * If --portrait/--texture are not given, looks for portrait.png/texture.png
 * next to the card JSON file.
 */

const fs = require('fs');
const path = require('path');
const { renderCard } = require('../lib/render-card');

const args = process.argv.slice(2);
const positional = args.filter(a => !a.startsWith('--'));
const flags = Object.fromEntries(
  args.filter(a => a.startsWith('--'))
    .map(a => a.slice(2).split('='))
    .map(([k, v]) => [k, v ?? true])
);

if (positional.length < 2) {
  console.log(`
render-card.js - Render card PNG from JSON definition

Usage:
  node render-card.js <card.json> <output.png> [options]

Options:
  --portrait=PATH   Path to portrait image (default: portrait.png next to card.json)
  --texture=PATH    Path to texture image (default: texture.png next to card.json)

Card JSON fields:
  category     npc | location | item | faction | quest | mystery
  name         Display name (auto-sized, wraps to 2 lines if needed)
  description  Player-facing text (2-4 sentences)
  footer       Location or context label

Example:
  node render-card.js cards/npc/grimble/card.json cards/npc/grimble/card.png
`);
  process.exit(0);
}

const cardPath = positional[0];
const outputPath = positional[1];
const cardDir = path.dirname(path.resolve(cardPath));

const card = JSON.parse(fs.readFileSync(cardPath, 'utf8'));
const portraitFromJson = card.portrait ? path.resolve(cardDir, card.portrait) : null;
const portraitPath = flags.portrait || portraitFromJson || path.join(cardDir, 'portrait.png');
const texturePath = flags.texture || path.join(cardDir, 'texture.png');

renderCard({
  card: {
    name: card.name,
    description: card.description,
    footer: card.footer || '',
    category: card.category || 'npc'
  },
  portraitPath: path.resolve(portraitPath),
  texturePath: path.resolve(texturePath),
  outputPath: path.resolve(outputPath)
}).then(() => {
  console.log(`Rendered: ${outputPath}`);
}).catch(err => {
  console.error(`Render failed: ${err.message}`);
  process.exit(1);
});

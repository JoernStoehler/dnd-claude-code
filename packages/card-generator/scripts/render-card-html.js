#!/usr/bin/env node
/**
 * render-card-html.js - Generate HTML from card JSON definition
 *
 * Usage:
 *   node render-card-html.js <card.json> [output.html]
 *   node render-card-html.js card.json card.html
 *
 * Takes a card definition JSON and generates a standalone HTML file
 * that can be opened in a browser or rendered to PNG via playwright.
 */

const fs = require('fs');
const path = require('path');

const CATEGORY_COLORS = {
  npc: { accent: '#8B4513', light: '#D2691E' },
  location: { accent: '#2E8B57', light: '#3CB371' },
  item: { accent: '#4169E1', light: '#6495ED' },
  faction: { accent: '#8B008B', light: '#BA55D3' },
  quest: { accent: '#B8860B', light: '#DAA520' }
};

function generateCardHtml(card, portraitPath) {
  const colors = CATEGORY_COLORS[card.category] || CATEGORY_COLORS.npc;
  const details = card.details || {};
  const detailsHtml = Object.entries(details)
    .map(([k, v]) => `<dt>${escapeHtml(k)}:</dt> <dd>${escapeHtml(v)}</dd>`)
    .join('\n          ');

  // Resolve portrait path relative to output HTML
  const portrait = portraitPath || card.portrait || '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(card.name)}</title>
  <style>
    body {
      margin: 0;
      padding: 20px;
      background: transparent;
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    }

    .card {
      width: 250px;
      height: 350px;
      border-radius: 12px;
      overflow: hidden;
      background: #1a1a1a;
      box-shadow: 0 4px 20px rgba(0,0,0,0.5);
      display: flex;
      flex-direction: column;
    }

    .card-header {
      background: linear-gradient(135deg, ${colors.accent} 0%, ${colors.light} 100%);
      padding: 8px 12px;
      text-align: center;
    }

    .card-category {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: rgba(255,255,255,0.8);
      margin-bottom: 2px;
    }

    .card-name {
      font-size: 15px;
      font-weight: bold;
      color: white;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
      margin: 0;
      line-height: 1.2;
    }

    .card-portrait {
      width: 100%;
      height: 160px;
      object-fit: cover;
      display: block;
      background: ${colors.accent};
    }

    .card-portrait-placeholder {
      width: 100%;
      height: 160px;
      background: linear-gradient(135deg, ${colors.accent}44 0%, ${colors.light}44 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #666;
      font-size: 11px;
    }

    .card-body {
      padding: 10px 12px;
      color: #e0e0e0;
      font-size: 11px;
      line-height: 1.4;
      flex-grow: 1;
      display: flex;
      flex-direction: column;
    }

    .card-description {
      margin: 0 0 8px 0;
    }

    .card-details {
      font-size: 10px;
      color: #aaa;
      border-top: 1px solid #444;
      padding-top: 8px;
      margin-top: auto;
    }

    .card-details dt {
      font-weight: bold;
      color: ${colors.light};
      display: inline;
    }

    .card-details dd {
      display: inline;
      margin: 0;
    }

    .card-details dd::after {
      content: "";
      display: block;
      margin-bottom: 4px;
    }

    .card-footer {
      background: #111;
      padding: 6px 12px;
      font-size: 9px;
      color: #666;
      text-align: center;
      border-top: 1px solid #333;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="card-header">
      <div class="card-category">${escapeHtml(card.category)}</div>
      <h2 class="card-name">${escapeHtml(card.name)}</h2>
    </div>
    ${portrait
      ? `<img class="card-portrait" src="${escapeHtml(portrait)}" alt="Portrait">`
      : `<div class="card-portrait-placeholder">[No portrait]</div>`
    }
    <div class="card-body">
      <p class="card-description">${escapeHtml(card.description)}</p>
      ${Object.keys(details).length > 0 ? `
      <dl class="card-details">
        ${detailsHtml}
      </dl>` : ''}
    </div>
    ${card.footer ? `<div class="card-footer">${escapeHtml(card.footer)}</div>` : ''}
  </div>
</body>
</html>`;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// CLI
const args = process.argv.slice(2);
const positional = args.filter(a => !a.startsWith('--'));
const flags = Object.fromEntries(
  args.filter(a => a.startsWith('--'))
    .map(a => a.slice(2).split('='))
    .map(([k, v]) => [k, v ?? true])
);

if (positional.length < 1) {
  console.log(`
render-card-html.js - Generate HTML from card JSON

Usage:
  node render-card-html.js <card.json> [output.html]

Options:
  --portrait=PATH    Override portrait path in JSON

Examples:
  node render-card-html.js card.json                    # Outputs to stdout
  node render-card-html.js card.json card.html          # Writes to file
  node render-card-html.js card.json --portrait=v2.png  # Use different portrait
`);
  process.exit(0);
}

const inputPath = positional[0];
const outputPath = positional[1];

if (!fs.existsSync(inputPath)) {
  console.error(`Input file not found: ${inputPath}`);
  process.exit(1);
}

const card = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
const html = generateCardHtml(card, flags.portrait);

if (outputPath) {
  fs.writeFileSync(outputPath, html);
  console.log(`Generated: ${outputPath}`);
} else {
  console.log(html);
}

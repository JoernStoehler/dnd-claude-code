# Card Generator

Generates tarot-sized (70x120mm) player-facing reference cards for a TTRPG campaign.

Cards have a category-specific texture background, a portrait image, title, description text, and footer with category icons.

## Quick Start

```bash
cd packages/card-generator
npm install

# Generate placeholder images for layout testing
node scripts/generate-portrait.js portrait.png
node scripts/generate-texture.js texture.png

# Render a card
node scripts/render-card.js card.json card.png --portrait=portrait.png --texture=texture.png
```

For real images, set `FAL_KEY` and provide a prompt:

```bash
export FAL_KEY="..."  # https://fal.ai/dashboard/keys
node scripts/generate-portrait.js portrait.png "gnome inventor, ink wash style"
node scripts/generate-texture.js texture.png "brown leather surface, warm cognac tones, 8k detail"
```

## Card JSON

```json
{
  "category": "npc",
  "name": "Grimble Thornwick",
  "description": "A tinkering gnome inventor with soot-stained fingers.",
  "footer": "Thornwick's Emporium"
}
```

Categories: `npc`, `location`, `item`, `faction`, `quest`, `mystery`

## Design

See [DESIGN-SPEC.md](DESIGN-SPEC.md) for layout details and design rationale.

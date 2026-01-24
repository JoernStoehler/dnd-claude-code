# Card Generator (Experimental)

**Status: Exploratory prototypes** - throwaway code for figuring out the workflow.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `FAL_KEY` | For API images | fal.ai API key ([get one here](https://fal.ai/dashboard/keys)) |

## Scripts

Single-purpose tools, run manually in sequence:

```bash
# 1. Generate portrait (dummy solid color for testing)
node scripts/generate-portrait.js portrait.png --category=npc

# 2. Render card PNG from JSON definition (recommended - no browser needed)
node scripts/render-card-sharp.js card.json card.png
```

### generate-portrait.js
Creates portrait images. Currently generates solid-color dummies for testing.
Future: add `--api` flag to call fal.ai.

```bash
node scripts/generate-portrait.js output.png --category=npc    # brown
node scripts/generate-portrait.js output.png --color=#ff0000   # red
```

### render-card-sharp.js (recommended)
Renders card PNG directly using sharp. No browser needed - works in any Node environment.
Includes textured backgrounds, serif fonts, and category color schemes.

```bash
node scripts/render-card-sharp.js card.json card.png
```

### render-card-html.js + render-card.js (alternative)
HTML-based rendering via Playwright. More flexible styling but requires Chrome.

```bash
node scripts/render-card-html.js card.json card.html
node scripts/render-card.js card.html card.png   # needs Chrome
```

## Card JSON Schema

See `schemas/card.schema.json` for the full schema. Example:

```json
{
  "category": "npc",
  "name": "Sir Tinkelstein of Gnomewood",
  "description": "A fastidious gnome knight who speaks in overly formal declarations.",
  "details": {
    "Location": "The Gilded Gear tavern",
    "Wants": "To prove gnomes can be proper knights"
  },
  "footer": "Sundale Campaign",
  "portrait": "portrait.png",
  "image_prompt": "Portrait of a gnome knight, dignified expression..."
}
```

## Example Output

See `campaigns/example/cards/npc/sir-tinkelstein/` for a complete example with 4 variants and a REVIEW.md for GitHub review workflow.

## Decisions Made

- **Card size**: Poker (2.5" × 3.5" / 750×1050px @300dpi)
- **Output format**: PNG
- **Backside**: Not needed (front only)
- **Image generation**: Flux via fal.ai
- **Renderer**: sharp-based (no browser dependency)

## Folder Structure

```
campaigns/<campaign>/cards/
├── npc/
│   └── sir-tinkelstein/
│       ├── v1.json, v2.json, ...   # Variant definitions
│       ├── v1-portrait.png, ...    # Portrait images
│       ├── v1.png, v2.png, ...     # Rendered cards
│       └── REVIEW.md               # For PR review
├── location/
└── item/
```

## PR Review Workflow

See `campaigns/example/cards/npc/sir-tinkelstein/REVIEW.md` for the markdown format.

## fal.ai Setup

1. Create account at https://fal.ai
2. Get API key: https://fal.ai/dashboard/keys
3. `export FAL_KEY="your-api-key"`

**Quickstart**: https://docs.fal.ai/model-apis/quickstart

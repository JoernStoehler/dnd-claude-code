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

# 2. Create card HTML from JSON definition
node scripts/render-card-html.js card.json card.html --portrait=portrait.png

# 3. Render HTML to PNG (requires Chrome/Playwright environment)
node scripts/render-card.js card.html card.png
```

### generate-portrait.js
Creates portrait images. Currently generates solid-color dummies for testing.
Future: add `--api` flag to call fal.ai.

```bash
node scripts/generate-portrait.js output.png --category=npc    # brown
node scripts/generate-portrait.js output.png --color=#ff0000   # red
```

### render-card-html.js
Generates standalone HTML from a card JSON definition.

```bash
node scripts/render-card-html.js schemas/card.example.json card.html
```

### render-card.js
Renders HTML to PNG via Playwright. **Requires Chrome environment** (fails in restricted sandboxes).

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

## Decisions Made

- **Card size**: Poker (2.5" × 3.5" / 750×1050px @300dpi)
- **Output format**: PNG
- **Backside**: Not needed (front only)
- **Image generation**: Flux via fal.ai

## Folder Structure (proposed)

```
campaigns/<campaign>/cards/
├── npc/
│   └── sir-tinkelstein/
│       ├── card.json          # Definition
│       ├── portrait.png       # Generated portrait
│       ├── card.html          # Rendered HTML (intermediate)
│       ├── card.png           # Final card image
│       └── REVIEW.md          # For PR review with variants
├── location/
└── item/
```

## PR Review Workflow

See `prototypes/example-review.md` for the markdown format used in PRs.

## fal.ai Setup

1. Create account at https://fal.ai
2. Get API key: https://fal.ai/dashboard/keys
3. `export FAL_KEY="your-api-key"`

**Quickstart**: https://docs.fal.ai/model-apis/quickstart

## Known Limitations

- `render-card.js` needs proper Chrome/Playwright environment (crashes in restricted sandboxes)
- Portrait API integration not yet implemented (uses dummy colors)

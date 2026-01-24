# Card Generator (Experimental)

**Status: Exploratory prototypes** - throwaway code for figuring out the workflow.

## Environment Variables

```bash
export FAL_KEY="..."       # fal.ai API key for Flux portraits: https://fal.ai/dashboard/keys
export GITHUB_TOKEN="..."  # (optional) GitHub PAT for PR automation: https://github.com/settings/tokens
```

## Scripts

Single-purpose tools, run manually in sequence:

```bash
# 1. Generate portrait (Flux standard size)
node scripts/generate-portrait.js portrait.png --size=portrait_4_3 --category=npc

# 2. Render card PNG from JSON definition
node scripts/render-card-sharp.js card.json card.png --style=dark
```

### generate-portrait.js

Creates portrait images using [Flux standard sizes](https://fal.ai/models/fal-ai/flux/dev/api).

```bash
node scripts/generate-portrait.js output.png --size=portrait_4_3 --category=npc
node scripts/generate-portrait.js output.png --prompt="gnome knight" --api  # requires FAL_KEY
```

**Size presets (Flux standard):**
| Preset | Dimensions | Use case |
|--------|------------|----------|
| `portrait_4_3` | 768x1024 | **Recommended for cards** |
| `portrait_16_9` | 576x1024 | Taller/narrower |
| `square` | 1024x1024 | Square images |
| `landscape_4_3` | 1024x768 | Location cards? |
| `landscape_16_9` | 1024x576 | Wide scenes |

### render-card-sharp.js

Renders card PNG directly using sharp. No browser needed.

```bash
node scripts/render-card-sharp.js card.json card.png --style=dark
```

**Layout styles:**
| Style | Description |
|-------|-------------|
| `dark` | Dark textured background, light text (default) |
| `parchment` | Aged paper look, dark text |
| `minimal` | Clean white background, no texture |
| `compact` | Smaller portrait (320px), more room for text |
| `framed` | Portrait with decorative border/margin (not full-width) |

## Card JSON Schema

See `schemas/card.schema.json`. Cards are **player-facing** (no secrets/hooks).

```json
{
  "category": "npc",
  "name": "Sir Tinkelstein of Gnomewood",
  "description": "A fastidious gnome knight in oversized armor. You met him at the Gilded Gear tavern.",
  "footer": "Campaign Name",
  "portrait": "portrait.png",
  "image_prompt": "Portrait of a gnome knight, dignified expression..."
}
```

## Folder Structure

```
campaigns/<campaign>/cards/
├── npc/
│   └── sir-tinkelstein/
│       ├── card.json             # Definition (or v1.json, v2.json for variants)
│       ├── portrait.png          # AI-generated portrait (768x1024)
│       ├── card.png              # Final rendered card (750x1050)
│       └── REVIEW.md             # For PR review
├── location/
└── item/
```

## Example Output

- **Text variants**: `campaigns/example/cards/npc/sir-tinkelstein/`
- **Layout styles**: `campaigns/example/cards/npc/sir-tinkelstein-layouts/`

## PR Review Workflow

See `campaigns/example/cards/npc/sir-tinkelstein/REVIEW.md` for the markdown format.

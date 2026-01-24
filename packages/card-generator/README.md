# Card Generator (Experimental)

**Status: Exploratory prototypes** - throwaway code for figuring out the workflow.

## Environment Variables

| Variable | Required | Description | Setup Guide |
|----------|----------|-------------|-------------|
| `FAL_KEY` | For AI portraits | fal.ai API key for Flux image generation | [Get key](https://fal.ai/dashboard/keys) \| [Quickstart](https://docs.fal.ai/model-apis/quickstart) |
| `GITHUB_TOKEN` | Optional | GitHub PAT for PR automation | [Create token](https://github.com/settings/tokens) \| [Docs](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens) |

### Setup

```bash
# fal.ai for Flux image generation
# 1. Create account at https://fal.ai
# 2. Go to https://fal.ai/dashboard/keys
# 3. Create new key, copy it
export FAL_KEY="your-fal-api-key"

# GitHub (optional, for PR automation)
# 1. Go to https://github.com/settings/tokens
# 2. Generate new token (classic) with 'repo' scope
export GITHUB_TOKEN="your-github-pat"
```

## Scripts

Single-purpose tools, run manually in sequence:

```bash
# 1. Generate portrait (dummy solid color for testing)
node scripts/generate-portrait.js portrait.png --category=npc

# 2. Render card PNG from JSON definition
node scripts/render-card-sharp.js card.json card.png --style=dark
```

### generate-portrait.js

Creates portrait images. Currently generates solid-color dummies for testing.
Future: `--api` flag to call fal.ai Flux.

```bash
node scripts/generate-portrait.js output.png --category=npc    # brown
node scripts/generate-portrait.js output.png --color=#ff0000   # red
```

### render-card-sharp.js

Renders card PNG directly using sharp. No browser needed.

```bash
node scripts/render-card-sharp.js card.json card.png --style=dark
```

**Styles:**
- `dark` - Dark textured background, light text (default)
- `parchment` - Aged paper look, dark text
- `minimal` - Clean white background
- `compact` - Smaller portrait, more room for text

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
│       ├── portrait.png          # AI-generated portrait
│       ├── card.png              # Final rendered card
│       └── REVIEW.md             # For PR review
├── location/
└── item/
```

## Example Output

- **Text variants**: `campaigns/example/cards/npc/sir-tinkelstein/`
- **Layout styles**: `campaigns/example/cards/npc/sir-tinkelstein-layouts/`

## PR Review Workflow

See `campaigns/example/cards/npc/sir-tinkelstein/REVIEW.md` for the markdown format.

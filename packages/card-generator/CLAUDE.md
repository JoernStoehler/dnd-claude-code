# Card Generator

Creates tarot-sized player-facing cards with texture backgrounds.

## Prerequisites

- `FAL_KEY` env var must be set for AI image generation (`--api` mode). Loaded from repo root `.env` via shell profile. If missing, scripts fall back to placeholder images and print a warning.
- **Never read `.env` directly** — it contains secrets. Just check `echo $FAL_KEY` to verify it's set.

## Pipeline

```bash
# 1. Generate portrait (placeholder or via fal.ai)
node scripts/generate-portrait.js portrait.png --category=npc
node scripts/generate-portrait.js portrait.png --prompt="gnome inventor" --api  # requires FAL_KEY

# 2. Generate texture background
node scripts/generate-texture.js texture.png --category=npc
node scripts/generate-texture.js texture.png --category=npc --api  # requires FAL_KEY

# 3. Render card from JSON + portrait + texture
node scripts/render-card.js card.json card.png
node scripts/render-card.js card.json card.png --portrait=p.png --texture=t.png
```

## Card JSON

```json
{
  "category": "npc",
  "name": "Display Name",
  "description": "Player-facing only: appearance, demeanor, context. NO secrets.",
  "footer": "Location or context",
  "portrait": "portrait.png",
  "image_prompt": "Prompt for AI portrait generation"
}
```

Categories: `npc`, `location`, `item`, `faction`, `quest`, `mystery`

Schema: `schemas/card.schema.json`

## Architecture

- `lib/render-card.js` -- renderer module (layout constants, SVG generation, sharp compositing)
- `scripts/render-card.js` -- CLI wrapper
- `scripts/generate-portrait.js` -- portrait generation (dummy or fal.ai Flux)
- `scripts/generate-texture.js` -- texture generation (dummy or fal.ai Flux)

Layout details and design rationale: `DESIGN-SPEC.md`

## Folder Structure

```
campaigns/<campaign>/cards/
  <category>/<slug>/
    card.json       # Card definition
    portrait.png    # Character/location portrait
    texture.png     # Background texture
    card.png        # Rendered card
```

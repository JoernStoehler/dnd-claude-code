# Card Generator

Creates player-facing cards for NPCs, locations, and items.

## Scripts

```bash
# Generate portrait (dummy or API)
node scripts/generate-portrait.js output.png --size=portrait_4_3 --category=npc
node scripts/generate-portrait.js output.png --prompt="gnome knight" --api  # requires FAL_KEY

# Render card PNG from JSON
node scripts/render-card-sharp.js card.json card.png --style=dark
```

## Card JSON

```json
{
  "category": "npc",
  "name": "Display Name",
  "description": "Player-facing only: appearance, demeanor, context. NO secrets.",
  "footer": "Campaign Name",
  "portrait": "portrait.png",
  "image_prompt": "Prompt for AI portrait generation"
}
```

Categories: `npc`, `location`, `item`, `faction`, `quest`, `mystery`

## Layout Styles

| Style | Description |
|-------|-------------|
| `dark` | Dark textured background, light text (default) |
| `parchment` | Aged paper look, dark text |

## Flux Size Presets

| Preset | Dimensions | Use |
|--------|------------|-----|
| `portrait_4_3` | 768x1024 | Cards (recommended) |
| `portrait_16_9` | 576x1024 | Taller/narrower |
| `square` | 1024x1024 | Square |
| `landscape_4_3` | 1024x768 | Locations |
| `landscape_16_9` | 1024x576 | Wide scenes |

## Folder Structure

```
campaigns/<campaign>/cards/
├── npc/<slug>/
│   ├── card.json
│   ├── portrait.png
│   ├── card.png
│   └── REVIEW.md
├── location/
└── item/
```

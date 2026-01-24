# Card Generator (Experimental)

**Status: Exploratory prototypes** - This code is throwaway experimentation for figuring out the card workflow. Expect to rewrite from scratch once we know what we actually want.

## Current Contents

```
prototypes/
├── card-template.html     # Visual prototype - open in browser to see card designs
├── card-data-example.yaml # Data schema for card variants and image prompts
├── single-card.html       # Minimal card for testing
└── output/                # (empty - rendering blocked by environment)

scripts/
└── render-card.js         # Playwright-based HTML→PNG (needs proper Chrome environment)
```

## Known Issues

- **Rendering blocked**: The current environment lacks permissions for Chrome/Playwright to run. The render script exists but crashes on screenshot operations. A proper dev environment with Chrome access is needed.

## What Works

- Open `prototypes/card-template.html` in a browser to see:
  - NPC, Location, Item card examples
  - Poker vs Tarot size comparison
  - Dark theme with category color-coding

## Decisions Made

- **Card size**: Poker (2.5" × 3.5" / 750×1050px @300dpi)
- **Output format**: PNG
- **Backside**: Not needed (front only)
- **Image generation**: Flux via fal.ai

## Image Generation Setup (fal.ai)

**Quickstart**: https://docs.fal.ai/model-apis/quickstart

1. Create account at https://fal.ai
2. Get API key from dashboard: https://fal.ai/dashboard/keys
3. Set environment variable: `export FAL_KEY="your-api-key"`

**Models to use:**
- `fal-ai/flux/schnell` - Fast, cheap (~$0.003/megapixel)
- `fal-ai/flux/dev` - Better quality, slightly slower

**Example call:**
```javascript
import { fal } from "@fal-ai/client";

const result = await fal.subscribe("fal-ai/flux/dev", {
  input: {
    prompt: "Portrait of a gnome knight in ornate armor, fantasy art style",
    image_size: { width: 512, height: 716 }  // ~5:7 ratio for cards
  }
});
```

## PR Review Workflow

Each card set gets a markdown file for GitHub review. See `prototypes/example-review.md` for the format.

Structure:
```
cards/npc/sir-tinkelstein/
├── REVIEW.md              # Markdown with embedded images for GitHub preview
├── v1.png, v2.png, ...    # Individual card variants
├── canonical.png          # Copy of chosen variant
└── metadata.yaml          # Prompts, status, source entity
```

Feedback via PR comments:
- "Use v2" → Switch canonical to v2
- "v1 text + v3 image" → Combine components
- "Make image funnier; best of 3" → Generate new variants

## To Be Determined

- A4 PDF composition workflow (manual Inkscape for now)
- Agent prompt details

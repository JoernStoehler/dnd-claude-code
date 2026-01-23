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

## To Be Determined

- Final output format (PNG vs SVG)
- Image generation workflow and API
- A4 PDF composition for printing
- Variant management and selection UX

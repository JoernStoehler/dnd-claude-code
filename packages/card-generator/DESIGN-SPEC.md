# Card Generator Design Specification

## Context

**User workflow:** Home printer -> A4 paper -> scissors -> optional tarot sleeves
**Campaign tone:** Whimsical/fun (art style TBD — ink wash was proposed but never approved)

---

## Card Size: Tarot (70x120mm / 827x1417px at 300dpi)

**Why tarot over poker:**
- Fits standard tarot sleeves (available to purchase)
- More vertical space for portrait + text without cropping
- Not a hard constraint since user has no existing sleeves

## Layout

```
+--[40px margin]--+
|                  |
|   [header 80px]  |  Title + category icons (left/right)
|                  |
|   [portrait]     |  650px tall, 707px wide (20px inset from content)
|                  |  Rounded corners (20px radius)
|                  |
|   [divider]      |  Thin horizontal line
|                  |
|   [text area]    |  ~567px, body text with stroke for readability
|                  |
|   [footer 40px]  |  Location label + category icons (left/right)
|                  |
+--[40px margin]--+
```

| Region | Height | Notes |
|--------|--------|-------|
| Margin (top) | 40px | Print safety buffer for hand-cutting |
| Header | 80px | Fits 2-line title at 34px. Auto-sizes: tries 52/42/34/28px single line, then 34/28px 2-line |
| Portrait | 650px | 707px wide (content width minus 20px padding each side). Rounded 20px corners |
| Text area | 567px | Body text at 28px/36px line height. Divider line at top. ~15 lines available |
| Footer | 40px | Category icons in corners, location text centered |
| Margin (bottom) | 40px | |

**Total:** 40 + 80 + 650 + 567 + 40 + 40 = 1417px

## Background

**Texture backgrounds** generated via fal.ai Flux, category-specific:
- NPC: brown leather
- Location: green-tinted parchment
- Item: blue velvet
- Faction: purple banner fabric
- Quest: golden scroll
- Mystery: dark smoky

**Why textures over gradients:** Tested both extensively. Textures look substantially better in print and give each category a distinctive feel beyond just color.

Text uses cream color (#f4e4c1) with dark stroke for readability on varied texture backgrounds.

## Image Generation

| Parameter | Value | Reason |
|-----------|-------|--------|
| Aspect ratio | portrait_4_3 (768x1024) | Good portrait framing, resized to 707x650 with cover fit |
| Art style | TBD | Ink wash proposed, not approved. Moebius/ligne claire/Otomo tested, not chosen |
| Framing | Full body, white background | Bit of ground visible. Character-specific pose/expression/objects. Good contrast, sharp lines |

## Typography

| Element | Size | Notes |
|---------|------|-------|
| Title | 52px serif (auto-shrinks) | Measured with opentype.js, not character-count heuristic |
| Body | 28px serif, 36px line height | Pixel-width word wrap via opentype.js |
| Footer | 24px serif | Truncated with ellipsis if too long |
| Text stroke | rgba(0,0,0,0.5) 2px | Readability on texture backgrounds |

## Category Colors

| Category | Accent | Light |
|----------|--------|-------|
| NPC | #8B4513 (brown) | #D2691E |
| Location | #2E8B57 (green) | #3CB371 |
| Item | #4169E1 (blue) | #6495ED |
| Faction | #8B008B (purple) | #BA55D3 |
| Quest | #B8860B (gold) | #DAA520 |
| Mystery | #4A4A4A (grey) | #696969 |

## Resolved Design Decisions

### 1. Same layout for all categories
KISS/YAGNI. Category differentiation comes from icons, colors, and texture style.

### 2. Card lifecycle
Batch generate portraits -> select best -> render card -> becomes canonical.
Rejected drafts live in git history only.

### 3. Short descriptions
Accept empty space rather than dynamic layout resizing. Variable content length is unavoidable.

### 4. Long names
Shrink font dynamically (52 -> 42 -> 34 -> 28px). If still too long at 28px, wrap to 2 lines. If still too long, truncate with ellipsis.

### 5. Rounded portrait corners
20px radius. Adds visual polish. Hand-cutting imprecision means the card edges are rough anyway.

### 6. Text readability on textures
Stroke outline on all text (2px dark stroke, paint-order: stroke). Tested alternatives (dark tint overlay, leather tint) -- stroke-only looks cleanest.

### 7. Footer decoration
Category icons in footer corners (matching header icons). Tested alternatives: decorative corner brackets, line border, no decoration. Icons won for visual consistency.

## Explicitly Skipped

- **Bleed margins**: Not needed for home printing
- **CMYK color profile**: Home printer handles conversion
- **Card back design**: Single-sided home printing
- **PDF sheet layout**: Out of scope for MVP
- **Per-category layouts**: Same layout, different textures/icons/colors

## Tested & Verified

- [x] Layout fits descriptions from 36-416 characters
- [x] Category colors and icons distinguish card types
- [x] 0% crop with square image (portrait_4_3 resized with cover fit)
- [x] Title auto-sizing handles names up to ~45 characters
- [x] Texture backgrounds render correctly with all categories
- [x] Rounded portrait corners composite properly

## Not Yet Tested

- [ ] Portrait composition consistency across multiple characters
- [ ] Ink wash style consistency across different subjects
- [ ] Print quality on actual paper
- [ ] Readability at arm's length
- [ ] Color accessibility for color blindness

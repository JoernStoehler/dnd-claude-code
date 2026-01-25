# Card Design Exploration Overview

This folder contains all exploration work for the card generator. Use this document to understand what was tested, what worked, and what was decided.

**Status:** Design in progress. See [Open Questions](#open-questions) for decisions still needed.

---

## Art Styles

Tested 8 art style prompts on the same subject (gnome inventor).

### Styles That Work

These produce **distinct, recognizable** artistic styles:

| Style | Portrait | On Card | Notes |
|-------|----------|---------|-------|
| **Ink Wash** | ![](style-ink-wash.png) | ![](card-ink-wash.png) | ✓ Best for whimsical campaigns. Has character and soul. **Currently selected.** |
| **Watercolor** | ![](style-watercolor.png) | ![](card-watercolor.png) | ✓ Softer, more painterly. Good alternative. |
| **Renaissance** | ![](style-renaissance.png) | ![](card-renaissance.png) | ✓ Distinct but serious/dramatic. Wrong tone for fun-heroes. |
| **Graphic Novel** | ![](style-graphic-novel.png) | N/A | ✓ Distinct style, would fit fun-heroes. Alternative to ink wash. |

### Styles That Collapse

These prompts produce **indistinguishable generic output** - avoid:

| Style | Portrait | Notes |
|-------|----------|-------|
| Classic D&D | ![](style-classic-dnd.png) | ✗ Looks same as oil painting |
| Oil Painting | ![](style-oil-painting.png) | ✗ Generic, "devoid of soul" |
| Storybook | ![](style-storybook.png) | ✗ Indistinguishable from above |
| Digital Painterly | ![](style-digital-painterly.png) | ✗ Generic AI look |

**Finding:** Flux flattens vague style descriptors ("oil painting", "fantasy illustration") to the same generic output. Use specific technique descriptors ("ink drawing with watercolor wash, pen and ink linework").

---

## Card Sizes

### The Trade-off

Constraints in tension:
- User wants **≤5% crop** (15% is risky)
- User needs **6 lines of text** sometimes
- User wants **readable font** (not tiny)
- Standard card sizes fit standard sleeves

### Options Tested

| Option | Card Size | Image | Crop | Text Lines | Sample |
|--------|-----------|-------|------|------------|--------|
| A | Poker (750×1050) | Square | 5% | 5 lines | ![](tradeoff-A-5pct-5lines.png) |
| B | Poker | Square | 7.5% | 6 lines | ![](tradeoff-B-7pct-6lines.png) |
| C | Poker | Square | 5% | 6 lines (small font) | ![](tradeoff-C-5pct-6lines-small.png) |
| D | Tarot (827×1417) | Square | 0% | 11 lines | ![](tradeoff-D-tarot-full.png) |

### Decision: Tarot Size

**Rationale:**
- User prints at home, cuts with scissors, has no existing sleeves
- Tarot sleeves (70×120mm) are purchasable
- Zero crop, readable font, plenty of text space
- No downside since sleeve constraint doesn't exist yet

**Final sample:** ![](card-final.png)

---

## Content Variation Tests

Tested tarot layout with varied content lengths.

| Test Case | Category | Chars | Lines | Result |
|-----------|----------|-------|-------|--------|
| Short description | NPC | 36 | 1/11 | ![](test-npc-short.png) |
| Medium description | NPC | 205 | 5/11 | ![](test-npc-medium.png) |
| Long description | NPC | 416 | 10/11 | ![](test-npc-long.png) |
| Long name | NPC | 69 | 2/11 | ![](test-npc-long-name.png) |
| Location short | Location | 44 | 1/11 | ![](test-location-short.png) |
| Location long | Location | 392 | 9/11 | ![](test-location-long.png) |
| Item medium | Item | 222 | 6/11 | ![](test-item-medium.png) |

**Finding:** All test cases fit. Short descriptions leave empty space (see [Open Questions](#open-questions)).

---

## Current Layout Specification

```
┌─────────────────────────────┐
│  HEADER (90px)              │  Category gradient + title + icons
│  52px serif title           │
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │                         │ │  40px category-colored border
│ │  PORTRAIT (747×747px)   │ │  (MTG-style framing)
│ │                         │ │  Aids cutting + category recognition
│ └─────────────────────────┘ │
├─────────────────────────────┤
│  BODY (460px)               │  28px serif, 36px line height
│  ~11 lines of text          │  Left-aligned, 40px padding
│                             │
├─────────────────────────────┤
│  FOOTER (40px)              │  22px serif, centered
└─────────────────────────────┘

Card size: 827×1417px (70×120mm at 300dpi)
Background: Parchment gradient
Portrait border: 40px category color (like MTG card frames)
```

### Why 40px Border?

Follows MTG design convention. Benefits:
- **Cutting guide**: Clear edge for scissors
- **Category recognition**: Colored frame reinforces card type
- **Visual framing**: Portrait looks intentional, not edge-bleed accident

Our cards differ from MTG in:
- Larger portrait ratio (visual memory is primary goal)
- Simpler header (no mana cost)
- More text space per line (no competing symbols)

But the fundamental layout principle (colored frame around art) transfers well.

---

## Design Decisions (Resolved)

### 1. Per-Category Layouts
**Decision:** Same layout for all (KISS, YAGNI).

### 2. Card Lifecycle
**Decision:** Batch generate → select one → canonical. Updates via edits/replacement. Keep only canonical in HEAD; rejected/obsolete versions in git history only.

### 3. Primary Use Case
**Decision:** Help GM and players track things and names. Portraits + descriptions for visual memory.

### 4. Short Descriptions
**Decision:** Accept empty space. Font: 28px for 1-6 lines, smaller allowed for 7+.

### 5. Long Names
**Decision:** Shrink font dynamically, wrap to 2 lines if still needed.

---

## File Index

### Portraits (style exploration)
- `style-ink-wash.png` - ✓ Selected
- `style-watercolor.png` - ✓ Good alternative
- `style-renaissance.png` - ✓ For serious campaigns
- `style-classic-dnd.png` - ✗ Generic
- `style-oil-painting.png` - ✗ Generic
- `style-storybook.png` - ✗ Generic
- `style-digital-painterly.png` - ✗ Generic
- `style-graphic-novel.png` - ✗ Generic

### Complete Cards (style on card)
- `card-ink-wash.png`, `card-watercolor.png`, `card-renaissance.png`, etc.

### Size Comparisons
- `tradeoff-A-*.png` through `tradeoff-D-*.png` - Size/crop/text trade-offs

### Content Tests
- `test-npc-short.png` through `test-item-medium.png` - Varied content lengths

### Final Sample
- `card-final.png` - Current output (tarot size, ink wash, 40px border)
- `portrait.png` - Source portrait

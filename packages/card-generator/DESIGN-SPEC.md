# Card Generator Design Specification

## Context

**User workflow:** Home printer → A4 paper → scissors → optional tarot sleeves
**Campaign tone:** Whimsical/fun (ink wash art style)

---

## Decided Parameters

### Card Size: Tarot (70×120mm / 827×1417px at 300dpi)

**Justification:**
- Fits standard tarot sleeves (available to purchase)
- Square portrait fits without cropping (user dislikes crop)
- 11 lines of text at readable size (user needs 6+ sometimes)
- Not a hard constraint since user has no existing sleeves

### Image Generation

| Parameter | Value | Justification |
|-----------|-------|---------------|
| Aspect ratio | Square (1024×1024) | Scales to card width with 0% crop |
| Art style | Ink wash | User selected for whimsical tone |
| Framing | Head and shoulders, centered | Consistent composition |

### Layout Dimensions

| Element | Size | Justification |
|---------|------|---------------|
| Header | 90px | Fits 52px title + 32px icons |
| Portrait | 827px | Full card width, square |
| Body | 460px | 11 lines at 28px/36px |
| Footer | 40px | Small, secondary info |
| Padding | 40px | Buffer for imprecise hand-cutting |

### Visual Style

| Element | Value | Justification |
|---------|-------|---------------|
| Background | Parchment gradient | User preferred for printing |
| Header | Category color gradient | Quick category identification |
| Corners | Sharp | Hand-cutting makes rounded impractical |
| Border/frame | None | Simpler, less ink |
| Bleed | None | Not needed for home printing |

### Typography

| Element | Size | Justification |
|---------|------|---------------|
| Title | 52px serif | Readable at arm's length |
| Body | 28px serif, 36px line height | Comfortable density |
| Footer | 22px serif | Secondary info |
| Alignment | Left | Easier to read than justified |

### Category Colors

| Category | Accent | Light |
|----------|--------|-------|
| NPC | #8B4513 (brown) | #D2691E |
| Location | #2E8B57 (green) | #3CB371 |
| Item | #4169E1 (blue) | #6495ED |
| Faction | #8B008B (purple) | #BA55D3 |
| Quest | #B8860B (gold) | #DAA520 |

---

## Explicitly Skipped (not needed for home printing)

- **Bleed margins**: No professional printing
- **CMYK color profile**: Home printer handles conversion
- **Card back design**: Home printing is typically single-sided
- **PDF sheet layout**: Out of scope for MVP

---

## Open Questions Requiring User Input

### 1. Per-Category Layouts

Current: Same layout for all categories.

**Problem:** Locations and items may need different information than NPCs.
- Location: Might benefit from a map/wider image instead of portrait
- Item: Might need stats (rarity, value, weight)
- Faction: Might need crest/symbol instead of portrait

**Question:** Use one layout for everything, or design category-specific variants?

### 2. Snapshot vs Living Document

Current: Cards are static snapshots.

**Problem:** NPCs die, relationships change, players learn new info.

**Options:**
- A) Cards are snapshots, frozen at creation (simple)
- B) Cards can be regenerated/updated (need versioning)
- C) Cards have a notes area for handwritten updates (hybrid)

**Question:** How do you want to handle changes over time?

### 3. Primary Use Case

Cards could serve different purposes with different priorities:

| Use Case | Priority |
|----------|----------|
| Table handout | Visual recognition, quick glance |
| GM reference | Dense information, all details |
| Player collection | Visual polish, trophy feel |
| Quick lookup | Scannable text, clear hierarchy |

**Question:** Which use case is primary? This affects information density and visual polish level.

### 4. Short Description Problem

Cards with very short descriptions (e.g., "A quiet halfling barmaid. Observant.") leave large empty space in the body area.

**Options:**
- A) Accept it - sparse cards are fine
- B) Add more content types (tags, relationships, stats)
- C) Dynamically adjust portrait/body ratio (complex)
- D) Set minimum description length (content constraint)

**Question:** How should short descriptions be handled?

### 5. Name Length Limits

Long names like "Bartholomew Fitzgerald Maximilian von Hornsworth III" may not fit header.

**Options:**
- A) Truncate with ellipsis
- B) Reduce font size dynamically
- C) Wrap to two lines
- D) Set maximum name length (content constraint)

**Question:** How should long names be handled?

---

## Tested & Verified

- [x] Layout fits descriptions from 36-416 characters
- [x] Category colors distinguish NPC/location/item
- [x] Category icons render correctly
- [x] 0% crop with square image
- [x] 11 lines available for text

## Not Yet Tested

- [ ] Portrait composition consistency across multiple characters
- [ ] Ink wash style consistency across different subjects
- [ ] Print quality on actual paper
- [ ] Readability at arm's length
- [ ] Color accessibility for color blindness

---

## Sample Output

See `campaigns/example/cards/npc/tarot-sample/card-tarot-inkwash.png` for current output.

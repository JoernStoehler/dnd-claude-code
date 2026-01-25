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
| Portrait | 827×827px | Full card width, square |
| Portrait margin | 0px | Edge-to-edge (TBD: could add side margins for framed look) |
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

## Resolved Design Decisions

### 1. Per-Category Layouts

**Decision:** Same layout for all categories (KISS, YAGNI).

### 2. Card Lifecycle

**Decision:** Batch generate → select one → becomes canonical version.

Updates happen via edits or replacement when new information is available. Campaign documents are source of truth; cards are reminders for players, not revelations.

**Cleanup policy:** Keep only canonical versions in HEAD. Rejected drafts and obsolete versions live in git history only - don't clutter working directory.

### 3. Primary Use Case

**Decision:** Help GM and players keep track of things and names. Portraits + descriptions for visual memory.

### 4. Short Descriptions

**Decision:** Accept empty space - unavoidable with variable content.

Font sizing rules:
- 1-6 lines: Standard size (28px)
- 7+ lines: Smaller font allowed if needed

No dynamic layout resizing.

### 5. Long Names

**Decision:** Shrink font dynamically. If still too long, wrap to 2 lines.

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

See `campaigns/example/cards/exploration/card-tarot-inkwash.png` for current output.

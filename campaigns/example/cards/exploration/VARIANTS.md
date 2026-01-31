# Layout Variant Comparison

**Texture cards**: AI-generated leather background, no tint, rounded portrait, icons in corners.

Legacy: Gradient background with solid color text area.

---

## New Default

| Solid color (NEW DEFAULT) |
|:---:|
| <img src="00-default.png" width="300"/> |

---

## Text Box Background

| Solid (default) | Parchment (old) |
|:---:|:---:|
| <img src="00-default.png" width="250"/> | <img src="02-parchment-textbox.png" width="250"/> |

---

## Header Icons

| With icons (default) | No icons |
|:---:|:---:|
| <img src="00-default.png" width="250"/> | <img src="03-no-icons.png" width="250"/> |

---

## Decorative Elements

| With divider (default) | Without divider |
|:---:|:---:|
| <img src="00-default.png" width="250"/> | <img src="04-no-divider.png" width="250"/> |

---

## Typography

**Serif (default)**
<img src="00-default.png" width="300"/>

**Sans-serif**
<img src="05-sans-serif.png" width="300"/>

**Centered**
<img src="06-centered-text.png" width="300"/>

**Italic**
<img src="07-italic-desc.png" width="300"/>

---

## Texture Background Variants

Generate texture: `node scripts/generate-texture.js texture.png --category=npc --api`

### Text Area Tinting

| Dark tint | Leather tint | No tint (preferred) |
|:---:|:---:|:---:|
| <img src="09-tex-dark-tint.png" width="200"/> | <img src="10-tex-leather-tint.png" width="200"/> | <img src="11-tex-no-tint.png" width="200"/> |

### Text Area Borders

| Line border | Decorative corners |
|:---:|:---:|
| <img src="12-tex-line-border.png" width="250"/> | <img src="13-tex-decorative-border.png" width="250"/> |

### Portrait Styling

| Rounded corners | Border line | Rounded + border |
|:---:|:---:|:---:|
| <img src="14-tex-rounded-portrait.png" width="200"/> | <img src="15-tex-portrait-border.png" width="200"/> | <img src="16-tex-rounded-with-border.png" width="200"/> |

### Text Area Decoration

| Decorative corners | Icons in corners |
|:---:|:---:|
| <img src="17-tex-decorative-corners.png" width="250"/> | <img src="18-tex-corner-icons.png" width="250"/> |

---

## Edge Case Tests

### Text Length Handling

| Short text | Medium text |
|:---:|:---:|
| <img src="20-text-short.png" width="250"/> | <img src="21-text-medium.png" width="250"/> |

| Long text | Very long text |
|:---:|:---:|
| <img src="22-text-long.png" width="250"/> | <img src="23-text-very-long.png" width="250"/> |

### Category Variants (different icons)

| Location | Item | Faction |
|:---:|:---:|:---:|
| <img src="30-cat-location.png" width="200"/> | <img src="31-cat-item.png" width="200"/> | <img src="32-cat-faction.png" width="200"/> |

---

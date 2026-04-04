#!/usr/bin/env python3
# /// script
# requires-python = ">=3.11"
# dependencies = [
#     "Pillow>=12.0",
#     "weasyprint>=68.0",
# ]
# ///
"""Build print-ready A4 PDF of NPC portrait cards from PNG images.

Each card has the portrait on the left and ruled writing space on the right,
in a 50/50 split. Cards arranged in a 4-row × 2-column grid (8 cards/page)
filling the full A4 page height.

Card images are composited in Pillow (portrait + ruled lines as one image),
then placed in a simple HTML table for PDF rendering via weasyprint.
"""
import argparse
import math
import sys
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw
import weasyprint

# A4 page dimensions in mm.
A4_W = 210
A4_H = 297

# 5mm margins work for most home/university inkjet and laser printers.
# If a specific printer clips edges, increase this value.
MARGIN = 5

# Layout: 4 rows × 2 columns = 8 cards per A4 page.
ROWS = 4
COLS = 2

# Composited card image resolution. 150 DPI is enough for home printing
# (300 DPI doubles file size with no visible improvement on inkjet).
DPI = 150

# Handwriting line spacing: 7mm matches college-ruled paper.
LINE_SPACING = 7

# Space reserved at top of writing area for a name (mm).
NAME_AREA = 10

# Dashed cut-line border width (mm). Must match the CSS border value.
BORDER = 0.3


def mm(v: float) -> int:
    """Convert mm to pixels at DPI."""
    return round(v * DPI / 25.4)


def parse_args():
    parser = argparse.ArgumentParser(
        description="Generate a print-ready A4 PDF of NPC portrait cards.",
        epilog="""\
examples:
  %(prog)s portraits/*.png
  %(prog)s --color -o party.pdf alice.png bob.png

layout:
  4 rows × 2 columns = 8 cards per A4 page.
  Each card is 100×71mm: portrait on the left (50mm), ruled writing
  space on the right (50mm), with a name line at the top.

  Portraits are scaled to fit preserving aspect ratio (never stretched).
  Non-3:4 images are centered vertically with white fill.
""",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument("pngs", nargs="+", metavar="PNG",
                        help="Input PNG file paths")
    parser.add_argument("--color", action="store_true",
                        help="Keep portraits in color (default: greyscale)")
    parser.add_argument("-o", "--output", default="cards.pdf",
                        help="Output PDF path (default: cards.pdf)")
    return parser.parse_args()


def load_images(paths: list[str]) -> list[Image.Image]:
    """Load all images, validate upfront."""
    images = []
    for p in paths:
        path = Path(p)
        if not path.exists():
            print(f"Error: file not found: {path}", file=sys.stderr)
            sys.exit(1)
        try:
            img = Image.open(path)
            img.load()
        except Exception as e:
            print(f"Error: cannot open as image: {path} ({e})", file=sys.stderr)
            sys.exit(1)
        images.append(img)
    return images


def make_card(src: Image.Image, card_w_px: int, card_h_px: int,
              portrait_w_px: int, greyscale: bool) -> Image.Image:
    """Composite one card: portrait left, name line + ruled lines right."""
    card = Image.new("RGB", (card_w_px, card_h_px), "white")

    # Scale portrait to fit within portrait area, preserving aspect ratio.
    portrait = src.copy()
    if greyscale:
        portrait = portrait.convert("L").convert("RGB")

    pw, ph = portrait.size
    scale = min(portrait_w_px / pw, card_h_px / ph)
    new_w = round(pw * scale)
    new_h = round(ph * scale)
    portrait = portrait.resize((new_w, new_h), Image.LANCZOS)

    # Center vertically, left-aligned.
    y_offset = (card_h_px - new_h) // 2
    card.paste(portrait, (0, y_offset))

    # Draw writing area.
    draw = ImageDraw.Draw(card)
    pad = mm(2)
    write_left = portrait_w_px + pad
    write_right = card_w_px - pad

    # Vertical separator.
    draw.line([(portrait_w_px, 0), (portrait_w_px, card_h_px)],
              fill="#aaaaaa", width=1)

    # Name line: thicker, near top of writing area.
    name_y = mm(NAME_AREA)
    draw.line([(write_left, name_y), (write_right, name_y)],
              fill="#999999", width=2)

    # Ruled lines below name line.
    spacing = mm(LINE_SPACING)
    y = name_y + spacing
    while y < card_h_px - pad:
        draw.line([(write_left, y), (write_right, y)],
                  fill="#cccccc", width=1)
        y += spacing

    return card


def build_pdf(card_paths: list[Path], card_w_mm: float, card_h_mm: float,
              output: str) -> int:
    """Render cards into A4 PDF via weasyprint."""
    page_w_mm = A4_W - 2 * MARGIN
    per_page = COLS * ROWS
    total = len(card_paths)
    pages = math.ceil(total / per_page) if total > 0 else 1

    css = (
        f"@page {{ size: A4 portrait; margin: {MARGIN}mm; }}"
        f" body {{ margin: 0; padding: 0; font-size: 0; }}"
        f" table {{ width: {page_w_mm}mm; border-collapse: collapse;"
        f"   table-layout: fixed; page-break-after: always; }}"
        f" table:last-child {{ page-break-after: auto; }}"
        f" td {{ width: {card_w_mm}mm; height: {card_h_mm}mm;"
        f"   border: {BORDER}mm dashed #aaa; vertical-align: top;"
        f"   padding: 0; }}"
        f" td img {{ display: block; width: {card_w_mm}mm;"
        f"   height: {card_h_mm}mm; }}"
    )

    html_parts = []
    idx = 0
    for _ in range(pages):
        html_parts.append("<table>")
        for _ in range(ROWS):
            if idx >= total:
                break
            html_parts.append("<tr>")
            for _ in range(COLS):
                if idx < total:
                    html_parts.append(
                        f'<td><img src="{card_paths[idx]}"></td>')
                else:
                    html_parts.append("<td></td>")
                idx += 1
            html_parts.append("</tr>")
        html_parts.append("</table>")

    html = (f"<!DOCTYPE html><html><head><style>{css}</style></head>"
            f"<body>{''.join(html_parts)}</body></html>")
    weasyprint.HTML(string=html, base_url=str(card_paths[0].parent)).write_pdf(
        output)
    return pages


def main():
    args = parse_args()
    images = load_images(args.pngs)
    greyscale = not args.color

    page_w_mm = A4_W - 2 * MARGIN   # 200mm
    page_h_mm = A4_H - 2 * MARGIN   # 287mm

    card_w_mm = page_w_mm / COLS     # 100mm
    # Subtract border thickness: with border-collapse, (ROWS+1) horizontal
    # borders of BORDER mm each are added to the table height.
    card_h_mm = (page_h_mm - (ROWS + 1) * BORDER) / ROWS

    # 50/50 split: portrait and writing area each get half the card width.
    portrait_w_mm = card_w_mm / 2
    portrait_h_mm = portrait_w_mm * 4 / 3  # 3:4 aspect ratio

    card_w_px = mm(card_w_mm)
    card_h_px = mm(card_h_mm)
    portrait_w_px = mm(portrait_w_mm)

    writing_w_mm = card_w_mm - portrait_w_mm
    line_count = int((card_h_mm - NAME_AREA) / LINE_SPACING)

    print(f"  {len(images)} portraits, {'color' if args.color else 'greyscale'}")
    print(f"  card: {card_w_mm:.0f}x{card_h_mm:.1f}mm,"
          f" portrait: {portrait_w_mm:.0f}x{portrait_h_mm:.0f}mm,"
          f" writing: {writing_w_mm:.0f}mm wide, ~{line_count} lines")

    with tempfile.TemporaryDirectory() as tmp_dir:
        tmp = Path(tmp_dir)
        card_paths = []
        for i, img in enumerate(images):
            card = make_card(img, card_w_px, card_h_px, portrait_w_px,
                             greyscale)
            out = tmp / f"card-{i:03d}.png"
            card.save(out, format="PNG", dpi=(DPI, DPI))
            card_paths.append(out)

        pages = build_pdf(card_paths, card_w_mm, card_h_mm, args.output)

    size = Path(args.output).stat().st_size
    print(f"  {args.output}: {pages} page(s), {size:,} bytes")


if __name__ == "__main__":
    main()

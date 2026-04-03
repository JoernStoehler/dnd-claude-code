#!/usr/bin/env python3
# /// script
# requires-python = ">=3.11"
# dependencies = [
#     "Pillow>=12.0",
#     "weasyprint>=68.0",
# ]
# ///
"""Build a print-ready A4 PDF of landscape NPC cards from portrait PNGs.

Each card has the portrait on the left and ruled writing space on the right.
Cards are arranged in a 2-column grid sized to fit A4 with 5mm margins.

Card images are composited in Pillow (portrait + ruled lines as one image),
then placed in a simple HTML table for PDF generation via weasyprint.
CSS-based ruled lines don't work reliably in weasyprint — see
sessions/2026-04-21-oneshot/build-portrait-cards.py for the original
weasyprint-only approach this was derived from.
"""
import argparse
import math
import sys
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw
import weasyprint

# Layout constants (mm). Card is 100mm wide = 2 columns on A4.
# Portrait occupies the left 48mm; remaining 52mm is ruled writing area.
CARD_W = 100
PORTRAIT_W = 48
PADDING = 4       # vertical padding added to portrait height
LINE_SPACING = 6  # ruled line spacing in writing area

# A4 usable area with 5mm margins.
PAGE_W = 200
PAGE_H = 287

# Composited card image resolution. 150 DPI balances quality and file size
# for home printing (300 DPI doubles file size with no visible improvement
# on inkjet printers).
DPI = 150


def mm(v: float) -> int:
    """Convert mm to pixels at DPI."""
    return round(v * DPI / 25.4)


def parse_args():
    parser = argparse.ArgumentParser(
        description="Generate a print-ready A4 PDF of NPC portrait cards.",
        epilog="""\
examples:
  %(prog)s portraits/*.png
  %(prog)s --color -o party-cards.pdf alice.png bob.png

layout:
  Each card is 100mm wide (2 per row on A4). Portrait on the left (48mm),
  ruled writing space on the right (52mm). Card height adapts to the aspect
  ratio of the first image. Images are converted to greyscale by default.

  Supports any image aspect ratio. 1:1 and 3:4 (Flux native) work best.
  1:1 → 52mm tall cards, 5 rows/page, 10 cards/page.
  3:4 → 68mm tall cards, 4 rows/page, 8 cards/page.
""",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument("pngs", nargs="+", metavar="PNG", help="Input PNG file paths")
    parser.add_argument("--color", action="store_true", help="Keep portraits in color (default: greyscale)")
    parser.add_argument("-o", "--output", default="cards.pdf", help="Output PDF path (default: cards.pdf)")
    return parser.parse_args()


def load_and_validate(paths: list[str]) -> list[Image.Image]:
    """Load all images, validate upfront. Returns opened Image objects."""
    images = []
    for p in paths:
        path = Path(p)
        if not path.exists():
            print(f"Error: file not found: {path}", file=sys.stderr)
            sys.exit(1)
        try:
            img = Image.open(path)
            img.load()  # force read so errors surface now
        except Exception as e:
            print(f"Error: cannot open as image: {path} ({e})", file=sys.stderr)
            sys.exit(1)
        images.append(img)
    return images


def make_card(src: Image.Image, greyscale: bool, card_h_px: int) -> Image.Image:
    """Composite one card: portrait left, ruled lines right."""
    card_w_px = mm(CARD_W)
    portrait_w_px = mm(PORTRAIT_W)

    card = Image.new("RGB", (card_w_px, card_h_px), "white")

    # Portrait: fit to portrait width, preserve aspect ratio, top-aligned.
    portrait = src.copy()
    if greyscale:
        portrait = portrait.convert("L").convert("RGB")
    pw, ph = portrait.size
    scaled_h = min(int(portrait_w_px * ph / pw), card_h_px)
    portrait = portrait.resize((portrait_w_px, scaled_h), Image.LANCZOS)
    card.paste(portrait, (0, 0))

    # Ruled lines in writing area.
    draw = ImageDraw.Draw(card)
    gap = mm(1)
    draw.line([(portrait_w_px, 0), (portrait_w_px, card_h_px)], fill="#cccccc", width=1)
    y = mm(LINE_SPACING)
    while y < card_h_px:
        draw.line([(portrait_w_px + gap, y), (card_w_px - gap, y)], fill="#cccccc", width=1)
        y += mm(LINE_SPACING)

    return card


def build_pdf(card_paths: list[Path], card_h_mm: float, rows: int, output: str):
    """Render cards into A4 PDF via weasyprint."""
    per_page = 2 * rows
    total = len(card_paths)
    pages = math.ceil(total / per_page) if total > 0 else 1

    css = (
        f"@page {{ size: A4 portrait; margin: 5mm; }}"
        f" body {{ margin: 0; padding: 0; font-size: 0; }}"
        f" table {{ width: {PAGE_W}mm; border-collapse: collapse;"
        f"   table-layout: fixed; page-break-after: always; }}"
        f" table:last-child {{ page-break-after: auto; }}"
        f" td {{ width: {CARD_W}mm; height: {card_h_mm}mm;"
        f"   border: 0.3mm dashed #aaa; vertical-align: top;"
        f"   padding: 0; overflow: hidden; }}"
        f" td img {{ display: block; width: {CARD_W}mm; height: {card_h_mm}mm; }}"
    )

    rows_html = []
    idx = 0
    for _ in range(pages):
        rows_html.append("<table>")
        for _ in range(rows):
            rows_html.append("<tr>")
            for _ in range(2):
                if idx < total:
                    rows_html.append(f'<td><img src="{card_paths[idx]}"></td>')
                else:
                    rows_html.append("<td></td>")
                idx += 1
            rows_html.append("</tr>")
        rows_html.append("</table>")

    html = f"<!DOCTYPE html><html><head><style>{css}</style></head><body>{''.join(rows_html)}</body></html>"
    weasyprint.HTML(string=html, base_url=str(card_paths[0].parent)).write_pdf(output)
    return pages


def main():
    args = parse_args()
    images = load_and_validate(args.pngs)
    greyscale = not args.color

    # Card height from first image's aspect ratio.
    w, h = images[0].size
    portrait_h_mm = PORTRAIT_W * (h / w)
    card_h_mm = portrait_h_mm + PADDING
    rows = math.floor(PAGE_H / card_h_mm)
    card_h_px = mm(card_h_mm)

    print(f"  {len(images)} portraits, {'color' if args.color else 'greyscale'}")
    print(f"  card: {CARD_W}x{card_h_mm:.1f}mm, {rows} rows/page, portrait: {PORTRAIT_W}x{portrait_h_mm:.1f}mm")

    with tempfile.TemporaryDirectory() as tmp_dir:
        tmp = Path(tmp_dir)
        card_paths = []
        for i, img in enumerate(images):
            card = make_card(img, greyscale, card_h_px)
            out = tmp / f"card-{i:03d}.png"
            card.save(out, format="PNG", dpi=(DPI, DPI))
            card_paths.append(out)

        pages = build_pdf(card_paths, card_h_mm, rows, args.output)

    print(f"  {args.output}: {pages} page(s), {Path(args.output).stat().st_size:,} bytes")


if __name__ == "__main__":
    main()

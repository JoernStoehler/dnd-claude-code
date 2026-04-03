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
"""
import argparse
import math
import sys
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw


# Layout constants (all in mm)
A4_USABLE_W = 200  # with 5mm margins
A4_USABLE_H = 287
CARD_W = 100  # 2 columns
PORTRAIT_W = 48
PADDING = 4  # added to portrait height for card height
LINE_SPACING = 6  # ruled line spacing
DPI = 150  # resolution for composited card images


def mm_to_px(mm: float) -> int:
    return round(mm * DPI / 25.4)


def parse_args():
    parser = argparse.ArgumentParser(
        description="Generate a print-ready A4 PDF of NPC portrait cards.",
        epilog="""\
examples:
  %(prog)s portraits/*.png
  %(prog)s --color -o party-cards.pdf alice.png bob.png
  %(prog)s --color portraits/npc-*.png -o color-cards.pdf

Each card is 100mm wide (2 per row on A4). Portrait on the left (48mm),
ruled writing space on the right. Images converted to greyscale by default.
Card height adapts to the aspect ratio of the first image.
""",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument("pngs", nargs="+", metavar="PNG", help="Input PNG file paths")
    parser.add_argument("--color", action="store_true", help="Keep portraits in color (default: greyscale)")
    parser.add_argument("-o", "--output", default="cards.pdf", help="Output PDF path (default: cards.pdf)")
    return parser.parse_args()


def validate_pngs(paths: list[str]) -> list[Path]:
    """Validate all PNG paths exist and are readable. Fail early with clear errors."""
    validated = []
    for p in paths:
        path = Path(p)
        if not path.exists():
            print(f"Error: file not found: {path}", file=sys.stderr)
            sys.exit(1)
        try:
            img = Image.open(path)
            img.verify()
        except Exception as e:
            print(f"Error: cannot open as image: {path} ({e})", file=sys.stderr)
            sys.exit(1)
        validated.append(path)
    return validated


def compute_layout(first_image: Path) -> tuple[float, float, int]:
    """From the first image's aspect ratio, compute card dimensions.

    Returns (portrait_h_mm, card_h_mm, rows_per_page).
    """
    w, h = Image.open(first_image).size
    portrait_h = PORTRAIT_W * (h / w)
    card_h = portrait_h + PADDING
    rows = math.floor(A4_USABLE_H / card_h)
    return portrait_h, card_h, rows


def make_card_image(src: Path, greyscale: bool, card_w_px: int, card_h_px: int,
                    portrait_w_px: int, line_spacing_px: int) -> Image.Image:
    """Create a single card image: portrait left, ruled lines right."""
    # White card
    card = Image.new("RGB", (card_w_px, card_h_px), "white")

    # Place portrait
    portrait = Image.open(src)
    if greyscale:
        portrait = portrait.convert("L").convert("RGB")
    # Resize to fit portrait width, preserving aspect ratio
    pw, ph = portrait.size
    scaled_h = int(portrait_w_px * (ph / pw))
    portrait = portrait.resize((portrait_w_px, scaled_h), Image.LANCZOS)
    card.paste(portrait, (0, 0))

    # Draw ruled lines in writing area
    draw = ImageDraw.Draw(card)
    writing_x = portrait_w_px + mm_to_px(1)  # 1mm gap
    writing_end = card_w_px - mm_to_px(1)  # 1mm right margin
    # Vertical separator
    draw.line([(portrait_w_px, 0), (portrait_w_px, card_h_px)], fill="#cccccc", width=1)
    # Horizontal ruled lines
    y = line_spacing_px
    while y < card_h_px:
        draw.line([(writing_x, y), (writing_end, y)], fill="#cccccc", width=1)
        y += line_spacing_px

    return card


def build_html(card_paths: list[Path], card_h: float, rows_per_page: int) -> str:
    """Build HTML with one image per card cell."""
    cards_per_page = 2 * rows_per_page
    total = len(card_paths)
    pages = math.ceil(total / cards_per_page) if total > 0 else 1

    lines = [
        "<!DOCTYPE html>",
        "<html><head><meta charset='utf-8'><title>Portrait Cards</title>",
        "<style>",
        "  @page { size: A4 portrait; margin: 5mm; }",
        "  body { margin: 0; padding: 0; font-size: 0; }",
        f"  table {{ width: {A4_USABLE_W}mm; border-collapse: collapse; table-layout: fixed; page-break-after: always; }}",
        "  table:last-child { page-break-after: auto; }",
        f"  td.card {{ width: {CARD_W}mm; height: {card_h}mm; border: 0.3mm dashed #aaa;"
        "    vertical-align: top; padding: 0; overflow: hidden; }}",
        f"  td.card img {{ display: block; width: {CARD_W}mm; height: {card_h}mm; }}",
        f"  td.blank {{ width: {CARD_W}mm; height: {card_h}mm; border: 0.3mm dashed #aaa; }}",
        "</style></head><body>",
    ]

    idx = 0
    for _page in range(pages):
        lines.append("<table>")
        for _row in range(rows_per_page):
            lines.append("  <tr>")
            for _col in range(2):
                if idx < total:
                    lines.append(
                        f'    <td class="card"><img src="{card_paths[idx]}"></td>'
                    )
                else:
                    lines.append('    <td class="blank"></td>')
                idx += 1
            lines.append("  </tr>")
        lines.append("</table>")

    lines.append("</body></html>")
    return "\n".join(lines)


def main():
    args = parse_args()
    png_paths = validate_pngs(args.pngs)
    greyscale = not args.color

    print(f"  {len(png_paths)} portraits, {'color' if args.color else 'greyscale'}")

    portrait_h, card_h, rows_per_page = compute_layout(png_paths[0])
    print(f"  card: {CARD_W}x{card_h:.1f}mm, {rows_per_page} rows/page, portrait: {PORTRAIT_W}x{portrait_h:.1f}mm")

    # Pre-compute pixel dimensions
    card_w_px = mm_to_px(CARD_W)
    card_h_px = mm_to_px(card_h)
    portrait_w_px = mm_to_px(PORTRAIT_W)
    line_spacing_px = mm_to_px(LINE_SPACING)

    with tempfile.TemporaryDirectory() as tmp_dir:
        tmp = Path(tmp_dir)
        card_paths = []
        for i, src in enumerate(png_paths):
            card_img = make_card_image(src, greyscale, card_w_px, card_h_px,
                                       portrait_w_px, line_spacing_px)
            out = tmp / f"card-{i:03d}.png"
            card_img.save(out, format="PNG", dpi=(DPI, DPI))
            card_paths.append(out)

        html = build_html(card_paths, card_h, rows_per_page)
        cards_per_page = 2 * rows_per_page
        total_pages = math.ceil(len(card_paths) / cards_per_page)

        import weasyprint
        weasyprint.HTML(string=html, base_url=tmp_dir).write_pdf(args.output)

    print(f"  {args.output}: {total_pages} page(s), {Path(args.output).stat().st_size} bytes")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Generate portrait-cards.pdf from portraits.json.

Reads a JSON array of {"file": "path/to/image.png"} entries,
converts images to greyscale, lays them out as cuttable cards
on A4 pages (3 columns x 4 rows), and generates a PDF via weasyprint.

Usage: python3 build-portrait-cards.py [portraits.json]
"""
import json
import subprocess
import sys
import tempfile
from pathlib import Path
from PIL import Image

COLS = 2
ROWS = 4
CARDS_PER_PAGE = COLS * ROWS

# Card dimensions (mm)
CARD_W = 100
CARD_H = 71
IMG_W = 48
NOTES_W = 48  # remaining width after image + separator

def convert_greyscale(src: Path, dst: Path):
    """Convert image to greyscale and save."""
    img = Image.open(src).convert("L")
    img.save(dst)

def build_html(cards: list[dict], grey_dir: Path) -> str:
    """Build HTML string for portrait card pages."""
    lines = [
        "<!DOCTYPE html>",
        "<html><head><meta charset='utf-8'><title>Portrait Cards</title>",
        "<style>",
        f"  @page {{ size: A4 portrait; margin: 5mm; }}",
        f"  body {{ margin: 0; padding: 0; font-size: 0; }}",
        f"  table {{ width: 200mm; border-collapse: collapse; page-break-after: always; }}",
        f"  table:last-child {{ page-break-after: auto; }}",
        f"  td.card {{ width: {CARD_W}mm; height: {CARD_H}mm; border: 0.3mm dashed #aaa; vertical-align: top; padding: 0; overflow: hidden; }}",
        f"  td.card .inner {{ display: flex; height: 100%; }}",
        f"  td.card .portrait {{ width: {IMG_W}mm; height: {CARD_H}mm; flex-shrink: 0; }}",
        f"  td.card img {{ display: block; width: {IMG_W}mm; height: {CARD_H}mm; object-fit: contain; object-position: top center; }}",
        f"  td.card .text {{ flex: 1; border-left: 0.2mm solid #ccc; padding: 1mm 2mm; }}",
        f"  td.card .name {{ height: 7mm; border-bottom: 0.2mm solid #ccc; }}",
        f"  td.blank {{ width: {CARD_W}mm; height: {CARD_H}mm; border: 0.3mm dashed #aaa; vertical-align: top; padding: 0; }}",
        "</style></head><body>",
    ]

    # Pad to full pages
    total = len(cards)
    pages = (total + CARDS_PER_PAGE - 1) // CARDS_PER_PAGE
    if pages < 1:
        pages = 1

    idx = 0
    for page in range(pages):
        lines.append("<table>")
        for row in range(ROWS):
            lines.append("  <tr>")
            for col in range(COLS):
                if idx < total:
                    img_path = grey_dir / Path(cards[idx]["file"]).name
                    lines.append(
                        f'    <td class="card"><div class="inner">'
                        f'<div class="portrait"><img src="{img_path}"></div>'
                        f'<div class="text"><div class="name"></div></div>'
                        f'</div></td>'
                    )
                else:
                    lines.append('    <td class="blank"></td>')
                idx += 1
            lines.append("  </tr>")
        lines.append("</table>")

    lines.append("</body></html>")
    return "\n".join(lines)

def main():
    json_path = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("portraits.json")
    if not json_path.exists():
        print(f"Error: {json_path} not found", file=sys.stderr)
        sys.exit(1)

    cards = json.loads(json_path.read_text())
    print(f"  {len(cards)} portraits → {(len(cards) + CARDS_PER_PAGE - 1) // CARDS_PER_PAGE} pages")

    # Convert to greyscale in temp dir
    grey_dir = Path("portraits-grey")
    grey_dir.mkdir(exist_ok=True)
    for card in cards:
        src = Path(card["file"])
        dst = grey_dir / src.name
        convert_greyscale(src, dst)
    print(f"  Greyscale conversion done")

    # Build HTML and generate PDF
    html = build_html(cards, grey_dir)
    html_path = Path("portrait-cards.html")
    html_path.write_text(html)

    subprocess.run(
        ["weasyprint", str(html_path), "portrait-cards.pdf"],
        check=True,
        capture_output=True,
    )
    print(f"  portrait-cards.pdf generated")

if __name__ == "__main__":
    main()

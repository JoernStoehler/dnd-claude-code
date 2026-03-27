#!/usr/bin/env python3
"""Extract SotS PDF to markdown with page markers.

Usage: python3 scripts/extract-rulebook.py swords-of-the-serpentine.pdf resources/sots/rulebook-raw.md
"""

import subprocess
import sys
import re


def extract(pdf_path: str, output_path: str):
    # Extract with -layout to preserve table formatting
    result = subprocess.run(
        ["pdftotext", "-layout", pdf_path, "-"],
        capture_output=True, text=True
    )
    if result.returncode != 0:
        print(f"pdftotext failed: {result.stderr}", file=sys.stderr)
        sys.exit(1)

    raw = result.stdout
    # pdftotext uses form feed (\f) as page separator
    pages = raw.split("\f")

    lines = []
    for i, page_text in enumerate(pages):
        page_num = i + 1  # 1-indexed
        # Add page marker
        lines.append(f"<!-- page {page_num:03d} -->")
        lines.append("")

        # Strip trailing page number from footer if present
        # Page numbers appear as a lone number at the end of the page
        page_lines = page_text.rstrip().split("\n")

        # Remove trailing blank lines, then check if last line is just a page number
        while page_lines and page_lines[-1].strip() == "":
            page_lines.pop()

        if page_lines:
            last_line = page_lines[-1].strip()
            # Match standalone page numbers (possibly with surrounding whitespace)
            if re.match(r"^\d{1,3}$", last_line):
                footer_num = int(last_line)
                # Sanity check: the footer number should be close to the page index
                # (some PDFs have front matter with roman numerals or offset numbering)
                if abs(footer_num - page_num) < 30:
                    page_lines.pop()

        for line in page_lines:
            # Convert trailing whitespace but preserve leading (layout matters)
            lines.append(line.rstrip())

        lines.append("")  # blank line after each page

    with open(output_path, "w") as f:
        f.write("\n".join(lines))

    print(f"Extracted {len(pages)} pages to {output_path}")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print(f"Usage: {sys.argv[0]} <pdf> <output>", file=sys.stderr)
        sys.exit(1)
    extract(sys.argv[1], sys.argv[2])

#!/usr/bin/env python3
"""Split rulebook-raw.md into chunks at page boundaries for parallel cleanup.

Usage: python3 scripts/split-rulebook-chunks.py resources/sots/rulebook-raw.md resources/sots/rulebook-chunks/ 40
"""

import os
import re
import sys


def split_chunks(input_path: str, output_dir: str, pages_per_chunk: int):
    with open(input_path) as f:
        content = f.read()

    # Split on page markers
    page_pattern = re.compile(r"(<!-- page \d{3} -->)")
    parts = page_pattern.split(content)

    # Reconstruct pages: parts[0] is before first marker (empty or preamble),
    # then alternating marker, content pairs
    pages = []
    current_page = ""
    for part in parts:
        if page_pattern.match(part):
            if current_page:
                pages.append(current_page)
            current_page = part
        else:
            current_page += part
    if current_page:
        pages.append(current_page)

    os.makedirs(output_dir, exist_ok=True)

    # Split into chunks
    chunk_num = 0
    for i in range(0, len(pages), pages_per_chunk):
        chunk_pages = pages[i : i + pages_per_chunk]
        chunk_num += 1

        # Determine page range for filename
        first_match = page_pattern.search(chunk_pages[0])
        last_match = page_pattern.search(chunk_pages[-1])
        first_page = first_match.group() if first_match else f"p{i}"
        last_page = last_match.group() if last_match else f"p{i + len(chunk_pages)}"

        # Extract page numbers for filename
        fp = re.search(r"\d{3}", first_page)
        lp = re.search(r"\d{3}", last_page)
        fname = f"chunk-{fp.group()}-{lp.group()}.md" if fp and lp else f"chunk-{chunk_num:02d}.md"

        chunk_path = os.path.join(output_dir, fname)
        with open(chunk_path, "w") as f:
            f.write("\n".join(chunk_pages))

        print(f"  {fname}: {len(chunk_pages)} pages")

    print(f"\nWrote {chunk_num} chunks to {output_dir}")


if __name__ == "__main__":
    if len(sys.argv) != 4:
        print(f"Usage: {sys.argv[0]} <input> <output_dir> <pages_per_chunk>", file=sys.stderr)
        sys.exit(1)
    split_chunks(sys.argv[1], sys.argv[2], int(sys.argv[3]))
